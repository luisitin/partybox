# Hive Rank 🐝

"Rank five things the way the hive would." The game's spec — tests treat it as the truth. Full
design: `docs/game-pack/hive-rank/SPEC.md` (Part 03); build notes: `docs/game-pack/hive-rank/NOTES.md`.

## Overview

Each round everyone gets five things and a question ("Best to worst road-trip snack") and taps
them into order on their phone. The orders are combined into the hive's order, which the TV counts
down from 5th to 1st with the reader. You score for matching the hive — you're predicting the
room, not your own taste. About 6 minutes. Interaction: ranking. Plays fully remote.

## Players

2–16. With 2 it becomes "how alike are you?". Late joiners spectate. Bots: welcome
(`supportsBots`) — a bot starts from the question's `expected` order (its own view's `hint`, which
only bot seats get) and makes 0–3 swaps of neighbours, drawn from 0, 1, 1, 2, 2, 3.

## Phases

`intro` (once) → `rank` → `hive` → `score` → next `rank`, or `done`. A "Not enough bees!" `hive`
goes straight to the next `rank` (or `done`).

| Phase   | TV                                                              | Phone                                         | Exit                                                                   |
| ------- | --------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------- |
| `intro` | title, the three steps, **Let's go**                            | how to play; VIP **Let's go**                 | 8 s, or VIP                                                            |
| `rank`  | "Round n of m", the question, "1 = top · 5 = bottom", 5 cards   | `OrderPicker`, sticky **Lock it in** / Change | every connected player locked in, `rankSeconds`, or VIP                |
| `hive`  | ladder: "The hive has decided…", then 5th → 1st, faces, average | "👀 Watch the TV" (PhoneStage: the ladder)    | paced (~12 s; each spot ≥ 2 s or its reading + 0.6 s); VIP = next spot |
| `score` | Queen Bee crowned, board climbs with +n; PERFECT HIVE           | my order vs the hive: ✓ / ±1 / ✗, points      | 24 s, or VIP **Next round** / **See results**                          |

- A spot whose reading is not made yet waits for it, never past 8 s into `hive`; then it lands silent.
- Pause freezes the countdown (the shared helper); resume continues it.
- Timer: `rank` normal, `intro`/`score` quiet bar, `hive` hidden.

## Inputs

`{ type: 'order', items: string[5] }` — only in `rank`, only from players, only a permutation of the
round's five ids (anything else is ignored). A resent order replaces the earlier one; the phone only
sends complete orders. Orders are secret until `hive`: only their owner's phone has one.

## Scoring

- **The hive:** each thing's total = the sum of its spots (1–5); lowest first. Ties: more 1st-place
  votes, then 2nd-place, … then the pack's item order. At least 2 orders, else "Not enough bees!"
  and nobody scores.
- **Per thing:** in the hive's exact spot +2; one spot off +1. All five exact: +2 bonus (max 12).
- Your own order counts towards the hive. No order this round: 0. Scores never go down; ties share
  a rank. Points join the totals when `score` begins (the strip hides scores during `hive`).
- **Queen Bee** 👑: the round's top scorer (ties share; nobody on a 0-point best). Shown, not scored.
- **Awards** (skipped if nobody earned one; ties share): 👑 Queen Bee — most rounds as Queen;
  🎯 Hive Mind — most exact spots; 🦗 Odd Bug — most rounds with the round's lowest score (only
  rounds where scores differed); 🧠 Twin Brains — the pair with the most things in the same spot
  (both get it; one line each).

## Edge cases

- Fewer than 2 orders → "Not enough bees!" (6 s), no points, next round.
- Everyone idle → every round is short; the game ends in about 3.5 minutes.
- A drop mid-`rank` that leaves every connected player locked in closes the ranking.
- One connected player: their lock closes `rank`, and the round is short.
- Everyone sends the same order → everyone scores 12.
- VIP end → `done`; everyone from the start is in the results.

## Settings

| Key           | Type    | Default   | Range                                       |
| ------------- | ------- | --------- | ------------------------------------------- |
| `rounds`      | number  | 6         | 3–10                                        |
| `rankSeconds` | number  | 30        | 15–60, step 5                               |
| `spicy`       | boolean | false     | on: half the rounds (rounded up) are spicy  |
| `reader`      | select  | `jessica` | george, fable, jessica, sky, original, none |

The reader says the question at `rank` (else "Rank them!"), "The hive has decided.", each spot
("Number five: Egg sandwich."), "Perfect hive!" / "Queen bee!" at `score`, "Not enough bees.".
The stock lines and round 1's question are asked for during `intro`; each next question during
`score`; the five spots only once `hive` begins. Phones speak only in a phone-only room.

## Content

`content/family.json` (150 questions) and `content/spicy.json` (50, adults), host-only — `init`
draws exactly `rounds` questions. Each: `id`, `kind` (preference / usefulness / hypothetical /
social), `prompt` (≤ 48), `say` (the reader's sentence), `top` / `bottom` (≤ 12), five `items`
(`id`, `label` ≤ 22, one meaning everywhere), `expected` (the writer's guess; bots only).
`content/pronunciations.json`: word → `{ say, anyCase? }` for the reader.
