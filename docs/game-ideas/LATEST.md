# Game design — LATEST

- 2026-09-15 · idea **001 Bingo** written (`001-bingo.html`): 75-ball, TV calls, phones are cards, server-validated BINGO! with a bogus penalty + 2-call lockout, shared-bingo window, patterns escalate line → X → blackout with 1/2/3 numbers per call. Status `idea`.
- Tooling: `_template.html`, `_tools/svg.mjs` (design-system SVG mockups), `_tools/build.mjs` (builds `_src/*.mjs` → HTML, regenerates `INDEX.html/.md` + coverage matrix). Rebuild with `node docs/game-ideas/_tools/build.mjs`.
- Research folded into §16 of 001: Bingo Party (host app), Crowdpurr, Bingo Buddies, Skillz Blackout Bingo, hall rules (4–6 s pacing).
- Build first: 001 — it is requested, sized M, and needs only two small shell changes.
- SDK gaps (`sdk-requests.md`): R-1 quiet timer mode (blocking for any short-cadence phase), R-2 game-triggered sound cues, R-3 a `penalty` chip status.
- Scorecard: all ≥ 4 except novelty (2, by request — it is bingo).
- Next: 002 — a draw-and-describe chain game (owner request; needs BL-002 canvas input, `maxInputBytes` raise); then fill the matrix (text/vote/hidden-roles are empty).
