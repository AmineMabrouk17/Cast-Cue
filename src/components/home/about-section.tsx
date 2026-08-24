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

const STATS = [
	{ value: "40K+", label: "Titles tracked" },
	{ value: "120+", label: "Genres explored" },
	{ value: "1M+", label: "Ratings given" },
];

export function AboutSection() {
	return (
		<section id="about" className="border-y border-border bg-elevated">
			<div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-start">
				<div className="flex flex-col gap-5">
					<div className="flex items-center gap-3">
						<span className="h-0.5 w-8 rounded-full bg-accent" aria-hidden />
						<span className="text-sm font-medium uppercase tracking-widest text-accent">
							About Cast n Cue
						</span>
					</div>
					<h2 className="text-3xl font-bold sm:text-4xl">Every story deserves a spotlight.</h2>
					<p className="max-w-xl text-sm leading-relaxed text-muted sm:text-base">
						Cast n Cue is your personal stage for everything you watch. Keep a running record of
						the movies, series, and episodes you finish, rate each one while the credits roll, and
						jot down the thoughts worth remembering. Your viewing history becomes a spotlighted
						shelf of stories — always ready for an encore.
					</p>
					<div className="grid grid-cols-3 gap-6 pt-4">
						{STATS.map((stat) => (
							<div key={stat.label}>
								<p className="font-display text-4xl font-bold text-accent sm:text-5xl">
									{stat.value}
								</p>
								<p className="text-sm text-muted">{stat.label}</p>
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
								className="rounded-full border border-border px-4 py-1.5 text-sm text-muted transition-colors duration-300 hover:border-accent hover:text-accent"
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
