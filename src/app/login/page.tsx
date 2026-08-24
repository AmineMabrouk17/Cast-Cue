import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/sign-in-button";
import { getServerSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Sign in",
	description: "Sign in to Cast n Cue with your Google account to track what you watch.",
	openGraph: {
		title: "Sign in",
		description: "Sign in to Cast n Cue with your Google account to track what you watch.",
		type: "website",
	},
};

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
