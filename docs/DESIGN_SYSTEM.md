# Design system

Source of truth for tokens: `packages/client/src/styles/tokens.css` (CSS custom properties, prefix `--pb-`).
Primitives: `packages/game-sdk/src/tv/*` and `packages/game-sdk/src/controller/*`. Core screens compose the
same primitives. Games must not hard-code colours, sizes or durations — use the tokens.

## Principles

1. **10-foot first on the TV**: designed at 1920×1080 CSS px, viewed from ~3 m. Body ≥ 32 px, timers ≥ 96 px, one focal point. `packages/client/src/tv/fit.ts` zooms `<html>` so the design fits any viewport (a PC at 150 % scaling reports 1280×720, a 4K TV browser 3840×2160) — TV styles use px and %, never `vw`/`vh` (viewport units ignore the zoom).
2. **Thumb first on the phone**: portrait, primary action in the bottom third, targets ≥ 44 px.
3. **Never colour alone**: every state also has a shape, icon or word (chips show ✓ for submitted, ⟳ for reconnecting, a `🤖 bot` tag for bot seats).
4. **Calm feedback**: reconnecting is a quiet banner, not a red alarm. Errors say what to do next.
5. **The TV reveals, the phone never spoils**: controller views hide what the stage hasn't shown yet.

## Colour tokens (dark stage, fixed — TVs are in dim rooms; phones follow the same palette)

| Token                             | Value                                                             | Use                                           |
| --------------------------------- | ----------------------------------------------------------------- | --------------------------------------------- |
| `--pb-bg`                         | `#0f1020`                                                         | page background                               |
| `--pb-surface` / `--pb-surface-2` | `#1c1e3a` / `#272a52`                                             | cards, panels                                 |
| `--pb-text` / `--pb-text-muted`   | `#f5f6ff` / `#b3b7d9`                                             | text (contrast ≥ 12:1 / 7:1 on bg)            |
| `--pb-accent`                     | `#ff5d8f`                                                         | primary actions, current phase                |
| `--pb-accent-2`                   | `#ffd166`                                                         | timers, highlights, focus ring                |
| `--pb-accent-3`                   | `#06d6a0`                                                         | success, submitted                            |
| `--pb-danger`                     | `#ef476f`                                                         | destructive VIP actions, last-5-seconds timer |
| `--pb-info`                       | `#4cc9f0`                                                         | informational toasts                          |
| `--pb-player-1…8`                 | `#ff5d8f #ffd166 #06d6a0 #4cc9f0 #b388ff #ff9f43 #48dbfb #f368e0` | per-player chip hues (avatar id % 8)          |

## Themes

Five palettes re-declare the colour tokens (`tokens.css` → `[data-theme='…']`): `night` (default), `daylight` (light, `color-scheme: light`), `arcade`, `cabin`, `contrast`. The choice is per device (`localStorage`, `src/theme.ts`), picked from the TV corner 🎨 or the phone header 🎨; `?theme=<id>` forces one for previews and screenshots. Rules for a new theme: text ≥ 4.5:1 on `bg`/`surface`, `on-accent` ≥ 4.5:1 on every accent, `accent-2` readable as text on `surface` (light themes use a dark amber), player colours untouched.

## Type scale

| Role                         | TV (1080p) | Phone | Token               |
| ---------------------------- | ---------- | ----- | ------------------- |
| display (timer, big numbers) | 128 px     | 48 px | `--pb-font-display` |
| h1                           | 72 px      | 28 px | `--pb-font-h1`      |
| h2                           | 48 px      | 22 px | `--pb-font-h2`      |
| body                         | 36 px      | 18 px | `--pb-font-body`    |
| caption                      | 28 px      | 14 px | `--pb-font-caption` |
| button                       | —          | 20 px | `--pb-font-button`  |

Font: Nunito Variable (OFL, bundled via `@fontsource-variable/nunito`, weights 200–1000) with a
system-UI fallback stack (`--pb-font-family`); bold weights for display/h1. Line height 1.2 display, 1.4 body.
The TV shell sets the TV column; the controller shell sets the phone column; tokens switch by shell, not by media query.

## Spacing, shape, layout

- Spacing scale `--pb-space-1…8` = 4, 8, 12, 16, 24, 32, 48, 64 px. Radius `--pb-radius` 12 px, `--pb-radius-lg` 24 px.
- TV overscan: the stage pads `--pb-overscan-y --pb-overscan-x` (54 px 96 px = 5 % of 1920×1080); nothing important touches the edge.
- Phone: `env(safe-area-inset-*)` padding, `100dvh` layouts, `overscroll-behavior: none` in game views,
  the submit button lives in a sticky bottom bar so the iOS keyboard never hides it.
- Touch targets ≥ 44 × 44 px (`--pb-touch` = 44 px), ≥ 8 px apart.

## Motion

| Token               | Value                            | Use                                   |
| ------------------- | -------------------------------- | ------------------------------------- |
| `--pb-motion-fast`  | 150 ms                           | hover/press feedback, chip state      |
| `--pb-motion-base`  | 300 ms                           | phase transitions (fade + 12 px rise) |
| `--pb-motion-slow`  | 600 ms                           | reveal / winner — the maximum allowed |
| `--pb-motion-pulse` | 1000 ms                          | urgent-timer beat (≤ 1 flash/s)       |
| easing              | `cubic-bezier(0.2, 0.8, 0.2, 1)` | everything                            |

`prefers-reduced-motion: reduce` sets every duration to 0. Transitions never hide information (no full-screen wipes).
Timer: in the last 5 s it switches to `--pb-danger`, scales 1.15×, pulses once per second (`--pb-motion-pulse`, 0 under reduced motion) and ticks (sound `countdown`).

## Sound cues (Web Audio, synthesized — no files)

| Cue         | Moment                         | Where triggered                |
| ----------- | ------------------------------ | ------------------------------ |
| `join`      | a player joins the lobby       | TV shell                       |
| `phase`     | phase changes                  | TV shell                       |
| `countdown` | each of the last 5 seconds     | TV shell (Timer)               |
| `reveal`    | an answer / result is revealed | game via `clientModule.sounds` |
| `win`       | results screen winner          | TV shell                       |
| `submit`    | own input accepted             | controller shell               |
| `error`     | rejected input / error toast   | controller shell               |

TV has a mute toggle (persisted in `localStorage`) and a "tap to start" overlay for the autoplay policy.

## Primitives

TV (`@partybox/game-sdk` → `tv/`): `Timer`, `PlayerChips`, `Scoreboard`, `Reveal`, `Stage` (overscan frame), `BigText`.
Shared (`ui/`): `DeadlineBar` (draining bar, danger in the last 5 s — the TV strip and the phone header both use it), `usePrefersReducedMotion` (for JS-driven sequences).
Controller (`controller/`): `TextAnswer`, `ChoiceGrid`, `VoteList`, `WaitingScreen`, `Screen` (safe-area frame), `PrimaryButton`.
Shared: `Avatar`, `Chip`. Each primitive's props are documented in its file header.

## Performance budget

`/tv` stays smooth in Chromium at 4× CPU throttling: no box-shadows on animated elements, no blur filters,
animate `transform`/`opacity` only, ≤ 60 DOM nodes per player chip list, no per-frame JS.

Filled in during Phase 2 (tokens + core screens) and Phase 8 (polish pass).
