import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
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

export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ callbackUrl?: string }>;
}) {
	const { callbackUrl } = await searchParams;
	const target = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";

	const session = await getServerSession();
	if (session) redirect(target);

	return (
		<main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-16 sm:px-6">
			<div className="flex flex-col gap-3">
				<Link
					href="/"
					className="w-fit text-sm font-medium text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
				>
					← Back to browsing
				</Link>
				<h1 className="text-3xl font-bold text-foreground">Keep your place.</h1>
				<p className="text-sm leading-relaxed text-muted">
					Sign in with Google to save what you are watching, where you stopped, and what you
					thought of it. Your library starts empty and stays private.
				</p>
			</div>

			<div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6">
				<Suspense fallback={null}>
					<SignInButton callbackUrl={target} />
				</Suspense>
				<div className="flex flex-col gap-2 text-sm text-muted">
					<p className="text-foreground">What Cast n Cue stores</p>
					<ul className="flex flex-col gap-1.5">
						<li>Your bookmarks, statuses, ratings, and private notes.</li>
						<li>Your name, email, and Google avatar.</li>
						<li>Nothing else, and no notes are ever public.</li>
					</ul>
				</div>
			</div>

			<p className="text-center text-xs text-muted">
				You need a Google account. There is no email-and-password sign-in.
			</p>
		</main>
	);
}
