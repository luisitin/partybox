# Foundation p01 — F2: catalog, About, server-side Spanish

Recorded 2026-09-24 with `capture-picker.ts --prod` on port 42300 (same set-up as p00: TV 1920×1080,
VIP iPhone 15, guest iPhone SE, 3 idle bots, Wisecrack), in English (`p01-f2-catalog/`) and Spanish
(`p01-f2-catalog-es/`). The picker UI is unchanged on purpose — F3 redesigns it; this pass proves
the new data path.

## What changed for the wire

| Moment                        | p00 (main)                      | p01                                                      |
| ----------------------------- | ------------------------------- | -------------------------------------------------------- |
| Game list                     | in every room push              | `catalog`, once per connection: 1.7 KB for 5 games       |
| A room push (lobby)           | ~16 KB                          | **1.2 KB**                                               |
| A room push, game chosen      | ~16 KB                          | 1.7 KB (Wisecrack's form) · 4.7 KB (Bingo's 12 settings) |
| Opening the picker / choosing | nothing (all text in the entry) | `about` 1.8 KB; in Spanish also `text` ≈ 1–3 KB          |
| Join page load                | 1,143 KB                        | 1,139 KB (unchanged: F1 is next)                         |

Budgets asserted in tests: every catalog entry ≤ 400 B (largest: Lightning Round 367 B), a 20-game
catalog ≤ 8 KB, every About ≤ 2 KB in English and Spanish.

## Looked at

- English and Spanish stills of every stage on all three surfaces: picker text, the TV's settings
  card (description, labels, hints) and the phone's chosen card all read from the host; Spanish
  arrives complete (`Rondas`, `Tiempo para escribir`, the description). No English left in the
  Spanish run's picker.
- Frames: none over 100 ms on any surface (worst 83 ms on the TV at load).
- Dead air is the same as p00 (the picker is unchanged; F3 is where the TV gets its motion).
