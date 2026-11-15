"use client";

import Link from "next/link";
import { Logo } from "./logo";

const BROWSE_LINKS = [
	{ href: "/", label: "Home" },
	{ href: "/search", label: "Search" },
	{ href: "/dashboard", label: "Dashboard" },
	{ href: "/dashboard/library", label: "Library" },
	{ href: "/dashboard/notes", label: "Notes" },
] as const;

const GENRE_LINKS = [
	"Action",
	"Comedy",
	"Drama",
	"Horror",
	"Sci-Fi",
	"Thriller",
	"Romance",
	"Animation",
] as const;

const LINK_CLASS = "text-sm text-muted transition-colors duration-300 hover:text-foreground";
const HEADING_CLASS = "text-sm font-semibold uppercase tracking-widest text-foreground";

export function AppFooter() {
	return (
		<footer className="border-t border-border bg-elevated">
			<div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
				<div className="flex flex-col gap-3">
					<Logo />
					<p className="text-sm leading-relaxed text-muted">
						Your personal cinema archive. Track every movie, series, and episode — rate
						what you watch, keep notes on what mattered.
					</p>
				</div>
				<nav aria-label="Browse">
					<h3 className={HEADING_CLASS}>Browse</h3>
					<ul className="flex flex-col gap-2 pt-3">
						{BROWSE_LINKS.map((link) => (
							<li key={link.href}>
								<Link href={link.href} className={LINK_CLASS}>
									{link.label}
								</Link>
							</li>
						))}
					</ul>
				</nav>
				<nav aria-label="Genres">
					<h3 className={HEADING_CLASS}>Genres</h3>
					<ul className="grid grid-cols-2 gap-x-4 gap-y-2 pt-3">
						{GENRE_LINKS.map((genre) => (
							<li key={genre}>
								<Link href={`/search?q=${encodeURIComponent(genre)}`} className={LINK_CLASS}>
									{genre}
								</Link>
							</li>
						))}
					</ul>
				</nav>
				<div>
					<h3 className={HEADING_CLASS}>Your library</h3>
					<p className="pt-3 text-sm leading-relaxed text-muted">
						Private by default. Sign in to start a library, or import the history you already
						keep elsewhere.
					</p>
					<ul className="flex flex-col gap-2 pt-3">
						<li>
							<Link href="/search" className={LINK_CLASS}>
								Find something to watch
							</Link>
						</li>
						<li>
							<Link href="/dashboard/import" className={LINK_CLASS}>
								Import from Letterboxd or Trakt
							</Link>
						</li>
						<li>
							<Link href="/dashboard/settings" className={LINK_CLASS}>
								Manage your public profile
							</Link>
						</li>
					</ul>
				</div>
			</div>
			<div className="border-t border-border py-6">
				<p className="text-center text-xs text-muted">
					© <span suppressHydrationWarning>{new Date().getFullYear()}</span> Cast n Cue. All
					rights reserved.
				</p>
			</div>
		</footer>
	);
}
