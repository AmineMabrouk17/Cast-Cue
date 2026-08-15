<div align="center">

<img src="public/logo.png" alt="Cast n Cue logo" width="140" height="140" />

# 🎬 Cast n Cue

**Your personal movie & TV companion — track what you watch, episode by episode.**

Bookmark movies, series, and individual episodes, follow your progress, rate them with half-star precision, and leave private notes on everything. Your watchlist, your rules.

[![Live app](https://img.shields.io/badge/%F0%9F%9A%80%20Try%20the%20live%20app-cast--cue.cast--cue.workers.dev-blueviolet?style=for-the-badge)](https://cast-cue.cast-cue.workers.dev)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/AmineMabrouk17/Cast-Cue)

</div>

---

## ✨ Why Cast n Cue?

Watching TV is one thing — **keeping up with it** is another. Cast n Cue is a personal media tracker built for people who juggle a dozen shows at once and need one calm place to hold it all:

- **Never lose track** of where you are in a 8-season epic — episode-level bookmarks mean your spot is always saved.
- **Never miss an episode** — see exactly what's airing next and when.
- **Decide faster** — roll the dice on your watchlist when you can't pick.
- **Remember everything** — star ratings and private notes you can write and re-read years later.

It's private by design, free to use, and lives in your browser — sign in with Google and go.

## 🚀 Try it live

<div align="center">

### [👉 cast-cue.cast-cue.workers.dev](https://cast-cue.cast-cue.workers.dev)

</div>

---

## 🧭 Features

### 🏠 A dashboard that plans your evening
The home screen is built around what matters most right now:

- **▶️ Continue watching** — everything you're mid-way through, ready to jump back into. For series, it figures out the exact next unwatched episode.
- **📅 Up next** — episodes from your library that are airing soon, sorted by date with "Today" / "Tomorrow" labels.
- **🎲 Watchlist roulette** — can't decide? Shuffle your watchlist and let fate pick.
- **⚡ Quick links** — jump straight to your Library, Notes, or Search.

### 🔍 Search everything
- **Movies & series** — powered by TMDB's full catalog.
- **Episodes by name** — search episode titles directly (via Trakt).
- **Season/Episode notation** — type `Breaking Bad S1E1` and jump straight to that episode.
- **Instant** — debounced live search as you type, with per-type result tabs.

### 📚 A library that works for you
- Bookmark any movie, series, **or episode**.
- Organize with four tracking statuses: **Watchlist → Watching → Completed → Dropped**.
- Filter the library by status or **Favorites**, each with live counts.
- Manage everything straight from the grid — change status, favorite, rate, remove.

### 📺 Episode-level tracking
- Full **season guide** per series with a season selector and airdates (enriched by TVmaze).
- Bookmark and track **individual episodes** — perfect for binging, catching up, or logging your way through a show.
- Episode detail pages with still, synopsis, runtime, airdate, and your own rating & notes.

### ⭐ Ratings & reviews
- Rate on a **0–5 scale with half-star precision** (tap the left or right side of a star).
- Aggregated **scores from TMDB, IMDb, and Rotten Tomatoes** side by side on every detail page.
- **Private notes** on anything — with debounced autosave, so your thoughts are never lost.

### ❤️ Favorites & recaps
- Heart any movie, series, or episode to keep a favorites collection.
- A dedicated **Notes page** gathers every note you've written in one scrollable stream.

### 🎬 Rich media detail pages
- Cinematic backdrop hero with poster, genres, and synopsis.
- **Embedded YouTube trailers**.
- **Cast grid** with character names.
- Full episode guide for series, right on the page.

### 🎯 Trending discovery
- **Trending now** for movies and series, refreshed weekly — even before you sign in.

---

## 🛠️ Tech stack

| Layer | Technology |
| ----- | ---------- |
| Framework | [Next.js 15](https://nextjs.org/) (App Router) + React 19 |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Runtime | [Cloudflare Workers](https://workers.cloudflare.com/) via [OpenNext](https://opennext.js.org/cloudflare) |
| Database | [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite) |
| Auth | [Better Auth](https://better-auth.com/) with Google OAuth |
| UI | [HeroUI](https://heroui.com/) + Tailwind CSS, dark-mode-first |
| CI/CD | GitHub Actions → automatic deploy to Cloudflare Workers |

### 📡 Metadata sources
A **fan of APIs** — each one does what it's best at:

| Source | Used for |
| ------ | -------- |
| [TMDB](https://www.themoviedb.org/) | **Canonical identity** — search, detail pages, season & episode data, trailers, cast, trending |
| [OMDb](http://www.omdbapi.com/) | IMDb & Rotten Tomatoes score badges |
| [Trakt](https://trakt.tv/) | Episode-title search |
| [TVmaze](https://www.tvmaze.com/) | Airdate & runtime enrichment |

---

## 🚀 Getting started

```bash
# 1. Install dependencies
pnpm install

# 2. Configure local secrets
cp .dev.vars.example .dev.vars   # fill in API keys & auth secrets

# 3. Run the dev server
pnpm dev                          # Next.js dev server

# 4. (or) run the full Cloudflare runtime with D1 + secrets
pnpm preview
```

### Database (D1)

Migrations live in `migrations/`. The D1 binding is `DB` (`wrangler.jsonc`).

```bash
pnpm run db:migrate:local   # apply migrations to the local D1 database
pnpm run db:migrate:remote  # apply migrations to the remote D1 database
```

### Production secrets

```bash
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put TMDB_API_KEY
npx wrangler secret put OMDB_API_KEY
npx wrangler secret put TRAKT_CLIENT_ID
npx wrangler secret put BETTER_AUTH_SECRET
```

### Scripts

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

---

## 🗺️ Architecture & docs

- **`CONTEXT.md`** — the domain language (bookmarks, statuses, "next up", and friends).
- **`docs/adr/`** — architectural decision records (why TMDB is the identity authority, why Cloudflare Workers + D1, why Better Auth on a Worker).
- **`docs/agents/`** — issue-tracker conventions and triage labels for agent workflows.

---

## 🤝 Contributing

Want to improve Cast n Cue? Ideas are tracked as GitHub issues — check the [open issues](https://github.com/AmineMabrouk17/Cast-Cue/issues) and dive in. Please open an issue first for anything non-trivial so we can align before you build.

<sub>Built with ☕ and a deep love of staying current on TV.</sub>
