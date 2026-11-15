import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { MediaGridSkeleton } from "@/components/media/media-grid-skeleton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Dashboard",
	description: "Pick up where you left off — continue watching and see what's up next.",
	openGraph: {
		title: "Dashboard",
		description: "Pick up where you left off — continue watching and see what's up next.",
		type: "website",
	},
};

export default function DashboardPage() {
	return (
		<main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
			<Suspense fallback={<MediaGridSkeleton count={6} />}>
				<DashboardView />
			</Suspense>
		</main>
	);
}
