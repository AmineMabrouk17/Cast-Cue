"use client";

import { Suspense, useState } from "react";
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
import { Logo } from "./logo";
import { SearchBox } from "./search-box";
import { ThemeToggle } from "./theme-toggle";

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

function NotesIcon({ className }: { className?: string }) {
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
			<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
			<path d="M14 2v4a2 2 0 0 0 2 2h4" />
			<path d="M10 9H8" />
			<path d="M16 13H8" />
			<path d="M16 17H8" />
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
	const [signOutError, setSignOutError] = useState<string | null>(null);

	async function handleSignOut() {
		setSignOutError(null);
		try {
			const { error } = await authClient.signOut();
			if (error) {
				setSignOutError("Couldn't sign out. Your session is still active — try again.");
				return;
			}
		} catch {
			setSignOutError("Couldn't sign out. Your session is still active — try again.");
			return;
		}
		router.push("/");
		router.refresh();
	}

	return (
		<header className="relative flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border px-6">
			<Logo />
			<div className="flex min-w-0 flex-1 justify-center">
				<Suspense fallback={null}>
					<SearchBox />
				</Suspense>
			</div>
			<div className="flex items-center justify-end gap-2">
				<ThemeToggle />
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
										<DropdownItem id="library" textValue="Library" onAction={() => router.push("/dashboard/library")}>
											<LibraryIcon className="size-4 shrink-0 text-muted" />
											<Label>Library</Label>
										</DropdownItem>
										<DropdownItem id="notes" textValue="Notes" onAction={() => router.push("/dashboard/notes")}>
											<NotesIcon className="size-4 shrink-0 text-muted" />
											<Label>Notes</Label>
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
			{signOutError ? (
				<div
					role="alert"
					className="absolute right-4 top-14 z-50 rounded-md border border-border bg-background px-3 py-2 text-sm text-danger shadow-md"
				>
					{signOutError}
				</div>
			) : null}
		</header>
	);
}
