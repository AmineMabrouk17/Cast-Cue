import { Suspense } from "react";
import { MediaGridSkeleton } from "@/components/media/media-grid-skeleton";
import { TrendingSection } from "@/components/media/trending-section";

export const dynamic = "force-dynamic";

export default function Home() {
	return (
		<main className="flex flex-1 flex-col gap-10 p-8">
			<header className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold text-foreground">Trending now</h1>
				<p className="text-muted">The most popular movies and series on TMDB this week.</p>
			</header>
			<Suspense fallback={<MediaGridSkeleton />}>
				<TrendingSection type="movie" />
			</Suspense>
			<Suspense fallback={<MediaGridSkeleton />}>
				<TrendingSection type="tv" />
			</Suspense>
		</main>
	);
}
