"use client";

import { useState } from "react";
import { MAX_RATING, RATING_STEP } from "@/lib/bookmarks";
import type { MediaType } from "@/lib/tmdb";
import { setRating } from "@/app/media/actions";

const STAR_COUNT = Math.round(MAX_RATING);

const STAR_PATH =
	"M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

function formatRating(value: number): string {
	return value.toFixed(1);
}

function StarIcon({ fillFraction }: { fillFraction: number }) {
	return (
		<span className="pointer-events-none relative block h-5 w-5">
			<svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 text-warning">
				<path
					d={STAR_PATH}
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinejoin="round"
				/>
			</svg>
			{fillFraction > 0 ? (
				<span
					className="absolute inset-0 overflow-hidden"
					style={{ width: `${Math.min(1, fillFraction) * 100}%` }}
				>
					<svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 text-warning">
						<path
							d={STAR_PATH}
							fill="currentColor"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinejoin="round"
						/>
					</svg>
				</span>
			) : null}
		</span>
	);
}

export function RatingWidget({
	mediaType,
	mediaId,
	value,
}: {
	mediaType: MediaType;
	mediaId: number;
	value: number | null;
}) {
	const [rating, setValue] = useState<number | null>(value);
	const [error, setError] = useState<string | null>(null);

	function select(next: number) {
		const target = rating === next ? 0 : next;
		setValue(target);
		setError(null);
		void setRating(mediaType, mediaId, target).catch(() => {
			setError("Couldn't save rating. Try again.");
		});
	}

	const display = rating ?? 0;

	return (
		<div className="flex flex-col gap-1">
			<div className="flex items-center gap-3">
				<div role="radiogroup" aria-label="Your rating" className="flex items-center">
					{Array.from({ length: STAR_COUNT }, (_, starIndex) => {
						const fillFraction = Math.min(1, Math.max(0, display - starIndex));
						const leftValue = starIndex + RATING_STEP;
						const rightValue = starIndex + 1;
						return (
							<div key={starIndex} className="relative h-5 w-5">
								<StarIcon fillFraction={fillFraction} />
								<button
									type="button"
									role="radio"
									aria-checked={rating === leftValue}
									aria-label={`Rate ${formatRating(leftValue)} stars`}
									onClick={() => select(leftValue)}
									className="absolute left-0 top-0 h-full w-1/2 cursor-pointer"
								/>
								<button
									type="button"
									role="radio"
									aria-checked={rating === rightValue}
									aria-label={`Rate ${formatRating(rightValue)} stars`}
									onClick={() => select(rightValue)}
									className="absolute right-0 top-0 h-full w-1/2 cursor-pointer"
								/>
							</div>
						);
					})}
				</div>
				<span className="min-w-10 text-sm font-semibold text-foreground">
					{rating !== null ? formatRating(rating) : "Unrated"}
				</span>
			</div>
			{error ? <p className="text-xs text-danger">{error}</p> : null}
		</div>
	);
}
