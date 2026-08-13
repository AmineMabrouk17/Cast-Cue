import { MediaCard } from "./media-card";
import type { MediaSummary } from "@/lib/tmdb";

export const MEDIA_GRID_CLASS =
	"grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

export function MediaGrid({ items }: { items: MediaSummary[] }) {
	return (
		<div className={MEDIA_GRID_CLASS}>
			{items.map((item) => (
				<MediaCard key={`${item.type}-${item.id}`} media={item} />
			))}
		</div>
	);
}
