import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Not found",
	description: "That title is not in the catalogue. Search for something else.",
};

export default function NotFound() {
	return (
		<main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-5 px-4 py-24 text-center sm:px-6">
			<p className="text-sm font-medium uppercase tracking-widest text-muted">404</p>
			<h1 className="text-3xl font-bold text-foreground sm:text-4xl">
				This one is not in the catalogue.
			</h1>
			<p className="max-w-md text-sm leading-relaxed text-muted">
				The title may have moved, the link may be wrong, or the metadata provider may be
				unavailable right now.
			</p>
			<div className="flex flex-wrap items-center justify-center gap-3">
				<Link
					href="/search"
					className="inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
				>
					Search the catalogue
				</Link>
				<Link
					href="/"
					className="inline-flex items-center rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
				>
					Back home
				</Link>
			</div>
		</main>
	);
}
