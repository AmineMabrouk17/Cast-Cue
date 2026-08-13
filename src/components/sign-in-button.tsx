"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/react/button";
import { authClient } from "@/lib/auth-client";

export function SignInButton() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();

	async function handlePress() {
		if (session) {
			router.push("/dashboard");
			return;
		}
		await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
	}

	return (
		<Button variant="tertiary" size="lg" isDisabled={isPending} onPress={handlePress}>
			{session ? "Continue to dashboard" : "Sign in with Google"}
		</Button>
	);
}
