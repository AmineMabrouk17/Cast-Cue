"use client";

import { useState } from "react";
import Link from "next/link";
import { tmdbPosterUrl } from "@/lib/tmdb";
import { SectionHeader } from "@/components/shared/section-header";

export interface RouletteCandidate {
	title: string;
	href: string;
	posterPath: string | null;
	year: number | null;
}

function pickRandom(current: number, length: number): number {
	if (length <= 1) return 0;
	let next = Math.floor(Math.random() * length);
	while (next === current) {
		next = Math.floor(Math.random() * length);
	}
	return next;
}

export function WatchlistRoulette({ pool }: { pool: RouletteCandidate[] }) {
	const [index, setIndex] = useState(() => Math.floor(Math.random() * pool.length));
	const candidate = pool[index];
	const poster = tmdbPosterUrl(candidate.posterPath, "w342");

	return (
		<section className="flex flex-col gap-5">
			<SectionHeader eyebrow="Can't Decide?" title="Watchlist roulette" size="sm" />
			<div className="flex flex-col items-center gap-5 rounded-xl border border-border bg-elevated px-6 py-10">
				<Link href={candidate.href} className="group block w-full max-w-56">
					<div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-border shadow-sm transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-accent/40 group-hover:shadow-lg">
						{poster ? (
							/* eslint-disable-next-line @next/next/no-img-element */
							<img
								src={poster}
								alt={candidate.title}
								width={342}
								height={513}
								loading="lazy"
								decoding="async"
								className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
							/>
						) : (
							<div className="flex size-full items-center justify-center bg-surface p-4 text-center text-sm text-muted">
								{candidate.title}
							</div>
						)}
						<div className="bg-poster-overlay pointer-events-none absolute inset-x-0 bottom-0 h-2/3" />
					</div>
				</Link>
				<div className="flex flex-col items-center gap-1 text-center">
					<span className="text-base font-medium text-foreground">{candidate.title}</span>
					{candidate.year ? <span className="text-xs text-muted">{candidate.year}</span> : null}
				</div>
				<div className="flex items-center gap-3">
					<Link
						href={candidate.href}
						className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-glow transition-colors duration-300 hover:bg-accent-hover"
					>
						<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-4">
							<path d="M8 5v14l11-7L8 5z" />
						</svg>
						View details
					</Link>
					<button
						type="button"
						onClick={() => setIndex(pickRandom(index, pool.length))}
						className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground transition-colors duration-300 hover:border-accent/60 hover:bg-accent-surface"
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
						<path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.8-1.1 2-1.7 3.3-1.7H22" />
							<path d="m18 2 4 4-4 4" />
							<path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" />
							<path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8" />
							<path d="m18 14 4 4-4 4" />
						</svg>
						Shuffle
					</button>
				</div>
			</div>
		</section>
	);
}
