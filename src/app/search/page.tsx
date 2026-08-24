import type { Metadata } from "next";
import { Suspense } from "react";
import { Tabs } from "@heroui/react/tabs";
import { searchTmdb, type MediaSummary, type MediaType } from "@/lib/tmdb";
import { parseSeasonEpisodeNotation } from "@/lib/episode-notation";
import {
	searchEpisodes,
	searchEpisodeByNotation,
	type EpisodeSearchOutcome,
	type EpisodeSearchResult,
} from "@/lib/episode-search";
import { MediaGrid } from "@/components/media/media-grid";
import { MediaEmptyState } from "@/components/media/media-empty-state";
import { MediaGridSkeleton } from "@/components/media/media-grid-skeleton";
import { EpisodeSearchResults } from "@/components/media/episode-search-results";
import { SearchBox } from "@/components/search-box";

export const dynamic = "force-dynamic";

export async function generateMetadata({
	searchParams,
}: {
	searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
	const { q } = await searchParams;
	const query = q?.trim() ?? "";
	const title = query ? `“${query}” search results` : "Search";
	const description = query
		? "Movies, series, and episodes matching your search."
		: "Find movies and series on TMDB, and episodes by name or season/episode notation.";
	return {
		title,
		description,
		openGraph: { title, description, type: "website" },
	};
}

const RESULT_GROUPS: {
	type: MediaType;
	label: string;
	emptyTitle: string;
}[] = [
	{ type: "movie", label: "Movies", emptyTitle: "No movies found" },
	{ type: "series", label: "Series", emptyTitle: "No series found" },
];

type ResultGroup = {
	type: MediaType | "episode";
	label: string;
	items: MediaSummary[] | EpisodeSearchResult[];
	emptyTitle: string;
};

async function SearchResults({ query }: { query: string }) {
	const notation = parseSeasonEpisodeNotation(query);
	const searchQuery = notation?.seriesName ?? query;

	const [movies, series, episodeSearch] = await Promise.all([
		searchTmdb(searchQuery, "movie"),
		searchTmdb(searchQuery, "series"),
		notation
			? searchEpisodeByNotation(query).then(
					(result): EpisodeSearchOutcome => ({
						results: result ? [result] : [],
						unavailable: false,
					}),
				)
			: searchEpisodes(query),
	]);
	const groups: ResultGroup[] = [
		...RESULT_GROUPS.map((group) => ({
			...group,
			items: group.type === "movie" ? movies : series,
		})),
		{
			type: "episode",
			label: "Episodes",
			items: episodeSearch.results,
			emptyTitle: "No episodes found",
		},
	];

	const nothingFound =
		!episodeSearch.unavailable && groups.every((group) => group.items.length === 0);
	if (nothingFound) {
		return (
			<MediaEmptyState
				title="No results"
				message={`Nothing matched “${query}”. Try a different search.`}
			/>
		);
	}

	const defaultTab =
		episodeSearch.results.length > 0
			? "episode"
			: (groups.find((group) => group.items.length > 0)?.type ?? "episode");

	return (
		<Tabs className="w-full" defaultSelectedKey={defaultTab}>
			<Tabs.ListContainer>
				<Tabs.List aria-label="Search results">
					{groups.map((group) => (
						<Tabs.Tab key={group.type} id={group.type}>
							{group.label} ({group.items.length})
							<Tabs.Indicator />
						</Tabs.Tab>
					))}
				</Tabs.List>
			</Tabs.ListContainer>
			{groups.map((group) => (
				<Tabs.Panel key={group.type} className="pt-6" id={group.type}>
					{group.type === "episode" ? (
						episodeSearch.unavailable ? (
							<MediaEmptyState
								title="Episode search unavailable"
								message="The episode lookup service could not be reached. Try again shortly."
							/>
						) : episodeSearch.results.length > 0 ? (
							<EpisodeSearchResults results={episodeSearch.results} />
						) : (
							<MediaEmptyState
								title={group.emptyTitle}
								message={`No episodes matched “${query}”.`}
							/>
						)
					) : group.items.length > 0 ? (
						<MediaGrid items={group.items as MediaSummary[]} />
					) : (
						<MediaEmptyState
							title={group.emptyTitle}
							message={`No ${group.label.toLowerCase()} matched “${searchQuery}”.`}
						/>
					)}
				</Tabs.Panel>
			))}
		</Tabs>
	);
}

export default async function SearchPage({
	searchParams,
}: {
	searchParams: Promise<{ q?: string }>;
}) {
	const { q } = await searchParams;
	const query = q?.trim() ?? "";

	return (
		<main className="flex flex-1 flex-col gap-6 p-8">
			<header className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold text-foreground">
					{query ? `Results for “${query}”` : "Search"}
				</h1>
				<p className="text-muted">
					{query
						? "Movies, series, and episodes matching your search."
						: "Find movies and series on TMDB, and episodes by name or season/episode notation."}
				</p>
			</header>
			{query ? (
				<>
					<Suspense fallback={null}>
						<SearchBox className="w-full max-w-xl" />
					</Suspense>
					<Suspense fallback={<MediaGridSkeleton />}>
						<SearchResults query={query} />
					</Suspense>
				</>
			) : (
				<div className="flex flex-col items-center gap-6 py-8">
					<MediaEmptyState
						title="Search movies, series & episodes"
						message="Type what you&apos;re looking for below to find movies, series, and episodes."
					/>
					<Suspense fallback={null}>
						<SearchBox className="w-full max-w-xl" />
					</Suspense>
				</div>
			)}
		</main>
	);
}
