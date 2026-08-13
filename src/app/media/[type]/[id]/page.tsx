import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import { getMediaDetail, type MediaType } from "@/lib/tmdb";
import { getOmdbRatings } from "@/lib/omdb";
import { getBookmark } from "@/lib/bookmarks";
import { getServerSession } from "@/lib/session";
import { MediaDetailView } from "@/components/media/media-detail";

export const dynamic = "force-dynamic";

function isMediaType(value: string): value is MediaType {
	return value === "movie" || value === "series";
}

export default async function MediaDetailPage({
	params,
}: {
	params: Promise<{ type: string; id: string }>;
}) {
	const { type, id } = await params;
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

	return <MediaDetailView media={media} ratings={ratings} bookmark={bookmark} isSignedIn={isSignedIn} />;
}
