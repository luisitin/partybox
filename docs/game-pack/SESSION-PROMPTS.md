# Session prompts

One prompt per Claude Code session: the name, the repo, where to look — then the same emphasis on
testing and design in every one. Everything specific lives in the files they point to.

| Session       | Folder                                  | Worktree                             | Port  |
| ------------- | --------------------------------------- | ------------------------------------ | ----- |
| Foundation    | `docs/game-pack/parts/00-FOUNDATION.md` | `C:/dev/partybox-foundation`         | 42300 |
| Imposter      | `docs/game-pack/imposter/`              | `C:/dev/partybox-game-imposter`      | 42310 |
| Herd Mind     | `docs/game-pack/herd-mind/`             | `C:/dev/partybox-game-herd-mind`     | 42320 |
| Fake-Out      | `docs/game-pack/fake-out/`              | `C:/dev/partybox-game-fake-out`      | 42330 |
| Who Said It   | `docs/game-pack/who-said-it/`           | `C:/dev/partybox-game-who-said-it`   | 42340 |
| Tune In       | `docs/game-pack/tune-in/`               | `C:/dev/partybox-game-tune-in`       | 42350 |
| Hive Rank     | `docs/game-pack/hive-rank/`             | `C:/dev/partybox-game-hive-rank`     | 42360 |
| Echo          | `docs/game-pack/echo/`                  | `C:/dev/partybox-game-echo`          | 42370 |
| Blind Auction | `docs/game-pack/blind-auction/`         | `C:/dev/partybox-game-blind-auction` | 42380 |
| Spy Grid      | `docs/game-pack/spy-grid/`              | `C:/dev/partybox-game-spy-grid`      | 42390 |
| Nightfall     | `docs/game-pack/nightfall/`             | `C:/dev/partybox-game-nightfall`     | 42400 |

## The template

Every prompt is this, with the first line filled in:

```
<Name> — you build <Name> for PartyBox.

Repo: C:/dev/partybox. Your worktree: <worktree> (branch <branch>). Your test port: <port>.

Where to look:
- Your game: docs/game-pack/<id>/SPEC.md
- How to work: docs/game-pack/SESSION-PLAYBOOK.md (read it first)
- The platform: docs/game-pack/parts/00-FOUNDATION.md and docs/game-pack/FOUNDATION-AUDIT.md
- How to build and prove a game: .claude/skills/game-pack-build and .claude/skills/record-review

What matters most — every single pass:
- Test by watching, not just by passing. Record the real game (TV and phones, video and sound), look at every frame strip and still, and run the dead-air and frame-timing checks. Re-record after every change, however small.
- Design first. Every screen on one page, centred, aligned, nothing clipped, overlapping, off-centre or out of place — on a small iPhone, a big phone, sideways, at 200 % text, in Spanish and on the TV.
- Hands on the phone. Drag fingers around, scroll past the ends, long-press, mash buttons, pinch, rotate, tap during animations — nothing may jump, zoom, select, double-send or leave artifacts behind.
- Smooth and alive. No choppiness, no dead air, transitions that feel 3D and polished, sounds and voice landing on their frames.
- Never hand the owner something to test. Find it, fix it, re-record, confirm — then show them.
```

---

## Foundation

```
Foundation — you build the platform for PartyBox's new game pack (the game picker, download-on-pick, presence, the matcher, voices).

Repo: C:/dev/partybox. Your worktree: C:/dev/partybox-foundation (branch foundation). Your test port: 42300.

Where to look:
- Your spec: docs/game-pack/parts/00-FOUNDATION.md
- What to fix first and the owner's open questions: docs/game-pack/FOUNDATION-AUDIT.md
- How to work: docs/game-pack/SESSION-PLAYBOOK.md (read it first)
- How to prove it: .claude/skills/record-review

What matters most — every single pass:
- Test by watching, not just by passing. Record the real lobby and picker (TV and phones, video and sound), look at every frame strip and still, and run the dead-air and frame-timing checks. Measure what phones download before and after. Re-record after every change, however small.
- Design first. Every screen on one page, centred, aligned, nothing clipped, overlapping, off-centre or out of place — on a small iPhone, a big phone, sideways, at 200 % text, in Spanish and on the TV.
- Hands on the phone. Drag fingers around, scroll past the ends, long-press, mash buttons, pinch, rotate, tap during animations — nothing may jump, zoom, select, double-send or leave artifacts behind.
- Smooth and alive. No choppiness, no dead air, transitions that feel polished.
- Never hand the owner something to test. Find it, fix it, re-record, confirm — then show them.
```

## Imposter

```
Imposter — you build Imposter for PartyBox.

Repo: C:/dev/partybox. Your worktree: C:/dev/partybox-game-imposter (branch game/imposter). Your test port: 42310.

Where to look:
- Your game: docs/game-pack/imposter/SPEC.md
- How to work: docs/game-pack/SESSION-PLAYBOOK.md (read it first)
- The platform: docs/game-pack/parts/00-FOUNDATION.md and docs/game-pack/FOUNDATION-AUDIT.md
- How to build and prove a game: .claude/skills/game-pack-build and .claude/skills/record-review

What matters most — every single pass:
- Test by watching, not just by passing. Record the real game (TV and phones, video and sound), look at every frame strip and still, and run the dead-air and frame-timing checks. Re-record after every change, however small.
- Design first. Every screen on one page, centred, aligned, nothing clipped, overlapping, off-centre or out of place — on a small iPhone, a big phone, sideways, at 200 % text, in Spanish and on the TV.
- Hands on the phone. Drag fingers around, scroll past the ends, long-press, mash buttons, pinch, rotate, tap during animations — nothing may jump, zoom, select, double-send or leave artifacts behind.
- Smooth and alive. No choppiness, no dead air, transitions that feel 3D and polished, sounds and voice landing on their frames.
- Never hand the owner something to test. Find it, fix it, re-record, confirm — then show them.
```

## Herd Mind

```
Herd Mind — you build Herd Mind for PartyBox.

Repo: C:/dev/partybox. Your worktree: C:/dev/partybox-game-herd-mind (branch game/herd-mind). Your test port: 42320.

Where to look:
- Your game: docs/game-pack/herd-mind/SPEC.md
- How to work: docs/game-pack/SESSION-PLAYBOOK.md (read it first)
- The platform: docs/game-pack/parts/00-FOUNDATION.md and docs/game-pack/FOUNDATION-AUDIT.md
- How to build and prove a game: .claude/skills/game-pack-build and .claude/skills/record-review

What matters most — every single pass:
- Test by watching, not just by passing. Record the real game (TV and phones, video and sound), look at every frame strip and still, and run the dead-air and frame-timing checks. Re-record after every change, however small.
- Design first. Every screen on one page, centred, aligned, nothing clipped, overlapping, off-centre or out of place — on a small iPhone, a big phone, sideways, at 200 % text, in Spanish and on the TV.
- Hands on the phone. Drag fingers around, scroll past the ends, long-press, mash buttons, pinch, rotate, tap during animations — nothing may jump, zoom, select, double-send or leave artifacts behind.
- Smooth and alive. No choppiness, no dead air, transitions that feel 3D and polished, sounds and voice landing on their frames.
- Never hand the owner something to test. Find it, fix it, re-record, confirm — then show them.
```

## Fake-Out

```
Fake-Out — you build Fake-Out for PartyBox.

Repo: C:/dev/partybox. Your worktree: C:/dev/partybox-game-fake-out (branch game/fake-out). Your test port: 42330.

Where to look:
- Your game: docs/game-pack/fake-out/SPEC.md
- How to work: docs/game-pack/SESSION-PLAYBOOK.md (read it first)
- The platform: docs/game-pack/parts/00-FOUNDATION.md and docs/game-pack/FOUNDATION-AUDIT.md
- How to build and prove a game: .claude/skills/game-pack-build and .claude/skills/record-review

What matters most — every single pass:
- Test by watching, not just by passing. Record the real game (TV and phones, video and sound), look at every frame strip and still, and run the dead-air and frame-timing checks. Re-record after every change, however small.
- Design first. Every screen on one page, centred, aligned, nothing clipped, overlapping, off-centre or out of place — on a small iPhone, a big phone, sideways, at 200 % text, in Spanish and on the TV.
- Hands on the phone. Drag fingers around, scroll past the ends, long-press, mash buttons, pinch, rotate, tap during animations — nothing may jump, zoom, select, double-send or leave artifacts behind.
- Smooth and alive. No choppiness, no dead air, transitions that feel 3D and polished, sounds and voice landing on their frames.
- Never hand the owner something to test. Find it, fix it, re-record, confirm — then show them.
```

## Who Said It

```
Who Said It — you build Who Said It for PartyBox.

Repo: C:/dev/partybox. Your worktree: C:/dev/partybox-game-who-said-it (branch game/who-said-it). Your test port: 42340.

Where to look:
- Your game: docs/game-pack/who-said-it/SPEC.md
- How to work: docs/game-pack/SESSION-PLAYBOOK.md (read it first)
- The platform: docs/game-pack/parts/00-FOUNDATION.md and docs/game-pack/FOUNDATION-AUDIT.md
- How to build and prove a game: .claude/skills/game-pack-build and .claude/skills/record-review

What matters most — every single pass:
- Test by watching, not just by passing. Record the real game (TV and phones, video and sound), look at every frame strip and still, and run the dead-air and frame-timing checks. Re-record after every change, however small.
- Design first. Every screen on one page, centred, aligned, nothing clipped, overlapping, off-centre or out of place — on a small iPhone, a big phone, sideways, at 200 % text, in Spanish and on the TV.
- Hands on the phone. Drag fingers around, scroll past the ends, long-press, mash buttons, pinch, rotate, tap during animations — nothing may jump, zoom, select, double-send or leave artifacts behind.
- Smooth and alive. No choppiness, no dead air, transitions that feel 3D and polished, sounds and voice landing on their frames.
- Never hand the owner something to test. Find it, fix it, re-record, confirm — then show them.
```

## Tune In

```
Tune In — you build Tune In for PartyBox.

Repo: C:/dev/partybox. Your worktree: C:/dev/partybox-game-tune-in (branch game/tune-in). Your test port: 42350.

Where to look:
- Your game: docs/game-pack/tune-in/SPEC.md
- How to work: docs/game-pack/SESSION-PLAYBOOK.md (read it first)
- The platform: docs/game-pack/parts/00-FOUNDATION.md and docs/game-pack/FOUNDATION-AUDIT.md
- How to build and prove a game: .claude/skills/game-pack-build and .claude/skills/record-review

What matters most — every single pass:
- Test by watching, not just by passing. Record the real game (TV and phones, video and sound), look at every frame strip and still, and run the dead-air and frame-timing checks. Re-record after every change, however small.
- Design first. Every screen on one page, centred, aligned, nothing clipped, overlapping, off-centre or out of place — on a small iPhone, a big phone, sideways, at 200 % text, in Spanish and on the TV.
- Hands on the phone. Drag fingers around, scroll past the ends, long-press, mash buttons, pinch, rotate, tap during animations — nothing may jump, zoom, select, double-send or leave artifacts behind.
- Smooth and alive. No choppiness, no dead air, transitions that feel 3D and polished, sounds and voice landing on their frames.
- Never hand the owner something to test. Find it, fix it, re-record, confirm — then show them.
```

## Hive Rank

```
Hive Rank — you build Hive Rank for PartyBox.

Repo: C:/dev/partybox. Your worktree: C:/dev/partybox-game-hive-rank (branch game/hive-rank). Your test port: 42360.

Where to look:
- Your game: docs/game-pack/hive-rank/SPEC.md
- How to work: docs/game-pack/SESSION-PLAYBOOK.md (read it first)
- The platform: docs/game-pack/parts/00-FOUNDATION.md and docs/game-pack/FOUNDATION-AUDIT.md
- How to build and prove a game: .claude/skills/game-pack-build and .claude/skills/record-review

What matters most — every single pass:
- Test by watching, not just by passing. Record the real game (TV and phones, video and sound), look at every frame strip and still, and run the dead-air and frame-timing checks. Re-record after every change, however small.
- Design first. Every screen on one page, centred, aligned, nothing clipped, overlapping, off-centre or out of place — on a small iPhone, a big phone, sideways, at 200 % text, in Spanish and on the TV.
- Hands on the phone. Drag fingers around, scroll past the ends, long-press, mash buttons, pinch, rotate, tap during animations — nothing may jump, zoom, select, double-send or leave artifacts behind.
- Smooth and alive. No choppiness, no dead air, transitions that feel 3D and polished, sounds and voice landing on their frames.
- Never hand the owner something to test. Find it, fix it, re-record, confirm — then show them.
```

## Echo

```
Echo — you build Echo for PartyBox.

Repo: C:/dev/partybox. Your worktree: C:/dev/partybox-game-echo (branch game/echo). Your test port: 42370.

Where to look:
- Your game: docs/game-pack/echo/SPEC.md
- How to work: docs/game-pack/SESSION-PLAYBOOK.md (read it first)
- The platform: docs/game-pack/parts/00-FOUNDATION.md and docs/game-pack/FOUNDATION-AUDIT.md
- How to build and prove a game: .claude/skills/game-pack-build and .claude/skills/record-review

What matters most — every single pass:
- Test by watching, not just by passing. Record the real game (TV and phones, video and sound), look at every frame strip and still, and run the dead-air and frame-timing checks. Re-record after every change, however small.
- Design first. Every screen on one page, centred, aligned, nothing clipped, overlapping, off-centre or out of place — on a small iPhone, a big phone, sideways, at 200 % text, in Spanish and on the TV.
- Hands on the phone. Drag fingers around, scroll past the ends, long-press, mash buttons, pinch, rotate, tap during animations — nothing may jump, zoom, select, double-send or leave artifacts behind.
- Smooth and alive. No choppiness, no dead air, transitions that feel 3D and polished, sounds and voice landing on their frames.
- Never hand the owner something to test. Find it, fix it, re-record, confirm — then show them.
```

## Blind Auction

```
Blind Auction — you build Blind Auction for PartyBox.

Repo: C:/dev/partybox. Your worktree: C:/dev/partybox-game-blind-auction (branch game/blind-auction). Your test port: 42380.

Where to look:
- Your game: docs/game-pack/blind-auction/SPEC.md
- How to work: docs/game-pack/SESSION-PLAYBOOK.md (read it first)
- The platform: docs/game-pack/parts/00-FOUNDATION.md and docs/game-pack/FOUNDATION-AUDIT.md
- How to build and prove a game: .claude/skills/game-pack-build and .claude/skills/record-review

What matters most — every single pass:
- Test by watching, not just by passing. Record the real game (TV and phones, video and sound), look at every frame strip and still, and run the dead-air and frame-timing checks. Re-record after every change, however small.
- Design first. Every screen on one page, centred, aligned, nothing clipped, overlapping, off-centre or out of place — on a small iPhone, a big phone, sideways, at 200 % text, in Spanish and on the TV.
- Hands on the phone. Drag fingers around, scroll past the ends, long-press, mash buttons, pinch, rotate, tap during animations — nothing may jump, zoom, select, double-send or leave artifacts behind.
- Smooth and alive. No choppiness, no dead air, transitions that feel 3D and polished, sounds and voice landing on their frames.
- Never hand the owner something to test. Find it, fix it, re-record, confirm — then show them.
```

## Spy Grid

```
Spy Grid — you build Spy Grid for PartyBox.

Repo: C:/dev/partybox. Your worktree: C:/dev/partybox-game-spy-grid (branch game/spy-grid). Your test port: 42390.

Where to look:
- Your game: docs/game-pack/spy-grid/SPEC.md
- How to work: docs/game-pack/SESSION-PLAYBOOK.md (read it first)
- The platform: docs/game-pack/parts/00-FOUNDATION.md and docs/game-pack/FOUNDATION-AUDIT.md
- How to build and prove a game: .claude/skills/game-pack-build and .claude/skills/record-review

What matters most — every single pass:
- Test by watching, not just by passing. Record the real game (TV and phones, video and sound), look at every frame strip and still, and run the dead-air and frame-timing checks. Re-record after every change, however small.
- Design first. Every screen on one page, centred, aligned, nothing clipped, overlapping, off-centre or out of place — on a small iPhone, a big phone, sideways, at 200 % text, in Spanish and on the TV.
- Hands on the phone. Drag fingers around, scroll past the ends, long-press, mash buttons, pinch, rotate, tap during animations — nothing may jump, zoom, select, double-send or leave artifacts behind.
- Smooth and alive. No choppiness, no dead air, transitions that feel 3D and polished, sounds and voice landing on their frames.
- Never hand the owner something to test. Find it, fix it, re-record, confirm — then show them.
```

## Nightfall

```
Nightfall — you build Nightfall for PartyBox.

Repo: C:/dev/partybox. Your worktree: C:/dev/partybox-game-nightfall (branch game/nightfall). Your test port: 42400.

Where to look:
- Your game: docs/game-pack/nightfall/SPEC.md
- How to work: docs/game-pack/SESSION-PLAYBOOK.md (read it first)
- The platform: docs/game-pack/parts/00-FOUNDATION.md and docs/game-pack/FOUNDATION-AUDIT.md
- How to build and prove a game: .claude/skills/game-pack-build and .claude/skills/record-review

What matters most — every single pass:
- Test by watching, not just by passing. Record the real game (TV and phones, video and sound), look at every frame strip and still, and run the dead-air and frame-timing checks. Re-record after every change, however small.
- Design first. Every screen on one page, centred, aligned, nothing clipped, overlapping, off-centre or out of place — on a small iPhone, a big phone, sideways, at 200 % text, in Spanish and on the TV.
- Hands on the phone. Drag fingers around, scroll past the ends, long-press, mash buttons, pinch, rotate, tap during animations — nothing may jump, zoom, select, double-send or leave artifacts behind.
- Smooth and alive. No choppiness, no dead air, transitions that feel 3D and polished, sounds and voice landing on their frames.
- Never hand the owner something to test. Find it, fix it, re-record, confirm — then show them.
```
