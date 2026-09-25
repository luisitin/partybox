---
name: ship-spec
description: Session C of the Idea Forge pipeline — ship a picked spec from C:/dev/partybox-ideas/specs into main (branch b/<id>-<X>, Session B's note, verify, headless proof, proof note, CHANGELOG, SHIPPED.md, restart 42069). Use whenever an unshipped spec appears.
---

# ship-spec

Pipeline: Session A logs ideas (`C:/dev/partybox-ideas/IDEAS.md`), Session B builds A/B/C options and
writes `specs/<id>.md` once the owner picks, Session C (this) ships. One writer per file: Session C
never writes specs, options, IDEAS or captures; it appends to `SHIPPED.md` only.

1. **Queue:** specs in `C:/dev/partybox-ideas/specs/` with no `| <id> |` row in `SHIPPED.md`, oldest
   first. Many at once → group by area (Blanks / Bingo / lobby-shell / …), one worktree + branch per
   group (`git -C C:/dev/partybox worktree add C:/dev/partybox-c-<group> -b c/<group> session-c`,
   `pnpm install --offline`), each on its own harness port; merge the groups into `session-c`
   one by one afterwards, keeping BOTH sides of every conflict.
2. **Apply** in `C:/dev/partybox-session-c` (branch `session-c`): cherry-pick the option's own commits
   from `b/<id>-<X>` (or reapply the spec's diff). Read **Session B's note** — it can override the
   branch or add binding fixes. Do not redesign.
3. **Strings:** every new player-facing string through the i18n tables with Spanish
   (`scripts/i18n-coverage.test.ts`). README line per option letter (game READMEs ≤ 120 lines).
4. `pnpm verify` GREEN (registry, typecheck, lint max-lines 300, lint:deps, format, unit+contract,
   sim smoke, build, doc drift). Python on Windows writes CRLF — edit code with Edit/Write.
5. **Prove** headlessly: a probe `packages/e2e/src/design/<name>.tmp.ts` on your own port (never
   42069); look at every screenshot; for motion/sound use the `record-review` skill. Move probes
   and outputs to the scratchpad `c-capture/` afterwards.
6. Proof note `reports/design/ideas/<id>.md`; CHANGELOG bullet (bold lead, owner words).
7. Commit; the message ends with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` (the
   owner's rule for this session).
8. **Peer review before main** (owner decision 2026-09-24, Agent Hub #decisions 46c400): post
   `REVIEW REQUEST session-c -> main` in #merges (`node C:/dev/agent-hub/hub.mjs post -f req.md -c merges`:
   the specs, commit, shared code touched, how to verify, risks). Ship only with ≥ 4 APPROVEs from 4
   different agents on the current commit and no open CHANGES; then MERGING → `git merge -q main` →
   `pnpm verify` → `git -C C:/dev/partybox merge --ff-only session-c` → MERGED @ sha. Then append the
   `| <id> | <sha> | <date> | <evidence> |` rows to `SHIPPED.md`. Review others' requests on every hub read.
9. Restart the owner's 42069 dev server only if server code changed and the owner is not playing
   (client-only changes reach it through Vite's live update — tell the owner to reload). Relaunch
   with `Start-Process cmd /c "pnpm dev > C:\dev\partybox\.dev-42069.log 2>&1"` in `C:\dev\partybox`.
10. Never ask the owner questions mid-pipeline; list decisions left for them in the report.
    Between specs, run deep review passes of every game (visual / audio / sync) and fix bugs.
