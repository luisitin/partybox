# scripts/

Cross-platform maintenance scripts, run with `tsx` (no build step). Each is a `pnpm` script.

| Script            | Command                       | Purpose                                                                                          |
| ----------------- | ----------------------------- | ------------------------------------------------------------------------------------------------ |
| `verify.ts`       | `pnpm verify`                 | the commit gate: registry → typecheck → lint → deps → format → tests → sim smoke → build → drift |
| `gen-registry.ts` | `pnpm gen-registry [--check]` | write/verify `packages/{server,client}/src/games.generated.ts`                                   |
| `check-drift.ts`  | `pnpm check-drift`            | docs/registry/fixtures/TODO/dependency drift checks                                              |
| `new-game.ts`     | `pnpm new-game <id>`          | copy `games/_template` → `games/<id>`, rewrite ids, regenerate registry                          |
| `lan-ip.ts`       | `pnpm lan-ip`                 | print the LAN IPv4 the server will advertise                                                     |
| `lib/games.ts`    | —                             | game folder discovery + `REQUIRED_GAME_FILES` (single source of truth)                           |
| `lib/run.ts`      | —                             | tiny process runner                                                                              |

Rules: no runtime code here (the server must not import scripts); keep each script single-purpose;
Windows and POSIX must both work (use `node:path`, `shell: true` for pnpm).
