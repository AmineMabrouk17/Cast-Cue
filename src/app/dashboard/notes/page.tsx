import { Suspense } from "react";
import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";
import { listUserBookmarksWithNotes, type UserBookmark } from "@/lib/bookmarks";
import { getServerSession } from "@/lib/session";
import { getEpisodeDetail, getMediaSummary } from "@/lib/tmdb";
import { MediaGridSkeleton } from "@/components/media/media-grid-skeleton";

export const dynamic = "force-dynamic";

interface NotePreview {
	href: string;
	title: string;
}

async function resolveItem(reference: UserBookmark): Promise<NotePreview | null> {
	if (reference.mediaType === "episode") {
		if (reference.seriesId === null || reference.seasonNumber === null || reference.episodeNumber === null) {
			return null;
		}
		const episode = await getEpisodeDetail(reference.seriesId, reference.seasonNumber, reference.episodeNumber);
		if (!episode) return null;
		return {
			href: `/media/episode/${reference.seriesId}/${reference.seasonNumber}/${reference.episodeNumber}`,
			title: `S${reference.seasonNumber}E${reference.episodeNumber} · ${episode.name}`,
		};
	}

	const media = await getMediaSummary(reference.mediaType, reference.mediaId);
	if (!media) return null;
	return {
		href: `/media/${media.type}/${media.id}`,
		title: media.name,
	};
}

async function NotesContent() {
	const session = await getServerSession();
	if (!session) redirect("/login");

	const references = await listUserBookmarksWithNotes(getCloudflareContext().env.DB, session.user.id);

	const items = (
		await Promise.all(references.map((reference) => resolveItem(reference)))
	).filter((item): item is NotePreview => item !== null);

	return (
		<ul className="flex flex-col gap-3">
			{items.map((item) => (
				<li key={item.href}>
					<Link href={item.href} className="text-sm font-medium text-foreground hover:underline">
						{item.title}
					</Link>
				</li>
			))}
		</ul>
	);
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
