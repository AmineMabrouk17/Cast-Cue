import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";
import { listUserBookmarks } from "@/lib/bookmarks";
import { getServerSession } from "@/lib/session";
import {
	getEpisodeDetail,
	getMediaDetail,
	getSeriesBrief,
	tmdbPosterUrl,
} from "@/lib/tmdb";
import { LibraryView, type LibraryItem } from "@/components/library/library-view";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
	const session = await getServerSession();
	if (!session) {
		redirect("/login");
	}

	const bookmarks = await listUserBookmarks(getCloudflareContext().env.DB, session.user.id);

	const items = await Promise.all(
		bookmarks.map(async (bookmark): Promise<LibraryItem> => {
			if (bookmark.mediaType === "episode") {
				if (
					bookmark.seriesId === null ||
					bookmark.seasonNumber === null ||
					bookmark.episodeNumber === null
				) {
					return {
						key: bookmark.id,
						href: `/media/${bookmark.mediaType}/${bookmark.mediaId}`,
						title: "Episode",
						subtitle: "",
						imageUrl: null,
						status: bookmark.status,
						favorite: bookmark.favorite,
						rating: bookmark.rating,
					};
				}
				const [series, episode] = await Promise.all([
					getSeriesBrief(bookmark.seriesId),
					getEpisodeDetail(bookmark.seriesId, bookmark.seasonNumber, bookmark.episodeNumber),
				]);
				return {
					key: bookmark.id,
					href: `/media/episode/${bookmark.seriesId}/${bookmark.seasonNumber}/${bookmark.episodeNumber}`,
					title: series?.name ?? "Episode",
					subtitle: episode
						? `S${bookmark.seasonNumber}E${bookmark.episodeNumber} · ${episode.name}`
						: `S${bookmark.seasonNumber}E${bookmark.episodeNumber}`,
					imageUrl: series ? tmdbPosterUrl(series.posterPath, "w342") : null,
					status: bookmark.status,
					favorite: bookmark.favorite,
					rating: bookmark.rating,
				};
			}

			const media = await getMediaDetail(bookmark.mediaType, bookmark.mediaId);
			if (!media) {
				return {
					key: bookmark.id,
					href: `/media/${bookmark.mediaType}/${bookmark.mediaId}`,
					title: "Title",
					subtitle: "",
					imageUrl: null,
					status: bookmark.status,
					favorite: bookmark.favorite,
					rating: bookmark.rating,
				};
			}
			return {
				key: bookmark.id,
				href: `/media/${media.type}/${media.id}`,
				title: media.name,
				subtitle: media.year ? String(media.year) : "",
				imageUrl: tmdbPosterUrl(media.posterPath, "w342"),
				status: bookmark.status,
				favorite: bookmark.favorite,
				rating: bookmark.rating,
			};
		}),
	);

	return (
		<main className="flex flex-1 flex-col gap-6 p-8">
			<header className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold text-foreground">Library</h1>
				<p className="text-muted">Every movie, series, and episode you&apos;ve bookmarked.</p>
			</header>
			<LibraryView items={items} />
		</main>
	);
}
