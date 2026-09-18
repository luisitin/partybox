# Blanks — the spec (tests and the stress session treat it as the truth; original content only)

## Overview

A black card sets up a sentence with a blank (or asks a question); every player but the judge plays
white cards from a hand of ten to finish it. The TV — and every phone — reads each combination out one
at a time, anonymously; then the room votes (or a rotating judge picks). The winner's author is revealed
and takes one point. Playable with no TV in the room: from the reveal on, the phones carry the same cards.

## Players

3–12; ≈ 20 min by default (6 rounds). Every `init` player plays every round, connected or not (a
disconnected player's card is simply not played). Late joiners spectate (engine behaviour). Bots:
welcome (`supportsBots`) — the bot plays random cards from its hand and votes at random.

## Phases

| Phase    | TV                                                                                                                     | Phone                                                       | Exit                                                                                                                                                                                                                                                            |
| -------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `intro`  | "Round r of R" (+ the judge's name in czar mode); a quiet bar, no countdown                                            | round card                                                  | 5 s or VIP skip → `pick` (czar mode) or `answer`                                                                                                                                                                                                                |
| `pick`   | czar mode only: the three black cards the judge chooses between                                                        | judge: tap one; others: "Sam is picking the question"       | the judge's choice, 20 s (timed; hidden 60 s fallback untimed) or VIP skip → the first card by default → `answer`; a judge who is gone → `answer` at once                                                                                                       |
| `answer` | the black card, "n / m in" + who is missing                                                                            | black card + hand; tap `pick` cards in order, play          | a 1.5 s beat after all connected answerers played ("Everyone's in!"; a drop that completes the room skips the beat), Next from any player (untimed), `answerSeconds` + 15 s per extra card (timed; hidden 3 min fallback untimed), or VIP skip → first `reveal` |
| `reveal` | one filled card, big; the ones already read, small; a quiet bar                                                        | the same card                                               | 2.2 s + 18 ms/char ≤ 4 s (past 8 cards: 2 s + 14 ms/char ≤ 3.2 s) → next `reveal` or `judge`; VIP skip → `judge`                                                                                                                                                |
| `judge`  | every card with its letter (pages of what fits, turning every 6 s, when the stage cannot hold them all), "n / m voted" | voters: `VoteList`; the judge alone in czar mode; rest wait | all connected eligible voters voted, Next (untimed; not past a connected judge), 30 s (45 s czar or past 8 cards; hidden 2 min fallback untimed), or VIP skip (votes so far count) → `result`                                                                   |
| `result` | winner card + author + votes, other authors, +1                                                                        | winner card, my score / rank, compact board                 | Next (untimed; hidden 60 s fallback), 8 s (timed), or VIP skip → next `intro`, or `final` (the board's 4 s drumroll, then `done`) after round `rounds`                                                                                                          |
| `final`  | final board, crown withheld ("And the winner is…"); a quiet bar                                                        | final rank + board                                          | 4 s or VIP skip → `done`                                                                                                                                                                                                                                        |
| `done`   | final board                                                                                                            | final rank + board                                          | terminal: `results()` non-null. VIP end from any phase → `done` with the scores so far                                                                                                                                                                          |

Round start (`intro` entry): last round's played cards to the discard, hands back to 10 (+ the black
card's `draw`) — topping up first so every hand holds at least 2 things, 2 doings and 2 combos (a
heuristic on the card text: gerund / linking word / the rest) while the deck has them — the judge chosen (czar mode: seat order by id, one per round,
disconnected seats skipped), a black card drawn — three in czar mode, for the judge to choose between in
`pick` (the two not chosen go under the deck); its extra draws and Rando's cards (setting) follow once the
card is final, on `answer` entry. Decks shuffled once at `init`; a dry white deck
reshuffles the discard, a dry black deck reshuffles its pool. Slots (reveal / vote order) are shuffled
when `answer` closes, so a letter never hints at who played it.

## Inputs

`{ type: 'play', cards: string[1..3] }` — during `answer`, from a non-judge player, once: exactly the
black card's `pick` ids, distinct, all in that player's hand, in blank order. `{ type: 'vote', slot }` —
during `judge`, from an eligible voter (everyone in vote mode; the judge alone in czar mode), once, never
on their own slot. `{ type: 'next' }` — from any player during `answer`, `judge` or `result` when
`timed` is off: the phase ends as its deadline would (unplayed cards sit out, votes so far count).
`{ type: 'choose', index }` — during `pick`, from the judge: `index` into the three black cards.
Anything else leaves the state unchanged.

## Scoring

One point per round to the most-voted card's author; a tie shares the point. One submission is a
**walkover** (no reading, no vote, one point). Two submissions whose authors are the only voters skip the
vote too (each could only vote for the other): both take the point. No votes → nobody scores. Rando's wins pay nobody. Points
lock in when `result` starts, once per round. Ties share a rank; winners = every rank-1 player. Awards
(a real player each; ties → higher score, then lower id): **Crowd favourite** (most votes received, if
any), **Quick draw** (most cards played within half the answer time — `answerSeconds` / 2 from the phase's start,
measured against the deadline so a pause never cheats it; the same yardstick when untimed).

## Edge cases

- Nobody played: `answer` → `result` ("Nobody played a card"), no reveal, no vote.
- A voter whose card is the only one up (everyone else sat out) is not waited for and cannot vote.
- Disconnected players never block "all played" / "all voted"; the judge dropping during `judge` ends
  it with no winner, and a phase nobody connected can act in (the judge already gone, every answerer
  gone) ends the moment it starts. A reconnect before the deadline can act. VIP skip: `intro` → `answer`; `answer` →
  reveal with the cards so far; `reveal` → `judge` (rest of the reading skipped); `judge` → `result`
  with the votes so far; `result` → next `intro` or `final`; `final` → `done`. VIP end → `done` from anywhere (a round
  whose `result` never ran scores nothing). Pause holds the deadline. Every phase but `done` has a
  deadline, so an idle room finishes on timers alone.
- A hand short of `pick` (only with a tiny deck) sits the round out; the phone says so.

## Settings

`decks` select `wild` (`mild` · `adults` = mild + crude · `wild` = all three · `wild-only`) · `judge`
select `vote` (`vote` = everyone votes, `czar` = a rotating judge) · `timed` boolean false (off: no clock
on picking, voting or the result, anyone taps Next; the screens hide the long fallback timers) · `rounds`
number 6 (3–15) · `answerSeconds` number 60 (30–120, step 15; timed only) · `rando` boolean false.

## Content

Three decks, `mild.json` (clean, 241 black / 729 white), `crude.json` (adult, 172 / 606) and `wild.json`
(explicit, 237 / 959): `{ id, name, rating, black: [{ id, text, pick, draw }], white: [{ id, text }] }`,
blanks written `____`, `pick` ≥ blanks (a question card has none), `draw` 2 on Pick 3 cards. Mainstream
real-world references are fine in crude and wild (heads of state past and present, well-known events);
no obscure ones; no slurs or hate, nothing sexual involving minors, no non-consent. Add cards with
`pnpm exec tsx scripts/blanks-add-cards.ts <deck> black.txt white.txt` (ids, pick/draw and dedupe are
automatic).
