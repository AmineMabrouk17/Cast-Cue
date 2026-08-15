import { parseSeasonEpisodeNotation } from "@/lib/episode-notation";
import { getEpisodeDetail, getMediaSummary, getSeasonEpisodes, searchTmdb, type MediaSummary, type EpisodeSummary } from "@/lib/tmdb";
import { searchTraktEpisodes } from "@/lib/trakt";

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

async function resolveSeriesFor(show: {
	showName: string;
	showYear: number | null;
	seriesTmdbId: number | null;
}): Promise<MediaSummary | null> {
	if (show.seriesTmdbId !== null) {
		const summary = await getMediaSummary("series", show.seriesTmdbId);
		if (summary) return summary;
	}
	const candidates = await searchTmdb(show.showName, "series");
	return findSeriesMatch(candidates, show.showName, show.showYear);
}

export async function searchEpisodes(query: string): Promise<EpisodeSearchOutcome> {
	const trakt = await searchTraktEpisodes(query.trim().toLowerCase());
	if (!trakt.ok) {
		return { results: [], unavailable: true };
	}
	if (trakt.hits.length === 0) {
		return { results: [], unavailable: false };
	}

	const hits = trakt.hits.slice(0, MAX_EPISODE_RESULTS);

	const shows = new Map<
		string,
		{ showName: string; showYear: number | null; seriesTmdbId: number | null }
	>();
	for (const hit of hits) {
		const key = hit.showName.trim().toLowerCase();
		if (!shows.has(key)) {
			shows.set(key, {
				showName: hit.showName,
				showYear: hit.showYear,
				seriesTmdbId: hit.seriesTmdbId,
			});
		}
	}

	const seriesByShow = new Map<string, MediaSummary | null>();
	await Promise.all(
		[...shows.values()].map(async (show) => {
			seriesByShow.set(show.showName.trim().toLowerCase(), await resolveSeriesFor(show));
		}),
	);

	const seenEpisodes = new Set<number>();
	const results = (
		await Promise.all(
			hits.map(async (hit): Promise<EpisodeSearchResult | null> => {
				const series = seriesByShow.get(hit.showName.trim().toLowerCase());
				if (!series) return null;
				const episode = await getEpisodeDetail(series.id, hit.season, hit.number);
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
