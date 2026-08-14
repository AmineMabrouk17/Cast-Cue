import type { MediaType } from "@/lib/tmdb";

export const BOOKMARK_STATUSES = ["watchlist", "watching", "completed", "dropped"] as const;
export type BookmarkStatus = (typeof BOOKMARK_STATUSES)[number];

export function isBookmarkStatus(value: string): value is BookmarkStatus {
	return (BOOKMARK_STATUSES as readonly string[]).includes(value);
}

export const BOOKMARK_STATUS_LABELS: Record<BookmarkStatus, string> = {
	watchlist: "Watchlist",
	watching: "Watching",
	completed: "Completed",
	dropped: "Dropped",
};

export interface BookmarkState {
	status: BookmarkStatus;
	favorite: boolean;
}

interface BookmarkRow {
	status: BookmarkStatus;
	favorite: number;
}

interface BookmarkReferenceRow extends BookmarkRow {
	mediaType: MediaType;
	mediaId: number;
}

function toState(row: BookmarkRow): BookmarkState {
	return { status: row.status, favorite: row.favorite === 1 };
}

export interface BookmarkReference extends BookmarkState {
	mediaType: MediaType;
	mediaId: number;
}

export async function listBookmarks(db: D1Database, userId: string): Promise<BookmarkReference[]> {
	const rows = await db
		.prepare(
			"SELECT mediaType, mediaId, status, favorite FROM bookmarks WHERE userId = ? ORDER BY updatedAt DESC",
		)
		.bind(userId)
		.all<BookmarkReferenceRow>();
	return rows.results.map((row) => ({
		mediaType: row.mediaType,
		mediaId: row.mediaId,
		...toState(row),
	}));
}

export async function removeBookmark(
	db: D1Database,
	userId: string,
	mediaType: MediaType,
	mediaId: number,
): Promise<void> {
	await db
		.prepare("DELETE FROM bookmarks WHERE userId = ? AND mediaType = ? AND mediaId = ?")
		.bind(userId, mediaType, mediaId)
		.run();
}

export async function getBookmark(
	db: D1Database,
	userId: string,
	mediaType: MediaType,
	mediaId: number,
): Promise<BookmarkState | null> {
	const row = await db
		.prepare("SELECT status, favorite FROM bookmarks WHERE userId = ? AND mediaType = ? AND mediaId = ?")
		.bind(userId, mediaType, mediaId)
		.first<BookmarkRow>();
	return row ? toState(row) : null;
}

export async function addBookmark(
	db: D1Database,
	userId: string,
	mediaType: MediaType,
	mediaId: number,
): Promise<BookmarkState> {
	const now = new Date().toISOString();
	await db
		.prepare(
			`INSERT INTO bookmarks (id, userId, mediaType, mediaId, status, favorite, createdAt, updatedAt)
			 VALUES (?, ?, ?, ?, 'watchlist', 0, ?, ?)
			 ON CONFLICT (userId, mediaType, mediaId) DO NOTHING`,
		)
		.bind(crypto.randomUUID(), userId, mediaType, mediaId, now, now)
		.run();
	const bookmark = await getBookmark(db, userId, mediaType, mediaId);
	if (!bookmark) {
		throw new Error("Failed to create bookmark");
	}
	return bookmark;
}

export async function setBookmarkStatus(
	db: D1Database,
	userId: string,
	mediaType: MediaType,
	mediaId: number,
	status: BookmarkStatus,
): Promise<BookmarkState | null> {
	const now = new Date().toISOString();
	await db
		.prepare("UPDATE bookmarks SET status = ?, updatedAt = ? WHERE userId = ? AND mediaType = ? AND mediaId = ?")
		.bind(status, now, userId, mediaType, mediaId)
		.run();
	return getBookmark(db, userId, mediaType, mediaId);
}

export async function toggleBookmarkFavorite(
	db: D1Database,
	userId: string,
	mediaType: MediaType,
	mediaId: number,
): Promise<BookmarkState | null> {
	const now = new Date().toISOString();
	await db
		.prepare("UPDATE bookmarks SET favorite = 1 - favorite, updatedAt = ? WHERE userId = ? AND mediaType = ? AND mediaId = ?")
		.bind(now, userId, mediaType, mediaId)
		.run();
	return getBookmark(db, userId, mediaType, mediaId);
}
