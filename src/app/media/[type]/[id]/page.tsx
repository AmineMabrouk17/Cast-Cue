import { notFound } from "next/navigation";
import { getMediaDetail, type MediaType } from "@/lib/tmdb";
import { getOmdbScores } from "@/lib/omdb";
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
	const mediaId = Number.parseInt(id, 10);
	if (!Number.isInteger(mediaId)) {
		notFound();
	}

	const media = await getMediaDetail(type, mediaId);
	if (!media) {
		notFound();
	}

	const scores = await getOmdbScores(media.name, media.year, type);

	return <MediaDetailView media={media} scores={scores} />;
}
