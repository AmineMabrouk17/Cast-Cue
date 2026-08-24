import Link from "next/link";
import { tmdbPosterUrl } from "@/lib/tmdb";
import { SectionHeader } from "@/components/shared/section-header";

export interface ContinueWatchingItem {
	title: string;
	subtitle: string;
	posterPath: string | null;
	href: string;
}

function ContinueWatchingCard({ item }: { item: ContinueWatchingItem }) {
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
					<span className="absolute inset-0 m-auto flex size-9 scale-75 items-center justify-center rounded-full bg-accent text-accent-foreground opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
						<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-4">
							<path d="M8 5v14l11-7L8 5z" />
						</svg>
					</span>
				</div>
				<div className="flex min-w-0 flex-col gap-1.5">
					<span className="line-clamp-1 text-sm font-medium text-foreground">{item.title}</span>
					<span className="line-clamp-2 text-xs leading-relaxed text-muted">{item.subtitle}</span>
				</div>
			</div>
		</Link>
	);
}

export function ContinueWatchingSection({ items }: { items: ContinueWatchingItem[] }) {
	return (
		<section className="flex flex-col gap-5">
			<SectionHeader eyebrow="Keep Watching" title="Continue watching" size="sm" />
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				{items.map((item) => (
					<ContinueWatchingCard key={item.href} item={item} />
				))}
			</div>
		</section>
	);
}
