# Who Said It — build notes

Branch `game/who-said-it`, worktree `C:/dev/partybox-game-who-said-it`, harness port 42340.

## Status

| Stage             | State                                                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 Content         | done: 120 family + 50 spicy prompts, 14 bot answers each, pack tests                                                                                                      |
| 2 Server + tests  | done: 7 phases, scoring, awards, recap, voice, bot from its own view; 73 unit tests; contract green; sim 800 games (random, idle, chaos, mixed × 200, 3–16 players) clean |
| 3 Client          | done: TV (7 screens), phone (write, guess, own line, scores), PhoneStage, EN + ES                                                                                         |
| 4 Record → review | 23 passes, see REVIEW.md; frame timing to re-measure on a quiet machine                                                                                                   |
| 5 Review package  | REVIEW.md written; waiting for the owner                                                                                                                                  |

## Platform pieces (all real since main 19bc87b6 — the stand-ins are gone)

`sameAnswer` from `@partybox/game-sdk/match`; `toSpeakable`, `speechKey`, `speakableName`,
`pendingCap`, `parsePronunciations` from `@partybox/game-sdk/speech`; `FacePicker` from
`@partybox/game-sdk/ui/face-picker` (a tap on the current pick is ignored: a guess can't be taken
back). ADR-050 layout: `client/{shared,phone-entry,tv-entry}.ts`, `manifest.es.json`, manifest
`icon` 🗣️ / `howToPlay` / `presence: anywhere` / `addedOn`. Phone download 11.5 KB gz (budget 33).
The fixed lines are still live readings (no render-clips pipeline for new games yet).

## Decisions and deviations (each with the reason)

1. **Name lines are made for every seated player when `write` ends**, not "only at that card's
   reveal" (§4.5). Rendering every name reveals nothing (it is the whole roster), and asking only
   at the reveal would make the flip wait for Kokoro (≈ 0.5–1.5 s) or say the name late. A merged
   card's "It was both Ana and Eli!" is still asked for at its reveal (pairs can't be pre-made).
   Proposed fix to the spec: "Name lines may be made for every candidate once `write` ends."
2. **The reveal is one phase with two beats** (`land`, `shown`, ADR-033). Authors, points and each
   phone's own line enter the views only at `shown`, so the phone can never run ahead of the TV.
3. **All-done exits keep a 0.9 s grace**, and a guess phase never closes before its answer has been
   read out — so the last ✓ lands on the TV and the reveal never talks over the reader.
4. **Bot answers**: the 💡 chips are dealt per seat from the shuffled bank (seat i gets bank[i]
   and bank[i + half]); a bot answers with its first chip, so up to bank-size bots answer
   differently without looking at other bots (ruling 20). A seat not flagged as a bot (sim,
   contract runs) taps 💡 first, like a person.
5. **Voice lines at the flip are fixed at the flip**: only a line already made plays (name, else
   "It was…", else silence), so a slow synthesiser never talks after the moment.
6. **Awards that tie** give one entry per winner (`<award>-<playerId>` ids, since the results
   screens key on the id).
7. `prompts` clamping: the manifest's description says a big room is capped at 40 answers; the
   settings screen has no per-setting live note today.

8. **The author sits out their own card** (the owner's ruling, 2026-09-24, over SPEC §4.5's
   camouflage): their phone says "This one's yours — sit tight" and their tap is ignored. Accepted
   cost: their ✓ is on the TV strip from the start, so a sharp room can read it as a tell.

## Open questions for the owner

- None blocking. The deviations above are reversible if the owner prefers the spec's letter.

## Review tooling (probes, not committed)

`packages/e2e/src/design/cap-wsi.tmp.ts` (focused recorder: TV + phone video, stills, strips, cue log,
clip trace via `window.__pbTrace`, `--phone-only`, `--lang`, `--theme`) and `cap-wsi-touch.tmp.ts`
(CDP finger abuse). `client/useSay.ts` traces `ws-say` booked / fired / skipped (no-op in production).
