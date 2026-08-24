import {
	getMediaDetail,
	getTrending,
	tmdbBackdropUrl,
	type MediaDetail,
	type MediaSummary,
	type MediaType,
} from "@/lib/tmdb";

export interface HeroSlide {
	id: number;
	type: "movie" | "series";
	name: string;
	overview: string;
	voteAverage: number;
	year: number | null;
	runtime: number | null;
	genres: string[];
	backdropUrl: string | null;
	href: string;
}

export type TrendingWithDetails = MediaSummary & {
	runtime: number | null;
	genres: string[];
};

function toHeroSlide(detail: MediaDetail): HeroSlide {
	return {
		id: detail.id,
		type: detail.type,
		name: detail.name,
		overview: detail.overview,
		voteAverage: detail.voteAverage,
		year: detail.year,
		runtime: detail.runtime,
		genres: detail.genres,
		backdropUrl: tmdbBackdropUrl(detail.backdropPath, "w1280"),
		href: `/media/${detail.type}/${detail.id}`,
	};
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
	const [movies, series] = await Promise.all([getTrending("movie"), getTrending("series")]);
	const candidates = [...movies.slice(0, 3), ...series.slice(0, 3)];
	if (candidates.length === 0) return [];
	const details = await Promise.all(
		candidates.map((item) => getMediaDetail(item.type, item.id)),
	);
	return details
		.filter((detail): detail is MediaDetail => detail !== null)
		.map(toHeroSlide)
		.filter((slide) => slide.backdropUrl !== null)
		.sort((a, b) => b.voteAverage - a.voteAverage)
		.slice(0, 6);
}

export async function getTrendingWithDetails(
	type: MediaType,
	limit = 10,
): Promise<TrendingWithDetails[]> {
	const items = await getTrending(type);
	const selected = items.slice(0, limit);
	const details = await Promise.all(selected.map((item) => getMediaDetail(item.type, item.id)));
	return selected.map((item, index): TrendingWithDetails => {
		const detail = details[index];
		return {
			...item,
			runtime: detail?.runtime ?? null,
			genres: detail?.genres ?? [],
		};
	});
}

export function formatRuntime(minutes: number | null): string | null {
	if (minutes === null || minutes <= 0) return null;
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	if (hours === 0) return `${mins}m`;
	if (mins === 0) return `${hours}h`;
	return `${hours}h ${mins}m`;
}
