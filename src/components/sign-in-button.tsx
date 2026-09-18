"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@heroui/react/button";
import { authClient } from "@/lib/auth-client";

export function SignInButton({ callbackUrl }: { callbackUrl?: string }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { data: session, isPending } = authClient.useSession();

	const targetUrl =
		callbackUrl ||
		(searchParams.get("callbackUrl")?.startsWith("/") ? searchParams.get("callbackUrl")! : "/dashboard");

	async function handlePress() {
		if (session) {
			router.push(targetUrl);
			return;
		}
		await authClient.signIn.social({ provider: "google", callbackURL: targetUrl });
	}

	return (
		<Button variant="tertiary" size="lg" isDisabled={isPending} onPress={handlePress}>
			{session ? "Continue" : "Sign in with Google"}
		</Button>
	);
}
