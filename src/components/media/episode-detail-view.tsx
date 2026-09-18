"use client";

import { useState } from "react";
import Link from "next/link";
import {
	tmdbBackdropUrl,
	tmdbPosterUrl,
	tmdbStillUrl,
	type EpisodeSummary,
	type SeriesBrief,
} from "@/lib/tmdb";
import type { TvmazeEpisode } from "@/lib/tvmaze";
import type { BookmarkState } from "@/lib/bookmarks";
import { EpisodeBookmarkPanel } from "./episode-bookmark-panel";

function MetaBadge({ children }: { children: React.ReactNode }) {
	return (
		<span className="rounded-md bg-background/80 px-2 py-0.5 text-xs font-semibold text-foreground backdrop-blur-sm">
			{children}
		</span>
	);
}

function BackdropBackground({ series }: { series: SeriesBrief }) {
	const initialBackdrop = tmdbBackdropUrl(series.backdropPath);
	const [imageError, setImageError] = useState(false);

	if (!initialBackdrop || imageError) {
		return <div className="absolute inset-0 bg-gradient-to-b from-elevated/40 via-background to-background" />;
	}

	return (
		<>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={initialBackdrop}
				alt=""
				onError={() => setImageError(true)}
				className="absolute inset-0 size-full object-cover"
			/>
			<div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
		</>
	);
}

function EpisodeHeaderImage({
	series,
	episode,
}: {
	series: SeriesBrief;
	episode: EpisodeSummary;
}) {
	const still = tmdbStillUrl(episode.stillPath, "w780");
	const poster = tmdbPosterUrl(series.posterPath, "w342");
	const backdrop = tmdbBackdropUrl(series.backdropPath, "w780");
	const initialSrc = still || poster || backdrop;

	const [src, setSrc] = useState<string | null>(initialSrc);
	const [imageError, setImageError] = useState(false);

	function handleError() {
		// Fallback cascade: still -> poster -> backdrop -> placeholder
		if (src === still && poster) {
			setSrc(poster);
		} else if (src === poster && backdrop) {
			setSrc(backdrop);
		} else {
			setImageError(true);
		}
	}

	if (!src || imageError) {
		return (
			<div className="flex aspect-video w-72 shrink-0 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-gradient-to-br from-surface to-elevated p-4 text-center shadow-2xl md:w-96">
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="size-10 text-muted"
				>
					<rect width="20" height="15" x="2" y="7" rx="2" ry="2" />
					<polyline points="17 2 12 7 7 2" />
				</svg>
				<span className="line-clamp-2 text-xs font-medium text-muted">
					S{episode.seasonNumber} · E{episode.episodeNumber} {episode.name}
				</span>
			</div>
		);
	}

	return (
		<div className="relative aspect-video w-72 shrink-0 overflow-hidden rounded-xl border border-border shadow-2xl md:w-96">
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={src}
				alt={episode.name}
				onError={handleError}
				className="size-full object-cover"
			/>
		</div>
	);
}

export function EpisodeDetailView({
	series,
	episode,
	tvmaze,
	bookmark,
	isSignedIn,
}: {
	series: SeriesBrief;
	episode: EpisodeSummary;
	tvmaze: TvmazeEpisode | null;
	bookmark: BookmarkState | null;
	isSignedIn: boolean;
}) {
	const airDate = tvmaze?.airdate ?? episode.airDate;
	const runtime = tvmaze?.runtime ?? episode.runtime;

	return (
		<main className="flex flex-1 flex-col">
			<section className="relative overflow-hidden">
				<BackdropBackground series={series} />

				<div className="relative mx-auto flex max-w-7xl flex-col gap-6 p-8 md:flex-row md:items-end">
					<EpisodeHeaderImage series={series} episode={episode} />

					<div className="flex min-w-0 flex-col gap-3">
						<Link
							href={`/media/series/${series.id}`}
							className="text-sm font-medium text-muted transition-colors hover:text-foreground"
						>
							← {series.name}
						</Link>
						<h1 className="text-2xl font-bold text-foreground md:text-3xl">
							S{episode.seasonNumber}E{episode.episodeNumber} · {episode.name}
						</h1>
						<div className="flex flex-wrap items-center gap-2">
							{airDate ? <MetaBadge>{airDate}</MetaBadge> : null}
							{runtime ? <MetaBadge>{runtime} min</MetaBadge> : null}
							{episode.voteAverage > 0 ? (
								<MetaBadge>TMDB {episode.voteAverage.toFixed(1)}</MetaBadge>
							) : null}
							<span className="text-sm font-medium text-muted">Episode</span>
						</div>
						<EpisodeBookmarkPanel
							episodeKey={{
								episodeId: episode.id,
								seriesId: series.id,
								seasonNumber: episode.seasonNumber,
								episodeNumber: episode.episodeNumber,
							}}
							initialBookmark={bookmark}
							isSignedIn={isSignedIn}
						/>
						{episode.overview ? (
							<p className="max-w-3xl text-sm leading-relaxed text-foreground">
								{episode.overview}
							</p>
						) : (
							<p className="text-sm italic text-muted">No overview available for this episode.</p>
						)}
					</div>
				</div>
			</section>
		</main>
	);
}