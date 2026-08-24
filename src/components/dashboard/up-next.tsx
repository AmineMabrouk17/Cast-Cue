import Link from "next/link";
import { tmdbPosterUrl } from "@/lib/tmdb";
import { SectionHeader } from "@/components/shared/section-header";

export interface UpNextItem {
	href: string;
	title: string;
	posterPath: string | null;
	episodeLabel: string;
	dateLabel: string;
	airDate: string;
}

function UpNextCard({ item }: { item: UpNextItem }) {
	const poster = tmdbPosterUrl(item.posterPath, "w154");

	return (
		<Link href={item.href} className="group block">
			<div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-3 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-accent/40 group-hover:shadow-lg">
				<div className="relative aspect-[2/3] w-20 shrink-0 overflow-hidden rounded-lg border border-border">
					{poster ? (
						/* eslint-disable-next-line @next/next/no-img-element */
						<img
							src={poster}
							alt={item.title}
							width={154}
							height={231}
							loading="lazy"
							decoding="async"
							className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
						/>
					) : (
						<div className="flex size-full items-center justify-center bg-elevated p-2 text-center text-xs text-muted">
							{item.title}
						</div>
					)}
					<div className="bg-poster-overlay pointer-events-none absolute inset-x-0 bottom-0 h-2/3" />
				</div>
				<div className="flex min-w-0 flex-col gap-1.5">
					<span className="line-clamp-1 text-sm font-medium text-foreground">{item.title}</span>
					<span className="line-clamp-1 text-xs text-muted">{item.episodeLabel}</span>
					<span className="w-fit rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-soft-foreground">
						{item.dateLabel}
					</span>
				</div>
			</div>
		</Link>
	);
}

export function UpNextSection({ items }: { items: UpNextItem[] }) {
	return (
		<section className="flex flex-col gap-5">
			<SectionHeader eyebrow="Airing Soon" title="Up next" size="sm" />
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				{items.map((item) => (
					<UpNextCard key={item.href} item={item} />
				))}
			</div>
		</section>
	);
}
