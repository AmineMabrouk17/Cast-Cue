# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 15 App Router, React 19, Tailwind CSS v4, HeroUI 3, Better Auth, Cloudflare Workers + D1, deployed with OpenNext.

## Users

One person watching several shows at once, usually in the evening, on a phone or a laptop. They have a watchlist they never finish and a series they lost their place in. They want one calm place that answers "what am I watching, and where was I?" without turning television into homework.

## Product Purpose

Cast n Cue is a personal media tracker. A signed-in user bookmarks movies, series, and individual episodes; moves each bookmark through watchlist, watching, completed, or dropped; marks favorites; gives a half-star rating; and writes a private note. Success is that the user can return after a week and resume the exact episode without searching for it again.

## Positioning

Tracking happens at the episode, not the season. The dashboard derives the next unwatched episode from episode-level bookmarks, so a series with eight seasons still has one honest answer to "where am I?". Ratings and notes live on the bookmark, not on a public social profile.

## Operating Context

The product is used between episodes and after finishing something: adding a title from search, updating progress, rating it, writing a note, and checking what airs next. The library is private by default; a user can opt into a public profile at `/u/[slug]`. The app is English-only, dark-only, and assumes an authenticated Google account for every library screen.

## Capabilities and Constraints

- Search movies and series through TMDB; search episodes by name or `S2E4` notation.
- Bookmark a movie, series, or episode; status, favorite, rating (0–5, half steps), and private note.
- Dashboard: continue watching, next-airing episodes, watchlist roulette, quick links.
- Library with status filters, selection mode, bulk status/favorite/remove.
- Notes view, stats view, CSV import, public-profile visibility setting.
- TMDB is the sole identity authority; TVmaze and OMDb enrich. Cloudflare D1 stores users, sessions, and bookmarks.
- No social feed, comments, recommendations, streaming playback, or newsletter. No light theme.
- Auth is Google-only. There is no email/password flow.

## Brand Commitments

The name is "Cast n Cue" (the repo and worker use `cast-cue`). Voice is dry, warm, and cinema-literate: short sentences, no hype, no growth-marketing claims. The logo and the title's "Cue" in red are the only fixed identity assets.

## Evidence on Hand

The repository contains the real product: routes, schema, migrations, and the live app at `cast-cue.cast-cue.workers.dev`. There are no real usage numbers, testimonials, press mentions, or newsletter subscribers. Future work must not invent them.

## Product Principles

1. Answer "where was I?" before anything else.
2. One bookmark, one clear state. Never make the user infer progress.
3. Private by default; sharing is a deliberate switch.
4. Quiet surfaces for a loud medium. The artwork carries the drama.
5. Every control names the action it performs.

## Accessibility & Inclusion

Keyboard operability and visible focus are required. Body text must meet WCAG AA contrast on the dark surface. Motion must respect `prefers-reduced-motion`. The interface is English-only today; Arabic or French are not supported.
