import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { ImportView } from "@/components/library/import-view";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
	const session = await getServerSession();
	if (!session) redirect("/login");

	return (
		<main className="flex flex-1 flex-col gap-6 p-8">
			<header className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold text-foreground">Import your library</h1>
				<p className="text-muted">
					Bring your watch history from Letterboxd or Trakt. Upload a CSV export, preview what
					matches, then import.
				</p>
			</header>
			<ImportView />
		</main>
	);
}
