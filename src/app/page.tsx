import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AboutSection } from "@/components/home/about-section";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { MediaEmptyState } from "@/components/media/media-empty-state";
import { MediaGrid } from "@/components/media/media-grid";
import { SectionHeader } from "@/components/shared/section-header";
import { getHeroSlides, getTrendingWithDetails } from "@/lib/hero";
import { getServerSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Cast n Cue — Track everything you watch",
	description:
		"Track the movies, series, and episodes you watch. Rate every title, keep notes, and never lose your place in a story.",
	openGraph: {
		title: "Cast n Cue — Track everything you watch",
		description:
			"Track the movies, series, and episodes you watch. Rate every title, keep notes, and never lose your place in a story.",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Cast n Cue — Track everything you watch",
		description:
			"Track the movies, series, and episodes you watch. Rate every title, keep notes, and never lose your place in a story.",
	},
};

export default async function Home() {
	const session = await getServerSession();
	if (session) redirect("/dashboard");

	const [slides, trendingMovies, trendingSeries] = await Promise.all([
		getHeroSlides(),
		getTrendingWithDetails("movie", 12),
		getTrendingWithDetails("series", 12),
	]);

	return (
		<main className="flex flex-1 flex-col">
			<HeroCarousel slides={slides} />
			<section
				id="trending"
				className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 py-16 sm:px-6"
			>
				<div className="flex flex-col gap-6">
					<SectionHeader eyebrow="Trending Now" title="Movies everyone is watching" />
					{trendingMovies.length > 0 ? (
						<MediaGrid items={trendingMovies} />
					) : (
						<MediaEmptyState
							title="Nothing to show"
							message="Trending titles are unavailable right now."
						/>
					)}
				</div>
				<div className="flex flex-col gap-6">
					<SectionHeader eyebrow="Just Added" title="Series worth bingeing" />
					{trendingSeries.length > 0 ? (
						<MediaGrid items={trendingSeries} />
					) : (
						<MediaEmptyState
							title="Nothing to show"
							message="Trending titles are unavailable right now."
						/>
					)}
				</div>
			</section>
			<AboutSection />
		</main>
	);
}
