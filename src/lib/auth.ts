import { getCloudflareContext } from "@opennextjs/cloudflare";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

/**
 * Trust the app's own origin in development so sign-in/out keep working when
 * the dev server falls back to another port than BETTER_AUTH_URL assumes
 * (e.g. port 3000 already taken). Production keeps the strict default:
 * only BETTER_AUTH_URL is trusted.
 */
function trustedOrigins(request?: Request): Array<string | null | undefined> {
	if (process.env.NODE_ENV !== "development" || !request) {
		return [];
	}
	const origin = request.headers.get("origin");
	if (!origin) return [];
	try {
		const { hostname } = new URL(origin);
		if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]") {
			return [origin];
		}
	} catch {
		return [];
	}
	return [];
}

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
		trustedOrigins,
		socialProviders: {
			google: {
				clientId: process.env.GOOGLE_CLIENT_ID!,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			},
		},
		plugins: [nextCookies()],
	});
