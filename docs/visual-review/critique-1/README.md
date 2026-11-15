# Critique round 1 — evidence

Impeccable ran two isolated assessments per surface (design review + detector/browser
evidence) across four groups: public landing/login, discovery, dashboard/library/notes,
and account/system. The full synthesis lives in the PR body.

**Before** captures are the production site at `cast-cue.cast-cue.workers.dev`.
**After** captures are a local Next.js render of this branch. The local run had no TMDB
credentials, so artwork is omitted; the copy, surfaces, spacing and controls are the
evidence, not the posters.

| Image | What it shows |
|---|---|
| `compare-about-footer.png` | Invented 40K+/120+/1M+ stats and the non-functional newsletter replaced by three true facts and a real "Your library" path. Eyebrow labels removed. |
| `compare-login.png` | The grey, unexplained sign-in button replaced by a real page: back link, promise, Google action, and what the app stores. |
| `compare-about-footer.gif` | The same about/footer comparison, alternating before and after. |
| `animatic.mp4` | A 88-second narrated animatic of the PR: the problem, the five moves, two key hunks, the proof, and the rollback. |

Detector: one warning (`overused-font`, Space Grotesk), accepted as the committed
display voice in `DESIGN.md`. No errors. `pnpm typecheck` and `pnpm lint` pass with 0
errors.
