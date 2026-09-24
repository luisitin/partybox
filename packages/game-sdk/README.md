# @partybox/game-sdk

Everything a game may import. Re-exports the contract types and `z` from `shared`, adds helpers and UI
primitives, and hosts the contract tests that run against every game.

## Key files

- `src/index.ts` — the PURE public surface: contract types, `z`, rng, reducer/view helpers (what `games/*/server` imports).
- `src/ui.ts` — `@partybox/game-sdk/ui`: the React primitives (what `games/*/client` and the client shells import, ADR-023).
- `src/match.ts` — `@partybox/game-sdk/match` (ADR-048): the typed-answer matcher, pure and free of zod and React so
  server and phone share it: `normalize`, `stem`, `matchAnswer` (`exact`/`stem`/`fuzzy`/`none`), `sameAnswer`,
  `groupAnswers`, `isLegalClue` (reason codes). Every call takes the content's `lang`. Files in `src/match/`.
- `src/answer-pack.ts` — `answerItemSchema`, `answerPackSchema`, `checkAnswerPack` (the pack test), from the pure entry.
  `src/compare.ts` — `compareCodeUnits`, the locale-free sort game servers use instead of `localeCompare`.
- `src/speech.ts` — `@partybox/game-sdk/speech` (server-only, pure; ADR-045): `toSpeakable` (Part 00 §5.3 rules, `src/speech/`),
  `speakableName`, `parsePronunciations` + `pronunciationsSchema` (the SDK's `overrides.en.json`, then the game's), `speechKey`,
  `SPEECH_ENGINE_VERSION`, `pendingCap`, `unknownPhonemes`. Never imported by client code (dependency-cruiser).
- `src/client-module.ts` — `GameShared`, `GamePhoneModule`, `GameTvModule`, `GameSettingsModule`, `GameLoaders`, `GameTvProps`, `GameControllerProps` (what `games/<id>/client/*-entry.ts` export, ADR-050).
- `src/ui/` — `Avatar` (16 inline SVGs), `PlayerChip`, `ServerClockProvider` + `useServerNow` / `useSecondsLeft` / `useServerOffset` (server-time-aware timers).
- `src/rng.ts` — `nextFloat`, `nextInt`, `shuffle`, `pick` on `RngState` (`[value, next]`), `createRng` for bots.
- `src/timer.ts` — `enterPhase`, `isTimerFor`, `applyVip` (pause/resume + skip/end handlers), `setConnected`, `allConnectedDone`, `connectedIds`.
- `src/turns.ts` — `teamsFromSeed` (▲ Sun / ● Moon, even sizes, bots spread), `majorityPick` (seeded tie-break, `null` with no votes), `rotation` (whose turn, skipping who left). Pure, never throw.
- `src/scoring.ts` — `rank` (shared ranks on ties), `buildResults`, `speedPoints`, `addScores`. `src/views.ts` — `envelope`, `controllerEnvelope`, `viewPlayers`.
- `src/controller/` — `Screen` (safe-area frame + sticky footer), `PrimaryButton`, `WaitingScreen`; Phase 3 adds `TextAnswer`, `ChoiceGrid`, `VoteList`.
  `usePhoneOnly()` (S-005, 2026-09-22) is true in a "phone only" room — the shell provides it —
  and the three controls above use it for their default lines, so none of them says "look at the
  TV" when there is no TV. A game's own copy should do the same (or read `view.phoneOnly`).
- `src/tv/` — `Stage` (overscan frame), `BigText`, `Timer` (last-5-s urgency + `onTick`), `PlayerChips`, `Scoreboard`; Phase 3 adds `Reveal`.
- `src/contract-tests/` — the suite every game must pass: `contract.test.ts` (rules), `play.ts` (headless runner), `fuzz.ts`, `hash.ts`, `load.ts` (docs/TESTING.md).

## Test

`pnpm vitest --project game-sdk` (helpers) · `pnpm vitest --project contract` (every game)

## Must NOT go here

Engine or server imports, sockets, game-specific logic, anything a game shouldn't be allowed to call.

`GameTvModule` strip flags (I-131, 2026-09-22): `stripCompact` (phase ids) drops the TV strip to
faces only on those phases — the claimant's chip (`PlayerChips` `leadId`) keeps its name and is drawn
a size up — and `stripHidden` removes the strip entirely so the stage takes the room. Bingo uses both
for a claim and its verdict.

Language (ADR-044, 2026-09-22): `useLang()` / `setLang()` / `getLang()` are the device's language;
`useT(table)` returns `L`, where `L('English {name}', { name })` answers in that language from an
English-keyed `Strings` table and `L.sent(text)` translates a sentence the server wrote.
`translate` / `translateSent` are the same outside React. The SDK's own components translate through
`controller/strings.ts` and `tv/strings.ts`.

`spectator` on a view (I-134 A, 2026-09-23): optional `{ line }` a game fills for a phone that is
waiting for the next game; the shell's waiting screen shows it (in the phone's language through the
game's table). Bingo sends the live call ("N 34 — Thirty-four — ask for more").

Avatar ids may carry a colour (I-086, 2026-09-23): `fox#3` is the fox in player colour 4
(`avatarFace` / `avatarTint` in `@partybox/shared`); `Avatar` and `avatarColorVar` read both, and an
id without `#` behaves as before.

A manifest setting may declare `impliedBy: { key, value, note }` (I-112 A, 2026-09-23): while the
sibling `key` has `value`, the picker (phone and TV) greys the field out, checked, with `note`.
