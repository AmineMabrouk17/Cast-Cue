"use client";

import { useMemo, useState } from "react";
import { Tabs } from "@heroui/react/tabs";
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

export function LibraryView({ initialItems }: { initialItems: LibraryItem[] }) {
	const [items, setItems] = useState(initialItems);
	const [selectedKey, setSelectedKey] = useState<LibraryTab>("all");

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
			<Tabs.Panel className="pt-6">
				{filtered.length > 0 ? (
					<div className={MEDIA_GRID_CLASS}>
						{filtered.map((item) => (
							<LibraryCard
								key={item.kind === "episode" ? item.href : `${item.media.type}-${item.media.id}`}
								item={item}
								onBookmarkChange={(bookmark) => updateBookmark(item, bookmark)}
								onRemove={() => removeItem(item)}
							/>
						))}
					</div>
				) : (
					<MediaEmptyState title={empty.title} message={empty.message} />
				)}
			</Tabs.Panel>
		</Tabs>
	);
}
