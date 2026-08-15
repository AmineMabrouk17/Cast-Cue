"use client";

import { useEffect, useRef, useState } from "react";
import type { MediaType } from "@/lib/tmdb";
import { saveNote } from "@/app/media/actions";

const AUTOSAVE_DEBOUNCE_MS = 800;

type SaveStatus = "idle" | "saving" | "saved" | "error";

const SAVE_STATUS_LABELS: Partial<Record<SaveStatus, string>> = {
	saving: "Saving...",
	saved: "Saved",
};

export function NotesEditor({
	mediaType,
	mediaId,
	initialNote,
}: {
	mediaType: MediaType;
	mediaId: number;
	initialNote: string | null;
}) {
	const [note, setNote] = useState(initialNote ?? "");
	const [status, setStatus] = useState<SaveStatus>("idle");
	const [error, setError] = useState<string | null>(null);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const noteRef = useRef(note);

	noteRef.current = note;

	function handleChange(value: string) {
		setNote(value);
		setError(null);
		setStatus("saving");
		if (timerRef.current) {
			clearTimeout(timerRef.current);
		}
		timerRef.current = setTimeout(() => {
			void persist(noteRef.current);
		}, AUTOSAVE_DEBOUNCE_MS);
	}

	async function persist(value: string) {
		try {
			await saveNote(mediaType, mediaId, value);
			setStatus("saved");
			setError(null);
		} catch {
			setStatus("error");
			setError("Couldn't save note. Try again.");
		}
	}

	useEffect(() => {
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				void saveNote(mediaType, mediaId, noteRef.current).catch(() => {});
			}
		};
	}, [mediaId, mediaType]);

	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex items-center gap-2">
				<span className="text-sm font-medium text-foreground">Notes</span>
				{SAVE_STATUS_LABELS[status] ? (
					<span
						className={`text-xs ${status === "error" ? "text-danger" : "text-muted"}`}
						role={status === "saved" ? "status" : undefined}
					>
						{SAVE_STATUS_LABELS[status]}
					</span>
				) : null}
			</div>
			<textarea
				value={note}
				onChange={(event) => handleChange(event.target.value)}
				placeholder="Write a private note..."
				rows={3}
				className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
			/>
			{error ? <p className="text-xs text-danger">{error}</p> : null}
		</div>
	);
}
