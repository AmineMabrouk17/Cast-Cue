import { Suspense } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { redirect } from "next/navigation";
import { listUserBookmarks, type UserBookmark } from "@/lib/bookmarks";
import { getServerSession } from "@/lib/session";
import { getEpisodeDetail, getMediaDetail, getSeriesBrief, tmdbPosterUrl } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

interface WatchedMovie {
	mediaId: number;
	name: string;
	year: number | null;
	posterPath: string | null;
	runtime: number | null;
}

interface WatchedEpisode {
	mediaId: number;
	href: string;
	label: string;
	seriesName: string;
	runtime: number | null;
}

interface FavoriteItem {
	key: string;
	href: string;
	title: string;
	subtitle: string;
	imageUrl: string | null;
}

const RATING_STEPS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

function formatRuntime(minutes: number): string {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

async function StatsContent() {
	const session = await getServerSession();
	if (!session) redirect("/login");
	const userId = session.user.id;
	const bookmarks = await listUserBookmarks(getCloudflareContext().env.DB, userId);

	const completedMovies = bookmarks.filter((bookmark) => bookmark.mediaType === "movie" && bookmark.status === "completed");
	const completedEpisodes = bookmarks.filter((bookmark) => bookmark.mediaType === "episode" && bookmark.status === "completed");
	const rated = bookmarks.filter((bookmark) => bookmark.rating !== null && bookmark.rating > 0);
	const favorites = bookmarks.filter((bookmark) => bookmark.favorite);

	const [movies, episodes] = await Promise.all([
		Promise.all(
			completedMovies.map(async (bookmark): Promise<WatchedMovie | null> => {
				const detail = await getMediaDetail("movie", bookmark.mediaId);
				if (!detail) return null;
				return {
					mediaId: bookmark.mediaId,
					name: detail.name,
					year: detail.year,
					posterPath: detail.posterPath,
					runtime: detail.runtime,
				};
			}),
		),
		Promise.all(
			completedEpisodes.map(async (bookmark): Promise<WatchedEpisode | null> => {
				if (bookmark.seriesId === null || bookmark.seasonNumber === null || bookmark.episodeNumber === null) {
					return null;
				}
				const [series, episode] = await Promise.all([
					getSeriesBrief(bookmark.seriesId),
					getEpisodeDetail(bookmark.seriesId, bookmark.seasonNumber, bookmark.episodeNumber),
				]);
				if (!series || !episode) return null;
				return {
					mediaId: bookmark.mediaId,
					href: `/media/episode/${bookmark.seriesId}/${bookmark.seasonNumber}/${bookmark.episodeNumber}`,
					label: `S${bookmark.seasonNumber} E${bookmark.episodeNumber}`,
					seriesName: series.name,
					runtime: episode.runtime,
				};
			}),
		),
	]);

	const resolvedMovies = movies.filter((movie): movie is WatchedMovie => movie !== null);
	const resolvedEpisodes = episodes.filter((episode): episode is WatchedEpisode => episode !== null);

	const movieMinutes = resolvedMovies.reduce((total, movie) => total + (movie.runtime ?? 0), 0);
	const episodeMinutes = resolvedEpisodes.reduce((total, episode) => total + (episode.runtime ?? 0), 0);

	const ratingCounts = new Map<number, number>();
	for (const step of RATING_STEPS) ratingCounts.set(step, 0);
	for (const bookmark of rated) {
		if (bookmark.rating !== null && ratingCounts.has(bookmark.rating)) {
			ratingCounts.set(bookmark.rating, (ratingCounts.get(bookmark.rating) ?? 0) + 1);
		}
	}
	const maxRatingCount = Math.max(1, ...ratingCounts.values());

	const favoriteItems: FavoriteItem[] = (
		await Promise.all(
			favorites.map(async (bookmark): Promise<FavoriteItem | null> => {
				if (bookmark.mediaType === "episode") {
					if (bookmark.seriesId === null || bookmark.seasonNumber === null || bookmark.episodeNumber === null) return null;
					const [series, episode] = await Promise.all([
						getSeriesBrief(bookmark.seriesId),
						getEpisodeDetail(bookmark.seriesId, bookmark.seasonNumber, bookmark.episodeNumber),
					]);
					if (!series || !episode) return null;
					return {
						key: `ep-${bookmark.mediaId}`,
						href: `/media/episode/${bookmark.seriesId}/${bookmark.seasonNumber}/${bookmark.episodeNumber}`,
						title: `S${bookmark.seasonNumber} E${bookmark.episodeNumber} · ${episode.name}`,
						subtitle: series.name,
						imageUrl: tmdbPosterUrl(series.posterPath),
					};
				}
				const media = await getMediaDetailSafe(bookmark as UserBookmark & { mediaType: "movie" | "series" });
				if (!media) return null;
				return {
					key: `${bookmark.mediaType}-${bookmark.mediaId}`,
					href: `/media/${bookmark.mediaType}/${bookmark.mediaId}`,
					title: media.name,
					subtitle: media.year ? String(media.year) : "",
					imageUrl: tmdbPosterUrl(media.posterPath),
				};
			}),
		)
	).filter((item): item is FavoriteItem => item !== null);

	const stats = [
		{ label: "Movies watched", value: String(resolvedMovies.length) },
		{ label: "Episodes watched", value: String(resolvedEpisodes.length) },
		{
			label: "Estimated watch time",
			value: movieMinutes + episodeMinutes > 0 ? formatRuntime(movieMinutes + episodeMinutes) : "—",
		},
		{ label: "Ratings given", value: String(rated.length) },
	];

	return (
		<div className="flex flex-col gap-8">
			<section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				{stats.map((stat) => (
					<div key={stat.label} className="flex flex-col gap-1 rounded-lg border border-border bg-content1 p-4">
						<span className="text-3xl font-bold text-foreground">{stat.value}</span>
						<span className="text-sm text-muted">{stat.label}</span>
					</div>
				))}
			</section>

			<section className="flex flex-col gap-3">
				<h2 className="text-lg font-semibold text-foreground">Ratings</h2>
				<ul className="flex flex-col gap-1.5" aria-label="Ratings distribution">
					{[...ratingCounts.entries()].reverse().map(([step, count]) => (
						<li key={step} className="flex items-center gap-3 text-sm">
							<span className="w-10 shrink-0 text-right tabular-nums text-muted">★ {step}</span>
							<span className="h-4 flex-1 overflow-hidden rounded-sm bg-default">
								<span
									className="block h-full rounded-sm bg-primary"
									style={{ width: `${(count / maxRatingCount) * 100}%` }}
								/>
							</span>
							<span className="w-6 shrink-0 tabular-nums text-muted">{count}</span>
						</li>
					))}
				</ul>
			</section>

			<section className="flex flex-col gap-3">
				<h2 className="text-lg font-semibold text-foreground">Favorites</h2>
				{favoriteItems.length === 0 ? (
					<p className="text-sm text-muted">
						Nothing favorited yet — tap the heart on any title in your library.
					</p>
				) : (
					<ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
						{favoriteItems.map((item) => (
							<li key={item.key}>
								<Link href={item.href} className="group flex flex-col gap-2">
									<span className="block aspect-2/3 w-full overflow-hidden rounded-md border border-border bg-content2">
										{item.imageUrl ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img
												src={item.imageUrl}
												alt=""
												className="h-full w-full object-cover transition-transform group-hover:scale-105"
											/>
										) : null}
									</span>
									<span className="min-w-0">
										<span className="block truncate text-sm font-medium text-foreground group-hover:underline">
											{item.title}
										</span>
										{item.subtitle && <span className="block truncate text-xs text-muted">{item.subtitle}</span>}
									</span>
								</Link>
							</li>
						))}
					</ul>
				)}
			</section>

			{(resolvedMovies.length > 0 || resolvedEpisodes.length > 0) && (
				<section className="flex flex-col gap-3">
					<h2 className="text-lg font-semibold text-foreground">Recently completed</h2>
					<ul className="flex max-h-80 flex-col divide-y divide-divider overflow-y-auto rounded-md border border-border bg-content1">
						{resolvedMovies.map((movie) => (
							<li key={`m-${movie.mediaId}`} className="flex items-center justify-between gap-4 px-4 py-2 text-sm">
								<Link href={`/media/movie/${movie.mediaId}`} className="truncate font-medium text-foreground hover:underline">
									{movie.name}
								</Link>
								<span className="shrink-0 text-muted">
									{movie.year ?? ""} {movie.runtime !== null ? `· ${formatRuntime(movie.runtime)}` : ""}
								</span>
							</li>
						))}
						{resolvedEpisodes.map((episode) => (
							<li key={`e-${episode.mediaId}`} className="flex items-center justify-between gap-4 px-4 py-2 text-sm">
								<Link href={episode.href} className="truncate font-medium text-foreground hover:underline">
									{episode.label} · {episode.seriesName}
								</Link>
								<span className="shrink-0 text-muted">{episode.runtime !== null ? formatRuntime(episode.runtime) : ""}</span>
							</li>
						))}
					</ul>
				</section>
			)}
		</div>
	);
}

async function getMediaDetailSafe(bookmark: UserBookmark & { mediaType: "movie" | "series" }) {
	return getMediaDetail(bookmark.mediaType, bookmark.mediaId);
}

function StatsFallback() {
	return <p className="text-sm text-muted">Crunching your numbers…</p>;
}

export default function StatsPage() {
	return (
		<main className="flex flex-1 flex-col gap-6 p-8">
			<header className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold text-foreground">Your stats</h1>
				<p className="text-muted">What you&apos;ve watched, how long you&apos;ve watched it, and what you loved.</p>
			</header>
			<Suspense fallback={<StatsFallback />}>
				<StatsContent />
			</Suspense>
		</main>
	);
}
