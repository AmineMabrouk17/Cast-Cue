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
	const backdrop = tmdbBackdropUrl(media.backdropPath);
	const poster = tmdbPosterUrl(media.posterPath, "w342");

	return (
		<main className="flex flex-1 flex-col">
			<section className="relative overflow-hidden">
				{backdrop ? (
					<>
						<Image
							src={backdrop}
							alt=""
							fill
							sizes="100vw"
							priority
							className="object-cover"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
					</>
				) : (
					<div className="absolute inset-0 bg-default" />
				)}
				<div className="relative flex flex-col gap-6 p-8 md:flex-row md:items-end">
					{poster ? (
						<Image
							src={poster}
							alt={media.name}
							width={240}
							height={360}
							priority
							className="w-40 shrink-0 rounded-xl shadow-2xl md:w-56"
						/>
					) : (
						<div className="flex aspect-[2/3] w-40 shrink-0 items-center justify-center rounded-xl bg-default p-4 text-center text-sm text-muted md:w-56">
							{media.name}
						</div>
					)}
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
						{media.cast.map((member) => {
							const profile = tmdbProfileUrl(member.profilePath);
							return (
								<div key={member.name} className="flex flex-col gap-2">
									<div className="aspect-[2/3] overflow-hidden rounded-xl bg-default">
										{profile ? (
											<Image
												src={profile}
												alt={member.name}
												width={185}
												height={278}
												sizes="(min-width: 1280px) 12.5vw, (min-width: 1024px) 16.6vw, (min-width: 768px) 20vw, (min-width: 640px) 25vw, 33vw"
												className="h-full w-full object-cover"
											/>
										) : null}
									</div>
									<div className="flex flex-col">
										<span className="line-clamp-1 text-sm font-medium text-foreground">
											{member.name}
										</span>
										<span className="line-clamp-1 text-xs text-muted">{member.character}</span>
									</div>
								</div>
							);
						})}
					</div>
				</section>
			) : null}
		</main>
	);
}
