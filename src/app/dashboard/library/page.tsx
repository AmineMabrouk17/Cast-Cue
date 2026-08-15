import { Suspense } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";
import { listUserBookmarks, type BookmarkState, type UserBookmark } from "@/lib/bookmarks";
import { getServerSession } from "@/lib/session";
import { getEpisodeDetail, getMediaSummary, getSeriesBrief, tmdbPosterUrl } from "@/lib/tmdb";
import { LibraryView, type LibraryItem } from "@/components/library/library-view";
import { MediaGridSkeleton } from "@/components/media/media-grid-skeleton";

export const dynamic = "force-dynamic";

function toBookmarkState(reference: UserBookmark): BookmarkState {
	return {
		status: reference.status,
		favorite: reference.favorite,
		rating: reference.rating,
		note: reference.note,
	};
}

async function resolveItem(reference: UserBookmark): Promise<LibraryItem | null> {
	const mediaType = reference.mediaType;
	if (mediaType === "episode") {
		if (reference.seriesId === null || reference.seasonNumber === null || reference.episodeNumber === null) {
			return null;
		}
		const [series, episode] = await Promise.all([
			getSeriesBrief(reference.seriesId),
			getEpisodeDetail(reference.seriesId, reference.seasonNumber, reference.episodeNumber),
		]);
		if (!series || !episode) return null;
		return {
			kind: "episode",
			key: {
				episodeId: reference.mediaId,
				seriesId: reference.seriesId,
				seasonNumber: reference.seasonNumber,
				episodeNumber: reference.episodeNumber,
			},
			href: `/media/episode/${reference.seriesId}/${reference.seasonNumber}/${reference.episodeNumber}`,
			title: `S${reference.seasonNumber} E${reference.episodeNumber} · ${episode.name}`,
			subtitle: series.name,
			imageUrl: tmdbPosterUrl(series.posterPath),
			bookmark: toBookmarkState(reference),
		};
	}

	const media = await getMediaSummary(mediaType, reference.mediaId);
	if (!media) return null;
	return {
		kind: "title",
		media,
		bookmark: toBookmarkState(reference),
	};
}

async function LibraryContent() {
	const session = await getServerSession();
	if (!session) redirect("/login");

	const references = await listUserBookmarks(getCloudflareContext().env.DB, session.user.id);

	const items = (
		await Promise.all(references.map((reference) => resolveItem(reference)))
	).filter((item): item is LibraryItem => item !== null);

	return <LibraryView initialItems={items} />;
}

export default function LibraryPage() {
	return (
		<main className="flex flex-1 flex-col gap-6 p-8">
			<header className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold text-foreground">Your library</h1>
				<p className="text-muted">
					All your bookmarked movies, series, and episodes in one place.
				</p>
			</header>
			<Suspense fallback={<MediaGridSkeleton />}>
				<LibraryContent />
			</Suspense>
		</main>
	);
}
