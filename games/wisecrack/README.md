# Wisecrack — the spec (tests and the stress session treat it as the truth; original content only)

## Overview

Every player writes a one-liner for two prompts; each prompt then goes on the TV with its two answers,
anonymously, and everyone who did not write for it votes for the funnier one. Authors and votes are
revealed, points awarded, round scoreboard, next round. The last round is worth double.

## Players

3–8; ≈ 10 min by default. Every `init` player writes every round, connected or not (a disconnected
player's prompts stay blank). Late joiners spectate (engine behaviour).

## Phases

| Phase    | TV                                                | Phone                                                   | Exit                                                                                     |
| -------- | ------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `intro`  | "Round r of R"; "double points" on the last round | round card                                              | 5 s or VIP skip → `answer`                                                               |
| `answer` | "n / 2·players answers in"; no answers shown      | `TextAnswer` for prompt 1 of 2, then 2 of 2 (80 chars)  | all connected players answered both, `answerSeconds`, or VIP skip → first votable `vote` |
| `vote`   | prompt + anonymous answers A / B, "n / m voted"   | voters: `VoteList` A / B; authors: waiting + own answer | all connected eligible voters voted, 20 s, or VIP skip (votes so far count) → `reveal`   |
| `reveal` | authors, voter avatars, points, "SWEEP!"          | authors: votes + points; others: "look at the TV"       | 6 s or VIP skip → next votable `vote`, or `scores` after the round's last prompt         |
| `scores` | round scoreboard with +deltas                     | own score/rank + compact scoreboard                     | 8 s or VIP skip → next round's `intro`, or `done` after round `rounds`                   |
| `done`   | final standings + awards                          | thanks + scoreboard                                     | terminal: `results()` non-null. VIP end from any phase → `done` with the scores so far   |

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
player each; ties → higher score, then lower id): **Crowd favourite** (most votes received, if > 0),
**Sweep master** (most sweeps, if ≥ 1), **Speed writer** (most answers in before half the answer time,
measured against the deadline; if > 0).

## Edge cases

- A never-answered prompt shows "(no answer)" and can still be voted on; if **both** answers are blank
  its `vote` and `reveal` are skipped (an all-blank round goes straight to `scores`).
- Disconnected players never block "all answered" / "all voted"; a reconnect before the deadline can
  act. VIP skip: `intro` → `answer`; `answer` → first votable `vote` (unanswered = blank); `vote` → its
  `reveal` with the votes so far; `reveal` → next `vote` or `scores`; `scores` → next `intro` or `done`.
  VIP end → `done` from anywhere (a prompt whose `reveal` never ran scores nothing). Pause holds the
  deadline. Every phase but `done` has a deadline, so an idle room finishes on timers alone.

## Settings

`rounds` number 3 (1–5) · `answerSeconds` number 60 (30–120, step 10) · `spicy` boolean false.

## Content

`family.json`: ≥ 150 family-friendly prompts (`{ id, text }`) + `botAnswers` (≥ 40). `spicy.json`:
≥ 50 edgier but PG-13 prompts, only when `spicy` is on. Nothing explicit, hateful or about real people.
