"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { markEpisodeWatched, markMovieWatched } from "@/app/media/actions";
import type { EpisodeBookmarkKey } from "@/lib/bookmarks";
import { tmdbPosterUrl } from "@/lib/tmdb";
import { SectionHeader } from "@/components/shared/section-header";

export interface ContinueWatchingAction {
	kind: "movie" | "episode";
	label: string;
	mediaId?: number;
	key?: EpisodeBookmarkKey;
}

export interface ContinueWatchingItem {
	title: string;
	subtitle: string;
	posterPath: string | null;
	href: string;
	action?: ContinueWatchingAction;
}

function ContinueWatchingCard({ item }: { item: ContinueWatchingItem }) {
	const router = useRouter();
	const poster = tmdbPosterUrl(item.posterPath, "w154");
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	function markWatched() {
		if (!item.action) return;
		const action = item.action;
		setError(null);
		startTransition(async () => {
			try {
				if (action.kind === "movie" && action.mediaId) {
					await markMovieWatched(action.mediaId);
				} else if (action.kind === "episode" && action.key) {
					await markEpisodeWatched(action.key);
				}
				router.refresh();
			} catch {
				setError("Couldn't update this bookmark. Try again.");
			}
		});
	}

	return (
		<div className="group flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-lg">
			<Link
				href={item.href}
				className="flex min-w-0 items-center gap-4 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
			>
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
					<span className="line-clamp-2 text-xs leading-relaxed text-muted">{item.subtitle}</span>
				</div>
			</Link>
			{item.action ? (
				<div className="flex flex-wrap items-center justify-between gap-2">
					<button
						type="button"
						onClick={markWatched}
						disabled={isPending}
						className="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
					>
						{isPending ? "Saving…" : item.action.label}
					</button>
					{error ? (
						<p role="alert" className="text-xs text-danger">
							{error}
						</p>
					) : null}
				</div>
			) : null}
		</div>
	);
}

export function ContinueWatchingSection({ items }: { items: ContinueWatchingItem[] }) {
	return (
		<section className="flex flex-col gap-5">
			<SectionHeader title="Continue watching" size="sm" />
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				{items.map((item) => (
					<ContinueWatchingCard key={item.href} item={item} />
				))}
			</div>
		</section>
	);
}
