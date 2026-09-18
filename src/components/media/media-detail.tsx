"use client";

import { useState } from "react";
import Image from "next/image";
import { MEDIA_TYPE_LABELS, tmdbBackdropUrl, tmdbPosterUrl, tmdbProfileUrl, type MediaDetail } from "@/lib/tmdb";
import type { OmdbRatings } from "@/lib/omdb";
import type { BookmarkState } from "@/lib/bookmarks";
import { BookmarkPanel } from "./bookmark-panel";

function ScoreBadge({ label, value }: { label: string; value: string }) {
	return (
		<span className="rounded-md bg-background/80 px-2 py-0.5 text-xs font-semibold text-foreground backdrop-blur-sm">
			{label} {value}
		</span>
	);
}

function MediaIcon({ type }: { type: "movie" | "series" }) {
	if (type === "series") {
		return (
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
		);
	}
	return (
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
			<rect width="18" height="18" x="3" y="3" rx="2" />
			<path d="M7 3v18" />
			<path d="M17 3v18" />
			<path d="M3 7.5h4" />
			<path d="M3 12h18" />
			<path d="M3 16.5h4" />
			<path d="M17 7.5h4" />
			<path d="M17 16.5h4" />
		</svg>
	);
}

function PosterImage({ media }: { media: MediaDetail }) {
	const initialPoster = tmdbPosterUrl(media.posterPath, "w342");
	const [imageError, setImageError] = useState(false);

	if (!initialPoster || imageError) {
		return (
			<div className="flex aspect-[2/3] w-40 shrink-0 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-gradient-to-br from-surface to-elevated p-4 text-center shadow-2xl md:w-56">
				<MediaIcon type={media.type} />
				<span className="line-clamp-3 text-xs font-medium text-muted">{media.name}</span>
			</div>
		);
	}

	return (
		<div className="relative aspect-[2/3] w-40 shrink-0 overflow-hidden rounded-xl border border-border shadow-2xl md:w-56">
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={initialPoster}
				alt={media.name}
				width={240}
				height={360}
				onError={() => setImageError(true)}
				className="size-full object-cover"
			/>
		</div>
	);
}

function BackdropBackground({ media }: { media: MediaDetail }) {
	const initialBackdrop = tmdbBackdropUrl(media.backdropPath);
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

function CastCard({ member }: { member: MediaDetail["cast"][number] }) {
	const profile = tmdbProfileUrl(member.profilePath);
	const [imageError, setImageError] = useState(false);

	return (
		<div className="flex flex-col gap-2">
			<div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-border bg-elevated">
				{profile && !imageError ? (
					/* eslint-disable-next-line @next/next/no-img-element */
					<img
						src={profile}
						alt={member.name}
						onError={() => setImageError(true)}
						className="size-full object-cover"
					/>
				) : (
					<div className="flex size-full items-center justify-center p-2 text-center text-xs text-muted">
						<svg
							aria-hidden="true"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							className="size-8 text-muted/60"
						>
							<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
							<circle cx="12" cy="7" r="4" />
						</svg>
					</div>
				)}
			</div>
			<div className="flex flex-col">
				<span className="line-clamp-1 text-sm font-medium text-foreground">{member.name}</span>
				<span className="line-clamp-1 text-xs text-muted">{member.character}</span>
			</div>
		</div>
	);
}

export function MediaDetailView({
	media,
	ratings,
	bookmark,
	isSignedIn,
}: {
	media: MediaDetail;
	ratings: OmdbRatings;
	bookmark: BookmarkState | null;
	isSignedIn: boolean;
}) {
	return (
		<main className="flex flex-1 flex-col">
			<section className="relative overflow-hidden">
				<BackdropBackground media={media} />

				<div className="relative flex flex-col gap-6 p-8 md:flex-row md:items-end">
					<PosterImage media={media} />

					<div className="flex min-w-0 flex-col gap-3">
						<div className="flex flex-wrap items-center gap-2">
							<h1 className="text-3xl font-bold text-foreground md:text-4xl">{media.name}</h1>
							{media.year ? (
								<span className="text-xl font-medium text-muted">({media.year})</span>
							) : null}
						</div>
						<div className="flex flex-wrap items-center gap-2">
							<ScoreBadge label="TMDB" value={media.voteAverage.toFixed(1)} />
							{ratings.imdb ? <ScoreBadge label="IMDb" value={ratings.imdb} /> : null}
							{ratings.rottenTomatoes ? (
								<ScoreBadge label="RT" value={ratings.rottenTomatoes} />
							) : null}
							<span className="text-sm font-medium text-muted">{MEDIA_TYPE_LABELS[media.type]}</span>
						</div>
						{media.genres.length > 0 ? (
							<ul className="flex flex-wrap gap-2">
								{media.genres.map((genre) => (
									<li
										key={genre}
										className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-foreground"
									>
										{genre}
									</li>
								))}
							</ul>
						) : null}
						<BookmarkPanel
							mediaType={media.type}
							mediaId={media.id}
							initialBookmark={bookmark}
							isSignedIn={isSignedIn}
						/>
						<p className="max-w-3xl text-sm leading-relaxed text-foreground">{media.overview}</p>
					</div>
				</div>
			</section>

			{media.trailerKey ? (
				<section className="flex flex-col gap-4 p-8">
					<h2 className="text-xl font-semibold text-foreground">Trailer</h2>
					<div className="aspect-video max-w-3xl overflow-hidden rounded-xl border border-border">
						<iframe
							src={`https://www.youtube.com/embed/${media.trailerKey}`}
							title={`${media.name} trailer`}
							className="h-full w-full"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowFullScreen
						/>
					</div>
				</section>
			) : null}

			{media.cast.length > 0 ? (
				<section className="flex flex-col gap-4 p-8 pt-0">
					<h2 className="text-xl font-semibold text-foreground">Cast</h2>
					<div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
						{media.cast.map((member) => (
							<CastCard key={`${member.name}-${member.character}`} member={member} />
						))}
					</div>
				</section>
			) : null}
		</main>
	);
}
