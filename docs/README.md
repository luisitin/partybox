# docs/

All design docs for PartyBox. Start with `START_HERE.md` (reading order by task); `AGENTS.md` at the repo root is the map.

| File               | Purpose                                              |
| ------------------ | ---------------------------------------------------- |
| `START_HERE.md`    | reading order per task + one line per doc            |
| `CODEX_GUIDE.md`   | onboarding for an agent new to this machine          |
| `ARCHITECTURE.md`  | topology, data flow, dependency direction, discovery |
| `GAME_CONTRACT.md` | the game interface, rules, worked example            |
| `ADDING_A_GAME.md` | numbered recipe + definition of done                 |
| `PROTOCOL.md`      | socket events and limits                             |
| `DEV_API.md`       | dev-only HTTP control endpoints                      |
| `DESIGN_SYSTEM.md` | tokens, type scales, motion, sounds, primitives      |
| `TESTING.md`       | layers, `pnpm verify`, reproducing failures          |
| `CONVENTIONS.md`   | code, naming, commits, docs rules                    |
| `DECISIONS.md`     | ADRs                                                 |
| `DEPENDENCIES.md`  | one line per dependency                              |
| `BACKLOG.md`       | next items (`BL-nnn`)                                |
| `GLOSSARY.md`      | vocabulary                                           |
| `game-ideas/`      | owned by the game-design session (see its README)    |

Rules: keep docs short; update the doc a change touches in the same commit; `pnpm check-drift` verifies
the structural bits (headings, fixtures, dependency lines, TODO ids).
