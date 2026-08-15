const TVMAZE_API_BASE_URL = "https://api.tvmaze.com";

export interface TvmazeEpisode {
	season: number;
	number: number;
	name: string;
	airdate: string | null;
	airstamp: string | null;
	runtime: number | null;
}

export const TVMAZE_EPISODE_KEY = (season: number, episode: number): string => `${season}:${episode}`;

interface TvmazeShow {
	id: number;
	name: string;
	premiered: string | null;
}

interface TvmazeEpisodeResponse {
	season: number;
	number: number;
	name: string;
	airdate: string;
	airstamp: string;
	runtime: number | null;
}

export interface TvmazeEpisodeSearchHit {
	showName: string;
	premiered: string | null;
	episode: TvmazeEpisode;
}

export interface TvmazeEpisodeSearch {
	ok: boolean;
	hits: TvmazeEpisodeSearchHit[];
}

interface TvmazeEpisodeSearchResponse {
	show: {
		name: string;
		premiered: string | null;
	};
	episode: TvmazeEpisodeResponse;
}

function toTvmazeEpisode(episode: TvmazeEpisodeResponse): TvmazeEpisode {
	return {
		season: episode.season,
		number: episode.number,
		name: episode.name,
		airdate: episode.airdate || null,
		airstamp: episode.airstamp || null,
		runtime: episode.runtime ?? null,
	};
}

export async function searchTvmazeEpisodes(query: string): Promise<TvmazeEpisodeSearch> {
	const trimmed = query.trim();
	if (!trimmed) {
		return { ok: true, hits: [] };
	}
	try {
		const url = new URL(`${TVMAZE_API_BASE_URL}/search/episodes`);
		url.searchParams.set("q", trimmed);
		const response = await fetch(url, { cache: "no-store" });
		if (!response.ok) {
			console.error(`TVmaze search/episodes "${trimmed}" failed with status ${response.status}.`);
			return { ok: false, hits: [] };
		}
		const data = (await response.json()) as TvmazeEpisodeSearchResponse[];
		return {
			ok: true,
			hits: data.map((item) => ({
				showName: item.show.name,
				premiered: item.show.premiered,
				episode: toTvmazeEpisode(item.episode),
			})),
		};
	} catch (error) {
		console.error("TVmaze search/episodes request failed:", error);
		return { ok: false, hits: [] };
	}
}

export async function findTvmazeShowId(name: string, year: number | null): Promise<number | null> {
	try {
		const url = new URL(`${TVMAZE_API_BASE_URL}/singlesearch/shows`);
		url.searchParams.set("q", name);
		const response = await fetch(url, { cache: "no-store" });
		if (response.status === 404) {
			return null;
		}
		if (!response.ok) {
			console.error(`TVmaze singlesearch "${name}" failed with status ${response.status}.`);
			return null;
		}
		const show = (await response.json()) as TvmazeShow;
		if (year !== null && show.premiered) {
			const premieredYear = Number.parseInt(show.premiered.slice(0, 4), 10);
			if (Number.isFinite(premieredYear) && premieredYear !== year) {
				console.warn(
					`TVmaze match "${show.name}" premiered ${show.premiered}; expected ${year}. Skipping enrichment.`,
				);
				return null;
			}
		}
		return show.id;
	} catch (error) {
		console.error("TVmaze singlesearch request failed:", error);
		return null;
	}
}

export async function getTvmazeEpisodes(showId: number): Promise<TvmazeEpisode[]> {
	try {
		const response = await fetch(`${TVMAZE_API_BASE_URL}/shows/${showId}/episodes`, { cache: "no-store" });
		if (!response.ok) {
			console.error(`TVmaze shows/${showId}/episodes failed with status ${response.status}.`);
			return [];
		}
		const data = (await response.json()) as TvmazeEpisodeResponse[];
		return data.map(toTvmazeEpisode);
	} catch (error) {
		console.error("TVmaze shows episodes request failed:", error);
		return [];
	}
}

export async function getTvmazeEpisodeByNumber(
	showId: number,
	seasonNumber: number,
	episodeNumber: number,
): Promise<TvmazeEpisode | null> {
	try {
		const url = new URL(`${TVMAZE_API_BASE_URL}/shows/${showId}/episodebynumber`);
		url.searchParams.set("season", String(seasonNumber));
		url.searchParams.set("number", String(episodeNumber));
		const response = await fetch(url, { cache: "no-store" });
		if (response.status === 404) {
			return null;
		}
		if (!response.ok) {
			console.error(`TVmaze shows/${showId}/episodebynumber failed with status ${response.status}.`);
			return null;
		}
		return toTvmazeEpisode((await response.json()) as TvmazeEpisodeResponse);
	} catch (error) {
		console.error("TVmaze episodebynumber request failed:", error);
		return null;
	}
}

export interface TvmazeSchedule {
	showId: number | null;
	episodes: Map<string, TvmazeEpisode>;
}

export async function getTvmazeSchedule(name: string, year: number | null): Promise<TvmazeSchedule> {
	const showId = await findTvmazeShowId(name, year);
	if (showId === null) {
		return { showId: null, episodes: new Map() };
	}
	const episodes = await getTvmazeEpisodes(showId);
	const schedule = new Map<string, TvmazeEpisode>();
	for (const episode of episodes) {
		schedule.set(TVMAZE_EPISODE_KEY(episode.season, episode.number), episode);
	}
	return { showId, episodes: schedule };
}

export async function getTvmazeEpisodeSchedule(
	name: string,
	year: number | null,
	seasonNumber: number,
	episodeNumber: number,
): Promise<TvmazeEpisode | null> {
	const showId = await findTvmazeShowId(name, year);
	if (showId === null) {
		return null;
	}
	return getTvmazeEpisodeByNumber(showId, seasonNumber, episodeNumber);
}
