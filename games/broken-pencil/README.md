# Broken Pencil

Telephone with a pencil (Telestrations-style). Design doc: `docs/game-ideas/002-broken-pencil.html`.

## Overview

Everyone picks a secret word and owns a **book**. Books pass round a circle: draw the previous page's
text, guess the previous page's drawing, draw that guess… until every book has its pages. Then the TV
turns the pages of every book one at a time, first to last, with the VIP holding **Next**. A book whose
last guess matches its word is **UNBROKEN**; otherwise **CHAIN BROKEN**. No points — the show is the game.

## Players

3–8 (state cap: 8 × 4 drawings ≈ 150 KB). Late joiners spectate. Disconnected players are not waited
for; their pages become placeholders (empty sheet / "???"). **Bots: welcome** (`supportsBots: true`) —
a bot cannot see, so it scribbles a doodle and guesses a noun from a 40-word list; its pages break
chains, which is honest and fine for filling seats or testing. It only reads what its phone shows.

## Phases

| Phase     | What happens                                                                                                                                                                     | Exit                                                                                | Timer                               |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------- |
| `pick`    | Each player gets three words (easy / medium / hard, no repeats) and may type their own (`customWords`). Seats are shuffled at init.                                              | all connected picked · deadline · VIP skip (unpicked → the medium word)             | 20 s                                |
| `draw`    | Draw the text on the previous page of the book in your hands (8 colours, 3 pens, undo, clear, limited ink). "Done" sends; no send by the deadline → empty sheet.                 | all connected sent · deadline · VIP skip → next step                                | `drawSeconds` (30–120)              |
| `guess`   | Write what the previous page's drawing is (1–40 chars). No send → "???".                                                                                                         | all connected sent · deadline · VIP skip → next step, or `show` after the last page | `guessSeconds` (15–60)              |
| `show`    | The TV shows book by book, page by page: pages shown so far as a filmstrip, the current page big. The last page adds the verdict (intact / broken) and a line from `lines.json`. | timer · **VIP skip = Next page** · after the last page of the last book → `done`    | 6 s word / 12 s drawing / 8 s guess |
| `summary` | "k of N books survived" + every book's word → last guess.                                                                                                                        | deadline · VIP skip → `done`                                                        | 15 s                                |
| `done`    | Terminal. `results()` non-null (the engine's results screen shows the Unbroken awards).                                                                                          | terminal                                                                            | —                                   |

**Routing.** `P = max(1, min(passes, N − 1))` other players touch each book (default: everyone). If `P`
is odd the owner draws their own word first (`ownerDraws = 1`); if even the next seat draws it. Pages:
`L = P + 1 + ownerDraws`; page `i ≥ 1` is a drawing when `i` is odd, a guess when even, so every book
ends on a guess. Page `i` of the book at seat `b` is written by seat `(b + i − ownerDraws) mod N`; at
step `i` seat `k` holds book `(k − i + ownerDraws) mod N`. Every player writes one page per step and
never touches the same book twice. VIP `end` → `done` from anywhere (books may be short; views cope).
Pause holds the step (or the page on screen); phones keep drawing locally, sending waits.

## Inputs

- `{ type: 'pick', option: 0..2 }` / `{ type: 'pickCustom', text }` (1–30 chars, only if `customWords`) —
  `pick` phase, players only, once.
- `{ type: 'draw', strokes }` — `draw` phase; ≤ 80 strokes, each `{ c: 0..7, w: 0..2, p: base64 }`, ≤ 3 000
  point characters in total (≈ 1 125 points). Once per step; a second send is ignored. Empty list = empty sheet.
- `{ type: 'guess', text }` — `guess` phase; 1–40 chars, once per step.
- No inputs in `show` (VIP skip / pause turn and hold pages) or `done`.

## Scoring

**None.** Everyone scores 0 and shares rank 1 (`winnerIds` = everyone). Each intact book earns its owner
an honorary **Unbroken** award. Intact = the last page is a guess whose normalised text (lower-case,
punctuation and extra spaces removed, a leading a/an/the dropped) equals the word's. Scores never change.

## Edge cases

- **3 players**: `P = 2`, 3 pages (word, drawing, guess). **8 players**: `P = 7`, 9 pages, 4 drawings each.
- **`passes` lowered** (e.g. 3 with 8 players): each book is seen by the next 3 seats only; the pick
  screen says so. **2 players** (below `minPlayers`, defensive): `P = 1`, owner draws, the other guesses.
- **Everyone idle**: medium words, empty sheets, "???" guesses, every book broken; the show still runs
  on its timers. 8 players ≈ 14 min < `estimatedMinutes × 3`.
- **Duplicate send** in a step → ignored. **Oversized drawing** → rejected by the schema (socket cap 6 144 B).
- **VIP leaves during the show** → the engine reassigns the VIP; auto-turn timers carry the show meanwhile.
- **Skip mashing** in `show` flips pages fast — intended. **VIP end mid-show** → `done` with every book.
- **A guess equal to the word mid-book** changes nothing; only the last page decides.
- **Bot added mid-game** → spectator (no book) until the next game.

## Settings

| Key            | Type    | Default | Range        | Effect                                                   |
| -------------- | ------- | ------- | ------------ | -------------------------------------------------------- |
| `passes`       | number  | 15      | 1–15         | Other players per book; 15 = everyone (capped to N − 1). |
| `drawSeconds`  | number  | 60      | 30–120 by 10 | Time per drawing.                                        |
| `guessSeconds` | number  | 30      | 15–60 by 5   | Time per guess.                                          |
| `customWords`  | boolean | true    | —            | Players may type their own secret word.                  |
| `spicy`        | boolean | false   | —            | Adds the cheeky pack to the offers (PG-13).              |

## Content

`content/words.json` — 60 family words (20 easy / 20 medium / 20 hard). `content/words-spicy.json` — 20
cheeky words merged in when `spicy` is on. `content/lines.json` — verdict lines (3 intact, 3 broken) and
the bot's 40-noun vocabulary (players never see it). Every difficulty pool must hold ≥ `maxPlayers` words.
