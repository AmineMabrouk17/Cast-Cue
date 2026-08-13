/**
 * CLI-only Better Auth config used to generate the D1 auth schema.
 *
 * Keep Google OAuth (the v1 provider) and any plugins in sync with the
 * runtime config so `pnpm exec auth generate` stays accurate:
 *
 *   pnpm exec auth generate --config ./auth.config.ts --output ./schema.sql --yes
 *
 * Runtime auth lives under src/lib/ (see T2).
 */
import { betterAuth } from "better-auth";
import { Kysely, SqliteDialect } from "kysely";
import Database from "better-sqlite3";

export const auth = betterAuth({
	database: {
		db: new Kysely({
			dialect: new SqliteDialect({
				database: new Database("/tmp/cc-auth.sqlite"),
			}),
		}),
		type: "sqlite",
	},
	baseURL: "http://localhost:3000",
	secret: "dev-only-secret-do-not-use-in-production",
	socialProviders: {
		google: {
			clientId: "cli-placeholder",
			clientSecret: "cli-placeholder",
		},
	},
});
