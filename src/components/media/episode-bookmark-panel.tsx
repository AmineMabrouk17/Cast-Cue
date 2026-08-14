"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@heroui/react/button";
import { buttonVariants } from "@heroui/styles";
import { BOOKMARK_STATUS_LABELS, BOOKMARK_STATUSES, type BookmarkState } from "@/lib/bookmarks";
import {
	addEpisodeToLibrary,
	setEpisodeNote,
	setEpisodeRating,
	setEpisodeStatus,
	toggleEpisodeFavorite,
	type EpisodeBookmarkKey,
} from "@/app/media/actions";

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

function StarIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
			<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
		</svg>
	);
}

function StarSlot({
	index,
	rating,
	disabled,
	onSelect,
}: {
	index: number;
	rating: number | null;
	disabled: boolean;
	onSelect: (value: number | null) => void;
}) {
	const value = rating ?? 0;
	const fill = Math.max(0, Math.min(1, value - (index - 1)));

	return (
		<button
			type="button"
			disabled={disabled}
			aria-label={`Rate ${index} star${index === 1 ? "" : "s"}`}
			onPointerDown={(event) => {
				const rect = event.currentTarget.getBoundingClientRect();
				const leftHalf = event.clientX < rect.left + rect.width / 2;
				const next = leftHalf ? index - 0.5 : index;
				onSelect(value === next ? null : next);
			}}
			className="relative h-5 w-5 shrink-0"
		>
			<StarIcon className="pointer-events-none absolute inset-0 h-full w-full text-default" />
			<span
				className="pointer-events-none absolute inset-0 overflow-hidden"
				style={{ width: `${fill * 100}%` }}
			>
				<StarIcon className="h-5 w-5 text-warning" />
			</span>
		</button>
	);
}

function NotesEditor({
	initialNote,
	episodeKey,
	onError,
}: {
	initialNote: string | null;
	episodeKey: EpisodeBookmarkKey;
	onError: (error: string | null) => void;
}) {
	const [value, setValue] = useState(initialNote ?? "");
	const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
	const savedRef = useRef(initialNote ?? "");

	useEffect(() => {
		if (value === savedRef.current) {
			setStatus("idle");
			return;
		}
		setStatus("saving");
		const timeout = setTimeout(async () => {
			try {
				const next = await setEpisodeNote(episodeKey, value);
				savedRef.current = next.note ?? "";
				setStatus("saved");
				onError(null);
			} catch {
				onError("Could not save your note. Try again.");
				setStatus("idle");
			}
		}, 700);
		return () => clearTimeout(timeout);
	}, [value, episodeKey, onError]);

	return (
		<div className="flex w-full max-w-lg flex-col gap-1">
			<label htmlFor="episode-note" className="text-sm font-medium text-foreground">
				Note
			</label>
			<textarea
				id="episode-note"
				value={value}
				onChange={(event) => setValue(event.target.value)}
				rows={3}
				maxLength={2000}
				placeholder="Your private notes about this episode…"
				className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary"
			/>
			<p className="text-xs text-muted" aria-live="polite">
				{status === "saving" ? "Saving…" : status === "saved" ? "Saved" : ""}
			</p>
		</div>
	);
}

export function EpisodeBookmarkPanel({
	episodeKey,
	initialBookmark,
	isSignedIn,
}: {
	episodeKey: EpisodeBookmarkKey;
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
					onPress={() => run(() => addEpisodeToLibrary(episodeKey))}
				>
					Add to Library
				</Button>
				{error ? <p className="text-xs text-danger">{error}</p> : null}
			</div>
		);
	}

	return (
		<div className="flex flex-col items-start gap-3">
			<div className="flex flex-wrap items-center gap-2">
				<Button
					aria-label={bookmark.favorite ? "Remove from favorites" : "Add to favorites"}
					isIconOnly
					variant={bookmark.favorite ? "primary" : "tertiary"}
					size="sm"
					isDisabled={isPending}
					onPress={() => run(() => toggleEpisodeFavorite(episodeKey))}
				>
					<HeartIcon filled={bookmark.favorite} />
				</Button>
				{BOOKMARK_STATUSES.map((status) => (
					<Button
						key={status}
						variant={bookmark.status === status ? "primary" : "tertiary"}
						size="sm"
						isDisabled={isPending}
						onPress={() => run(() => setEpisodeStatus(episodeKey, status))}
					>
						{BOOKMARK_STATUS_LABELS[status]}
					</Button>
				))}
			</div>

			<div className="flex items-center gap-2">
				<div className="flex items-center gap-0.5" role="group" aria-label="Star rating">
					{[1, 2, 3, 4, 5].map((index) => (
						<StarSlot
							key={index}
							index={index}
							rating={bookmark.rating}
							disabled={isPending}
							onSelect={(value) => run(() => setEpisodeRating(episodeKey, value))}
						/>
					))}
				</div>
				{bookmark.rating !== null ? (
					<span className="text-sm font-semibold text-foreground">{bookmark.rating.toFixed(1)}</span>
				) : (
					<span className="text-xs text-muted">Tap a star to rate</span>
				)}
			</div>

			<NotesEditor initialNote={bookmark.note} episodeKey={episodeKey} onError={setError} />

			{error ? <p className="text-xs text-danger">{error}</p> : null}
		</div>
	);
}
