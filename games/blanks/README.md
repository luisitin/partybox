# Blanks — the spec (tests and the stress session treat it as the truth; original content only)

## Overview

A black card sets up a sentence with a blank (or asks a question); every player but the judge plays
white cards from a hand of ten to finish it. The TV — and every phone — reads each combination out one
at a time, anonymously; then the room votes (or a rotating judge picks). The winner's author is revealed
and takes one point. Playable with no TV in the room: from the reveal on, the phones carry the same cards.

## Players

3–12; ≈ 15 min by default (6 rounds — a round runs about a minute in a small room and closer to two with a full one; measured over live captures in review-loop #219). Every `init` player plays every round, connected or not (a
disconnected player's card is simply not played). Late joiners spectate (engine behaviour). Bots:
welcome (`supportsBots`) — a bot plays the cards that read best blank by blank (`server/bot.ts`: the
fit model's score for what each blank wants — a Pick 2 may want a person, then a thing (`slots` in the
deck JSON) — the card's tier, a little noise) and votes the same way; the czar bot picks a prompt at random.

## Phases

| Phase    | TV                                                                                                                                                                                                                                       | Phone                                                                                                        | Exit                                                                                                                                                                                                                                                            |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `intro`  | "Round r of R" (+ the judge's name in czar mode) and, from round 2, who leads; a quiet bar, no countdown                                                                                                                                 | round card                                                                                                   | 5 s or VIP skip → `pick` (czar mode) or `answer`                                                                                                                                                                                                                |
| `pick`   | czar mode only: the three black cards the judge chooses between, then the chosen one lit for a beat                                                                                                                                      | judge: tap one; others: "Sam is picking the question"                                                        | the judge's choice + 1.4 s, 20 s (timed; hidden 60 s fallback untimed) or VIP skip → the first card by default → `answer`; a judge who is gone → `answer` at once                                                                                               |
| `answer` | the black card, "n / m in" + who is missing                                                                                                                                                                                              | black card + hand; tap `pick` cards in order, play                                                           | a 1.5 s beat after all connected answerers played ("Everyone's in!"; a drop that completes the room skips the beat), Next from any player (untimed), `answerSeconds` + 15 s per extra card (timed; hidden 3 min fallback untimed), or VIP skip → first `reveal` |
| `reveal` | one filled card, big; the ones already read, small; the reader named while their phone is in the room (the judge in czar mode, a rotating seat in vote mode); a quiet bar                                                                | the same card                                                                                                | 1.9 s + 16 ms/char ≤ 4 s (past 8 cards: 1.7 s + 12 ms/char ≤ 3.2 s) → next `reveal` or `judge`; VIP skip → `judge`                                                                                                                                              |
| `judge`  | every card with its letter (a size down past four long ones; pages of what fits, turning every 6 s, only when even that cannot hold them; one more step down when that would still page more than twice past eight cards), "n / m voted" | voters: `VoteList`; the judge alone in czar mode; rest wait                                                  | all connected eligible voters voted (+ a 0.9 s beat: “That’s everyone”, no clock), Next (untimed; not past a connected judge), 30 s (45 s czar or past 8 cards; hidden 2 min fallback untimed), or VIP skip (votes so far count) → `result`                     |
| `result` | winner card + author + votes + who voted for it (vote mode), other authors, +1                                                                                                                                                           | winner card, my standing ("#2 of 6 · 1 point"; "No points yet" while the board is level at 0), compact board | Next (untimed; hidden 60 s fallback), 8 s (timed), or VIP skip → next `intro`, or `final` (the board's 4 s drumroll, then `done`) after round `rounds`                                                                                                          |
| `final`  | final board, crown withheld ("And the winner is…"); a quiet bar                                                                                                                                                                          | final rank + board                                                                                           | 4 s or VIP skip → `done`                                                                                                                                                                                                                                        |
| `done`   | final board                                                                                                                                                                                                                              | final rank + board                                                                                           | terminal: `results()` non-null. VIP end from any phase → `done` with the scores so far                                                                                                                                                                          |

Round start (`intro` entry): last round's played cards to the discard, hands back to 10 (+ the black
card's `draw`) — the missing kinds drawn first, and up to two cards of the most plentiful kind
swapped out when a hand is still short, so every hand holds at least 2 answers for each kind of
question — 2 things, 2 doings (gerund cards), 2 people and 2 names (short cards, for a quoted blank, a
nickname, a line someone says; `server/fit.ts` reads the kind off the
card's text; a card's own `serves` in the deck JSON overrides it) and at least 5 tier-3 cards (`tier` in the
deck JSON: 1 filler, 2 good, 3 great; up to three spare cards a round are swapped for great ones of the same
kind) — while the decks can supply them; the
hand is shuffled each round, so the same cards never sit at the top, and one card of each kind is
moved to the front of it so the first screenful on a phone always offers all three — the judge chosen (czar mode: seat order by id, one per round,
disconnected seats skipped), a black card drawn — the deck leads with the great prompts (`tier` 3 in the deck
JSON) and keeps the filler (tier 1) for the back, each group in its shuffled order; three in czar mode, for the judge to choose between in
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
(a real player each; ties → higher score, then lower id): **Card of the night** (the night’s best-liked
card, quoted with its vote count — never Rando’s; with a judge, its round instead: every pick is one
"vote"), **Crowd favourite** (most votes received, if any; not in judge mode, where it would only
restate the score), **On a roll** (the longest run of rounds won outright, two or more), **Quick draw** (most cards played within half the answer time — `answerSeconds` / 2 from the phase's start,
measured against the deadline so a pause never cheats it; the same yardstick when untimed).

A **streak** — one player winning outright round after round — is kept in `stats.streak` and named on the round card from the second win (“Sam is on a 2-round streak”, TV and phones); a shared point, a Rando win or a round nobody won ends it.

The **card of the night** — the single card that took the most votes all game (ties keep the earlier
round) — is kept in `stats.best` and stands beside the final board, filled in and credited, on `final`
and `done` — on the TV beside the board and on every phone under its own (a phone-only room sees it
too). The TV deals it one short beat after the board's last row has risen (the board stacks bottom-up,
so the leaders land last; 12 rows ≈ 1.4 s, 3 rows ≈ 0.8 s), with the card pluck on that beat. No card
ever took a vote → no card of the night.

## Edge cases

- Nobody played: `answer` → `result` ("Nobody played a card"), no reveal, no vote.
- A voter whose card is the only one up (everyone else sat out) is not waited for and cannot vote.
- Disconnected players never block "all played" / "all voted". The judge dropping during `judge` (or
  before it opens) pulls its deadline in to 20 s — "Sam dropped — a moment for them to come back…" —
  and it ends with no winner if they are still gone; back in time, they get a fresh judge window and
  their pick counts (review-loop #351). A phase nobody connected can act in (every answerer gone) ends
  the moment it starts. A reconnect before the deadline can act. VIP skip: `intro` → `answer`; `answer` →
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

Three decks, `mild.json` (clean, 773 black / 1838 white), `crude.json` (adult, 570 / 1398) and `wild.json`
(explicit, 559 / 1752) — 6 890 cards, about one black card in nine a Pick 2 or Pick 3: `{ id, name, rating, black: [{ id, text, pick, draw }], white: [{ id, text }] }`,
blanks written `____`, `pick` ≥ blanks (a question card has none), `draw` 2 on Pick 3 cards. Mainstream
real-world references are fine in crude and wild (heads of state past and present, well-known events);
no obscure ones; no slurs or hate, nothing sexual involving minors, no non-consent. Add cards with
`pnpm exec tsx scripts/blanks-add-cards.ts <deck> black.txt white.txt` (ids, pick/draw and dedupe are
automatic).
