import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getEpisodeBookmarksForSeason, type BookmarkState } from "@/lib/bookmarks";
import { getSeasonEpisodes, getSeriesSeasons, type SeasonSummary } from "@/lib/tmdb";
import { getTvmazeSchedule } from "@/lib/tvmaze";
import { EpisodeList } from "./episode-list";
import { SeasonSelector } from "./season-selector";

function resolveSeason(seasons: SeasonSummary[], requested: string | undefined): SeasonSummary {
	if (requested) {
		const seasonNumber = Number(requested);
		const match = seasons.find((season) => season.seasonNumber === seasonNumber);
		if (match) {
			return match;
		}
	}
	return seasons.find((season) => season.seasonNumber >= 1) ?? seasons[0];
}

export async function EpisodeGuide({
	seriesId,
	seriesName,
	seriesYear,
	requestedSeason,
	userId,
}: {
	seriesId: number;
	seriesName: string;
	seriesYear: number | null;
	requestedSeason: string | undefined;
	userId: string | null;
}) {
	const db = getCloudflareContext().env.DB;
	const seasons = (await getSeriesSeasons(seriesId)).filter((season) => season.episodeCount > 0);
	if (seasons.length === 0) {
		return null;
	}

	const selectedSeason = resolveSeason(seasons, requestedSeason);
	const seasonData = await getSeasonEpisodes(seriesId, selectedSeason.seasonNumber);
	const episodes = seasonData?.episodes ?? [];

	const tvmaze = await getTvmazeSchedule(seriesName, seriesYear);
	const bookmarks = userId
		? await getEpisodeBookmarksForSeason(db, userId, seriesId, selectedSeason.seasonNumber)
		: new Map<number, BookmarkState>();

	return (
		<section className="flex flex-col gap-6 p-8 pt-0">
			<header className="flex flex-col gap-1">
				<h2 className="text-xl font-semibold text-foreground">Episodes</h2>
				<p className="text-sm text-muted">
					Season guide with TVmaze airdates where available. Click an episode for details.
				</p>
			</header>
			<SeasonSelector seasons={seasons} selectedSeason={selectedSeason.seasonNumber} />
			{episodes.length > 0 ? (
				<EpisodeList episodes={episodes} tvmaze={tvmaze.episodes} bookmarks={bookmarks} />
			) : (
				<p className="text-sm text-muted">No episodes found for this season.</p>
			)}
		</section>
	);
}
