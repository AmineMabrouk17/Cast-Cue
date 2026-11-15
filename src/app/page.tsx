import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/home/landing-page";
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
		<LandingPage
			slides={slides}
			trendingMovies={trendingMovies}
			trendingSeries={trendingSeries}
		/>
	);
}
