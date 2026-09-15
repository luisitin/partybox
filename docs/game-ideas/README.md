# docs/game-ideas/

Owned by the game-design session (branch `designer`, no server or port).

Layout (per the session prompt):

- `_template.html` - shared template: sticky TOC, print styles, fixed section ids (created on first run)
- `NNN-<slug>.html` - one self-contained, implementation-ready design doc per idea (inline CSS/SVG, opens offline)
- `INDEX.html` - card grid: status, players, minutes, difficulty, links
- `INDEX.md` - table of ideas + coverage matrix (interaction / player range / duration / structure / skill / tone)
- `LATEST.md` - 10-line digest after every 5 ideas: what's new, which three to build first, SDK gaps
- `sdk-requests.md` - anything the contract or game-sdk can't do yet, appended per idea

Status: waiting for the initial build to land on `main` (CLAUDE.md, docs/GAME_CONTRACT.md,
docs/DESIGN_SYSTEM.md, docs/ADDING_A_GAME.md, games/*). Nothing designed yet.
