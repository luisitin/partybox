# Game pack

The owner's game pack for PartyBox and the platform work it depends on. The owner sends one part
at a time; nothing here is built until the owner says so.

## Layout

- `parts/` — the part files exactly as sent.
- `<game-id>/` — one folder per game: `README.md` (status, links) and `SPEC.md` (that game's section
  cut from its part file, with the part's shared intro on top). Build notes, open questions and
  review passes for the game go in its folder. The game's code will live in `games/<game-id>/`.
- `schemas/` — JSON Schemas for the pack's data (manifest fields, catalog entry + `about`, presence,
  typed-answer items, pronunciation overrides); F2/F4/F5/F6 mirror them in zod.
- `FOUNDATION-AUDIT.md` — main checked against Part 00: what exists, conflicts to settle (the pack's
  rule 0.2.1: the code on main is the truth), gaps per F-task, baseline measurements, build plan.

## Parts and games

| Part | File                                                                 | Games                                                     | Status              |
| ---- | -------------------------------------------------------------------- | --------------------------------------------------------- | ------------------- |
| 00   | [parts/00-FOUNDATION.md](parts/00-FOUNDATION.md)                     | platform (F1–F7)                                          | received 2026-09-24 |
| 01   | [parts/01-IMPOSTER-HERD-MIND.md](parts/01-IMPOSTER-HERD-MIND.md)     | [🕵️ Imposter](imposter/) · [🐑 Herd Mind](herd-mind/)     | received 2026-09-24 |
| 02   | [parts/02-FAKE-OUT-WHO-SAID-IT.md](parts/02-FAKE-OUT-WHO-SAID-IT.md) | [🎭 Fake-Out](fake-out/) · [🗣️ Who Said It](who-said-it/) | received 2026-09-24 |
| 03   | —                                                                    | [📻 Tune In](tune-in/) · [🐝 Hive Rank](hive-rank/)       | waiting             |
| 04   | —                                                                    | [🔁 Echo](echo/) · [🔨 Blind Auction](blind-auction/)     | waiting             |
| 05   | —                                                                    | [🗂️ Spy Grid](spy-grid/)                                  | waiting             |
| 06   | —                                                                    | [🌙 Nightfall](nightfall/)                                | waiting             |

## Tools and skills

- `.claude/skills/game-pack-build` — one pack game end to end (after its F-tasks exist).
- `.claude/skills/record-review` — the recording + review loop and its smoothness gates.
- `.claude/skills/ship-spec` — the Idea Forge pipeline's shipping steps.
- `packages/e2e/src/design/dead-air.ts` — frozen stretches and hard cuts in a recorded surface.

## The owner's bar

Phones download only the catalog until a game is picked — then only that game's code; content
never; audio on first play — so the lineup can grow to hundreds without slowing phones. Every game
is recorded (video + audio) and reviewed until nothing is choppy, dead, clipped or out of sync, and
re-recorded after every change; motion is smooth and beautiful (3D visuals, transitions).
