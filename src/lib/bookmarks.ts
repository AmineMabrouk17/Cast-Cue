import type { MediaType } from "@/lib/tmdb";

export type BookmarkMediaType = MediaType | "episode";

export const BOOKMARK_STATUSES = ["watchlist", "watching", "completed", "dropped"] as const;
export type BookmarkStatus = (typeof BOOKMARK_STATUSES)[number];

export const BOOKMARK_STATUS_LABELS: Record<BookmarkStatus, string> = {
	watchlist: "Watchlist",
	watching: "Watching",
	completed: "Completed",
	dropped: "Dropped",
};

export interface BookmarkState {
	status: BookmarkStatus;
	favorite: boolean;
	rating: number | null;
	note: string | null;
}

export interface EpisodeBookmarkKey {
	episodeId: number;
	seriesId: number;
	seasonNumber: number;
	episodeNumber: number;
}

interface BookmarkRow {
	status: BookmarkStatus;
	favorite: number;
	rating: number | null;
	note: string | null;
}

function toState(row: BookmarkRow): BookmarkState {
	return { status: row.status, favorite: row.favorite === 1, rating: row.rating, note: row.note };
}

export async function getBookmark(
	db: D1Database,
	userId: string,
	mediaType: BookmarkMediaType,
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

export async function addEpisodeBookmark(
	db: D1Database,
	userId: string,
	key: EpisodeBookmarkKey,
): Promise<BookmarkState> {
	const now = new Date().toISOString();
	await db
		.prepare(
			`INSERT INTO bookmarks (id, userId, mediaType, mediaId, seriesId, seasonNumber, episodeNumber, status, favorite, createdAt, updatedAt)
			 VALUES (?, ?, 'episode', ?, ?, ?, ?, 'watchlist', 0, ?, ?)
			 ON CONFLICT (userId, mediaType, mediaId) DO NOTHING`,
		)
		.bind(
			crypto.randomUUID(),
			userId,
			key.episodeId,
			key.seriesId,
			key.seasonNumber,
			key.episodeNumber,
			now,
			now,
		)
		.run();
	const bookmark = await getBookmark(db, userId, "episode", key.episodeId);
	if (!bookmark) {
		throw new Error("Failed to create episode bookmark");
	}
	return bookmark;
}

export async function setBookmarkStatus(
	db: D1Database,
	userId: string,
	mediaType: BookmarkMediaType,
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
	mediaType: BookmarkMediaType,
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
	mediaType: BookmarkMediaType,
	mediaId: number,
	rating: number | null,
): Promise<BookmarkState | null> {
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
	mediaType: BookmarkMediaType,
	mediaId: number,
	note: string,
): Promise<BookmarkState | null> {
	const now = new Date().toISOString();
	const trimmed = note.trim();
	await db
		.prepare("UPDATE bookmarks SET note = ?, updatedAt = ? WHERE userId = ? AND mediaType = ? AND mediaId = ?")
		.bind(trimmed ? trimmed : null, now, userId, mediaType, mediaId)
		.run();
	return getBookmark(db, userId, mediaType, mediaId);
}

export async function getEpisodeBookmarksForSeason(
	db: D1Database,
	userId: string,
	seriesId: number,
	seasonNumber: number,
): Promise<Map<number, BookmarkState>> {
	const rows = await db
		.prepare(
			`SELECT mediaId, status, favorite, rating, note FROM bookmarks
			 WHERE userId = ? AND mediaType = 'episode' AND seriesId = ? AND seasonNumber = ?`,
		)
		.bind(userId, seriesId, seasonNumber)
		.all<BookmarkRow & { mediaId: number }>();
	const bookmarks = new Map<number, BookmarkState>();
	for (const row of rows.results) {
		bookmarks.set(row.mediaId, toState(row));
	}
	return bookmarks;
}

export interface UserBookmark {
	id: string;
	mediaType: BookmarkMediaType;
	mediaId: number;
	seriesId: number | null;
	seasonNumber: number | null;
	episodeNumber: number | null;
	status: BookmarkStatus;
	favorite: boolean;
	rating: number | null;
	note: string | null;
	updatedAt: string;
}

interface UserBookmarkRow {
	id: string;
	mediaType: BookmarkMediaType;
	mediaId: number;
	seriesId: number | null;
	seasonNumber: number | null;
	episodeNumber: number | null;
	status: BookmarkStatus;
	favorite: number;
	rating: number | null;
	note: string | null;
	updatedAt: string;
}

export async function listUserBookmarks(db: D1Database, userId: string): Promise<UserBookmark[]> {
	const rows = await db
		.prepare(
			`SELECT id, mediaType, mediaId, seriesId, seasonNumber, episodeNumber, status, favorite, rating, note, updatedAt
			 FROM bookmarks WHERE userId = ? ORDER BY updatedAt DESC`,
		)
		.bind(userId)
		.all<UserBookmarkRow>();
	return rows.results.map((row) => ({
		id: row.id,
		mediaType: row.mediaType,
		mediaId: row.mediaId,
		seriesId: row.seriesId,
		seasonNumber: row.seasonNumber,
		episodeNumber: row.episodeNumber,
		status: row.status,
		favorite: row.favorite === 1,
		rating: row.rating,
		note: row.note,
		updatedAt: row.updatedAt,
	}));
}
