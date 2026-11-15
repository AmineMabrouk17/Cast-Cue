import { AboutSection } from "@/components/home/about-section";
import { EditorialHero } from "@/components/home/editorial-hero";
import { MediaEmptyState } from "@/components/media/media-empty-state";
import { MediaGrid } from "@/components/media/media-grid";
import { SectionHeader } from "@/components/shared/section-header";
import type { HeroSlide, TrendingWithDetails } from "@/lib/hero";

export function LandingPage({
	slides,
	trendingMovies,
	trendingSeries,
}: {
	slides: HeroSlide[];
	trendingMovies: TrendingWithDetails[];
	trendingSeries: TrendingWithDetails[];
}) {
	return (
		<main className="flex flex-1 flex-col">
			<EditorialHero slide={slides[0] ?? null} />
			<section
				id="trending"
				className="mx-auto flex w-full max-w-7xl scroll-mt-24 flex-col gap-16 px-4 py-16 sm:px-6"
			>
				<div className="flex flex-col gap-6">
					<SectionHeader title="Trending movies this week" />
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
					<SectionHeader title="Trending series this week" />
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
