import type { MediaType } from "@/lib/tmdb";

const OMDB_API_BASE_URL = "https://www.omdbapi.com";

const OMDB_TYPE: Record<MediaType, string> = {
	movie: "movie",
	series: "series",
};

export interface OmdbRatings {
	imdb: string | null;
	rottenTomatoes: string | null;
}

interface OmdbRating {
	Source: string;
	Value: string;
}

interface OmdbResponse {
	Response: string;
	Ratings?: OmdbRating[];
}

export async function getOmdbRatings(
	name: string,
	year: number | null,
	type: MediaType,
): Promise<OmdbRatings> {
	const apiKey = process.env.OMDB_API_KEY;
	if (!apiKey) {
		console.error("OMDB_API_KEY is not set; skipping OMDb request.");
		return { imdb: null, rottenTomatoes: null };
	}
	try {
		const url = new URL(OMDB_API_BASE_URL);
		url.searchParams.set("apikey", apiKey);
		url.searchParams.set("t", name);
		if (year) {
			url.searchParams.set("y", String(year));
		}
		url.searchParams.set("type", OMDB_TYPE[type]);
		const response = await fetch(url, { cache: "no-store" });
		if (!response.ok) {
			console.error(`OMDb request failed with status ${response.status}.`);
			return { imdb: null, rottenTomatoes: null };
		}
		const data = (await response.json()) as OmdbResponse;
		if (data.Response === "False" || !data.Ratings) {
			return { imdb: null, rottenTomatoes: null };
		}
		const ratings: OmdbRatings = { imdb: null, rottenTomatoes: null };
		for (const rating of data.Ratings) {
			if (rating.Source === "Internet Movie Database") {
				ratings.imdb = rating.Value.replace(/\/10$/, "");
			}
			if (rating.Source === "Rotten Tomatoes") {
				ratings.rottenTomatoes = rating.Value;
			}
		}
		return ratings;
	} catch (error) {
		console.error("OMDb request failed:", error);
		return { imdb: null, rottenTomatoes: null };
	}
}
