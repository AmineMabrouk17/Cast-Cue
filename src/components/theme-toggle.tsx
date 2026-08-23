"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/react/button";
import { useTheme } from "next-themes";

function SunIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			className="h-4 w-4"
		>
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
		</svg>
	);
}

function MoonIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			className="h-4 w-4"
		>
			<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
		</svg>
	);
}

export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	const isDark = mounted && resolvedTheme === "dark";

	return (
		<Button
			variant="tertiary"
			size="sm"
			isIconOnly
			aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
			onPress={() => setTheme(isDark ? "light" : "dark")}
		>
			{isDark ? <SunIcon /> : <MoonIcon />}
		</Button>
	);
}
