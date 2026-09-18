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

| Token                             | Value                                                                                  | Use                                                |
| --------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `--pb-bg`                         | `#0f1020`                                                                              | page background                                    |
| `--pb-surface` / `--pb-surface-2` | `#1c1e3a` / `#272a52`                                                                  | cards, panels                                      |
| `--pb-text` / `--pb-text-muted`   | `#f5f6ff` / `#b3b7d9`                                                                  | text (contrast ≥ 12:1 / 7:1 on bg)                 |
| `--pb-accent`                     | `#ff5d8f`                                                                              | primary actions, current phase                     |
| `--pb-accent-2`                   | `#ffd166`                                                                              | timers, highlights, focus ring                     |
| `--pb-accent-3`                   | `#06d6a0`                                                                              | success, submitted                                 |
| `--pb-danger`                     | `#ef476f`                                                                              | destructive VIP actions, last-5-seconds timer      |
| `--pb-info`                       | `#4cc9f0`                                                                              | informational toasts                               |
| `--pb-scrim`                      | `rgb(15 16 32 / 62%)` (per theme: the theme's ink, 45 % in Daylight, 78 % in Contrast) | the veil behind the pause curtain and phone sheets |
| `--pb-player-1…8`                 | `#ff5d8f #ffd166 #06d6a0 #4cc9f0 #b388ff #ff9f43 #48dbfb #f368e0`                      | per-player chip hues (avatar id % 8)               |

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
- Keyframes live in `global.css` (`pb-rise`, `pb-pop`, `pb-shake`, `pb-confetti`); a CSS module must reference them as `animation: global(pb-rise) …` — CSS Modules localise bare animation names, so `animation: pb-rise` silently never runs (every module did this until 2026-09-15).
- TV chrome (`TvFrame`): 🏠 + brand top-left is Home — first click arms ("Click again to start over", danger colour, 4 s), second resets the room via the dev API; the corner controls (🎨 🔊 ⛶) sit top-right.
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
Keyframes in global.css: `pb-rise`, `pb-pop`, `pb-shake`, `pb-fade-in` / `pb-fade-out` (the pause curtain and the
server-lost dim arrive and leave over `--pb-motion-base`), `pb-spin` (a reconnecting ⟳; only under no-preference),
`pb-confetti`, `pb-land` (a card replacing a card: a bounce from half opacity, never from transparent, so a stage never blinks empty between two), `pb-deal` (a card dealt onto a table: up from below with a small tilt that settles), `pb-flip` (a card turned face-up in 3D — transform only: animating opacity alongside it flattens Chromium's 3D context and shows the face mirrored), `pb-crown` (a winning card lifts off the table with a warm bloom). PlayerChip reserves its glyph slot, so a ✓ landing pops in place and never shifts the row.
Phone: every `Screen` rises on mount (`pb-rise`, `--pb-motion-base`, fill backwards); a game keys its Screen or grid
when a phase should read as a new screen, and never keys the Controller itself (game-local state would reset).
TV status swaps (lobby / selecting / playing / results) are keyed and rise (`pb-rise`, fill backwards); a game chunk that
takes > 150 ms shows a centred "<game> — Getting the game ready…" card, never a stray glyph.
Timer: in the last 5 s it switches to `--pb-danger`, scales 1.15×, pulses once per second (`--pb-motion-pulse`, 0 under reduced motion) and ticks (sound `countdown`).

## Sound cues (Web Audio, synthesized — no files)

| Cue                       | Moment                                                                                                           | Where triggered                                                                |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `ready`                   | sound enabled / unmuted                                                                                          | TV shell (AudioGate)                                                           |
| `join`                    | a player joins the lobby                                                                                         | TV shell — each join steps up a scale (`joinSemitones`, wraps at 5)            |
| `start`                   | a game begins (selecting → playing)                                                                              | TV shell                                                                       |
| `phase`                   | phase changes                                                                                                    | TV shell                                                                       |
| `countdown`               | each of the last 5 seconds                                                                                       | TV shell (Timer) — pitched up per second (`countdownSemitones`: 880 → 1319 Hz) |
| `reveal`                  | an answer / result is revealed                                                                                   | TV shell via `clientModule.sounds[phaseId]`                                    |
| `card`                    | one card read out (Blanks): a soft two-note pluck that can repeat every few seconds                              | TV shell via `clientModule.sounds` (Blanks reveal)                             |
| `wager`                   | the final-question wager opens                                                                                   | TV shell via `clientModule.sounds` (Lightning)                                 |
| `tally`                   | a scores / leaderboard phase                                                                                     | TV shell via `clientModule.sounds` (Wisecrack)                                 |
| `win`                     | results screen winner                                                                                            | TV shell                                                                       |
| `pause`                   | the VIP / host pauses (resume plays `phase`)                                                                     | TV shell                                                                       |
| `leave`                   | a player is kicked, leaves, or a bot is removed (one per snapshot, ≥ 300 ms apart)                               | TV shell                                                                       |
| `lock`                    | a player locks in (one soft tick per push, whole tones rising with the count, `quiet`: never suppresses `phase`) | TV shell                                                                       |
|  controller shell (phone) |
| `error`                   | rejected input / error toast                                                                                     | controller shell (phone)                                                       |
| `daub`                    | a square daubed on a phone: a dauber landing (with a buzz)                                                       | game via `useSound` (phone)                                                    |
| `claim`                   | BINGO! sent from a phone: a rising "sent!" (with a long buzz)                                                    | game via `useSound` (phone)                                                    |
| `correct`                 | the phone's own verdict card                                                                                     | game via `useSound` (phone)                                                    |

`play(cue, { semitones, quiet })` transposes a cue (the engine multiplies every note by 2^(n/12)); `quiet` leaves
`lastPlayedAt` alone so the cue never suppresses the shell's next chime.
`clientModule.sounds` maps phase ids to cues; unmapped phases play `phase`, reserved for moments where the phone needs
the player (so 'pick up your phone' and 'look at the TV' never sound the same). A mapped phase that re-enters itself
(a new deadline with the same id — Blanks reads one card per instance) chimes again; unmapped ones and pauses do not.
`silence` is a valid cue for a phase the game cues itself later; `cheer` (results, a bingo) is the one sampled cue — a
party horn + crowd from `packages/client/public/sfx/` (Mixkit licence).
TV has a mute toggle (persisted in `localStorage`) and a "tap to start" overlay for the autoplay policy.

**Music beds** (ADR-032, `packages/client/src/beds.ts`): looping backgrounds synthesized like the cues, one per phase via
`clientModule.beds[phaseId]` — `warm` (e-piano groove), `bossa`, `latenight` (held chords, no drums), `marimba` (16th-note
pulse), `lofi` (swung dusty beat, soft kick + brushed snare) and `lounge` (vibraphone swing with a
walking bass). The voices they are built from live in `beds-voices.ts`. The shell crossfades beds over 1.5 s as phases change, resumes a returning bed where it stopped, holds it on pause,
ducks it to half under every cue for a second, and mutes it with the TV. Unmapped phases and the results screen are silent.
The phone has its own engine (`createSoundEngine({ master: 0.35 })`, mute under `partybox:phone-sound`, default on,
toggled from the theme sheet) that plays only what happened in the player's hand — never `phase`, `join`, `win` or
`countdown`, which are the TV's. `useSound()` inside a game's Controller reaches it; the shell skips `submit` when a
game cued something in the same 50 ms.

## Haptics (phone, `buzz()` from `@partybox/game-sdk/ui`)

| Moment                                      | Pattern (ms on/off)  | Where triggered   |
| ------------------------------------------- | -------------------- | ----------------- |
| own input accepted (`submitted`)            | 20                   | controller shell  |
| rejected input / join error                 | 40-60-40             | controller shell  |
| a new prompt needs me (`active`, not quiet) | 30-50-30             | controller shell  |
| results: I won / everyone else              | 60-60-60-60-160 / 40 | controller shell  |
| verdict card: correct / wrong               | 30-40-30 / 120       | game (Controller) |

Toggle `partybox:haptics` (default on, theme sheet); not gated on `prefers-reduced-motion` (a 20 ms buzz is not
animation and is the most accessible non-visual confirmation). iOS Safari has no `navigator.vibrate`; Android Chrome
drops calls until the page has had a user activation, so a resumed session's first buzz may be lost — acceptable.

## Primitives

TV (`@partybox/game-sdk` → `tv/`): `Timer`, `PlayerChips`, `Scoreboard`, `Reveal`, `Stage` (overscan frame), `BigText`.
Shared (`ui/`): `DeadlineBar` (draining bar; danger in the last 5 s only when the phase lasts ≥ 15 s — a 6 s bingo call just drains — the TV strip and the phone header both use it), `usePrefersReducedMotion` (for JS-driven sequences).
Controller (`controller/`): `TextAnswer`, `ChoiceGrid`, `VoteList` (with a sticky `header` slot for what is being voted on), `WaitingScreen`, `Screen` (safe-area frame), `PrimaryButton`.
Shared: `Avatar`, `Chip`. Each primitive's props are documented in its file header.

## Performance budget

`/tv` stays smooth in Chromium at 4× CPU throttling: no box-shadows on animated elements, no blur filters,
animate `transform`/`opacity` only, ≤ 60 DOM nodes per player chip list, no per-frame JS.

Filled in during Phase 2 (tokens + core screens) and Phase 8 (polish pass).
