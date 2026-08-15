"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { buttonVariants } from "@heroui/styles";
import { tmdbPosterUrl } from "@/lib/tmdb";

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
		<section className="flex flex-col gap-4">
			<h2 className="text-xl font-semibold text-foreground">Watchlist roulette</h2>
			<p className="text-sm text-muted">Not sure what to watch? Roll the dice on your watchlist.</p>
			<div className="flex flex-col items-center gap-4 py-4">
				<Link href={candidate.href} className="group block w-full max-w-56">
					<Card variant="default" className="overflow-hidden">
						<Card.Content className="relative aspect-[2/3] p-0">
							{poster ? (
								<Image
									src={poster}
									alt={candidate.title}
									fill
									sizes="224px"
									className="object-cover transition-transform duration-300 group-hover:scale-105"
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center bg-default p-4 text-center text-sm text-muted">
									{candidate.title}
								</div>
							)}
						</Card.Content>
					</Card>
				</Link>
				<div className="flex flex-col items-center gap-1">
					<span className="text-sm font-medium text-foreground">{candidate.title}</span>
					{candidate.year ? <span className="text-xs text-muted">{candidate.year}</span> : null}
				</div>
				<div className="flex items-center gap-2">
					<Link href={candidate.href} className={buttonVariants({ variant: "primary", size: "sm" })}>
						View details
					</Link>
					<Button variant="tertiary" size="sm" onPress={() => setIndex(pickRandom(index, pool.length))}>
						Shuffle
					</Button>
				</div>
			</div>
		</section>
	);
}
