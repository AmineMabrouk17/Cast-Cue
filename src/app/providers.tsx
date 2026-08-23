"use client";

import { I18nProvider } from "@heroui/react";
import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export interface ProvidersProps {
	children: React.ReactNode;
	themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
	return (
		<I18nProvider locale="en-US">
			<NextThemesProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				{...themeProps}
			>
				{children}
			</NextThemesProvider>
		</I18nProvider>
	);
}
