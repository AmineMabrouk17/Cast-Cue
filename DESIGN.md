# Design

<!-- impeccable:design-schema 1 -->

Cast n Cue is a dark cinema surface: near-black rooms, artwork as the only saturated colour, red reserved for the one action that matters. Dark-only is a product decision, not a theme default.

## Principles

1. The poster is the subject. Chrome stays quiet around it.
2. One red accent per view, on the primary action or the live state.
3. Text is white at three strengths, never grey-blue.
4. Depth is a hairline plus a shadow; never a glowing halo.
5. Every surface has a hover, focus, disabled, loading, and empty state.

## Colour

All colour lives in `src/app/globals.css` as OKLCH tokens, mapped onto HeroUI's semantic variables under `.dark`.

| Token | Value | Use |
|---|---|---|
| `--cinema-bg` | `oklch(0.13 0.006 285)` | page background |
| `--cinema-elevated` | `oklch(0.1 0.005 285)` | footer, inset bands |
| `--cinema-card` | `oklch(0.17 0.007 285)` | cards, fields |
| `--cinema-accent-surface` | `oklch(0.26 0.01 285)` | chips, hover surfaces |
| `--cinema-fg` | `oklch(0.98 0 0)` | primary text |
| `--cinema-muted` | `oklch(0.72 0.008 285)` | secondary text |
| `--cinema-red` | `oklch(0.56 0.22 27.5)` | primary action, live state |
| `--cinema-gold` | `oklch(0.84 0.16 88)` | star ratings only |
| `--border` | `oklch(1 0 0 / 0.1)` | hairlines |

Semantic aliases used by components: `background`, `surface` (`content1`), `elevated` (`content2`), `default`, `primary`, `danger`, `divider`, `gold`. A component may use a semantic alias, never a raw hex.

Contrast floors: body text and placeholders ≥ 4.5:1 against their surface; large display ≥ 3:1. Muted text is `--cinema-muted`, which clears 4.5:1 on `--cinema-bg`; do not darken it on cards.

## Type

- Display: **Space Grotesk** 500/600/700, headings only. Tracking `-0.02em`.
- Body: **DM Sans** 400/500/600/700.
- Scale: 12 / 14 / 16 / 20 / 24 / 30 / 36 / 48 / 60 / 72px. Page titles 24–30px; hero 48–72px.
- Body measure 65–75ch. Metadata and numerals use tabular figures.
- No monospace outside code, `S2E4` notation, and numeric detail.

## Layout

- Container: `max-w-7xl`, gutters 16px mobile / 24px tablet and up. Reading surfaces may narrow to `max-w-5xl`.
- Vertical rhythm: 4px base; section gaps 48–64px; card padding 16–24px.
- Page header pattern: `h1` 24–30px + one sentence of muted context, then content. No eyebrow above page titles.
- Grids: posters `2 / 3 / 4 / 5 / 6` columns by breakpoint, `aspect-2/3`; episode stills `16/9`.

## Surfaces

- **Landing**: full-bleed backdrop hero with one featured title, then trending rows, then an honest about band.
- **App shell**: sticky 64px header, hairline bottom border, blurred background; footer with browse and genre links.
- **Cards**: `rounded-xl`, `border-border`, `surface` background, 1px hairline, shadow only on hover, translate `-4px` on hover.
- **Drawers and panels**: `surface`, hairline, 12px radius; no nested cards.
- **Forms**: `field` background, 1px border, red focus ring at 2px offset.

## Motion

- One authored moment per view: hero crossfade (1000ms) and content rise (700ms, exponential ease-out).
- Hover transitions 200–300ms. No bounce, no parallax, no animation on every section.
- All non-essential motion is disabled under `prefers-reduced-motion: reduce`.

## States

Every interactive component ships hover, focus-visible, active, disabled, and loading. Every list ships empty, error, and skeleton states. Empty states name the next action, not the absence.

## Copy

Sentence case. Buttons name the verb ("Add to watchlist", "Mark completed"), never "Submit". Errors say what failed and what to do next. No exclamation marks, no "oops", no growth-marketing claims.
