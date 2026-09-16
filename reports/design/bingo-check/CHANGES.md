# Bingo — the five owner notes (2026-09-16), what changed

Verified headlessly before sending: `capture-bingo.ts` bursts 14 consecutive frames at 300 ms through
both claim outcomes (`bingo-lands/`, `check-lands/`, stitched by `filmstrip.ts`), and
`audio-trace.ts` records every cue/clip/hush with timestamps (`../audio/AUDIO-TRACE.md`).

## 1 · "It randomly started reading out bingo calls in the lobby"

Chrome's speech queue was the culprit: `speechSynthesis` can hold an utterance for minutes and
release it later (after a tab wake, another utterance, a `resume()`), so a call spoken during play
could surface in the lobby. The caller no longer uses speech at all. All 75 calls are recorded
clips (`packages/client/public/sfx/calls/b1.wav … o75.wav`, Zira lively, "B, 12.") played through
the TV's Web Audio engine like any other cue — nothing can queue, nothing can replay. Outside play
the shell still cancels any leftover speech once, for older builds.

## 2 · "Old calls got replayed after continuing to blackout"

Same root cause (stuck utterances re-released when the next call arrived). Gone with the queue.
The trace's blackout scenario now shows exactly one `clip` per new call and none on the
continuation push itself.

## 3 · "The new-number chime feels late — I want it immediately"

The boing and the voice were fired from a `useEffect` after paint, behind the card re-render and
the speech engine's own start-up latency (typically 200–500 ms on Windows). Now a `useLayoutEffect`
fires the `call` boing the instant the play push lands and the recorded clip starts 120 ms later
(a decoded buffer, no engine warm-up). Trace: `cue:call` at +0 ms of the push, `clip` at +120 ms.

## 4 · "Phone users felt no haptics"

Two facts, one fix. iPhones have no vibration API at all (Safari never implemented
`navigator.vibrate`), so no web page can buzz an iPhone. Android phones buzz only after the page
has been tapped once (the first tap after joining counts). The phone settings sheet now shows the
vibration toggle only where the API exists and otherwise explains: "Vibration is not available in
this browser (iPhones have no vibration API)." Nothing was broken on Android: daub, claim and
lock-in call `buzz()` as before.

## 5 · "Show the claimed card on the TV in a slower, more dynamic reveal, with the sound timed right"

New `ClaimStage` choreography, same for a real bingo and a wrong claim (the room finds out with the card):

| time        | what happens                                                                                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0 ms        | "Priya says BINGO!" rises; the card flies in from the right and lands centred at 500 px (0.9 s ease-out)                                                                                         |
| 0.9 s       | the daubed cells turn one by one in the order they were called (220 ms apart, FREE first) — green for a real bingo, red for a wrong claim; the others stay dark                                  |
| +0.7 s hold | the room reads the card                                                                                                                                                                          |
| settle      | the card glides left and shrinks to 92 % (0.6 s)                                                                                                                                                 |
| +0.6 s      | the verdict pops on the right: **BINGO!** + "Sam wins round 1" + confetti and the party horn + crowd cheer (music ducks to 30 %), or **NOT A BINGO** + ✓/✗ counts + "Card wiped" with the buzzer |
| +3.2 s      | (real bingo) the VIP's decide line fades in: same pattern / blackout / next round                                                                                                                |

Cell turns use the accent → green/red colour ramp with a small scale-and-rotate pop; misses on a
wrong claim are outlined only after the verdict so nothing spoils the reveal. `check` now holds
9 s (was 5) so a full row of turns still fits before the card wipes. Reduced motion: no flight,
no turns — the card appears settled with the verdict.

Trace timing (bingo scenario): `hush` at +41 ms of the claim push (caller stops mid-word),
`cheer` + `music:duck` at the verdict beat — never before the last cell has turned.

Not changed: nothing in `games/bingo/server` beyond `CHECK_MS` and the additive `called` list
on the TV view (the reveal needs the call order).
