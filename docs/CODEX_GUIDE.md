# PartyBox guide for agents new to this machine

For OpenAI Codex, and for any agent with no memory of this project. It holds what the Claude sessions
used to keep only in their private notes, written for any tool. Read it after `C:/dev/AGENTS.md` and the
repo's `AGENTS.md`. When something here is wrong, fix it on a branch (it goes through review like code).
Volatile state (who is on which sha, open reviews) lives on the Agent Hub and in
`C:/dev/agent-hub/handoffs/`, not here. Written 2026-09-25.

Contents: [1 First 15 minutes](#1-the-first-15-minutes) · [2 Map](#2-map) ·
[3 Install, run, test](#3-install-run-test-and-verify) · [4 Ports](#4-ports) ·
[5 Game contract](#5-the-game-contract-in-brief) · [6 Who owns what](#6-who-owns-what) ·
[7 Idea pipeline](#7-the-idea-pipeline-cdevpartybox-ideas) · [8 Agent Hub](#8-the-agent-hub-workflow) ·
[9 The owner](#9-the-owners-standing-preferences) · [10 Gotchas](#10-windows-and-tooling-gotchas) ·
[11 Artifacts](#11-on-disk-versus-claudeai-artifacts) · [12 Claude-only tools](#12-claude-only-tools-and-their-shell-equivalents)

## 1. The first 15 minutes

1. **Read the rules.** `C:/dev/AGENTS.md` (hub and team rules), then `C:/dev/partybox/AGENTS.md` (the
   repo map), then this guide. Codex loads `AGENTS.md` files only at session start, from the git root
   down to the folder it started in. It never reads `C:/dev/AGENTS.md` when started inside a repo, and
   never reads a subfolder's `AGENTS.md` on its own. Before working in `games/<id>/` or
   `packages/<name>/`, read that folder's `AGENTS.md` yourself. A folder that has only a `CLAUDE.md` (a
   branch cut before ADR-055) keeps its rules there, so read that instead.
2. **Join the hub under your own name**, and always pass `--as` (see §8):
   `node C:/dev/agent-hub/hub.mjs join --as codex-<area> --role "<what you do>"`. Your first `read`
   prints the whole backlog (over 1 MB), so send it to a file:
   `node C:/dev/agent-hub/hub.mjs read --as codex-<area> > C:/dev/scratch/codex-<area>/hub-backlog.txt`.
   Then read `recent -n 40`, all of `#decisions` (`recent -n 200 -c decisions`), and `who`.
3. **Find your work.** In order: your prompt, the handoff for your area
   (`C:/dev/agent-hub/handoffs/<name>.md`), open `REVIEW REQUEST`s in #merges, then #plans. Taking over
   someone's area: post `TAKING OVER <area> from <name>` in #general first.
4. **Make your own worktree.** Never work in someone else's worktree, and never in the main checkout:
   `git -C C:/dev/partybox worktree add C:/dev/partybox-codex-<area> -b <branch> main`, then in it run
   `pnpm install --offline` (plain `pnpm install` if that fails). Add `pnpm fetch-music` if you will
   record audio (§10).
5. **Claim ports** in hub thread [b1bc79] before starting any server. Codex agents use 42600-42699, in
   blocks of 2.
6. **Say what you're doing**: `status "<task>"`. Before touching shared code, post in #plans. Then start
   the check loop (§8.6) and keep it running until your work is merged.

Keep scratch files outside every worktree, in `C:/dev/scratch/<your-hub-name>/`. Prettier checks
untracked files in a worktree, so a stray file turns `pnpm verify` red.

## 2. Map

### C:/dev

| Path                                  | What it is                                                                                                                                                                                 | Who writes there                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| `C:/dev/AGENTS.md`                    | The machine's rulebook (hub, reviews, merging). `CLAUDE.md` beside it only imports it                                                                                                      | anyone, after a #plans post                    |
| `C:/dev/partybox`                     | The **main checkout**, always on `main`; merges land here (`git -C C:/dev/partybox merge --ff-only`); remote `origin` = GitHub `luisitin/partybox` (private). The owner's server runs here | nobody edits files here                        |
| `C:/dev/partybox-*`                   | Git worktrees: one per agent, review checkout or helper (`git -C C:/dev/partybox worktree list`)                                                                                           | only the agent that made it                    |
| `C:/dev/partybox/.claude/worktrees/*` | Early sessions' worktrees (stress, design, designer, blanks-loop, review-loop, wl-loop, ux-\*); mostly stale                                                                               | nobody (cleanup rule, §8.7)                    |
| `C:/dev/partybox-ideas`               | The idea pipeline, not a git repo (§7). Its `AGENTS.md` has its rules                                                                                                                      | the session holding each role                  |
| `C:/dev/agent-hub`                    | Hub CLI `hub.mjs`, messages in `data/`, `helpers/` (helper slots), `handoffs/` (one file per agent)                                                                                        | via the CLI; your own handoff and helper files |
| `C:/dev/scratch/<name>`               | Scratch space for agents without a private scratchpad (logs, probes, notes)                                                                                                                | its owner                                      |
| `C:/dev/partybox/recordings/`         | Every game played on the owner's server: `session.json`, `state.json`, `recap.md` (gitignored)                                                                                             | the server                                     |

### The repo

The root `AGENTS.md` has the folder map, commands, contract invariants and dependency direction. What
else matters day to day:

- `docs/START_HERE.md` gives a reading order per task, with one line per doc. `docs/DECISIONS.md` holds
  the ADRs; read it before changing anything shared.
- `docs/game-pack/`: the owner's 10-game pack. `parts/` holds the part files as sent (byte-exact,
  prettier-ignored). `<id>/SPEC.md` is one game's design, and `<id>/NOTES.md` and `REVIEW.md` are its
  build state and review package. `SESSION-PLAYBOOK.md` is how a game session works; where it says
  "wait for the owner" or "ship when the owner says so", the hub's peer review (§8) replaces that.
  `DECISIONS.md` holds the owner's rulings on the pack, and `FOUNDATION-AUDIT.md` checks main against
  Part 00.
- `packages/e2e/src/design/`: the design harness. `capture-loop.ts` records real games (video, 10 fps
  strips, cue trace), `session.ts` opens the TV and phones, `devices.ts` defines phone presets
  (`iphone-se`, `pixel`, `galaxy`, `font200`, `ipad`, `landscape-safari`), `dead-air.ts` finds stills,
  `filmstrip.ts` and `fit-audit.ts` build sheets, and `audio-trace.ts` checks sound timing.
- `reports/design/`: `loop-log.md` (one row per review pass, shared by every loop session),
  `record-review/<game>/` (a game's recordings; the JSON is committed, media is gitignored),
  `ideas/I-nnn.md` (proof notes for shipped ideas) and `ideas/owner-*.md` (the owner's live bug
  reports: read them).
- `.claude/skills/<name>/SKILL.md`: step-by-step recipes (`add-game`, `verify-and-commit`,
  `record-review`, `run-sim`, `snap-game`, `game-pack-build`, `review-loop`, `ship-spec`). They are
  plain Markdown: follow them as checklists.
- `scripts/`: `verify`, `check-drift`, `check-bundle`, `gen-registry`, `new-game`, `resolve-loop-log`,
  `fetch-music`, `lan-ip`, plus the Blanks deck tools (`scripts/README.md`).

## 3. Install, run, test and verify

Node 24 (24.19 here), pnpm 12 through corepack, Git 2.55; Python 3.12 is available too. Playwright's
Chromium is installed once per machine (`pnpm exec playwright install chromium`) and shared by every
worktree.

| Command                                                 | What it does                                                                                                                                                                         |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm install --offline`                                | Install in a new worktree (the pnpm store is shared, so it takes seconds)                                                                                                            |
| `pnpm dev --port <yours>`                               | Dev server: Vite, client hot reload, dev API on. **Server code does not reload**: restart it after any server or game-server edit                                                    |
| `pnpm build` then `pnpm start --port <yours> --dev-api` | The production build; `/api/dev/*` answers 403 without `--dev-api`                                                                                                                   |
| `pnpm verify`                                           | THE gate before every commit: registry, typecheck, lint, deps, format, unit and contract tests, sim smoke, build, bundle, doc drift. Under 3 min on a quiet box; 6-12 min under load |
| `pnpm test`, `pnpm vitest --project <games\|engine\|…>` | Unit tests (all, or one project); `pnpm vitest run games/<id>` for one game                                                                                                          |
| `pnpm sim --game <id> --players 6 --runs 200 --seed 1`  | Headless games; `--strategy random\|idle\|mixed`, `--players vary`, `--replay <file>`, `--dump-fixtures`                                                                             |
| `pnpm e2e`, `pnpm e2e:snap --game <id>`                 | Browser tests; one screenshot per phase                                                                                                                                              |
| `pnpm check-bundle [--list <id>]`                       | What phones download; each game's phone budget is 33 KB gzip, and it flags TV code on phones                                                                                         |
| `pnpm gen-registry`                                     | After adding or renaming a game                                                                                                                                                      |
| `pnpm new-game <id>`                                    | Scaffold a game from `games/_template` (`docs/ADDING_A_GAME.md`)                                                                                                                     |
| `pnpm resolve-loop-log`                                 | Resolve a `reports/design/loop-log.md` merge conflict (never keep both sides)                                                                                                        |
| `pnpm fetch-music`                                      | Download the gitignored background music into `packages/client/public/music/`                                                                                                        |
| `pnpm lan-ip`                                           | This PC's LAN address (phones join on it)                                                                                                                                            |

- **Pages.** TV: `http://localhost:<port>/tv`; phones: `http://localhost:<port>/`. Any fixture inside
  the real shells: `/preview/<gameId>/<fixture>?view=tv|controller&player=<id>` (it rebases deadlines,
  so it can show a timer the live game hides).
- **Dev API** (`docs/DEV_API.md`), on your own server only: `reset`, `bots` (`{count, strategy}`: pass
  `strategy: 'random'`, since the harness helper's default `idle` bots never act), `start` (settings
  are ignored while the room sits in the lobby; open the picker first), `event`, `vip`, `skip`,
  `load-state`, `state`, `clock` (freeze for stills, unfreeze for motion), `disconnect` (server side
  only; for a real phone drop use Playwright's `context.setOffline(true)`), `act`.
- **`start-partybox.bat`** is the owner's launcher: it runs on port 42069, adds the firewall rule,
  installs, builds, fetches music and runs `pnpm start --dev-api`. Don't run it: 42069 belongs to the
  owner (§4).
- **Reading verify.** It prints a table ending `└─ total … s — GREEN` or `— RED`. Check that line and
  the exit code before any commit or merge. `cmd | tail` or `cmd; echo; tail` report tail's exit code,
  not verify's; main was once fast-forwarded on a red verify that way. Bash:
  `if pnpm verify > C:/dev/scratch/<you>/verify.log 2>&1; then echo GREEN; else echo RED; fi`.
  PowerShell: `pnpm verify *> C:/dev/scratch/<you>/verify.log; "exit $LASTEXITCODE"`.
- **Flaky under load** (#decisions [49bc0e]): if the only red is a contract-test timeout that passes
  alone, a reviewer may still APPROVE and say so. MERGING needs a green verify on the merge commit;
  rerun when the box is quiet, or use `pnpm test -- --maxWorkers=3`. Before calling a timeout a
  regression, run the last green commit under the same load.

## 4. Ports

Never use 42069 (the owner's live server), and never another agent's port. Stop your servers and
browsers when you aren't being play-tested: memory is tight. The live picture:
`Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -ge 42000 -and $_.LocalPort -lt 43000 } | Sort-Object LocalPort`.

| Port(s)             | Owner                                                                                                                                                                                                                                                                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 42069               | The owner's server (`C:/dev/partybox`, log `reports/owner-server.log`), plus a Cloudflare quick tunnel for outside guests (its URL changes every launch)                                                                                                                                                                                 |
| 42070, 42071, 42073 | Reserved for the original stress, design and designer sessions                                                                                                                                                                                                                                                                           |
| 42080               | The Idea Forge site (`C:/dev/partybox-ideas/site/server.mjs`), where the owner picks idea options                                                                                                                                                                                                                                        |
| 42081-42151         | Old loop and recorder harnesses (design probes, blanks-loop 42097-42099, wl-loop 42111-42131, the idea recorders 42141+)                                                                                                                                                                                                                 |
| 42300-42309         | partybox-foundation (42300 live builds, 42304/42305 design passes)                                                                                                                                                                                                                                                                       |
| 42310-42419         | The game sessions, a block of 10 each: imposter 4231x, herd-mind 4232x, fake-out 4233x, who-said-it 4234x, tune-in 4235x, hive-rank 4236x, echo 4237x, blind-auction (Mystery Box) 4238x, spy-grid 4239x, nightfall 4240x, secret-hitler 4241x. The first port is the live build; the rest are review worktrees, recorders and re-checks |
| 42500               | reviewer                                                                                                                                                                                                                                                                                                                                 |
| 42520-42599         | Helpers, claimed in hub thread [ffa372] (reviewer 42520/42522/42524, spy-grid 42530/42532, foundation 42540/42542, tune-in 42560/42562, echo 42580/42582, who-said-it 42590/42592)                                                                                                                                                       |
| 42600-42699         | **Codex agents**: claim in hub thread [b1bc79]                                                                                                                                                                                                                                                                                           |
| 4747                | The hub's web UI (`node C:/dev/agent-hub/hub.mjs serve`), which the owner uses                                                                                                                                                                                                                                                           |
| 42050, 42523        | Not PartyBox: OneDrive and Tailscale                                                                                                                                                                                                                                                                                                     |

## 5. The game contract in brief

A game is a pure, deterministic state machine in `games/<id>/`. Full text: `docs/GAME_CONTRACT.md`;
recipe: `docs/ADDING_A_GAME.md`.

- **`reduce(state, event)` is pure and total.** Time comes from `event.now` and randomness from
  `state.rng`: no `Date.now`, `Math.random`, timers, I/O or module-level state under `server/`. Timers
  are data (`state.phase.deadline`). State is JSON, at most 256 KB, and byte-identical for the same seed
  and events.
- **Views never throw and never leak.** `tvView` and `controllerView` hide secrets by omitting the key,
  never by setting it to null. Each game's `__tests__/contract.config.ts` tells the contract suite
  what is hidden. Bots decide from their own `controllerView`.
- **Every phase can be exited** (deadline, all submitted, or VIP skip), and every phase has
  `fixtures/<phase>.json`. `results()` lists every player with finite scores.
- **Imports:** only `@partybox/game-sdk`, `@partybox/game-sdk/match` and `@partybox/game-sdk/ui` (+
  `react` in `client/`). Client code never imports `server/**` or `content/**`, and phone code never
  imports TV components.
- **The lazy layout** (ADR-050, #decisions [2f5f7e]): `client/shared.ts`, `client/phone-entry.ts` and
  `client/tv-entry.ts` (named `*-entry.ts`, since `tv.ts` collides with `Tv.tsx` on Windows).
  `manifest.json` carries `icon`, 3 `howToPlay` steps (≤ 90 chars each), `presence`, `addedOn`, 1-3
  `tags`, a `tagline` (≤ 60) and a `description` (≤ 300). `manifest.es.json` has every manifest
  sentence in Spanish (`scripts/i18n-coverage.test.ts` checks it). Server code sorts with
  `compareCodeUnits` (lint bans `localeCompare`, `toLocale*` and `Intl`).
- **The shell runs the start** (ADR-053): rules, then every connected human taps READY, then 3·2·1.
  Games don't build their own.
- **Results:** co-op and team games set `outcome` (ADR-052). **Content language:** `room.contentLang`
  (ADR-054, in review): an explicit VIP or TV switch, else the VIP phone's language, else English.
- **Strings:** every UI string is `L('English…')` through `useT(STRINGS)`, with its Spanish in the
  area's table (ADR-044). Spanish is **Latin American**: ustedes, never vosotros; celular, papa, auto,
  computadora ([6753e3]). English-only content is allowed only with a visible "en inglés" marker on
  Spanish screens ([196a9e]). Game names stay English on the Spanish picker ([fa392b]).
- **Checks** a game branch must pass: `pnpm verify`, `pnpm sim` (200+ runs, random and idle, 16
  players), the contract suite, `pnpm check-bundle`, and the design review (§8.4).

## 6. Who owns what

- **Shared code.** Engine, contract, SDK core, shell and lobby belong to `partybox-foundation`, which
  should review any branch that touches them. The SDK pack pieces have owners: `SecretCard` and
  `FacePicker` belong to imposter; `Dial`, `DialInput`, `DialStrip` and `TeamBanner` to tune-in;
  `OrderPicker` to hive-rank; `WordGrid` to spy-grid; `BidPad` to blind-auction. Never write
  another owner's piece. Build a stand-in inside your game folder and swap it when theirs lands
  (`docs/game-pack/SESSION-PLAYBOOK.md` §3).
- **Games on main:** bingo, blanks, broken-pencil, lightning-round, wisecrack (the original five), and
  hive-rank, imposter, spy-grid, tune-in, fake-out, who-said-it (the pack). Follow-ups for those go on
  a new branch from main. **In review, on their own branches:** echo, herd-mind, nightfall,
  secret-hitler, blind-auction (being renamed **Mystery Box**, #decisions [1a5b76]).
- **Each game's owner agent** is `partybox-game-<id>`, with its worktree at `C:/dev/partybox-game-<id>`
  and its port in §4. Its state lives in `docs/game-pack/<id>/NOTES.md` (on its branch) and its
  handoff in `C:/dev/agent-hub/handoffs/`. Other agents: `reviewer` (dedicated code and design
  reviewer; it also tallies approvals), `overseer` (audits the process: timestamps, approvals on the
  right sha), `partybox-session-c` (ships idea specs, §7), and the helpers (`<boss>-helper-<n>`, §8.8).
- **The owner** is `luis` on the hub. They follow your session's chat (often from another device), not
  the hub, and you escalate to them only what §8.9 lists.

## 7. The idea pipeline (C:/dev/partybox-ideas)

Three roles, each writing only its own files. `README.md` there is the contract, and
`C:/dev/partybox-ideas/AGENTS.md` has the rules.

| Role                                  | Reads                             | Writes only                                                                   |
| ------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------- |
| A, ideas: plays the games, logs ideas | main (read-only), `SHIPPED.md`    | `IDEAS.md`, `evidence/<id>/`, its own tools and reports                       |
| B, options designer (the Idea Forge)  | `IDEAS.md`, `evidence/`, the repo | `options/` (+ `picks.json`), `specs/<id>.md`, its `work/*` worktrees, `site/` |
| C, implementer (`partybox-session-c`) | `specs/`, the repo                | the repo (through review) and one `SHIPPED.md` row per shipped idea           |

- Ids are `I-nnn` (A numbers them; never renumber). `IDEAS.md` is grouped by game and ranked by value
  (`python sort-ideas.py`); find entries by id.
- The owner picks options on the Idea Forge site (`http://localhost:42080`). Picks and notes land in
  `options/picks.json`, and **the notes are binding** on top of the spec.
- **Session A's unfinished work**, open to anyone: the 1-5 value audit of un-optioned ideas (266 of
  630 left). Steps, tools and gotchas are in `C:/dev/partybox-ideas/HANDOFF-SESSION-A.md`. (Its phone
  design review item is stale: A-K have shipped since, see §11.)
- Writing an idea: grep every UI string you quote, run the shipped function rather than counting raw
  content, check `git log -S` for "already shipped", and cite files rather than line numbers. The
  2026-09-22 audit found most idea errors were details like these.

## 8. The Agent Hub workflow

The hub is a shared chat (`C:/dev/agent-hub/README.md`). Most rules below are owner decisions recorded
in #decisions; the ids in brackets are message ids (`node C:/dev/agent-hub/hub.mjs thread <id>`).

### 8.1 Identity and basics

- Your name defaults to your git worktree folder. Codex agents always pass `--as codex-<area>`: several
  tools may share a folder, and a shell started elsewhere would post under the wrong name.
- `read` (new since last time, then marks read) · `read --mentions` · `recent -n 50 -c merges` ·
  `thread <id>` · `who` · `status "<doing>"` · `post "text" -c <channel>` · `post "text" -r <id>`
  (a reply stays in its parent's channel) · `post -f <file> -c <channel>` (write long or multiline
  posts to a file; PowerShell mangles `$`, backticks and quotes).
- A bare channel word is not a channel: `post plans "x"` lands in #general. Use `-c plans`.
- `@name` flags a message for that agent (`>>` in `read`). Answer every @mention, even with "ack".

### 8.2 Before shared code: #plans

Post in #plans before touching the engine, SDK, shell, lobby, contract, scripts or anything another
branch depends on: what, why, which files. Wait for objections, and read replies before you merge.

### 8.3 Shipping a branch ([46c400], [4d34ad])

1. `git merge main` into your branch, get `pnpm verify` green, then post in #merges:
   `REVIEW REQUEST <branch> -> main @ <sha>`, followed by what it does, what it touches (call out
   shared code), how to verify (commands, your port), and known risks.
2. You need **4 APPROVEs from 4 different agents on your current sha**, with no open CHANGES.
   **At least 2 must be DESIGN APPROVEs** (§8.4). Any new commit resets the count, so ask reviewers to
   re-confirm, and batch fixes before asking.
3. **Freeze.** Once the request is up, commit only fixes for review items, and post `FROZEN @ <sha>` when
   they're done. New features go on a follow-up branch after the merge. A moving head never reaches
   4/4.
4. **Merge one branch at a time**, and only your own: nobody merges someone else's branch, even an
   approved one ([1a5b76]).

   ```
   node C:/dev/agent-hub/hub.mjs read --as <you>          # objections? someone else MERGING?
   node C:/dev/agent-hub/hub.mjs post "MERGING <branch> @ <sha>" -r <request id> --as <you>
   git merge main                                          # in your worktree
   pnpm verify > C:/dev/scratch/<you>/verify.log 2>&1      # Git Bash (PowerShell: §3); must end "— GREEN"
   git -C C:/dev/partybox merge --ff-only <branch>         # if main moved: merge it again, re-verify
   git -C C:/dev/partybox push origin main                 # fast-forward only; never --force
   node C:/dev/agent-hub/hub.mjs post "MERGED <branch> @ <sha>" -r <request id> --as <you>
   ```

   A rejected push means stop and post; never force (#decisions [6d0b78]). Everyone else merges `main`
   in afterwards. After merges, the owner's server on 42069 needs a restart to serve the new code, but
   **ask the owner before each restart**.

### 8.4 Reviewing others (everyone does it, every check)

- **Verdict format.** Reply to the request: `APPROVE <sha>` plus one line on what you checked;
  `CHANGES` plus what's wrong and what would fix it; `DESIGN APPROVE <sha>` or `DESIGN CHANGES <sha>`
  plus the surfaces, sizes and languages you looked at, ideally with stills.
- **Code review:** `git diff main...<branch>`, then the branch's tests, `pnpm sim` and `pnpm check-bundle`.
- **Design review** runs on the live game, never from the diff. Check TV 1080p, an iPhone SE (320 px)
  and one more (sideways, 200 % text or Spanish), and step through the whole flow: layout, motion,
  feel (no dead air; cues on their frames), clarity for a first-time player, and completeness (no
  stray English, raw keys or placeholders). Also time every text screen and confirm the rules → READY
  → 3·2·1 start ([cc45f4]). Any flaw is DESIGN CHANGES; "fine after merge" doesn't exist for design.
- **Review on your own build only.** Make a detached worktree
  (`git -C C:/dev/partybox worktree add --detach C:/dev/partybox-codex-review <sha>`), install, run it on
  your own port, and create your own room. Never join a room you didn't create or call `/api/dev/*` on
  someone else's port, and never press host controls in their live room ([2de537]).
- **200 % text** means the `font200` device preset: the type scale is px tokens, so
  `html { font-size }` changes nothing.
- **Recurring defects to look for:** an idle timer that starts the game while a connected human is
  unready; 3·2·1 digits that don't shift on pause; phone code importing `Tv*.tsx`; secrets in speech
  audio keys; stray English on Spanish phones; tied awards drawn twice; a ready cap written as
  `now + SAFETY` instead of `min(now + SAFETY, startedAt + CAP)`; pause and resume that skip the
  "everyone in" re-check; payouts floored in a way that loses coins.

### 8.5 #decisions

A proposal becomes a decision after a **full 30 minutes with no objection**, measured from the
proposal's hub timestamp (check the clock; early agreement doesn't count). Record it in #decisions as
`DECISION (proposed in [id] at hh:mm, no objections by hh:mm): …`. Anything that changes the owner's
own rules or the escalation list needs `@luis`.

### 8.6 Never idle: the check loop ([ec74b1], and the owner's order: every 15 minutes)

Your session works only while you are running commands. Ending your turn with "I'll keep going" stops
you until the owner types again. Until your work is merged and nothing waits on you:

- Between steps of long work, run `read`. Never start something that blocks for more than ~15 minutes
  without backgrounding it, so a check can happen in between.
- While waiting, block on the hub: `node C:/dev/agent-hub/hub.mjs wait -t 900 --as <you>`. It returns
  on the first new message, or after 15 minutes. If your shell kills long commands, use `-t 300` and
  repeat.
- **Each check:** `read`; answer @mentions; fix play-test reports on your game; take any REVIEW REQUEST
  that names you or is short of approvals; play-test someone else's branch on your own port; then
  scan your own thread (`recent -n 300 -c merges`, filtered by your branch), since a plain `read` can
  scroll a verdict past you. Finish with a **2-4 line update in your chat for the owner** (what the hub
  asked, what you did, where your merge stands), even when nothing changed.
- Stop only when your work is merged and nothing is waiting on you, and say so in #merges.

### 8.7 Worktree cleanup ([e97b59])

Your own worktrees: delete them freely once `git status` is clean and your commits are on another
branch or on main (`git branch --contains <sha>`). Someone else's unused worktree: propose it in
#plans (path, branch, who made it, why it's unused), and delete it once at least half the agents active
in the last 24 h approve. Post what you removed. Remove with `git -C C:/dev/partybox worktree remove <path>`.

### 8.8 Helpers

A main agent may take helper slots (`C:/dev/agent-hub/helpers/README.md`): it lists jobs in
`helpers/<boss>/slots.json` and `INSTRUCTIONS.md`; a helper claims one with
`node C:/dev/agent-hub/helpers/claim.mjs claim <boss> <slot>`, then works only for that boss as
`<boss>-helper-<n>`. Helpers never post verdicts; they report numbers and stills to the boss.

### 8.9 What still goes to the owner

Only irreversible actions (deleting folders, worktrees or data; force-push; history rewrites; disk
cleanup), anything outside the repo (deploys, publishing, spending), and a deadlock the group can't
settle. Everything else goes to the hub: `#general`, or `#plans` for cross-cutting changes. In reports,
list open questions as hub thread ids.

## 9. The owner's standing preferences

- **The bar is "perfect, a well-oiled machine."** Smooth, beautiful and alive (3D-feeling, with depth
  in visuals and transitions); no choppiness, no dead air, no hard cuts. Green tests say nothing about
  that: look and listen. Review 10 fps strips of the TV and a phone side by side with the cue trace, and
  look for overlaps, beats that land on different frames on the two screens, stalls and double fires.
  Capture at ≥ 10 fps whenever you judge motion. Stills hide the mid-animation frames where the bugs
  live.
- **Sound on the frame.** A sound that names something starts on the frame it appears (the Bingo
  caller's first syllable lands on the ball). Motion that isn't informational respects the motion
  toggle and `prefers-reduced-motion`.
- **Games teach themselves.** An animated how-it-works on the TV before play. The rules say how to win,
  why things work the way they do, and give a concrete example: Spy Grid's `OCEAN · 2` means two of
  your words link to it (`SHARK`, `SHIP`). Each phone says your role and your next action, and that
  action breathes. Every tap has a cue, a haptic and a press motion; sheets slide instead of popping.
  Default to the clearest view.
- **Pacing** ([cc45f4]): never rush. Reading screens stay up long enough for a slow reader (longer in
  Spanish and at 200 %), or wait for a tap. The owner prefers slower over snappy. Show one thing at a
  time, with few pop-ups.
- **Check every size.** TV 1080p _and_ short viewports (laptop, 720p), iPhone SE 320×568, a big phone,
  sideways, 200 % text, Spanish, and all five themes (night, daylight, arcade, cabin, contrast).
  Re-record after every visual, motion, timing or sound change. Never make the owner the tester.
- **Options before variants.** When a request opens several visual or interaction choices, first
  write an HTML page of lettered options with phone-frame mock-ups and your recommendation
  (`reports/design/<topic>-options.html`; `bingo-cards-options.html` is the model). Keep a working
  baseline, and build after the owner picks. At any pick point, give lettered options plus your
  recommendation, as a one-tap choice rather than a list to parse.
- **Blanks** is a Cards Against Humanity-style game for friends. Its wild deck is meant to be dark:
  atrocity and slur punchlines are the point, so never soften or remove them. Keep references
  mainstream and recognisable (no obscure or cringe ones). WILD is the default deck.
- **Updates.** The owner follows from other devices and doesn't read the hub. After every hub check,
  write a short update in your chat.
- **The owner's server (42069):** ask before _each_ restart; a stale server gets stuck on "One
  moment…". Kill the node process and its console parent, restart from `C:/dev/partybox`, and post the
  restart on the hub.
- **Data is sacred.** Never delete shared evidence, recordings or reports (`capture-loop` without
  `--out` once overwrote committed loop evidence). Never commit bulk media: a pass is ~700 MB of video
  and strips, and one commit once took 242 MB.

## 10. Windows and tooling gotchas

**Shells and files**

- Windows 11. PowerShell 5.1 has no `&&`, `||` or `?:`; use `;` and `if`. Git Bash is at hand for
  POSIX scripts. `pkill` doesn't exist.
- Read and write UTF-8 explicitly. `Get-Content` without `-Encoding utf8` corrupts `§`, `·`, `é`,
  and `>`/`Out-File` in PowerShell 5.1 may write UTF-16 or a BOM. Python and Node with
  `encoding='utf-8'` are safe. Git normalises to LF (`.gitattributes`), and prettier wants LF.
- Bash heredocs collapse `\\` and turn `\b` into a backspace byte; Python heredocs can write NUL or
  backspace bytes. Write scripts to files with an editor tool, not heredocs, and check that every edit
  landed (a `replace` silently no-ops once prettier has reflowed its target).
- Never create a file with `cat > file` without checking it doesn't exist (`set -o noclobber`). After
  a batch, a new file must show as `??` in `git status`, not `M`.
- Python can't open `/c/...` paths; use `C:/...`. `$TMPDIR` may be empty in some shells, so use full paths.

**Git and worktrees**

- `git checkout main` fails in a worktree, since main is checked out in `C:/dev/partybox`. Use
  `git merge main` in your branch, and `git -C C:/dev/partybox merge --ff-only <branch>` to land.
- Worktree branches have no upstream. Only `main` is pushed to origin, from the main checkout.
- A new worktree has no `node_modules` (run `pnpm install --offline`) and no music, since
  `packages/client/public/music/` is gitignored. Run `pnpm fetch-music` there, or the audio checks fail.
- `reports/**/*.png`, `*.webm`, `screenshots/` and `video/` are gitignored; `.jpg` is not, so proof
  images must be `.png`. `reports/**/*.json` is prettier-checked: format capture JSON before committing.
- The loop log: take row number `max(main's highest, yours) + 1` and leave gaps of 3-4. Never
  concatenate both sides of a conflict (`pnpm resolve-loop-log`), and afterwards grep for your row's
  first words, since the resolver can drop a row. Keep the Game column short.

**pnpm, lint and verify**

- Lint caps files at 300 lines. Comments don't count, and a prettier re-wrap of a long import can push
  a file over: `// prettier-ignore` on that import. `check-drift` rejects `TODO`/`FIXME` in code
  (even inside Spanish text) unless written `TODO(BL-nnn)` with a matching `docs/BACKLOG.md` item.
- Scripts that import the harness must live inside the repo for module resolution. Copy them to
  `packages/e2e/src/design/<name>.tmp.ts` only while running, then move them back to your scratch
  folder before verify.
- Don't run verify, builds or tests while a recording runs on this box: the load makes video fall
  behind real time and cuts the wrong moments. Measure performance alone, A/B in one sitting, and
  sample CPU first (`Get-Counter '\Processor(_Total)\% Processor Time'`). Long-frame counts up to ~200
  are noise here.

**Servers and processes**

- Stopping `pnpm dev` can leave its `tsx` child listening. Find the PID with
  `Get-NetTCPConnection -LocalPort <port> -State Listen`, confirm with
  `(Get-CimInstance Win32_Process -Filter "ProcessId=<pid>").CommandLine` that it runs from **your**
  worktree, then `Stop-Process -Id <pid>`. Never kill every `node` or `chrome-headless-shell`, since
  other sessions use them; only kill orphans whose parent is gone.
- `startServer` refuses a taken port, and a day-old dev server serves stale code. Chromium caches a
  failed dynamic import (reload fresh). Never edit client files while a sweep runs: Vite hot-swaps
  them into open pages and fakes errors.
- `localhost` is a secure context, but the LAN address is not: clipboard, wake lock, service workers
  and share all differ. Test those against `http://<lan-ip>:<port>`.
- Home is behind CGNAT, so port forwarding is useless. Outside guests use the Cloudflare quick tunnel
  (`C:/Program Files (x86)/cloudflared/cloudflared.exe`, log `C:/dev/partybox/cloudflared.log`, new
  URL per launch) or Tailscale.

**Playwright and the harness**

- `capture-loop.ts`: always pass `--out reports/design/record-review/<game>/pNN`. The default folder
  holds other sessions' committed evidence. `--pass` must be numeric, and `--settings` takes the game's
  own manifest keys (Bingo's is `cards`). Its scripted player acts only after a 4 s quiet gap, so
  `callSeconds` ≤ 4 never triggers pause or reconnect scenarios; use 8. It is at its 400-line cap, so
  add helpers in a new module.
- A `click()` on a transform-animated ("breathing") button never lands: pass `force: true`. A click on a
  button whose label ticks can take over 3 s, so use `dispatchEvent('click')` when timing matters. The
  rules stage needs its "Read all" button pressed before READY.
- The `font200` device CSS is injected per page, and `page.reload()` drops it (re-apply it). A frozen
  clock stepped with `advance` skews client countdowns (measure rings live); unfreezing jumps `now` and
  fires every pending deadline at once.
- Real viewports: iPhone 15 is 393×659 (sideways 659×393), Pixel 7 is 412×839, iPad is 820×1180.
  Size mock-ups to these.
- `dead-air.ts` counts a frame as moving only when a pixel of its 128-px grey copy changes by over 4 %,
  so thin timer bars read as still. Playwright's bundled ffmpeg can't read PNGs or tile images; build
  contact sheets with Python.
- Never `find -name 'f*.png' -delete`: it also eats `filmstrip.png`. Use `-regex '.*/f[0-9]+\.png'`.
- iPhones ignore `HTMLMediaElement.volume`, so music levels go through a Web Audio gain. Probe
  `window.__pbMusic.level()`; headless Chromium honours `el.volume` and hides the bug. iPhones also
  have no `navigator.vibrate`.

## 11. On disk versus claude.ai artifacts

The Claude sessions published some pages as claude.ai artifacts. Codex can't open those, and
everything below has a disk copy.

| Artifact (what it was)                  | Use this instead                                                                                                                                                                                         |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Idea Forge, the first options page      | Superseded by the local site `C:/dev/partybox-ideas/site/` (`http://localhost:42080`); picks and notes in `options/picks.json`                                                                           |
| Phone design review A-M (2026-09-24)    | `C:/dev/partybox-ideas/design-review/index.html` (+ `img/`). A-K shipped (`SHIPPED.md`, I-788…I-796); L and M were kept as-is                                                                            |
| Bingo card layouts and deal options     | `C:/dev/partybox/reports/design/bingo-cards-options.html`, `bingo-deal-options.html`                                                                                                                     |
| Blanks options (music beds)             | `C:/dev/partybox/reports/design/blanks-options.html`; the owner never filled in its picks                                                                                                                |
| Blanks choreography review              | `C:/dev/partybox/reports/design/blanks-choreography.html`: **frozen by the owner**; motion and timing changes go to the loop log and `games/blanks/README.md`                                            |
| Mystery Box live events (owner's picks) | `docs/game-pack/blind-auction/LIVE-EVENTS.md` on branch `game/blind-auction` (worktree `C:/dev/partybox-game-blind-auction`)                                                                             |
| Secret Hitler M1 review                 | `docs/game-pack/secret-hitler/REVIEW.md` on branch `game/secret-hitler`; its screenshots are in `reports/design/record-review/secret-hitler/shots/` in `C:/dev/partybox-game-secret-hitler` (gitignored) |

When you need the owner to look at something, put it on disk (for example
`reports/design/<topic>-options.html`), then give the path and what to look for in your chat.

## 12. Claude-only tools and their shell equivalents

Old notes, handoffs and hub posts mention these. Here is what each did and what to do instead.

| Claude tool                                      | What it did                               | Do this instead                                                                                      |
| ------------------------------------------------ | ----------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `/loop`, CronCreate, ScheduleWakeup, Monitor     | Hub checks every 15 min, timers mid-task  | `node C:/dev/agent-hub/hub.mjs wait -t 900 --as <you>` between steps; `read` inside long work (§8.6) |
| PushNotification, SendUserFile                   | Pinged or sent files to the owner's phone | A short update in your chat; give file paths                                                         |
| Skill (`/verify-and-commit`, `record-review`, …) | Loaded a recipe                           | Read `.claude/skills/<name>/SKILL.md` and follow it                                                  |
| Artifact, ArtifactData (the `picks` db)          | Published pages; stored the owner's picks | An HTML file on disk (§11); picks in `C:/dev/partybox-ideas/options/picks.json`                      |
| AskUserQuestion                                  | Put a question to the owner               | Ask the hub (§8.9); at a real pick point, lettered options plus a recommendation in your chat        |
| Agent, Workflow (subagents)                      | Parallel helpers                          | Do it yourself, or ask for a helper slot (§8.8)                                                      |
| TaskStop, background tasks                       | Stopped a server                          | `Stop-Process -Id <pid>` for your own PIDs only (§10)                                                |
| EnterWorktree, `claude --worktree`               | Made a worktree                           | `git -C C:/dev/partybox worktree add …` (§1)                                                         |
| Memory (`~/.claude/…/memory`), the scratchpad    | Private notes and files                   | Your handoff file, the repo docs (`NOTES.md`) and `C:/dev/scratch/<you>/`                            |
| `Co-Authored-By: Claude …` trailers              | Commit attribution                        | Use your own tool's convention; don't copy Claude's trailer                                          |
