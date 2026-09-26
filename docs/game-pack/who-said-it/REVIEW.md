# Who Said It — review package (2026-09-24)

Branch `game/who-said-it` (not merged). Evidence under `reports/design/record-review/who-said-it/`
(media gitignored; the paths below are in the worktree `C:/dev/partybox-game-who-said-it`).

## Five lines

1. Playable end to end: 7 phases, 170 questions (120 family + 50 spicy, 14 bot answers each),
   author camouflage, merged cards, 4 awards, recap, the reader on every line.
2. Tests: 73 unit tests + the contract suite; sim 800 games (random, idle, chaos, mixed × 200,
   3–16 players) clean; 16-player state 14.6 KB (budget 20), views ≤ 2.7 KB (budget 4).
3. Recorded 23 passes (TV + phone video, stills, 10 fps strips, cue log, clip trace): the reveal is
   one continuous 3D move (the card rises, faces rise, taps fly to the faces, the author turns up
   in gold), no hard cuts and no dead spans on the TV during play; every voice line fires on its
   frame; the "pick up your phone" chime is back on write and guess.
4. Design matrix checked: 320×568 with 15 faces, 390×844, sideways, 200 % text, Spanish, all five
   themes, phone-only room, pause, reconnect; finger abuse (mash, long-press, drags past both
   ends, double tap) — no zoom, no selection, no scroll, one answer per mash.
5. Built on local stand-ins for the foundation's F5/F6 and the Imposter session's FacePicker,
   because none of them is on main yet (NOTES.md lists each, to swap when they land).

## Screens to look at

| What                                  | Where                                                                  |
| ------------------------------------- | ---------------------------------------------------------------------- |
| TV, every phase (6 players)           | `p03/stills/*-tv.png`, strips `p03/strips/*-tv/`                       |
| TV reveal at 16 players               | `p07-16se/strips/06-reveal-shown-tv/f34.png`                           |
| Phone 320×568, 15 faces               | `p07-16se/stills/04-guess-phone-acted.png`                             |
| Phone 200 % text / sideways / Spanish | `p08-font200/phones.png`, `p11-landscape/stills/`, `p10-es/phones.png` |
| Five themes (TV + phone)              | `themes.png`                                                           |
| Phone-only room                       | `p13-phoneonly/phones.png`                                             |
| Pause and reconnect                   | `scenarios.png`                                                        |
| Touch abuse                           | `p17-touch/touch.json` + screenshots                                   |
| Voice timing (clip trace)             | `p22/report.json` (`clips`), `p22/trace.json`                          |

## Fixed during review (each re-recorded)

- The reveal cut in hard over the guess card → the card now rises from where the guess left it.
- "Last chance!" and a red 1 flashed when everyone had answered → "Everyone's in!", no clock.
- Every `pb-*` animation in the CSS modules silently never ran (CSS Modules need `global(…)`).
- 16 players: the name line fell below the stage → faces-only strip in the reveal, tighter board,
  "+15 · fooled 15" moved onto the author's tile (as the spec draws it).
- Phone guess grid overflowed (5 faces on 390×844) → compact 2/3-column tiles; 4/5 columns sideways.
- A server-held answer (reload, reconnect) left the phone on an empty box → "Locked in" follows the
  server.
- Triple-tapping 💡 also picked the chip that popped in under the finger → a short guard.
- Idea chips arrived below the fold on an SE → scrolled into view.
- The phone-only reveal hid the author card below the fold → it sits under the answer now.
- Voice lines booked at a phase's start were lost (the crossfade ghost unmounted with the timers),
  and booking ahead swallowed the phase chime → a module-level scheduler hands each line over when
  due.

## Open (not blocking)

- Frame timing: 3–7 % of TV frames over 34 ms in every pass — but the machine sat at 96–100 % CPU
  (other sessions recording) and a Wisecrack control run in the same window measured 7.28 %. To
  re-measure on a quiet machine before ship.
- Manifest pack fields (icon 🗣️, howToPlay, presence `anywhere`, addedOn) wait for F2's schema.

## Questions for the owner

1. Name lines are rendered for every candidate when writing ends (not "only at that card's
   reveal"), so the flip never waits for the voice; it reveals nothing. **Recommend keeping it.**
2. The lo-fi bed runs continuously through guess → reveal (the spec lists no bed for reveal);
   a bed dropping out every five seconds sounded choppy. **Recommend keeping it.**
