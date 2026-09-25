# Hive Rank — review package (2026-09-24)

Branch `game/hive-rank` (not merged). Try it: `pnpm dev --port 42360` in
`C:/dev/partybox-game-hive-rank`, pick Hive Rank. Media is local (gitignored) under
`reports/design/record-review/hive-rank/`.

## Five lines

1. Hive Rank plays end to end on TV and phones: 150 family + 50 spicy questions, 2–16 players,
   about 5 minutes, bots welcome, the reader counts the hive down from 5th to 1st.
2. The phone is the new SDK `OrderPicker` (tap to number, tap to take out, Reset, sticky Lock it
   in / Change); every one of the 200 questions fits an iPhone SE and a sideways phone unscrolled.
3. The TV reveal is a ladder filling from the bottom — things fly in turning in 3D, faces of the
   exact-placers pop beside them, a track shows the room's average, and a scout bee flies to
   the next spot during each hold, so the reveal never goes still; number one lands bigger.
4. Proven by watching: 12 recorded passes (3 / 6 / 16 players, reconnect, pause, idle, spicy,
   phone-only), 0 dead spans and 0 hard cuts on the TV in every game phase, every reading
   starting on the frame its text lands, every cue on its moment, 11 touch-abuse checks passing.
5. Server: 57 game tests, the contract suite, 800 sim runs, `pnpm verify` green; state ≈ 12 KB and
   views < 4 KB at 16 players.

## Screens

| Sheet                       | What                                                                            |
| --------------------------- | ------------------------------------------------------------------------------- |
| `review/tv-phases.png`      | TV: intro, rank, hive at 3rd, number one, score                                 |
| `review/tv-16.png`          | TV at 16 players: the ladder and the score board                                |
| `review/phone-se.png`       | iPhone SE: intro, rank (locked), Watch the TV, my result, the phone-only ladder |
| `review/phone-sideways.png` | sideways: rank, score                                                           |
| `review/phone-200-es.png`   | 200 % text and Spanish                                                          |
| `themes/sheet-*.png`        | Daylight, Arcade, Cabin, High Contrast — TV and phone                           |
| `matrix/*.png`              | every fixture × SE / iPhone / sideways / 200 % / Spanish / TV                   |

Clips: `p06/video/tv/round.webm` + `p06/video/phone/round.webm` (a whole 3-round game, voice on),
`phone-only/video/*.webm` (a phone-only room on an SE). Frame strips: `p05/strips/g-*.png`.

## Open questions (my recommendation first)

1. **Bots read `expected` from their own view** (`hint`, only in bot seats' views) — keeps both
   "bots decide from their view" and "bots start from expected". **Keep?** (Recommended.)
2. **Spicy on = half the rounds spicy.** The spec says "adds the spicy pack"; a plain draw would
   give ~1.5 spicy questions in six rounds. **Keep half?** (Recommended.)
3. **Phone-only rooms keep the Controller at `intro` and `score`** (PhoneStage has no `skip`, so
   the VIP would lose Let's go / Next round) and draw the room's board there. **OK?**
   (Recommended.) On an SE that score screen scrolls under the sticky Next.
4. **200 % text:** 38 of 200 questions scroll the rank screen by up to 69 px (Lock stays put, the
   ▾ pill shows). Shrinking further would cut below the 44 px targets. **Accept?** (Recommended.)
5. **Ship OrderPicker to main early?** Only Hive Rank uses it, so I left it on this branch.

Also noted, not mine: the shell's "Not saving recaps" toast covers a rank row for a moment on an
SE; long frames sit at ~5 % on the TV in every recording, the same as Lightning Round recorded the
same minute (the machine is running many sessions) — re-measure on a quiet machine.
