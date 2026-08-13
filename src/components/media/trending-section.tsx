import { getTrending, type MediaType } from "@/lib/tmdb";
import { MediaGrid } from "./media-grid";
import { MediaEmptyState } from "./media-empty-state";

const SECTION_TITLES = {
	movie: "Trending movies",
	series: "Trending series",
} as const;

export async function TrendingSection({ type }: { type: MediaType }) {
	const items = await getTrending(type);

	return (
		<section className="flex flex-col gap-4">
			<h2 className="text-xl font-semibold text-foreground">{SECTION_TITLES[type]}</h2>
			{items.length > 0 ? <MediaGrid items={items} /> : <MediaEmptyState />}
		</section>
	);
}
