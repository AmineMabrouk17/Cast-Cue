import { parseSeasonEpisodeNotation } from "@/lib/episode-notation";
import { getSeasonEpisodes, searchTmdb, type MediaSummary } from "@/lib/tmdb";

export interface EpisodeSearchResult {
	episodeId: number;
	seriesId: number;
	seriesName: string;
	seriesYear: number | null;
	seriesPosterPath: string | null;
	name: string;
	overview: string;
	seasonNumber: number;
	episodeNumber: number;
	airDate: string | null;
	stillPath: string | null;
	voteAverage: number;
	runtime: number | null;
}

function findSeriesMatch(candidates: MediaSummary[], seriesName: string): MediaSummary | null {
	if (candidates.length === 0) return null;
	const normalized = seriesName.trim().toLowerCase();
	return (
		candidates.find((candidate) => candidate.name.trim().toLowerCase() === normalized) ??
		candidates[0]
	);
}

export async function searchEpisodeByNotation(query: string): Promise<EpisodeSearchResult | null> {
	const notation = parseSeasonEpisodeNotation(query);
	if (!notation) return null;

	const candidates = await searchTmdb(notation.seriesName, "series");
	const series = findSeriesMatch(candidates, notation.seriesName);
	if (!series) return null;

	const episodes = await getSeasonEpisodes(series.id, notation.season);
	const episode = episodes?.find((item) => item.episodeNumber === notation.episode);
	if (!episode) return null;

	return {
		episodeId: episode.id,
		seriesId: series.id,
		seriesName: series.name,
		seriesYear: series.year,
		seriesPosterPath: series.posterPath,
		name: episode.name,
		overview: episode.overview,
		seasonNumber: episode.seasonNumber,
		episodeNumber: episode.episodeNumber,
		airDate: episode.airDate,
		stillPath: episode.stillPath,
		voteAverage: episode.voteAverage,
		runtime: episode.runtime,
	};
}
