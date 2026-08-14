"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { Button } from "@heroui/react/button";
import { buttonVariants } from "@heroui/styles";
import { BOOKMARK_STATUS_LABELS, BOOKMARK_STATUSES, type BookmarkState } from "@/lib/bookmarks";
import type { MediaType } from "@/lib/tmdb";
import { addToLibrary, setStatus, toggleFavorite } from "@/app/media/actions";
import { RatingWidget } from "./rating-widget";
import { NotesEditor } from "./notes-editor";

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

export function BookmarkPanel({
	mediaType,
	mediaId,
	initialBookmark,
	isSignedIn,
}: {
	mediaType: MediaType;
	mediaId: number;
	initialBookmark: BookmarkState | null;
	isSignedIn: boolean;
}) {
	const [isPending, startTransition] = useTransition();
	const [bookmark, setBookmark] = useState<BookmarkState | null>(initialBookmark);
	const [error, setError] = useState<string | null>(null);

	function run(action: () => Promise<BookmarkState>) {
		setError(null);
		startTransition(async () => {
			try {
				const next = await action();
				setBookmark(next);
			} catch {
				setError("Something went wrong. Try again.");
			}
		});
	}

	if (!isSignedIn) {
		return (
			<Link href="/login" className={buttonVariants({ variant: "tertiary", size: "sm" })}>
				Sign in to add to your library
			</Link>
		);
	}

	if (!bookmark) {
		return (
			<div className="flex flex-col items-start gap-2">
				<Button
					variant="primary"
					size="sm"
					isDisabled={isPending}
					onPress={() => run(() => addToLibrary(mediaType, mediaId))}
				>
					Add to Library
				</Button>
				{error ? <p className="text-xs text-danger">{error}</p> : null}
			</div>
		);
	}

	return (
		<div className="flex flex-col items-start gap-4">
			<div className="flex flex-wrap items-center gap-2">
				<Button
					aria-label={bookmark.favorite ? "Remove from favorites" : "Add to favorites"}
					isIconOnly
					variant={bookmark.favorite ? "primary" : "tertiary"}
					size="sm"
					isDisabled={isPending}
					onPress={() => run(() => toggleFavorite(mediaType, mediaId))}
				>
					<HeartIcon filled={bookmark.favorite} />
				</Button>
				{BOOKMARK_STATUSES.map((status) => (
					<Button
						key={status}
						variant={bookmark.status === status ? "primary" : "tertiary"}
						size="sm"
						isDisabled={isPending}
						onPress={() => run(() => setStatus(mediaType, mediaId, status))}
					>
						{BOOKMARK_STATUS_LABELS[status]}
					</Button>
				))}
			</div>
			<RatingWidget mediaType={mediaType} mediaId={mediaId} value={bookmark.rating} />
			<NotesEditor mediaType={mediaType} mediaId={mediaId} initialNote={bookmark.note} />
			{error ? <p className="text-xs text-danger">{error}</p> : null}
		</div>
	);
}
