import Link from "next/link";

const BROWSE_GENRES = [
	"Action",
	"Comedy",
	"Drama",
	"Horror",
	"Sci-Fi",
	"Thriller",
	"Romance",
	"Animation",
	"Documentary",
	"Fantasy",
	"Mystery",
	"Crime",
];

const FACTS = [
	{ value: "3", label: "Levels of tracking: movie, series, episode" },
	{ value: "½", label: "Star precision on every rating" },
	{ value: "0", label: "Public posts you did not ask for" },
];

export function AboutSection() {
	return (
		<section id="about" className="border-y border-border bg-elevated">
			<div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-start">
				<div className="flex flex-col gap-5">
					<h2 className="max-w-[16ch] text-3xl font-bold leading-tight sm:text-4xl">The library remembers so you don&apos;t have to.</h2>
					<p className="max-w-xl text-sm leading-relaxed text-muted sm:text-base">
						Cast n Cue keeps the exact place you stopped, the half-star you gave it, and the note
						you wrote while the credits rolled. No feed, no public scores, no one else&apos;s taste.
					</p>
					<div className="grid grid-cols-3 gap-6 pt-4">
						{FACTS.map((fact) => (
							<div key={fact.label}>
								<p className="font-display text-4xl font-bold text-accent sm:text-5xl">
									{fact.value}
								</p>
								<p className="text-sm leading-snug text-muted">{fact.label}</p>
							</div>
						))}
					</div>
				</div>
				<div>
					<h2 className="font-display text-xl font-semibold">Browse by genre</h2>
					<div id="genres" className="flex flex-wrap gap-2 pt-3">
						{BROWSE_GENRES.map((genre) => (
							<Link
								key={genre}
								href={`/search?q=${encodeURIComponent(genre)}`}
								className="rounded-full border border-border px-4 py-1.5 text-sm text-muted transition-colors duration-300 hover:border-accent hover:text-accent-text"
							>
								{genre}
							</Link>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
