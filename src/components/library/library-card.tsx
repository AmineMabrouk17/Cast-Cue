"use client";

import { useTransition, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { ListBox } from "@heroui/react/list-box";
import { Select } from "@heroui/react/select";
import { removeFromLibrary, setStatus, toggleFavorite } from "@/app/media/actions";
import { BOOKMARK_STATUS_LABELS, BOOKMARK_STATUSES, isBookmarkStatus, type BookmarkState } from "@/lib/bookmarks";
import { MEDIA_TYPE_LABELS, tmdbPosterUrl, type MediaSummary } from "@/lib/tmdb";

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

export function LibraryCard({
	media,
	bookmark,
	onBookmarkChange,
	onRemove,
}: {
	media: MediaSummary;
	bookmark: BookmarkState;
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
			<Link href={href} className="group block">
				<Card.Content className="relative aspect-[2/3] p-0">
					{poster ? (
						<Image
							src={poster}
							alt={media.name}
							fill
							sizes="(min-width: 1280px) 16.6vw, (min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
							className="object-cover transition-transform duration-300 group-hover:scale-105"
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center bg-default p-4 text-center text-sm text-muted">
							{media.name}
						</div>
					)}
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
				<div className="mt-auto flex items-center gap-1.5 pt-1">
					<Select.Root
						aria-label="Change status"
						selectedKey={bookmark.status}
						onSelectionChange={(key) => {
							if (typeof key === "string" && isBookmarkStatus(key)) {
								run(() => setStatus(media.type, media.id, key));
							}
						}}
						isDisabled={isPending}
						className="min-w-0 flex-1"
					>
						<Select.Trigger>
							<Select.Value />
							<Select.Indicator />
						</Select.Trigger>
						<Select.Popover>
							<ListBox>
								{BOOKMARK_STATUSES.map((status) => (
									<ListBox.Item key={status} id={status} textValue={BOOKMARK_STATUS_LABELS[status]}>
										{BOOKMARK_STATUS_LABELS[status]}
										<ListBox.ItemIndicator />
									</ListBox.Item>
								))}
							</ListBox>
						</Select.Popover>
					</Select.Root>
					<Button
						aria-label={bookmark.favorite ? "Remove from favorites" : "Add to favorites"}
						isIconOnly
						variant={bookmark.favorite ? "primary" : "tertiary"}
						size="sm"
						isDisabled={isPending}
						onPress={() => run(() => toggleFavorite(media.type, media.id))}
					>
						<HeartIcon filled={bookmark.favorite} />
					</Button>
					<Button
						aria-label="Remove from library"
						isIconOnly
						variant="tertiary"
						size="sm"
						isDisabled={isPending}
						onPress={handleRemove}
					>
						<TrashIcon />
					</Button>
				</div>
				{error ? <p className="text-xs text-danger">{error}</p> : null}
			</Card.Content>
		</Card>
	);
}
