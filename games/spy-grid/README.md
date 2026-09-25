# Spy Grid

Codenames-style teams. The full design is `docs/game-pack/spy-grid/SPEC.md`; this file is the
game's contract (tests and the stress session treat it as the truth). Deviations and stand-ins:
`docs/game-pack/spy-grid/NOTES.md`.

## Overview

A 5×5 grid of 25 words. Each word is secretly a ▲ Sun agent, a ● Moon agent, a 🚶 bystander or the
💀 assassin; only the two spymasters see the key. On a team's turn its spymaster sends one word and
a number; the team points at cards together, and a card flips when most of its connected guessers
point at it. Find all your agents first; flip the assassin and you lose at once. With 2–3 players
it is a co-op mission: one team, 9 agents, a clue budget.

## Players

2–16. Teams at 4+ (`mode` auto; fewer than 4 always play co-op), co-op at 2–3. Bots welcome
(`supportsBots`): a bot spymaster clues the pack's themes, a bot guesser follows theme clues and
hints — and on a team with a connected person guessing, bots only copy what the people point at.

## Phases

| Phase      | Ends when                                                     | Next                                      |
| ---------- | ------------------------------------------------------------- | ----------------------------------------- |
| `teams`    | VIP Start (skip) or 45 s; skipped with `teamPick: random`     | teams settle → first `clue`               |
| `clue`     | the active spymaster sends a legal clue; `clueSeconds`; skip  | `guess`, or `turn-end` ("No clue!")       |
| `guess`    | a majority points at a card / End turn; `guessSeconds`; skip  | `flip`, or `turn-end`                     |
| `flip`     | two beats: 0.8 s (TV only) then ≥ 1.4 s (paced to the reader) | `guess`, `turn-end` or `win`              |
| `turn-end` | 2.5 s or skip                                                 | the next team's `clue` (co-op: same team) |
| `win`      | 10 s or skip                                                  | the next round's `clue`, or `done`        |

Settling teams: sizes within one (the bigger team's latest joiners cross over), then a spymaster
per team: a volunteer (rng among several), else a random person, else a bot. Later rounds keep the
teams and rotate each spymaster in seat order, people first. A spymaster who left is replaced by
rule at their team's next clue.

## Inputs

`join {team}`, `volunteer {on}` (teams phase); `shuffle` (VIP only); `clue {word, number 1–9}`
(active spymaster only); `point {card 0–24 | 'end'}`, `unpoint`, `react {card, 👍|👎|🤔}` (the active
team's guessers only). Ignored: wrong phase, spectators, flipped cards, `end` before the turn's
first flip, a second reaction within 1 s. A clue is refused (reason on the spymaster's phone) when
it is empty or two words, over 20 characters, has a digit, or is — or is too close to — a face-down
board word (flipped words are fair game).

## Scoring

Own agent: +1 found, guess again while the clue's number + 1 allows. Bystander or enemy agent: the
turn ends (an enemy agent counts for them). Assassin: the other team wins the round. A team whose
agents are all face up wins, whoever flipped them. Turn cap (`maxTurns`, both teams): fewer agents
left wins, equal is a draw. Four clueless turns in a row: a draw. Everyone but a team's spymaster
leaving: forfeit. Teams: each player scores their team's round wins (teams rank together; a draw
crowns both). Co-op: everyone scores the agents found and ties (the platform needs a winner).
Awards: 🕶️ Master Spy, 🔗 Big Link (≥ 3 in one clue), 🎯 Sharp Eye, 💀 Trap Door.

## Edge cases

- A guesser drops or leaves: their pointer goes and the majority is recounted at once.
- No connected guessers: guess steps time out; a tie or silence at the deadline ends the turn.
- The key is only in spymasters' views; the TV learns a card at stage 1, phones at stage 2;
  spectators (late joiners) get the TV view.
- Pause holds every clock; pointers stay. VIP skip in `flip` completes the flip at once.

## Settings

`mode` (auto/teams/co-op) · `teamPick` (choose/random) · `rounds` 1–3 · `clueSeconds` 30–180 ·
`guessSeconds` 20–120 · `maxTurns` 16–30 · `coopTurns` 5–12 · `assassins` 1/2 · `reactions` ·
`spicy` · `reader` (every voice + none, default fable: reads each clue, "Ocean, three.").

## Content

`content/words.json` (604 family words), `themes.json` (209 themes), `spicy-words.json` (122 adult,
never explicit), `spicy-themes.json` (54). Every word sits in 2+ themes and carries two one-word
hints and its family roots; every theme's clue and alternates are legal against its own members
(content.test.ts). A board: 5 themes × 3 members + 10 from the pool, no two words sharing a root.
