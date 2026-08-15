const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export type MediaType = "movie" | "series";

export const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
	movie: "Movie",
	series: "Series",
};

const TMDB_MEDIA_TYPE: Record<MediaType, string> = {
	movie: "movie",
	series: "tv",
};

export interface MediaSummary {
	id: number;
	type: MediaType;
	name: string;
	overview: string;
	posterPath: string | null;
	backdropPath: string | null;
	voteAverage: number;
	year: number | null;
}

interface TmdbMediaItem {
	id: number;
	title?: string;
	name?: string;
	overview: string;
	poster_path: string | null;
	backdrop_path: string | null;
	vote_average: number;
	release_date?: string;
	first_air_date?: string;
}

interface TmdbResultsResponse {
	results: TmdbMediaItem[];
}

function toYear(date: string | undefined): number | null {
	if (!date) return null;
	const year = Number.parseInt(date.slice(0, 4), 10);
	return Number.isNaN(year) ? null : year;
}

export function tmdbPosterUrl(posterPath: string | null, size = "w342"): string | null {
	if (!posterPath) return null;
	return `${TMDB_IMAGE_BASE_URL}/${size}${posterPath}`;
}

export function tmdbBackdropUrl(backdropPath: string | null, size = "w1280"): string | null {
	if (!backdropPath) return null;
	return `${TMDB_IMAGE_BASE_URL}/${size}${backdropPath}`;
}

export function tmdbProfileUrl(profilePath: string | null, size = "w185"): string | null {
	if (!profilePath) return null;
	return `${TMDB_IMAGE_BASE_URL}/${size}${profilePath}`;
}

export interface CastMember {
	name: string;
	character: string;
	profilePath: string | null;
}

export interface MediaDetail {
	id: number;
	type: MediaType;
	name: string;
	overview: string;
	posterPath: string | null;
	backdropPath: string | null;
	voteAverage: number;
	year: number | null;
	genres: string[];
	trailerKey: string | null;
	cast: CastMember[];
}

interface TmdbVideo {
	key: string;
	site: string;
	type: string;
	official: boolean;
}

interface TmdbDetailResponse {
	id: number;
	title?: string;
	name?: string;
	overview: string;
	poster_path: string | null;
	backdrop_path: string | null;
	vote_average: number;
	release_date?: string;
	first_air_date?: string;
	genres: { id: number; name: string }[];
	videos: { results: TmdbVideo[] };
	credits: { cast: { name: string; character: string; profile_path: string | null }[] };
}

function pickTrailer(videos: TmdbVideo[]): TmdbVideo | undefined {
	return (
		videos.find((video) => video.site === "YouTube" && video.type === "Trailer" && video.official) ??
		videos.find((video) => video.site === "YouTube" && video.type === "Trailer")
	);
}

export async function getMediaDetail(type: MediaType, id: number): Promise<MediaDetail | null> {
	const apiKey = process.env.TMDB_API_KEY;
	if (!apiKey) {
		console.error("TMDB_API_KEY is not set; skipping TMDB request.");
		return null;
	}
	try {
		const url = new URL(`${TMDB_API_BASE_URL}/${TMDB_MEDIA_TYPE[type]}/${id}`);
		url.searchParams.set("api_key", apiKey);
		url.searchParams.set("language", "en-US");
		url.searchParams.set("append_to_response", "videos,credits");
		const response = await fetch(url, { cache: "no-store" });
		if (response.status === 404) {
			return null;
		}
		if (!response.ok) {
			console.error(`TMDB ${TMDB_MEDIA_TYPE[type]}/${id} failed with status ${response.status}.`);
			return null;
		}
		const data = (await response.json()) as TmdbDetailResponse;
		return {
			id: data.id,
			type,
			name: data.title ?? data.name ?? "Untitled",
			overview: data.overview,
			posterPath: data.poster_path,
			backdropPath: data.backdrop_path,
			voteAverage: data.vote_average,
			year: toYear(type === "movie" ? data.release_date : data.first_air_date),
			genres: data.genres.map((genre) => genre.name),
			trailerKey: pickTrailer(data.videos.results)?.key ?? null,
			cast: data.credits.cast.slice(0, 10).map((member) => ({
				name: member.name,
				character: member.character,
				profilePath: member.profile_path,
			})),
		};
	} catch (error) {
		console.error(`TMDB ${TMDB_MEDIA_TYPE[type]}/${id} request failed:`, error);
		return null;
	}
}

export interface SeasonSummary {
	id: number;
	name: string;
	seasonNumber: number;
	episodeCount: number;
	airDate: string | null;
	posterPath: string | null;
	overview: string;
}

export interface EpisodeSummary {
	id: number;
	seriesId: number;
	name: string;
	overview: string;
	seasonNumber: number;
	episodeNumber: number;
	airDate: string | null;
	stillPath: string | null;
	voteAverage: number;
	runtime: number | null;
}

export interface SeasonEpisodes {
	season: SeasonSummary;
	episodes: EpisodeSummary[];
}

export interface SeriesBrief {
	id: number;
	name: string;
	posterPath: string | null;
	backdropPath: string | null;
	year: number | null;
}

interface TmdbSeason {
	id: number;
	name: string;
	season_number: number;
	episode_count: number;
	air_date: string | null;
	poster_path: string | null;
	overview: string;
}

interface TmdbEpisode {
	id: number;
	name: string;
	overview: string;
	season_number: number;
	episode_number: number;
	air_date: string | null;
	still_path: string | null;
	vote_average: number;
	runtime: number | null;
}

interface TmdbSeriesResponse {
	id: number;
	name?: string;
	first_air_date?: string;
	poster_path: string | null;
	backdrop_path: string | null;
	seasons?: TmdbSeason[];
}

interface TmdbSeasonResponse extends TmdbSeason {
	episodes: TmdbEpisode[];
}

export function tmdbStillUrl(stillPath: string | null, size = "w300"): string | null {
	if (!stillPath) return null;
	return `${TMDB_IMAGE_BASE_URL}/${size}${stillPath}`;
}

function toSeasonSummary(season: TmdbSeason): SeasonSummary {
	return {
		id: season.id,
		name: season.name,
		seasonNumber: season.season_number,
		episodeCount: season.episode_count,
		airDate: season.air_date,
		posterPath: season.poster_path,
		overview: season.overview,
	};
}

function toEpisodeSummary(episode: TmdbEpisode, seriesId: number): EpisodeSummary {
	return {
		id: episode.id,
		seriesId,
		name: episode.name,
		overview: episode.overview,
		seasonNumber: episode.season_number,
		episodeNumber: episode.episode_number,
		airDate: episode.air_date,
		stillPath: episode.still_path,
		voteAverage: episode.vote_average,
		runtime: episode.runtime,
	};
}

async function fetchTmdbSeries(seriesId: number): Promise<TmdbSeriesResponse | null> {
	const apiKey = process.env.TMDB_API_KEY;
	if (!apiKey) {
		console.error("TMDB_API_KEY is not set; skipping TMDB request.");
		return null;
	}
	try {
		const url = new URL(`${TMDB_API_BASE_URL}/tv/${seriesId}`);
		url.searchParams.set("api_key", apiKey);
		url.searchParams.set("language", "en-US");
		const response = await fetch(url, { cache: "no-store" });
		if (response.status === 404) {
			return null;
		}
		if (!response.ok) {
			console.error(`TMDB tv/${seriesId} failed with status ${response.status}.`);
			return null;
		}
		return (await response.json()) as TmdbSeriesResponse;
	} catch (error) {
		console.error(`TMDB tv/${seriesId} request failed:`, error);
		return null;
	}
}

export async function getSeriesBrief(seriesId: number): Promise<SeriesBrief | null> {
	const data = await fetchTmdbSeries(seriesId);
	if (!data) {
		return null;
	}
	return {
		id: data.id,
		name: data.name ?? "Untitled",
		posterPath: data.poster_path,
		backdropPath: data.backdrop_path,
		year: toYear(data.first_air_date),
	};
}

export async function getSeriesSeasons(seriesId: number): Promise<SeasonSummary[]> {
	const data = await fetchTmdbSeries(seriesId);
	return (data?.seasons ?? []).map(toSeasonSummary);
}

export async function getSeasonEpisodes(seriesId: number, seasonNumber: number): Promise<SeasonEpisodes | null> {
	const apiKey = process.env.TMDB_API_KEY;
	if (!apiKey) {
		console.error("TMDB_API_KEY is not set; skipping TMDB request.");
		return null;
	}
	try {
		const url = new URL(`${TMDB_API_BASE_URL}/tv/${seriesId}/season/${seasonNumber}`);
		url.searchParams.set("api_key", apiKey);
		url.searchParams.set("language", "en-US");
		const response = await fetch(url, { cache: "no-store" });
		if (response.status === 404) {
			return null;
		}
		if (!response.ok) {
			console.error(`TMDB tv/${seriesId}/season/${seasonNumber} failed with status ${response.status}.`);
			return null;
		}
		const data = (await response.json()) as TmdbSeasonResponse;
		return {
			season: toSeasonSummary(data),
			episodes: data.episodes.map((episode) => toEpisodeSummary(episode, seriesId)),
		};
	} catch (error) {
		console.error(`TMDB tv/${seriesId}/season/${seasonNumber} request failed:`, error);
		return null;
	}
}

export async function getEpisodeDetail(
	seriesId: number,
	seasonNumber: number,
	episodeNumber: number,
): Promise<EpisodeSummary | null> {
	const apiKey = process.env.TMDB_API_KEY;
	if (!apiKey) {
		console.error("TMDB_API_KEY is not set; skipping TMDB request.");
		return null;
	}
	try {
		const url = new URL(
			`${TMDB_API_BASE_URL}/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}`,
		);
		url.searchParams.set("api_key", apiKey);
		url.searchParams.set("language", "en-US");
		const response = await fetch(url, { cache: "no-store" });
		if (response.status === 404) {
			return null;
		}
		if (!response.ok) {
			console.error(
				`TMDB tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber} failed with status ${response.status}.`,
			);
			return null;
		}
		return toEpisodeSummary((await response.json()) as TmdbEpisode, seriesId);
	} catch (error) {
		console.error(
			`TMDB tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber} request failed:`,
			error,
		);
		return null;
	}
}

export async function getMediaSummary(type: MediaType, id: number): Promise<MediaSummary | null> {
	const apiKey = process.env.TMDB_API_KEY;
	if (!apiKey) {
		console.error("TMDB_API_KEY is not set; skipping TMDB request.");
		return null;
	}
	try {
		const url = new URL(`${TMDB_API_BASE_URL}/${TMDB_MEDIA_TYPE[type]}/${id}`);
		url.searchParams.set("api_key", apiKey);
		url.searchParams.set("language", "en-US");
		const response = await fetch(url, { cache: "no-store" });
		if (response.status === 404) {
			return null;
		}
		if (!response.ok) {
			console.error(`TMDB ${TMDB_MEDIA_TYPE[type]}/${id} failed with status ${response.status}.`);
			return null;
		}
		const data = (await response.json()) as TmdbMediaItem;
		return toMediaSummary(data, type);
	} catch (error) {
		console.error(`TMDB ${TMDB_MEDIA_TYPE[type]}/${id} request failed:`, error);
		return null;
	}
}

function toMediaSummary(item: TmdbMediaItem, type: MediaType): MediaSummary {
	return {
		id: item.id,
		type,
		name: item.title ?? item.name ?? "Untitled",
		overview: item.overview,
		posterPath: item.poster_path,
		backdropPath: item.backdrop_path,
		voteAverage: item.vote_average,
		year: toYear(type === "movie" ? item.release_date : item.first_air_date),
	};
}

async function fetchTmdbResults(
	path: string,
	params: Record<string, string>,
	type: MediaType,
): Promise<MediaSummary[]> {
	const apiKey = process.env.TMDB_API_KEY;
	if (!apiKey) {
		console.error("TMDB_API_KEY is not set; skipping TMDB request.");
		return [];
	}
	try {
		const url = new URL(`${TMDB_API_BASE_URL}${path}`);
		url.searchParams.set("api_key", apiKey);
		url.searchParams.set("language", "en-US");
		for (const [key, value] of Object.entries(params)) {
			url.searchParams.set(key, value);
		}
		const response = await fetch(url, { cache: "no-store" });
		if (!response.ok) {
			console.error(`TMDB ${path} failed with status ${response.status}.`);
			return [];
		}
		const data = (await response.json()) as TmdbResultsResponse;
		return data.results.map((item) => toMediaSummary(item, type));
	} catch (error) {
		console.error(`TMDB ${path} request failed:`, error);
		return [];
	}
}

export async function getTrending(type: MediaType): Promise<MediaSummary[]> {
	return fetchTmdbResults(`/trending/${TMDB_MEDIA_TYPE[type]}/week`, {}, type);
}

export async function searchTmdb(query: string, type: MediaType): Promise<MediaSummary[]> {
	const trimmed = query.trim();
	if (!trimmed) return [];
	return fetchTmdbResults(`/search/${TMDB_MEDIA_TYPE[type]}`, { query: trimmed }, type);
}
