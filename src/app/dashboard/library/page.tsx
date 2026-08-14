import { Suspense } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";
import { listBookmarks } from "@/lib/bookmarks";
import { getServerSession } from "@/lib/session";
import { getMediaSummary } from "@/lib/tmdb";
import { LibraryView, type LibraryItem } from "@/components/library/library-view";
import { MediaGridSkeleton } from "@/components/media/media-grid-skeleton";

export const dynamic = "force-dynamic";

async function LibraryContent() {
	const session = await getServerSession();
	if (!session) redirect("/login");

	const references = await listBookmarks(getCloudflareContext().env.DB, session.user.id);

	const items = (
		await Promise.all(
			references.map(async (reference): Promise<LibraryItem | null> => {
				const media = await getMediaSummary(reference.mediaType, reference.mediaId);
				if (!media) return null;
				return {
					media,
					bookmark: reference,
				};
			}),
		)
	).filter((item): item is LibraryItem => item !== null);

	return <LibraryView initialItems={items} />;
}

export default function LibraryPage() {
	return (
		<main className="flex flex-1 flex-col gap-6 p-8">
			<header className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold text-foreground">Your library</h1>
				<p className="text-muted">
					All your bookmarked movies and series in one place.
				</p>
			</header>
			<Suspense fallback={<MediaGridSkeleton />}>
				<LibraryContent />
			</Suspense>
		</main>
	);
}
