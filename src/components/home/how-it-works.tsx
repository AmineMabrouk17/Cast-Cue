const STEPS = [
	{
		title: "Search a title",
		body: "Movies, series, and episodes from TMDB. Type S2E4 when you already know the stop.",
		artifact: "S2E4",
	},
	{
		title: "Bookmark the episode",
		body: "One status, a half-star rating, a private note. No public profile unless you ask for one.",
		artifact: "Watching",
	},
	{
		title: "Return to the thread",
		body: "The dashboard names the next unwatched episode, not the season you started in.",
		artifact: "Up next",
	},
];

export function HowItWorks() {
	return (
		<section className="border-y border-border bg-elevated/60">
			<div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.85fr_2.15fr] lg:gap-16">
				<div className="flex flex-col gap-3">
					<h2 className="max-w-[12ch] text-3xl leading-tight sm:text-4xl">
						Three moves, one quiet library.
					</h2>
					<p className="max-w-sm text-sm leading-relaxed text-muted">
						No feed, no scores to chase, no one else&apos;s taste. Just the next thing you meant to
						watch and the place you left it.
					</p>
				</div>
				<ol className="grid gap-6 sm:grid-cols-3">
					{STEPS.map((step, index) => (
						<li key={step.title} className="flex flex-col gap-3 border-t border-border pt-4">
							<div className="flex items-baseline justify-between gap-3">
								<span className="font-display text-3xl text-accent-text">0{index + 1}</span>
								<span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
									{step.artifact}
								</span>
							</div>
							<h3 className="text-base font-semibold text-foreground">{step.title}</h3>
							<p className="text-sm leading-relaxed text-muted">{step.body}</p>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}
