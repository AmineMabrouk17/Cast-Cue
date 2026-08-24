import type { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import { getMediaDetail, type MediaType } from "@/lib/tmdb";
import { getOmdbRatings } from "@/lib/omdb";
import { getBookmark } from "@/lib/bookmarks";
import { getServerSession } from "@/lib/session";
import { MediaDetailView } from "@/components/media/media-detail";
import { EpisodeGuide } from "@/components/media/episode-guide";

export const dynamic = "force-dynamic";

function isMediaType(value: string): value is MediaType {
	return value === "movie" || value === "series";
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ type: string; id: string }>;
}): Promise<Metadata> {
	const { type, id } = await params;
	if (!isMediaType(type)) {
		return { title: "Not found" };
	}
	const mediaId = Number(id);
	if (!Number.isSafeInteger(mediaId) || mediaId <= 0) {
		return { title: "Not found" };
	}
	const media = await getMediaDetail(type, mediaId);
	if (!media) {
		return { title: "Not found" };
	}
	const title = `${media.name}${media.year ? ` (${media.year})` : ""}`;
	const description = media.overview.slice(0, 160) || `Details about ${media.name}.`;
	return {
		title,
		description,
		openGraph: {
			title,
			description,
			type: type === "movie" ? "video.movie" : "video.tv_show",
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
		},
	};
}

export default async function MediaDetailPage({
	params,
	searchParams,
}: {
	params: Promise<{ type: string; id: string }>;
	searchParams: Promise<{ season?: string }>;
}) {
	const { type, id } = await params;
	const { season } = await searchParams;
	if (!isMediaType(type)) {
		notFound();
	}
	const mediaId = Number(id);
	if (!Number.isSafeInteger(mediaId) || mediaId <= 0) {
		notFound();
	}

	const media = await getMediaDetail(type, mediaId);
	if (!media) {
		notFound();
	}

	const ratings = await getOmdbRatings(media.name, media.year, type);

	const session = await getServerSession();
	const isSignedIn = Boolean(session);
	const bookmark = session
		? await getBookmark(getCloudflareContext().env.DB, session.user.id, type, mediaId)
		: null;

	return (
		<div className="flex flex-1 flex-col">
			<MediaDetailView media={media} ratings={ratings} bookmark={bookmark} isSignedIn={isSignedIn} />
			{type === "series" ? (
				<EpisodeGuide
					seriesId={mediaId}
					seriesName={media.name}
					seriesYear={media.year}
					requestedSeason={season}
					userId={session?.user.id ?? null}
				/>
			) : null}
		</div>
	);
}
