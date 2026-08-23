"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";
import { setProfileVisibility } from "@/lib/profile";
import { getServerSession } from "@/lib/session";

export interface ProfileVisibilityState {
	slug: string | null;
	isPublic: boolean;
}

async function requireSession() {
	const session = await getServerSession();
	if (!session) {
		redirect("/login");
	}
	return session;
}

export async function updateProfileVisibility(isPublic: boolean): Promise<ProfileVisibilityState> {
	const session = await requireSession();
	return setProfileVisibility(getCloudflareContext().env.DB, session.user.id, isPublic);
}
