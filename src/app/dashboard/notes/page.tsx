import { Suspense } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";
import { listUserBookmarksWithNotes, type UserBookmark } from "@/lib/bookmarks";
import { getServerSession } from "@/lib/session";
import { MEDIA_TYPE_LABELS, getEpisodeDetail, getMediaSummary, getSeriesBrief, tmdbPosterUrl } from "@/lib/tmdb";
import { NotesView, type NoteItem } from "@/components/notes/notes-view";
import { MediaGridSkeleton } from "@/components/media/media-grid-skeleton";

export const dynamic = "force-dynamic";

async function resolveItem(reference: UserBookmark): Promise<NoteItem | null> {
	const note = reference.note?.trim();
	if (!note) return null;

	if (reference.mediaType === "episode") {
		if (reference.seriesId === null || reference.seasonNumber === null || reference.episodeNumber === null) {
			return null;
		}
		const [series, episode] = await Promise.all([
			getSeriesBrief(reference.seriesId),
			getEpisodeDetail(reference.seriesId, reference.seasonNumber, reference.episodeNumber),
		]);
		if (!series || !episode) return null;
		return {
			href: `/media/episode/${reference.seriesId}/${reference.seasonNumber}/${reference.episodeNumber}`,
			title: `S${reference.seasonNumber}E${reference.episodeNumber} · ${episode.name}`,
			subtitle: series.name,
			imageUrl: tmdbPosterUrl(series.posterPath),
			note,
		};
	}

	const media = await getMediaSummary(reference.mediaType, reference.mediaId);
	if (!media) return null;
	return {
		href: `/media/${media.type}/${media.id}`,
		title: media.name,
		subtitle: media.year ? `${media.year} · ${MEDIA_TYPE_LABELS[media.type]}` : MEDIA_TYPE_LABELS[media.type],
		imageUrl: tmdbPosterUrl(media.posterPath),
		note,
	};
}

async function NotesContent() {
	const session = await getServerSession();
	if (!session) redirect("/login");

	const references = await listUserBookmarksWithNotes(getCloudflareContext().env.DB, session.user.id);

	const items = (
		await Promise.all(references.map((reference) => resolveItem(reference)))
	).filter((item): item is NoteItem => item !== null);

	return <NotesView items={items} />;
}

export default function NotesPage() {
	return (
		<main className="flex flex-1 flex-col gap-6 p-8">
			<header className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold text-foreground">Your notes</h1>
				<p className="text-muted">
					Private notes on bookmarked movies, series, and episodes.
				</p>
			</header>
			<Suspense fallback={<MediaGridSkeleton />}>
				<NotesContent />
			</Suspense>
		</main>
	);
}
