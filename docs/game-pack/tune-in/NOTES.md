# Tune In — build notes

Session: game/tune-in · worktree `C:/dev/partybox-game-tune-in` · harness port 42350.
Started 2026-09-24 after the 30-minute wait for the Foundation. At start, `main` had F0 only on
the `foundation` branch (the owner's 20 rulings, not merged); F1–F7 were not on main.

## Status

| Stage                   | State                                                                                   |
| ----------------------- | --------------------------------------------------------------------------------------- |
| 1 Content               | done: 150 family + 50 spicy spectra, 12 bank clues each, all legal and spread (tests)   |
| 2 Server logic          | done: 6 phases, 3 modes, bot, speech, recap; 99 unit tests, contract suite, sim 200 × 2 |
| 3 Client                | done (TV stage, phones, PhoneStage, EN + ES); polishing through the passes              |
| 4 Record → review → fix | p01–p08 (solo, teams, co-op; real touch; bursts) — see the record-review README         |
| 5 Review package        | not started                                                                             |

Foundation watch (2026-09-24 afternoon): `foundation` has F1 (per-game phone / TV / panel
downloads) and F2 work, not on `main` yet. When F1 lands, Tune In needs its `client/phone.ts` and
`client/tv.ts` entries; when F2 lands, the manifest gets `icon` 📻, `howToPlay`, `presence`
(`anywhere`) and `addedOn`, plus `manifest.es.json`.

## Stand-ins for Foundation pieces not on main yet (swap when they land)

| Needed                                           | Owner      | Stand-in                                                                                       |
| ------------------------------------------------ | ---------- | ---------------------------------------------------------------------------------------------- |
| F5 matcher: `normalize`, `stem`, `sameAnswer`    | Foundation | `games/tune-in/server/text.ts`, with the audit's errata (#15, #16, #25–27, #29)                |
| F6 `toSpeakable`, overrides, keys                | Foundation | `server/speakable.ts` (rules 1, 5, 7, 8, 10–13; names per §5.5; key `ti…` fits today's regex)  |
| F6 fixed clips (`render-clips`)                  | Foundation | fixed lines go through the live speech path; the host caches each key, so it renders once ever |
| F7 `teamsFromSeed`, `majorityPick`               | Foundation | `server/teams.ts` (pure, `[value, RngState]`, never throws)                                    |
| F4 presence (`InitContext.presence`, `canSeeTv`) | Foundation | `readPresence(ctx)` reads it when present, else `together`; no view branches on `canSeeTv`     |
| F2 manifest fields (`icon`, `howToPlay`, …)      | Foundation | not in `manifest.json` yet: zod would strip them and the contract deep-equal would fail        |
| `SecretCard` (hold to see)                       | Imposter   | a local hold-to-see card in `client/`, same behaviour; swap when Imposter ships it             |

## Decisions (made, noted, easy to change)

- **Clue rule is a little stricter than §5.8's stems:** a label word's inflections are banned too
  (hot → hotter/hottest, spell → spelling, nice → nicer), whole words only, so "hotdog" and
  "spellbound" stay legal. Big number words (hundred, thousand, million, billion, dozen) count as
  numbers. A few plain label words never ban anything (the, and, for, with, you, your, not, are, from).
- **Spicy on** draws half the game's dials from the spicy pack (rounded up), so switching it on is
  felt; the spec says only "adds the spicy pack".
- **Mode fallbacks** (the engine has no per-setting start check): teams with < 4 players and solo
  with < 3 fall back to auto; co-op with > 8 falls back to solo. The intro shows the mode played.
- **A psychic who drops** during `clue` keeps it open 10 s at most (a phone reload is common), and
  gets the full time back on return; leaving for good voids the round at once.
- **Reveal in two beats** (ADR-033 re-arm): shutter + faces first, points second. Phones show their
  own result only at the second beat. A VIP skip steps through the beats.
- **Fixed lines** are voiced in `intro` ("Tune in!"), `dial` ("Lock it in." with a few seconds left,
  played by the stage), `call` ("Left or right?"), the verdict beat, catch-up and co-op's rating.
- **The TV's timer is always the quiet bar;** the dial's and the call's seconds sit on the stage
  (TvRound's clock, the SDK `Timer`, ticking the `countdown` cue). A strip countdown that came and
  went with the phase re-wrapped the player chips and moved the dial at every cut. The ticks are
  one pitch: a game's `PlayCueOptions` has no `semitones` (the shell's own countdown rises).
- **The strip never shows scores** (spec §5.4 hides them only in `dial` and `reveal`): scores widen
  the chips and wrap the row, which jumped the stage; the scores screen already has them.
- **Teams' scores beat is a race track** ("the two totals racing to the target"): a lane per team,
  a cell per point, this turn's cells filling one by one. The slim banner already moved at the
  reveal's points beat, so the scores beat shows the race instead of the same banner again.
- **Sideways phones** (the shell's `(orientation: landscape) and (max-height: 420px)`): results,
  the psychic's hold card and the huddle strip sit side by side; the reassurance rows hide; the
  scores beat drops the round's picture (it was just on screen). LEFT / RIGHT sit side by side in
  every orientation — the side you mean is the side you tap.
- **Relabelled five weak dials** the clue writers flagged: Fleeting ↔ Everlasting, Easy to learn ↔
  Hard to learn, Angelic ↔ Pure evil, Tidy to eat ↔ Messy to eat, The bigger person ↔ Petty, and
  Great date topic ↔ Mood killer.

## Conflicts for the owner

1. **The results headline cannot name a team** (teams, p08): Sun won 11–8 and the shell said "Lu,
   Sam & the bot tie!" — `winnerIds` are the winning team's players, and several winners read as a
   tie. Tune In's finale lights the winners' roster card ("▲ Sun · Winners!"). Proposed platform
   fix (hub #ideas 4550fc): an optional `GameResults.headline` (and a `winnerTeam` for confetti).
   The same fix covers co-op, next.
2. **Co-op below Crystal clear crowns everyone.** Spec §5.7 wants nobody crowned, but the contract
   suite requires `winnerIds.length > 0` (contract.test.ts:87). Following the spec's own fallback:
   everyone is crowned and the finale board carries the verdict. The results screen then reads "It's
   a tie!" with the tie chord. Proposed fix (platform, small): let a game mark results `coop: true`
   so the shell headlines the finale's verdict instead of "tie".
3. **No rejected-input channel exists** for a game ("rejected with copy"). The phone runs the same
   check and never sends an illegal clue; if one arrives anyway, the psychic's view carries
   `rejected: {reason, n}` and the phone shows the copy and buzzes. No platform change needed.
4. **Presence in `init`** (ruling 1 / ADR-047) is not on main; Tune In reads it when it appears.
   Until then the huddle is on whenever the setting is, even for remote players.

5. **Spanish content.** Foundation §5.3 (Part 00) defers Spanish content and readings ("if added later"); in Spanish
   the chrome is Spanish and the dials and readings stay English.

## Weak spots in the content (writers' notes, kept for a later pass)

Trashy TV ↔ Prestige TV is the flattest (no show titles allowed). Unpopular ↔ Popular opinion and
Cursed object ↔ Lucky charm have fuzzy middles. Snack ↔ Feast and Light bite ↔ Calorie bomb overlap;
so do Nice ↔ Naughty, Prude ↔ Shameless and Wholesome ↔ Twisted in the spicy pack.

## Left to do

Remaining record-review scenarios (drop / reconnect / late join, VIP skip in every phase, 3 / 16
players, phone-only), the speech-lab pass once F6 lands, a content pass (the near-duplicate spicy
"petty" dials), then the review package.
