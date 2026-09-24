# Broken Pencil

Telephone with a pencil (Telestrations-style). Design doc: `docs/game-ideas/002-broken-pencil.html`.

## Overview

Everyone picks a secret word and owns a **book**. Round 1: everyone draws their own word. Then the
book moves one seat: the holder looks at the drawing, writes a guess, and **draws that guess** for
the next seat — round after round until the last player, who only guesses (a drawing there would
come straight back to the owner). Then every owner **presents their own book** on the TV from their
phone, page by page. A book whose last guess matches its word is **UNBROKEN**; otherwise **CHAIN
BROKEN**. No points — the show is the game. The picker's minutes follow the room (I-189 B: 30 s + one
round a player × (55 s + 4 s a player) — ~5 min at 4, ~12 at 8; from the host PC's recaps).

- The pick screen's how-to says rule 3 as the room will play it: "round the circle" only when every
  book goes round, else "It passes to N players in turn" (I-507 A).
- Under the how-to a row shows a book's pages as they will be — 📖 ✏️ ❓ ✏️ ❓ · 5 pages (I-507 B).
- I-796 K: in a TV room the `show` phones hold a framed thumbnail of the page on the TV ("On the TV
  now", the drawing capped at 220 px) instead of a blank "X is presenting" wait.
- Drawing: whose book and the round ride in the phone's timer bar ("Maximiliano's book · 1/6", SDK
  `useTimerLabel`); the prompt is one bold line ("Draw: “yoga class”"), and the sheet takes the height
  left above the colours and one band of ink / pen size / Undo / Clear (design review H, I-794).
- Guessing: the field and Send are laid out first and the drawing takes what is left (TextAnswer
  `lead`); tap it to see it large; an open keyboard shrinks the drawing, not the field (review I, I-795).

## Players

3–8 (state cap: drawings are ≤ 2 600 ink chars / 64 strokes each; 8 books × 7 drawings stays under 256 KB). Late
joiners spectate. Disconnected players are not waited for; their pages become placeholders (empty
sheet / "???"). **Bots: welcome** (`supportsBots: true`) — a bot cannot see, so it scribbles a doodle
and guesses a noun from a 40-word list; its books always break, which is honest and fine for filling
seats or testing. Its own book turns itself at a presenter's pace (5 s word / 8 s drawing / 5 s guess,
`BOT_SHOW_MS`) instead of the room's fallbacks. It only reads what its phone shows.

## Phases

| Phase     | What happens                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Exit                                                                                                       | Timer                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `pick`    | Each player gets three words (easy / medium / hard, no repeats) and may type their own (`customWords`). The tiers show one, two or three heat discs, green to red (I-023 A); they rise 60 ms apart and the tapped tier's discs bump while the others step back (B); with Spicy on the hard tier's discs breathe like an ember — the phone view carries `spicy` (C). Seats are shuffled at init.                                                                                                                                                                                                                     | all connected picked · deadline · VIP skip (unpicked → the medium word)                                    | 20 s                                                                     |
| `draw`    | Round 1: draw your own word (8 colours, 3 pens, undo, clear, limited ink; the sheet is dealt in and the swatches pop 40 ms apart, the picked one wobbling — I-021 C/A; the pad paints ruled paper with a red margin and soft pencil strokes by default, and the phone's settings sheet offers plain paper and a pen — the owner's note; the stored strokes and the TV are the same either way). "Done" sends; at the deadline the sheet stops where it is (the last `draft`), or an empty sheet if nothing was drawn.                                                                                               | all connected sent · deadline · VIP skip → the first pass                                                  | `drawSeconds` (30–120)                                                   |
| `pass`    | Rounds 2..P: the book moved one seat. On the TV a finished card lands and the count bumps (I-024 A); the cards sit in seat order under "books pass this way →" and as each pass opens every glyph slides in from the seat on its left, 450 ms apart, with a half-gain `card` pluck per seat (B); a done card's book tile slides on to the next seat 300 ms after the ✓ and that seat's card rings green (C). Look at the last drawing, write a guess (1–40 chars), then draw that guess — two pages, in that order, on one phone. Missing guess → "???", missing drawing → the artist's draft, else an empty sheet. | all connected done (both pages) · deadline · VIP skip → next pass, or `guess` after the last               | `guessSeconds + drawSeconds`                                             |
| `guess`   | Round P+1: the last holder only guesses.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | all connected sent · deadline · VIP skip → `show`                                                          | `guessSeconds` (15–60)                                                   |
| `show`    | Book by book in seat order, first page to last: the pages shown so far as a filmstrip, the current page big (every page after the first pivots in on its left edge, 600 ms — I-008 A). **The book's owner turns the pages from their phone** (`turn`); the TV's Skip / VIP skip turn too; a page auto-turns after a fallback delay. The last page adds the verdict and a line from `lines.json`.                                                                                                                                                                                                                    | `turn` from the presenter · VIP skip · timer → next page; after the last page of the last book → `summary` | fallback 12 s word / 20 s drawing / 12 s guess (a bot's book: 5 / 8 / 5) |
| `summary` | "k of N books survived" + every book's word → last guess — the rows rise 80 ms apart and each ✓ / ✕ stamps down after its row (I-022 A). Each card puts the name and verdict on top and gives the chain the full width below, so a long name never splits a word (S-006 A+B).                                                                                                                                                                                                                                                                                                                                       | deadline · VIP skip → `done`                                                                               | 15 s                                                                     |
| `done`    | Terminal. `results()` non-null (the engine's results screen shows the Unbroken awards).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | terminal                                                                                                   | —                                                                        |

**Routing.** `P = max(1, min(passes, N − 1))` other players touch each book (default: everyone, so
the book would come home next). Pages: `L = 2P + 1` — word, the owner's drawing, then (guess,
drawing) × (P − 1), then the last guess; page `i ≥ 1` is a drawing when `i` is odd, a guess when even.
Page `i` is written at round `⌊i/2⌋ + 1`; at round `k` seat `s` holds book `(s − k + 1) mod N`, so
everyone works one book per round, their own first, and never the same book twice. VIP `end` → `done`
from anywhere (books may be short; views cope). Pause holds the round (or the page on screen).

## Inputs

- `{ type: 'pick', option: 0..2 }` / `{ type: 'pickCustom', text }` (1–30 chars, only if `customWords`) —
  `pick` phase, players only, once.
- `{ type: 'guess', text }` — 1–40 chars; accepted in `pass` (first page of the round) and `guess`, from
  the holder of a book that owes a guess. Once per round.
- `{ type: 'draw', strokes }` — ≤ 64 strokes, each `{ c: 0..7, w: 0..2, p: base64 }`, ≤ 2 600 point chars in
  total (≈ 975 points); accepted in `draw`, and in `pass` only after that player's guess. Empty list = empty sheet.
- `{ type: 'draft', strokes }` — the same shape: the sheet so far, sent by the phone while drawing (throttled,
  ≈ every 1.5 s, every 0.4 s in the last 6 s). Accepted whenever a `draw` would be; kept in `state.drafts`
  per artist, spent by that player's `draw` (or `guess`), never shown to anyone else, and used in place of the
  empty sheet when the step closes without their `draw`. The phone gets its own draft back (`view.draft`)
  after a reload mid-drawing.
- `{ type: 'turn' }` — `show`, from the owner of the book on the TV only: next page / next book / finish.
- `{ type: 'veto', book }` — from the VIP only (the engine stamps `vip` on their inputs, ADR-042), on a broken book's last page in `show` or in `summary`: "close enough" — the book counts as intact (`vetoed`), once per book.
- Anything else (a drawing after the last guess, a guess before drawing, a turn from a spectator) → ignored.

## Scoring

**None.** Everyone scores 0 and shares rank 1 (`winnerIds` = everyone). Each intact book earns its owner
an honorary **Unbroken** award. Intact = the last page is a guess whose normalised text (lower-case,
punctuation and extra spaces removed, a leading a/an/the dropped) equals the word's. Scores never change.

## Edge cases

- **3 players**: `P = 2`, 5 pages (word, drawing, guess, drawing, guess). **8 players**: `P = 7`, 15 pages, 7 drawings each.
- **`passes` lowered** (e.g. 3 with 8 players): each book is seen by the next 3 seats only (7 pages); the
  pick screen says so. **2 players** (below `minPlayers`, defensive): `P = 1`, owner draws, the other guesses.
- **Everyone idle**: medium words, empty sheets (or half-drawn ones where a phone drafted), "???" guesses, every book broken; the show runs on its
  fallback timers. 8 players ≈ 11 min play + 31 min show < `estimatedMinutes × 3` (60).
- **Duplicate send** in a step → ignored. **Oversized drawing** → rejected by the schema (socket cap 6 144 B).
- **Presenter asleep or gone** → the fallback timer turns the page; the TV's Skip does too.
- **Next mashing** in `show` flips pages fast — intended. **VIP end mid-show** → `done` with every book.
- **A guess equal to the word mid-book** changes nothing; only the last page decides.
- **Bot added mid-game** → spectator (no book) until the next game.

The TV show's current-page column is a size container: the drawing sheet is 560 px or what is left under
the "X drew" caption, whichever is smaller (`capture-pencil-show-fit.ts` proves 8 and 6 players).

## Settings

| Key            | Type    | Default | Range        | Effect                                                         |
| -------------- | ------- | ------- | ------------ | -------------------------------------------------------------- |
| `passes`       | number  | 15      | 1–15         | Other players per book; 15 = everyone (capped to N − 1).       |
| `drawSeconds`  | number  | 60      | 30–120 by 10 | Time per drawing.                                              |
| `guessSeconds` | number  | 30      | 15–60 by 5   | Time per guess.                                                |
| `customWords`  | boolean | true    | —            | Players may type their own secret word.                        |
| `spicy`        | boolean | false   | —            | Adds the explicit pack (18+, Blanks-WILD level) to the offers. |

## Content

`content/words.json` — 60 family words (20 easy / 20 medium / 20 hard). `content/words-spicy.json` — 20
cheeky words merged in when `spicy` is on. `content/lines.json` — verdict lines (3 intact, 3 broken) and
the bot's 40-noun vocabulary (players never see it). Every difficulty pool must hold ≥ `maxPlayers` words.
