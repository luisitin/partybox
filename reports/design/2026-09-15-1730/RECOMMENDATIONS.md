# Design recommendations — round 2, pass 2026-09-15-1730 (Wisecrack · Lightning Round · themes)

Captured on `design` @ 3c71c0c (= `main` @ f688d60 + the theme system). 383 stills in
`contact-sheet.html`: every fixture of both games through `/preview` (TV + iPhone 15, SE, 200 % font,
three player roles each), a live run per game (4 phones + 2 bots, every phase, before/after one player
acts, results), and the five themes on the TV lobby, phone join/lobby and every game fixture.

## Summary

1. **Themes shipped** (user request, not a finding): Neon Night, Daylight, Retro Arcade, Cozy Cabin, High Contrast; per device, 🎨 on the TV corner and the phone header; all five hold ≥ 4.5:1 on every text/label pair. Two theme follow-ups below (R-034, R-035).
2. **Wisecrack** is in good shape on the TV; the phone vote is the weak screen — two 18 px rows in a sea of empty space for the game's key decision (R-029), and "(no answer)" is votable and styled like a real answer (R-030).
3. **Lightning Round**'s reveal is its best moment and the phone whispers it: "Correct! +1000 · 1000 points" is an 18 px footer line (R-031). The TV reveal's player rows collide with the core VIP pill (R-032) and would overflow at 16 players (R-033).
4. Cross-game: interim standings show a 🏆 and centre the names (R-036); `waiting` chips show "–" for every player during reveals (R-037); the wisecrack `.board` wrapper hack is obsolete after R-001 (R-038).
5. Both games use plain `<p>` footers for state lines ("Locked in ✓", "Wager locked: 2430 ✓") — consistent with nothing else (R-039).

## Recommendation

Apply all 11. R-029 – R-033 are the ones a player would notice on the couch; the rest are consistency.

---

### R-029 · P2 · Wisecrack vote: the two answers are 18 px rows with 70 % of the phone empty

**Status: applied** (2026-09-15, branch `design`)

- **Where**: wisecrack, vote, phone (voters). `wisecrack/live-vote/iphone-vip.png`, `wisecrack/vote/iphone-se-p3-p3.png`.
- **Change**: `VoteList` gets `size="large"` (game opts in): option text at `--pb-font-h2` (22 px), `min-height: 30dvh` each so two options fill the thumb zone, letter in a 44 px disc like `ChoiceGrid`. Wisecrack passes `size="large"` because it always has exactly two options.
- **Files**: `packages/game-sdk/src/controller/VoteList.tsx` + `.module.css`, `games/wisecrack/client/ControllerVote.tsx`. **Effort** S.

### R-030 · P2 · "(no answer)" is votable and styled like a real answer

**Status: applied** (2026-09-15, branch `design`)

- **Where**: wisecrack, vote, phone + TV. `wisecrack/live-vote/iphone-vip.png` (phone: plain "A · (no answer)"), TV already italic-muted.
- **Change**: `VoteOption` gets `muted?: boolean` → italic `--pb-text-muted`, still votable (game rule); wisecrack sets it when `text === '(no answer)'`; phone kicker stays.
- **Files**: `packages/game-sdk/src/controller/VoteList.tsx` + `.module.css`, `games/wisecrack/client/ControllerVote.tsx`. **Effort** S.

### R-031 · P1 · Lightning reveal on the phone is a footnote

**Status: applied** (2026-09-15, branch `design`)

- **Where**: lightning-round, reveal, phone. `lightning-round/live-reveal/pixel-p3.png` — "Correct! +1000 · 1000 points" 18 px at the very bottom.
- **Change**: `Outcome` becomes a card in the footer: verdict as h2 ("Correct!" in `--pb-accent-3` / "Wrong" or "No answer" in `--pb-danger`), the delta at `--pb-font-display` (48 px, tabular), "🔥 streak 3" and the running total as caption. Final question: "Final score 9 734".
- **Files**: `games/lightning-round/client/ControllerBits.tsx`, new `Controller.module.css`. **Effort** S.

### R-032 · P2 · The core VIP pill overlaps game content bottom-right

**Status: applied** (2026-09-15, branch `design`)

- **Where**: core envelope, every game; visible on `lightning-round/live-reveal/tv-stage.png` (pill over the last reveal row) and `wisecrack/vote/tv-stage.png` (over the progress line).
- **Change**: remove the bottom-right `★ {vip}` pill from `TvPlaying` — the strip chip already says `★ VIP` since R-004. (Keep `aria` on the chip.)
- **Files**: `packages/client/src/tv/TvPlaying.tsx` + `.module.css`. **Effort** S.

### R-033 · P2 · Lightning reveal rows overflow past 8 players

**Status: applied** (2026-09-15, branch `design`)

- **Where**: lightning-round, reveal, TV. 6 players already reach y = 1005 (`live-reveal/tv-stage.png`); 16 = two extra rows of 72 px off-screen.
- **Change**: in reveal, shrink the choice grid to one row of four (`grid-template-columns: repeat(4, 1fr)`, `min-height: 88px`, choice text `--pb-font-caption`+bold) and let `.rows` go to three columns from 9 players (`repeat(auto-fill, minmax(420px, 1fr))`), row padding `space-1`.
- **Files**: `games/lightning-round/client/Tv.module.css`, `TvQuestion.tsx` (a `compact` flag on `ChoiceBoard`). **Effort** S.

### R-034 · P3 · Daylight: `★ VIP` and the timer read dark-brown-on-yellow-less

**Status: applied** (2026-09-15, branch `design`)

- **Where**: themes/daylight — the pill is `accent-2` (#7a4b00) with white text (fine), but the _timer_ and kickers in dark amber lose the "gold" feel; `themes/daylight/tv-picker-open.png`.
- **Change**: add `--pb-accent-2-fill` (used by pills/buttons: `#ffd166` in every theme, so VIP/letters stay gold) separate from `--pb-accent-2` (text/timer, dark amber in daylight). Only pill/letter backgrounds switch to the new token.
- **Files**: `tokens.css`, `PlayerChip.module.css` (.vip), `wisecrack.module.css` (.letter), `ControllerShell.module.css` (.vipBadge). **Effort** S.

### R-035 · P3 · High Contrast: focus ring and `.you` tag vanish on black

**Status: applied** (2026-09-15, branch `design`)

- **Where**: themes/contrast — `--pb-focus` white is fine, but `surface-2` tags (#242424) on `surface` (#111) are 1.3:1 boundaries.
- **Change**: in `[data-theme='contrast']` add `--pb-border: #ffffff` and give `.chip`, `.card`, `.option`, `.row` a `1px solid var(--pb-border, transparent)` outline so every surface has an edge (WCAG 1.4.11 non-text contrast 3:1).
- **Files**: `tokens.css`, `PlayerChip.module.css`, `Scoreboard.module.css`, `ChoiceGrid/VoteList.module.css`. **Effort** S.

### R-036 · P3 · Interim standings crown a winner and centre the names

**Status: applied** (2026-09-15, branch `design`)

- **Where**: wisecrack scores TV (`wisecrack/scores/tv-stage.png`), lightning wager TV — 🏆 on "Scores so far"; names centred because `Stage center` cascades `text-align`.
- **Change**: `Scoreboard .name { text-align: left }`; games pass `noTrophy` for mid-game boards (wisecrack `scores`, lightning `wager`/`reveal` standings).
- **Files**: `packages/game-sdk/src/tv/Scoreboard.module.css`, `games/wisecrack/client/TvScores.tsx`, `games/lightning-round/client/Tv.tsx`. **Effort** S.

### R-037 · P3 · Every chip shows "–" during reveals

**Status: applied** (2026-09-15, branch `design`)

- **Where**: both games, reveal/scores TV strip — six dashes carry no information.
- **Change**: `PlayerChip` renders no glyph for `waiting` (keeps `aria-label`); `submitted` ✓ and `reconnecting` ⟳ unchanged.
- **Files**: `packages/game-sdk/src/ui/PlayerChip.tsx`. **Effort** S. (Supersedes R-013.)

### R-038 · P3 · Wisecrack `.board` wrapper works around a fixed bug

**Status: applied** (2026-09-15, branch `design`)

- **Where**: `games/wisecrack/client/wisecrack.module.css` `.board` sets `font-size: var(--pb-font-body)` to fix the 18 px em basis — obsolete since R-001; `TvScores` also renders inside `Stage center`.
- **Change**: drop `.board`'s font-size, keep width; pass `noTrophy` (R-036).
- **Files**: `games/wisecrack/client/wisecrack.module.css`, `TvScores.tsx`. **Effort** S.

### R-039 · P3 · Ad-hoc `<p>` status lines in game footers

**Status: applied** (2026-09-15, branch `design`)

- **Where**: lightning question ("Locked in ✓"), wager ("Wager locked: 2430 ✓", "Right answer: +wager…") — unstyled 18 px paragraphs where other screens use the SDK's green "✓ Locked in" line (R-020).
- **Change**: `ChoiceGrid` already renders the locked line; lightning drops its own `footer` for question/wager locked states and keeps only the explanatory wager hint as `pb-muted pb-caption`.
- **Files**: `games/lightning-round/client/Controller.tsx`. **Effort** S.

## Not changed / for other sessions

- Wisecrack `answer` phase: the TV counts answers ("1 / 12 answers in") but chips never flip to ✓ per player — `tvView` keeps `status: 'active'` until both answers are in (`games/wisecrack/server`, game logic → `for-games.md`).
- Lightning question choices on the TV are 36 px body inside 850 px cards; readable, left as is.

## Applied — 2026-09-15

All 11 applied (7 commits, verify green). Re-capture: `after/contact-sheet.html` — fixtures of both
games in night/daylight/contrast plus live runs. Pairs to open side by side:

| Item              | Before                                           | After                                                  |
| ----------------- | ------------------------------------------------ | ------------------------------------------------------ |
| R-029/R-030       | `wisecrack/live-vote/iphone-vip.png`             | `after/wisecrack/live-vote/iphone-vip.png`             |
| R-031             | `lightning-round/live-reveal/pixel-p3.png`       | `after/lightning-round/live-reveal/pixel-p3.png`       |
| R-032/R-033/R-037 | `lightning-round/live-reveal/tv-stage.png`       | `after/lightning-round/live-reveal/tv-stage.png`       |
| R-036/R-038       | `wisecrack/scores/tv-stage.png`                  | `after/wisecrack/scores/tv-stage.png`                  |
| R-034             | `themes/daylight/tv-lobby.png`                   | `after/wisecrack/vote-daylight/tv-stage.png`           |
| R-035             | `lightning-round/question-contrast/tv-stage.png` | `after/lightning-round/question-contrast/tv-stage.png` |
