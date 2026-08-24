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
		<html lang="en" className="dark" suppressHydrationWarning>
			<body className="min-h-screen bg-background font-body text-foreground antialiased">
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				{/* App Router: links rendered in the root layout apply to every page. */}
				{/* eslint-disable-next-line @next/next/no-page-custom-font */}
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Space+Grotesk:wght@500;600;700&display=swap"
				/>
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
