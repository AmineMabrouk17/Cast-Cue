import Image from "next/image";
import Link from "next/link";
import { Card } from "@heroui/react/card";
import { tmdbPosterUrl, type MediaSummary } from "@/lib/tmdb";

const TYPE_LABEL = {
	movie: "Movie",
	tv: "Series",
} as const;

export function MediaCard({ media }: { media: MediaSummary }) {
	const poster = tmdbPosterUrl(media.posterPath, "w342");

	return (
		<Link href={`/media/${media.type}/${media.id}`} className="group block">
			<Card variant="default" className="h-full overflow-hidden">
				<Card.Content className="relative aspect-[2/3] p-0">
					{poster ? (
						<Image
							src={poster}
							alt={media.title}
							fill
							sizes="(min-width: 1280px) 16.6vw, (min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
							className="object-cover transition-transform duration-300 group-hover:scale-105"
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center bg-default p-4 text-center text-sm text-muted">
							{media.title}
						</div>
					)}
					<div className="absolute right-2 top-2 rounded-md bg-background/80 px-2 py-0.5 text-xs font-semibold text-foreground backdrop-blur-sm">
						{media.voteAverage.toFixed(1)}
					</div>
				</Card.Content>
				<Card.Content className="flex flex-col gap-1 p-3">
					<span className="line-clamp-1 text-sm font-medium text-foreground">
						{media.title}
					</span>
					<span className="text-xs text-muted">
						{media.year ? `${media.year} · ` : ""}
						{TYPE_LABEL[media.type]}
					</span>
				</Card.Content>
			</Card>
		</Link>
	);
}
