import { AboutSection } from "@/components/home/about-section";
import { EditorialHero } from "@/components/home/editorial-hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { LibraryCta } from "@/components/home/library-cta";
import { MediaEmptyState } from "@/components/media/media-empty-state";
import { MediaGrid } from "@/components/media/media-grid";
import { SectionHeader } from "@/components/shared/section-header";
import type { HeroSlide, TrendingWithDetails } from "@/lib/hero";

function toLandingCard(item: TrendingWithDetails) {
	return {
		id: item.id,
		type: item.type,
		name: item.name,
		overview: item.overview,
		posterPath: item.posterPath,
		backdropPath: item.backdropPath,
		voteAverage: item.voteAverage,
		year: item.year,
		runtime: item.runtime,
	};
}

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
			<HowItWorks />
			<section
				id="trending"
				className="mx-auto flex w-full max-w-7xl scroll-mt-24 flex-col gap-16 px-4 py-16 sm:px-6"
			>
				<div className="flex flex-col gap-6">
					<SectionHeader
						title="In the room tonight"
						description="Movies trending on TMDB this week, cut to one row."
						action={{ href: "/search", label: "Browse all" }}
					/>
					{trendingMovies.length > 0 ? (
						<MediaGrid items={trendingMovies.slice(0, 6).map(toLandingCard)} />
					) : (
						<MediaEmptyState
							title="The projector is quiet"
							message="Trending titles are unavailable right now."
							action={{ label: "Search a title", href: "/search" }}
						/>
					)}
				</div>
				<div className="flex flex-col gap-6">
					<SectionHeader
						title="Series to stay with"
						description="Long-form shows, one episode at a time."
						action={{ href: "/search", label: "Browse all" }}
					/>
					{trendingSeries.length > 0 ? (
						<MediaGrid items={trendingSeries.slice(0, 6).map(toLandingCard)} />
					) : (
						<MediaEmptyState
							title="The projector is quiet"
							message="Trending titles are unavailable right now."
							action={{ label: "Search a title", href: "/search" }}
						/>
					)}
				</div>
			</section>
			<AboutSection />
			<LibraryCta />
		</main>
	);
}
