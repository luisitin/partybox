# Wisecrack — the spec (tests and the stress session treat it as the truth; original content only)

## Overview

Every player writes a one-liner for two prompts; each prompt then goes on the TV with its two answers,
anonymously, and everyone who did not write for it votes for the funnier one. Authors and votes are
revealed, points awarded, round scoreboard, next round. The last round of a multi-round game is worth double.

**Sound.** Playful tracks under the writing (`music`, chained at 0.2), synthesized beds elsewhere (`beds`:
warm intro, marimba / lo-fi alternating per prompt across vote + reveal, lounge on the scores); silent on `done`.

## Players

3–8; ≈ 10 min by default. Every `init` player writes every round, connected or not (a disconnected
player's prompts stay blank). Late joiners spectate (engine behaviour). Bots: welcome (`supportsBots`) — the bot answers from the pack / plays the odds.

## Phases

| Phase    | TV                                                                                                                                                                                                                                                  | Phone                                                                                                                                                                                | Exit                                                                                                                                                                                                                                                         |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `intro`  | "Round r of R"; "double points" on the last of 2+ rounds                                                                                                                                                                                            | round card                                                                                                                                                                           | round 1: a 2 s title beat (ADR-053 — the shell's start stage already showed the rules and counted 3 · 2 · 1); later rounds 7 s (pacing rule 2026-09-25); or VIP skip → `answer`                                                                              |
| `answer` | "n / 2·connected answers in"; no answers shown; at exactly three connected the kicker adds "cozy round, just the three of you" (I-028 A)                                                                                                            | `TextAnswer` for prompt 1 of 2, then 2 of 2 (80 chars); the field joins the last-5-s urgency (A), the counter bumps per keystroke (B), an empty field breathes after 3 s (C) — I-001 | all connected players answered both, `answerSeconds`, or VIP skip → first votable `vote`                                                                                                                                                                     |
| `vote`   | prompt + anonymous answers A / B, "n / m voted"                                                                                                                                                                                                     | voters: `VoteList` A / B; authors: waiting + own answer                                                                                                                              | all connected eligible voters voted, 20 s, or VIP skip (votes so far count) → `reveal`                                                                                                                                                                       |
| `reveal` | authors, voter avatars, points, "SWEEP!"; on the points beat the winner is crowned (`pb-crown` lift, A) and against a clear winner the loser steps back (0.96, 60 %, B) — I-002                                                                     | authors: votes + points; others: "look at the TV"                                                                                                                                    | 1.8 s beats + 1.3 × (1.5 s + ⅓ s a word) over both answers, the authors, the voters and the result, ≥ 8 s (was 6 s) or VIP skip → next votable `vote`, or `scores` after the round's last prompt                                                             |
| `scores` | round scoreboard with +deltas — a climb (I-027): rows appear in last round's order, the deltas land, the totals count, then at 1.2 s every row slides to its new place (A); a row that climbed glows green as it settles, one that fell dim red (B) | own score/rank + compact scoreboard                                                                                                                                                  | between rounds the VIP's Next (phone button; TV says whose), 45 s fallback; the last round's board is timed to read every row (1.3 × (1.5 s + ⅓ s × (8 + 3 a player)), ≥ 10 s) — was 8 s; or VIP skip → next round's `intro`, or `done` after round `rounds` |
| `done`   | final standings + awards                                                                                                                                                                                                                            | thanks + scoreboard                                                                                                                                                                  | terminal: `results()` non-null. VIP end from any phase → `done` with the scores so far                                                                                                                                                                       |

Pairing: a seeded player cycle per round; prompt i → players i and i+1 (mod n): n prompts, two authors
each, two per player, A / B slot shuffled. Deck shuffled once at `init` (+ spicy pack): no repeats.

## Inputs

`{ type: 'answer', promptId, text: string(1..80) }` — during `answer`, from an author of that prompt,
once per prompt; trimmed, whitespace-only ignored. `{ type: 'vote', promptId, slot: 0 | 1 }` — during
`vote`, for the prompt on stage, from a non-author, once. Anything else leaves the state unchanged.

## Scoring

`m` = 2 in round `rounds` (the last), else 1. Each vote received = 100 × m; a **sweep** (every vote
cast went to one answer, ≥ 2 cast; impossible with 3 players) adds 50 × m. Points lock in when `reveal`
starts, once per prompt. Ties share a rank, no tie-break; winners = every rank-1 player. Awards (a real
player each; a tied stat → a player with no award yet — I-474 A — then higher score, then lower id): **Crowd favourite** (most votes received, if > 0),
**Sweep master** (most sweeps, if ≥ 1), **Speed writer** (most answers in before half the answer time,
measured against the deadline; if > 0).

## Edge cases

- A never-answered prompt shows "(no answer)". With **one** blank there is no contest: the `vote` is
  skipped and the `reveal` pays the real answer one vote's worth (100 × multiplier, "wins by default").
  With **both** blank the `vote` and `reveal` are skipped (an all-blank round goes straight to `scores`).
- Disconnected players never block "all answered" / "all voted"; a reconnect before the deadline can
  act. A drop is seen and heard (shell, I-009): the TV chip flickers out to a ghost and snaps back with a green ring (A), the room hears `leave` / `join` (B), the phone's "Reconnecting…" breathes and the return buzzes with a `join` note (C). VIP skip: `intro` → `answer`; `answer` → first votable `vote` (unanswered = blank); `vote` → its
  `reveal` with the votes so far; `reveal` → next `vote` or `scores`; `scores` → next `intro` or `done`.
  VIP end → `done` from anywhere (a prompt whose `reveal` never ran scores nothing). Pause holds the
  deadline. Every phase but `done` has a deadline, so an idle room finishes on timers alone.
- I-288 A (a Lightning Round pick): the phones' clock follows the TV's `timerMode` — digits only in
  `answer` and `vote`, a quiet bar in the phases with nothing to press.
- I-796 K (design review K): in a TV room the `reveal` phone is a quiet mirror, not "Look at the TV" —
  "On the TV now · prompt n of 6", the prompt, both answers as mini cards ("yours" / "your pick"), the
  authors at the TV's author beat and votes + points at its last (the winner outlined), and "You
  weren't in this one: 1 more to go." An author's own result still follows the hold.

## Settings

`rounds` number 3 (1–5) · `answerSeconds` number 60 (30–120, step 10) · `spicy` boolean false.

## Content

`family.json`: ≥ 150 family-friendly prompts (`{ id, text }`) + `botAnswers` (≥ 40). `spicy.json`:
≥ 50 explicit adult prompts (18+; the intensity of the Blanks WILD deck, owner's order 2026-09-18 —
about a quarter carry explicit words outright, the rest are adult setups; the longest runs to 83
characters and `capture-spicy-fit.ts` proves it fits the TV, an iPhone and an SE), only when `spicy` is on. Nothing hateful (no group as the butt of the joke), nothing about real people.
