# SPEC-001 — A whitespace-only answer is accepted, stored as `""`, and scores a point

- **Severity:** SPEC (README ambiguous; changing it is a rules decision)
- **Game / phase:** template (Quick Poll) / `answer`
- **Category:** Hostile content (empty / whitespace-only strings)
- **Status:** OPEN — recommended wording below; no code change made

## Repro

```
pnpm sim --fuzz hostile-content --game template --seed 1
# "hostile strings accepted + applied" lists three spaces, one space, TAB/LF/CR, NUL+nul, a lone surrogate, RLO+evil
```

Input `{ type: 'answer', text: '   ' }` passes `z.string().min(1).max(24)`; `reduceAnswer` stores
`text.trim()` → `""`; the player counts as submitted and scores 1; the TV reveals an empty bubble.

## Observed vs README

README "Inputs": _`text: string(1..24)` — accepted once per player_. README "Scoring": _1 point per
player who submitted an answer_. Neither says whether the 1..24 applies before or after trimming, nor
whether control characters / bidi overrides / lone surrogates are stripped the way player names are
(`normalizeName` strips them; answers do not).

## Recommended wording (pick one)

A. **Strict** (my recommendation, matches how names are treated): "`text` is trimmed and stripped of
control/zero-width/bidi characters; if fewer than 1 or more than 24 code points remain the input is
ignored (state unchanged, phone stays unlocked)." Implementation: reuse the name normaliser from the
SDK (export a `normalizeText(raw, max)` helper next to `normalizeName`), and make `inputSchema`
`.transform`/`.refine` on the normalised value so the phone gets `invalid_input` instead of silence.

B. **Lenient**: "Any schema-valid text counts as an answer, even if blank after trimming." Then the
TV should render blank answers visibly (e.g. "…") — for the design session.

Either way, add the chosen sentence under "Inputs" and a bullet under "Edge cases" so the next game
author copies the right behaviour (the template is the scaffold).
