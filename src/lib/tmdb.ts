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

export function tmdbPosterUrl(posterPath: string | null, size = "w342"): string | null {
	if (!posterPath) return null;
	return `${TMDB_IMAGE_BASE_URL}/${size}${posterPath}`;
}

function toMediaSummary(item: TmdbMediaItem, type: MediaType): MediaSummary {
	const date = type === "movie" ? item.release_date : item.first_air_date;
	const year = date ? Number.parseInt(date.slice(0, 4), 10) : NaN;
	return {
		id: item.id,
		type,
		name: item.title ?? item.name ?? "Untitled",
		overview: item.overview,
		posterPath: item.poster_path,
		backdropPath: item.backdrop_path,
		voteAverage: item.vote_average,
		year: Number.isNaN(year) ? null : year,
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
