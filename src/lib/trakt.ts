const TRAKT_API_BASE_URL = "https://api.trakt.tv";

// Config absence is an environment condition, not a per-request error: warn
// once per process so logs (and anything keyed off console.error) stay clean.
let warnedMissingClientId = false;

function warnMissingClientId() {
	if (warnedMissingClientId) return;
	warnedMissingClientId = true;
	console.warn(
		"TRAKT_CLIENT_ID is not set; episode-title search is disabled. Add it to .dev.vars or `wrangler secret put TRAKT_CLIENT_ID` to enable the Episodes tab.",
	);
}

export interface TraktEpisodeSearchHit {
	showName: string;
	showYear: number | null;
	seriesTmdbId: number | null;
	episodeName: string;
	season: number;
	number: number;
}

export interface TraktEpisodeSearch {
	ok: boolean;
	hits: TraktEpisodeSearchHit[];
}

interface TraktIds {
	tmdb: number | null;
}

interface TraktEpisodeItem {
	season: number | null;
	number: number | null;
	title: string;
	ids: TraktIds;
}

interface TraktShowItem {
	title: string;
	year: number | null;
	ids: TraktIds;
}

interface TraktSearchResult {
	type: string;
	episode?: TraktEpisodeItem;
	show?: TraktShowItem;
}

export async function searchTraktEpisodes(query: string): Promise<TraktEpisodeSearch> {
	const trimmed = query.trim();
	if (!trimmed) {
		return { ok: true, hits: [] };
	}
	const clientId = process.env.TRAKT_CLIENT_ID;
	if (!clientId) {
		warnMissingClientId();
		return { ok: false, hits: [] };
	}
	try {
		const url = new URL(`${TRAKT_API_BASE_URL}/search/episode`);
		url.searchParams.set("query", trimmed);
		url.searchParams.set("fields", "title");
		url.searchParams.set("limit", "20");
		const response = await fetch(url, {
			headers: {
				"Content-Type": "application/json",
				"trakt-api-version": "2",
				"trakt-api-key": clientId,
			},
			cache: "no-store",
		});
		if (!response.ok) {
			console.error(`Trakt search/episode "${trimmed}" failed with status ${response.status}.`);
			return { ok: false, hits: [] };
		}
		const data = (await response.json()) as TraktSearchResult[];
		return {
			ok: true,
			hits: data
				.filter(
					(item) =>
						item.type === "episode" &&
						item.episode !== undefined &&
						item.episode.season !== null &&
						item.episode.number !== null &&
						item.show !== undefined,
				)
				.map((item) => ({
					showName: item.show!.title,
					showYear: item.show!.year,
					seriesTmdbId: item.show!.ids.tmdb,
					episodeName: item.episode!.title,
					season: item.episode!.season!,
					number: item.episode!.number!,
				})),
		};
	} catch (error) {
		console.error("Trakt search/episode request failed:", error);
		return { ok: false, hits: [] };
	}
}
