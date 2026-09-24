# Who Said It — build notes

Branch `game/who-said-it`, worktree `C:/dev/partybox-game-who-said-it`, harness port 42340.

## Status

| Stage             | State                                                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 Content         | done: 120 family + 50 spicy prompts, 14 bot answers each, pack tests                                                                                                      |
| 2 Server + tests  | done: 7 phases, scoring, awards, recap, voice, bot from its own view; 73 unit tests; contract green; sim 800 games (random, idle, chaos, mixed × 200, 3–16 players) clean |
| 3 Client          | in progress                                                                                                                                                               |
| 4 Record → review | not started                                                                                                                                                               |
| 5 Review package  | not started                                                                                                                                                               |

## Stand-ins (swap when the owner's piece lands on main)

| Needed                                                                  | Owner            | Stand-in                                                                                                                                                                        |
| ----------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sameAnswer` (`@partybox/game-sdk/match`)                               | Foundation F5    | `games/who-said-it/server/match.ts` (same rules + audit errata)                                                                                                                 |
| `toSpeakable` + overrides                                               | Foundation F6    | `games/who-said-it/server/speakable.ts`                                                                                                                                         |
| `speechKey` / engine version                                            | Foundation F6    | `server/speech.ts` (`ws` + FNV over version, voice, parts)                                                                                                                      |
| Fixed clips (render-clips pipeline)                                     | Foundation F6    | the five fixed lines are live readings with constant text (cached forever by key)                                                                                               |
| `FacePicker`                                                            | Imposter session | a local picker in `client/` (to build)                                                                                                                                          |
| Manifest `icon`, `howToPlay`, `presence`, `addedOn`; `manifest.es.json` | Foundation F2    | not added yet: the schema on main strips them and the contract deep-equals the JSON (audit #58). Values ready: 🗣️; the three spec steps; `{ needs: 'anywhere' }`; `2026-09-24`. |
| Per-phone stage (`canSeeTv`, P1/P2)                                     | Foundation F4    | PhoneStage works for phone-only rooms today                                                                                                                                     |

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

## Open questions for the owner

- None blocking. The deviations above are reversible if the owner prefers the spec's letter.
