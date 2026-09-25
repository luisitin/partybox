# @partybox/game-sdk

Everything a game may import. Re-exports the contract types and `z` from `shared`, adds helpers and UI
primitives, and hosts the contract tests that run against every game.

## Key files

- `src/index.ts` — the PURE public surface: contract types, `z`, rng, reducer/view helpers (what `games/*/server` imports).
- `src/ui.ts` — `@partybox/game-sdk/ui`: the React primitives (what `games/*/client` and the client shells import, ADR-023).
- `src/match.ts` — `@partybox/game-sdk/match` (ADR-048), pure, no zod/React (server and phone share it): `normalize`, `stem`,
  `matchAnswer` (`exact`/`stem`/`fuzzy`/`none`), `sameAnswer`, `groupAnswers`, `isLegalClue` (reason codes); every call takes `lang`.
- `src/answer-pack.ts` — `answerItemSchema`, `answerPackSchema`, `checkAnswerPack` (the pack test); `src/compare.ts` — `compareCodeUnits`
  (the locale-free sort game servers use instead of `localeCompare`). Both from the pure entry.
- `src/speech.ts` — `@partybox/game-sdk/speech` (server-only, pure; ADR-045): `toSpeakable` (Part 00 §5.3), `speakableName`,
  `parsePronunciations` + `pronunciationsSchema`, `speechKey`, `SPEECH_ENGINE_VERSION`, `pendingCap`, `unknownPhonemes`.
- `src/client-module.ts` — `GameShared`, `GamePhoneModule`, `GameTvModule`, `GameSettingsModule`, `GameLoaders`, `GameTvProps`, `GameControllerProps` (what `games/<id>/client/*-entry.ts` export, ADR-050).
- `src/ui/` — `Avatar` (16 inline SVGs), `PlayerChip`, `ServerClockProvider` + `useServerNow` / `useSecondsLeft` / `useServerOffset` (server-time-aware timers).
- `src/rng.ts` — `nextFloat`, `nextInt`, `shuffle`, `pick` on `RngState` (`[value, next]`), `createRng` for bots.
- `src/timer.ts` — `enterPhase`, `isTimerFor`, `applyVip` (pause/resume + skip/end handlers), `setConnected`, `allConnectedDone`, `connectedIds`.
- `src/turns.ts` — `teamsFromSeed` (▲ Sun / ● Moon, even sizes, bots spread), `majorityPick` (seeded tie-break, `null` with no votes), `rotation` (whose turn, skipping who left). Pure, never throw.
- `src/scoring.ts` — `rank` (shared ranks on ties), `buildResults`, `speedPoints`, `addScores`. `src/views.ts` — `envelope`, `controllerEnvelope`, `viewPlayers`.
- `src/controller/` — `Screen` (safe-area frame + sticky footer), `PrimaryButton`, `WaitingScreen`, `TextAnswer`, `ChoiceGrid`, `VoteList`.
  `usePhoneOnly()` is true when this phone is the stage — a "phone only" room (S-005) or a player who can't see the TV
  (ADR-047); `useCanSeeTv()` is its opposite for copy. Those controls use it so none says "look at the TV" to someone
  who can't; a game's own copy should do the same (or read `view.phoneOnly`, stamped per phone).
- `src/tv/` — `Stage` (overscan frame), `BigText`, `Timer` (last-5-s urgency + `onTick`), `PlayerChips`, `Scoreboard`, `Reveal`.
- `src/contract-tests/` — the suite every game must pass: `contract.test.ts` (rules), `play.ts` (headless runner), `fuzz.ts`, `hash.ts`, `load.ts` (docs/TESTING.md).

## Reading time

`readingMs(words, opts?)` and `wordCount(text)` (`src/reading.ts`; pure, no zod, also at `@partybox/game-sdk/reading`
for zod-free constants files) are the one rule for how long a screen of words stays up — the owner's pacing
rule [cc45f4]: `round(max(1500, 1500 + words × 333) × (ui ? 1.3 : 1) × (lang 'es…' ? 1.1 : 1) × (largeText ? 1.2 : 1))`.
`ui` is for the UI's own words (deck text passes nothing); games pass no `lang`/`largeText` yet.

## Test

`pnpm vitest --project game-sdk` (helpers) · `pnpm vitest --project contract` (every game)

## Must NOT go here

Engine or server imports, sockets, game-specific logic, anything a game shouldn't be allowed to call.

## Notes

- `GameTvModule` strip flags (I-131): `stripCompact` (phase ids) drops the TV strip to faces only — the claimant's
  chip (`PlayerChips` `leadId`) keeps its name, a size up — and `stripHidden` removes it. Bingo uses both for a claim.
- Language (ADR-044): `useLang()` / `setLang()` / `getLang()` are the device's language; `useT(table)` returns `L`
  (`L('English {name}', { name })` from an English-keyed `Strings` table; `L.sent(text)` for a sentence the server
  wrote); `translate` / `translateSent` outside React. The SDK's own components use `controller/` and `tv/strings.ts`.
- `spectator` on a view (I-134 A): optional `{ line }` for a phone waiting for the next game; the shell's waiting
  screen shows it through the game's table (Bingo sends the live call).
- Avatar ids may carry a colour (I-086): `fox#3` is the fox in player colour 4 (`avatarFace` / `avatarTint` in
  `@partybox/shared`); `Avatar` and `avatarColorVar` read both; an id without `#` behaves as before.
- A manifest setting may declare `impliedBy: { key, value, note }` (I-112 A): while the sibling `key` has `value`,
  the picker greys the field out, checked, with `note`.
- `PlayerChip` `compact` (I-792 E): a tight grid cell — no "you" tag (the label keeps "(you)"), the VIP tag is its ★
  alone, the glyph slot only while a glyph shows. `leader` draws `LeadMark` (I-268: the one "1st" / "1.º" tag, aria
  "leading") where the ▲ was, and a rising `score` floats "+N" for 2 s (not while `scoreMuted`). The phone bench and
  Lightning's reveal rows use it too: no mark while nobody has scored or everyone is tied. 🏆 = won, 👑 = VIP handover.
