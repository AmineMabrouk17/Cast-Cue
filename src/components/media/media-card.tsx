import Link from "next/link";
import { MEDIA_TYPE_LABELS, tmdbPosterUrl, type MediaSummary } from "@/lib/tmdb";

export type MediaCardItem = MediaSummary & {
	runtime?: number | null;
	genres?: string[];
};

function formatRuntime(runtime: number): string {
	const hours = Math.floor(runtime / 60);
	const minutes = runtime % 60;
	return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function MediaCard({ media }: { media: MediaCardItem }) {
	const poster = tmdbPosterUrl(media.posterPath, "w342");
	const metaParts = [media.year ? String(media.year) : null, media.runtime ? formatRuntime(media.runtime) : MEDIA_TYPE_LABELS[media.type]].filter(
		(part) => part !== null,
	);

	return (
		<Link href={`/media/${media.type}/${media.id}`} className="group block focus-visible:outline-none">
			<div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-lg">
				{poster ? (
					/* eslint-disable-next-line @next/next/no-img-element */
					<img
						src={poster}
						alt={media.name}
						width={342}
						height={513}
						loading="lazy"
						decoding="async"
						className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
					/>
				) : (
					<div className="flex size-full items-center justify-center bg-elevated p-4 text-center text-sm text-muted">
						{media.name}
					</div>
				)}
				<div className="bg-poster-overlay pointer-events-none absolute inset-x-0 bottom-0 h-2/3" />
				<span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-gold backdrop-blur-sm">
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						fill="currentColor"
						className="size-3"
					>
						<path d="M12 2l2.9 6.26 6.85.72-5.1 4.62 1.43 6.73L12 16.9l-6.08 3.43 1.43-6.73-5.1-4.62 6.85-.72L12 2z" />
					</svg>
					{media.voteAverage.toFixed(1)}
				</span>
				<div className="absolute right-2 top-2 flex flex-col gap-2">
					<span
						aria-hidden="true"
						className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-black/50 text-foreground opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100 hover:bg-accent hover:text-accent-foreground"
					>
						<svg
							aria-hidden="true"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							className="size-4"
						>
							<path d="M12 5v14M5 12h14" />
						</svg>
					</span>
					<span
						aria-hidden="true"
						className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-black/50 text-foreground opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100 hover:bg-accent hover:text-accent-foreground"
					>
						<svg
							aria-hidden="true"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="size-4"
						>
							<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.51 4.04 3 5.5l7 7z" />
						</svg>
					</span>
				</div>
				<span className="absolute inset-0 m-auto flex size-12 scale-75 items-center justify-center rounded-full bg-accent text-accent-foreground opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
					<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-5">
						<path d="M8 5v14l11-7L8 5z" />
					</svg>
				</span>
			</div>
			<div className="flex flex-col gap-1 pt-3">
				<span className="line-clamp-1 text-sm font-medium text-foreground">{media.name}</span>
				<span className="text-xs text-muted">{metaParts.join(" · ")}</span>
				{media.genres && media.genres.length > 0 ? (
					<div className="flex flex-wrap gap-1 pt-0.5">
						{media.genres.slice(0, 3).map((genre) => (
							<span key={genre} className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted">
								{genre}
							</span>
						))}
					</div>
				) : null}
			</div>
		</Link>
	);
}
