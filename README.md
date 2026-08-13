# Cast n Cue

A personal media tracker. Users bookmark movies, series, and individual episodes, track their progress, and leave star ratings and private notes on each.

Stack: Next.js 15 (App Router) + TypeScript deployed on Cloudflare Workers via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare), with Cloudflare **D1** for storage, **Better Auth** for authentication (Google OAuth), and **HeroUI** for the dark-mode-first UI.

See `CONTEXT.md` for the domain language and `docs/adr/` for the architectural decisions.

## Getting started

```bash
pnpm install
cp .dev.vars.example .dev.vars   # fill in secrets
pnpm dev                          # next dev
pnpm preview                      # local Cloudflare runtime (has D1 + secrets)
```

## Database (D1)

The D1 binding is `DB` (`wrangler.jsonc`). Migrations live in `migrations/`.

```bash
pnpm run db:migrate:local   # apply migrations to the local D1 database
pnpm run db:migrate:remote  # apply migrations to the remote D1 database
```

The Better Auth schema is generated from `auth.config.ts` and folded into `migrations/`. Regenerate it after changing auth config/plugins:

```bash
pnpm exec auth generate --config ./auth.config.ts --output ./schema.sql --yes
```

## Secrets

Local secrets live in `.dev.vars` (gitignored). Production secrets are set per-binding:

```bash
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put TMDB_API_KEY
npx wrangler secret put OMDB_API_KEY
npx wrangler secret put BETTER_AUTH_SECRET
```

## Scripts

| Script | Purpose |
| ------ | ------- |
| `pnpm dev` | Next.js dev server (no D1 bindings) |
| `pnpm preview` | Build + run the OpenNext worker locally with bindings |
| `pnpm build` | Next.js build |
| `pnpm deploy` | Build + deploy to Cloudflare Workers |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm db:migrate:local` / `db:migrate:remote` | Apply D1 migrations |
| `pnpm cf-typegen` | Regenerate `cloudflare-env.d.ts` from `wrangler.jsonc` |
