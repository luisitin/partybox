# Lightning Round

## Overview

Speed trivia, four choices per question: faster correct answers earn more, streaks add a bonus, before
the last question everyone wagers part of their score. Highest score wins. ~8 min. This is the spec.

**Sound.** Synthesized beds only (the phases flip too fast for tracks): marimba on the intro, the quiz-show
`pulse` under every question and reveal (one bed, so it carries through the cut), late-night chords under the
wager; silent on `done` and the results.

## Players

1–16. Late joiners spectate (engine). Disconnected players are not waited for; reconnect → can answer. Bots: welcome (`supportsBots`) — the bot answers from the pack / plays the odds.

## Phases

| Phase      | TV                                                            | Phone                                             | Exit                                                                                                                             |
| ---------- | ------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `intro`    | title card, category                                          | "Get ready"                                       | 4 s deadline or VIP skip → first `question`                                                                                      |
| `question` | question + choices A–D in a 2×2 grid, "n / m answered"        | `ChoiceGrid`, one tap locks the pick              | every connected player picked, or `answerSeconds` deadline, or VIP skip → `reveal`                                               |
| `reveal`   | correct choice marked ✓, per player: ✓/✗/–, points, 🔥 streak | same grid with ✓/✗ marks + outcome line           | 5 s deadline or VIP skip → next `question`; after the last regular one `wager`; after the final `done`                           |
| `wager`    | "Place your wagers", "n / m placed", standings                | `ChoiceGrid` of 0 / 25 / 50 / 75 / 100 % of score | every connected player wagered, or 15 s deadline, or VIP skip → final `question` (flagged `final`, hardest difficulty available) |
| `done`     | final standings                                               | rank + score                                      | terminal: `results()` is non-null                                                                                                |

## Inputs

`{ type: 'pick', index: 0–3 }` — once per player during `question`. `{ type: 'wager', percent: 0 | 25
| 50 | 75 | 100 }` — once per player during `wager`; amount = `floor(score × percent / 100)` rounded
down to a multiple of 10, equal amounts collapse so a 0-point player only sees (and can only wager) 0;
no input by the deadline = 0. Later inputs, spectators/unknown ids and wrong-phase inputs are ignored.

## Scoring

Regular question, correct: **500** + speed bonus `speedPoints(elapsedMs, answerSeconds × 1000, 500, 0)`
(500 at 0 ms → 0 at the deadline, so 1000 → 500 in total; `elapsedMs` is measured against the
deadline, a pause costs nothing) + streak bonus 100 × (streak − 1) capped at 300, streak = consecutive
correct answers including this one. Wrong or no answer: 0 and the streak resets to 0. Final question:
correct → **+ wager**; wrong or no answer → **− wager**. **A score can go down here** (never below 0:
a wager is at most the whole score); no base/speed/streak points on the final, the streak counter
still updates. Winners = rank 1 (ties share). Awards (only when someone qualifies; ties → lowest
player id): **Lightning fingers** = lowest average time over correct answers (≥ 1 correct);
**Hot streak** = longest streak (≥ 2); **High roller** = largest wager won on the final (≥ 1).

## Edge cases

- Draw is seeded and repeat-free: same seed + settings ⇒ same questions. A `category` with fewer than
  `questions + 1` items falls back to `all` (`drawnFrom` in state / TV header says which).
- VIP skip: `intro` → question 1; `question` → its reveal (unanswered = wrong; only the final loses the
  wager); `reveal` → next question / wager / done; `wager` → final question, missing wagers = 0. VIP end
  → `done` with scores so far (unrevealed question = 0). Pause holds the deadline; inputs/timers ignored.
- Every phase has a deadline. Everyone idle: all score 0 and tie for first, no awards. 1 player works.

## Settings

`questions` number 10 (5–20 step 1, regular questions; the final is extra) · `answerSeconds` number 15
(5–30 step 5) · `category` select `all` (default) or one of the ten content categories ·
`subcategories` multiselect (ADR-034): the topics of the chosen category to draw from, comma-joined,
`''` = the whole category; picks outside the category are dropped. The draw uses the ticked topics if
they hold `questions + 1` items, else the whole category, else all (`drawnFrom` / `drawnSubs` in state;
the TV intro says which: "Sports · Basketball, Soccer").

## Content

`content/questions.json` — 3 867 original questions across ten categories (geography, stem, history,
arts-and-literature, sports, food-and-drink, nature, language, entertainment, everyday-life; 354–409
each) and 59 topics (`SUBCATEGORIES` in `content/schema.ts`, 30+ questions each), about 39 % easy /
39 % medium / 22 % hard: `id`, `category`, `subcategory`, `difficulty`, `question`, four distinct
`choices`, `answerIndex`, `source`. Widely documented, non-time-sensitive, family-friendly, mainstream
(pub-quiz, not specialist), no question text repeated. `content/schema.ts` enforces ≥ 200 items, ≥ 6
categories, unique ids, and that every topic belongs to its category; `__tests__/content.test.ts`
enforces the balance.
