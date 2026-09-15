# Conventions

Most of these are enforced by `pnpm verify` (ESLint, dependency-cruiser, Prettier, drift checks).
When a rule here and the linter disagree, the linter wins — then fix this page.

## Code

- TypeScript `strict`, ESM, Node ≥ 24. Named exports only (config files excepted). One exported concept per file.
- Files ≤ ~300 lines (tests/tools 400). Folder = feature. No barrel files except each package's `src/index.ts`.
- Explicit return types on exported functions. `import type` for types.
- Comments explain _why_, not what. File headers say what the file is for in one or two lines.
- No `Math.random()`, `Date.now()` or timers in engine or game code — the host injects `now`, `state.rng` gives randomness.
- Every game phase lives in `games/<id>/server/phases/<phaseId>.ts`; `reduce` in `server/index.ts` composes them.
- `TODO(BL-nnn)` only, with a matching `BL-nnn` line in `docs/BACKLOG.md`.
- Prettier formats everything (`pnpm format`); `singleQuote`, width 100, trailing commas.
- Versions shared across packages go in the `catalog:` of `pnpm-workspace.yaml`.

## Naming

- Packages `@partybox/<folder>`. Game ids kebab-case = folder name = `manifest.id`.
- Phase ids kebab-case; fixture file = `<phaseId>.json`. Content packs `content/<pack>.json`.
- Socket events lower-case (`join`, `input`, `view`); dev API paths `/api/dev/<verb>`.
- Sound cues and design tokens: see `docs/DESIGN_SYSTEM.md`.

## Commits

Conventional commits: `type(scope): summary`.
Types: `feat fix docs test chore refactor perf build ci design`.
Scopes: `core engine server client sdk sim e2e scripts <game-id> ideas` (omit when repo-wide).
Examples: `feat(wisecrack): add vote phase`, `fix(engine): F-012 VIP handover ignored spectators`,
`design(core): R-004 raise TV body text to 34px`, `docs(ideas): add 003-word-storm`.
`pnpm verify` must be green before every commit; each commit updates the docs it affects.
`CHANGELOG.md` keeps an `Unreleased` section; releases are tagged `vX.Y.Z`.

## Docs

- `CLAUDE.md` (root) ≤ 120 lines; folder `README.md` ≤ 60 lines; package/game `CLAUDE.md` ≤ 30 lines.
- Decisions → `docs/DECISIONS.md` (ADR: Context → Decision → Consequences, numbered).
- New dependency → one line in `docs/DEPENDENCIES.md` (drift check fails otherwise).
- Game `README.md` headings, in order: Overview, Players, Phases, Inputs, Scoring, Edge cases, Settings, Content.

## Git worktrees (parallel sessions)

`claude --worktree <name>` creates `.claude/worktrees/<name>` (gitignored). Sessions run `git merge main`
at the start of each loop and commit to their own branch; the owner merges into `main`. Ports: 42069 main,
42070 stress, 42071 design. See `reports/README.md`.
