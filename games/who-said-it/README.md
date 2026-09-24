# Who Said It 🗣️

Everyone answers. Everyone guesses who wrote what. The full design is
`docs/game-pack/who-said-it/SPEC.md` (Part 02, game 4); this file is the game's rules as built.

## Overview

Everyone answers the same question on their phone. The answers come up on the TV one at a time,
read aloud, and everyone taps whose they think it is. It was… GRANDMA?! Score for every right
guess and for every friend your answer fools. Write honestly, or like someone else. Free text +
face picker; about 10 minutes; presence `anywhere` (identical in every mode).

## Players

3–16. Bots welcome (`supportsBots`): a bot answers with its own dealt canned answer (bots lead with
different ones) and guesses uniformly at random, deciding only from its own phone's view — on its
own card too, like a person. Late joiners spectate until the next game.

## Phases

| Phase    | TV                                                                                          | Phone                                           | Exit                                                                             |
| -------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------- |
| `intro`  | title + three steps                                                                         | how to play                                     | 8 s or VIP → `prompt`                                                            |
| `prompt` | "Question 2 of 3" + the question, read aloud                                                | the question                                    | reading + 1 s (≤ 10 s) or VIP → `write`                                          |
| `write`  | question, "Answer on your phone", chips ✓                                                   | answer box, 💡 Need an idea?, Lock it in        | all connected answered (+0.9 s grace), `writeSeconds`, VIP                       |
| `guess`  | "Who said it?", the answer big, "Answer 3 of 6"                                             | the answer + face picker (not yourself)         | all connected tapped (+grace, after the reading), `guessSeconds`, VIP → `reveal` |
| `reveal` | beat `land`: taps fly to faces, hold, "It was…"; beat `shown`: author flips up, ✓/✗, points | 👀 Watch the TV, then your own line at the flip | `land` 2.6 s, `shown` ≥ 2.2 s (the name line + 0.9 s); VIP skip = next card      |
| `scores` | board with this question's deltas ("Nobody answered!")                                      | your points and rank; VIP Next                  | 6 s or VIP → next `prompt` or `done`                                             |

Cards play in a seeded order. With no cards, `write` goes straight to `scores`. `reveal` is one
phase instance with two beats (ADR-033); the card is scored exactly once, at the flip (a VIP skip
in `land` scores it first).

## Inputs

`{type:'answer', text ≤ 120}` in `write` (trimmed, runs of spaces collapsed, first 60 characters
kept; empty is ignored; a resend replaces) · `{type:'idea'}` in `write`, once per question, when
`ideas` is on · `{type:'guess', target}` in `guess` (a resend replaces). Ignored: wrong phase,
unknown players and spectators, a second idea, a guess naming yourself, an unknown id or someone
not seated when the question began.

## Scoring

Per card: +2 to each guesser who named the author (either author of a merged card); +1 to each
author per guesser who named someone else. Guessers who don't tap count for nothing; an author's
own tap never scores. Scores never go down; ties share a rank. Awards (skipped when nobody earned
one; ties share): 🔮 Mind Reader (most right guesses), 🕶️ Mystery Guest (most guessers fooled), 📖
Open Book (most right guesses received), 💞 Knows You Best (the guesser → author pair with the most
right guesses, to the guesser: "Ana knows Ben best (3 of 3)").

## Edge cases

- Two answers the same (`sameAnswer`): one card with both authors ("It was… BOTH Ana and Eli!").
- A player who doesn't answer: no card, still guesses and is still a candidate.
- An author who leaves before their card: it still plays and names them; someone who left for good
  is not a candidate from the next question on. Guessing someone who left is allowed.
- The author's phone is identical to everyone else's during their card (same grid, header, haptic;
  their ✓ shows); "all done" counts every connected seated player, the author too.
- A drop that leaves everyone else done closes the phase. One connected player plays alone.
- Everyone idle: no cards; the game runs out on deadlines. Pause mid-reveal resumes the same beat.

## Settings

| Key            | Type    | Default | Range                                                                |
| -------------- | ------- | ------- | -------------------------------------------------------------------- |
| `prompts`      | select  | `auto`  | auto (3–6 players: 4, 7–10: 3, 11–16: 2), 1–4; clamped to ≤ 40 cards |
| `writeSeconds` | number  | 60      | 30–120 step 10                                                       |
| `guessSeconds` | number  | 12      | 8–20                                                                 |
| `ideas`        | boolean | true    | the 💡 button (two dealt canned answers)                             |
| `readAnswers`  | boolean | true    | the reader says each answer at the start of its guess                |
| `spicy`        | boolean | false   | adds the spicy pack                                                  |
| `reader`       | select  | `sky`   | sky, george, fable, jessica, original, none                          |

Voice: the question; "Time to write."; "Who said it?" before the first answer; each answer;
"It was Ben!" at the flip (fixed "It was…" when the name can't be read); "Everyone knew!" /
"Nobody saw that coming!". Answers and name lines are made once `write` ends; a merged card's line
at its reveal. Every line goes through `toSpeakable`; at most 10 readings are asked for at once.

## Content

`content/family.json` (120 questions: 72 habits, 36 hypotheticals, 12 describe-yourself) and
`content/spicy.json` (50), each with 12+ bot answers (≤ 60 characters, mixed styles, no two the
same answer); `content/pronunciations.json` (overrides). Host-only; `init` draws just the
questions one game plays. State at 16 players ≈ 15 KB, views ≤ 3 KB.
