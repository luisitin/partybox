# Changelog

All notable changes. Format: [Keep a Changelog](https://keepachangelog.com/); conventional commits feed it.

## [Unreleased]

### Added
- **Bingo's wrong claim is a moment** (I-006, option B): the checked card shakes with the NOT A BINGO
  buzzer, and 1.2 s later its daubs lift off one by one in reading order, each squeezing as its
  colour drains — the wipe is watched, not read.
- **Blanks result lands one thing at a time** (I-005, option C): the winning card's voter chips pop in
  120 ms apart with a `lock` note each, the other cards' pills rise 60 ms apart fewest votes first,
  and as the winner is named the pills step back to 55 % and the confetti is twice as thick.
- **Wisecrack reveal: the winner is crowned, the loser steps back** (I-002, option B): on the points
  beat the winning card takes the `pb-crown` lift instead of a flat 1.02 scale, and against a clear
  winner the other card shrinks to 0.96 and dims to 60 % (a tie moves nothing).
- **The answer field reacts while you type** (I-001, option C, `TextAnswer` in the game-sdk — Wisecrack and
  Broken Pencil's text fields): the field joins the last-5-s urgency (danger border + beat), the
  character counter bumps on every keystroke, and a field left empty for 3 s breathes until you type.
- **Bingo daubs are ink blots in your colour** (I-010, option C): on the phone a daub stays as an
  irregular blot in the player's roster colour instead of a flat fill (the TV and verdict cards are
  unchanged); the tap that completes a row, column or diagonal bumps its five squares in order.
- **Game recaps on disk** (ADR-035): each game a room plays is written to `recordings/<game>/<time>-<room>/`
  — `session.json`, `state.json` and a `recap.md` (Broken Pencil's books with every drawing as SVG,
  Wisecrack's prompts, answers and votes, Lightning Round's questions with every pick). A **Save a
  recap on the host PC** toggle in the game picker (phone and TV) turns it off; the dev API and the
  design harness leave it off; `PARTYBOX_RECORDINGS=off` disables it server-wide.
- **Spicy** in Wisecrack (140 prompts) and Broken Pencil (90 drawable words) now matches the Blanks
  WILD deck: explicit adult humour, 18+; nothing hateful, no real people.
- **Lightning Round**: 3 867 questions (from 256) in ten categories: Science is now **STEM** with
  math, engineering and computing; new **Entertainment** and **Everyday Life**; each split into
  topics (59 in all). A **Topics** checklist under the category setting draws from the ticked topics
  only (falls back to the category, then all). The TV and phones name the topic on every question.
- `multiselect` setting type (ADR-034): several picks stored as one comma-joined string, optionally
  grouped by a sibling `select`; rendered as a chip checklist on the phone and the TV host panel.
- Background music for **Wisecrack** (comic tracks while writing: Sneaky Snitch / Fluffing a Duck /
  Carefree, Kevin MacLeod CC BY 4.0, plus the warm / marimba / lo-fi / lounge beds around it) and
  **Lightning Round** (a new synthesized `pulse` bed under questions and reveals, the late-night
  chords under the wager, the marimba on the intro).
- **Blanks** (`games/blanks`): fill-in-the-blank card comedy — a black card, a hand of ten white
  cards, one-at-a-time read-outs on the TV (and on every phone, so it plays without a TV), everyone
  votes or a rotating judge picks, one point per round; three decks (Mild / Crude / WILD) chosen by
  the VIP, optional Rando phantom player; bots welcome.
- **Bingo** (`games/bingo`): 75-ball bingo with free daubing, a public check that pauses the caller
  (green ✓ / red ✕ / missed squares), a wiped card as the penalty for a wrong BINGO!, a pattern per
  round (line / four corners / X / blackout), cheeky caller phrases; bots welcome.
- **Broken Pencil** (`games/broken-pencil`): Telestrations-style word → drawing → guess books with a
  phone DrawPad (8 colours, 3 pens, undo, limited ink), the full circle by default (`passes` shortens
  it), then a TV show that turns every page with the VIP on Next; Unbroken awards, no scores; bots
  fill seats.
- `ViewEnvelope.timerMode` (ADR-030): games can ask the shells for a quiet (bar only) or hidden timer.
- Host controls on the TV (ADR-031): `tv:vip` / `tv:bot` socket events with the engine's `host`
  flag, a Host toolbar (pick / start / bots / pause / skip / end / play again), a ⌂ Home button, and an
  interactive game-picking screen with editable settings (`SettingField` shared with the phone).
- Bots as room players (ADR-028): "Add a bot" in the lobby (max 4 per person, owner/VIP can remove,
  never VIP, leave with their owner), `supportsBots` manifest flag gates Start, contract check that a
  flagged bot acts with varied inputs, `bot` socket event, 🤖 chip tag, dev-API bots now go through the
  engine.
- Resume by name (ADR-029): a token-less join under a disconnected player's name resumes that player.
- Multi-persona live-play harness (`packages/e2e/live/`) and the 2026-09-15 session report.

### Fixed
- Lightning Round TV wager page: from nine players the standings take three columns, from
  thirteen four (the roster chips carry scores and wrap to three or four rows, so two columns of
  six small rows ran the last row under the host bar at 12 players and three columns clipped at
  16). `Scoreboard` gained an additive `columns` option.
- Lightning Round TV final reveal: under a four-row roster (16 players with scored chips) the
  bet cards ran under the host bar; the reveal now sits in the same size container as the
  question page and compacts below 560 px (slimmer answer bar, caption-size two-line rows).
- Broken Pencil TV show: the drawing sheet now takes the height the stage has left (a two-row
  roster at seven or eight players pushed a fixed 560 px sheet over the page kicker and into the
  host bar).
- Lightning Round TV at sixteen players: the four-row roster pushed "0 / 16 locked in" under the
  host bar; the question page now measures its room and drops to a compact prompt and cards when
  the stage is short (twelve players and fewer keep the full size).
- The crossfade ghost of a screen with a `<select>` (the TV host panel into a game intro) showed
  every option's label run together for a beat; it now keeps the picked label only.
- Wisecrack **Spicy**: the 25 mildest prompts (dark setups with no adult referent) rewritten in the
  explicit register of the Blanks WILD deck; the longest prompt (83 chars) proven to fit every surface.
- Resuming a paused game no longer flashes the held seconds plus the pause length (18 for 11)
  on the TV timer and the phone bar for a beat: the clock hook re-reads the time when its cadence
  changes.
- Phone screens that scroll (six-player results, a long wager list) fade their last line at the fold
  instead of cutting it mid-glyph; the fade lifts once scrolled to the end and never shows on a
  body that fits.
- **Broken Pencil** show: a bot's book turns itself at a presenter's pace (5 / 8 / 5 s) instead of
  the room's 12–20 s fallbacks; page turns are a cut (no dissolve) and every page is visible from its
  first frame.
- **Broken Pencil**: a drawing the timer cuts off keeps what was drawn — the phone sends the sheet as a
  `draft` while drawing, and the deadline uses it instead of a blank page (the phone also gets its draft
  back after a reload mid-drawing).
- Stale VIP badge while offline, toasts rendered as buttons, "Connecting…" shown while connected,
  spectators missing from the TV strip during play (all from the live-play report).

## [0.1.0] - 2026-09-15

### Added
- Phase 0: monorepo scaffold (pnpm workspaces, TypeScript 6, ESLint boundaries, dependency-cruiser,
  Prettier, Vitest projects), `pnpm verify` gate, generated game registry, doc set and ADRs 001–021.
- Phase 1: `@partybox/shared` (contract types + zod schemas, socket protocol, counter-based PRNG,
  room codes / names / avatars) and `@partybox/engine` (pure room machine: join/resume/spectators,
  VIP rules + 30 s handover, 120 s disconnect expiry, GameRunner with once-per-phase timers,
  `nextWakeAt` ticks, settings coercion, views with VIP decoration); 57 tests, engine 98 % lines.
- Phase 2: `@partybox/server` (Fastify + Socket.IO host, one timer per room, injectable/frozen clock,
  rate limiting, resume-by-token socket remapping, LAN IP + QR + firewall banner, `/healthz`, `/api/info`,
  full dev API incl. server-played bots) and `@partybox/client` (route switch, controller store with
  token resume + rev gating + clock offset, TV observer, join/lobby/selecting/playing/results screens,
  VIP menu, TV frame with QR, synthesized sound cues, tap-to-start + mute + fullscreen) plus the first
  `@partybox/game-sdk` UI primitives (Avatar, PlayerChip, Stage, BigText, Timer, PlayerChips,
  Scoreboard, Screen, PrimaryButton, WaitingScreen, server clock hooks).
- Phase 4 + 5 (the two launch games, built by context-free sessions from the docs):
  `games/wisecrack` and `games/lightning-round` — see the entries below.
- Phase 3: `@partybox/game-sdk` helpers (`enterPhase`, `applyVip`, `buildResults`, `envelope`…),
  interaction primitives (`TextAnswer`, `ChoiceGrid`, `VoteList`, `Reveal`), the split into
  `@partybox/game-sdk` (pure) and `@partybox/game-sdk/ui` (React), the contract suite that runs
  against every `games/*` folder (totality fuzz, purity scan, packs, fixtures, termination with four
  bot strategies, determinism, stale timers, hidden-info leaks), `games/_template` ("Quick Poll"),
  and `pnpm new-game <id>`.
- Phase 6: `@partybox/sim` — headless simulator with five strategies + `mixed`, chaos actions,
  invariants after every event, determinism replay, repro files + `--replay`, `--smoke` (now part of
  `pnpm verify`), `--dump-fixtures`; `@partybox/game-sdk/testing` entry point.
- Phase 7: `@partybox/e2e` — `pnpm e2e` (TV + phones through the real UI, moves via the new
  `POST /api/dev/act`, zero-console-error gate) and `pnpm e2e:snap` (frozen-clock screenshots per
  phase, per device preset incl. iPhone SE / Galaxy / landscape / 200 % font, spectator phone);
  `/preview` route renders any fixture inside the real shells; `GET /api/games`; Vite HMR now on the
  app's own port (ADR-026).
- `games/lightning-round` ("Lightning Round"): speed trivia — 216 original questions in 8 categories,
  speed + streak scoring, a final wager question, three awards, fixtures, tests and contract config.
- `games/wisecrack` ("Wisecrack", prompt → answer → vote): 3–8 players, rounds/answerSeconds/spicy settings, double-points last round, sweep bonus, three awards, 160 family + 56 spicy prompts.
- Phase 8: bundled Nunito Variable (OFL) display font, 4× CPU-throttle budget check in `pnpm e2e`,
  surface base font-size fix, `/api/dev/act`, e2e screenshots for every phase of both games.
- Phase 9: fresh-eyes pass — "adding a phase" checklist and ADR-027 fixes from the two game builds.
