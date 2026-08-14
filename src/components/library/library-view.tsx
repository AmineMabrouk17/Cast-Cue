"use client";

import Image from "next/image";
import Link from "next/link";
import { BOOKMARK_STATUS_LABELS, type BookmarkStatus } from "@/lib/bookmarks";
import { MediaEmptyState } from "@/components/media/media-empty-state";

export interface LibraryItem {
	key: string;
	href: string;
	title: string;
	subtitle: string;
	imageUrl: string | null;
	status: BookmarkStatus;
	favorite: boolean;
	rating: number | null;
}

function HeartIcon({ filled }: { filled: boolean }) {
	return (
		<svg
			viewBox="0 0 24 24"
			aria-hidden="true"
			className="h-3.5 w-3.5"
			fill={filled ? "currentColor" : "none"}
			stroke="currentColor"
			strokeWidth="2"
		>
			<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
		</svg>
	);
}

function LibraryCard({ item }: { item: LibraryItem }) {
	return (
		<Link href={item.href} className="group block">
			<div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-background transition-colors group-hover:bg-default/60">
				<div className="relative aspect-[2/3] w-full bg-default">
					{item.imageUrl ? (
						<Image
							src={item.imageUrl}
							alt={item.title}
							fill
							sizes="(min-width: 1280px) 16.6vw, (min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
							className="object-cover"
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center p-4 text-center text-sm text-muted">
							{item.title}
						</div>
					)}
					<div className="absolute bottom-2 left-2">
						<span className="rounded-md bg-background/80 px-2 py-0.5 text-xs font-semibold text-foreground backdrop-blur-sm">
							{BOOKMARK_STATUS_LABELS[item.status]}
						</span>
					</div>
					{item.favorite ? (
						<div className="absolute right-2 top-2">
							<span className="flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-danger backdrop-blur-sm">
								<HeartIcon filled />
							</span>
						</div>
					) : null}
				</div>
				<div className="flex flex-col gap-1 p-3">
					<span className="line-clamp-1 text-sm font-medium text-foreground">{item.title}</span>
					{item.subtitle ? (
						<span className="line-clamp-1 text-xs text-muted">{item.subtitle}</span>
					) : null}
					{item.rating !== null ? (
						<span className="text-xs text-muted">★ {item.rating.toFixed(1)}</span>
					) : null}
				</div>
			</div>
		</Link>
	);
}

export function LibraryView({ items }: { items: LibraryItem[] }) {
	if (items.length === 0) {
		return (
			<MediaEmptyState
				title="Your library is empty"
				message="Bookmark movies, series, and episodes to see them here."
			/>
		);
	}

	return (
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
			{items.map((item) => (
				<LibraryCard key={item.key} item={item} />
			))}
		</div>
	);
}
