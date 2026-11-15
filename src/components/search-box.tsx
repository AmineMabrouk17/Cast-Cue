"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchField } from "@heroui/react/search-field";

const DEBOUNCE_MS = 500;

export function SearchBox({ className = "w-full max-w-xs" }: { className?: string }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [query, setQuery] = useState(searchParams.get("q") ?? "");
	const committedQueryRef = useRef(query);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	function commit(value: string) {
		const trimmed = value.trim();
		if (trimmed === committedQueryRef.current) return;
		committedQueryRef.current = trimmed;
		const params = new URLSearchParams();
		if (trimmed) params.set("q", trimmed);
		router.replace(`/search?${params.toString()}`);
	}

	useEffect(() => {
		const urlQuery = searchParams.get("q") ?? "";
		if (urlQuery === committedQueryRef.current) return;
		setQuery(urlQuery);
		committedQueryRef.current = urlQuery;
	}, [searchParams]);

	useEffect(() => {
		const trimmed = query.trim();
		if (trimmed === committedQueryRef.current) return;

		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => commit(trimmed), DEBOUNCE_MS);

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [query]);

	return (
		<SearchField.Root
			value={query}
			onChange={setQuery}
			aria-label="Search movies, series, and episodes"
			className={className}
		>
			<SearchField.Group>
				<SearchField.SearchIcon />
				<SearchField.Input
					placeholder="Search movies, series & episodes"
					onKeyDown={(event) => {
						if (event.key !== "Enter") return;
						event.preventDefault();
						if (timerRef.current) clearTimeout(timerRef.current);
						commit(query);
					}}
				/>
				<SearchField.ClearButton />
			</SearchField.Group>
		</SearchField.Root>
	);
}
