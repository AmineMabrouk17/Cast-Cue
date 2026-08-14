"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
	BOOKMARK_STATUSES,
	addBookmark,
	addEpisodeBookmark,
	setBookmarkNote,
	setBookmarkRating,
	setBookmarkStatus,
	toggleBookmarkFavorite,
	type BookmarkState,
	type BookmarkStatus,
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
	if (halfStep < 0 || halfStep > 5) {
		throw new Error(`Invalid rating: ${rating}`);
	}
	return halfStep;
}

function revalidateEpisodePaths(key: EpisodeBookmarkKey) {
	revalidatePath(`/media/episode/${key.seriesId}/${key.seasonNumber}/${key.episodeNumber}`);
	revalidatePath(`/media/series/${key.seriesId}`);
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
	const bookmark = await setBookmarkRating(db, session.user.id, "episode", key.episodeId, normalizeRating(rating));
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

function isBookmarkStatus(value: string): value is BookmarkStatus {
	return (BOOKMARK_STATUSES as readonly string[]).includes(value);
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
	return bookmark;
}
