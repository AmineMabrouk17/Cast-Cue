const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export type MediaType = "movie" | "tv";

export interface MediaSummary {
	id: number;
	type: MediaType;
	title: string;
	overview: string;
	posterPath: string | null;
	backdropPath: string | null;
	voteAverage: number;
	year: number | null;
}

interface TmdbTrendingItem {
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

interface TmdbTrendingResponse {
	results: TmdbTrendingItem[];
}

export function tmdbPosterUrl(posterPath: string | null, size = "w342"): string | null {
	if (!posterPath) return null;
	return `${TMDB_IMAGE_BASE_URL}/${size}${posterPath}`;
}

function toMediaSummary(item: TmdbTrendingItem, type: MediaType): MediaSummary {
	const date = type === "movie" ? item.release_date : item.first_air_date;
	const year = date ? Number.parseInt(date.slice(0, 4), 10) : NaN;
	return {
		id: item.id,
		type,
		title: item.title ?? item.name ?? "Untitled",
		overview: item.overview,
		posterPath: item.poster_path,
		backdropPath: item.backdrop_path,
		voteAverage: item.vote_average,
		year: Number.isNaN(year) ? null : year,
	};
}

export async function getTrending(type: MediaType): Promise<MediaSummary[]> {
	const apiKey = process.env.TMDB_API_KEY;
	if (!apiKey) {
		console.error("TMDB_API_KEY is not set; skipping trending fetch.");
		return [];
	}
	try {
		const url = new URL(`${TMDB_API_BASE_URL}/trending/${type}/week`);
		url.searchParams.set("api_key", apiKey);
		url.searchParams.set("language", "en-US");
		const response = await fetch(url, { cache: "no-store" });
		if (!response.ok) {
			console.error(`TMDB trending ${type} failed with status ${response.status}.`);
			return [];
		}
		const data = (await response.json()) as TmdbTrendingResponse;
		return data.results.map((item) => toMediaSummary(item, type));
	} catch (error) {
		console.error(`TMDB trending ${type} request failed:`, error);
		return [];
	}
}
