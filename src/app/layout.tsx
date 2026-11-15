import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

import { AppFooter } from "@/components/app-footer";
import { AppNavbar } from "@/components/app-navbar";
import { Providers } from "./providers";

const display = Fraunces({
	subsets: ["latin"],
	variable: "--font-display",
	display: "swap",
});

const body = Manrope({
	subsets: ["latin"],
	variable: "--font-body",
	display: "swap",
});

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
		<html lang="en" className={`dark ${display.variable} ${body.variable}`} suppressHydrationWarning>
			<body className="min-h-screen bg-background font-body text-foreground antialiased">
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent-foreground"
				>
					Skip to content
				</a>
				<Providers>
					<div id="main-content" tabIndex={-1} className="flex min-h-screen flex-col outline-none">
						<AppNavbar />
						{children}
						<AppFooter />
					</div>
				</Providers>
			</body>
		</html>
	);
}
