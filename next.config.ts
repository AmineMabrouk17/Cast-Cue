import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "image.tmdb.org",
				pathname: "/t/p/**",
			},
		],
	},
};

export default nextConfig;

// Enable calling `getCloudflareContext()` in `next dev`. Starting the
// Miniflare proxy during `next build` makes workerd compete for the local D1
// file with any other build and fail with SQLITE_BUSY.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
if (process.env.NODE_ENV === "development") {
	initOpenNextCloudflareForDev();
}
