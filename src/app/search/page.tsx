import { Suspense } from "react";
import { Tabs } from "@heroui/react/tabs";
import { searchTmdb, type MediaType } from "@/lib/tmdb";
import { MediaGrid } from "@/components/media/media-grid";
import { MediaEmptyState } from "@/components/media/media-empty-state";
import { MediaGridSkeleton } from "@/components/media/media-grid-skeleton";

export const dynamic = "force-dynamic";

const RESULT_GROUPS: { type: MediaType; label: string; emptyTitle: string }[] = [
	{ type: "movie", label: "Movies", emptyTitle: "No movies found" },
	{ type: "series", label: "Series", emptyTitle: "No series found" },
];

async function SearchResults({ query }: { query: string }) {
	const [movies, series] = await Promise.all([
		searchTmdb(query, "movie"),
		searchTmdb(query, "series"),
	]);
	const groups = RESULT_GROUPS.map((group) => ({
		...group,
		items: group.type === "movie" ? movies : series,
	}));

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
					{group.items.length > 0 ? (
						<MediaGrid items={group.items} />
					) : (
						<MediaEmptyState
							title={group.emptyTitle}
							message={`No ${group.label.toLowerCase()} matched “${query}”.`}
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
						? "Movies and series matching your search on TMDB."
						: "Find movies and series on TMDB."}
				</p>
			</header>
			{query ? (
				<Suspense fallback={<MediaGridSkeleton />}>
					<SearchResults query={query} />
				</Suspense>
			) : (
				<MediaEmptyState
					title="Search movies & series"
					message="Type in the search box above to find movies and series."
				/>
			)}
		</main>
	);
}
