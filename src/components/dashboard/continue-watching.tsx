import Image from "next/image";
import Link from "next/link";
import { Card } from "@heroui/react/card";
import { tmdbPosterUrl } from "@/lib/tmdb";

export interface ContinueWatchingItem {
	title: string;
	subtitle: string;
	posterPath: string | null;
	href: string;
}

function ContinueWatchingCard({ item }: { item: ContinueWatchingItem }) {
	const poster = tmdbPosterUrl(item.posterPath, "w154");

	return (
		<Link href={item.href} className="group block">
			<Card variant="default" className="h-full overflow-hidden">
				<Card.Content className="flex items-center gap-3 p-3">
					<div className="relative aspect-[2/3] w-20 shrink-0 overflow-hidden rounded-md">
						{poster ? (
							<Image
								src={poster}
								alt={item.title}
								fill
								sizes="80px"
								className="object-cover transition-transform duration-300 group-hover:scale-105"
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center bg-default p-2 text-center text-xs text-muted">
								{item.title}
							</div>
						)}
					</div>
					<div className="flex min-w-0 flex-col gap-1">
						<span className="line-clamp-1 text-sm font-medium text-foreground">{item.title}</span>
						<span className="line-clamp-2 text-xs text-muted">{item.subtitle}</span>
					</div>
				</Card.Content>
			</Card>
		</Link>
	);
}

export function ContinueWatchingSection({ items }: { items: ContinueWatchingItem[] }) {
	return (
		<section className="flex flex-col gap-4">
			<h2 className="text-xl font-semibold text-foreground">Continue watching</h2>
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				{items.map((item) => (
					<ContinueWatchingCard key={item.href} item={item} />
				))}
			</div>
		</section>
	);
}
