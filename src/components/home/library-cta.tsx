import Link from "next/link";

export function LibraryCta() {
	return (
		<section className="bg-cream text-background">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
				<div className="flex max-w-2xl flex-col gap-4">
					<h2 className="max-w-[18ch] text-4xl leading-[1.05] sm:text-5xl">
						Your watchlist is a memory, not a chore.
					</h2>
					<p className="max-w-lg text-sm leading-relaxed text-background/70">
						Start with one title. Keep the exact episode, the half-star, and the note. Come back in a
						month and it is still there.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<Link
						href="/login"
						className="inline-flex min-h-11 items-center rounded-lg bg-background px-6 text-sm font-semibold text-cream transition-colors hover:bg-[color-mix(in_oklab,var(--background)_88%,white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
					>
						Start tracking
					</Link>
					<Link
						href="/search"
						className="inline-flex min-h-11 items-center rounded-lg border border-background/25 px-6 text-sm font-semibold text-background transition-colors hover:bg-background/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
					>
						Search a title
					</Link>
				</div>
			</div>
		</section>
	);
}
