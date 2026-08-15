"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@heroui/react/button";
import type { SeasonSummary } from "@/lib/tmdb";

export function SeasonSelector({
	seasons,
	selectedSeason,
}: {
	seasons: SeasonSummary[];
	selectedSeason: number;
}) {
	const router = useRouter();
	const pathname = usePathname();

	return (
		<div className="flex flex-wrap items-center gap-2">
			<span className="text-sm font-medium text-muted">Season</span>
			{seasons.map((season) => (
				<Button
					key={season.seasonNumber}
					variant={season.seasonNumber === selectedSeason ? "primary" : "tertiary"}
					size="sm"
					onPress={() =>
						router.replace(`${pathname}?season=${season.seasonNumber}`, { scroll: false })
					}
				>
					{season.name}
				</Button>
			))}
		</div>
	);
}
