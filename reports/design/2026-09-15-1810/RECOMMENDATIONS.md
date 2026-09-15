# Design recommendations — round 3, pass 2026-09-15-1810 (bots as players + core regression)

Captured on `design` @ 618e2b8 (= `main`, includes "bots as room players", ADR-028). 94 stills in
`contact-sheet.html`: the new bot flows (`bots/`: lobby owner / non-owner / 200 %, TV lobby and strip,
game cards, Start refusal, VIP menu, results) plus the full core pass re-run for regressions.

## Summary

1. The bot feature reads well: the 🤖 tag, robot avatar and "Sam's bot" naming leave no doubt; the
   Start refusal copy ("Wisecrack has no bot support — remove the 3 bots or pick a game that welcomes
   bots.") is exactly right; spectators dimmed in the strip work.
2. **Regression**: the TV lobby no longer fits 16 players — tagged `lg` chips push "Waiting for Sam…"
   into the overscan band (R-040).
3. The phone's "Add a bot" section lives below the fold under the player grid; Remove is only there.
   Nobody will find it (R-041).
4. Polish: "No bots" is styled like a feature (R-042); the bot tag repeats what the name and avatar
   already say (R-043); the hint copy under "Add a bot" is vague (R-045).
5. Core pass: no other regressions; round-1/2 fixes hold (toasts are now `role="status"` divs — the
   phone toast filter still applies).

## Recommendation

Apply all five (R-040 … R-043, R-045). R-044 is the still-open chip-order item for the stress session.

---

### R-040 · P2 · TV lobby overflows at 16 players once chips carry tags

**Status: applied** (2026-09-15, branch `design`)

- **Evidence**: `core/lobby-16/tv-stage.png` — 8 rows of `lg` chips; the caption lands at y ≈ 1048 (band starts at 1026); `bots/lobby/tv-stage.png`.
- **Change**: `TvLobby` picks the chip size from the count: `lg` up to 8 players, `md` from 9 (`PlayerChips size={players.length > 8 ? 'md' : 'lg'}`); the `.you`/`.bot`/`.vip` tags scale with the chip (they already use `em`).
- **Files**: `packages/client/src/tv/TvLobby.tsx`. **Effort** S.

### R-041 · P2 · Bot controls are hidden under the fold; Remove only lives there

**Status: applied** (2026-09-15, branch `design`)

- **Evidence**: `bots/lobby/iphone-vip-owner-of-2.png` (the "Add a bot" bar peeks under the footer), `bots/lobby/iphone-se-owner-of-1.png`.
- **Change**: make bots part of the player grid: a dashed "＋ Add a bot" chip as the last item (44 px, `--pb-border`-style dashed outline, disabled state with the reason "4 bots max" / "Room full"), and an ✕ on the chips of bots you own (`PlayerChip onRemove` → 44 px hit area, confirm not needed — a removed bot is one tap to re-add). Drop the separate "Your bots" section; keep the one-line hint under the grid.
- **Files**: `packages/client/src/controller/Lobby.tsx` + `.module.css`, `packages/game-sdk/src/ui/PlayerChip.tsx` + `.module.css`, `i18n.ts`. **Effort** M.

### R-042 · P3 · "No bots" looks like a feature badge

**Status: applied** (2026-09-15, branch `design`)

- **Evidence**: `bots/selecting-refused/iphone-vip.png` — "3–8 players · ~10 min · No bots" all in `--pb-accent-2`.
- **Change**: split the meta line: players/minutes stay accent-2; "🤖 Bots welcome" in `--pb-accent-3`, "No bots" in `--pb-text-muted`. When bots are in the room, the "No bots" card gets a muted "(remove 3 bots first)" suffix so the reason is visible before tapping.
- **Files**: `packages/client/src/controller/Selecting.tsx` + `.module.css`, `i18n.ts`. **Effort** S.

### R-043 · P3 · The bot tag says "bot" next to a robot avatar and a name ending in "bot"

**Status: applied** (2026-09-15, branch `design`)

- **Evidence**: `bots/playing/tv-stage.png` — "Maximiliano Vega's bot 🤖 bot"; `core/lobby-16/tv-stage.png` — "Bot 🤖 bot".
- **Change**: the tag becomes the glyph only (🤖, `aria-label="bot"`), same pill; the name carries the words.
- **Files**: `packages/game-sdk/src/ui/PlayerChip.tsx`. **Effort** S.

### R-044 · P3 · Strip order ≠ join order (still open, stress session)

- **Evidence**: `bots/playing/tv-stage.png` — Kenji, Maximiliano, Sam's bot, Sam …; lobby shows Sam first.
- Not a client change; logged in `for-stress.md` round 1, still reproducible.

### R-045 · P3 · "Add a bot" hint is vague

**Status: applied** (2026-09-15, branch `design`)

- **Evidence**: "A bot plays on your behalf in games that welcome bots."
- **Change**: "Plays for you in games marked 🤖 Bots welcome — up to 4 per person." (`t.lobby.addBotHint`).
- **Files**: `packages/client/src/i18n.ts`. **Effort** S.

## Applied — 2026-09-15

R-040, R-041, R-042, R-043, R-045 applied (3 commits, verify green); R-044 stays with the stress session. Re-capture: `after/bots/*` — see `after/bots/lobby/iphone-vip-owner-of-2.png` (✕ on own bots, dashed add chip) and `after/bots/selecting-refused/iphone-vip.png`.
