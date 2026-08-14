"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
	addBookmark,
	isBookmarkStatus,
	isHalfStepRating,
	removeBookmark,
	setBookmarkNote,
	setBookmarkRating,
	setBookmarkStatus,
	toggleBookmarkFavorite,
	type BookmarkState,
} from "@/lib/bookmarks";
import { getServerSession } from "@/lib/session";
import type { MediaType } from "@/lib/tmdb";

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

export async function setRating(mediaType: MediaType, mediaId: number, rating: number): Promise<BookmarkState> {
	const session = await requireSession();
	if (!isHalfStepRating(rating)) {
		throw new Error(`Invalid rating: ${rating}`);
	}
	const db = getCloudflareContext().env.DB;
	const bookmark = await setBookmarkRating(db, session.user.id, mediaType, mediaId, rating);
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
