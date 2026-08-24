import Link from "next/link";

export function Logo() {
	return (
		<Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Cast n Cue home">
			<span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent-soft">
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					fill="currentColor"
					className="ml-0.5 size-3 text-accent"
				>
					<path d="M6 4l14 8-14 8z" />
				</svg>
			</span>
			<span className="font-display text-lg font-bold tracking-tight">
				<span className="text-foreground">Cast n </span>
				<span className="text-accent">Cue</span>
			</span>
		</Link>
	);
}
