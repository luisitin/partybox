# Foundation p03 — F3: the game picker (list, About, TV grid and spotlight)

Recorded 2026-09-24 with `capture-picker.ts --prod` on port 42300 (TV 1920×1080, VIP iPhone 15,
guest iPhone SE, 3 idle bots, Wisecrack), again with the pack's nine demo games in the catalog
(`--demo`, 14 games: `../p03-f3-picker-14/`), the touch probe (`probe-picker-touch.ts`,
`../p03-touch/`) and a design sweep (`sweep-picker.ts`: every picker screen on iPhone SE, iPhone
15, 200 % text and sideways, English and Spanish, five themes on the SE and the TV, each still
fit-audited: `../p03-sweep-{en,en2,es}/`, montages `M-*.png` / `T-*.png`). Media gitignored.

## What phones download (production build, brotli, cold cache)

| Stage            | p02 (F1)   | p03                                                              |
| ---------------- | ---------- | ---------------------------------------------------------------- |
| Join page        | 177 KB     | 187 KB (the picker's rows, chips and About: +4.7 KB gzip JS/CSS) |
| Open the picker  | 0          | **0** (the list is the catalog the phone already has)            |
| Open About       | —          | 1.1 KB (its words, from the host, in the phone's language)       |
| Choose Wisecrack | 13.4 KB    | 12.3 KB VIP / 13.4 KB guest                                      |
| Every room push  | 1.2–1.8 KB | 1.2–1.8 KB                                                       |

## Motion and dead air (record-review gates: TV < 1.5 s outside a clocked input, phone < 3 s)

| Surface | p00 (main) longest dead span | p03 (5 games) | p03 (14 games) |
| ------- | ---------------------------- | ------------- | -------------- |
| TV      | 5.7 s (the old picker)       | 1.6 s         | 2.0 s          |
| VIP     | 4.7 s                        | 2.4 s         | 1.9 s          |
| Guest   | 0                            | **3.9 s**     | 2.1 s          |

The TV is alive through its spotlight: with nobody reading it turns through the games, lighting
each game's three steps in turn (1.8 s a step); when the VIP opens About it jumps to that game.
The guest's 3.9 s (the read-only list while the VIP browses) and 3.6 s (the chosen screen) fail
the phone gate: fixed in p04 (the guest's title says "Sam is choosing a game…" with the TV's
thinking dots; the guest's steps light in turn like the TV's).

## Hands on the phone (`probe-picker-touch.ts`, iPhone SE): 16 / 16

Long-press a row (peeks About, chooses nothing, selects no text), long-press the title, pinch,
drag sideways, drag the chips, overscroll both ends, double-tap ⓘ (one sheet), drag the sheet up
(it stays seated), a short drag back, rotate with the sheet open, swipe to close, tap the backdrop
while the sheet rises (closes, no ghost), triple-tap a row (chosen once), mash Start (one game).

## Design sweep: found and fixed

- **iPhone SE (320 px): two games in view.** A name at h2 size wrapped ("Blind / Auction") and a
  row grew to ~110 px. Under 360 px names are body size: one line, three games in view.
- **200 % text: "Elegir / un / juego".** The player pill squeezed the title to a word a line; the
  title now keeps its words and the pill drops under it only when both do not fit.
- **Sideways: one and a half games in view.** From 560 px the list is two columns (four games).
  The first try (`1fr 1fr`) let a one-line tagline widen the whole page — About's ✕ went off
  screen; `minmax(0, 1fr)` fixed it, and the fit audit now fails any page wider than the screen.
- **About at 200 % text:** the step numbers stayed 28 px beside 36 px text (read as superscripts);
  they scale with the text now.
- **TV spotlight in Spanish:** the longest steps pushed the players · minutes line out of the card.
  That line now sits under the name; the tagline is held to two lines (≤ 60 characters by schema);
  the worst case the schema allows (three 90-character steps) fits.
- **TV, a game chosen:** the side list of 14 games cut a row in half and left the chosen game (the
  last) off the bottom. It scrolls the chosen game to the middle and fades the edge where more
  games are (`useScrollEdges`).

Final sweep: 0 fit problems in Spanish (75 stills) and English (SE, iPhone 15, 200 %, sideways).

## Frames

With video recording on, p03 shows 2–3 frames over 100 ms per surface (worst 133 ms; 200 ms at
14 games) against none at p00 — recorded while ~10 game sessions shared the machine (3 GB of
32 GB free). The same run without the recorder (`capture-picker --prod --no-video`,
`../p03-frames-novideo/`): **none over 100 ms on any surface** — TV 11 frames over 34 ms (worst
100 ms, at load), VIP 15 (worst 83 ms), guest 11 (worst 67 ms), fewer than p00 had with video
(19–30). The extra long frames with video are the screencast's cost on a loaded machine.

## Open

- **Small targets in the phone's top bar:** Share (🔗) and Theme are 72×32 px, under the 44 px
  rule — a shell piece, reported to its owner.
- **Bingo's PhoneStage** is imported both lazily (phone-entry) and statically (Controller), so the
  split does nothing (Vite warns): an F1 follow-up.
- **Harness:** on this loaded machine a headless page can stall past 30 s (a VIP missed its socket
  heartbeat once; a page never fired load once). Not the product: split long sweeps.
