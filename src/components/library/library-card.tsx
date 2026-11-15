"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@heroui/react/button";
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

function StatusMenu({
	status,
	isPending,
	onChangeStatus,
}: {
	status: BookmarkStatus;
	isPending: boolean;
	onChangeStatus: (status: BookmarkStatus) => void;
}) {
	const detailsRef = useRef<HTMLDetailsElement>(null);

	function choose(next: BookmarkStatus) {
		detailsRef.current?.removeAttribute("open");
		onChangeStatus(next);
	}

	return (
		<details ref={detailsRef} className="relative min-w-0 flex-1">
			<summary className="flex min-h-9 cursor-pointer list-none items-center justify-between gap-2 rounded-md border border-border bg-surface px-2 text-xs font-medium text-foreground transition-colors hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent [&::-webkit-details-marker]:hidden">
				<span className="truncate">{BOOKMARK_STATUS_LABELS[status]}</span>
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					className="size-3 shrink-0 text-muted"
				>
					<path d="m6 9 6 6 6-6" />
				</svg>
			</summary>
			<div
				role="menu"
				aria-label="Change status"
				className="absolute left-0 right-0 z-30 mt-1 flex flex-col rounded-md border border-border bg-surface p-1 shadow-lg"
			>
				{BOOKMARK_STATUSES.map((option) => (
					<button
						key={option}
						type="button"
						role="menuitem"
						disabled={isPending}
						onClick={() => choose(option)}
						className={`rounded px-2 py-2 text-left text-xs transition-colors hover:bg-accent-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
							option === status ? "font-semibold text-accent-soft-foreground" : "text-foreground"
						}`}
					>
						{BOOKMARK_STATUS_LABELS[option]}
					</button>
				))}
			</div>
		</details>
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
				<StatusMenu
					status={status}
					isPending={isPending}
					onChangeStatus={onChangeStatus}
				/>
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
		<div className="group relative flex h-full flex-col overflow-visible rounded-xl border border-border bg-surface shadow-sm transition-all duration-300 hover:border-accent/40 hover:shadow-md">
			<Link
				href={href}
				className="block"
				onClick={(event) => {
					if (selectMode) {
						event.preventDefault();
						onToggleSelect();
					}
				}}
			>
				<div className="relative aspect-[2/3] w-full overflow-hidden rounded-t-xl bg-elevated">
					{selectMode ? (
						<SelectionCheckbox title={media.name} selected={selected} onToggle={onToggleSelect} />
					) : null}
					<PosterThumbnail src={poster} alt={media.name} type={media.type} />
					{bookmark.favorite ? (
						<div className="absolute left-2 top-2 z-10 rounded-md bg-black/70 p-1 text-danger backdrop-blur-sm">
							<HeartIcon filled />
						</div>
					) : null}
				</div>
			</Link>
			<div className="flex flex-1 flex-col justify-between gap-2 p-3">
				<div className="flex flex-col gap-0.5">
					<Link
						href={href}
						className="line-clamp-1 text-sm font-medium text-foreground transition-colors hover:text-accent"
						title={media.name}
					>
						{media.name}
					</Link>
					<span className="text-xs text-muted">
						{media.year ? `${media.year} · ` : ""}
						{MEDIA_TYPE_LABELS[media.type]}
					</span>
				</div>
				<CardActions
					status={bookmark.status}
					favorite={bookmark.favorite}
					isPending={isPending}
					error={error}
					onChangeStatus={(status) => run(() => setStatus(media.type, media.id, status))}
					onToggleFavorite={() => run(() => toggleFavorite(media.type, media.id))}
					onRemove={handleRemove}
				/>
			</div>
		</div>
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
		<div className="group relative flex h-full flex-col overflow-visible rounded-xl border border-border bg-surface shadow-sm transition-all duration-300 hover:border-accent/40 hover:shadow-md">
			<Link
				href={item.href}
				className="block"
				onClick={(event) => {
					if (selectMode) {
						event.preventDefault();
						onToggleSelect();
					}
				}}
			>
				<div className="relative aspect-[2/3] w-full overflow-hidden rounded-t-xl bg-elevated">
					{selectMode ? (
						<SelectionCheckbox title={item.title} selected={selected} onToggle={onToggleSelect} />
					) : null}
					<PosterThumbnail src={item.imageUrl} alt={item.title} type="episode" />
					{item.bookmark.favorite ? (
						<div className="absolute left-2 top-2 z-10 rounded-md bg-black/70 p-1 text-danger backdrop-blur-sm">
							<HeartIcon filled />
						</div>
					) : null}
				</div>
			</Link>
			<div className="flex flex-1 flex-col justify-between gap-2 p-3">
				<div className="flex flex-col gap-0.5">
					<Link
						href={item.href}
						className="line-clamp-1 text-sm font-medium text-foreground transition-colors hover:text-accent"
						title={item.title}
					>
						{item.title}
					</Link>
					{item.subtitle ? (
						<span className="line-clamp-1 text-xs text-muted" title={item.subtitle}>
							{item.subtitle}
						</span>
					) : null}
				</div>
				<CardActions
					status={item.bookmark.status}
					favorite={item.bookmark.favorite}
					isPending={isPending}
					error={error}
					onChangeStatus={(status) => run(() => setEpisodeStatus(item.key, status))}
					onToggleFavorite={() => run(() => toggleEpisodeFavorite(item.key))}
					onRemove={handleRemove}
				/>
			</div>
		</div>
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