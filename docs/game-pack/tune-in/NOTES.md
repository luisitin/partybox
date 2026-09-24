# Tune In — build notes

Session: game/tune-in · worktree `C:/dev/partybox-game-tune-in` · harness port 42350.
Started 2026-09-24 after the 30-minute wait for the Foundation. At start, `main` had F0 only on
the `foundation` branch (the owner's 20 rulings, not merged); F1–F7 were not on main.

## Status

| Stage                   | State                                                                                   |
| ----------------------- | --------------------------------------------------------------------------------------- |
| 1 Content               | done: 150 family + 50 spicy spectra, 12 bank clues each, all legal and spread (tests)   |
| 2 Server logic          | done: 6 phases, 3 modes, bot, speech, recap; 98 unit tests, contract suite, sim 200 × 2 |
| 3 Client                | in progress                                                                             |
| 4 Record → review → fix | not started                                                                             |
| 5 Review package        | not started                                                                             |

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
- **Relabelled five weak dials** the clue writers flagged: Fleeting ↔ Everlasting, Easy to learn ↔
  Hard to learn, Angelic ↔ Pure evil, Tidy to eat ↔ Messy to eat, The bigger person ↔ Petty, and
  Great date topic ↔ Mood killer.

## Conflicts for the owner

1. **Co-op below Crystal clear crowns everyone.** Spec §5.7 wants nobody crowned, but the contract
   suite requires `winnerIds.length > 0` (contract.test.ts:87). Following the spec's own fallback:
   everyone is crowned and the finale board carries the verdict. The results screen then reads "It's
   a tie!" with the tie chord. Proposed fix (platform, small): let a game mark results `coop: true`
   so the shell headlines the finale's verdict instead of "tie".
2. **No rejected-input channel exists** for a game ("rejected with copy"). The phone runs the same
   check and never sends an illegal clue; if one arrives anyway, the psychic's view carries
   `rejected: {reason, n}` and the phone shows the copy and buzzes. No platform change needed.
3. **Presence in `init`** (ruling 1 / ADR-047) is not on main; Tune In reads it when it appears.
   Until then the huddle is on whenever the setting is, even for remote players.

## Weak spots in the content (writers' notes, kept for a later pass)

Trashy TV ↔ Prestige TV is the flattest (no show titles allowed). Unpopular ↔ Popular opinion and
Cursed object ↔ Lucky charm have fuzzy middles. Snack ↔ Feast and Light bite ↔ Calorie bomb overlap;
so do Nice ↔ Naughty, Prude ↔ Shameless and Wholesome ↔ Twisted in the spicy pack.

## Left to do

Client (TV stage, phone, PhoneStage, strings EN + ES), the SDK `Dial` / `DialInput` / `TeamBanner`
(this session owns them), record-review passes, speech-lab pass once F6 lands, the review package.
