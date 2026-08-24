import { MediaCard } from "./media-card";
import type { MediaCardItem } from "./media-card";

export const MEDIA_GRID_CLASS =
	"grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6";

export function MediaGrid({ items }: { items: MediaCardItem[] }) {
	return (
		<div className={MEDIA_GRID_CLASS}>
			{items.map((item) => (
				<MediaCard key={`${item.type}-${item.id}`} media={item} />
			))}
		</div>
	);
}
