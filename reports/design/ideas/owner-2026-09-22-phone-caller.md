# Owner, 2026-09-22 — "in phone only mode I don't hear the caller"

## What I could and could not reproduce

Headlessly, the phone-only path is intact: with `phoneOnly` on and no TV, the phone fetches the
call clips and starts them (scratchpad `c-capture/probe_caller.ts`):

```
room phoneOnly     : true
call clips fetched : 2  (g55.wav, g50.wav)
buffer sources     : 2        ← started
starts / stops     : [7052, 13067]  []      ← nothing hushed them
ctx state at start : ["running", "running"]
```

So the wiring (`useCallFeel(view, view.phoneOnly ? sound : null)` → `speakCall` → the shell's
`clip`) is fine on a browser whose AudioContext is running. That points at the phone itself, and
there are two ways a real iPhone silences exactly this and nothing else obvious.

## Fix 1 — a parked AudioContext is revived

iOS Safari puts the AudioContext into `suspended` / `interrupted` whenever the phone locks, goes to
another app or takes a call. `enable()` already handled that state — but it was only ever called
from the join gesture and the 🎨 sheet, so a phone that was locked mid-round never came back, and
in a phone-only room the caller is the sound you notice first.

`packages/client/src/sound.ts` now revives the context on anything that proves the person is back:
`visibilitychange` → visible, `pointerdown`, `touchend` (throttled to one resume per 500 ms), and a
clip asked for while the context is parked revives it instead of dropping out.

## Fix 2 — a clip that will not decode still speaks

`decodeAudioData` failures (and failed fetches) returned `null` and the call was silently skipped.
A recorded call is worth a fallback, so it now plays through an `<audio>` element, which needs no
AudioContext at all. It hushes with the rest (`hushClips`), so a cut-off call never talks over the
next one.

## Proof

`packages/client/src/sound.revive.test.ts` — 3 tests, all green:

- the page becoming visible again resumes an `interrupted` context (exactly one resume);
- three taps in a burst resume it once, not three times;
- a clip whose fetch fails is played through `<audio>` with the right src.

`pnpm verify` GREEN (119.9 s).

## If it is still silent on the owner's phone

Two things that are not bugs and that this cannot fix: the iPhone's **ring/silent switch** mutes
WebAudio for a page that has no `<audio>` element playing (the new fallback does have one), and the
phone's own **Sound** switch in the 🎨 sheet.
