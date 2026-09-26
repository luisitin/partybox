# Adding a game

Prerequisite reading: `AGENTS.md` (the repo map), `docs/GAME_CONTRACT.md`. Budget: a small game is ~400 lines of
TypeScript plus content. Everything below is checked by `pnpm verify`; nothing is optional.

## Steps

1. **Scaffold**: `pnpm new-game <id>` (kebab-case id, e.g. `word-storm`). This copies `games/_template/`
   to `games/<id>/`, rewrites the id/name, and regenerates the registry. No `pnpm install` needed.
2. **Write the spec first**: `games/<id>/README.md`, at most **120 lines** (`pnpm verify` checks). Keep
   the headings, in this order — also checked: `## Overview`, `## Players`, `## Phases`, `## Inputs`,
   `## Scoring`, `## Edge cases`, `## Settings`, `## Content`. This README is _the_ spec: the
   stress-test session treats it as truth, so say explicitly when a score can go down.
3. **Manifest**: `manifest.json` — `id` (must equal the folder), `name`, `icon` (one emoji),
   `tagline` (≤ 60), `description` (≤ 300, shown only in About), `howToPlay` (three steps ≤ 90),
   `version`, `minPlayers`, `maxPlayers`, `estimatedMinutes`, `tags` (1–3 of `GAME_TAGS`; `quick` is
   derived), `presence.needs`, `addedOn` (`pnpm new-game` stamps today), `settings[]`. Every one of its
   sentences also goes in `manifest.es.json`, keyed by the English (ADR-049). `server/index.ts`
   imports it and parses it with `gameManifestSchema` (as the template does); the contract test asserts
   `game.manifest` deep-equals the file.
   Optional `estimate` (I-189): the game's measured pace, so the picker's "~N min" follows the
   settings and the room — seconds = `fixedSeconds` + rounds × (`perRoundSeconds` + players ×
   `perPlayerPerRoundSeconds`), rounds being the setting named by `roundsSetting` (or the player
   count for `"players"`). Measure it from the host PC's recaps; without it the picker shows
   `estimatedMinutes`.
4. **State + phases**: declare `State`, the `Input` union and `Transition` in `server/types.ts`; one file
   per phase in `server/phases/<phaseId>.ts` exporting `enterX(state, now)` and
   `reduceX(state, event, next: Transition)`. **Phase files never import each other** (dependency-cruiser
   forbids cycles, and real games loop): `server/index.ts` owns the order in `advance(state, now)` and passes
   it in as `next` — the same `advance` is what a VIP skip runs. Declare `phases: [...]` in typical order.
   Server code imports only `@partybox/game-sdk` (pure helpers), plus `@partybox/game-sdk/speech` for a
   game with a reader voice (`docs/GAME_CONTRACT.md` "Speech"). Use `hasPlayer(state, id)` / `Object.hasOwn`
   rather than `state.players[id]` truthiness (`'__proto__'` is a sender the contract suite tries).
   Scoring math lives in `server/scoring.ts`, content access in `server/content.ts`.
5. **Content**: JSON packs in `content/*.json`; the zod schema in `content/schema.ts`. Family-friendly
   by default; put edgier items in a separate pack behind a `spicy` setting.
6. **Fixtures**: one full `State` per phase id in `fixtures/<phaseId>.json`. Easiest: run a game in the
   sim and dump states (`pnpm sim --game <id> --dump-fixtures --players 4`; it overwrites all fixtures
   with the first state seen per phase, so re-run it after any change to the state shape and hand-edit
   the JSON where you want a more interesting moment). Fixtures feed `/preview` and the contract tests.
7. **Client**: `client/Tv.tsx` and `client/Controller.tsx` built from `@partybox/game-sdk/ui` primitives;
   `client/phone-entry.ts` exports `phone`, `client/tv-entry.ts` exports `tv`, both spreading
   `client/shared.ts` (ADR-050: each is its own download; the phone side never imports a TV file).
   No sockets, no game logic, no global state.
8. **Bot**: `bot.sampleInput` must return a valid input in every phase (or `null`). The sim, e2e and the
   contract tests all depend on it. When the bot is a fair opponent (acts in every input phase, varied
   inputs), declare `"supportsBots": true` in `manifest.json` so players can add bot seats in the lobby
   (ADR-028); without it the game cannot be started while bots are in the room. Say which in the README's
   `## Players` section.
9. **Tests**: the template ships `__tests__/game.test.ts`; split by topic (`scoring.test.ts`,
   `phases.test.ts`, `content.test.ts`) as it grows (files ≤ 300 lines). Pin every rule in the README with
   hand-built events: a hand-computed round, each transition, VIP skip from each phase, ties. Give
   `GameDefinition` your view types (`GameDefinition<State, Input, MyTvView, MyControllerView>`) so tests
   can read `game.tvView(state).yourField` without casts. Two gotchas: views must survive
   `JSON.parse(JSON.stringify(v))` deep-equality, so never emit `-0` (`0 - wager` when wager is 0 → use
   `|| 0`); and `hiddenFromController(state, viewer)` must exclude what the viewer legitimately sees (own
   answer, own id). The contract suite runs against your game automatically.
10. **Simulate**: `pnpm sim --game <id> --players 6 --runs 200 --seed 1`. Fix every repro it writes.
11. **Look at it**: `pnpm dev`, then `/preview/<id>/<phase>?view=tv` and `?view=controller&player=<id>`
    for each fixture; then `pnpm e2e:snap --game <id>` for screenshots of a real run.
12. **Gate**: `pnpm verify` green → conventional commit `feat(<id>): add <name>` → update
    `CHANGELOG.md` (Unreleased).

## Adding (or renaming) a phase — the checklist

1. `server/types.ts`: add the id to `PHASES` (and a duration constant).
2. `server/phases/<id>.ts`: `enterX(state, now)` + `reduceX(state, event, next)`.
3. `server/index.ts`: import it; add it to `advance` (what comes after it, and what leads into it) and to
   the `switch` in `reduce`.
4. `fixtures/<id>.json`: `pnpm sim --game <game> --dump-fixtures` (or by hand). The contract suite fails
   with the exact missing file name until this exists.
5. `client/Tv.tsx` / `client/Controller.tsx`: render it (unknown phases fall through to a waiting screen).
6. `README.md` phase table; `__tests__`: the scaffolded tests pin the phase ORDER, so a test that expected
   `reveal → done` now fails on purpose — update it.
7. `pnpm verify`.

## Files `pnpm new-game` creates (from `games/_template`)

| File                                                                 | Purpose                                                                                                        |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `manifest.json`                                                      | metadata, player bounds, settings spec, `supportsBots` (parsed with `gameManifestSchema` in `server/index.ts`) |
| `manifest.es.json`                                                   | the manifest's sentences in Spanish, keyed by the English: the catalog, About and the settings form (ADR-049)  |
| `README.md`                                                          | the spec (required headings above)                                                                             |
| `AGENTS.md`                                                          | ≤ 30 lines: local rules and commands for this game (every agent reads this file)                               |
| `CLAUDE.md`                                                          | the 3-line pointer: Claude Code imports `AGENTS.md` through it (ADR-055); never put rules here                 |
| `server/index.ts`                                                    | exports `game: GameDefinition<State, Input>`: `init`, `reduce` (composes the phases), views, `results`, `bot`  |
| `server/types.ts`                                                    | `State`, `Input` + `inputSchema`, `PHASES`, `Transition`                                                       |
| `server/phases/answer.ts`, `server/phases/reveal.ts`                 | one file per phase: `enterX(state, now)` + `reduceX(state, event, next)`; they never import each other         |
| `server/scoring.ts`                                                  | pure scoring + `results()`                                                                                     |
| `server/content.ts`                                                  | typed, validated access to `content/*.json`                                                                    |
| `content/schema.ts`, `content/words.json`                            | `packs` (pack name → zod schema) + the pack itself                                                             |
| `client/phone-entry.ts`, `client/tv-entry.ts`, `client/shared.ts`    | the phone and TV downloads (ADR-050) and what both carry (sounds, music, strings)                              |
| `client/Tv.tsx`, `client/Controller.tsx`                             | the two dumb views (they import `@partybox/game-sdk/ui`)                                                       |
| `client/strings.ts`                                                  | the game's Spanish, keyed by the English sentence (`useT(STRINGS)` → `L('…')`, ADR-044)                        |
| `fixtures/answer.json`, `fixtures/reveal.json`, `fixtures/done.json` | one full state per phase                                                                                       |
| `__tests__/game.test.ts`                                             | unit tests pinning the README rules                                                                            |
| `__tests__/contract.config.ts`                                       | optional hints for the contract suite: `hiddenFromTv`, `hiddenFromController`, `settingsVariants`              |

## Definition of done

- [ ] README spec has every required heading and matches the implementation (scores, timers, ties).
- [ ] `manifest.json` equals `game.manifest`; `minPlayers`/`maxPlayers`/`estimatedMinutes` are honest.
- [ ] One file per phase; `reduce` is total; no `Date.now`/`Math.random`/timers/I/O (lint is green).
- [ ] A fixture for every phase in `phases[]`; both views render every fixture in `/preview`.
- [ ] `bot.sampleInput` valid in every phase; `pnpm sim … --runs 200` clean with `random` and `idle`;
      `supportsBots` declared in the manifest if (and only if) the bot is a fair opponent.
- [ ] Content pack validates; ≥ the item count your README promises; family-friendly default.
- [ ] Controller: ≥ 44 px targets, explicit submitted state, works after reconnect.
- [ ] TV: readable at 1080p from the couch (body ≥ 32 px), timer visible, nothing carried by colour alone.
- [ ] Every visible sentence (and aria-label, placeholder, title) is `L('…')` with its Spanish in
      `client/strings.ts`, and so are the manifest's picker lines (ADR-044; the coverage test checks).
- [ ] `pnpm e2e:snap --game <id>` produces screenshots for every phase.
- [ ] `pnpm verify` green; `CHANGELOG.md` updated; commit message `feat(<id>): …`.
