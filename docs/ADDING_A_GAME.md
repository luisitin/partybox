# Adding a game

Prerequisite reading: `CLAUDE.md`, `docs/GAME_CONTRACT.md`. Budget: a small game is ~400 lines of
TypeScript plus content. Everything below is checked by `pnpm verify`; nothing is optional.

## Steps

1. **Scaffold**: `pnpm new-game <id>` (kebab-case id, e.g. `word-storm`). This copies `games/_template/`
   to `games/<id>/`, rewrites the id/name, and regenerates the registry. No `pnpm install` needed.
2. **Write the spec first**: `games/<id>/README.md`. Keep the headings, in this order — `pnpm verify`
   checks them: `## Overview`, `## Players`, `## Phases`, `## Inputs`, `## Scoring`, `## Edge cases`,
   `## Settings`, `## Content`. This README is _the_ spec: the stress-test session treats it as truth.
3. **Manifest**: `manifest.json` — `id` (must equal the folder), `name`, `tagline`, `description`,
   `version`, `minPlayers`, `maxPlayers`, `estimatedMinutes`, `tags`, `settings[]`. Copy the same object
   into `server/index.ts` (`manifest`), the contract test asserts equality.
4. **State + phases**: declare `State` and the `Input` union in `server/types.ts`; one file per phase in
   `server/phases/<phaseId>.ts` exporting `{ enter, reduce }`; compose them in `server/index.ts`
   (`phases: [...]` in typical order). Scoring math in `server/scoring.ts`. Content access in
   `server/content.ts`.
5. **Content**: JSON packs in `content/*.json`; the zod schema in `content/schema.ts`. Family-friendly
   by default; put edgier items in a separate pack behind a `spicy` setting.
6. **Fixtures**: one full `State` per phase id in `fixtures/<phaseId>.json`. Easiest: run a game in the
   sim and dump states (`pnpm sim --game <id> --players 4 --runs 1 --dump-fixtures`). Fixtures feed
   `/preview` and the contract tests.
7. **Client**: `client/Tv.tsx` and `client/Controller.tsx` built from `@partybox/game-sdk` primitives;
   `client/index.ts` exports `clientModule`. No sockets, no game logic, no global state.
8. **Bot**: `bot.sampleInput` must return a valid input in every phase (or `null`). The sim, e2e and the
   contract tests all depend on it.
9. **Tests**: `__tests__/scoring.test.ts` (hand-computed round from the README), `__tests__/phases.test.ts`
   (each transition), plus anything tricky. The contract suite runs against your game automatically.
10. **Simulate**: `pnpm sim --game <id> --players 6 --runs 200 --seed 1`. Fix every repro it writes.
11. **Look at it**: `pnpm dev`, then `/preview/<id>/<phase>?view=tv` and `?view=controller&player=<id>`
    for each fixture; then `pnpm e2e:snap --game <id>` for screenshots of a real run.
12. **Gate**: `pnpm verify` green → conventional commit `feat(<id>): add <name>` → update
    `CHANGELOG.md` (Unreleased).

## Files `pnpm new-game` creates (from `games/_template`)

| File                                                                 | Purpose                                                           |
| -------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `manifest.json`                                                      | metadata, player bounds, settings spec                            |
| `README.md`                                                          | the spec (required headings above)                                |
| `CLAUDE.md`                                                          | ≤ 30 lines: local rules and commands for this game                |
| `server/index.ts`                                                    | exports `game: GameDefinition<State, Input>` composing the phases |
| `server/types.ts`                                                    | `State`, `Input`, `Settings` types + `inputSchema`                |
| `server/phases/answer.ts`, `server/phases/reveal.ts`                 | one file per phase: `enter(state, now)` + `reduce(state, event)`  |
| `server/scoring.ts`                                                  | pure scoring functions                                            |
| `server/content.ts`                                                  | typed access to `content/*.json`                                  |
| `content/schema.ts`, `content/words.json`                            | content pack schema + pack                                        |
| `client/index.ts`, `client/Tv.tsx`, `client/Controller.tsx`          | lazy module + the two views                                       |
| `fixtures/answer.json`, `fixtures/reveal.json`, `fixtures/done.json` | one full state per phase                                          |
| `__tests__/game.test.ts`                                             | example unit tests                                                |

## Definition of done

- [ ] README spec has every required heading and matches the implementation (scores, timers, ties).
- [ ] `manifest.json` equals `game.manifest`; `minPlayers`/`maxPlayers`/`estimatedMinutes` are honest.
- [ ] One file per phase; `reduce` is total; no `Date.now`/`Math.random`/timers/I/O (lint is green).
- [ ] A fixture for every phase in `phases[]`; both views render every fixture in `/preview`.
- [ ] `bot.sampleInput` valid in every phase; `pnpm sim … --runs 200` clean with `random` and `idle`.
- [ ] Content pack validates; ≥ the item count your README promises; family-friendly default.
- [ ] Controller: ≥ 44 px targets, explicit submitted state, works after reconnect.
- [ ] TV: readable at 1080p from the couch (body ≥ 32 px), timer visible, nothing carried by colour alone.
- [ ] `pnpm e2e:snap --game <id>` produces screenshots for every phase.
- [ ] `pnpm verify` green; `CHANGELOG.md` updated; commit message `feat(<id>): …`.
