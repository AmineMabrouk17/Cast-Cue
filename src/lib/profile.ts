import type { BookmarkState } from "@/lib/bookmarks";

export interface PublicProfileUser {
	id: string;
	name: string;
	image: string | null;
	slug: string;
}

interface UserRow {
	id: string;
	name: string;
	image: string | null;
	slug: string | null;
	isPublic: number;
}

export interface PublicBookmark {
	mediaType: "movie" | "series" | "episode";
	mediaId: number;
	seriesId: number | null;
	seasonNumber: number | null;
	episodeNumber: number | null;
	status: BookmarkState["status"];
	rating: number | null;
	favorite: boolean;
}

function toKebabCase(value: string): string {
	return value
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 40);
}

async function getUserRowById(db: D1Database, userId: string): Promise<UserRow | null> {
	return db
		.prepare("SELECT id, name, image, slug, isPublic FROM user WHERE id = ?")
		.bind(userId)
		.first<UserRow>();
}

export async function getProfileVisibility(
	db: D1Database,
	userId: string,
): Promise<{ slug: string | null; isPublic: boolean }> {
	const row = await getUserRowById(db, userId);
	if (!row) throw new Error("User not found");
	return { slug: row.slug, isPublic: row.isPublic === 1 };
}

async function slugIsAvailable(db: D1Database, slug: string): Promise<boolean> {
	const existing = await db.prepare("SELECT id FROM user WHERE slug = ?").bind(slug).first<{ id: string }>();
	return existing === null;
}

async function generateUniqueSlug(db: D1Database, userId: string, displayName: string, email: string): Promise<string> {
	const source = toKebabCase(displayName) || toKebabCase(email.split("@")[0] ?? "") || "cinephile";
	let candidate = source;
	for (let attempt = 2; attempt < 100; attempt++) {
		if (await slugIsAvailable(db, candidate)) {
			return candidate;
		}
		candidate = `${source}-${attempt}`;
	}
	throw new Error("Could not generate a free profile slug");
}

export async function setProfileVisibility(
	db: D1Database,
	userId: string,
	isPublic: boolean,
): Promise<{ slug: string; isPublic: boolean }> {
	const user = await getUserRowById(db, userId);
	if (!user) throw new Error("User not found");

	let slug = user.slug;
	if (isPublic && !slug) {
		const emailRow = await db.prepare("SELECT email FROM user WHERE id = ?").bind(userId).first<{ email: string }>();
		slug = await generateUniqueSlug(db, userId, user.name, emailRow?.email ?? "");
		await db.prepare("UPDATE user SET slug = ?, updatedAt = ? WHERE id = ?").bind(slug, new Date().toISOString(), userId).run();
	}

	await db.prepare("UPDATE user SET isPublic = ? WHERE id = ?").bind(isPublic ? 1 : 0, userId).run();
	if (!slug) throw new Error("Missing profile slug");
	return { slug, isPublic };
}

/**
 * Bookmarks visible on a public profile: notes are never selected, and
 * unrated watchlist entries stay private.
 */
export async function listPublicBookmarks(db: D1Database, userId: string): Promise<PublicBookmark[]> {
	const { results } = await db
		.prepare(
			`SELECT mediaType, mediaId, seriesId, seasonNumber, episodeNumber, status, rating, favorite
			 FROM bookmarks
			 WHERE userId = ? AND NOT (status = 'watchlist' AND rating IS NULL)
			 ORDER BY updatedAt DESC`,
		)
		.bind(userId)
		.all<{
			mediaType: "movie" | "series" | "episode";
			mediaId: number;
			seriesId: number | null;
			seasonNumber: number | null;
			episodeNumber: number | null;
			status: BookmarkState["status"];
			rating: number | null;
			favorite: boolean;
		}>();
	return results ?? [];
}

export async function getUserBySlug(db: D1Database, slug: string): Promise<PublicProfileUser | null> {
	const row = await db
		.prepare("SELECT id, name, image, slug FROM user WHERE slug = ? AND isPublic = 1")
		.bind(slug)
		.first<UserRow>();
	if (!row || !row.slug) return null;
	return { id: row.id, name: row.name, image: row.image, slug: row.slug };
}
