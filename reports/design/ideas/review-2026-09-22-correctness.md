# Correctness pass, 2026-09-22 (the owner: "making sure things are correct is most important")

With the spec queue empty, a sweep of the whole product rather than one feature: every game driven
through every phase in a real browser, TV and phones, normal and phone-only; then a read of the
day's own code. Fourteen problems found and fixed; each fix is proven below.

## The sweeps (scratchpad `c-capture/`)

- `sweep.ts` — all five games × {TV, phone-only}, 40 s each with bots and two humans tapping at
  random: **0** page errors, console errors, failed requests or crash screens across 10 runs.
- `sweep_end.ts` — every game driven to its results with VIP skips, both modes: all reach results
  (Bingo separately — a skip in `play` calls the next number, so it needs ~40 per round). The one
  console error it caught was React complaining that a hook's deps changed length mid-run — my own
  mid-sweep edit being hot-swapped into an open page; a clean re-run shows **0**.
- `sweep_tv.ts` — phone-only, every phase, the phones answering/voting/tapping, scanning every
  phone's visible text for "TV": it found the bugs in §5, and after the fix finds **0**.

## 1. The join funnel over-counted "opened" (I-077)

The phone flag was read off the DOM (`[data-surface="controller"]`), so any phone screen that
fetched `/api/info` counted — the VIP's game picker (a phone already in the room), and every
60-second refresh. Now only the join page asks to be counted, once per page load.

```
                          before   after
Sam opens the join page      –       1
Sam reloads it               –       2
VIP opens the game picker    6       2     ← the picker no longer counts
Priya opens the join page    8       3     ← three real page loads
six more seconds of TV       8       3
```

## 2. The room reaper could pull a TV out of its room (ADR-043)

An empty phone-made room idle for 10 minutes is reaped when someone opens another — including one
a TV had open on `/tv?room=CODE` waiting for players, which would silently switch that TV to the
house room. It also measured idleness with `Date.now()` against the room clock's `createdAt`. Now it
spares any room a TV is watching and uses the room clock.

```
open WTCH, QUET; a TV sits on WTCH; 11 min pass; open NEWR
rooms after the reap : QFQZ, WTCH, NEWR      ← QUET reaped, WTCH kept
TV still shows WTCH  : true
the TV leaves; 11 more minutes; any POST → rooms: QFQZ   ← both idle rooms go
```

Unit tests: `packages/server/src/rooms.test.ts` (chosen / taken / invalid codes, fresh codes,
`drop` never takes the house room or a room with people in it).

## 3. The Postage stamp told players only the top-left corner counts (I-093)

While cards are dealt the phone outlines the pattern on the card — for the stamp, the icon's one
example block. "Any line" was already special-cased for exactly this reason; the stamp was not, and
its demo only ever lit the top-left block. `isAnyOf(pattern)` (more than one completion) now drives
both: no outline for an "any" pattern, and the demo plays all four corner blocks.

```
stamp round  → outlined cells on the card: 0      (was the top-left four)
frame round  → outlined cells on the card: 16     (a fixed shape keeps its outline)
```

Tests: `games/bingo/__tests__/pattern-demo.test.ts` (+3).

## 4. The taken-face badges ignored the room being joined (I-083)

They always read the first room in `/api/info`. They now follow the code typed or the room tapped
in the list, while the default face stays keyed on the first room so it never changes under a
thumb mid-typing.

```
no code typed   → badged ["owl"]    default face: panda
PQRS typed      → badged ["koala"]  default face: panda
PQRS tapped     → badged ["koala"]
```

## 5. Phone-only rooms still sent players to a TV (S-005, the owner's standing complaint)

`sweep_tv.ts` found them; a grep found the rest. The SDK's own controls carried TV lines as
**defaults** ("✓ Locked in — look at the TV", "✓ Vote in — look at the TV", "Waiting for the others —
look at the TV", "✗ Didn't reach the TV") and could not know the room had no TV — used by Blanks'
judge vote, Broken Pencil's guess and Wisecrack's answers and votes. The shell's results screen said
"the books on the TV are the result"; Bingo said "Checking on the TV…", "Look at the TV", "Card 2 is
on the TV", "They are on the TV board" and "And the winner is… look at the TV"; Wisecrack's reveal
hints were gated on the reveal data arriving, not on the room.

Fix: `PhoneOnlyProvider` / `usePhoneOnly()` in the SDK (`controller/phoneOnly.tsx`), provided by the
shell for every game on a phone, with `SDK_LINES` for both rooms; the shell and game strings follow
`phoneOnly`. A phone-only Bingo final now names the winner itself ("And the winner is… Sam!"), and a
reconnecting phone lists the numbers it missed instead of pointing at a board that does not exist.

Tests: `packages/client/src/phone-only-lines.test.tsx` renders the three controls in both rooms.

## 6. No test ever got the 20-second timeout (test infrastructure)

`vitest.config.ts` sets `testTimeout: 20_000` "for all projects" — but inline projects only inherit
root options with `extends: true`, so every test ran on Vitest's default **5 s**. Bingo's
"terminates with bots" contract simulations take ~2–4 s alone and timed out whenever the machine was
busy (another session recording clips), turning `pnpm verify` RED for everyone. Proven both ways
with a throwaway 6-second test: without the fix "Test timed out in 5000ms"; with it, it passes. The
same working tree passed the Bingo contract suite twice (11.7 s, 10.2 s) — it was load, not code.

## 7. Opening rooms had no rate limit (ADR-043)

Through the tunnel `POST /api/rooms` is on the internet, and one visitor could keep all twelve room
slots full. It now allows a burst of three rooms per client address (the tunnel's
`cf-connecting-ip` when present, since every tunnelled request arrives from the local cloudflared),
then one per 20 s — and only a room actually opened is charged, so a mistyped or taken code costs
nothing. The route moved to `packages/server/src/rooms-route.ts` (app.ts was over its line cap).

Tests: `packages/server/src/rooms-route.test.ts` — chosen and fresh codes; 409/400 without charging
the address; the fourth room from one address is 429 `slow_down` while another address still gets
one; never more than twelve rooms.

## 8. "⚠ No game is running." over the results screen

The Bingo run to the end left that warning above Sam's results: a daub that raced the game's end
reached the server just after it finished, the server rightly refused it (`not_playing`), and the
phone showed the refusal as news on the results screen. The phone now drops `not_playing` the way it
already dropped `rate_limited` — it is about to show the results anyway. (Also the VIP's Pause or
Skip landing a moment after the end.)

## 9. Two messages at once on a reconnect

The link banner (above, and `flapFree.ts`) now ends with "✓ Back online" — but `controller.ts` still
popped a "Back online" toast on every reconnect: one toast per flap on a weak link, and, for 2.5 s,
"Back online" in a toast while the banner was deliberately still saying "Reconnecting…". The toast
existed because the banner used to vanish silently (review-loop #33); it no longer does, so the
toast is gone.

## 10. The join screen's other languages missed the room parts

The ROOM CODE field (label and placeholder) was never in I-076's tables, and this morning's room
picker was English-only — a Spanish join screen said "ROOM CODE · 4 letters from the TV · Rooms open
now · ＋ Open a new room". `roomStrings(lang)` covers the field and the picker in the five languages.

## 11. A Wi-Fi-only link, shared as if it worked anywhere

PartyBox's own share chooser appears exactly where the phone has no system sheet: the plain-http
LAN address — so the link it shares is a 192.168… link that only works on the same Wi-Fi. It now
says so under the link, and how to share with someone elsewhere (the https tunnel address).

## 12. Broken Pencil was silent on phones in a phone-only room — and muting a phone did not mute its music

The audio sweep (scratchpad `c-capture/audio.ts`) counts every sound a phone starts — Web Audio
cues and sample buffers, and `<audio>` plays — phase by phase. In phone-only mode it found Broken
Pencil made **2 sounds in a whole game** (Blanks 914, Wisecrack 538, Lightning Round 440, Bingo 284).
The cause: on a phone the game's music plan played only with the phone's own music switch or the
room's "music on phones" — not in a phone-only room — while the synthesized beds did follow phone
only. A game with music but no beds and no caller went silent. The music now follows the same rule
as the beds (there is no TV to play it).

Checking that exposed an older gap: the phone's **Sound** switch muted only the cue engine, never
the music or the beds — so a player who switched sound off in a phone-only room still got the beds.
The sound engine now announces mute changes (`onMuteChange`) and the phone's music and beds follow.

```
drawing, sound on   hep-cats.mp3        playing  muted=false  t=3.6 s
after Sound off     hep-cats.mp3        playing  muted=true
after Sound on      hep-cats.mp3        playing  muted=false
reloaded + a tap    backbay-lounge.mp3  playing  muted=true    ← the remembered mute applies at start
```

(The word-choosing phase stays quiet by design: Broken Pencil's plan plays only while people draw,
pass and guess, and never over the show.) Test: `sound.revive.test.ts` (+1, the subscription).

## 13. A reloaded phone logged an error on every push until it was touched

The resume sweep (below) found one kind of noise, 180 times: after a reload the phone called
`navigator.vibrate` before the person had tapped, and Chrome blocks that and logs "Blocked call to
navigator.vibrate…" on every call — enough to bury a real error in the console. `buzz()` now asks
`navigator.userActivation.hasBeenActive` first where the browser can say (the vibration would have
been dropped anyway). Lightning Round's resume run: 29 findings → **0**. Test: `haptics.test.ts`.

## 14. A name that renders as nothing

Names were already stripped of control, zero-width and bidi characters — but not of the characters
that _draw_ nothing: Hangul fillers (ㅤ U+3164 and relatives), the braille blank (⠀ U+2800), the
Mongolian vowel separator and the combining grapheme joiner. A player could join as a blank chip.
They are stripped now, and the join form uses the server's own rule, so it never offers an enabled
Join button for a name the server will refuse.

```
"ㅤㅤㅤ"  → "Enter a name to join" (disabled)   in the room: []
"⠀⠀"     → "Enter a name to join" (disabled)   in the room: []
"Samㅤ"  → "Join"                               in the room: ["Sam"]
```

Tests: `ids.test.ts` (+2).

## Resume sweep (scratchpad `c-capture/resume.ts`)

Every game, both modes: a phone reloads at every phase (what a locked or backgrounded phone does),
the TV reloads once mid-game, and a new phone joins mid-game. Every reload landed back in the game,
the TV resumed, and the latecomer sees "Waiting for the next game" — no crash anywhere. The only
finding was the vibrate noise (§13).

## Layout sweep (scratchpad `c-capture/layout.ts`)

Every phase of every game, the TV at 1280×720 and phones at 320 px and at 200 % text, both modes,
with long names and long typed answers: the page scrolling sideways, anything past the right edge,
and text cut off by a box that does not ellipsize. The checker was first shown to catch all three on
a deliberately broken page (and to ignore an ellipsis and a real scroller). Result: **0** — the only
hits were `pb-visually-hidden` screen-reader text, which is clipped to 1 px on purpose.

## Accessibility sweep (scratchpad `c-capture/a11y.ts`)

Every visible button, link, input, radio and `role=img`, on the join screen, the lobby and every
phase of every game — TV and phones, normal and phone-only — checked for an accessible name (text,
`aria-label`, `title`, `aria-labelledby`, a `<label>`): **0** without one.

## Verify

`pnpm verify` GREEN (under heavy load: 363.8 s).
