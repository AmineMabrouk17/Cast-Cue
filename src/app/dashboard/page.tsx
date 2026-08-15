import { Suspense } from "react";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { MediaGridSkeleton } from "@/components/media/media-grid-skeleton";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
	return (
		<main className="flex flex-1 flex-col p-8">
			<Suspense fallback={<MediaGridSkeleton count={6} />}>
				<DashboardView />
			</Suspense>
		</main>
	);
}
