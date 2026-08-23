"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@heroui/react/button";
import { Tabs } from "@heroui/react/tabs";
import {
	bulkRemoveFromLibrary,
	bulkSetFavorite,
	bulkSetStatus,
	type BulkActionResult,
	type BulkLibraryItem,
} from "@/app/media/actions";
import {
	BOOKMARK_STATUSES,
	BOOKMARK_STATUS_LABELS,
	isBookmarkStatus,
	type BookmarkState,
	type BookmarkStatus,
	type EpisodeBookmarkKey,
} from "@/lib/bookmarks";
import type { MediaSummary } from "@/lib/tmdb";
import { MEDIA_GRID_CLASS } from "@/components/media/media-grid";
import { MediaEmptyState } from "@/components/media/media-empty-state";
import { LibraryCard } from "./library-card";

export interface TitleLibraryItem {
	kind: "title";
	media: MediaSummary;
	bookmark: BookmarkState;
}

export interface EpisodeLibraryItem {
	kind: "episode";
	key: EpisodeBookmarkKey;
	href: string;
	title: string;
	subtitle: string;
	imageUrl: string | null;
	bookmark: BookmarkState;
}

export type LibraryItem = TitleLibraryItem | EpisodeLibraryItem;

export type LibraryTab = "all" | BookmarkStatus | "favorites";

const TABS: { id: LibraryTab; label: string }[] = [
	{ id: "all", label: "All" },
	...BOOKMARK_STATUSES.map((status) => ({ id: status as LibraryTab, label: BOOKMARK_STATUS_LABELS[status] })),
	{ id: "favorites", label: "Favorites" },
];

const EMPTY_STATES: Record<LibraryTab, { title: string; message: string }> = {
	all: {
		title: "Your library is empty",
		message: "Bookmark movies, series, and episodes to start tracking them here.",
	},
	watchlist: {
		title: "Nothing on your watchlist",
		message: "Change a bookmark's status to Watchlist to keep it here.",
	},
	watching: {
		title: "Nothing in progress",
		message: "Change a bookmark's status to Watching to keep it here.",
	},
	completed: {
		title: "Nothing completed",
		message: "Change a bookmark's status to Completed to keep it here.",
	},
	dropped: {
		title: "Nothing dropped",
		message: "Change a bookmark's status to Dropped to keep it here.",
	},
	favorites: {
		title: "No favorites yet",
		message: "Tap the heart on any bookmarked media or episode to mark it as a favorite.",
	},
};

function isLibraryTab(value: unknown): value is LibraryTab {
	if (value === "all" || value === "favorites") return true;
	return typeof value === "string" && isBookmarkStatus(value);
}

function filterItems(items: LibraryItem[], tab: LibraryTab): LibraryItem[] {
	if (tab === "all") return items;
	if (tab === "favorites") return items.filter((item) => item.bookmark.favorite);
	return items.filter((item) => item.bookmark.status === tab);
}

export function itemId(item: LibraryItem): string {
	return item.kind === "episode" ? item.href : `${item.media.type}-${item.media.id}`;
}

function toBulkItem(item: LibraryItem): BulkLibraryItem {
	return item.kind === "episode"
		? { id: itemId(item), kind: "episode", key: item.key }
		: { id: itemId(item), kind: "title", mediaType: item.media.type, mediaId: item.media.id };
}

export function LibraryView({ initialItems }: { initialItems: LibraryItem[] }) {
	const [items, setItems] = useState(initialItems);
	const [selectedKey, setSelectedKey] = useState<LibraryTab>("all");
	const [selectMode, setSelectMode] = useState(false);
	const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());
	const [isPending, startTransition] = useTransition();
	const [actionError, setActionError] = useState<string | null>(null);

	const counts = useMemo(() => {
		const count: Record<LibraryTab, number> = {
			all: items.length,
			watchlist: 0,
			watching: 0,
			completed: 0,
			dropped: 0,
			favorites: 0,
		};
		for (const item of items) {
			count[item.bookmark.status] += 1;
			if (item.bookmark.favorite) count.favorites += 1;
		}
		return count;
	}, [items]);

	function updateBookmark(target: LibraryItem, bookmark: BookmarkState) {
		setItems((prev) => prev.map((item) => (item === target ? { ...item, bookmark } : item)));
	}

	function removeItem(target: LibraryItem) {
		setItems((prev) => prev.filter((item) => item !== target));
	}

	function toggleSelected(id: string) {
		setActionError(null);
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	}

	function exitSelectMode() {
		setSelectMode(false);
		setSelectedIds(new Set());
		setActionError(null);
	}

	function selectedBulkItems(): BulkLibraryItem[] {
		return items.filter((item) => selectedIds.has(itemId(item))).map(toBulkItem);
	}

	function applyBulkResults(results: BulkActionResult[]) {
		setItems((prev) =>
			prev.map((item) => {
				const result = results.find((entry) => entry.id === itemId(item));
				return result && result.bookmark ? { ...item, bookmark: result.bookmark } : item;
			}),
		);
		setSelectedIds(new Set());
	}

	function runBulk(action: () => Promise<BulkActionResult[]>) {
		setActionError(null);
		startTransition(async () => {
			try {
				applyBulkResults(await action());
			} catch {
				setActionError("Something went wrong. Try again.");
			}
		});
	}

	function runBulkRemove() {
		setActionError(null);
		startTransition(async () => {
			try {
				const removed = new Set(await bulkRemoveFromLibrary(selectedBulkItems()));
				setItems((prev) => prev.filter((item) => !removed.has(itemId(item))));
				setSelectedIds(new Set());
			} catch {
				setActionError("Couldn't remove items. Try again.");
			}
		});
	}

	const filtered = filterItems(items, selectedKey);
	const empty = EMPTY_STATES[selectedKey];

	return (
		<Tabs
			className="w-full"
			selectedKey={selectedKey}
			onSelectionChange={(key) => {
				if (isLibraryTab(key)) setSelectedKey(key);
			}}
		>
			<Tabs.ListContainer>
				<Tabs.List aria-label="Library filters">
					{TABS.map((tab) => (
						<Tabs.Tab key={tab.id} id={tab.id}>
							{tab.label} ({counts[tab.id]})
							<Tabs.Indicator />
						</Tabs.Tab>
					))}
				</Tabs.List>
			</Tabs.ListContainer>
			<Tabs.Panel id={selectedKey} className="flex flex-col gap-4 pt-6">
				{filtered.length > 0 ? (
					<>
						<div className="flex flex-wrap items-center gap-2">
							<Button
								size="sm"
								variant={selectMode ? "primary" : "tertiary"}
								onPress={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
							>
								{selectMode ? "Cancel selection" : "Select"}
							</Button>
							{selectMode && selectedIds.size > 0 ? (
								<>
									<span className="text-sm text-muted" aria-live="polite">
										{selectedIds.size} selected
									</span>
									<span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
									{BOOKMARK_STATUSES.map((status) => (
										<Button
											key={status}
											size="sm"
											variant="tertiary"
											isDisabled={isPending}
											onPress={() => runBulk(() => bulkSetStatus(selectedBulkItems(), status))}
										>
											{BOOKMARK_STATUS_LABELS[status]}
										</Button>
									))}
									<Button
										size="sm"
										variant="tertiary"
										isDisabled={isPending}
										onPress={() => runBulk(() => bulkSetFavorite(selectedBulkItems(), true))}
									>
										Favorite
									</Button>
									<Button
										size="sm"
										variant="tertiary"
										isDisabled={isPending}
										onPress={() => runBulk(() => bulkSetFavorite(selectedBulkItems(), false))}
									>
										Unfavorite
									</Button>
									<Button
										size="sm"
										variant="danger"
										isDisabled={isPending}
										onPress={runBulkRemove}
									>
										Remove
									</Button>
									<Button size="sm" variant="tertiary" isDisabled={isPending} onPress={() => setSelectedIds(new Set())}>
										Clear
									</Button>
								</>
							) : null}
						</div>
						{actionError ? <p className="text-xs text-danger">{actionError}</p> : null}
						<div className={MEDIA_GRID_CLASS}>
							{filtered.map((item) => (
								<LibraryCard
									key={itemId(item)}
									item={item}
									selectMode={selectMode}
									selected={selectedIds.has(itemId(item))}
									onToggleSelect={() => toggleSelected(itemId(item))}
									onBookmarkChange={(bookmark) => updateBookmark(item, bookmark)}
									onRemove={() => removeItem(item)}
								/>
							))}
						</div>
					</>
				) : (
					<MediaEmptyState title={empty.title} message={empty.message} />
				)}
			</Tabs.Panel>
		</Tabs>
	);
}
