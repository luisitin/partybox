# reports/ — handoff area for the parallel sessions

Three Claude Code sessions run next to the main one, each in its own git worktree and branch
(`claude --worktree <name>` → `.claude/worktrees/<name>`, gitignored). Each runs `git merge main` at the
start of every loop, commits to its own branch, and the owner merges branches into `main`.

| Session          | Branch     | Owns (writes only here)                                  | Port           | Digest                      |
| ---------------- | ---------- | -------------------------------------------------------- | -------------- | --------------------------- |
| stress-test / QA | `stress`   | `reports/stress/` + fixes under its policy               | `--port 42070` | `reports/stress/LATEST.md`  |
| design review    | `design`   | `reports/design/` + client visuals after the owner picks | `--port 42071` | `reports/design/LATEST.md`  |
| game design      | `designer` | `docs/game-ideas/`                                       | none           | `docs/game-ideas/LATEST.md` |

Rules:

- Markdown reports are committed; screenshots and video stay local (`reports/**/screenshots/`, `reports/**/video/`, `*.png`, `*.webm` are gitignored).
- Each session keeps a 10-line `LATEST.md` digest so the owner can catch up in one screen.
- Findings that belong to another session go in a `for-<session>.md` file inside your own folder.
- Never use another session's port; the main session uses 42069.
- Fix policy and report formats are in each session's prompt; `reports/stress/README.md` mirrors the stress layout.

Playwright's Chromium is installed once per machine (`pnpm exec playwright install chromium`) and shared by all worktrees.
The background music is not: `packages/client/public/music/` is gitignored, so a fresh worktree has no beds until `pnpm fetch-music` runs there (or the folder is copied from the main checkout). Without it the audio trace fails every "one track audible" check (loop #211).
