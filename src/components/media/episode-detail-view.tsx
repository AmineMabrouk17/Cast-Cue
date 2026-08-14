import Image from "next/image";
import Link from "next/link";
import { tmdbBackdropUrl, tmdbPosterUrl, tmdbStillUrl, type EpisodeSummary, type SeriesBrief } from "@/lib/tmdb";
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
	const backdrop = tmdbBackdropUrl(series.backdropPath);
	const poster = tmdbPosterUrl(series.posterPath, "w342");
	const still = tmdbStillUrl(episode.stillPath, "w780");
	const airDate = tvmaze?.airdate ?? episode.airDate;
	const runtime = tvmaze?.runtime ?? episode.runtime;

	return (
		<main className="flex flex-1 flex-col">
			<section className="relative overflow-hidden">
				{backdrop ? (
					<>
						<Image src={backdrop} alt="" fill sizes="100vw" priority className="object-cover" />
						<div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
					</>
				) : (
					<div className="absolute inset-0 bg-default" />
				)}
				<div className="relative flex flex-col gap-6 p-8 md:flex-row md:items-end">
					{still ? (
						<Image
							src={still}
							alt=""
							width={400}
							height={225}
							priority
							className="aspect-video w-72 shrink-0 rounded-xl object-cover shadow-2xl md:w-96"
						/>
					) : poster ? (
						<Image
							src={poster}
							alt={series.name}
							width={240}
							height={360}
							priority
							className="w-40 shrink-0 rounded-xl object-cover shadow-2xl md:w-56"
						/>
					) : (
						<div className="flex aspect-video w-72 shrink-0 items-center justify-center rounded-xl bg-default p-4 text-center text-sm text-muted md:w-96">
							{episode.name}
						</div>
					)}
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
						) : null}
					</div>
				</div>
			</section>
		</main>
	);
}
