# Echo — build notes

Branch `game/echo`, worktree `C:/dev/partybox-game-echo`, harness port 42370.

## Status (2026-09-24)

| Stage              | State                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------- |
| 1. Content         | ✅ 300 family + 80 spicy words, 10 bank clues each, pack test green                   |
| 2. Server logic    | ✅ 6 phases, bots, awards, recap, speech; 78 unit tests; contract green; sim 800 runs |
| 3. Client          | in progress                                                                           |
| 4. Record → review | not started                                                                           |
| 5. Review package  | not started                                                                           |

## Platform pieces not on main yet (stand-ins in use)

Foundation work lives on branch `foundation` and does not merge until the owner says ship
(`docs/game-pack/DECISIONS.md`, "Pacing"). Echo builds against thin local stand-ins:

| Piece                                   | Stand-in                                                                  | Swap when it lands                                                                           |
| --------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| F5 matcher (`@partybox/game-sdk/match`) | `games/echo/server/match/` (Part 00 §4 + audit #14–16, #25–31, ruling 16) | replace imports; keep `echoes.test.ts` as the regression table                               |
| F6 `toSpeakable`                        | `games/echo/server/speakable.ts` (only rules a one-word clue can trip)    | route every reading through the SDK function                                                 |
| F6 fixed clips (`render-clips`)         | fixed lines are asked for as live readings (host caches by key forever)   | render the 14 lines × 5 voices as clips; play with `clip()`                                  |
| F6 speech key format                    | `ec` + two 32-bit hashes in decimal (main's key regex has no hyphens)     | use the SDK `speechKey`                                                                      |
| F2 manifest fields                      | not added (zod would strip them; the contract deep-equals the manifest)   | add `icon` 🔁, `howToPlay`, `presence: { needs: 'anywhere' }`, `addedOn`, `manifest.es.json` |
| F7 `SecretCard`                         | (client) local hold-to-see card in `games/echo/client/`                   | swap to the Imposter session's SDK piece                                                     |
| F4 presence / `useCanSeeTv`             | phone-only rooms only (`usePhoneOnly`)                                    | per-phone stage for remote players                                                           |

## Decisions (made, with reasons)

- **Contains-the-word check is against the answer + family roots only**, not every accepted form
  (Part 00 §4.7 says "the compact secret"). The first draft checked accepts too and made the
  writers drop real synonyms (panda bear, cheeseburger, looking glass); fixed and restored.
- **Bot guesser passes when no surviving clue is in any bank** (k = 0). The spec's
  p = 0.3 + 0.15k would guess an arbitrary word 30 % of the time, and a wrong guess burns a word.
- **Check is skipped with fewer than 2 clues** (nothing to split or join), as well as when off.
- **Survivors and check rows are shown in text order**, never seat order, so the room can't work
  out who wrote what (§7.5 "who wrote which clue: nobody until result").
- **A swap restarts the clue clock** (and with it the 15 s Don't-know window) for the new word.
- **3-player games need exactly two clues**; one text is refused with "count".
- **Result beat 6.5 s, +1.8 s when a word burns or a won word is lost** (the slide onto the pile).
- **VIP "That counts" extends the result to at least half a beat** so the room sees the change.
- **Deck piles are derived from the turn records**, so the VIP override recomputes everything.
- `state.won` / `state.lost` from §7.10 are derived (`piles()`), and per-player stats are derived
  from the turns (`tallies()`): smaller state, and nothing to keep in sync.

## Open questions for the owner

1. **Co-op results headline.** The contract suite requires a winner, so every player shares rank 1
   and the shell's results screen says "It's a tie!" with everyone crowned — even on 🔁 Try again!
   (Tune In's spec has the same fallback.) Recommend: a small shell change so a co-op game's
   `Finale` owns the headline (e.g. a `coop: true` client-module flag), done once for Echo and
   Tune In. Until then the finale board carries the verdict.

## Content notes

- Warnings (fewer than 6 accepted forms) remain only where no honest form exists: fog, key, map,
  zoo, bat, egg, bed and similar short words.
- Rejects guard look-alikes across the pack: veterinarian/vegetarian, baker/bakery,
  carpenter/carpet, clown/cloud, wind/window, lightning/lighting.
- `pronunciations.json` is empty until the speech-lab pass (F6).
