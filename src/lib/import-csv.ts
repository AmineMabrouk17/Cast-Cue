import type { MediaType } from "@/lib/tmdb";

export interface ImportCandidate {
	rowIndex: number;
	mediaType: MediaType;
	title: string;
	year: number | null;
	rating: number | null;
	watched: boolean;
	seasonNumber: number | null;
	episodeNumber: number | null;
}

export interface ParsedImportCsv {
	rows: ImportCandidate[];
	skipped: { rowIndex: number; reason: string }[];
}

function splitCsvLine(line: string): string[] {
	const values: string[] = [];
	let current = "";
	let inQuotes = false;
	for (let i = 0; i < line.length; i++) {
		const char = line[i];
		if (inQuotes) {
			if (char === '"') {
				if (line[i + 1] === '"') {
					current += '"';
					i++;
				} else {
					inQuotes = false;
				}
			} else {
				current += char;
			}
		} else if (char === '"') {
			inQuotes = true;
		} else if (char === ",") {
			values.push(current);
			current = "";
		} else {
			current += char;
		}
	}
	values.push(current);
	return values;
}

function normalizeHeader(header: string): string {
	return header.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

interface ColumnMap {
	title?: number;
	year?: number;
	rating?: number;
	date?: number;
	tmdbId?: number;
	season?: number;
	episode?: number;
	type?: number;
}

const TITLE_HEADERS = new Set(["name", "title", "movie", "show", "item name", "movie name", "show name", "episode title"]);
const YEAR_HEADERS = new Set(["year", "movie year", "show year", "release year", "watched year"]);
const RATING_HEADERS = new Set(["rating", "my rating", "user rating", "your rating"]);
const DATE_HEADERS = new Set(["date", "watched date", "watched at", "last watched at", "last watched date", "date watched"]);
const TMDB_ID_HEADERS = new Set(["tmdb id", "movie tmdb id", "show tmdb id", "tmdbid"]);
const SEASON_HEADERS = new Set(["season", "season number", "show season number"]);
const EPISODE_HEADERS = new Set(["episode", "episode number", "show episode number"]);
const TYPE_HEADERS = new Set(["type", "media type"]);

function mapColumns(headers: string[]): ColumnMap {
	const map: ColumnMap = {};
	headers.forEach((header, index) => {
		const normalized = normalizeHeader(header);
		if (!normalized) return;
		if (TITLE_HEADERS.has(normalized) && map.title === undefined) map.title = index;
		else if (YEAR_HEADERS.has(normalized) && map.year === undefined) map.year = index;
		else if (RATING_HEADERS.has(normalized) && map.rating === undefined) map.rating = index;
		else if (DATE_HEADERS.has(normalized) && map.date === undefined) map.date = index;
		else if (TMDB_ID_HEADERS.has(normalized) && map.tmdbId === undefined) map.tmdbId = index;
		else if (SEASON_HEADERS.has(normalized) && map.season === undefined) map.season = index;
		else if (EPISODE_HEADERS.has(normalized) && map.episode === undefined) map.episode = index;
		else if (TYPE_HEADERS.has(normalized) && map.type === undefined) map.type = index;
	});
	return map;
}

function parseYear(value: string | undefined): number | null {
	if (!value) return null;
	const year = Number.parseInt(value.trim(), 10);
	if (Number.isNaN(year) || year < 1870 || year > 2100) return null;
	return year;
}

export function snapToHalfStep(value: number): number | null {
	if (!Number.isFinite(value)) return null;
	const snapped = Math.round(value * 2) / 2;
	if (snapped < 0 || snapped > 5) return null;
	return snapped;
}

function parseRating(value: string | undefined): number | null {
	if (!value) return null;
	const parsed = Number.parseFloat(value.trim().replace(",", "."));
	if (Number.isNaN(parsed)) return null;
	if (parsed > 0 && parsed <= 10 && normalizeHeader(value).includes("10")) return snapToHalfStep(parsed / 2);
	return snapToHalfStep(parsed);
}

function parseOptionalInt(value: string | undefined): number | null {
	if (!value) return null;
	const parsed = Number.parseInt(value.trim(), 10);
	return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Parses a library CSV. Handles Letterboxd `watched.csv`
 * (`Date,Name,Year,Letterboxd URI,Rating`) and Trakt history/exports
 * (`Movie`/`Show` + year columns, optional season/episode rows).
 * A row counts as an episode when it carries both a season and an
 * episode number and its title column names a show.
 */
export function parseImportCsv(text: string): ParsedImportCsv {
	const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
	if (lines.length < 2) {
		return { rows: [], skipped: [{ rowIndex: 0, reason: "File is empty or has no data rows" }] };
	}

	const headers = splitCsvLine(lines[0]);
	const columns = mapColumns(headers);
	if (columns.title === undefined) {
		return {
			rows: [],
			skipped: [{ rowIndex: 0, reason: 'Could not find a title column (expected "Name", "Movie", "Show", or "Title")' }],
		};
	}

	const rows: ImportCandidate[] = [];
	const skipped: { rowIndex: number; reason: string }[] = [];

	for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
		const values = splitCsvLine(lines[lineIndex]);
		const title = (values[columns.title] ?? "").trim();
		if (!title) {
			skipped.push({ rowIndex: lineIndex, reason: "Missing title" });
			continue;
		}

		const seasonNumber = columns.season !== undefined ? parseOptionalInt(values[columns.season]) : null;
		const episodeNumber = columns.episode !== undefined ? parseOptionalInt(values[columns.episode]) : null;
		const explicitType = columns.type !== undefined ? normalizeHeader(values[columns.type] ?? "") : "";
		const isEpisode =
			explicitType.includes("episode") ||
			(seasonNumber !== null && episodeNumber !== null && seasonNumber >= 0 && episodeNumber >= 1);

		const mediaType: MediaType = isEpisode ? "series" : explicitType.includes("series") || explicitType.includes("show") ? "series" : "movie";
		const rating = columns.rating !== undefined ? parseRating(values[columns.rating]) : null;
		const hasWatchedDate =
			columns.date !== undefined &&
			Boolean((values[columns.date] ?? "").trim());

		rows.push({
			rowIndex: lineIndex,
			mediaType,
			title,
			year: columns.year !== undefined ? parseYear(values[columns.year]) : null,
			rating,
			watched: isEpisode || hasWatchedDate || rating !== null,
			seasonNumber: isEpisode ? seasonNumber : null,
			episodeNumber: isEpisode ? episodeNumber : null,
		});
	}

	return { rows, skipped };
}
