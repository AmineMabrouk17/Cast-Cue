"use client";

import { useState } from "react";
import Link from "next/link";
import type { EpisodeSearchResult } from "@/lib/episode-search";
import { tmdbPosterUrl, tmdbStillUrl } from "@/lib/tmdb";

function PlayGraphic() {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			fill="currentColor"
			className="size-6 text-muted/40 transition-transform duration-300 group-hover:scale-110 group-hover:text-accent"
		>
			<path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.29-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14z" />
		</svg>
	);
}

function SearchThumbnail({ result }: { result: EpisodeSearchResult }) {
	const still = tmdbStillUrl(result.stillPath, "w300");
	const poster = tmdbPosterUrl(result.seriesPosterPath, "w185");
	const initialSrc = still || poster;

	const [src, setSrc] = useState<string | null>(initialSrc);
	const [imageError, setImageError] = useState(false);

	function handleError() {
		if (src === still && poster) {
			setSrc(poster);
		} else {
			setImageError(true);
		}
	}

	return (
		<div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg border border-border bg-elevated shadow-sm sm:w-44">
			{src && !imageError ? (
				/* eslint-disable-next-line @next/next/no-img-element */
				<img
					src={src}
					alt={result.name}
					width={300}
					height={169}
					loading="lazy"
					decoding="async"
					onError={handleError}
					className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
				/>
			) : (
				<div className="flex size-full flex-col items-center justify-center bg-gradient-to-br from-surface to-elevated p-2">
					<PlayGraphic />
				</div>
			)}
			<div className="bg-poster-overlay pointer-events-none absolute inset-x-0 bottom-0 h-1/2" />
			<span className="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground backdrop-blur-md">
				S{result.seasonNumber} · E{result.episodeNumber}
			</span>
		</div>
	);
}

function EpisodeSearchResultRow({ result }: { result: EpisodeSearchResult }) {
	return (
		<li>
			<Link
				href={`/media/episode/${result.seriesId}/${result.seasonNumber}/${result.episodeNumber}`}
				className="group flex gap-4 rounded-xl border border-border bg-surface/30 p-3 transition-all duration-200 hover:border-accent/40 hover:bg-surface"
			>
				<SearchThumbnail result={result} />
				<div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
					<h3 className="line-clamp-1 text-sm font-semibold text-foreground transition-colors group-hover:text-accent">
						{result.name}
					</h3>
					<p className="line-clamp-1 text-xs font-medium text-muted">{result.seriesName}</p>
					{result.overview ? (
						<p className="line-clamp-2 text-xs leading-relaxed text-muted">{result.overview}</p>
					) : (
						<p className="text-xs italic text-muted/70">No overview available.</p>
					)}
					<div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-muted">
						{result.airDate ? <span>{result.airDate}</span> : null}
						{result.airDate && result.runtime ? <span>•</span> : null}
						{result.runtime ? <span>{result.runtime} min</span> : null}
						{result.voteAverage > 0 ? (
							<>
								<span>•</span>
								<span className="font-medium text-gold">★ {result.voteAverage.toFixed(1)}</span>
							</>
						) : null}
					</div>
				</div>
			</Link>
		</li>
	);
}

export function EpisodeSearchResults({ results }: { results: EpisodeSearchResult[] }) {
	return (
		<ul className="flex flex-col gap-2.5">
			{results.map((result) => (
				<EpisodeSearchResultRow key={`${result.seriesId}-${result.episodeId}`} result={result} />
			))}
		</ul>
	);
}