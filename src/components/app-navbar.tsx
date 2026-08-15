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
	DropdownPopover,
	DropdownSection,
	DropdownTrigger,
} from "@heroui/react/dropdown";
import { Header } from "@heroui/react/header";
import { Label } from "@heroui/react/label";
import { Separator } from "@heroui/react/separator";
import { authClient } from "@/lib/auth-client";
import { SearchBox } from "./search-box";

function initials(name: string) {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

function DashboardIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			className={className}
		>
			<rect width="7" height="9" x="3" y="3" rx="1" />
			<rect width="7" height="5" x="14" y="3" rx="1" />
			<rect width="7" height="9" x="14" y="12" rx="1" />
			<rect width="7" height="5" x="3" y="16" rx="1" />
		</svg>
	);
}

function LibraryIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			className={className}
		>
			<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
		</svg>
	);
}

function SignOutIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			className={className}
		>
			<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
			<polyline points="16 17 21 12 16 7" />
			<line x1="21" x2="9" y1="12" y2="12" />
		</svg>
	);
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
			<Link href="/" className="font-semibold text-foreground">
				Cast n Cue
			</Link>
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
							<DropdownPopover>
								<DropdownMenu>
									<DropdownSection>
										<Header>Overview</Header>
										<DropdownItem id="dashboard" textValue="Dashboard" onAction={() => router.push("/dashboard")}>
											<DashboardIcon className="size-4 shrink-0 text-muted" />
											<Label>Dashboard</Label>
										</DropdownItem>
										<DropdownItem id="library" textValue="Library" onAction={() => router.push("/library")}>
											<LibraryIcon className="size-4 shrink-0 text-muted" />
											<Label>Library</Label>
										</DropdownItem>
									</DropdownSection>
									<Separator />
									<DropdownSection>
										<Header>Account</Header>
										<DropdownItem id="signout" textValue="Sign out" variant="danger" onAction={handleSignOut}>
											<SignOutIcon className="size-4 shrink-0 text-danger" />
											<Label>Sign out</Label>
										</DropdownItem>
									</DropdownSection>
								</DropdownMenu>
							</DropdownPopover>
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
