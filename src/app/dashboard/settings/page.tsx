import type { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getServerSession } from "@/lib/session";
import { getProfileVisibility } from "@/lib/profile";
import { ProfileVisibilityCard } from "@/components/settings/profile-visibility-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Settings",
	description: "Manage your Cast n Cue profile and who can see your library.",
	openGraph: {
		title: "Settings",
		description: "Manage your Cast n Cue profile and who can see your library.",
		type: "website",
	},
};

async function SettingsContent() {
	const session = await getServerSession();
	if (!session) redirect("/login");
	const visibility = await getProfileVisibility(getCloudflareContext().env.DB, session.user.id);
	return <ProfileVisibilityCard initialVisibility={visibility} displayName={session.user.name} />;
}

function SettingsFallback() {
	return <p className="text-sm text-muted">Loading settings…</p>;
}

export default function SettingsPage() {
	return (
		<main className="flex flex-1 flex-col gap-6 p-8">
			<header className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold text-foreground">Settings</h1>
				<p className="text-muted">Control what others can see.</p>
			</header>
			<Suspense fallback={<SettingsFallback />}>
				<SettingsContent />
			</Suspense>
		</main>
	);
}
