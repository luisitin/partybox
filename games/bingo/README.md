# Bingo

Plain 75-ball bingo with free daubing and a public check. Design doc: `docs/game-ideas/001-bingo.html`.

## Sound (TV only)

Each call is a recorded clip — "B, 12" — that starts on the frame the ball enters (its
letter's lead-in silence skipped, `client/caller.ts`), with a "boing" as the ball squashes; a
new call cuts off the one being said; silent when the TV is muted. Background music: "Wallpaper" with
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
carries on. Points: 3, 2, 1, then ½ per bingo under a pattern (a blackout restarts the ladder).

## Players

1–16. The phone shows the call the way the TV's ball does (letter, number, the one before, the
count); the nickname is the TV's and the caller's — the TV can also keep a hall board of every number called (`showBoard`)
and the previous call (`showPrevious`); a phone that was away says how many calls it missed. Late joiners spectate (their phone shows the current call and the called list) and get a card
next game. A disconnected player's card and daubs persist; calls never wait for anyone.
**Bots: welcome** (`supportsBots: true`) — the bot daubs what it hears on its own cards, mis-taps about
1 in 20, and presses BINGO! when a live card looks complete, so it wins rounds and sometimes gets checked
in public like anyone else. It only reads what its phone shows (own card, own daubs, called numbers).

## Phases

| Phase        | What happens                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Exit                                                                                                                                                                                                     | Timer                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `intro`      | Deals the round: fresh deck (1–75 shuffled), `cards` fresh cards per player. The card-pick step: phones show the new cards dealt in, one "another" per card (`swap`, the new card flips in) and Ready (`ready`); the TV shows the pattern demo, the deal and who is still picking. Everyone with cards ready (bots and the disconnected count) → "first number in 3 · 2 · 1" with ticks on every screen, never sooner than 5 s from the deal. The card-style sheet also holds a per-device motion switch (off: cards switch without the rise).                                                                                                                                                                                            | everyone ready → 3 s countdown · deadline · VIP skip → `play`                                                                                                                                            | up to 15 s                                                                   |
| `play`       | One number on the TV (huge) with its caller nickname, plus the previous one small. Daub freely; BINGO! on a card takes two taps (arm, then claim; dibs for 3 s). A card-style menu open on any phone holds the caller (no deadline); the last one closing runs a 3 s countdown (`resumeAt`).                                                                                                                                                                                                                                                                                                                                                                                                                                              | valid claim → `bingo` · invalid claim → `check` · timer → next number (`play` again) · 75th call's timer → `bingo` (no winner) · VIP skip → next number                                                  | `callSeconds` (3–12), none while held, 3 s resuming                          |
| `check`      | The caller is paused. TV shows the invalid claim: green ✓ / red ✕ / outlined misses, "NOT A BINGO". Claimant's card is wiped. Two beats (ADR-033): the reveal, then the verdict (`round.judged` — the phones show nothing conclusive before it, `verdictShown`) read for 3 s.                                                                                                                                                                                                                                                                                                                                                                                                                                                             | deadline → `play` with a 3 · 2 · 1 (`resumeAt`), whose tick calls the next number (or `bingo` with no winner if the deck is empty) · VIP skip → next number at once                                      | the reveal (≈ 6–9 s by pattern) + 3 s to read                                |
| `bingo`      | The winner's card, revealed on the TV in beats ("X says BINGO!", the drop, the sweep, then "BINGO! X wins round n" — or "X — 2nd bingo in round n" / "X — 1st blackout in round n", `round.patternBingos`) — then any player chooses on their phone: keep going on the same cards (same pattern, the winner sits it out — or for a blackout), or move on. A choice made before the verdict has been read (the reveal + 3 s) is held (`round.decision`) and applied then. "No bingo — the deck's empty" when the deck ran out. The win is scored when the verdict lands (the phase's first tick, `round.judged`) — not on entry, so the strip's score and check mark cannot spoil the sweep; a VIP skip or end mid-reveal still scores it. | `continue` → `play` (a 3 s countdown on every screen — `resumeAt`, `resumeAgain` — then the number that was up repeats, same deck) · `next` / deadline / VIP skip → `scoreboard` (more rounds) or `done` | unpaced with a winner (5-min safety valve for abandoned rooms), 10 s without |
| `scoreboard` | Rounds won so far + the next round's pattern (its shape and name). The TV plays `tally`, not the phase chime — nothing needs the phone.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | deadline · VIP skip → next round's `intro`                                                                                                                                                               | 6 s                                                                          |
| `final`      | The final board, crown withheld ("and the winner is…") — the drumroll before the results fanfare.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | deadline / VIP skip → `done`                                                                                                                                                                             | 4 s                                                                          |
| `done`       | Final standings. `results()` non-null.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | terminal                                                                                                                                                                                                 | —                                                                            |

VIP `end` from any phase → `done` with rounds won as they stand (an unfinished round has no winner).
Pause freezes the caller (and a running check); daubs and claims are ignored while paused.

## Inputs

- `{ type: 'daub', card?: 0..3, index: 0..24 }` — toggles that square on your card `card` (default the
  first; tap again = undo). Accepted in `play` and `check`, from players with that card. Index 12 (FREE)
  is ignored. No validation against calls.
- `{ type: 'menu', open }` — any phase: this phone's card-style menu opened/closed. In `play` an open menu
  anywhere holds the caller (the deadline is dropped; daubs still land); when the last one closes the
  phase re-enters with a 3 s deadline (`round.resumeAt`, a 3 · 2 · 1 on every screen), then the next
  number. A menu open through a check holds the caller as play resumes.
- `{ type: 'swap', card? }` — `intro` only: one fresh deal per card ("deal me another"), the old one gone (`round.swapped`).
- `{ type: 'continue', pattern: 'same' | 'blackout' }` / `{ type: 'next' }` — accepted in `bingo`
  from any player with a card (first tap wins; phones show the buttons once the TV's verdict has
  landed — an earlier tap is held and applied then). `same` keeps the pattern; the card that won
  cannot claim it again (`round.won`, per card) but still takes daubs, the winner's other cards play
  on. `same` needs a contest (two players — everyone, in a two-player game — with an unwon card, nobody
  blacked out on every card), else only `blackout` (new pattern, every card reopens) or `next`. Cards,
  daubs and the deck carry on; the number that was up is called again; each bingo scores its rung (3, 2, 1, ½; blackout restarts).
- `{ type: 'bingo', card?: 0..3 }` — accepted in `play` only, from a player whose card `card` has not won
  the current pattern, who is not waiting for the next number. **Two taps**: the first arms that card for
  3 s (`round.arm` — this player has dibs; a tap on another of their cards re-arms there), the second tap
  on the same card claims it. Other players' first taps queue (`round.queue`, in order); a lapsed window
  passes to the next in line with a fresh 3 s from that moment (the armed phone sends `lapse`; the next
  event settles it anyway). A claim
  evaluates **that card only** against the pattern and the numbers called so far:
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
