"use client";

import { useEffect, useRef, useState } from "react";
import type { MediaType } from "@/lib/tmdb";
import { saveNote } from "@/app/media/actions";

const AUTOSAVE_DEBOUNCE_MS = 800;

type SaveStatus = "idle" | "saving" | "saved" | "error";

const SAVE_STATUS_LABELS: Partial<Record<SaveStatus, string>> = {
	saving: "Saving…",
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
	const noteRef = useRef(note);
	const savedRef = useRef(initialNote ?? "");
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const inFlightRef = useRef<Promise<void> | null>(null);
	const mountedRef = useRef(true);

	function clearTimer() {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	}

	function schedule(delay = AUTOSAVE_DEBOUNCE_MS) {
		clearTimer();
		timerRef.current = setTimeout(() => {
			timerRef.current = null;
			void flush();
		}, delay);
	}

	async function flush() {
		// One request at a time. A second save while this one is in flight would
		// let an older response land last and overwrite newer text.
		if (inFlightRef.current) return;

		const value = noteRef.current;
		if (value === savedRef.current) {
			if (mountedRef.current) setStatus("saved");
			return;
		}

		if (mountedRef.current) setStatus("saving");

		const request = (async () => {
			try {
				await saveNote(mediaType, mediaId, value);
				savedRef.current = value;
				if (!mountedRef.current) return;
				if (noteRef.current === value) {
					setStatus("saved");
					setError(null);
				} else {
					// Newer text arrived while this request was in flight. Keep the
					// saving state and queue the latest value; never flash "Saved".
					setStatus("saving");
					schedule();
				}
			} catch {
				if (mountedRef.current) {
					setStatus("error");
					setError("Couldn't save note. Try again.");
				}
			} finally {
				inFlightRef.current = null;
				if (mountedRef.current && noteRef.current !== savedRef.current && !timerRef.current) {
					schedule();
				}
			}
		})();

		inFlightRef.current = request;
		await request;
	}

	function handleChange(value: string) {
		noteRef.current = value;
		setNote(value);
		setError(null);

		if (value === savedRef.current) {
			clearTimer();
			setStatus("saved");
			return;
		}

		setStatus("saving");
		schedule();
	}

	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
			clearTimer();
			// Flush the last edit after the current request, never beside it.
			const latest = noteRef.current;
			if (latest === savedRef.current) return;
			const send = () => {
				void saveNote(mediaType, mediaId, latest).catch(() => {});
			};
			if (inFlightRef.current) {
				void inFlightRef.current.finally(send);
			} else {
				send();
			}
		};
	}, [mediaId, mediaType]);

	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex items-center gap-2">
				<span className="text-sm font-medium text-foreground">Notes</span>
				{SAVE_STATUS_LABELS[status] ? (
					<span
						className={`text-xs ${status === "error" ? "text-danger-soft-foreground" : "text-muted"}`}
						role={status === "saved" ? "status" : undefined}
						aria-live="polite"
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
			{error ? <p className="text-xs text-danger-soft-foreground">{error}</p> : null}
		</div>
	);
}
