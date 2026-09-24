---
name: record-review
description: Exhaustively record a PartyBox game (TV + phones, video + audio cues) and review it until nothing is choppy, dead, clipped, out of sync or wrong — then re-record after every change. Use for every new or changed game, and for the idle-time polish passes.
---

# record-review

The owner's bar (2026-09-24): **well oiled, smooth and beautiful — no choppiness, no deadness**, 3D
visuals and transitions, the voice and cues landing with the picture. A green `pnpm verify` is not
that (feedback memory "green is not smooth"). This skill is the proof loop. Never ask the owner to
be the tester: record, look, fix, re-record.

## 1. Record (real clock, real audio engine)

- Whole game, every phase, at least: 3 players, 6 players, the game's max; one player drops and
  comes back mid-phase; a late joiner; everyone idle until deadlines; a tie; a VIP skip in every
  phase; spicy on (if the game has it); phone-only room; a remote phone (`canSeeTv = false`) once
  presence exists; Spanish once.
- Surfaces: TV 1920×1080 + at least two phones (the active player and a waiting one) at 390×844,
  plus 320×568 (iPhone SE) and a sideways phone for the input phases.
- Tools (all in `packages/e2e/src/design/`, harness on YOUR OWN port — never 42069):
  - `capture-loop.ts` — one round on a real clock: video of TV + phone, stills at every phase
    change, frame strips at transitions and timer ends, `cues.json` (every sound cue with phase),
    `timeline.json`, `frame-timing.json` (rAF frames longer than 34 ms).
  - The ideas capture scripts (`C:/dev/partybox-ideas/capture/<game>.ts`, copy to
    `cap_<game>.tmp.ts` with imports rewritten to `./` so they record THIS worktree) + `cut.py`
    for per-moment clips and frame folders.
  - `audio-trace.ts` / `audio-scenarios-*.ts` — which cue, clip, bed and music track played when.
  - `filmstrip.ts` — a burst of frames stitched into one image, to read a transition frame by frame.
  - `dead-air.ts` — see §2.

## 2. Measure (numbers first, then eyes)

Run on every recorded video (TV and each phone):

```
pnpm exec tsx packages/e2e/src/design/dead-air.ts --video <surface.webm> \
  --marks <marks.json> --surface tv|vip|p2 [--cues cues.json] --out dead-air-<surface>.json
```

It reports **dead spans** (no pixel of a 128-wide copy moves for ≥ 1.5 s) with the phase/mark
they fell in and whether a sound cue played, and **hard cuts** (≥ 22 % of the picture changes in
one 100 ms sample: a jump instead of a transition). Gates for a pack game:

| Check                             | Gate                                                                                                                                                                                                           |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dead span on the TV               | none ≥ 1.5 s outside an input phase with a visible clock; none ≥ 3 s anywhere                                                                                                                                  |
| Dead span on a phone              | none ≥ 3 s unless the phone is deliberately "👀 Watch the TV"                                                                                                                                                  |
| Hard cut                          | only where a phase change is meant to snap (and then with a sound); none mid-phase                                                                                                                             |
| Long frames (`frame-timing.json`) | none over 100 ms; under 1 % over 34 ms on the TV                                                                                                                                                               |
| Sound                             | every `phase` cue within 150 ms of the phase change; every reveal/tally cue on its frame; the reader's clip starts on the frame its text lands; music never restarts on a phase change unless the game says so |

## 3. Look (every still, every strip, every clip)

For each phase and surface, check and write down: clipped or overflowing text (also at 200 % text
and in Spanish), overlaps (toasts, host bar, footer, ▾ pill), anything shown by colour alone,
targets under 44 px, English left in a Spanish run, a secret visible on the wrong phone, the phone
spoiling what the TV has not revealed yet, a transition that stutters or snaps, motion that ignores
reduced-motion, a screen with nothing to do and nothing moving, a cue that is late, doubled or
missing, the reader cut off or talking over another clip.

## 4. Fix → re-record → re-measure

Fix the worst first. After ANY visual, motion, timing or sound change, re-record the affected
scenarios and re-run §2 and §3 on them — before/after side by side. The pass is done only when
every gate in §2 holds and §3 finds nothing. Keep the evidence (JSON reports, stills, strips,
clips) under `reports/design/record-review/<game>/<pass>/` (media gitignored) and summarise the
pass in its `README.md` (what was recorded, numbers, what was fixed, before/after paths).

## 5. Rules

- One harness port per session; stop every server you start (`server.stop()` in `finally`).
- Never kill `chrome-headless-shell` wholesale — other sessions use it; kill only your orphans.
- Probes go in `packages/e2e/src/design/*.tmp.ts` and move to the scratchpad afterwards.
- iOS ignores `HTMLMediaElement.volume`; headless Chromium does not — check music levels via
  `window.__pbMusic.level()`, never the element's volume.
