import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@heroui/styles";
import { getServerSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
	const session = await getServerSession();
	if (!session) redirect("/login");

	return (
		<main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
			<h1 className="text-3xl font-bold">Dashboard</h1>
			<p className="text-muted">
				Welcome back, {session.user.name}. Your library is waiting.
			</p>
			<Link href="/dashboard/library" className={buttonVariants({ variant: "primary", size: "md" })}>
				Open your library
			</Link>
		</main>
	);
}
