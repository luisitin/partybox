---
name: add-game
description: Scaffold and implement a new PartyBox game plugin end to end, following docs/ADDING_A_GAME.md.
---

# add-game

Use when asked to add, scaffold or implement a game.

1. Read `docs/ADDING_A_GAME.md` (the recipe + definition of done) and `docs/GAME_CONTRACT.md`.
2. `pnpm new-game <kebab-id>` — creates `games/<id>` from `games/_template` and regenerates the registry.
3. Write `games/<id>/README.md` (the spec) BEFORE code. Keep the required headings.
4. Implement `server/` (one file per phase), `content/`, `client/`, fixtures, tests — in that order.
5. `pnpm sim --game <id> --players 6 --runs 200 --seed 1`, then `pnpm e2e:snap --game <id>`.
6. `pnpm verify` green → commit `feat(<id>): add <name>` → update `CHANGELOG.md`.

Do not copy from another game folder; copy from `_template` and read the other game only for patterns.
