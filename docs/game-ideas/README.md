# docs/game-ideas/

Owned by the game-design session (branch `designer`, no server or port).

- `NNN-<slug>.html` — one self-contained, implementation-ready design document per idea (inline CSS/SVG, opens offline). **Generated** from `_src/NNN-<slug>.mjs`; edit the source, then `node docs/game-ideas/_tools/build.mjs` and `pnpm prettier --write docs/game-ideas`.
- `_template.html` — page skeleton (sticky TOC, print styles, fixed section ids `s0…s16`).
- `_tools/svg.mjs` — design-system SVG mockup helpers (TV 960×540 = half 1080p, phone 360×780). `_tools/build.mjs` — builder + index generator.
- `_tools/sim-NNN-<slug>.mjs` — headless model of an idea's reducer, run with `node`; checks termination, fuzz, determinism, sizes and rule invariants before anyone implements it. Results live in §13 of the idea.
- `INDEX.html` (card grid) / `INDEX.md` (table + coverage matrix) — generated.
- `LATEST.md` — 10-line digest for the owner. `sdk-requests.md` — contract/SDK gaps found while designing.

Sections of every idea: 0 header · 1 hook · 2 a round from a seat · 3 rules · 4 phase table · 5 screens · 6 data model · 7 reducer · 8 scoring · 9 content · 10 edge cases · 11 art & sound · 12 accessibility · 13 implementation plan + design simulation · 14 open questions · 15 scorecard · 16 prior art & references.
