"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@heroui/react/button";
import { commitImportCsv, previewImportCsv, type ImportCommitResult, type ImportPreview } from "@/app/dashboard/import/actions";

type Phase = "idle" | "previewing" | "preview" | "importing" | "done" | "error";

export function ImportView() {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [phase, setPhase] = useState<Phase>("idle");
	const [fileName, setFileName] = useState<string | null>(null);
	const [csvText, setCsvText] = useState<string | null>(null);
	const [preview, setPreview] = useState<ImportPreview | null>(null);
	const [result, setResult] = useState<ImportCommitResult | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	function reset() {
		setPhase("idle");
		setFileName(null);
		setCsvText(null);
		setPreview(null);
		setResult(null);
		setErrorMessage(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}

	function onFileChosen(file: File | undefined) {
		if (!file) return;
		setFileName(file.name);
		const reader = new FileReader();
		reader.onload = () => {
			const text = String(reader.result ?? "");
			setCsvText(text);
			setPhase("previewing");
			startTransition(async () => {
				try {
					const nextPreview = await previewImportCsv(text);
					setPreview(nextPreview);
					setPhase("preview");
				} catch (error) {
					setErrorMessage(error instanceof Error ? error.message : "Could not read that file");
					setPhase("error");
				}
			});
		};
		reader.readAsText(file);
	}

	function onConfirmImport() {
		if (!csvText) return;
		setPhase("importing");
		startTransition(async () => {
			try {
				const commitResult = await commitImportCsv(csvText);
				setResult(commitResult);
				setPhase("done");
			} catch (error) {
				setErrorMessage(error instanceof Error ? error.message : "Import failed");
				setPhase("error");
			}
		});
	}

	if (phase === "done" && result) {
		return (
			<section className="flex flex-col gap-4 rounded-lg border border-border bg-content1 p-6">
				<h2 className="text-xl font-semibold text-foreground">Import complete</h2>
				<p className="text-muted">
					Imported <strong>{result.imported}</strong> titles.
					{result.alreadyInLibrary > 0 ? ` Skipped ${result.alreadyInLibrary} already in your library.` : ""}
					{result.failed > 0 ? ` ${result.failed} failed.` : ""}
				</p>
				<div className="flex gap-2">
					<Button onPress={reset}>Import another file</Button>
					<Button variant="ghost" onPress={() => (window.location.href = "/dashboard/library")}>
						Go to library
					</Button>
				</div>
			</section>
		);
	}

	return (
		<section className="flex flex-col gap-4 rounded-lg border border-border bg-content1 p-6">
			<div className="flex flex-col gap-2">
				<h2 className="text-lg font-semibold text-foreground">1. Choose a CSV export</h2>
				<p className="text-sm text-muted">
					Supported: Letterboxd <code className="text-foreground">watched.csv</code> and Trakt history exports
					with <code className="text-foreground">Movie</code>/<code className="text-foreground">Show</code>,
					year, rating, and optional season/episode columns. Rows that can&apos;t be matched to TMDB are
					reported, never silently dropped.
				</p>
				<label className="flex flex-col items-start gap-2">
					<span className="sr-only">Choose CSV file</span>
					<input
						ref={fileInputRef}
						type="file"
						accept=".csv,text/csv"
						onChange={(event) => onFileChosen(event.target.files?.[0])}
						className="text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-default file:px-4 file:py-2 file:text-sm file:font-medium file:text-default-fg"
					/>
				</label>
				{fileName && <p className="text-sm text-muted">File: {fileName}</p>}
			</div>

			{phase === "previewing" && <p aria-live="polite" className="text-sm text-muted">Matching rows against TMDB…</p>}
			{phase === "importing" && (
				<p aria-live="polite" className="text-sm text-muted">
					Importing {preview?.matched.length ?? 0} titles…
				</p>
			)}
			{(phase === "error" || errorMessage) && errorMessage && (
				<p role="alert" className="text-sm text-danger">
					{errorMessage}
				</p>
			)}

			{phase === "preview" && preview && (
				<>
					<div className="flex flex-col gap-2">
						<h2 className="text-lg font-semibold text-foreground">2. Preview</h2>
						<p className="text-sm text-muted" aria-live="polite">
							<strong className="text-success">{preview.matched.length}</strong> matched,{" "}
							<strong className={preview.unmatched.length > 0 ? "text-warning" : undefined}>
								{preview.unmatched.length}
							</strong>{" "}
							unmatched
							{preview.skippedCount > 0 ? `, ${preview.skippedCount} skipped` : ""}.
						</p>
					</div>

					<ul className="flex max-h-72 flex-col divide-y divide-divider overflow-y-auto rounded-md border border-border">
						{preview.matched.map((match) => (
							<li key={match.rowIndex} className="flex items-center justify-between gap-4 px-4 py-2 text-sm">
								<span className="min-w-0 truncate text-foreground">{match.title}</span>
								<span className="shrink-0 text-muted">
									{match.resolvedName}
									{match.resolvedYear ? ` (${match.resolvedYear})` : ""}
									{match.rating !== null ? ` · ★ ${match.rating}` : ""}
								</span>
							</li>
						))}
						{preview.unmatched.map((row) => (
							<li key={`u-${row.rowIndex}`} className="flex items-center justify-between gap-4 px-4 py-2 text-sm">
								<span className="min-w-0 truncate text-muted line-through">{row.title}</span>
								<span className="shrink-0 text-warning">{row.reason}</span>
							</li>
						))}
					</ul>

					<div className="flex gap-2">
						<Button isDisabled={isPending || preview.matched.length === 0} onPress={onConfirmImport}>
							Import {preview.matched.length} title{preview.matched.length === 1 ? "" : "s"}
						</Button>
						<Button variant="ghost" onPress={reset}>
							Cancel
						</Button>
					</div>
				</>
			)}
		</section>
	);
}
