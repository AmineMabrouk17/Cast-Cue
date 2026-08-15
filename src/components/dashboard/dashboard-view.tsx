import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@heroui/styles";
import { getServerSession } from "@/lib/session";
import {
	getEpisodeBookmarksForSeason,
	listUserBookmarks,
	listUserBookmarksByStatus,
	type UserBookmark,
} from "@/lib/bookmarks";
import {
	getMediaSummary,
	getNextAiring,
	getSeasonEpisodes,
	getSeriesBrief,
	getSeriesSeasons,
	type MediaType,
} from "@/lib/tmdb";
import { MediaEmptyState } from "@/components/media/media-empty-state";
import { ContinueWatchingSection, type ContinueWatchingItem } from "./continue-watching";
import { UpNextSection, type UpNextItem } from "./up-next";
import { WatchlistRoulette, type RouletteCandidate } from "./watchlist-roulette";

const MAX_CONTINUE_ITEMS = 8;
const MAX_SEASONS_TO_CHECK = 4;
const MAX_UP_NEXT_SERIES = 25;
const MAX_UP_NEXT_RESULTS = 8;
const MAX_ROULETTE_POOL = 20;

function QuickLinks() {
	return (
		<nav className="flex flex-wrap items-center gap-2" aria-label="Dashboard shortcuts">
			<Link href="/dashboard/library" className={buttonVariants({ variant: "tertiary", size: "sm" })}>
				Library
			</Link>
			<Link href="/dashboard/notes" className={buttonVariants({ variant: "tertiary", size: "sm" })}>
				Notes
			</Link>
			<Link href="/search" className={buttonVariants({ variant: "tertiary", size: "sm" })}>
				Search
			</Link>
		</nav>
	);
}

function WelcomeHero({ name }: { name: string }) {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
			<h1 className="text-3xl font-bold">Welcome, {name}</h1>
			<p className="max-w-md text-muted">
				Start by searching for a movie, series, or episode. Bookmark it and it will land in your library.
			</p>
			<Link href="/search" className={buttonVariants({ variant: "primary", size: "md" })}>
				Find something to watch
			</Link>
			<QuickLinks />
		</div>
	);
}

async function resolveContinueMovie(mediaId: number): Promise<ContinueWatchingItem | null> {
	const media = await getMediaSummary("movie", mediaId);
	if (!media) return null;
	return {
		title: media.name,
		subtitle: `${media.year ? `${media.year} · ` : ""}Movie`,
		posterPath: media.posterPath,
		href: `/media/movie/${media.id}`,
	};
}

async function resolveContinueSeries(
	db: D1Database,
	userId: string,
	seriesId: number,
	episodeBookmarkCount: number,
): Promise<ContinueWatchingItem | null> {
	const brief = await getSeriesBrief(seriesId);
	if (!brief) return null;

	const seriesHref = `/media/series/${seriesId}`;
	if (episodeBookmarkCount === 0) {
		return { title: brief.name, subtitle: "Start watching", posterPath: brief.posterPath, href: seriesHref };
	}

	const seasons = (await getSeriesSeasons(seriesId))
		.filter((season) => season.episodeCount > 0 && season.seasonNumber >= 1)
		.sort((a, b) => a.seasonNumber - b.seasonNumber);

	let checked = 0;
	for (const season of seasons) {
		if (checked >= MAX_SEASONS_TO_CHECK) break;
		checked += 1;
		const [seasonData, bookmarks] = await Promise.all([
			getSeasonEpisodes(seriesId, season.seasonNumber),
			getEpisodeBookmarksForSeason(db, userId, seriesId, season.seasonNumber),
		]);
		const next = (seasonData?.episodes ?? []).find(
			(episode) => bookmarks.get(episode.id)?.status !== "completed",
		);
		if (next) {
			return {
				title: brief.name,
				subtitle: `Up next · S${next.seasonNumber}E${next.episodeNumber} · ${next.name}`,
				posterPath: brief.posterPath,
				href: `/media/episode/${seriesId}/${next.seasonNumber}/${next.episodeNumber}`,
			};
		}
	}

	return { title: brief.name, subtitle: "All caught up", posterPath: brief.posterPath, href: seriesHref };
}

function todayKey(): string {
	const now = new Date();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${now.getFullYear()}-${month}-${day}`;
}

function addDaysKey(key: string, days: number): string {
	const [year, month, day] = key.split("-").map(Number);
	const date = new Date(year, month - 1, day + days);
	const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
	const nextDay = String(date.getDate()).padStart(2, "0");
	return `${date.getFullYear()}-${nextMonth}-${nextDay}`;
}

function formatAirDate(airDate: string): string {
	const today = todayKey();
	if (airDate === today) return "Today";
	if (airDate === addDaysKey(today, 1)) return "Tomorrow";
	const [year, month, day] = airDate.split("-").map(Number);
	return new Date(year, month - 1, day).toLocaleDateString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
	});
}

async function resolveUpNext(seriesId: number): Promise<UpNextItem | null> {
	const airing = await getNextAiring(seriesId);
	if (!airing?.next) return null;
	const airDate = airing.next.airDate;
	if (airDate < todayKey()) return null;
	return {
		href: `/media/episode/${seriesId}/${airing.next.seasonNumber}/${airing.next.episodeNumber}`,
		title: airing.name,
		posterPath: airing.posterPath,
		episodeLabel: `S${airing.next.seasonNumber}E${airing.next.episodeNumber} · ${airing.next.name}`,
		dateLabel: formatAirDate(airDate),
		airDate,
	};
}

async function resolveRoulettePool(bookmarks: UserBookmark[]) {
	const pool = bookmarks.filter((bookmark) => bookmark.mediaType !== "episode").slice(0, MAX_ROULETTE_POOL);
	const resolved = await Promise.all(
		pool.map(async (bookmark) => {
			const media = await getMediaSummary(bookmark.mediaType as MediaType, bookmark.mediaId);
			return media
				? {
						title: media.name,
						href: `/media/${media.type}/${media.id}`,
						posterPath: media.posterPath,
						year: media.year,
					}
				: null;
		}),
	);
	return resolved.filter((candidate): candidate is RouletteCandidate => candidate !== null);
}

export async function DashboardView() {
	const session = await getServerSession();
	if (!session) redirect("/login");
	const db = getCloudflareContext().env.DB;
	const userId = session.user.id;

	const [watching, watchlist, all] = await Promise.all([
		listUserBookmarksByStatus(db, userId, "watching"),
		listUserBookmarksByStatus(db, userId, "watchlist"),
		listUserBookmarks(db, userId),
	]);

	if (all.length === 0) {
		return <WelcomeHero name={session.user.name} />;
	}

	const continueItems = (
		await Promise.all(
			watching.slice(0, MAX_CONTINUE_ITEMS).map(async (bookmark) => {
				if (bookmark.mediaType === "movie") {
					return resolveContinueMovie(bookmark.mediaId);
				}
				const episodeBookmarkCount = all.filter(
					(item) => item.mediaType === "episode" && item.seriesId === bookmark.mediaId,
				).length;
				return resolveContinueSeries(db, userId, bookmark.mediaId, episodeBookmarkCount);
			}),
		)
	).filter((item): item is ContinueWatchingItem => item !== null);

	const upNextItems = (
		await Promise.all(
			all
				.filter((bookmark) => bookmark.mediaType === "series" && bookmark.status !== "dropped")
				.slice(0, MAX_UP_NEXT_SERIES)
				.map((bookmark) => bookmark.mediaId)
				.map(resolveUpNext),
		)
	)
		.filter((item): item is UpNextItem => item !== null)
		.sort((a, b) => a.airDate.localeCompare(b.airDate))
		.slice(0, MAX_UP_NEXT_RESULTS);

	const roulettePool = await resolveRoulettePool(watchlist);

	return (
		<div className="flex flex-col gap-10">
			<header className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
				<p className="text-muted">Jump back in where you left off.</p>
			</header>
			<QuickLinks />
			{continueItems.length > 0 ? (
				<ContinueWatchingSection items={continueItems} />
			) : (
				<section className="flex flex-col gap-4">
					<h2 className="text-xl font-semibold text-foreground">Continue watching</h2>
					<MediaEmptyState
						title="Nothing in progress"
						message="Mark a bookmark as Watching and it will show up here."
					/>
				</section>
			)}
			{upNextItems.length > 0 ? <UpNextSection items={upNextItems} /> : null}
			{roulettePool.length > 0 ? <WatchlistRoulette pool={roulettePool} /> : null}
		</div>
	);
}
