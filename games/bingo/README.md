# Bingo

Plain 75-ball bingo with free daubing and a public check. Design doc: `docs/game-ideas/001-bingo.html`.

## Sound (TV only)

Each call bounces in with a "boing", then the caller says it — "B, 12" — through the
Web Speech API (`client/caller.ts`: Windows "Zira", rate 1.15, pitch 1.1, falls back to the
browser's default English voice; silent when the TV is muted). Background music: "Wallpaper" with
the occasional "Cool Vibes", quiet, back to back (`music` on the client module; Kevin MacLeod,
CC BY 4.0, see the root README). A failed claim's buzzer comes from the synth; a bingo gets the party horn + crowd cheer (`cheer`).

## Overview

The TV calls one number every `callSeconds`; every player daubs their own 5×5 card (or cards — the
`cards` setting deals 1–4 per player) on their phone however they like (the server accepts every tap,
called or not). Press **BINGO!** and the caller stops: your card goes on the TV — with several cards,
the one nearest the pattern — the pattern in green ✓, every daub that was never called in red ✕,
missed pattern squares outlined. Right → a bingo: +1, and any phone may keep the round going on the
same cards (that card sits the pattern out; your other cards play on) or move on. Wrong → **that card
is wiped blank** (the penalty; re-daub from memory; your other cards keep their daubs) and the caller
carries on. One point per bingo.

## Players

1–16. The phone shows the call's nickname only ("Feeling fine"); the number is on the TV, so the room
has to listen to the caller — the TV can also keep a hall board of every number called (`showBoard`)
and the previous call (`showPrevious`); a phone that was away says how many calls it missed. Late joiners spectate (their phone shows the current call and the called list) and get a card
next game. A disconnected player's card and daubs persist; calls never wait for anyone.
**Bots: welcome** (`supportsBots: true`) — the bot daubs what it hears on its own cards, mis-taps about
1 in 20, and presses BINGO! when a live card looks complete, so it wins rounds and sometimes gets checked
in public like anyone else. It only reads what its phone shows (own card, own daubs, called numbers).

## Phases

| Phase        | What happens                                                                                                                                                                                                                                                                                      | Exit                                                                                                                                                    | Timer                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `intro`      | Deals the round: fresh deck (1–75 shuffled), a fresh card per player. TV: round number + pattern. Phones: pattern + the new card.                                                                                                                                                                 | deadline · VIP skip → `play`                                                                                                                            | 5 s                                                                          |
| `play`       | One number on the TV (huge) with its caller nickname, plus the previous one small. Daub freely; press BINGO! to claim.                                                                                                                                                                            | valid claim → `bingo` · invalid claim → `check` · timer → next number (`play` again) · 75th call's timer → `bingo` (no winner) · VIP skip → next number | `callSeconds` (3–12)                                                         |
| `check`      | The caller is paused. TV shows the invalid claim: green ✓ / red ✕ / outlined misses, "NOT A BINGO". Claimant's card is wiped.                                                                                                                                                                     | deadline · VIP skip → next number (or `bingo` with no winner if the deck is empty)                                                                      | 9 s                                                                          |
| `bingo`      | The winner's card, revealed on the TV ("BINGO! X wins round n") — then any player chooses on their phone: keep going on the same cards (same pattern, the winner sits it out — or for a blackout), or move on. "No bingo — the deck's empty" when the deck ran out. The win is recorded on entry. | `continue` → `play` (next number, same deck) · `next` / deadline / VIP skip → `scoreboard` (more rounds) or `done`                                      | unpaced with a winner (5-min safety valve for abandoned rooms), 10 s without |
| `scoreboard` | Rounds won so far + the next round's pattern.                                                                                                                                                                                                                                                     | deadline · VIP skip → next round's `intro`                                                                                                              | 6 s                                                                          |
| `done`       | Final standings. `results()` non-null.                                                                                                                                                                                                                                                            | terminal                                                                                                                                                | —                                                                            |

VIP `end` from any phase → `done` with rounds won as they stand (an unfinished round has no winner).
Pause freezes the caller (and a running check); daubs and claims are ignored while paused.

## Inputs

- `{ type: 'daub', card?: 0..3, index: 0..24 }` — toggles that square on your card `card` (default the
  first; tap again = undo). Accepted in `play` and `check`, from players with that card. Index 12 (FREE)
  is ignored. No validation against calls.
- `{ type: 'continue', pattern: 'same' | 'blackout' }` / `{ type: 'next' }` — accepted in `bingo`
  from any player with a card (every phone with a card shows the buttons; first tap wins). `same`
  keeps the pattern and the card that won cannot claim it again (`round.won`, per card — the winner's
  other cards play on; a one-card player who won is done until the pattern or round changes; with
  every card in the room locked `same` is off); `blackout` switches the round to blackout on the same
  cards and reopens every card. Cards, daubs and the deck carry on; each
  bingo in a continued round is another point.
- `{ type: 'bingo' }` — accepted in `play` only, from a player with a card that has not won the current
  pattern who is not waiting for the next number. Evaluates every live card and checks the closest one
  (a valid card first, else the most green, then the fewest red) against the pattern and the numbers
  called so far:
  - `red` = every daubed square whose number was never called (anywhere on the card);
  - the completion shown is the one with the most green squares; **valid iff it is entirely green**.
  - Valid → `bingo` (+1, that card locked). Invalid → `check`: that card's daubs wiped (other cards keep
    theirs), `waitForCall = drawn + 1` (you may claim
    again once the next number is called). A `bingo` during a check is ignored (one check at a time).

## Scoring

`+1` per bingo; nothing else. Ties share the rank; no awards. **Scores never go down.** Bots score
exactly like humans.

## Edge cases

- **Two claims on the same number**: the first processed is checked; the second is ignored during the
  check and can be made right after (if the first was valid the round is already over).
- **Valid pattern plus stray red daubs elsewhere**: still a bingo; the reds show in the celebration.
- **Several cards, one press**: BINGO! checks whichever of your live cards is closest; a failed claim
  wipes only that card; a won card sits the pattern out while the others play on.
- **Un-daubed pattern square that _was_ called**: invalid — you must daub it. Outlined in the check.
- **Deck empties during a check**: the check's timer ends the round with no winner instead of drawing.
- **Everyone idle**: each round runs the whole deck (75 × 6 s = 7.5 min) and ends with no winner; three
  rounds ≈ 24 min < `estimatedMinutes × 3`.
- **Claim spam**: one check per claim, one claim per player per number after a failure, claims during
  checks ignored.
- **Bot owner leaves / bot added mid-game**: the bot's card persists like any disconnected player's; a
  bot added mid-game is a spectator (card `null`, bot returns `null`) and is dealt in next game.
- `daub` with index 12, from a spectator, or in any other phase → ignored. Stale timers → ignored.

## Settings

| Key               | Type    | Default                          | Range                         | Effect                                                      |
| ----------------- | ------- | -------------------------------- | ----------------------------- | ----------------------------------------------------------- |
| `rounds`          | number  | 3                                | 1–5                           | Rounds played; fresh cards and deck each round.             |
| `round1`…`round5` | select  | line, corners, x, line, blackout | line / corners / x / blackout | The pattern for that round (only the first `rounds` apply). |
| `cards`           | number  | 1                                | 1–4                           | Cards dealt to every player each round.                     |
| `callSeconds`     | number  | 6                                | 3–12                          | Seconds each number stays up before the next call.          |
| `showBoard`       | boolean | false                            | —                             | TV shows the hall board of every number called so far.      |
| `showPrevious`    | boolean | true                             | —                             | TV shows the previous number under the current call.        |
| `spicy`           | boolean | false                            | —                             | Cheekier caller nicknames for some numbers (PG-13).         |

Patterns: **line** = any full row, column or diagonal (FREE counts); **corners** = the four corners;
**x** = both diagonals; **blackout** = every square. Settings are fixed at init.

## Content

`content/calls.json` — 75 family caller nicknames, one per number (traditional caller lingo adapted to
75-ball numbering). `content/calls-spicy.json` — 20 cheekier overrides used when `spicy` is on. The
letter is derived from the number (`B` 1–15 … `O` 61–75), never stored. Bots draw nothing from content.
