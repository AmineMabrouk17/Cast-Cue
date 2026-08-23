import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getUserBySlug, listPublicBookmarks, type PublicBookmark, type PublicProfileUser } from "@/lib/profile";
import { getEpisodeDetail, getMediaSummary, getSeriesBrief, tmdbPosterUrl } from "@/lib/tmdb";
import { BOOKMARK_STATUS_LABELS } from "@/lib/bookmarks";

export const dynamic = "force-dynamic";

interface PublicLibraryItem {
	key: string;
	href: string;
	title: string;
	subtitle: string;
	imageUrl: string | null;
	status: PublicBookmark["status"];
	rating: number | null;
	favorite: boolean;
}

async function resolveItem(bookmark: PublicBookmark): Promise<PublicLibraryItem | null> {
	if (bookmark.mediaType === "episode") {
		if (bookmark.seriesId === null || bookmark.seasonNumber === null || bookmark.episodeNumber === null) {
			return null;
		}
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
			status: bookmark.status,
			rating: bookmark.rating,
			favorite: bookmark.favorite,
		};
	}
	const media = await getMediaSummary(bookmark.mediaType, bookmark.mediaId);
	if (!media) return null;
	return {
		key: `${bookmark.mediaType}-${bookmark.mediaId}`,
		href: `/media/${bookmark.mediaType}/${bookmark.mediaId}`,
		title: media.name,
		subtitle: media.year ? String(media.year) : "",
		imageUrl: tmdbPosterUrl(media.posterPath),
		status: bookmark.status,
		rating: bookmark.rating,
		favorite: bookmark.favorite,
	};
}

interface ProfilePageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
	const { slug } = await params;
	const user = await getUserBySlug(getCloudflareContext().env.DB, slug);
	if (!user) return { title: "Profile not found" };
	return {
		title: `${user.name} on Cast Cue`,
		description: `See what ${user.name} is watching.`,
	};
}

async function ProfileContent({ user }: { user: PublicProfileUser }) {
	const bookmarks = await listPublicBookmarks(getCloudflareContext().env.DB, user.id);
	const items = (
		await Promise.all(bookmarks.map((bookmark) => resolveItem(bookmark)))
	).filter((item): item is PublicLibraryItem => item !== null);

	return (
		<main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-8">
			<header className="flex items-center gap-4">
				{user.image ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={user.image} alt="" className="h-16 w-16 rounded-full border border-border object-cover" />
				) : (
					<span className="flex h-16 w-16 items-center justify-center rounded-full bg-content2 text-xl font-bold text-foreground">
						{user.name.slice(0, 1).toUpperCase()}
					</span>
				)}
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
					<p className="text-sm text-muted" aria-live="polite">
						{items.length} title{items.length === 1 ? "" : "s"} in their public library
					</p>
				</div>
			</header>

			{items.length === 0 ? (
				<p className="text-sm text-muted">Nothing shared yet.</p>
			) : (
				<ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					{items.map((item) => (
						<li key={item.key}>
							<Link href={item.href} className="group flex flex-col gap-2">
								<span className="block aspect-2/3 w-full overflow-hidden rounded-md border border-border bg-content2">
									{item.imageUrl ? (
										// eslint-disable-next-line @next/next/no-img-element
										<img src={item.imageUrl} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
									) : null}
								</span>
								<span className="min-w-0">
									<span className="block truncate text-sm font-medium text-foreground group-hover:underline">{item.title}</span>
									{item.subtitle && <span className="block truncate text-xs text-muted">{item.subtitle}</span>}
									<span className="mt-0.5 flex items-center gap-2 text-xs text-muted">
										<span>{BOOKMARK_STATUS_LABELS[item.status]}</span>
										{item.rating !== null && <span>★ {item.rating}</span>}
										{item.favorite && <span aria-label="Favorite">♥</span>}
									</span>
								</span>
							</Link>
						</li>
					))}
				</ul>
			)}
		</main>
	);
}

function ProfileFallback() {
	return <p className="p-8 text-sm text-muted">Loading profile…</p>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
	const { slug } = await params;
	const user = await getUserBySlug(getCloudflareContext().env.DB, slug);
	if (!user) notFound();
	return (
		<Suspense fallback={<ProfileFallback />}>
			<ProfileContent user={user} />
		</Suspense>
	);
}
