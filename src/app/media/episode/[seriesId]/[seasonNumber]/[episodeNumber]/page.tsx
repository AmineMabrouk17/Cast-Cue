import { notFound } from "next/navigation";
import { getEpisodeDetail, getSeriesBrief } from "@/lib/tmdb";
import { EpisodeDetailView } from "@/components/media/episode-detail-view";

export const dynamic = "force-dynamic";

export default async function EpisodePage({
	params,
}: {
	params: Promise<{ seriesId: string; seasonNumber: string; episodeNumber: string }>;
}) {
	const { seriesId, seasonNumber, episodeNumber } = await params;

	const seriesIdValue = Number(seriesId);
	const seasonValue = Number(seasonNumber);
	const episodeValue = Number(episodeNumber);
	if (
		!Number.isSafeInteger(seriesIdValue) ||
		!Number.isSafeInteger(seasonValue) ||
		!Number.isSafeInteger(episodeValue) ||
		seriesIdValue <= 0 ||
		seasonValue <= 0 ||
		episodeValue <= 0
	) {
		notFound();
	}

	const [series, episode] = await Promise.all([
		getSeriesBrief(seriesIdValue),
		getEpisodeDetail(seriesIdValue, seasonValue, episodeValue),
	]);
	if (!series || !episode) {
		notFound();
	}

	return <EpisodeDetailView series={series} episode={episode} />;
}
