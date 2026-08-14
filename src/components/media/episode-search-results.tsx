import Image from "next/image";
import Link from "next/link";
import type { EpisodeSearchResult } from "@/lib/episode-search";
import { tmdbPosterUrl, tmdbStillUrl } from "@/lib/tmdb";

function EpisodeSearchResultRow({ result }: { result: EpisodeSearchResult }) {
	const still = tmdbStillUrl(result.stillPath, "w300");
	const poster = tmdbPosterUrl(result.seriesPosterPath, "w185");
	const image = still ?? poster;

	return (
		<li>
			<Link
				href={`/media/episode/${result.seriesId}/${result.seasonNumber}/${result.episodeNumber}`}
				className="group flex gap-4 rounded-xl border border-border p-3 transition-colors hover:bg-default/60"
			>
				<div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-default sm:w-44">
					{image ? (
						<Image
							src={image}
							alt=""
							fill
							sizes="(min-width: 640px) 11rem, 8rem"
							className="object-cover"
						/>
					) : null}
					<span className="absolute bottom-1 right-1 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur-sm">
						S{result.seasonNumber} E{result.episodeNumber}
					</span>
				</div>
				<div className="flex min-w-0 flex-1 flex-col gap-1">
					<h3 className="line-clamp-1 text-sm font-semibold text-foreground group-hover:underline">
						{result.name}
					</h3>
					<p className="line-clamp-1 text-xs text-muted">{result.seriesName}</p>
					{result.overview ? (
						<p className="line-clamp-2 text-xs text-muted">{result.overview}</p>
					) : (
						<p className="text-xs text-muted">No overview available.</p>
					)}
					<div className="flex flex-wrap items-center gap-2 text-xs text-muted">
						{result.airDate ? <span>{result.airDate}</span> : null}
						{result.runtime ? <span>{result.runtime} min</span> : null}
						{result.voteAverage > 0 ? (
							<span>TMDB {result.voteAverage.toFixed(1)}</span>
						) : null}
					</div>
				</div>
			</Link>
		</li>
	);
}

export function EpisodeSearchResults({ results }: { results: EpisodeSearchResult[] }) {
	return (
		<ul className="flex flex-col gap-2">
			{results.map((result) => (
				<EpisodeSearchResultRow key={result.episodeId} result={result} />
			))}
		</ul>
	);
}
