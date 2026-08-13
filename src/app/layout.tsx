import type { Metadata } from "next";
import "./globals.css";

import { AppNavbar } from "@/components/app-navbar";
import { Providers } from "./providers";

export const metadata: Metadata = {
	title: "Cast n Cue",
	description: "Track the movies, series, and episodes you watch.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="dark" suppressHydrationWarning>
			<body className="min-h-screen bg-background text-foreground antialiased">
				<Providers>
					<div className="flex min-h-screen flex-col">
						<AppNavbar />
						{children}
					</div>
				</Providers>
			</body>
		</html>
	);
}
