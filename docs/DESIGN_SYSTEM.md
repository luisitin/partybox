# Design system

Source of truth for tokens: `packages/client/src/styles/tokens.css` (CSS custom properties, prefix `--pb-`).
Primitives: `packages/game-sdk/src/tv/*` and `packages/game-sdk/src/controller/*`. Core screens compose the
same primitives. Games must not hard-code colours, sizes or durations — use the tokens.

## Principles

1. **10-foot first on the TV**: designed at 1920×1080 CSS px, viewed from ~3 m. Body ≥ 32 px, timers ≥ 96 px, one focal point. `packages/client/src/tv/fit.ts` zooms `<html>` so the design fits any viewport (a PC at 150 % scaling reports 1280×720, a 4K TV browser 3840×2160) — TV styles use px and %, never `vw`/`vh` (viewport units ignore the zoom).
2. **Thumb first on the phone**: portrait, primary action in the bottom third, targets ≥ 44 px.
3. **Never colour alone**: every state also has a shape, icon or word (chips show ✓ for submitted, ⟳ for reconnecting, a `🤖 bot` tag for bot seats).
4. **Calm feedback**: reconnecting is calm, not a red alarm — on a phone the game dims and goes untappable under one card (seat held for m:ss, whether your answer was sent), and the return is one "You're back" beat naming where the game is now (the envelope's optional `progressStep`), with no screen dissolve while the card is up (I-791 D). Errors say what to do next.
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

Five palettes re-declare the colour tokens (`tokens.css` → `[data-theme='…']`): `night` (default), `daylight` (light, `color-scheme: light`), `arcade`, `cabin`, `contrast`. The choice is per device (`localStorage`, `src/theme.ts`), picked from the TV corner 🎨 or, on the phone, the join page's 🎨 and after joining your own face in the header (I-666: the header is PB · room code — a button that opens Share — · a link dot only while not connected · ★ VIP · face + name); `?theme=<id>` forces one for previews and screenshots. The same sheet's footer holds the phone's own choices: sound, vibration, and (I-021) Broken Pencil's drawing paper (ruled / plain) and pencil (pencil / pen) — `getPadStyle` / `setPadStyle` / `usePadStyle` in the game-sdk, per device, never over the wire. Rules for a new theme: text ≥ 4.5:1 on `bg`/`surface`, `on-accent` ≥ 4.5:1 on every accent, `accent-2` readable as text on `surface` (light themes use a dark amber), player colours untouched.

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
The TV shell sets the TV column; the controller shell sets the phone column; tokens switch by shell, not by media query. The phone column is declared in rem (1.125rem = 18 px at a 16 px root, I-100 C), so a phone's larger-text setting scales the words; the TV column stays px.

## Spacing, shape, layout

- Spacing scale `--pb-space-1…8` = 4, 8, 12, 16, 24, 32, 48, 64 px. Radius `--pb-radius` 12 px, `--pb-radius-lg` 24 px.
- TV overscan: the stage pads `--pb-overscan-y --pb-overscan-x` (54 px 96 px = 5 % of 1920×1080); nothing important touches the edge.
- Keyframes live in `global.css` (`pb-rise`, `pb-pop`, `pb-shake`, `pb-confetti`); a CSS module must reference them as `animation: global(pb-rise) …` — CSS Modules localise bare animation names, so `animation: pb-rise` silently never runs (every module did this until 2026-09-15).
- TV chrome (`TvFrame`): 🏠 + brand top-left is Home — first click arms ("Click again to start over", danger colour, 4 s), second resets the room via the dev API. For 10 minutes the retired code leads to the new room, so the phones that came in by the QR rejoin by themselves (I-658 A); each phone's address then carries the new code and the TV fetches its new QR at once (I-658 B). The corner controls (🎨 🔊 ⛶) sit top-right.
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
Motion has two off switches that behave the same: the OS's `prefers-reduced-motion` and an
in-app choice (`<html data-motion="off">`, `setMotionOff` / `useMotionOff` in the game-sdk, stored
per device; Bingo's card-style sheet has the row). Both collapse the `--pb-motion-*` tokens, and
`usePrefersReducedMotion()` reports either, so JS-driven motion follows. A CSS module's
`@media (prefers-reduced-motion: reduce)` block needs a `:global(:root[data-motion='off'])` twin.
Keyframes in global.css: `pb-rise`, `pb-pop`, `pb-tick` (a keyed change that must never blank a frame — a countdown digit — squeezes from 1.3× and is visible from its first frame), `pb-shake`, `pb-fade-in` / `pb-fade-out` (the
server-lost dim arrives and leaves over `--pb-motion-base`), `pb-spin` (a reconnecting ⟳; only under no-preference),
`pb-confetti`, `pb-land` (a card replacing a card: a bounce from half opacity, never from transparent, so a stage never blinks empty between two), `pb-deal` (a card dealt onto a table: up from below with a small tilt that settles), `pb-flip` (a card turned face-up in 3D — transform only: animating opacity alongside it flattens Chromium's 3D context and shows the face mirrored), `pb-crown` (a winning card lifts off the table with a warm bloom). PlayerChip reserves its glyph slot, so a ✓ landing pops in place and never shifts the row.
Phone: every `Screen` rises on mount (`pb-rise`, `--pb-motion-base`, fill backwards); a game keys its Screen or grid
when a phase should read as a new screen, and never keys the Controller itself (game-local state would reset).
TV status swaps (lobby / selecting / playing / results) are keyed and rise (`pb-rise`, fill backwards); a game chunk that
takes > 150 ms shows a centred "<game> — Getting the game ready…" card, never a stray glyph.
`ChoiceGrid` takes a `className` for its Screen (I-026), so a game can style a state of the grid — Lightning's placed
wager steps the other rows back to 60 % and bumps the chosen row's chips.
A `fill` ChoiceGrid (I-789 B) shares the height left under the question: tiles 66 px, down to their content on a short
phone; four short answers go two by two (one column at 200 % text, by container query); sideways the question sits left
of the answers; the "Locked in" line's space is held from the first frame, so a tap moves nothing.
The pause curtain (I-030, every game): the scrim drops from the top edge over `--pb-motion-slow` (transform only) and
lifts back on resume; the Paused card lands (`pb-land`) once it is down; behind it the stage scales to 0.96 and the chip
strip dims to 60 % (`.held`), and as the curtain lifts the stage lands back to full (`.resumed`, `pb-land`) on the
shell's `phase` chime.
Results (I-025, `TvResults`, every game): one clear winner — `winnerIds.length === 1`, someone scored, the game keeps
score — gets their face (72 px) beside the line and the hero takes `pb-crown` instead of `pb-enter`; confetti falls
behind it (48 pieces, 16 for a bot); the board or finale under it holds 55 % opacity for a beat and returns over two
`--pb-motion-slow` beats (1.2 s) so the name reads first. A tie or a scoreless game keeps the plain rising line.
A game may name what the VIP's Skip / Next does in the current phase with the optional `ViewEnvelope.vipSkipLabel` (English, translated through the game's strings): the TV's host bar and the ★ menu show it instead of "Skip / Next" (I-774 B, Blanks' reading: "Next card (3 of 5)", "Open the vote").
On the phone's results (I-155, `controller/Results`) an award you won reads "Your …" in `--pb-accent` and sorts first; a game may add the optional `GameResults.perRoundVotes` and the phone prints your row as a muted tabular "your votes: 2 · 0 · 3" under the awards.
Bingo's daub (loop 238) lands as a stamp; on the phone the ink then stays as an irregular blot in the player's own colour (`--pb-daub` = the roster's `--pb-player-N`; the TV and every verdict card keep the flat daub), and the tap that completes a line bumps its five cells in order (`pb-bump`, 60 ms apart — I-010).
The theme sheet (I-035): a tap recolours the page behind it and moves the ✓ but leaves the sheet up (Done closes it;
the compact menu still closes itself); each row's swatch is a tiny screen — header strip, body, accent button, gold chip
— in that theme's colours; the sheet's surface, rows, title and buttons fade to the new colours over `--pb-motion-base`.
Photo avatars (I-031, ADR-037): the join form's portrait — the picked face at 64 px beside the name field (I-793 F),
popping on each pick while the strip's other faces step back to 80 % — is itself "Use a photo" (📷 in its corner, ✕ with
a photo up): the phone's own camera / gallery sheet, a
128 × 128 JPEG made on the phone, shown at once and sent with the join. `Avatar` renders a `photo:<id>` avatar id as a
circular `<img>` (object-fit cover) from the shell's `AvatarPhotos` context, the face otherwise; `dim` still applies.
The lobby (I-029): a fresh chip walks in from the QR's side as it pops (`pb-chip-walk`, `--pb-motion-base`) and wears a
gold welcome ring that fades over `--pb-motion-pulse` once landed; two soft radial glows in the accents drift behind the
stage (14 s / 17 s loops at 18 %, transform only — still under reduced motion). The walk is the `enter` chips' entrance
wherever `PlayerChips` uses it (the lobby, the game select).
The empty lobby (I-682): the QR card lies on its side — a 520 px code left, "Scan to join", the address and the room code right — so it fits above the host bar on any 16:9 stage; the first join stands it back up with the shrink (scale 1.44 = 520 / 360). The host bar offers no "Pick a game" until a person (not a bot) is in.

The VIP's phone gone in the lobby (I-663 A, `vipAway.ts`): the TV's lobby line says "Sam's phone dropped — waiting for them to come back" in `--pb-accent-2`; the host bar's VIP-away countdown shows only mid-game, where the handover is real (the lobby hands nothing over, I-347).
`PlayerChip` (I-009): a link dropping on a mounted chip flickers it out (opacity steps over `--pb-motion-slow`) to a 0.6 ghost; the return pops it back with a green ring fading over `--pb-motion-pulse` (never on a screen swap; the ring skips an `.active` chip). The phone's "Reconnecting…" breathes (`pb-breathe`).
`TextAnswer` (I-001): under the shell's `data-urgent` the textarea takes the danger border and the once-a-second beat like the primary button (border alone under reduced motion); the "n / max" counter remounts on every keystroke and bumps once (`pb-bump`, `--pb-motion-fast`); a field left empty 3 s breathes (`pb-breathe`, absent under reduced motion) until a character lands — urgency outranks it.
Timer: in the last 5 s it switches to `--pb-danger`, scales 1.15×, pulses once per second (`--pb-motion-pulse`, 0 under reduced motion) and ticks (sound `countdown`).
The results headline (`winnerLine`, I-153) names people before bots: tied with people, bots fold into "& the bots" ("Priya, Sam & the bots tie!", B), a tie of bots alone reads "The bots tie — nobody home?" (C), and a lone bot winner keeps its name.

## Sound cues (Web Audio, synthesized — no files)

| Cue                       | Moment                                                                                                                                                                                                    | Where triggered                                                                |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `ready`                   | sound enabled / unmuted                                                                                                                                                                                   | TV shell (AudioGate)                                                           |
| `join`                    | a player joins the lobby; a dropped link coming back (TV, and the phone itself with a 30 ms buzz — I-009)                                                                                                 | TV shell — each join steps up a scale (`joinSemitones`, wraps at 5)            |
| `start`                   | a game begins (selecting → playing)                                                                                                                                                                       | TV shell                                                                       |
| `phase`                   | phase changes                                                                                                                                                                                             | TV shell                                                                       |
| `countdown`               | each of the last 5 seconds                                                                                                                                                                                | TV shell (Timer) — pitched up per second (`countdownSemitones`: 880 → 1319 Hz) |
| `reveal`                  | an answer / result is revealed                                                                                                                                                                            | TV shell via `clientModule.sounds[phaseId]`                                    |
| `card`                    | one card read out (Blanks): a soft two-note pluck that can repeat every few seconds; Bingo's deal, one per card on the TV and every phone (loop 278)                                                      | TV shell via `clientModule.sounds` (Blanks reveal)                             |
| `wager`                   | the final-question wager opens                                                                                                                                                                            | TV shell via `clientModule.sounds` (Lightning)                                 |
| `tally`                   | a scores / leaderboard phase                                                                                                                                                                              | TV shell via `clientModule.sounds` (Wisecrack)                                 |
| `win`                     | results screen winner                                                                                                                                                                                     | TV shell                                                                       |
| `tie`                     | results screen with several winners (I-037): the win arpeggio landing on a held Csus4, crowd under it, no horn                                                                                            | TV shell                                                                       |
| `pause`                   | the VIP / host pauses (resume plays `phase`; a Bingo resume mid-call rings its 3 · 2 · 1 `tick`s instead — I-030)                                                                                         | TV shell                                                                       |
| `leave`                   | a player is kicked, leaves, or a bot is removed, or a player's link drops mid-room (one per snapshot, ≥ 300 ms apart; I-009)                                                                              | TV shell                                                                       |
| `lock`                    | a player locks in (one soft tick per push, whole tones rising with the count, `quiet`: never suppresses `phase`); quiet in a phase the game lists in `ownLocks` (I-020: Blanks' `card` as the card lands) | TV shell                                                                       |
| (room full / seat freed)  | I-054: the TV plays `close` 500 ms after the join that fills the room and `ready` 350 ms after the leave that frees a seat, with a toast it raises for itself                                             | TV shell                                                                       |
|  controller shell (phone) |
| `error`                   | rejected input / error toast                                                                                                                                                                              | controller shell (phone)                                                       |
| `daub`                    | a square daubed on a phone: a dauber landing (with a buzz)                                                                                                                                                | game via `useSound` (phone)                                                    |
| `claim`                   | BINGO! sent from a phone: a rising "sent!" (with a long buzz)                                                                                                                                             | game via `useSound` (phone)                                                    |
| `dibs`                    | someone tapped BINGO! once (the 3 s window): a soft rising "hm?" on the TV                                                                                                                                | game via `useSound` (TV)                                                       |
| `close`                   | one square to go on a phone: a hushed rising "ooh" and a soft buzz, once per card per round; the squares that would win breathe                                                                           | game via `useSound` (phone)                                                    |
| `correct`                 | the phone's own verdict card                                                                                                                                                                              | game via `useSound` (phone)                                                    |
| `submit`                  | a player's own choice sent — a Blanks card, Bingo's "keep going / next round" pick (loop 322)                                                                                                             | game via `useSound` (phone)                                                    |

`play(cue, { semitones, quiet, gain })` transposes a cue (the engine multiplies every note by 2^(n/12)); `quiet` leaves
`lastPlayedAt` alone so the cue never suppresses the shell's next chime — it does not lower the cue; `gain` (0..1)
does, scaling every note and sample (I-024: a game's `play(cue, { quiet, gain })` reaches the engine through the
shell, the `card` pluck under Broken Pencil's hand-off is `{ quiet: true, gain: 0.5 }`). A `clip` counts like a cue: a game that speaks
into a phase (Bingo's first number) keeps the chime off its voice.
A game's `shared.sounds` maps phase ids to cues; unmapped phases play `phase`, reserved for moments where the phone needs
the player (so 'pick up your phone' and 'look at the TV' never sound the same). A mapped phase that re-enters itself
(a new deadline with the same id — Blanks reads one card per instance) chimes again; unmapped ones and pauses do not.
`silence` is a valid cue for a phase the game cues itself later; `cheer` (results, a bingo) is the one sampled cue — a
party horn + crowd from `packages/client/public/sfx/` (Mixkit licence).
TV has a mute toggle (persisted in `localStorage`) and a "tap to start" overlay for the autoplay policy.

**Music beds** (ADR-032, `packages/client/src/beds.ts`): looping backgrounds synthesized like the cues, one per phase via
a game's `shared.beds[phaseId]` (or a list of ids, which the shell rotates through — the next one each time that phase begins, loop #197; the count starts over with every game) — `warm` (e-piano groove), `bossa`, `latenight` (held chords, no drums), `marimba` (16th-note
pulse), `lofi` (swung dusty beat, soft kick + brushed snare), `lounge` (vibraphone swing with a
walking bass) and `pulse` (a 120 bpm quiz-show tension bed: eighth-note bass, a clock tick per beat;
`beds-library-more.ts`). The voices they are built from live in `beds-voices.ts`. The shell crossfades beds over 1.5 s as phases change, resumes a returning bed where it stopped, holds it on pause,
ducks it to half under every cue for a second (except the light `lock` / `countdown` / `tick` ticks, which would make it pump), and mutes it with the TV.
File tracks carry a per-track trim (`TRACK_TRIM` in `music-tracks.ts`, measured with `probe-loudness.ts`) so one set plays at one loudness. Unmapped phases and the results screen are silent.
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
`navigator.vibrate` replaces, never queues: `buzz()` drops a pattern shorter than what is left of the one running (the
shell's 20 ms "submitted" tick on the same tick as a Bingo winner's 320 ms celebration), and a pattern at least as long
takes over; the same pattern twice inside 30 ms is one buzz (a tap's own and the shell's lock-in). Dropped ones trace
as `buzz:dropped`.

## Primitives

TV (`@partybox/game-sdk` → `tv/`): `Timer`, `PlayerChips`, `Scoreboard`, `Reveal`, `Stage` (overscan frame), `BigText`. `Scoreboard` picks its column count from the row count (one up to 6, two from 7, three from 13); `columns={3}` / `columns={4}` force three or four body-size columns for a board that shares the stage with a three- or four-row roster, and `size="sm"` shrinks the rows. `stagger="climb"` + `climbFrom` (I-027): rows fade in where they stood in the previous order, the totals count, then at 1.2 s each slides to its new place over `--pb-motion-slow`; a row that rose glows green as it settles, one that fell dim red (reduced motion: no wait, no slide). `holdMs` (I-019): every total shows "—" and every rank "·" until the hold has passed, then the totals count up from zero (0 = today's board). `PlayerChips` `thinkingIds` / `PlayerChip` `thinking` (I-045): three gold dots pulse in turn over the player's dimmed portrait — the room is waiting on them (the game select's VIP). `Scoreboard` `noRanks` (I-128): a blank rank column for an all-zero board — nothing to rank. A split `Scoreboard` labels each column with its rank band ("1–6" / "7–12", I-146 B), and rows sharing a rank are joined by an accent bracket down the left edge (I-146 C; not on a `noRanks` board). The phone `Screen`'s scrolling body fades its last 72 px and shows a slim "more below" row (grab bar + words) at the top of its own footer while more is below (I-066, I-788 A) — never over the body or a footer button, however tall the footer is. The results phone scrolls your row to the middle of the board and pins "You finished 3rd · 0 pts" under the winner line (I-456 B), with the awards as chips right under it; the long award list stays for screen readers only (I-456 C). `CrossfadeSwap` `delayMs` (I-039): the outgoing ghost fades alone for that long before the next game-sdk `Screen` rises (`--pb-screen-delay`; the shell passes 200 ms during a game), so two pages never read on top of each other. `BedEngine.setTension(0..1)` (I-032): the TV ramps it over a phase's last ten seconds — the bar shortens up to +12 % and a low-pass opens 1.8 → 8 kHz, so a bed tightens as a deadline closes. Bot avatar ids are `robot:<n>` (I-043): the robot art in one of six colours with a small variation, so a roomful of bots reads as different players.
Shared (`ui/`): `DeadlineBar` (draining bar; danger in the last 5 s only when the phase lasts ≥ 15 s — a 6 s bingo call just drains — the TV strip and the phone header both use it), `usePrefersReducedMotion` (for JS-driven sequences).
Controller (`controller/`): `TextAnswer`, `ChoiceGrid`, `VoteList` (with a sticky `header` slot for what is being voted on), `WaitingScreen`, `Screen` (safe-area frame; a body that scrolls fades its bottom 28 px while there is more below and lifts the fade at the end, via a scroll-driven `--pb-fold` — browsers without scroll timelines keep the plain fold; the "more below" cue is a row of its own at the top of the footer — grab bar and words, the whole row the button — laid out while the body overflows and only faded at the end so nothing shifts; a Screen with no footer shows the row alone in the bottom safe area — I-788 A, replacing I-187's floating ▾ pill), `PrimaryButton`. The picker names a game's one key setting (`keySetting.ts`, Blanks: the deck) on the Start button, as a chip on the selected card and on the TV's meta line (I-187). A guest's "X is choosing…" screen lists the chosen game's settings read-only and live (`SettingsGlance`, I-648 A); a row the VIP just changed breathes the `--pb-accent-2-fill` in and out once over `--pb-motion-pulse` × 2, ease-in-out like `pb-breathe`, and holds the fill for 2 s instead under reduced motion (I-648 B).
Shared: `Avatar`, `Chip`. Each primitive's props are documented in its file header.

Shell, not SDK (`packages/client/src/surface/`, I-677): the join page on a big screen with a mouse (≥ 1100 px, fine hovering pointer, no touch) floats "📺 Is this the TV?" (open the TV view / I'm playing here); the TV page on a phone (coarse pointer, short side < 800 px) covers the stage with a phone-sized card (join as a player / keep the TV page), un-zoomed from the TV fit. The answer is remembered on the device: a screen that chose the TV goes there by itself after a 3 s countdown with "Stay here"; "keep" / "playing here" is never asked again. A tablet is left alone.

## Performance budget

`/tv` stays smooth in Chromium at 4× CPU throttling: no box-shadows on animated elements, no blur filters,
animate `transform`/`opacity` only (measured 2026-09-18: one `filter: drop-shadow` in a keyframe took Blanks'
result stage from 60 fps to 11 once confetti repainted over it — each was harmless alone), ≤ 60 DOM nodes per player chip list, no per-frame JS.

Filled in during Phase 2 (tokens + core screens) and Phase 8 (polish pass).
