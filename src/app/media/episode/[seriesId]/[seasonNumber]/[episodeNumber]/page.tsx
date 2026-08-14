import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import { getBookmark } from "@/lib/bookmarks";
import { getServerSession } from "@/lib/session";
import { getEpisodeDetail, getSeriesBrief } from "@/lib/tmdb";
import { getTvmazeEpisodeSchedule } from "@/lib/tvmaze";
import { EpisodeDetailView } from "@/components/media/episode-detail-view";

export const dynamic = "force-dynamic";

function toPositiveInt(value: string): number | null {
	const parsed = Number(value);
	return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export default async function EpisodeDetailPage({
	params,
}: {
	params: Promise<{ seriesId: string; seasonNumber: string; episodeNumber: string }>;
}) {
	const { seriesId: seriesIdRaw, seasonNumber: seasonRaw, episodeNumber: episodeRaw } = await params;
	const seriesId = toPositiveInt(seriesIdRaw);
	const seasonNumber = toPositiveInt(seasonRaw);
	const episodeNumber = toPositiveInt(episodeRaw);
	if (seriesId === null || seasonNumber === null || episodeNumber === null) {
		notFound();
	}

	const [series, episode] = await Promise.all([
		getSeriesBrief(seriesId),
		getEpisodeDetail(seriesId, seasonNumber, episodeNumber),
	]);
	if (!series || !episode) {
		notFound();
	}

	const tvmaze = await getTvmazeEpisodeSchedule(series.name, series.year, seasonNumber, episodeNumber);

	const session = await getServerSession();
	const isSignedIn = Boolean(session);
	const bookmark = session
		? await getBookmark(getCloudflareContext().env.DB, session.user.id, "episode", episode.id)
		: null;

	return (
		<EpisodeDetailView
			series={series}
			episode={episode}
			tvmaze={tvmaze}
			bookmark={bookmark}
			isSignedIn={isSignedIn}
		/>
	);
}
