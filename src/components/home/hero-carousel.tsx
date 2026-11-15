"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatRuntime, type HeroSlide } from "@/lib/hero";

const AUTO_ADVANCE_MS = 7000;

function StarIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" className="size-4 text-gold" aria-hidden>
			<path d="M12 2l2.9 6.26 6.85.72-5.12 4.55 1.47 6.72L12 16.77 5.9 20.25l1.47-6.72L2.25 8.98l6.85-.72L12 2z" />
		</svg>
	);
}

function CalendarIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-4"
			aria-hidden
		>
			<rect x="3" y="4" width="18" height="17" rx="2" />
			<path d="M16 2v4M8 2v4M3 10h18" />
		</svg>
	);
}

function ClockIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-4"
			aria-hidden
		>
			<circle cx="12" cy="12" r="10" />
			<path d="M12 6v6l4 2" />
		</svg>
	);
}

function PlayIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
			<path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.29-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14z" />
		</svg>
	);
}

function InfoIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-4"
			aria-hidden
		>
			<circle cx="12" cy="12" r="10" />
			<path d="M12 16v-4M12 8h.01" />
		</svg>
	);
}

function PauseIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
			<path d="M7 5h4v14H7zM13 5h4v14h-4z" />
		</svg>
	);
}

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
	const [activeIndex, setActiveIndex] = useState(0);
	const [isPaused, setIsPaused] = useState(false);
	const [isHovering, setIsHovering] = useState(false);

	useEffect(() => {
		if (slides.length <= 1) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setIsPaused(true);
			return;
		}

		let hidden = document.hidden;
		const handleVisibility = () => {
			hidden = document.hidden;
		};
		document.addEventListener("visibilitychange", handleVisibility);

		const interval = window.setInterval(() => {
			setActiveIndex((current) =>
				hidden || isPaused || isHovering ? current : (current + 1) % slides.length,
			);
		}, AUTO_ADVANCE_MS);

		return () => {
			window.clearInterval(interval);
			document.removeEventListener("visibilitychange", handleVisibility);
		};
	}, [activeIndex, isPaused, isHovering, slides.length]);

	if (slides.length === 0) {
		return (
			<section className="relative flex h-[92vh] min-h-[560px] w-full items-center overflow-hidden">
				<div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
					<div className="flex max-w-3xl flex-col gap-5">
						<h2 className="text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
							Cast n <span className="text-accent">Cue</span>
						</h1>
						<p className="max-w-[36rem] text-sm leading-relaxed text-muted sm:text-base">
							Track the movies, series, and episodes you watch.
						</p>
					</div>
				</div>
			</section>
		);
	}

	const active = Math.min(activeIndex, slides.length - 1);
	const activeSlide = slides[active];
	const [firstWord, ...restWords] = activeSlide.name.split(" ");
	const rest = restWords.join(" ");
	const runtime = formatRuntime(activeSlide.runtime);

	return (
		<section
			className="relative h-[92vh] min-h-[560px] w-full overflow-hidden"
			onMouseEnter={() => setIsHovering(true)}
			onMouseLeave={() => setIsHovering(false)}
			onFocus={() => setIsHovering(true)}
			onBlur={() => setIsHovering(false)}
		>
			{slides.map((slide, index) =>
				slide.backdropUrl ? (
					<div key={`${slide.type}-${slide.id}`} className="absolute inset-0">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={slide.backdropUrl}
							alt=""
							aria-hidden="true"
							width={1280}
							height={720}
							loading={index === 0 ? "eager" : "lazy"}
							fetchPriority={index === 0 ? "high" : undefined}
							className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ${
								index === active ? "opacity-100" : "opacity-0"
							}`}
						/>
					</div>
				) : null,
			)}
			<div className="bg-hero-overlay pointer-events-none absolute inset-0" />
			<div className="bg-bottom-fade pointer-events-none absolute inset-x-0 bottom-0 h-48" />
			<div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6">
				<div key={active} className="animate-hero-enter flex max-w-3xl flex-col gap-5">
					<h2 className="text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
						<span className="text-accent">{firstWord}</span>
						{rest ? ` ${rest}` : ""}
					</h2>
					<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-foreground">
						<span className="inline-flex items-center gap-1.5">
							<StarIcon />
							{activeSlide.voteAverage.toFixed(1)}
						</span>
						{activeSlide.year !== null && (
							<span className="inline-flex items-center gap-1.5">
								<CalendarIcon />
								{activeSlide.year}
							</span>
						)}
						{runtime && (
							<span className="inline-flex items-center gap-1.5">
								<ClockIcon />
								{runtime}
							</span>
						)}
						{activeSlide.genres.map((genre) => (
							<span
								key={genre}
								className="rounded-full bg-accent-surface px-3 py-1 text-xs text-foreground/90"
							>
								{genre}
							</span>
						))}
					</div>
					<p className="line-clamp-3 max-w-[36rem] text-sm leading-relaxed text-muted sm:text-base">
						{activeSlide.overview}
					</p>
					<div className="mt-2 flex flex-wrap items-center gap-3">
						<Link
							href={activeSlide.href}
							className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
						>
							<PlayIcon />
							View details
						</Link>
						<Link
							href="#trending"
							className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur-md transition-colors duration-300 hover:border-accent/60 hover:bg-accent-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
						>
							<InfoIcon />
							Browse trending
						</Link>
					</div>
				</div>
			</div>
			{slides.length > 1 && (
				<>
					<button
						type="button"
						onClick={() => setIsPaused((paused) => !paused)}
						aria-label={isPaused ? "Play featured titles" : "Pause featured titles"}
						aria-pressed={isPaused}
						className="absolute bottom-5 right-4 z-20 flex size-11 items-center justify-center rounded-full border border-border bg-background/70 text-foreground backdrop-blur-md transition-colors hover:border-accent/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:right-6"
					>
						{isPaused ? <PlayIcon /> : <PauseIcon />}
					</button>
					<div className="absolute inset-x-0 bottom-6 z-20 flex justify-center gap-2">
						{slides.map((slide, index) => (
							<button
								key={`${slide.type}-${slide.id}`}
								type="button"
								aria-label={`Go to slide ${index + 1}`}
								aria-current={index === active ? "true" : undefined}
								onClick={() => setActiveIndex(index)}
								className={`transition-all duration-300 ${
									index === active
										? "h-1.5 w-8 rounded-full bg-accent"
										: "h-1.5 w-4 rounded-full bg-foreground/30 transition-colors duration-300 hover:bg-foreground/60"
								}`}
							/>
						))}
					</div>
				</>
			)}
		</section>
	);
}
