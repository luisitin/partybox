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
- **No `PhoneStage`**: the SDK's `PhoneStage` gets only `{ view }` — no `send`, no `skip` — so in a
  phone-only room the VIP would lose ✓ That counts and Next word. The Controller renders the
  result stage itself when `usePhoneOnly()` (word, guess, every clue with its author) and keeps the
  VIP buttons; the intro's how-to-play is already on every phone. Same purpose as §7.4's
  `phoneStagePhases: ['intro', 'result']`, without losing the controls.
- **TV beats are timed from the phase's server start** (`view.phaseAt`), so a TV that reloads
  mid-phase lands on the right beat instead of replaying the show; readings more than 1.5 s late
  are dropped rather than read out of step with the cards.
- **Phone result line waits 2.1 s** (the TV's ✓ / ✗ / PASS mark lands at 1.5 s) — never spoil it.
- **Result cue is the stage's own** (`sounds.result = 'silence'`, then jackpot / bust / sweep on
  the mark's beat), so the outcome sound lands with the mark, not with the phase change.
- `state.won` / `state.lost` from §7.10 are derived (`piles()`), and per-player stats are derived
  from the turns (`tallies()`): smaller state, and nothing to keep in sync.

## Record-review findings fixed so far

- Bots (and quick humans) guessed ~1 s into `guess`, before the TV had turned the clues over →
  the server now holds an early answer until the reveal ends (`w.early`, "🔒 has an answer…").
- The survivors' cards turned every 420 ms while the reading took ~2.4 s → the card steps now
  follow the reading's length (420–900 ms each), on the TV and in the server's hold.
- The last "Looks good" tick swallowed the `guess` chime (the shell drops a cue within 50 ms of
  another) → the guess stage plays its own chime, then a soft pluck per card.
- 1.6–2.9 s of dead TV / 4 s of dead phone in `result` → quiet draining bar + a card flying to its
  pile; phone waiting screens centred.
- "glowin / g" mid-word breaks on cards → size steps by word length; check rows at 200 % text
  wrapped mid-word → the button drops to its own line.
- Tied awards shared an id → duplicate React keys on the shell's results screen; ids carry the
  player now.
- 200 % text: the intro's first step was clipped above the scroll area (centred overflow) →
  `align-content: safe center`.
- Idle rooms froze the TV (19–27 s) and phones (3–7 s): opacity-only idling was too faint →
  transform idling (guesser ring pulse, bobbing dots, the result word breathing, a floating icon on
  waiting phones, an empty box breathing after 3 s); an empty word's result is 4.5 s.
- 10 players: the second row of cards ran under the host bar → smaller two-row cards, room for
  author tags, the stage body clears the host bar.
- Touch pass (iPhone SE): no selection, zoom, page scroll or double send anywhere; the clue
  screen overflowed 10 px (drag jiggle) → a lower word card on short phones.

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
