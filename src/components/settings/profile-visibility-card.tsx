"use client";

import { useState, useTransition } from "react";
import { Button } from "@heroui/react/button";
import { Switch } from "@heroui/react/switch";
import { updateProfileVisibility } from "@/app/dashboard/settings/actions";

interface ProfileVisibilityCardProps {
	initialVisibility: { slug: string | null; isPublic: boolean };
	displayName: string;
}

export function ProfileVisibilityCard({ initialVisibility, displayName }: ProfileVisibilityCardProps) {
	const [visibility, setVisibility] = useState(initialVisibility);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [isPending, startTransition] = useTransition();

	function onToggle(next: boolean) {
		startTransition(async () => {
			try {
				const updated = await updateProfileVisibility(next);
				setVisibility(updated);
				setErrorMessage(null);
			} catch (error) {
				setErrorMessage(error instanceof Error ? error.message : "Could not update profile visibility");
			}
		});
	}

	async function onCopy() {
		if (!visibility.slug) return;
		await navigator.clipboard.writeText(`${window.location.origin}/u/${visibility.slug}`);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<section className="flex max-w-xl flex-col gap-4 rounded-lg border border-border bg-content1 p-6">
			<div className="flex flex-col gap-1">
				<h2 className="text-lg font-semibold text-foreground">Public profile</h2>
				<p className="text-sm text-muted">
					Share what you&apos;re watching at a public link. Your notes and unrated watchlist entries
					stay private.
				</p>
			</div>

			<Switch.Root isSelected={visibility.isPublic} isDisabled={isPending} onChange={onToggle}>
				<span className="text-sm text-foreground">Share my library publicly as {displayName}</span>
				<Switch.Content className="group ml-2 inline-flex cursor-pointer">
					<Switch.Control className="flex h-6 w-10 items-center rounded-full bg-default p-0.5 transition-colors group-data-[selected=true]:bg-primary">
						<Switch.Thumb className="h-5 w-5 rounded-full bg-white shadow-sm transition-transform group-data-[selected=true]:translate-x-4" />
					</Switch.Control>
				</Switch.Content>
			</Switch.Root>

			{errorMessage && (
				<p role="alert" className="text-sm text-danger">
					{errorMessage}
				</p>
			)}

			{visibility.isPublic && visibility.slug && (
				<div className="flex flex-col gap-2 rounded-md border border-border p-3">
					<span className="text-sm text-muted">Your shareable link:</span>
					<div className="flex items-center gap-2">
						<code className="min-w-0 flex-1 truncate rounded-sm bg-default px-2 py-1 text-sm text-foreground">
							{typeof window !== "undefined" ? window.location.origin : ""}/u/{visibility.slug}
						</code>
						<Button size="sm" variant="ghost" onPress={onCopy}>
							{copied ? "Copied" : "Copy"}
						</Button>
					</div>
				</div>
			)}
		</section>
	);
}
