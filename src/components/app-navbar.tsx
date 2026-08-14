"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@heroui/react/avatar";
import { buttonVariants } from "@heroui/styles";
import {
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
} from "@heroui/react/dropdown";
import { authClient } from "@/lib/auth-client";
import { Logo } from "./logo";
import { SearchBox } from "./search-box";

function initials(name: string) {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

export function AppNavbar() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();
	const user = session?.user;

	async function handleSignOut() {
		await authClient.signOut();
		router.push("/");
		router.refresh();
	}

	return (
		<header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border px-6">
			<Logo />
			<div className="flex min-w-0 flex-1 justify-center">
				<Suspense fallback={null}>
					<SearchBox />
				</Suspense>
			</div>
			<div className="flex items-center justify-end">
				{!isPending &&
					(user ? (
						<Dropdown>
							<DropdownTrigger aria-label="Account menu">
								<Avatar.Root size="sm">
									{user.image && <Avatar.Image src={user.image} alt={user.name} />}
									<Avatar.Fallback>{initials(user.name)}</Avatar.Fallback>
								</Avatar.Root>
							</DropdownTrigger>
							<DropdownMenu>
								<DropdownItem id="dashboard" onAction={() => router.push("/dashboard")}>
									Dashboard
								</DropdownItem>
								<DropdownItem id="library" onAction={() => router.push("/library")}>
									Library
								</DropdownItem>
								<DropdownItem id="signout" variant="danger" onAction={handleSignOut}>
									Sign out
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					) : (
						<Link href="/login" className={buttonVariants({ variant: "tertiary", size: "sm" })}>
							Sign in
						</Link>
					))}
			</div>
		</header>
	);
}
