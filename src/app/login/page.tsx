import { redirect } from "next/navigation";
import { SignInButton } from "@/components/sign-in-button";
import { getServerSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
	const session = await getServerSession();
	if (session) redirect("/dashboard");

	return (
		<main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
			<h1 className="text-3xl font-bold">Sign in</h1>
			<p className="text-muted">Use your Google account to access Cast n Cue.</p>
			<SignInButton />
		</main>
	);
}
