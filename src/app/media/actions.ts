"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
	BOOKMARK_STATUSES,
	addBookmark,
	setBookmarkStatus,
	toggleBookmarkFavorite,
	type BookmarkState,
	type BookmarkStatus,
} from "@/lib/bookmarks";
import { getServerSession } from "@/lib/session";
import type { MediaType } from "@/lib/tmdb";

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
