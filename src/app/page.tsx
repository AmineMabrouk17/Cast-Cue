import { Suspense } from "react";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/sign-in-button";
import { MediaGridSkeleton } from "@/components/media/media-grid-skeleton";
import { TrendingSection } from "@/components/media/trending-section";
import { getServerSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Home() {
	const session = await getServerSession();
	if (session) redirect("/dashboard");

	return (
		<main className="flex flex-1 flex-col gap-10 p-8">
			<header className="flex flex-col items-center gap-4 pt-4 text-center">
				<h1 className="text-4xl font-bold">Cast n Cue</h1>
				<p className="text-muted">Track the movies, series, and episodes you watch.</p>
				<SignInButton />
			</header>
			<section className="flex flex-col gap-6">
				<header className="flex flex-col gap-1">
					<h2 className="text-2xl font-bold text-foreground">Trending now</h2>
					<p className="text-muted">The most popular movies and series on TMDB this week.</p>
				</header>
				<Suspense fallback={<MediaGridSkeleton />}>
					<TrendingSection type="movie" />
				</Suspense>
				<Suspense fallback={<MediaGridSkeleton />}>
					<TrendingSection type="series" />
				</Suspense>
			</section>
		</main>
	);
}
