"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchField } from "@heroui/react/search-field";

const DEBOUNCE_MS = 500;

export function SearchBox({ className = "w-full max-w-xs" }: { className?: string }) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [query, setQuery] = useState(searchParams.get("q") ?? "");
	const committedQueryRef = useRef(query);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const prevPathnameRef = useRef(pathname);

	useEffect(() => {
		const enteredSearch =
			pathname.startsWith("/search") && !prevPathnameRef.current.startsWith("/search");
		prevPathnameRef.current = pathname;
		if (!enteredSearch) return;

		const urlQuery = searchParams.get("q") ?? "";
		setQuery(urlQuery);
		committedQueryRef.current = urlQuery;
	}, [pathname, searchParams]);

	useEffect(() => {
		const trimmed = query.trim();
		if (trimmed === committedQueryRef.current) return;

		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => {
			committedQueryRef.current = trimmed;
			const params = new URLSearchParams();
			if (trimmed) params.set("q", trimmed);
			router.push(`/search?${params.toString()}`);
		}, DEBOUNCE_MS);

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [query, router]);

	return (
		<SearchField.Root
			value={query}
			onChange={setQuery}
			aria-label="Search movies, series, and episodes"
			className={className}
		>
			<SearchField.Group>
				<SearchField.SearchIcon />
				<SearchField.Input placeholder="Search movies, series & episodes" />
				<SearchField.ClearButton />
			</SearchField.Group>
		</SearchField.Root>
	);
}
