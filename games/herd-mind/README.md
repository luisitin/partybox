# 🐑 Herd Mind

Think like the herd. Don't be the odd sheep. Full design: `docs/game-pack/herd-mind/SPEC.md`
(Part 01); build notes and open questions: `docs/game-pack/herd-mind/NOTES.md`.

## Overview

A question appears ("Name a pizza topping."). Everyone picks the answer they think **most people
will pick**. The single biggest group (2+) is the herd and each member scores 1. A tie for biggest
scores nothing. When exactly one player is alone on an answer, they take the **Black Sheep**, and
nobody holding it can win. First to the target without the sheep wins.

## Players

3–16, about 6 minutes (`estimatedMinutes: 8`). Bots welcome (`supportsBots`): they read their own
phone view and pick tiles with probability ∝ the pack's popularity weight^1.5 (typed mode: 70 % the
answer's display form, 30 % one of its accepted variants). Bots are never VIP. Late joiners
spectate. Plays the same in every presence mode (everything is typed or tapped).

## Phases

| Phase    | What happens                                                              | Ends when                                                          |
| -------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `intro`  | Title, the three rules, the Black Sheep token                             | 8 s, or VIP (Let's go)                                             |
| `answer` | The question and 8 tiles (or a text box); resend to change                | the pace's deadline; 1.2 s after every connected player is in; VIP |
| `herd`   | Answer cards land in groups; the herd rises; lone answers go to the side  | tiles: the choreography (~4.5–6 s); typed: VIP Score it, or 20 s   |
| `score`  | +1 over the herd, the sheep flies to its new holder, the race track moves | 5 s (6.5 s with a winner), or VIP (Next question)                  |
| `done`   | Results                                                                   | —                                                                  |

After `score`: `done` when someone won or the questions ran out, else the next `answer`. Typed
mode waits in `herd` only when there are 2+ groups to merge. Pause freezes any phase.

## Inputs

- `pick { tile }` — tiles mode, `answer` only, a tile on the current question.
- `type { text }` — typed mode, `answer` only; the first 30 characters are kept; text that
  normalizes to nothing is ignored (the phone says "Type an answer.").
- `merge { a, b }` / `unmerge { a, b }` — typed mode, `herd` only, VIP-stamped inputs only (ADR-042):
  group keys; a merge with itself, an unknown group or one already merged is ignored.

Everything else (wrong phase or mode, unknown tiles, spectators) is ignored.

## Scoring

After each question, in order:

1. **Group.** Tiles by tile; typed answers match the question's list (first `exact`/`stem`,
   else first `fuzzy`), leftovers group with each other (`sameAnswer`, union-find in seat order,
   labelled with their most common form), then the VIP's merges apply (the bigger group keeps its
   label). Non-answers and players gone for good are left out.
2. **Herd.** The single largest group with 2+ members: +1 each. A tie for largest: nobody scores.
3. **Black Sheep.** Starts in the pasture. When exactly one group has one member, that player
   takes it; with no lonely players or 2+, it stays where it is.
4. **Win.** Every player at or above the target who is not holding the sheep wins at once
   (shared). A holder at the target keeps playing and wins the moment the sheep moves on.
5. **Limit.** After the last question, the top scorers without the sheep win (a room that never
   scored shares a quiet draw — no fanfare).

Scores never go down. Ranking is by points, except a sheep holder who would outrank the winners
sits right below them. Awards (skipped when unearned, shared on ties): 🐑 Head of the Herd (most
times in the herd), 🦄 Free Spirit (most times alone), 🖤 The Black Sheep (held it for the most
questions), 🤝 Mind Meld (the pair in the same group most often, at least twice).

## Edge cases

- A player who doesn't answer can't score or take the sheep.
- One connected player: a group of one is never a herd, but they are the only lonely player, so
  they take the sheep; the game runs on deadlines.
- Everyone the same: all +1, the sheep stays. Everyone different: no herd, the sheep stays.
- The holder leaves for good: the sheep goes back to the pasture. Players gone can't win.
- An early end (VIP) still settles winners without the sheep holder.
- A reading that isn't made yet is skipped, never waited for; a late one re-times the verdict.

## Settings

| Key            | Type    | Default   | Options                                       |
| -------------- | ------- | --------- | --------------------------------------------- |
| `mode`         | select  | `tiles`   | tiles, typed                                  |
| `target`       | number  | 8         | 3–15                                          |
| `maxQuestions` | number  | 12        | 5–20                                          |
| `pace`         | select  | `normal`  | relaxed 25/35 s, normal 15/25 s, fast 10/20 s |
| `spicy`        | boolean | false     | adds the spicy pack to the draw               |
| `reader`       | select  | `jessica` | jessica, george, fable, sky, original, none   |

The reader says the question when `answer` starts, "The herd has spoken." as the cards land, then
the herd's answer ("Pepperoni!"), "No herd. It's a tie." or "Baa." at the verdict, "Black sheep!"
when it moves and "We have a winner.". Every line is also on screen.

## Content

`content/family.json` (200 questions) and `content/spicy.json` (80, behind `spicy`), English, each
item `{ id, style, prompt, say?, tiles?, answers[] }`; answers carry `weight` (0–100, the share of
people who'd say it), `accept` (6+ typed forms for common answers) and `reject`. Styles: name ~60 %,
best 15 %, pick 10 %, finish 10 %, would-you-rather 5 % (`"tiles": "all"`, 2–4 answers). Tiles: the
top 5 by weight + 3 drawn from the rest, shuffled. `content/pronunciations.json`: respellings for
the reader. State at 16 players and 20 questions stays under 40 KB (test).
