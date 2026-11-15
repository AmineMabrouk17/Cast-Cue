import Link from "next/link";
import { MEDIA_TYPE_LABELS, tmdbPosterUrl, type MediaSummary } from "@/lib/tmdb";

export type MediaCardItem = MediaSummary & {
	runtime?: number | null;
	genres?: string[];
	badge?: string | null;
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
		<Link href={`/media/${media.type}/${media.id}`} className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background">
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

				{/* Absolute Overlay Badges (Top-Left: 12px / 12px) */}
				<div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
					{media.badge ? (
						<span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground shadow-sm backdrop-blur-sm">
							{media.badge}
						</span>
					) : null}
					{media.voteAverage > 0 ? (
						<span
							className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-gold backdrop-blur-sm"
							title={`TMDB score ${media.voteAverage.toFixed(1)}`}
						>
							<svg
								aria-hidden="true"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="size-3"
							>
								<path d="M12 2l2.9 6.26 6.85.72-5.1 4.62 1.43 6.73L12 16.9l-6.08 3.43 1.43-6.73-5.1-4.62 6.85-.72L12 2z" />
							</svg>
							<span className="sr-only">TMDB score </span>
							{media.voteAverage.toFixed(1)}
						</span>
					) : null}
				</div>
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
