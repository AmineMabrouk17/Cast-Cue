import { MEDIA_GRID_CLASS } from "./media-grid";

export function MediaGridSkeleton({ count = 12 }: { count?: number }) {
	return (
		<div className={MEDIA_GRID_CLASS}>
			{Array.from({ length: count }).map((_, index) => (
				<div key={index} className="flex flex-col gap-2">
					<div className="aspect-[2/3] animate-pulse rounded-xl bg-default" />
					<div className="h-4 w-3/4 animate-pulse rounded bg-default" />
					<div className="h-3 w-1/2 animate-pulse rounded bg-default" />
				</div>
			))}
		</div>
	);
}
