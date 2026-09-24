# Herd Mind — build notes

Session: branch `game/herd-mind`, worktree `C:/dev/partybox-game-herd-mind`, harness port 42320.

## Status (2026-09-24)

| Stage              | State                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| 1. Content         | **Done.** 200 family + 80 spicy questions; pack test green (dedupe, accept → exact, style mix) |
| 2. Server logic    | **Done.** 5 phases, typed grouping + VIP merges, sheep, awards, recap, voice; 94 unit tests    |
| 3. Client          | In progress (built against today's main; entry files follow F1 when it lands)                  |
| 4. Record → review | Not started                                                                                    |
| 5. Review package  | Not started                                                                                    |

Sims: 200 random + 200 idle at 6 players, 50 at 16, 50 at 3 — 0 failures. Contract suite green.

## Platform pieces not on main yet, and the stand-ins in use

| Needed                            | Stand-in                                                                                                                                                                                                                                          | Swap when                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| F5 `@partybox/game-sdk/match`     | `games/herd-mind/server/match.ts` — Part 00 §4 with the audit's errata (#14–16, #25–31) and ruling 16; its cases in `__tests__/match.test.ts`                                                                                                     | F5 merges: delete both, import it |
| F6 `toSpeakable` + overrides      | `speakable()` in `server/speech.ts`: quotes, `___` → "blank", emoji out, whole-word respellings from `content/pronunciations.json`                                                                                                                | F6 merges                         |
| F6 fixed clips (`render-clips`)   | The five fixed lines are requested as ordinary readings through `speech(state)`: the host renders each once per voice and caches it on disk, so they behave like clips                                                                            | F6's pipeline exists              |
| F2a manifest fields               | Not added yet: main's schema would strip them and the contract deep-equals the file. To add: `icon` 🐑, `howToPlay` (spec §2.1), `presence: { needs: 'anywhere' }`, `addedOn: 2026-09-24`, tags from the fixed list (`quick` derived, so `words`) | F2a merges                        |
| F1 per-surface entries            | `client/index.ts` as today; split into `phone.ts` / `tv.ts` when the registry goes lazy                                                                                                                                                           | F1 merges                         |
| F4 presence / P1 per-player stage | Not needed by the rules (spec §2.14); PhoneStage follows `usePhoneOnly()` today and the per-phone stamp later with no game change                                                                                                                 | F4 merges                         |

## Decisions (made, noted, reversible)

- **Bots and rule 9.** The bot computes its own `controllerView` and chooses only among what it
  shows (the tiles, its own answer). The spec's popularity weights are the bot's content bank,
  looked up by the tiles its view shows; no view carries weights, so no phone can read them.
- **"All in" beat.** When every connected player has answered, `answer` closes 1.2 s later (not
  instantly), so the last ✓ lands before the reveal — no hard cut. Changing picks stays possible
  until then.
- **Typed `herd`** waits for the VIP (20 s) only when there are 2+ groups; otherwise it runs the
  tiles choreography.
- **Outcomes.** Besides herd and tie: `scattered` (everyone different, or one answer) and `empty`
  (nobody answered). The verdict line is "No herd. It's a tie." for a tie and "Baa." when scattered.
- **Phone results** only at `score` (the TV shows the herd during `herd`); two extra lines beyond
  the spec's four: "Alone with X. Nobody takes the sheep." (2+ alone) and "No answer this time."
- **Players gone for good** (`gone`) stop counting, cannot win, and drop the sheep. A plain
  disconnect keeps a player's answer.
- **Mind Meld** needs the pair to have matched at least twice (one shared group is not a meld).
- **Typed labels** for answers the list doesn't know: the most common form ignoring case, accents
  and spacing, as the earliest seat wrote it, first letter capitalised.
- **Merges**: the bigger group keeps its label (a tie keeps the first tapped); an Undo removes the
  last merge that formed a group.
- **Number questions**: number words are automatic after normalizing ("seven" = "7"), so packs
  list other variants ("lucky 7", "sevn"); the pack test rejects a number word as a duplicate.

## Conflicts found (for the owner)

- None blocking. Spec §2.15 says "six or more accept forms for every common answer" and number
  words as accepts for pick-a-number; the second collides with §4.2's dedupe rule (number words
  normalize to digits). Resolved as above: number words are implicit.

## Left to do

Client (TV + phone + PhoneStage), EN/ES strings, speech-lab pass (after F6), record-review passes,
screenshots, review package (`REVIEW.md`).
