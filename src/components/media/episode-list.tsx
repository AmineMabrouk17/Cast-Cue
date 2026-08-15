import Image from "next/image";
import Link from "next/link";
import { BOOKMARK_STATUS_LABELS, type BookmarkState } from "@/lib/bookmarks";
import { tmdbStillUrl, type EpisodeSummary } from "@/lib/tmdb";
import type { TvmazeEpisode } from "@/lib/tvmaze";

function EpisodeRow({
	episode,
	tvmaze,
	bookmark,
}: {
	episode: EpisodeSummary;
	tvmaze: TvmazeEpisode | undefined;
	bookmark: BookmarkState | undefined;
}) {
	const still = tmdbStillUrl(episode.stillPath, "w300");
	const airDate = tvmaze?.airdate ?? episode.airDate;
	const runtime = tvmaze?.runtime ?? episode.runtime;

	return (
		<li>
			<Link
				href={`/media/episode/${episode.seriesId}/${episode.seasonNumber}/${episode.episodeNumber}`}
				className="group flex gap-4 rounded-xl border border-border p-3 transition-colors hover:bg-default/60"
			>
				<div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-default sm:w-44">
					{still ? (
						<Image
							src={still}
							alt=""
							fill
							sizes="(min-width: 640px) 11rem, 8rem"
							className="object-cover"
						/>
					) : null}
					<span className="absolute bottom-1 right-1 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur-sm">
						S{episode.seasonNumber} E{episode.episodeNumber}
					</span>
				</div>
				<div className="flex min-w-0 flex-1 flex-col gap-1">
					<div className="flex items-center justify-between gap-2">
						<h3 className="line-clamp-1 text-sm font-semibold text-foreground group-hover:underline">
							{episode.name}
						</h3>
						{bookmark ? (
							<span className="shrink-0 rounded-md bg-background px-2 py-0.5 text-xs font-medium text-muted">
								{BOOKMARK_STATUS_LABELS[bookmark.status]}
							</span>
						) : null}
					</div>
					{episode.overview ? (
						<p className="line-clamp-2 text-xs text-muted">{episode.overview}</p>
					) : (
						<p className="text-xs text-muted">No overview available.</p>
					)}
					<div className="flex flex-wrap items-center gap-2 text-xs text-muted">
						{airDate ? <span>{airDate}</span> : null}
						{runtime ? <span>{runtime} min</span> : null}
						{episode.voteAverage > 0 ? (
							<span>TMDB {episode.voteAverage.toFixed(1)}</span>
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
		<ul className="flex flex-col gap-2">
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
