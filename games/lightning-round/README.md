# Lightning Round

## Overview

Speed trivia, four choices per question: faster correct answers earn more, streaks add a bonus, before
the last question everyone wagers part of their score. Highest score wins. ~3 min for 10 questions (I-189 B: the picker's minutes follow the question count: 25 s + 19 s a question — the host PC's recaps said 16, plus I-589's 3 s longer reveal). This is the spec.

**Sound.** Synthesized beds only (the phases flip too fast for tracks): marimba on the intro, the quiz-show
`pulse` under every question and reveal (one bed, so it carries through the cut), late-night chords under the
wager; silent on `done` and the results.

## Players

1–16. Late joiners spectate (engine). Disconnected players are not waited for; reconnect → can answer. Bots: welcome (`supportsBots`) — the bot answers from the pack / plays the odds.

## Phases

| Phase      | TV                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Phone                                             | Exit                                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `intro`    | title card, category                                                                                                                                                                                                                                                                                                                                                                                                                                                     | "Get ready"                                       | 4 s deadline or VIP skip → first `question`                                                                                      |
| `question` | question + choices A–D in a 2×2 grid, "n / m answered" — every locked-in face pops onto the count line (I-007 A) and the phones still thinking are ringed in the strip until they lock in (B)                                                                                                                                                                                                                                                                            | `ChoiceGrid`, one tap locks the pick              | every connected player picked, or `answerSeconds` deadline, or VIP skip → `reveal`                                               |
| `reveal`   | correct choice marked ✓, per player: ✓/✗/–, points, 🔥 streak (a "phone only" room gets the same `rows` on the phone); I-589 A: right answers fastest first, each with its time (`rows[].elapsedMs`, ⚡ on the fastest); B: 2 s on, the rows re-deal into score order (the standings) and — the owner's note — a Next button arrives on the TV (the header's topic slot) and the VIP's phone (`next`: `question`/`wager`; `vipSkipHidden` drops the shell's Skip / Next) | same grid with ✓/✗ marks + outcome line           | 8 s deadline (the final: 5 s) or Next / VIP skip → next `question`; after the last regular one `wager`; after the final `done`   |
| `wager`    | "Place your wagers", "n / m placed", standings — phone: every wager row carries a stack of gold chips, one per 25 % (I-026 A); a placed pick bumps its chips, the prompt becomes "n in the pot" and the other rows step back (B); on the final question the "Your bet" footer breathes until the answer is locked (C); a fifth Custom row takes a percentage or a points amount (the owner's note)                                                                       | `ChoiceGrid` of 0 / 25 / 50 / 75 / 100 % of score | every connected player wagered, or 15 s deadline, or VIP skip → final `question` (flagged `final`, hardest difficulty available) |
| `done`     | final standings — the shell's results crown one clear winner: face beside the line and `pb-crown` on it (I-025 A), confetti (48 pieces for a person, 16 for a bot — B), and the board under it comes back from 55 % over 1.2 s so the name reads first (C)                                                                                                                                                                                                               | rank + score                                      | terminal: `results()` is non-null                                                                                                |

## Inputs

`{ type: 'pick', index: 0–3 }` — once per player during `question`. `{ type: 'wager', percent: 0 | 25
| 50 | 75 | 100 }` — once per player during `wager`; amount = `floor(score × percent / 100)` rounded
down to a multiple of 10, equal amounts collapse so a 0-point player only sees (and can only wager) 0;
no input by the deadline = 0. `{ type: 'wager', amount: n }` (I-026, the phone's custom row: a
percentage 1–100 becomes points by the same rule on the phone, points go as typed) — the server clamps
it to 0…score and rounds down to tens (`clampWager`; the whole score is allowed); `amount` wins when
both are sent; bots keep the presets. Later inputs, spectators/unknown ids and wrong-phase inputs are ignored.

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

The TV question page is a size container: under 560 px of stage (a sixteen-player roster, four chip
rows) the prompt drops to h2 and the choice cards to 84 px so the count line stays above the host bar
(`capture-lightning-16.ts` proves 16 and 6 players).

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
enforces the balance. The phone never downloads the questions (I-752): the wager arithmetic lives in
`server/wager.ts`, which imports no content (A), and `__tests__/phone-bundle.test.ts` fails if any client
file reaches the content (C).
