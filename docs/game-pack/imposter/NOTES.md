# Imposter — build notes

Branch `game/imposter`, worktree `C:/dev/partybox-game-imposter`, harness port 42310.

## Status (2026-09-24)

- **Content: done.** 14 family + 6 spicy categories × 12 words (240). Every word has 6+ accept
  forms, rejects, family roots and 8–10 crew clues that pass `isLegalClue`. Every category has 12+
  imposter clues that are legal for all of its words. No accepted form is shared between two words
  anywhere. `content/pronunciations.json` holds 83 respellings. Checked by
  `games/imposter/__tests__/packRules.ts`.
- **Server: done.** Every phase from SPEC §1.3, scoring and runoffs (§1.6), inputs (§1.7), views
  with per-beat reveals (§1.8), the bot (§1.9), readings (§1.11), settings and presence
  (§1.12–1.13), edge cases (§1.15) and the recap (§1.17).
  - 117 game tests and the contract suite (85) pass.
  - `pnpm sim` 200 seeds × random and idle × 4/10/16 players: 0 failures, longest game 682 s.
  - At 16 players (8 rounds × 3 clue rounds): state ≈ 10 KB, TV view ≈ 3.9 KB, phone view < 4 KB.
- **Client: next.** SecretCard and FacePicker (mine to build in the SDK), then the TV, the
  controller and PhoneStage, then record-review.

## Stand-ins until the Foundation lands (swap each when its F-task reaches main)

| Stand-in                                           | Replaces                                      | Swap                                                                                            |
| -------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `games/imposter/match/`                            | F5 `@partybox/game-sdk/match`                 | Same names and signatures, so it's an import change; run `match.test.ts` against the SDK module |
| `server/speakable.ts`                              | F6 `toSpeakable` and override lists           | Subset of Part 00 §5.3 plus the §5.5 name rule                                                  |
| Fixed lines rendered live by `speech()`            | F6 `render-clips` WAVs played with `clip()`   | Same text and voice; the host caches each key                                                   |
| `presenceOf(ctx)` reads an optional `ctx.presence` | F4 `InitContext.presence` (ADR-047)           | Nothing to change: it becomes typed                                                             |
| Speech key `imp<hash>` (letters and digits only)   | Audit #18 wider key regex, shared `speechKey` | The key regex on main still rejects hyphens                                                     |

## Conflicts and decisions (for the owner)

1. **Manifest pack fields** (`icon`, `howToPlay`, `presence`, `addedOn`, tag enum): main's
   `gameManifestSchema` does not have them yet, and zod would silently strip them (audit #58). I
   add them the moment F2's schema lands. Tags already follow the fixed list: `bluff`,
   `hidden-roles`, `words`.
2. **"Spicy categories are listed only when spicy is on"** (§1.12): a multiselect's `groupBy`
   needs a sibling _select_, and `spicy` is a boolean, so the platform can't hide the options.
   **Done instead:** the 🌶 categories are listed with a pepper and ignored while Spicy is off.
   **Proposed fix:** a platform `shownWhen: { key, value }` on multiselect options (small engine
   change), or make `spicy` a select (off/on) with `groupBy`.
3. **Phone view budget:** §1.8 asks for ≤ 2 KB, but the 16-player envelope alone is ≈ 1.5 KB
   (audit #55). I hold phones to 4 KB, the owner's ruling 20 (tested).
4. **Simulator note (§1.12):** the sim plays default settings (3 rounds, ≈ 9 min; max 11.4 min at
   16 players, under 3 × `estimatedMinutes`). The slowest legal combination (8 rounds × 3 clue
   rounds × 90 s plus 180 s of talk) runs about 100 min. I **kept the maximums and
   `estimatedMinutes: 10`**, and added an `estimate` so the picker's "~N min" follows the chosen
   settings. Say if you'd rather have lower maximums.
5. **One-word and 20-character rules apply to everyone**, the imposter included. They are not
   secret-based, and applying them to all keeps the two roles' screens and rejections identical.
   Only the word-based checks are crew-only.
6. **`spectator` is an envelope key**, so the phone view says `seated: false` for a spectator.
7. **Void round** (every imposter left before the vote) jumps to `wordReveal` with "The imposter
   left the building", no points, then `scores`, then the next round.
8. **VIP skip inside paced reveals** deals the next card (`clueReveal`) or the next accusation beat
   (`accuse`) instead of skipping the whole reveal, as in Blanks' reveal.

## Content notes

- Short accept forms make some clues illegal for that word only, e.g. "tea" rules out "steam" for
  tea and "roo" rules out "room" for kangaroo. The writers kept clues clear of these.
- "hoover" is accepted for vacuum (UK everyday word), and "football" for soccer, with "american
  football" rejected.
- Spicy stays at drinking, dating and embarrassment level.

## Left to do

SecretCard + FacePicker (SDK, pick-two) → TV + controller + PhoneStage (EN + ES) → record-review
passes (TV and phones, video and sound, touch abuse, 320×568 / 390×844 / sideways / 200 % text /
Spanish / five themes) → review package in `REVIEW.md`.
