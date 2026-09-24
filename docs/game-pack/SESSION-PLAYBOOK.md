# Game-pack session playbook

Every session that builds part of the owner's game pack follows this file. Your prompt names your
game, its id, your worktree, your port and anything special; everything else is here.

## 1. Read first (in this order)

1. `docs/game-pack/<id>/SPEC.md` — your game (the Foundation session: `parts/00-FOUNDATION.md`).
2. `docs/game-pack/parts/00-FOUNDATION.md` — the platform every game stands on.
3. `docs/game-pack/FOUNDATION-AUDIT.md` — main checked against Part 00: conflicts, errata, the 20
   owner questions with recommended answers, the build plan. Where the audit corrects the spec,
   the audit wins unless the owner decided otherwise (recorded in `docs/game-pack/DECISIONS.md`
   once it exists).
4. `C:/dev/partybox-ideas/GAME-DESIGN-BRIEF.md` — §4 hard rules are binding.
5. `docs/ADDING_A_GAME.md`, `docs/GAME_CONTRACT.md`, `docs/DESIGN_SYSTEM.md`, `docs/DECISIONS.md`.
6. Skills: `.claude/skills/game-pack-build/SKILL.md` and `.claude/skills/record-review/SKILL.md`.

**The code on main is the truth.** If the spec conflicts with the code or a brief hard rule, do not
bend the rule quietly: write the conflict and a proposed fix in `docs/game-pack/<id>/NOTES.md` and
tell the owner.

## 2. Your workspace

- Repo: `C:/dev/partybox` (branch `main`). Make your own worktree:
  `git -C C:/dev/partybox worktree add <your worktree> -b <your branch> main`, then
  `pnpm install --offline` inside it (plain `pnpm install` if that fails). Work only there.
- Your harness port is in your prompt. Never use port 42069 (the owner's live server), never another
  session's port, never another session's worktree or branch.
- Never kill `chrome-headless-shell` processes wholesale — other sessions use them; kill only your own
  orphans. Stop every server you start (`server.stop()` in `finally`).
- Never write in `C:/dev/partybox-ideas` (other sessions own it) — reading is fine.
- `git merge main` into your branch at least daily and before every review, so you build on what
  others shipped.

## 3. Who owns what (so nobody builds the same thing twice)

| Work                                                                                                                                                                                                                          | Owner                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| F1 code-split + registry, F2 catalog/`about`/manifest fields, F3 picker, F4 presence (P1, P2, P7), F5 matcher (P3), F6 `toSpeakable`/overrides/speech lab (P4), P5, the helpers `teamsFromSeed` / `majorityPick` / `rotation` | **Foundation session** |
| `SecretCard`, `FacePicker`                                                                                                                                                                                                    | Imposter               |
| `Dial` + `DialInput`, `TeamBanner`                                                                                                                                                                                            | Tune In                |
| `OrderPicker`                                                                                                                                                                                                                 | Hive Rank              |
| `BidPad`                                                                                                                                                                                                                      | Blind Auction          |
| `WordGrid`                                                                                                                                                                                                                    | Spy Grid               |

A shared piece you need but don't own: check main (`git log --oneline main -- packages/game-sdk`);
if it isn't there yet, build against a thin local stand-in inside your game folder, note it in
`NOTES.md`, and swap to the real one as soon as it lands. Never write another owner's SDK piece.
An owner builds its piece in `@partybox/game-sdk` exactly as Part 00 §6 describes (tokens only,
reduced motion, 44 px targets, never colour alone), with tests, and ships it to main early — before
its own game — so the others can use it.

## 4. Stages

1. **Content first** (needs nothing from the platform): the packs at the sizes the spec gives, every
   item validated against `docs/game-pack/schemas/` (typed answers: `answer-item.schema.json`), the
   pack tests the spec lists. Content quality is part of the game: varied, funny where it should
   be, fair, no brands/real people unless the spec allows them.
2. **Server logic**: pure reducer, one file per phase, state holds only what's drawn, secrets only in
   the right views, bots decide from their own `controllerView`, 3–5 awards, recap. Unit tests,
   contract suite, `pnpm sim` 200+ seeds random + idle, 16-player state-size test.
3. **Client**: TV and phone through the registry only (never import `content/**` from `client/**`),
   tokens only, English + Spanish strings, PhoneStage for every stage moment, 320×568 and 200 % text
   fit.
4. **Record → review → fix → re-record** with the `record-review` skill until every smoothness gate
   holds (no dead air, no hard cuts mid-phase, no long frames, cues and voice on their frames). The
   owner's words: "well oiled, smooth and beautiful — 3D visuals and transitions — no choppiness, no
   deadness". Re-record after every visual, motion, timing or sound change. Never make the owner the
   tester.
5. **Review package** for the owner: screenshots (320×568, 390×844, sideways, 200 % text, TV
   1920×1080, all five themes), the key clips, a five-line summary, open questions — written to
   `docs/game-pack/<id>/REVIEW.md` (media under `reports/design/record-review/<id>/`, gitignored).
   Then wait for the owner.
6. **Ship** only when the owner says so: `git merge main`, `pnpm verify` green, then
   `git -C C:/dev/partybox merge --ff-only <your branch>` (if main moved, merge again and re-verify).
   Add your CHANGELOG line and set `docs/game-pack/<id>/README.md` status.
7. **Keep improving** after it ships: more record-review passes (every player count, remote,
   phone-only, Spanish, idle, drops), content growth, polish — until the owner redirects you.

If a platform piece your stage needs is missing, do the stages that don't need it (content, server
logic and its tests don't need F1–F4), and check main again each hour.

## 5. Working rules

- `pnpm verify` green before every commit on your branch (registry, typecheck, lint max-lines 300,
  lint:deps, format, unit+contract, sim smoke, build, doc drift).
- Edit code with the Edit/Write tools (Python on Windows writes CRLF; heredocs mangle escapes).
- Keep `docs/game-pack/<id>/NOTES.md` current: decisions, conflicts found, stand-ins in use, what's
  left. It is how the owner and the other sessions see where you are.
- Ask the owner only at real pick points (options with a recommendation); otherwise make the call,
  note it, and keep going.
