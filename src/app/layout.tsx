import type { Metadata } from "next";
import "./globals.css";

import { AppNavbar } from "@/components/app-navbar";
import { Providers } from "./providers";

export const metadata: Metadata = {
	title: "Cast n Cue",
	description: "Track the movies, series, and episodes you watch.",
	applicationName: "Cast n Cue",
	manifest: "/site.webmanifest",
	icons: {
		icon: [
			{ url: "/favicon.ico", sizes: "any" },
			{ url: "/icon.png", sizes: "512x512", type: "image/png" },
		],
		apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
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
