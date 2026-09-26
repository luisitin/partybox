# Who Said It 🗣️

When everyone answers, guess who wrote all but the last. Full design: `docs/game-pack/who-said-it/SPEC.md`.

## Overview

- The TV deals submitted answers in seeded order. Guess all but the last if everyone answered; otherwise guess every submitted answer.
- Guesses stay hidden until the run ends; every card then reveals on its own beat. A skipped final card scores no one.
- Authors sit out their own card. Their phone says “This one's yours — sit tight”; they count as done.

## Players

3–16; bots welcome. Late joiners spectate until the next game. One connected player can finish alone.

## Phases

| Phase    | What happens                              | Ends                                                |
| -------- | ----------------------------------------- | --------------------------------------------------- |
| `prompt` | Question on TV and phones                 | Reading + 1 s (≤ 10 s), or VIP                      |
| `write`  | Everyone answers; idea chips are optional | All answer (+0.9 s), deadline, or VIP               |
| `guess`  | Guess a face for each guessable card      | All eligible players tap (+grace), deadline, or VIP |
| `reveal` | Guesses land; author flips at `shown`     | `land` 3.2 s; `shown` ≥ 4.2 s; VIP advances         |
| `scores` | Board with this prompt's deltas           | 6 s or VIP                                          |

No cards goes to `scores`. Cards score on flip; a VIP skip in `land` flips immediately.

## Inputs

- `{type:'answer', text}` in `write`: trimmed, spaces collapsed, first 60 characters kept; resends replace.
- `{type:'idea'}` once per prompt when enabled; fills from two dealt answers.
- `{type:'guess', target}` in `guess`: resends replace. Invalid, self, unknown, spectator, and author guesses are ignored.

## Scoring

+2 for each right guess; +1 to each author per wrong guess. Idle guessers score nothing. When all
answer, the skipped final scores no one. Either merged author counts as right.
Scores never go down; ties share rank. Awards: 🔮 Mind Reader, 🕶️ Mystery Guest, 📖 Open Book, 💞 Knows You Best.

## Edge cases

- A player who skips writing has no card but can guess and remains a candidate.
- A departed author's card still reveals; players who left are excluded from the next prompt's candidates.
- If everyone is idle, deadlines finish the game. Pausing reveal resumes the same beat.

## Settings

| Key            | Default | Options                                                                    |
| -------------- | ------- | -------------------------------------------------------------------------- |
| `prompts`      | `auto`  | Auto: 4 for 3–6 players, 3 for 7–10, 2 for 11–16; 1–4, clamped to 40 cards |
| `writeSeconds` | 60      | 30–120, step 10                                                            |
| `guessSeconds` | 12      | 8–20                                                                       |
| `ideas`        | true    | Two dealt idea answers                                                     |
| `readAnswers`  | true    | Read each guessable answer aloud                                           |
| `spicy`        | false   | Include the spicy pack                                                     |
| `reader`       | `sky`   | Every voice or none                                                        |

## Content

Prompts: `content/family.json` (120), `content/spicy.json` (50). Pronunciations: `content/pronunciations.json`.
