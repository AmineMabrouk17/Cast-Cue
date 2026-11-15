import Link from "next/link";
import { formatRuntime, type HeroSlide } from "@/lib/hero";
import { tmdbPosterUrl } from "@/lib/tmdb";

function LockIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-4">
			<rect x="4" y="11" width="16" height="10" rx="2" />
			<path d="M8 11V7a4 4 0 0 1 8 0v4" />
		</svg>
	);
}

function BookmarkIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-4">
			<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
		</svg>
	);
}

function ImportIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-4">
			<path d="M12 3v12" />
			<path d="m7 10 5 5 5-5" />
			<path d="M5 21h14" />
		</svg>
	);
}

export function EditorialHero({ slide }: { slide: HeroSlide | null }) {
	const poster = tmdbPosterUrl(slide?.posterPath ?? null, "w342");
	const runtime = formatRuntime(slide?.runtime ?? null);

	return (
		<section className="relative overflow-hidden border-b border-border">
			{slide?.backdropUrl ? (
				<div aria-hidden="true" className="absolute inset-0">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={slide.backdropUrl}
						alt=""
						width={1280}
						height={720}
						className="size-full object-cover opacity-25"
					/>
					<div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
					<div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/70" />
				</div>
			) : null}

			<div className="relative mx-auto grid w-full max-w-7xl gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pb-24 lg:pt-20">
				<div className="flex max-w-2xl flex-col gap-6">
					<span aria-hidden="true" className="h-0.5 w-12 rounded-full bg-accent" />
					<h1 className="max-w-[11ch] text-5xl leading-[0.95] text-foreground sm:text-6xl lg:text-7xl">
						Never lose your place.
					</h1>
					<p className="max-w-lg text-base leading-relaxed text-muted">
						Track the exact episode you stopped on, rate what you finish, and keep the note
						you will want to read again. Your watchlist stays yours.
					</p>
					<div className="flex flex-wrap items-center gap-3">
						<Link
							href="/login"
							className="inline-flex min-h-11 items-center rounded-lg bg-accent px-6 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
						>
							Start tracking
						</Link>
						<Link
							href="/search"
							className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface/40 px-6 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:border-accent/60 hover:bg-accent-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
						>
							Search a title
						</Link>
					</div>
					<ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
						<li className="inline-flex items-center gap-1.5"><BookmarkIcon /> Episode-level progress</li>
						<li className="inline-flex items-center gap-1.5"><LockIcon /> Private by default</li>
						<li className="inline-flex items-center gap-1.5"><ImportIcon /> Import from Letterboxd or Trakt</li>
					</ul>
				</div>

				<div className="relative mx-auto w-full max-w-md lg:max-w-none">
					<div aria-hidden="true" className="absolute -right-4 top-6 hidden h-full w-full rounded-2xl border border-border bg-elevated/50 lg:block" />
					<Link
						href={slide?.href ?? "/search"}
						className="group relative block overflow-hidden rounded-2xl border border-border bg-surface p-3 shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
					>
						<div className="relative aspect-[16/10] overflow-hidden rounded-xl">
							{slide?.backdropUrl ? (
								<>
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src={slide.backdropUrl}
										alt=""
										width={1280}
										height={720}
										className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
								</>
							) : (
								<div className="flex size-full items-end bg-elevated p-4">
									<p className="text-sm text-muted">The catalogue is quiet right now.</p>
								</div>
							)}
							{slide ? (
								<div className="absolute inset-x-3 bottom-3 flex items-end gap-3">
									{poster ? (
										/* eslint-disable-next-line @next/next/no-img-element */
										<img
											src={poster}
											alt=""
											width={72}
											height={108}
											className="h-24 w-16 rounded-lg border border-white/15 object-cover shadow-lg"
										/>
									) : null}
									<div className="flex min-w-0 flex-col gap-0.5 pb-0.5">
										<p className="text-xs text-cream/80">Featured title</p>
										<p className="line-clamp-1 font-display text-xl leading-tight text-cream">{slide.name}</p>
										<p className="text-xs text-cream/70">
											{[slide.year, runtime, slide.type === "movie" ? "Movie" : "Series"].filter(Boolean).join(" · ")}
										</p>
									</div>
								</div>
							) : null}
						</div>

						<div className="mt-3 rounded-xl border border-border bg-elevated p-4">
							<div className="flex items-center justify-between gap-3">
								<p className="text-[11px] uppercase tracking-[0.18em] text-muted">A library, after a week</p>
								<span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
									<LockIcon /> Private
								</span>
							</div>
							<div className="mt-3 flex items-center gap-3">
								{poster ? (
									/* eslint-disable-next-line @next/next/no-img-element */
									<img src={poster} alt="" width={56} height={84} className="h-20 w-14 rounded-md border border-border object-cover" />
								) : (
									<div className="flex h-20 w-14 items-center justify-center rounded-md border border-border bg-surface text-[10px] text-muted">—</div>
								)}
								<div className="min-w-0 flex-1">
									<p className="text-sm font-medium text-foreground">{slide?.name ?? "Your first title"}</p>
									<p className="text-xs text-muted">S2E4 · The Long Way Around</p>
									<div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border">
										<span className="block h-full w-[62%] rounded-full bg-gold" />
									</div>
									<p className="mt-1 text-[11px] text-muted">38 minutes left</p>
								</div>
							</div>
							<p className="mt-3 text-xs leading-relaxed text-muted">
								The dashboard answers the only question that matters at 10pm: where was I?
							</p>
						</div>
					</Link>
				</div>
			</div>
		</section>
	);
}
