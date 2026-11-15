"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@heroui/react/button";
import { authClient } from "@/lib/auth-client";

export function SignInButton({ callbackUrl }: { callbackUrl?: string }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { data: session, isPending } = authClient.useSession();
	const [error, setError] = useState<string | null>(null);
	const [isSigningIn, setIsSigningIn] = useState(false);

	const targetUrl =
		callbackUrl ||
		(searchParams.get("callbackUrl")?.startsWith("/") ? searchParams.get("callbackUrl")! : "/dashboard");

	async function handlePress() {
		if (session) {
			router.push(targetUrl);
			return;
		}
		setError(null);
		setIsSigningIn(true);
		try {
			const { error: signInError } = await authClient.signIn.social({
				provider: "google",
				callbackURL: targetUrl,
			});
			if (signInError) {
				setError("Google sign-in could not start. Try again in a moment.");
			}
		} catch {
			setError("Google sign-in could not start. Try again in a moment.");
		} finally {
			setIsSigningIn(false);
		}
	}

	return (
		<div className="flex w-full flex-col gap-2">
			<Button
				variant="primary"
				size="lg"
				isDisabled={isPending || isSigningIn}
				onPress={handlePress}
				className="min-h-11 w-full"
			>
				{session ? "Continue" : isSigningIn ? "Opening Google…" : "Sign in with Google"}
			</Button>
			{error ? (
				<p role="alert" className="text-sm text-danger">
					{error}
				</p>
			) : null}
		</div>
	);
}
