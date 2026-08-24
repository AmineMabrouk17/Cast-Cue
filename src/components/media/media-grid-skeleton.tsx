import { MEDIA_GRID_CLASS } from "./media-grid";

export function MediaGridSkeleton({ count = 12 }: { count?: number }) {
	return (
		<div className={MEDIA_GRID_CLASS}>
			{Array.from({ length: count }).map((_, index) => (
				<div key={index} className="flex flex-col gap-1">
					<div className="aspect-[2/3] animate-pulse rounded-xl border border-border bg-surface" />
					<div className="pt-3">
						<div className="h-3.5 w-3/4 animate-pulse rounded bg-surface" />
						<div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-elevated" />
					</div>
				</div>
			))}
		</div>
	);
}
