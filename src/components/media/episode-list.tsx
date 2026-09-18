"use client";

import { useState } from "react";
import Link from "next/link";
import { BOOKMARK_STATUS_LABELS, type BookmarkState } from "@/lib/bookmarks";
import { tmdbStillUrl, type EpisodeSummary } from "@/lib/tmdb";
import type { TvmazeEpisode } from "@/lib/tvmaze";

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

function EpisodeThumbnail({ episode }: { episode: EpisodeSummary }) {
	const still = tmdbStillUrl(episode.stillPath, "w300");
	const [imageError, setImageError] = useState(false);

	return (
		<div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg border border-border bg-elevated shadow-sm sm:w-44">
			{still && !imageError ? (
				/* eslint-disable-next-line @next/next/no-img-element */
				<img
					src={still}
					alt={episode.name}
					width={300}
					height={169}
					loading="lazy"
					decoding="async"
					onError={() => setImageError(true)}
					className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
				/>
			) : (
				<div className="flex size-full flex-col items-center justify-center bg-gradient-to-br from-surface to-elevated p-2">
					<PlayGraphic />
				</div>
			)}
			<div className="bg-poster-overlay pointer-events-none absolute inset-x-0 bottom-0 h-1/2" />
			<span className="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground backdrop-blur-md">
				S{episode.seasonNumber} · E{episode.episodeNumber}
			</span>
		</div>
	);
}

function EpisodeRow({
	episode,
	tvmaze,
	bookmark,
}: {
	episode: EpisodeSummary;
	tvmaze: TvmazeEpisode | undefined;
	bookmark: BookmarkState | undefined;
}) {
	const airDate = tvmaze?.airdate ?? episode.airDate;
	const runtime = tvmaze?.runtime ?? episode.runtime;

	return (
		<li>
			<Link
				href={`/media/episode/${episode.seriesId}/${episode.seasonNumber}/${episode.episodeNumber}`}
				className="group flex gap-4 rounded-xl border border-border bg-surface/30 p-3 transition-all duration-200 hover:border-accent/40 hover:bg-surface"
			>
				<EpisodeThumbnail episode={episode} />
				<div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
					<div className="flex items-center justify-between gap-2">
						<h3 className="line-clamp-1 text-sm font-semibold text-foreground transition-colors group-hover:text-accent">
							{episode.name}
						</h3>
						{bookmark ? (
							<span className="shrink-0 rounded-md bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-soft-foreground">
								{BOOKMARK_STATUS_LABELS[bookmark.status]}
							</span>
						) : null}
					</div>
					{episode.overview ? (
						<p className="line-clamp-2 text-xs leading-relaxed text-muted">{episode.overview}</p>
					) : (
						<p className="text-xs italic text-muted/70">No overview available for this episode.</p>
					)}
					<div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-muted">
						{airDate ? <span>{airDate}</span> : null}
						{airDate && runtime ? <span>•</span> : null}
						{runtime ? <span>{runtime} min</span> : null}
						{episode.voteAverage > 0 ? (
							<>
								<span>•</span>
								<span className="font-medium text-gold">★ {episode.voteAverage.toFixed(1)}</span>
							</>
						) : null}
					</div>
				</div>
			</Link>
		</li>
	);
}

export function EpisodeList({
	episodes,
	tvmaze,
	bookmarks,
}: {
	episodes: EpisodeSummary[];
	tvmaze: Map<string, TvmazeEpisode>;
	bookmarks: Map<number, BookmarkState>;
}) {
	return (
		<ul className="flex flex-col gap-2.5">
			{episodes.map((episode) => (
				<EpisodeRow
					key={episode.id}
					episode={episode}
					tvmaze={tvmaze.get(`${episode.seasonNumber}:${episode.episodeNumber}`)}
					bookmark={bookmarks.get(episode.id)}
				/>
			))}
		</ul>
	);
}