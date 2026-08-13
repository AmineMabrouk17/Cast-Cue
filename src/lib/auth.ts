import { getCloudflareContext } from "@opennextjs/cloudflare";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

/**
 * Runtime Better Auth instance (native D1 support — see ADR-0003).
 *
 * `auth` is a factory, not a singleton: `getCloudflareContext()` is only
 * available inside a request, so the instance is built lazily per request
 * (see https://github.com/opennextjs/opennextjs-cloudflare/issues/483).
 */
export const auth = () =>
	betterAuth({
		database: getCloudflareContext().env.DB,
		baseURL: process.env.BETTER_AUTH_URL,
		secret: process.env.BETTER_AUTH_SECRET,
		socialProviders: {
			google: {
				clientId: process.env.GOOGLE_CLIENT_ID!,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			},
		},
		plugins: [nextCookies()],
	});
