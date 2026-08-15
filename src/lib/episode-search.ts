import { parseSeasonEpisodeNotation } from "@/lib/episode-notation";
import { getEpisodeDetail, getSeasonEpisodes, searchTmdb, type EpisodeSummary, type MediaSummary } from "@/lib/tmdb";
import { searchTvmazeEpisodes } from "@/lib/tvmaze";

const MAX_EPISODE_RESULTS = 12;

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

export interface EpisodeSearchOutcome {
	results: EpisodeSearchResult[];
	unavailable: boolean;
}

function toYear(date: string | null): number | null {
	if (!date) return null;
	const year = Number.parseInt(date.slice(0, 4), 10);
	return Number.isNaN(year) ? null : year;
}

function findSeriesMatch(candidates: MediaSummary[], showName: string, year: number | null): MediaSummary | null {
	if (candidates.length === 0) return null;
	const normalizedName = showName.trim().toLowerCase();
	const exact = candidates.find((candidate) => candidate.name.trim().toLowerCase() === normalizedName);
	if (exact) return exact;
	if (year !== null) {
		const byYear = candidates.find((candidate) => candidate.year === year);
		if (byYear) return byYear;
	}
	return candidates[0];
}

function toEpisodeSearchResult(series: MediaSummary, episode: EpisodeSummary): EpisodeSearchResult {
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

export async function searchEpisodes(query: string): Promise<EpisodeSearchOutcome> {
	const tvmaze = await searchTvmazeEpisodes(query);
	if (!tvmaze.ok) {
		return { results: [], unavailable: true };
	}
	if (tvmaze.hits.length === 0) {
		return { results: [], unavailable: false };
	}

	const hits = tvmaze.hits.slice(0, MAX_EPISODE_RESULTS);

	const shows = new Map<string, { name: string; year: number | null }>();
	for (const hit of hits) {
		const key = hit.showName.trim().toLowerCase();
		if (!shows.has(key)) {
			shows.set(key, { name: hit.showName, year: toYear(hit.premiered) });
		}
	}

	const seriesByShow = new Map<string, MediaSummary | null>();
	await Promise.all(
		[...shows.values()].map(async (show) => {
			const candidates = await searchTmdb(show.name, "series");
			seriesByShow.set(
				show.name.trim().toLowerCase(),
				findSeriesMatch(candidates, show.name, show.year),
			);
		}),
	);

	const seenEpisodes = new Set<number>();
	const results = (
		await Promise.all(
			hits.map(async (hit): Promise<EpisodeSearchResult | null> => {
				const series = seriesByShow.get(hit.showName.trim().toLowerCase());
				if (!series) return null;
				const episode = await getEpisodeDetail(series.id, hit.episode.season, hit.episode.number);
				if (!episode || seenEpisodes.has(episode.id)) return null;
				seenEpisodes.add(episode.id);
				return toEpisodeSearchResult(series, episode);
			}),
		)
	).filter((result): result is EpisodeSearchResult => result !== null);

	return { results, unavailable: false };
}

export async function searchEpisodeByNotation(query: string): Promise<EpisodeSearchResult | null> {
	const notation = parseSeasonEpisodeNotation(query);
	if (!notation) return null;

	const candidates = await searchTmdb(notation.seriesName, "series");
	const series = findSeriesMatch(candidates, notation.seriesName, null);
	if (!series) return null;

	const season = await getSeasonEpisodes(series.id, notation.season);
	const episode = season?.episodes.find((item) => item.episodeNumber === notation.episode);
	if (!episode) return null;

	return toEpisodeSearchResult(series, episode);
}
