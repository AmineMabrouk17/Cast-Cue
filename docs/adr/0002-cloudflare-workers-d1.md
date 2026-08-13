# Deploy on Cloudflare Workers via OpenNext, store in D1

Cast n Cue deploys as a single Next.js application on Cloudflare Workers using the `@opennextjs/cloudflare` adapter (GA since v1.0), with Cloudflare **D1** as the relational database accessed directly through a Worker binding.

This replaces Supabase entirely. The whole stack — Next.js app, D1 storage, Better Auth sessions, media metadata — runs on one deploy surface (`wrangler deploy`), all on Cloudflare's free tier (Workers ~100k req/day, D1 5 GB / 5M rows-read per day), which was the driving constraint. Data bindings are read in-app via `getCloudflareContext()`; the build needs `nodejs_compat` and a modern `compatibility_date`.

Consequences: the free-tier **Worker bundle size limit** is the main risk — mitigate with `better-auth/minimal` imports and OpenNext tree-shaking; ISR/incremental cache is backed by KV; `next dev` doesn't expose bindings, so binding-touching code is exercised via `wrangler dev`/`npm run preview`.
