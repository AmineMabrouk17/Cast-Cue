"use client";

import { useState } from "react";
import Link from "next/link";
import type { NoteItem } from "./notes-view";

function NoteThumbnail({ src, title }: { src: string | null; title: string }) {
	const [imageError, setImageError] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);

	if (!src || imageError) {
		return (
			<div className="flex aspect-[2/3] w-14 shrink-0 items-center justify-center rounded-lg border border-border bg-gradient-to-br from-surface to-elevated p-2 text-muted shadow-sm sm:w-16">
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="size-5 text-muted/60"
				>
					<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
					<polyline points="14 2 14 8 20 8" />
					<line x1="16" y1="13" x2="8" y2="13" />
					<line x1="16" y1="17" x2="8" y2="17" />
					<polyline points="10 9 9 9 8 9" />
				</svg>
			</div>
		);
	}

	return (
		<div className="relative aspect-[2/3] w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-elevated shadow-sm sm:w-16">
			{!isLoaded && <div className="absolute inset-0 animate-pulse bg-elevated" />}
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={src}
				alt={title}
				loading="lazy"
				decoding="async"
				onLoad={() => setIsLoaded(true)}
				onError={() => setImageError(true)}
				className={`size-full object-cover transition-all duration-300 group-hover:scale-105 ${
					isLoaded ? "opacity-100" : "opacity-0"
				}`}
			/>
		</div>
	);
}

export function NoteCard({ item }: { item: NoteItem }) {
	return (
		<div className="group rounded-xl border border-border bg-surface/50 p-4 transition-all duration-300 hover:border-accent/40 hover:bg-surface hover:shadow-md">
			<Link href={item.href} className="flex gap-4">
				<NoteThumbnail src={item.imageUrl} title={item.title} />
				<div className="flex min-w-0 flex-1 flex-col gap-1.5">
					<div className="flex flex-col">
						<span className="line-clamp-1 text-sm font-semibold text-foreground transition-colors group-hover:text-accent">
							{item.title}
						</span>
						<span className="line-clamp-1 text-xs text-muted">{item.subtitle}</span>
					</div>
					<p className="line-clamp-3 text-xs leading-relaxed text-foreground/80">{item.note}</p>
				</div>
			</Link>
		</div>
	);
}
