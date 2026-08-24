"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@heroui/react/avatar";
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

const NAV_LINKS = [
	{ href: "/", label: "Home" },
	{ href: "/search", label: "Search" },
	{ href: "/dashboard/library", label: "Library" },
	{ href: "/dashboard/notes", label: "Notes" },
] as const;

function initials(name: string) {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

function SearchIcon({ className }: { className?: string }) {
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
			<circle cx="11" cy="11" r="8" />
			<path d="m21 21-4.3-4.3" />
		</svg>
	);
}

function UserIcon({ className }: { className?: string }) {
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
			<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
			<circle cx="12" cy="7" r="4" />
		</svg>
	);
}

function MenuIcon({ className }: { className?: string }) {
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
			<line x1="4" x2="20" y1="6" y2="6" />
			<line x1="4" x2="20" y1="12" y2="12" />
			<line x1="4" x2="20" y1="18" y2="18" />
		</svg>
	);
}

function CloseIcon({ className }: { className?: string }) {
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
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</svg>
	);
}

const ICON_BUTTON_CLASS =
	"flex size-9 items-center justify-center rounded-full border border-border text-foreground transition-colors duration-300 hover:border-accent hover:text-accent";

const MOBILE_LINK_CLASS =
	"block rounded-lg px-3 py-2 text-sm text-muted transition-colors duration-300 hover:bg-accent-surface hover:text-foreground";

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
	const [menuOpen, setMenuOpen] = useState(false);
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

	function closeMenu() {
		setMenuOpen(false);
	}

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
			<div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
				<Logo />
				<nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
					{NAV_LINKS.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="text-sm font-medium text-muted transition-colors duration-300 hover:text-foreground"
						>
							{link.label}
						</Link>
					))}
				</nav>
				<div className="flex items-center gap-2">
					<Link href="/search" className={ICON_BUTTON_CLASS} aria-label="Search">
						<SearchIcon className="size-4" />
					</Link>
					{!isPending &&
						(user ? (
							<Dropdown>
								<DropdownTrigger aria-label="Account menu">
									<Avatar.Root size="sm" className="ring-2 ring-transparent transition-shadow focus-visible:ring-accent">
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
							<Link href="/login" className={`${ICON_BUTTON_CLASS} hidden sm:flex`} aria-label="Sign in">
								<UserIcon className="size-4" />
							</Link>
						))}
					<button
						type="button"
						onClick={() => setMenuOpen((open) => !open)}
						aria-label={menuOpen ? "Close menu" : "Open menu"}
						aria-expanded={menuOpen}
						className={`${ICON_BUTTON_CLASS} lg:hidden`}
					>
						{menuOpen ? <CloseIcon className="size-4" /> : <MenuIcon className="size-4" />}
					</button>
				</div>
			</div>
			{menuOpen ? (
				<nav
					aria-label="Mobile"
					className="border-b border-border bg-background/95 backdrop-blur-md lg:hidden"
				>
					<div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
						{NAV_LINKS.map((link) => (
							<Link key={link.href} href={link.href} className={MOBILE_LINK_CLASS} onClick={closeMenu}>
								{link.label}
							</Link>
						))}
						<div className="my-2 border-t border-border" />
						{user ? (
							<Link href="/dashboard" className={MOBILE_LINK_CLASS} onClick={closeMenu}>
								Dashboard
							</Link>
						) : (
							<Link href="/login" className={MOBILE_LINK_CLASS} onClick={closeMenu}>
								Sign in
							</Link>
						)}
					</div>
				</nav>
			) : null}
			{signOutError ? (
				<div
					role="alert"
					className="absolute right-4 top-16 z-50 rounded-md border border-border bg-background px-3 py-2 text-sm text-danger shadow-md"
				>
					{signOutError}
				</div>
			) : null}
		</header>
	);
}
