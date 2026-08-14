import type { MediaType } from "@/lib/tmdb";

export const BOOKMARK_STATUSES = ["watchlist", "watching", "completed", "dropped"] as const;
export type BookmarkStatus = (typeof BOOKMARK_STATUSES)[number];

export const BOOKMARK_STATUS_LABELS: Record<BookmarkStatus, string> = {
	watchlist: "Watchlist",
	watching: "Watching",
	completed: "Completed",
	dropped: "Dropped",
};

export const MAX_RATING = 5;
export const RATING_STEP = 0.5;

export function isHalfStepRating(value: number): boolean {
	return (
		Number.isFinite(value) &&
		value >= 0 &&
		value <= MAX_RATING &&
		Number.isInteger(value / RATING_STEP)
	);
}

export interface BookmarkState {
	status: BookmarkStatus;
	favorite: boolean;
	rating: number | null;
	note: string | null;
}

interface BookmarkRow {
	status: BookmarkStatus;
	favorite: number;
	rating: number | null;
	note: string | null;
}

function toState(row: BookmarkRow): BookmarkState {
	return {
		status: row.status,
		favorite: row.favorite === 1,
		rating: row.rating,
		note: row.note,
	};
}

export async function getBookmark(
	db: D1Database,
	userId: string,
	mediaType: MediaType,
	mediaId: number,
): Promise<BookmarkState | null> {
	const row = await db
		.prepare("SELECT status, favorite, rating, note FROM bookmarks WHERE userId = ? AND mediaType = ? AND mediaId = ?")
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

export async function setBookmarkRating(
	db: D1Database,
	userId: string,
	mediaType: MediaType,
	mediaId: number,
	rating: number,
): Promise<BookmarkState | null> {
	if (!isHalfStepRating(rating)) {
		throw new Error(`Invalid rating: ${rating}`);
	}
	const now = new Date().toISOString();
	await db
		.prepare("UPDATE bookmarks SET rating = ?, updatedAt = ? WHERE userId = ? AND mediaType = ? AND mediaId = ?")
		.bind(rating, now, userId, mediaType, mediaId)
		.run();
	return getBookmark(db, userId, mediaType, mediaId);
}

export async function setBookmarkNote(
	db: D1Database,
	userId: string,
	mediaType: MediaType,
	mediaId: number,
	note: string,
): Promise<BookmarkState | null> {
	const now = new Date().toISOString();
	await db
		.prepare("UPDATE bookmarks SET note = ?, updatedAt = ? WHERE userId = ? AND mediaType = ? AND mediaId = ?")
		.bind(note, now, userId, mediaType, mediaId)
		.run();
	return getBookmark(db, userId, mediaType, mediaId);
}
