export interface SeasonEpisodeNotation {
	seriesName: string;
	season: number;
	episode: number;
}

const SEASON_EPISODE_PATTERN = /\bs\s*(\d{1,3})\s*e\s*(\d{1,3})\b/i;

export function parseSeasonEpisodeNotation(query: string): SeasonEpisodeNotation | null {
	const match = SEASON_EPISODE_PATTERN.exec(query);
	if (!match) return null;

	const season = Number.parseInt(match[1], 10);
	const episode = Number.parseInt(match[2], 10);
	if (season < 1 || episode < 1) return null;

	const prefix = query.slice(0, match.index).trim();
	const suffix = query.slice(match.index + match[0].length).trim();
	const seriesName = (prefix || suffix).replace(/[.,;:!?)\]]+$/, "").trim();
	if (!seriesName) return null;

	return { seriesName, season, episode };
}
