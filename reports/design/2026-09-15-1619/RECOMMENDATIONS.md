# Design recommendations — pass 2026-09-15-1619 (core screens + Quick Poll)

Captured on `main` @ 5da6dd7 (Phase 6). No real game is registered yet, so the game side was
exercised with an **uncommitted** `pnpm new-game quickpoll` scaffold (= the template game, renamed
"Quick Poll"): it drives the play envelope, the SDK primitives (`TextAnswer`, `WaitingScreen`,
`Reveal`, `Timer`, `PlayerChips`, `Scoreboard`) and results. `/preview/:game/:phase` is still the
Phase 7 placeholder, so step A.4 (fixture previews) was skipped. Evidence paths are relative to this
folder; `contact-sheet.html` shows all 92 stills on one page; `quickpoll/video/round.webm` is one
unfrozen round.

## Summary (10 lines)

1. **The TV type scale is not applied to inherited text.** `body { font-size: var(--pb-font-body) }` sits outside `[data-surface='tv']`, so every plain `<p>`, description, and md chip name on the stage renders at the **phone** 18 px (measured). This is the single biggest readability defect.
2. **The play timer is 72 px** (size `md` → h1), below the 96 px floor; in the last 5 s it only reaches ≈ 79 px, tucked under the QR in the corner — it does not "change character" from the couch.
3. **Results overflow**: 8 players already push row 8 and the VIP hint off-screen; 16 would show half the board. 16-char names truncate ("Maximili…"). An all-tie (game ended early) yields a 3-line "A, B, C, D … win!" hero with a trophy on every 0-point row.
4. **Overscan violations**: TV toasts (y 886–1068) and the mute/fullscreen controls (y 12) live inside the 5 % band; the controls overlap the join URL/QR.
5. **Join form dead-ends**: dismissing "That name is taken." leaves the button stuck on "Joining…"; a kicked phone's Join button is inert (socket never reconnects — logged for stress).
6. **Phones have no timer** during input phases — the only countdown is 72 px on the far TV.
7. **Header breaks** on the SE and at 200 % font scale: the connection dot squashes to 9 px over the room code; the name collapses to "K…".
8. **Toasts pile up** (4 on the lobby phone, 2–3 on the TV) and cover the primary button / the stage.
9. The textarea renders in **monospace** (reset omits `textarea`); the paused curtain hides the prompt; the audio gate uses phone-size text and blocks the QR after every reload.
10. Overall the palette, chips, avatars, the phone join/lobby/selecting flow and spectator/submitted states are in good shape — most items below are S-effort token/CSS fixes.

## Quick wins (S effort, high impact)

R-001 · R-002 · R-006 · R-008 · R-014 · R-016 · R-017 · R-018 · R-004

---

## Readability

### R-001 · P1 · TV inherited text renders at the phone size (18 px)

**Status: applied** (2026-09-15, branch `design`)

- **Where**: core, every TV screen (lobby, selecting, playing, results); game Tv components using plain `<p>`/`pb-muted`.
- **Evidence**: `core/lobby-0/tv-stage.png` "Waiting for the first player…" 18 px; `core/selecting/tv-stage.png` "Sam is choosing a game…", description, "1–16 players · ~2 min" all 18 px; chip names in `PlayerChips` md = 18 px while `sm` chips = 28 px (inverted); audio gate hint 18 px. Measured with `packages/e2e/src/design/measure.ts`: `bodyFont: 18px` on `/tv`. Guideline: body ≥ 32 px at 1080p (DESIGN_SYSTEM.md, 10-foot rule).
- **Principle**: 10-foot readability; the design system's own type column.
- **Change**: make the surface column apply at the root instead of on an inner div. In `TvApp`/`ControllerApp` set `document.documentElement.dataset.surface = 'tv' | 'controller'` in a `useEffect` (keep the `data-surface` attribute on the shell div for CSS modules that rely on it), and change the token selector to `html[data-surface='tv'], [data-surface='tv']`. Then `body` inherits 36 px and the `AudioGate` (a sibling of `TvFrame`) gets the TV column too. Also remove the `font-size` override in `PlayerChip.sm` (28 px caption) so `sm < md < lg` holds: `sm` = caption, `md` = body, `lg` = h2.
- **Files**: `packages/client/src/tv/TvApp.tsx`, `controller/ControllerApp.tsx`, `styles/tokens.css`, `packages/game-sdk/src/ui/PlayerChip.module.css`.
- **Effort** S · **Risk** low (phone column unchanged: default tokens) · no server strings.

### R-002 · P1 · Play timer is 72 px and its last-5-seconds state is a corner detail

**Status: applied** (2026-09-15, branch `design`)

- **Where**: core, playing (all phases), TV.
- **Evidence**: `core/quickpoll-answer/tv-stage.png` timer 72 px at (1666,186); `quickpoll/answer-last5/tv-stage.png` ≈ 79 px red; motion frames `quickpoll/motion-last-5s…last-1s`. Guideline: timer ≥ 96 px; "changes character in the last 5 s".
- **Change**: `TvPlaying` → `<Timer size="lg">` (128 px display) and give the strip a fixed right column of 240 px so chips never push it. Add a deadline bar: a 6 px `--pb-accent-2` line across the full strip width whose `transform: scaleX()` tracks `(deadline − now)/(deadline − startedAt)` (transform-only, no per-frame JS: one CSS transition per push, `linear`). Last 5 s: colour `--pb-danger`, `Timer.urgent` scale 1.1 → 1.15 plus a 1 Hz opacity pulse 1 → 0.7 (≤ 3 flashes/s, disabled under reduced motion). Needs `startedAt` in the envelope → `phase.startedAt` is already in state; expose as `view.phaseStartedAt` (**engine/shared change — needs your separate approval**; the bar can ship without it using `deadline − 30 s` as a fallback, but that's a guess).
- **Files**: `packages/client/src/tv/TvPlaying.tsx` + `.module.css`, `packages/game-sdk/src/tv/Timer.tsx` + `.module.css`.
- **Effort** S (size) / M (bar) · **Risk** low · **server-side**: optional `phaseStartedAt` in the view envelope.

### R-003 · P2 · Play-strip chips: 28 px avatars are unrecognisable at 3 m

**Status: applied** (2026-09-15, branch `design`)

- **Where**: core, playing, TV strip.
- **Evidence**: `core/quickpoll-answer-reconnecting/tv-stage.png` avatar box 28×28, glyphs ✓/⟳ 28 px. Lobby chips (77 px avatars) read fine.
- **Change**: `PlayerChip.sm` → `--pb-chip-size: 40px`, name caption 28 px, glyph 32 px; allow the strip to wrap to two rows up to 16 players (`flex-wrap: wrap; max-height: 2 rows`) instead of `overflow: hidden` (which silently drops players 9–16 today).
- **Files**: `packages/game-sdk/src/ui/PlayerChip.module.css`, `tv/PlayerChips.module.css`, `packages/client/src/tv/TvPlaying.module.css`.
- **Effort** S · **Risk** low.

### R-004 · P2 · The VIP marker is a 12–34 px star nobody can see

**Status: applied** (2026-09-15, branch `design`)

- **Where**: core, lobby/selecting/playing TV chips; phone lobby chips.
- **Evidence**: crown measured 33.6 px (lobby lg), 12.6 px (selecting md), 19.6 px (play sm); `core/selecting/tv-stage.png`. Lobby caption says "Waiting for the VIP to pick a game…" without naming them.
- **Change**: replace the overlaid ★ with a small pill inside the chip after the name: `★ VIP` in `--pb-accent-2` at caption size (matches the phone header badge); TV lobby caption → `Waiting for {vipName} to pick a game…` (`t.lobby.waitingFor(name)`); TV lobby with 0 players keeps "Waiting for the first player…" (proper string instead of the `.replace()` hack in `TvLobby.tsx`).
- **Files**: `packages/game-sdk/src/ui/PlayerChip.tsx` + `.module.css`, `packages/client/src/i18n.ts`, `tv/TvLobby.tsx`.
- **Effort** S · **Risk** low.

## Hierarchy

### R-005 · P2 · Results scoreboard overflows and truncates

**Status: applied** (2026-09-15, branch `design`)

- **Where**: core, results, TV.
- **Evidence**: `core/results/tv-stage.png` — 8 rows × 96 px; row 8 clipped at 1080; the "VIP: Play again · New game · Back to lobby" hint off-screen; "Maximili…" truncated in a 500 px column while 60 % of the screen is empty.
- **Change**: `Scoreboard` on the TV: rows at body 36 px (avatar 48 px, padding space-2) → 60 px rows; `columns` grid → single column up to 6 players, `grid-template-columns: repeat(2, 1fr)` from 7 (fills 16 in 8 rows = 480 px); `max-width` removed, name column `min-width: 12ch` + `text-overflow` only past 16 chars. Hero (`display` 128 px) → `h1` 72 px when > 6 players so the board fits. Keep awards to the right only when there are awards.
- **Files**: `packages/game-sdk/src/tv/Scoreboard.tsx` + `.module.css`, `packages/client/src/tv/TvResults.tsx` + `.module.css`.
- **Effort** M · **Risk** low.

### R-006 · P2 · All-tie / early-end results read as nonsense

**Status: applied** (2026-09-15, branch `design`)

- **Where**: core, results, TV + phone.
- **Evidence**: `core/results-after-end/tv-stage.png` — "Bot 1, Kenji, Bot 2, Sam, Priya, Late Luca, Jo, Lena & Maximiliano Vega win!" over three lines, 🏆 on every 0-point row.
- **Change** in `results-rows.ts`: `winnerLine` → 1 name "Kenji wins!", 2 "Kenji & Priya win!", 3+ "Kenji, Priya & 2 others tie!"; if `winnerIds.length === players.length` → "It's a tie!"; if every score is 0 → "Game over" (i18n `results.tie`, `results.over`). `Scoreboard`: trophy only when `rank === 1 && score > 0 && winners < rows`, else the numeric rank.
- **Files**: `packages/client/src/controller/results-rows.ts`, `i18n.ts`, `packages/game-sdk/src/tv/Scoreboard.tsx`.
- **Effort** S · **Risk** low.

### R-007 · P2 · Paused curtain hides the prompt

**Status: applied** (2026-09-15, branch `design`)

- **Where**: core, playing (paused), TV.
- **Evidence**: `core/quickpoll-paused/tv-stage.png` — 85 % curtain, "Paused" overlapping the ghosted prompt.
- **Change**: curtain `rgb(15 16 32 / 55%)` with the prompt still legible; "⏸ Paused" replaces the timer digits in the strip (the `Timer` already shows ⏸) plus a centred `h1` "Paused" with caption "{vip} can resume from the VIP menu"; lower the strip chips' opacity instead of the whole stage.
- **Files**: `packages/client/src/tv/TvPlaying.tsx` + `.module.css`, `i18n.ts`.
- **Effort** S · **Risk** low.

### R-008 · P2 · TV toasts sit in the overscan band and in the middle of the stage

**Status: applied** (2026-09-15, branch `design`)

- **Where**: core, lobby + playing, TV.
- **Evidence**: `core/lobby-6/tv-stage.png`, `core/quickpoll-answer/tv-stage.png` — toasts at y 886–1068 (band starts at 1026), centred, 3 stacked.
- **Change**: `TvFrame .toasts` → `left: var(--pb-overscan-x); bottom: var(--pb-overscan-y); align-items: flex-start`; cap the queue at 2 (`slice(-2)` in `net/tv.ts`), 3 s lifetime; during `playing` drop `*joined*` toasts (the chips already show it).
- **Files**: `packages/client/src/tv/TvFrame.module.css`, `src/net/tv.ts`.
- **Effort** S · **Risk** low.

### R-009 · P2 · Audio gate blocks the QR after every load and uses phone-size text

**Status: applied** (2026-09-15, branch `design`)

- **Where**: core, TV first load and after a server restart (Vite reload).
- **Evidence**: `core/tv-gate/tv-stage.png` (48 px / 18 px; QR dimmed behind), `core/server-restarted/tv-stage.png` (gate again → a TV nobody is next to is stuck). Controls at (1788, 12) 120×56 overlapping the URL.
- **Change**: non-blocking: render the stage normally with a bottom-left pill "🔇 Tap anywhere for sound" (caption 28 px, `--pb-accent-2`) that any click/keydown on the document dismisses; remember `partybox:audio` in `sessionStorage` so a reload does not re-ask (the gesture requirement is re-checked by `audio.enable()` anyway). Move mute/fullscreen into the header row (right of the join block, inside overscan) at 48 px.
- **Files**: `packages/client/src/tv/AudioGate.tsx` + `.module.css`, `TvFrame.tsx`.
- **Effort** M · **Risk** low–medium (autoplay policy: fall back to the pill if `enable()` rejects).

### R-010 · P3 · Compact header: QR + URL + controls crowd the top-right

**Status: applied** (2026-09-15, branch `design`)

- **Where**: core, playing, TV.
- **Evidence**: `core/quickpoll-answer/tv-stage.png` — 120 px QR at y 54 (on the safe line), URL 28 px beside it, controls above.
- **Change**: during play show only the URL (`192.168.4.87:42071`, caption) under the room code on the left; drop the small QR (the lobby has the big one; late joiners are spectators anyway). Frees the right column for the 128 px timer (R-002).
- **Files**: `packages/client/src/tv/TvFrame.tsx` + `.module.css`.
- **Effort** S · **Risk** low.

### R-011 · P3 · Selecting card is a 1728 px-wide box with a 30 em paragraph

**Status: applied** (2026-09-15, branch `design`)

- **Where**: core, selecting, TV.
- **Evidence**: `core/selecting/tv-stage.png` — lower half empty; "Answer time 30" has no unit.
- **Change**: card `max-width: 60vw; margin-inline: auto; text-align: center`; settings list → "Answer time **30 s**" (unit from the spec description is unreliable — add an optional `unit` to `SettingSpec`? that's `shared` → **needs approval**; otherwise render `{value}` bold + description in caption).
- **Files**: `packages/client/src/tv/TvSelecting.tsx` + `.module.css`.
- **Effort** S · **Risk** low.

### R-012 · P3 · Lobby alignment, "room full", duplicate avatars

**Status: applied** (2026-09-15, branch `design`)

- **Where**: core, lobby, TV + join.
- **Evidence**: `core/lobby-6/tv-stage.png` chips centred under a left-aligned heading; `core/lobby-16/tv-stage.png` "16 / 16 players" with the QR still inviting; Sam and Maximiliano share the same cat avatar.
- **Change**: `PlayerChips layout="grid"` `justify-content: flex-start` on the lobby; when `players.length === capacity` the join panel caption becomes "Room full" (`t.lobby.full`) and the QR dims to 40 %; join form preselects the first avatar not used in the room (needs `/api/info` → no; use the room snapshot once joined — only possible after joining, so instead: randomise the default avatar per device to reduce collisions).
- **Files**: `packages/client/src/tv/TvLobby.tsx` + `.module.css`, `controller/Join.tsx`, `i18n.ts`.
- **Effort** S · **Risk** low.

## Feedback & states

### R-013 · P3 · "…" chip glyph during reveal reads as "still typing"

**Status: applied** (2026-09-15, branch `design`)

- **Where**: core, reveal/done phases, TV strip.
- **Evidence**: `core/quickpoll-reveal/tv-stage.png` — "Bot 1 …", "Sam …" while the reveal is running.
- **Change**: `PlayerChip` `waiting` glyph → "–" (en dash, muted) and `aria-label` "did not answer"; keep "…" only for `active` in input phases if a game wants it (games decide status; the glyph is SDK).
- **Files**: `packages/game-sdk/src/ui/PlayerChip.tsx`.
- **Effort** S · **Risk** low.

### R-014 · P1 · Join button sticks on "Joining…" after an error is dismissed

**Status: applied** (2026-09-15, branch `design`)

- **Where**: core, join (name taken / room full / locked), phone.
- **Evidence**: `core/join-name-taken/iphone-joiner.png` then tapping the strip → button "Joining…" disabled forever (`submitting = submittedAt !== null && error === null`). Found while driving the harness; the phone must be reloaded.
- **Change**: clear `submittedAt` when an error arrives (`useEffect` on `state.error`) and on dismiss; show the error inline under the name field in `--pb-danger` text ("That name is taken — try another") instead of the full-width strip, keep the strip for non-join errors; a 6 s safety timeout resets "Joining…" if no welcome/error arrives.
- **Files**: `packages/client/src/controller/Join.tsx` + `.module.css`, `ControllerShell.tsx`.
- **Effort** S · **Risk** low.

### R-015 · P1 · No countdown on the phone during input phases

**Status: applied** (2026-09-15, branch `design`)

- **Where**: game, answer phase, every phone role.
- **Evidence**: `quickpoll/answer/iphone-se-active.png`, `quickpoll/answer-last5/iphone-se-active.png` — identical; nothing tells the player 4 s are left.
- **Change**: `Screen` (SDK) gets an optional `deadline`/`paused` pair; the controller shell passes `view.deadline` down, rendering a 4 px bar under the header (same maths as R-002) plus a right-aligned caption "12 s" from `useSecondsLeft`; danger colour + the `submit` button pulses once at 5 s. Reduced motion: colour only.
- **Files**: `packages/game-sdk/src/controller/Screen.tsx` + `.module.css`, `TextAnswer.tsx`, `ChoiceGrid.tsx`, `VoteList.tsx` (pass-through), `packages/client/src/controller/Playing.tsx`.
- **Effort** M · **Risk** low.

### R-016 · P2 · Phone header breaks on small screens and at 200 % font scale

**Status: applied** (2026-09-15, branch `design`)

- **Where**: core, every phone screen; iPhone SE, font200.
- **Evidence**: `quickpoll/answer/iphone-se-active.png` — dot squashed to 9×12 px overlapping "GQMQ"; `quickpoll/answer/font200-active.png` — name "K…", dot inside the code pill.
- **Change**: `.dot { flex: 0 0 12px }`; `.right { flex-shrink: 0 }`; `.meName` hidden below 360 px (`@container`/media) and `max-width: 9em` otherwise; at ≥ 32 px body (font200) drop the brand text to "PB". Header `min-height` 56 → `max(56px, 2.5em)`.
- **Files**: `packages/client/src/controller/ControllerShell.module.css`, `ControllerShell.tsx`.
- **Effort** S · **Risk** low.

### R-017 · P2 · Phone toasts stack over the primary button

**Status: applied** (2026-09-15, branch `design`)

- **Where**: core, lobby + playing, phone.
- **Evidence**: `core/lobby-6/iphone-vip.png` (4 "joined" toasts touching "Pick a game"), `quickpoll/answer/font200-active.png` (2 toasts over "Submit").
- **Change**: one visible toast (`slice(-1)`), 2.5 s, `bottom: calc(footer height + safe area)` via a CSS var the `Screen` footer sets, and suppress `kind: 'info'` join toasts on phones (they are TV information).
- **Files**: `packages/client/src/net/controller.ts`, `controller/ControllerShell.module.css`, `packages/game-sdk/src/controller/Screen.module.css`.
- **Effort** S · **Risk** low.

### R-018 · P2 · Textarea renders in monospace

**Status: applied** (2026-09-15, branch `design`)

- **Where**: game, answer phase, phone (`TextAnswer`).
- **Evidence**: `quickpoll/answer-submitted/pixel-submitted.png` — "Pineapple" and the placeholder in Courier; measured `textareaFamily: monospace`. The global reset sets `font: inherit` on `button, input, select` only.
- **Change**: add `textarea` to that reset (and `color: inherit`).
- **Files**: `packages/client/src/styles/global.css`.
- **Effort** S · **Risk** none.

### R-019 · P2 · Kicked screen: yellow dot, dead Join button

**Status: applied** (2026-09-15, branch `design`)

- **Where**: core, kicked, phone.
- **Evidence**: `core/kicked/landscape-kicked.png` — "You were removed from the room." + off dot; Join disabled until a reload (socket closed by the server; socket.io does not auto-reconnect after `io server disconnect` — logged in `for-stress.md`).
- **Design change** (once the net fix lands): copy → "The VIP removed you from the room. You can join again." and, while the socket is down, the button reads "Reconnecting…" instead of a silently disabled "Join".
- **Files**: `packages/client/src/i18n.ts`, `controller/Join.tsx`; net fix in `net/controller.ts` (stress session / your call).
- **Effort** S · **Risk** low.

### R-020 · P3 · Submitted state keeps the dead input on screen

**Status: applied** (2026-09-15, branch `design`)

- **Where**: game, answer phase after submit, phone.
- **Evidence**: `quickpoll/answer-submitted/pixel-submitted.png` — greyed textarea, "9 / 24" counter, ✓ Submitted button; the reveal phase then shows the nicer `WaitingScreen`.
- **Change**: `TextAnswer` with `submitted` renders the answer as a card ("You said **Pineapple**") + caption "Waiting for the others — look at the TV", keeps the green ✓ button; same treatment in `ChoiceGrid`/`VoteList` (`selectedId` locked → hint line).
- **Files**: `packages/game-sdk/src/controller/TextAnswer.tsx` + `.module.css`, `ChoiceGrid.tsx`, `VoteList.tsx`.
- **Effort** S · **Risk** low.

### R-021 · P3 · Unsent draft is lost silently at the deadline

**Status: applied** (2026-09-15, branch `design`)

- **Where**: game, answer → reveal, phone.
- **Evidence**: `quickpoll/answer-typed/iphone-se-active.png` ("Supercalifragil" typed) → `quickpoll/reveal/iphone-se-active.png` "You did not answer this time."
- **Change**: `TextAnswer` shows "Time's up — your answer wasn't sent" when it is disabled with a non-empty draft; optionally submit on blur/`enterKeyHint` … (auto-submit on deadline is game logic — not proposed).
- **Files**: `packages/game-sdk/src/controller/TextAnswer.tsx`.
- **Effort** S · **Risk** low.

## Ergonomics

### R-022 · P3 · Landscape join: 4 giant avatar cells, one row visible

**Status: applied** (2026-09-15, branch `design`)

- **Evidence**: `core/join-empty/landscape-active.png`.
- **Change**: `.grid { grid-template-columns: repeat(auto-fill, minmax(72px, 1fr)) }`, cell `min-height: 64px`.
- **Files**: `packages/client/src/controller/Join.module.css`. **Effort** S.

### R-023 · P3 · Results footer takes a quarter of the phone

**Status: applied** (2026-09-15, branch `design`)

- **Evidence**: `core/results/iphone-vip.png` — "Back to lobby" wraps to two lines; the board scrolls under it.
- **Change**: keep "Play again" as the only `PrimaryButton`; "New game · Back to lobby" as two text buttons in one row (like `Selecting`'s "Back").
- **Files**: `packages/client/src/controller/Results.tsx` + `.module.css`. **Effort** S.

### R-024 · P3 · VIP menu: Pause and Resume both shown, Close below the fold, subtle confirm

**Status: applied** (2026-09-15, branch `design`)

- **Evidence**: `quickpoll/vip-menu-playing/iphone-vip.png`, `quickpoll/vip-menu-confirm/iphone-vip.png` ("End game?").
- **Change**: one Pause/Resume button driven by `view.paused` (shell passes `paused`); sheet header row with a ✕ Close (44 px) sticky at the top; confirm state switches the button to `tone="danger"` with "Confirm kick"/"Confirm end" and auto-resets after 4 s.
- **Files**: `packages/client/src/controller/VipMenu.tsx` + `.module.css`, `i18n.ts`. **Effort** M.

### R-025 · P3 · "This is you" uses the "your turn" outline

**Status: applied** (2026-09-15, branch `design`)

- **Evidence**: `core/server-down/iphone-se-active.png` — my chip has the yellow `active` outline in the lobby.
- **Change**: `PlayerChip` gets `isMe` → small "you" tag (caption, muted) instead of the outline; keep `active` for turn/focus.
- **Files**: `packages/game-sdk/src/ui/PlayerChip.tsx` + `.module.css`, `packages/client/src/controller/Lobby.tsx`. **Effort** S.

## Accessibility

### R-026 · P3 · Disabled primary button label contrast 2.7:1

**Status: applied** (2026-09-15, branch `design`)

- **Evidence**: `core/join-empty/iphone-se-active.png` — `--pb-on-accent` on 55 %-opacity accent over bg = 2.73:1; it reads as a tappable dark-pink button.
- **Change**: `.button:disabled { background: var(--pb-surface-2); color: var(--pb-text-muted); opacity: 1 }` (6.95:1) — clearly "not yet".
- **Files**: `packages/game-sdk/src/controller/PrimaryButton.module.css`. **Effort** S.

### R-027 · P3 · Reduced motion does not reach JS-driven sequences

**Status: applied** (2026-09-15, branch `design`)

- **Evidence**: `Reveal` steps items every 700 ms regardless of `prefers-reduced-motion`; `Timer.urgent` still scales.
- **Change**: a tiny `usePrefersReducedMotion()` in `ui/`; `Reveal` uses `stepMs = 0` when true; `Timer` keeps the colour change, drops the scale/pulse.
- **Files**: `packages/game-sdk/src/tv/Reveal.tsx`, `tv/Timer.tsx`, `ui/motion.ts` (new). **Effort** S.

## Copy

### R-028 · P3 · Server-restart recovery has no explanation

**Status: applied** (2026-09-15, branch `design`)

- **Evidence**: `core/server-restarted/iphone-vip.png` — join form, name prefilled, nothing said; `core/server-down/tv-stage.png` — "Connecting…" 28 px in the header while a stale lobby + QR stay lit.
- **Change**: phone: when the stored session is rejected show the hint "The party restarted — tap Join to get back in." (`t.join.restarted`); TV: after 3 s disconnected, dim the stage to 50 % and centre an h2 "Lost the PartyBox server — reconnecting…".
- **Files**: `packages/client/src/net/controller.ts` (flag only), `controller/Join.tsx`, `tv/TvFrame.tsx` + `.module.css`, `i18n.ts`. **Effort** S.

## Consistency / design-system bypasses noticed

- `PlayerChip.sm` hard-codes `--pb-chip-size: 28px` and the font-size inversion (R-001/R-003).
- `AudioGate.control` hard-codes `56px`/`28px`; `TvFrame .qr` 120 px; `WaitingScreen .glyph` 96/48 px; `Join .avatarButton` 72 px; `ChoiceGrid .letter` 36 px — fine values, but they should be tokens (`--pb-icon-lg` …) so the 200 % scale can move them.
- `TvLobby.tsx` builds the empty-lobby string with `.replace()` on another string (R-004).
- Chip order on the TV strip differs from join order (`Priya, Bot 3, Sam, Bot 2, Bot 1` in the motion frames) — engine/host ordering, logged for stress.

## Not reproducible headless (needs a real device before closing)

- iOS keyboard vs the sticky footer (research.md); 200 % font scale here is CSS-emulated.
- The phone "Reconnecting…" banner on a flaky Wi-Fi (Playwright `setOffline` does not cut an open socket; captured via server kill instead: `core/server-down/*`).

---

## Applied — 2026-09-15

All 28 items were applied on branch `design` (one commit per item, `pnpm verify` green each time;
R-005 got a size follow-up, R-008/R-017 a regex fix). Re-capture: `after/contact-sheet.html`
(same 79 stills as the first pass). Before → after pairs worth opening side by side:

| Item                                    | Before                                           | After                                                  |
| --------------------------------------- | ------------------------------------------------ | ------------------------------------------------------ |
| R-001/R-004 TV inherited text, VIP pill | `core/selecting/tv-stage.png`                    | `after/core/selecting/tv-stage.png`                    |
| R-002/R-003/R-010 timer, strip, header  | `core/quickpoll-answer-1-submitted/tv-stage.png` | `after/core/quickpoll-answer-1-submitted/tv-stage.png` |
| R-002 last 5 s                          | `quickpoll/answer-last5/tv-stage.png`            | `after/quickpoll/answer-last5/tv-stage.png`            |
| R-005 dense board                       | `core/results/tv-stage.png`                      | `after/core/results/tv-stage.png`                      |
| R-006 early end                         | `core/results-after-end/tv-stage.png`            | `after/core/results-after-end/tv-stage.png`            |
| R-007 paused                            | `core/quickpoll-paused/tv-stage.png`             | `after/core/quickpoll-paused/tv-stage.png`             |
| R-008/R-012 lobby toasts, alignment     | `core/lobby-6/tv-stage.png`                      | `after/core/lobby-6/tv-stage.png`                      |
| R-009 audio gate                        | `core/tv-gate/tv-stage.png`                      | `after/core/tv-gate/tv-stage.png`                      |
| R-014 join error                        | `core/join-name-taken/iphone-joiner.png`         | `after/core/join-name-taken/iphone-joiner.png`         |
| R-015/R-016/R-017/R-018 phone play      | `quickpoll/answer/iphone-se-active.png`          | `after/quickpoll/answer/iphone-se-active.png`          |
| R-020 submitted                         | `quickpoll/answer-submitted/pixel-submitted.png` | `after/quickpoll/answer-submitted/pixel-submitted.png` |
| R-022 landscape join                    | `core/join-empty/landscape-active.png`           | `after/core/join-empty/landscape-active.png`           |
| R-023 results footer                    | `core/results/iphone-vip.png`                    | `after/core/results/iphone-vip.png`                    |
| R-024 VIP menu                          | `quickpoll/vip-menu-confirm/iphone-vip.png`      | `after/quickpoll/vip-menu-confirm/iphone-vip.png`      |
| R-028 server down                       | `core/server-down/tv-stage.png`                  | `after/core/server-down/tv-stage.png`                  |

Notes for the owner:

- R-002's bar takes the phase start from when the client first sees a `phaseId` + `deadline`; a
  `phaseStartedAt` field in the view envelope would make it exact for late joiners (engine/shared —
  your call).
- R-019 includes a one-line net fix (`socket.connect()` after an `io server disconnect`) in
  `packages/client/src/net/controller.ts` — tell the stress session so it is not fixed twice.
- The join-toast filters (R-008, R-017) match the engine's "<name> joined" text because toast payloads
  carry no category; a `category` on `ToastPayload` would be cleaner (shared — your call).
- Not verifiable headless: the iOS keyboard vs the sticky footer, and a real 200 % OS text size.
