"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
	addBookmark,
	addEpisodeBookmark,
	getBookmark,
	setBookmarkRating,
	setBookmarkStatus,
	type BookmarkState,
} from "@/lib/bookmarks";
import { parseImportCsv, type ImportCandidate } from "@/lib/import-csv";
import { getServerSession } from "@/lib/session";
import { getSeasonEpisodes, searchTmdb, type MediaType } from "@/lib/tmdb";

export interface ImportMatch {
	rowIndex: number;
	title: string;
	year: number | null;
	rating: number | null;
	mediaType: ImportMediaType;
	mediaId: number;
	resolvedName: string;
	resolvedYear: number | null;
	posterPath: string | null;
	watched: boolean;
	seriesId?: number;
	seasonNumber?: number;
	episodeNumber?: number;
}

export interface ImportUnmatched {
	rowIndex: number;
	title: string;
	reason: string;
}

export interface ImportPreview {
	matched: ImportMatch[];
	unmatched: ImportUnmatched[];
	skippedCount: number;
	totalRows: number;
}

export interface ImportCommitResult {
	imported: number;
	alreadyInLibrary: number;
	failed: number;
}

const MAX_CSV_BYTES = 512 * 1024;
const MAX_ROWS = 2000;

type ImportMediaType = MediaType | "episode";

async function requireSession() {
	const session = await getServerSession();
	if (!session) {
		redirect("/login");
	}
	return session;
}

function normalizeTitle(title: string): string {
	return title.trim().toLowerCase().replace(/\s+/g, " ");
}

async function resolveTitle(
	title: string,
	year: number | null,
	mediaType: MediaType,
): Promise<{ id: number; name: string; year: number | null; posterPath: string | null } | { reason: string }> {
	const results = await searchTmdb(title, mediaType);
	const byName = results.filter((result) => normalizeTitle(result.name) === normalizeTitle(title));
	if (byName.length === 0) {
		return { reason: `No ${mediaType} named "${title}" found on TMDB` };
	}
	if (byName.length === 1 || year === null) {
		if (byName.length > 1 && !results.some((r) => r.year !== null && Math.abs(r.year - (year ?? r.year)) <= 1)) {
			if (byName.length === 1) {
				const only = byName[0];
				return { id: only.id, name: only.name, year: only.year, posterPath: only.posterPath };
			}
			return { reason: `"${title}" is ambiguous (${byName.length} matches) and the row has no year to disambiguate` };
		}
	}
	let candidates = byName;
	if (year !== null) {
		const yearMatches = byName.filter((result) => result.year !== null && Math.abs(result.year - year) <= 1);
		if (yearMatches.length === 0) {
			return { reason: `"${title}" found but released ${results[0]?.year ?? "?"}, not ${year}` };
		}
		candidates = yearMatches;
	}
	const best = candidates[0];
	return { id: best.id, name: best.name, year: best.year, posterPath: best.posterPath };
}

async function resolveCandidate(candidate: ImportCandidate): Promise<ImportMatch | ImportUnmatched> {
	const unmatched = (reason: string): ImportUnmatched => ({
		rowIndex: candidate.rowIndex,
		title: candidate.title,
		reason,
	});

	if (candidate.seasonNumber === null || candidate.episodeNumber === null) {
		const resolved = await resolveTitle(candidate.title, candidate.year, candidate.mediaType);
		if ("reason" in resolved) return unmatched(resolved.reason);
		return {
			rowIndex: candidate.rowIndex,
			title: candidate.title,
			year: candidate.year,
			rating: candidate.rating,
			mediaType: candidate.mediaType,
			mediaId: resolved.id,
			resolvedName: resolved.name,
			resolvedYear: resolved.year,
			posterPath: resolved.posterPath,
			watched: candidate.watched,
		};
	}

	const series = await resolveTitle(candidate.title, candidate.year, "series");
	if ("reason" in series) return unmatched(series.reason);
	const season = await getSeasonEpisodes(series.id, candidate.seasonNumber);
	if (!season) {
		return unmatched(`Season ${candidate.seasonNumber} of "${series.name}" not found`);
	}
	const episode = season.episodes.find((entry) => entry.episodeNumber === candidate.episodeNumber);
	if (!episode) {
		return unmatched(`Episode ${candidate.episodeNumber} of season ${candidate.seasonNumber} of "${series.name}" not found`);
	}
	return {
		rowIndex: candidate.rowIndex,
		title: `${candidate.title} S${candidate.seasonNumber}E${candidate.episodeNumber}`,
		year: candidate.year,
		rating: candidate.rating,
		mediaType: "episode",
		mediaId: episode.id,
		resolvedName: series.name,
		resolvedYear: series.year,
		posterPath: series.posterPath,
		watched: true,
		seriesId: series.id,
		seasonNumber: episode.seasonNumber,
		episodeNumber: episode.episodeNumber,
	};
}

async function resolveAll(rows: ImportCandidate[]): Promise<{ matched: ImportMatch[]; unmatched: ImportUnmatched[] }> {
	const matched: ImportMatch[] = [];
	const unmatched: ImportUnmatched[] = [];
	for (const row of rows) {
		const outcome = await resolveCandidate(row);
		if ("reason" in outcome) {
			unmatched.push(outcome);
		} else {
			matched.push(outcome);
		}
	}
	return { matched, unmatched };
}

export async function previewImportCsv(csvText: string): Promise<ImportPreview> {
	await requireSession();
	if (new Blob([csvText]).size > MAX_CSV_BYTES) {
		throw new Error("File is too large (limit 512 KB)");
	}
	const parsed = parseImportCsv(csvText);
	if (parsed.rows.length > MAX_ROWS) {
		throw new Error(`Too many rows (limit ${MAX_ROWS})`);
	}
	const seen = new Set<string>();
	const deduped = parsed.rows.filter((row) => {
		const key = `${row.mediaType}:${normalizeTitle(row.title)}:${row.seasonNumber}:${row.episodeNumber}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
	const { matched, unmatched } = await resolveAll(deduped);
	return {
		matched,
		unmatched,
		skippedCount: parsed.skipped.length,
		totalRows: deduped.length,
	};
}

export async function commitImportCsv(csvText: string): Promise<ImportCommitResult> {
	const session = await requireSession();
	if (new Blob([csvText]).size > MAX_CSV_BYTES) {
		throw new Error("File is too large (limit 512 KB)");
	}
	const parsed = parseImportCsv(csvText);
	if (parsed.rows.length > MAX_ROWS) {
		throw new Error(`Too many rows (limit ${MAX_ROWS})`);
	}
	const db = getCloudflareContext().env.DB;
	const { matched } = await resolveAll(parsed.rows);

	let imported = 0;
	let alreadyInLibrary = 0;
	let failed = 0;

	for (const match of matched) {
		try {
			const bookmarkMediaType = match.mediaType === "episode" ? "episode" : match.mediaType;
			const existing = await getBookmark(db, session.user.id, bookmarkMediaType, match.mediaId);
			if (existing) {
				alreadyInLibrary++;
				continue;
			}
			let bookmark: BookmarkState;
			if (match.mediaType === "episode") {
				if (
					match.seriesId === undefined ||
					match.seasonNumber === undefined ||
					match.episodeNumber === undefined
				) {
					throw new Error("Missing series context for episode");
				}
				bookmark = await addEpisodeBookmark(db, session.user.id, {
					seriesId: match.seriesId,
					seasonNumber: match.seasonNumber,
					episodeNumber: match.episodeNumber,
					episodeId: match.mediaId,
				});
				if (bookmark.status !== "completed") {
					bookmark =
						(await setBookmarkStatus(db, session.user.id, "episode", match.mediaId, "completed")) ?? bookmark;
				}
			} else {
				bookmark = await addBookmark(db, session.user.id, match.mediaType, match.mediaId);
				if (match.watched && bookmark.status !== "completed") {
					bookmark =
						(await setBookmarkStatus(db, session.user.id, match.mediaType, match.mediaId, "completed")) ??
						bookmark;
				}
			}
			if (match.rating !== null) {
				await setBookmarkRating(db, session.user.id, bookmarkMediaType, match.mediaId, match.rating);
			}
			imported++;
		} catch {
			failed++;
		}
	}

	revalidatePath("/dashboard/library");
	return { imported, alreadyInLibrary, failed };
}
