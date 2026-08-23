"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
	addBookmark,
	addEpisodeBookmark,
	isBookmarkStatus,
	isHalfStepRating,
	removeBookmark,
	setBookmarkFavorite,
	setBookmarkNote,
	setBookmarkRating,
	setBookmarkStatus,
	toggleBookmarkFavorite,
	type BookmarkState,
	type EpisodeBookmarkKey,
} from "@/lib/bookmarks";
import { getServerSession } from "@/lib/session";
import type { MediaType } from "@/lib/tmdb";

export type { EpisodeBookmarkKey } from "@/lib/bookmarks";

function isEpisodeBookmarkKey(key: EpisodeBookmarkKey): boolean {
	return (
		Number.isSafeInteger(key.episodeId) &&
		Number.isSafeInteger(key.seriesId) &&
		Number.isSafeInteger(key.seasonNumber) &&
		Number.isSafeInteger(key.episodeNumber) &&
		key.episodeId > 0 &&
		key.seriesId > 0 &&
		key.seasonNumber >= 0 &&
		key.episodeNumber > 0
	);
}

function normalizeRating(rating: number | null): number | null {
	if (rating === null) {
		return null;
	}
	if (!Number.isFinite(rating)) {
		throw new Error(`Invalid rating: ${rating}`);
	}
	const halfStep = Math.round(rating * 2) / 2;
	if (!isHalfStepRating(halfStep)) {
		throw new Error(`Invalid rating: ${rating}`);
	}
	return halfStep;
}

function revalidateEpisodePaths(key: EpisodeBookmarkKey) {
	revalidatePath(`/media/episode/${key.seriesId}/${key.seasonNumber}/${key.episodeNumber}`);
	revalidatePath(`/media/series/${key.seriesId}`);
	revalidatePath("/dashboard/library");
}

export async function addEpisodeToLibrary(key: EpisodeBookmarkKey): Promise<BookmarkState> {
	const session = await requireSession();
	if (!isEpisodeBookmarkKey(key)) {
		throw new Error("Invalid episode key");
	}
	const db = getCloudflareContext().env.DB;
	const bookmark = await addEpisodeBookmark(db, session.user.id, key);
	revalidateEpisodePaths(key);
	return bookmark;
}

export async function setEpisodeStatus(key: EpisodeBookmarkKey, status: string): Promise<BookmarkState> {
	const session = await requireSession();
	if (!isEpisodeBookmarkKey(key)) {
		throw new Error("Invalid episode key");
	}
	if (!isBookmarkStatus(status)) {
		throw new Error(`Invalid bookmark status: ${status}`);
	}
	const db = getCloudflareContext().env.DB;
	const bookmark = await setBookmarkStatus(db, session.user.id, "episode", key.episodeId, status);
	if (!bookmark) {
		throw new Error("Episode bookmark not found");
	}
	revalidateEpisodePaths(key);
	return bookmark;
}

export async function toggleEpisodeFavorite(key: EpisodeBookmarkKey): Promise<BookmarkState> {
	const session = await requireSession();
	if (!isEpisodeBookmarkKey(key)) {
		throw new Error("Invalid episode key");
	}
	const db = getCloudflareContext().env.DB;
	const bookmark = await toggleBookmarkFavorite(db, session.user.id, "episode", key.episodeId);
	if (!bookmark) {
		throw new Error("Episode bookmark not found");
	}
	revalidateEpisodePaths(key);
	return bookmark;
}

export async function setEpisodeRating(
	key: EpisodeBookmarkKey,
	rating: number | null,
): Promise<BookmarkState> {
	const session = await requireSession();
	if (!isEpisodeBookmarkKey(key)) {
		throw new Error("Invalid episode key");
	}
	const db = getCloudflareContext().env.DB;
	const bookmark = await setBookmarkRating(
		db,
		session.user.id,
		"episode",
		key.episodeId,
		normalizeRating(rating),
	);
	if (!bookmark) {
		throw new Error("Episode bookmark not found");
	}
	revalidateEpisodePaths(key);
	return bookmark;
}

export async function setEpisodeNote(key: EpisodeBookmarkKey, note: string): Promise<BookmarkState> {
	const session = await requireSession();
	if (!isEpisodeBookmarkKey(key)) {
		throw new Error("Invalid episode key");
	}
	const db = getCloudflareContext().env.DB;
	const bookmark = await setBookmarkNote(db, session.user.id, "episode", key.episodeId, note);
	if (!bookmark) {
		throw new Error("Episode bookmark not found");
	}
	revalidateEpisodePaths(key);
	return bookmark;
}

export async function removeEpisodeFromLibrary(key: EpisodeBookmarkKey): Promise<void> {
	const session = await requireSession();
	if (!isEpisodeBookmarkKey(key)) {
		throw new Error("Invalid episode key");
	}
	const db = getCloudflareContext().env.DB;
	await removeBookmark(db, session.user.id, "episode", key.episodeId);
	revalidateEpisodePaths(key);
}

async function requireSession() {
	const session = await getServerSession();
	if (!session) {
		redirect("/login");
	}
	return session;
}

export async function addToLibrary(mediaType: MediaType, mediaId: number): Promise<BookmarkState> {
	const session = await requireSession();
	const db = getCloudflareContext().env.DB;
	const bookmark = await addBookmark(db, session.user.id, mediaType, mediaId);
	revalidatePath(`/media/${mediaType}/${mediaId}`);
	revalidatePath("/dashboard/library");
	return bookmark;
}

export async function setStatus(
	mediaType: MediaType,
	mediaId: number,
	status: string,
): Promise<BookmarkState> {
	const session = await requireSession();
	if (!isBookmarkStatus(status)) {
		throw new Error(`Invalid bookmark status: ${status}`);
	}
	const db = getCloudflareContext().env.DB;
	const bookmark = await setBookmarkStatus(db, session.user.id, mediaType, mediaId, status);
	if (!bookmark) {
		throw new Error("Bookmark not found");
	}
	revalidatePath(`/media/${mediaType}/${mediaId}`);
	revalidatePath("/dashboard/library");
	return bookmark;
}

export async function toggleFavorite(mediaType: MediaType, mediaId: number): Promise<BookmarkState> {
	const session = await requireSession();
	const db = getCloudflareContext().env.DB;
	const bookmark = await toggleBookmarkFavorite(db, session.user.id, mediaType, mediaId);
	if (!bookmark) {
		throw new Error("Bookmark not found");
	}
	revalidatePath(`/media/${mediaType}/${mediaId}`);
	revalidatePath("/dashboard/library");
	return bookmark;
}

export async function removeFromLibrary(mediaType: MediaType, mediaId: number): Promise<void> {
	const session = await requireSession();
	const db = getCloudflareContext().env.DB;
	await removeBookmark(db, session.user.id, mediaType, mediaId);
	revalidatePath(`/media/${mediaType}/${mediaId}`);
	revalidatePath("/dashboard/library");
}

export async function setRating(
	mediaType: MediaType,
	mediaId: number,
	rating: number | null,
): Promise<BookmarkState> {
	const session = await requireSession();
	const db = getCloudflareContext().env.DB;
	const bookmark = await setBookmarkRating(db, session.user.id, mediaType, mediaId, normalizeRating(rating));
	if (!bookmark) {
		throw new Error("Bookmark not found");
	}
	revalidatePath(`/media/${mediaType}/${mediaId}`);
	return bookmark;
}

export async function saveNote(mediaType: MediaType, mediaId: number, note: string): Promise<BookmarkState> {
	const session = await requireSession();
	const db = getCloudflareContext().env.DB;
	const bookmark = await setBookmarkNote(db, session.user.id, mediaType, mediaId, note);
	if (!bookmark) {
		throw new Error("Bookmark not found");
	}
	revalidatePath(`/media/${mediaType}/${mediaId}`);
	return bookmark;
}

export interface BulkLibraryItem {
	id: string;
	kind: "title" | "episode";
	mediaType?: MediaType;
	mediaId?: number;
	key?: EpisodeBookmarkKey;
}

export interface BulkActionResult {
	id: string;
	bookmark: BookmarkState | null;
}

function isValidBulkItem(item: BulkLibraryItem): boolean {
	if (typeof item?.id !== "string" || item.id.length === 0) {
		return false;
	}
	if (item.kind === "title") {
		return (
			(item.mediaType === "movie" || item.mediaType === "series") &&
			typeof item.mediaId === "number" &&
			Number.isSafeInteger(item.mediaId) &&
			item.mediaId > 0
		);
	}
	if (item.kind === "episode") {
		return Boolean(item.key) && isEpisodeBookmarkKey(item.key as EpisodeBookmarkKey);
	}
	return false;
}

export async function bulkSetStatus(
	items: BulkLibraryItem[],
	status: string,
): Promise<BulkActionResult[]> {
	const session = await requireSession();
	if (!isBookmarkStatus(status)) {
		throw new Error(`Invalid bookmark status: ${status}`);
	}
	const db = getCloudflareContext().env.DB;
	const results = await Promise.all(
		items.filter(isValidBulkItem).map(async (item) => ({
			id: item.id,
			bookmark:
				item.kind === "title"
					? await setBookmarkStatus(db, session.user.id, item.mediaType!, item.mediaId!, status)
					: await setBookmarkStatus(db, session.user.id, "episode", item.key!.episodeId, status),
		})),
	);
	revalidatePath("/dashboard/library");
	return results;
}

export async function bulkSetFavorite(
	items: BulkLibraryItem[],
	favorite: boolean,
): Promise<BulkActionResult[]> {
	const session = await requireSession();
	const db = getCloudflareContext().env.DB;
	const results = await Promise.all(
		items.filter(isValidBulkItem).map(async (item) => ({
			id: item.id,
			bookmark:
				item.kind === "title"
					? await setBookmarkFavorite(db, session.user.id, item.mediaType!, item.mediaId!, favorite)
					: await setBookmarkFavorite(db, session.user.id, "episode", item.key!.episodeId, favorite),
		})),
	);
	revalidatePath("/dashboard/library");
	return results;
}

export async function bulkRemoveFromLibrary(items: BulkLibraryItem[]): Promise<string[]> {
	const session = await requireSession();
	const db = getCloudflareContext().env.DB;
	const valid = items.filter(isValidBulkItem);
	await Promise.all(
		valid.map((item) =>
			item.kind === "title"
				? removeBookmark(db, session.user.id, item.mediaType!, item.mediaId!)
				: removeBookmark(db, session.user.id, "episode", item.key!.episodeId),
		),
	);
	revalidatePath("/dashboard/library");
	return valid.map((item) => item.id);
}
