import type { Metadata } from "next";
import "./globals.css";

import { AppFooter } from "@/components/app-footer";
import { AppNavbar } from "@/components/app-navbar";
import { Providers } from "./providers";

const DEFAULT_TITLE = "Cast n Cue — Track everything you watch";
const DEFAULT_DESCRIPTION =
	"Track the movies, series, and episodes you watch. Rate titles, keep notes, and build your personal cinema archive.";

export const metadata: Metadata = {
	metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
	title: {
		default: DEFAULT_TITLE,
		template: "%s · Cast n Cue",
	},
	description: DEFAULT_DESCRIPTION,
	applicationName: "Cast n Cue",
	openGraph: {
		type: "website",
		siteName: "Cast n Cue",
		title: DEFAULT_TITLE,
		description: DEFAULT_DESCRIPTION,
	},
	twitter: {
		card: "summary_large_image",
		title: DEFAULT_TITLE,
		description: DEFAULT_DESCRIPTION,
	},
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
						<AppFooter />
					</div>
				</Providers>
			</body>
		</html>
	);
}
