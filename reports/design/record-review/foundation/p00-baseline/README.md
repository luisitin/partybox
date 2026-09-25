# Foundation p00 — baseline (main @ 38c6abcc, before any F-task)

Recorded 2026-09-24 with `capture-picker.ts --prod --build` on port 42300: production build, TV
1920×1080, VIP on iPhone 15 (393×852), guest on iPhone SE (320×568), 3 idle bots (5 players), EN,
game Wisecrack. Media (stills, strips, videos) sit beside this file and are gitignored.

## What phones download (production build, cold cache)

| Stage                | VIP phone                                                                | Notes                                                          |
| -------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------- |
| Join page load       | **1,143 KB**, 10 requests: JS 611 KB, CSS 96 KB, font 39 KB, sfx 394 KB  | JS and CSS go **uncompressed**; every file `max-age=3600`      |
| — of which audio     | `crowd-cheer.mp3` 345 KB + `party-horn.mp3` 49 KB fetched at load        | spec §2.1: audio downloads the first time it plays             |
| Every room push      | a ~16 KB socket frame (`room`), 12 of them from join to start            | the full game list with every settings spec rides in each push |
| Picker open / choose | 0 requests (all 5 games' picker text and string tables are in the entry) |                                                                |
| Start (Wisecrack)    | 18.3 KB: `Controller` JS 7.6 KB + `timing` JS 2.9 KB + CSS 8.4 KB        | a TV-named shared chunk (`timing`) rides along                 |

The TV loads the same 1,153 KB plus Wisecrack's TV chunk (21.5 KB) at start.

## Smoothness

- Frames: TV 19 over 34 ms (worst 67), VIP 23 (worst 67), guest 30 (worst 83); none over 100 ms.
- Dead air: **TV still for 5.7 s** while the VIP picks (gate: none ≥ 3 s anywhere) and 2.9 s
  while they browse; VIP phone still 4.7 s during "browse" (the touch-scroll gesture did not move
  the picker: the recorder's scroll needs a real touch sequence — fixed in the next pass).
- No hard cuts.

## Looks

- VIP phone picker: one Bingo card fills the screen — its whole 370-character description, a
  "▼" pill over the text, the Start button; the other four games are below the fold.
- Guest phone: "Sam is choosing a game…" plus five vote chips; no way to read about a game.
- TV picker: a list of five uneven rows (Lightning Round wraps to two lines) and a settings card
  with every Bingo setting; nothing moves.
