import { Suspense } from "react";
import { Tabs } from "@heroui/react/tabs";
import { searchTmdb, type MediaSummary, type MediaType } from "@/lib/tmdb";
import { parseSeasonEpisodeNotation } from "@/lib/episode-notation";
import { searchEpisodeByNotation, type EpisodeSearchResult } from "@/lib/episode-search";
import { MediaGrid } from "@/components/media/media-grid";
import { MediaEmptyState } from "@/components/media/media-empty-state";
import { MediaGridSkeleton } from "@/components/media/media-grid-skeleton";
import { EpisodeSearchResults } from "@/components/media/episode-search-results";

export const dynamic = "force-dynamic";

const RESULT_GROUPS: { type: MediaType; label: string; emptyTitle: string }[] = [
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

	const [movies, series, episode] = await Promise.all([
		searchTmdb(searchQuery, "movie"),
		searchTmdb(searchQuery, "series"),
		notation ? searchEpisodeByNotation(query) : Promise.resolve(null),
	]);

	const groups: ResultGroup[] = [
		...(notation
			? [
					{
						type: "episode" as const,
						label: "Episodes",
						items: episode ? [episode] : [],
						emptyTitle: "No episodes found",
					},
				]
			: []),
		...RESULT_GROUPS.map((group) => ({
			...group,
			items: group.type === "movie" ? movies : series,
		})),
	];

	if (groups.every((group) => group.items.length === 0)) {
		return (
			<MediaEmptyState
				title="No results"
				message={`Nothing matched “${query}”. Try a different search.`}
			/>
		);
	}

	const defaultTab = groups.find((group) => group.items.length > 0)?.type ?? "movie";

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
						group.items.length > 0 ? (
							<EpisodeSearchResults results={group.items as EpisodeSearchResult[]} />
						) : (
							<MediaEmptyState
								title={group.emptyTitle}
								message={`No episode matched “${query}”.`}
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
						: "Find movies and series on TMDB, and episodes by season/episode notation."}
				</p>
			</header>
			{query ? (
				<Suspense fallback={<MediaGridSkeleton />}>
					<SearchResults query={query} />
				</Suspense>
			) : (
				<MediaEmptyState
					title="Search movies, series & episodes"
					message="Type in the search box above to find movies, series, and episodes."
				/>
			)}
		</main>
	);
}
