"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { ListBox } from "@heroui/react/list-box";
import { Label } from "@heroui/react/label";
import { Select } from "@heroui/react/select";
import {
	removeEpisodeFromLibrary,
	removeFromLibrary,
	setEpisodeStatus,
	setStatus,
	toggleEpisodeFavorite,
	toggleFavorite,
} from "@/app/media/actions";
import {
	BOOKMARK_STATUS_LABELS,
	BOOKMARK_STATUSES,
	isBookmarkStatus,
	type BookmarkState,
	type BookmarkStatus,
} from "@/lib/bookmarks";
import { MEDIA_TYPE_LABELS, tmdbPosterUrl, type MediaSummary } from "@/lib/tmdb";
import type { EpisodeLibraryItem, LibraryItem } from "./library-view";

function HeartIcon({ filled }: { filled: boolean }) {
	return (
		<svg
			viewBox="0 0 24 24"
			aria-hidden="true"
			className="h-4 w-4"
			fill={filled ? "currentColor" : "none"}
			stroke="currentColor"
			strokeWidth="2"
		>
			<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
		</svg>
	);
}

function TrashIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			aria-hidden="true"
			className="h-4 w-4"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		>
			<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" />
		</svg>
	);
}

function SelectionCheckbox({
	title,
	selected,
	onToggle,
}: {
	title: string;
	selected: boolean;
	onToggle: () => void;
}) {
	return (
		<div className="absolute right-2 top-2 z-10 rounded-md bg-background/80 p-1 backdrop-blur-sm">
			<input
				type="checkbox"
				checked={selected}
				onChange={onToggle}
				onClick={(event) => event.stopPropagation()}
				aria-label={`Select ${title}`}
				className="size-5 cursor-pointer accent-warning"
			/>
		</div>
	);
}

function PosterThumbnail({
	src,
	alt,
	type = "movie",
}: {
	src: string | null;
	alt: string;
	type?: "movie" | "series" | "episode";
}) {
	const [imageError, setImageError] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);

	if (!src || imageError) {
		return (
			<div className="flex size-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-surface to-elevated p-4 text-center text-muted">
				{type === "movie" ? (
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						className="size-8 text-muted/60"
					>
						<rect width="18" height="18" x="3" y="3" rx="2" />
						<path d="M7 3v18M17 3v18M3 7.5h4M3 12h18M3 16.5h4M17 7.5h4M17 16.5h4" />
					</svg>
				) : (
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						className="size-8 text-muted/60"
					>
						<rect width="20" height="15" x="2" y="7" rx="2" ry="2" />
						<polyline points="17 2 12 7 7 2" />
					</svg>
				)}
				<span className="line-clamp-2 text-xs font-medium">{alt}</span>
			</div>
		);
	}

	return (
		<div className="relative size-full overflow-hidden bg-elevated">
			{!isLoaded && <div className="absolute inset-0 animate-pulse bg-elevated" />}
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={src}
				alt={alt}
				loading="lazy"
				decoding="async"
				onLoad={() => setIsLoaded(true)}
				onError={() => setImageError(true)}
				className={`size-full object-cover transition-all duration-300 group-hover:scale-105 ${
					isLoaded ? "opacity-100" : "opacity-0"
				}`}
			/>
		</div>
	);
}

function CardActions({
	status,
	favorite,
	isPending,
	error,
	onChangeStatus,
	onToggleFavorite,
	onRemove,
}: {
	status: BookmarkStatus;
	favorite: boolean;
	isPending: boolean;
	error: string | null;
	onChangeStatus: (status: BookmarkStatus) => void;
	onToggleFavorite: () => void;
	onRemove: () => void;
}) {
	return (
		<div className="mt-auto flex flex-col gap-1.5 pt-1">
			<div className="flex items-center gap-1.5">
				{/* React Aria emits aria-labelledby on the trigger, which overrides
				    aria-label per the ARIA spec. A visually hidden Label joins the
				    labelledby list so the accessible name is "Change status …". */}
				<Select.Root
					selectedKey={status}
					onSelectionChange={(key) => {
						if (typeof key === "string" && isBookmarkStatus(key)) {
							onChangeStatus(key);
						}
					}}
					isDisabled={isPending}
					className="min-w-0 flex-1"
				>
					<Label className="sr-only">Change status</Label>
					<Select.Trigger>
						<Select.Value />
						<Select.Indicator />
					</Select.Trigger>
					<Select.Popover>
						<ListBox>
							{BOOKMARK_STATUSES.map((item) => (
								<ListBox.Item key={item} id={item} textValue={BOOKMARK_STATUS_LABELS[item]}>
									{BOOKMARK_STATUS_LABELS[item]}
									<ListBox.ItemIndicator />
								</ListBox.Item>
							))}
						</ListBox>
					</Select.Popover>
				</Select.Root>
				<Button
					aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
					isIconOnly
					variant={favorite ? "primary" : "tertiary"}
					size="sm"
					isDisabled={isPending}
					onPress={onToggleFavorite}
				>
					<HeartIcon filled={favorite} />
				</Button>
				<Button
					aria-label="Remove from library"
					isIconOnly
					variant="tertiary"
					size="sm"
					isDisabled={isPending}
					onPress={onRemove}
				>
					<TrashIcon />
				</Button>
			</div>
			{error ? <p className="text-xs text-danger">{error}</p> : null}
		</div>
	);
}

function TitleCard({
	media,
	bookmark,
	selectMode,
	selected,
	onToggleSelect,
	onBookmarkChange,
	onRemove,
}: {
	media: MediaSummary;
	bookmark: BookmarkState;
	selectMode: boolean;
	selected: boolean;
	onToggleSelect: () => void;
	onBookmarkChange: (bookmark: BookmarkState) => void;
	onRemove: () => void;
}) {
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);
	const poster = tmdbPosterUrl(media.posterPath, "w342");
	const href = `/media/${media.type}/${media.id}`;

	function run(action: () => Promise<BookmarkState>) {
		setError(null);
		startTransition(async () => {
			try {
				onBookmarkChange(await action());
			} catch {
				setError("Something went wrong. Try again.");
			}
		});
	}

	function handleRemove() {
		setError(null);
		startTransition(async () => {
			try {
				await removeFromLibrary(media.type, media.id);
				onRemove();
			} catch {
				setError("Couldn't remove from library.");
			}
		});
	}

	return (
		<Card variant="default" className="flex h-full flex-col overflow-hidden">
			<Link
				href={href}
				className="group block"
				onClick={(event) => {
					if (selectMode) {
						event.preventDefault();
						onToggleSelect();
					}
				}}
			>
				<Card.Content className="relative aspect-[2/3] p-0">
					{selectMode ? (
						<SelectionCheckbox title={media.name} selected={selected} onToggle={onToggleSelect} />
					) : null}
					<PosterThumbnail src={poster} alt={media.name} type={media.type} />
					{bookmark.favorite ? (
						<div className="absolute left-2 top-2 rounded-md bg-background/80 p-1 text-danger backdrop-blur-sm">
							<HeartIcon filled />
						</div>
					) : null}
				</Card.Content>
			</Link>
			<Card.Content className="flex flex-1 flex-col gap-2 p-3">
				<Link href={href} className="line-clamp-1 text-sm font-medium text-foreground hover:underline">
					{media.name}
				</Link>
				<span className="text-xs text-muted">
					{media.year ? `${media.year} · ` : ""}
					{MEDIA_TYPE_LABELS[media.type]}
				</span>
				<CardActions
					status={bookmark.status}
					favorite={bookmark.favorite}
					isPending={isPending}
					error={error}
					onChangeStatus={(status) => run(() => setStatus(media.type, media.id, status))}
					onToggleFavorite={() => run(() => toggleFavorite(media.type, media.id))}
					onRemove={handleRemove}
				/>
			</Card.Content>
		</Card>
	);
}

function EpisodeCard({
	item,
	selectMode,
	selected,
	onToggleSelect,
	onBookmarkChange,
	onRemove,
}: {
	item: EpisodeLibraryItem;
	selectMode: boolean;
	selected: boolean;
	onToggleSelect: () => void;
	onBookmarkChange: (bookmark: BookmarkState) => void;
	onRemove: () => void;
}) {
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	function run(action: () => Promise<BookmarkState>) {
		setError(null);
		startTransition(async () => {
			try {
				onBookmarkChange(await action());
			} catch {
				setError("Something went wrong. Try again.");
			}
		});
	}

	function handleRemove() {
		setError(null);
		startTransition(async () => {
			try {
				await removeEpisodeFromLibrary(item.key);
				onRemove();
			} catch {
				setError("Couldn't remove from library.");
			}
		});
	}

	return (
		<Card variant="default" className="flex h-full flex-col overflow-hidden">
			<Link
				href={item.href}
				className="group block"
				onClick={(event) => {
					if (selectMode) {
						event.preventDefault();
						onToggleSelect();
					}
				}}
			>
				<Card.Content className="relative aspect-[2/3] p-0">
					{selectMode ? (
						<SelectionCheckbox title={item.title} selected={selected} onToggle={onToggleSelect} />
					) : null}
					<PosterThumbnail src={item.imageUrl} alt={item.title} type="episode" />
					{item.bookmark.favorite ? (
						<div className="absolute left-2 top-2 rounded-md bg-background/80 p-1 text-danger backdrop-blur-sm">
							<HeartIcon filled />
						</div>
					) : null}
				</Card.Content>
			</Link>
			<Card.Content className="flex flex-1 flex-col gap-2 p-3">
				<Link href={item.href} className="line-clamp-1 text-sm font-medium text-foreground hover:underline">
					{item.title}
				</Link>
				{item.subtitle ? <span className="line-clamp-1 text-xs text-muted">{item.subtitle}</span> : null}
				<CardActions
					status={item.bookmark.status}
					favorite={item.bookmark.favorite}
					isPending={isPending}
					error={error}
					onChangeStatus={(status) => run(() => setEpisodeStatus(item.key, status))}
					onToggleFavorite={() => run(() => toggleEpisodeFavorite(item.key))}
					onRemove={handleRemove}
				/>
			</Card.Content>
		</Card>
	);
}

export function LibraryCard({
	item,
	selectMode,
	selected,
	onToggleSelect,
	onBookmarkChange,
	onRemove,
}: {
	item: LibraryItem;
	selectMode: boolean;
	selected: boolean;
	onToggleSelect: () => void;
	onBookmarkChange: (bookmark: BookmarkState) => void;
	onRemove: () => void;
}) {
	return item.kind === "episode" ? (
		<EpisodeCard
			item={item}
			selectMode={selectMode}
			selected={selected}
			onToggleSelect={onToggleSelect}
			onBookmarkChange={onBookmarkChange}
			onRemove={onRemove}
		/>
	) : (
		<TitleCard
			media={item.media}
			bookmark={item.bookmark}
			selectMode={selectMode}
			selected={selected}
			onToggleSelect={onToggleSelect}
			onBookmarkChange={onBookmarkChange}
			onRemove={onRemove}
		/>
	);
}
