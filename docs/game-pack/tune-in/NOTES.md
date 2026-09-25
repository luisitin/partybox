# Tune In — build notes

Session: game/tune-in · worktree `C:/dev/partybox-game-tune-in` · harness port 42350.
Started 2026-09-24 after the 30-minute wait for the Foundation. At start, `main` had F0 only on
the `foundation` branch (the owner's 20 rulings, not merged); F1–F7 were not on main.

## Status

| Stage                   | State                                                                                    |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| 1 Content               | done: 150 family + 50 spicy spectra, 12 bank clues each, all legal and spread (tests)    |
| 2 Server logic          | done: 6 phases, 3 modes, bot, speech, recap; 118 unit tests, contract suite, sim 200 × 2 |
| 3 Client                | done (TV stage, phones, PhoneStage, EN + ES); polishing through the passes               |
| 4 Record → review → fix | p01–p13b + bursts + edge probe (3 modes, 2–16 players, Spanish, drops, skips, late join) |
| 5 Review package        | done (a6c50cdf, REVIEW.md); in peer review on the hub ([432612])                         |

2026-09-25: main (Foundation + results-kinds) merged in and ADR-050 adopted (ac3da886); the owner's
pacing rule [cc45f4] (3141746f, 8f1a8b9f); the reviewer's DESIGN CHANGES [ba045e] (see Decisions).

## Stand-ins for Foundation pieces

Swapped at the main merge (ac3da886): F5 match (`sameAnswer`, `stem`, `normalize`), F6 speech
(`toSpeakable` with `playerText` for clues, `speechKey`, `pendingCap`, the pronunciations schema),
F7 `teamsFromSeed`, the F1 entries (`client/shared.ts`, `phone-entry.ts`, `tv-entry.ts`), the F2
manifest fields + `manifest.es.json`. Still local:

| Needed                          | Owner      | Stand-in                                                                             |
| ------------------------------- | ---------- | ------------------------------------------------------------------------------------ |
| F6 fixed clips (`render-clips`) | Foundation | fixed lines go through the live speech path; the host caches each key, renders once  |
| F4 presence (`ctx.presence`)    | Foundation | `readPresence(ctx)` reads it when present, else `together` (foundation-f4 in review) |
| `SecretCard` (hold to see)      | Imposter   | a local hold-to-see card in `client/`, same behaviour; swap when Imposter ships it   |
| The shell's ready-up stage      | Foundation | the game's own intro ready-up (below); drop it when [46be3c] lands                   |

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
- **An idle room ends after three void rounds in a row** (spec §5.17 "the game ends quickly"): a
  whole idle game otherwise ran every round of "No signal!" (396 s in the sim, now 154 s). A round
  with a clue starts the count again.
- **Awards shared by more than three are skipped** (spec: "ties share"): a six-way Sharpshooter
  at 16 players is no honour and filled the results. A tie of up to three sends one award per
  player; the shell's results-ties ([304c6e]) draws them as one card naming everyone.
- **The teams intro has no demo dial**: at 16 players its fixed height ran the rosters off the
  card; the rosters sit under the steps and the side that plays first pulses behind its names.
- **Faces follow the dial's drawn size** (`faceLayout`): spacing, ring distance and each ring's
  clearance from the end labels; the points are a pill on the face's chin.
- **Rules, I'm ready, 3 · 2 · 1** (the owner's [cc45f4]): bots are ready from the start; the count
  starts when every connected player has tapped (a dropped phone or a leaver never holds it) or on
  the VIP's Start now. The INTRO_MS (60 s) net starts only a room where nobody has tapped; once
  anyone has, it re-arms and waits for the rest, giving up INTRO_GIVE_UP_MS (10 min) after the rules
  came up (the group standard [e67ec9], reviewer [ba045e] #1). The rules show no clock (timerMode
  `hidden`). The digits follow the live `phase.deadline`, so a pause during the count keeps them in
  step ([a9623e]).
- **Spanish rooms are told the dials are English** on the rules (TV + phone, `EnglishNote`) and in
  `manifest.es.json` (reviewer [ba045e] #5; fake-out's pattern). No 🇬🇧: Windows browsers (a PC
  driving the TV) draw it as the letters "GB". The demo dial's "Hot" is "Calor" in Spanish:
  "Caliente ▶" broke in two in its narrow end column.
- **The rules' demo dial is 260 px tall** so the ready faces end ~40 px above the host bar
  (reviewer [ba045e] #4: the bar cut their ✓s).
- **Relabelled five weak dials** the clue writers flagged: Fleeting ↔ Everlasting, Easy to learn ↔
  Hard to learn, Angelic ↔ Pure evil, Tidy to eat ↔ Messy to eat, The bigger person ↔ Petty, and
  Great date topic ↔ Mood killer. Replaced the near-duplicate "Let it go ↔ Petty revenge"
  (it shared clues with "The bigger person ↔ Petty") with "Tasteful post ↔ Thirst trap".

## Conflicts for the owner

Conflicts 1 and 2 are settled by ADR-052 (results-kinds, adopted at ac3da886).

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

## Platform follow-ups (other sessions, agreed on the hub)

- `results-kinds` (ADR-052): adopted. Teams send `{kind:'teams', winner, teams}`, co-op
  `{kind:'coop', won: rating ≥ Crystal clear}` with the rating as the headline.
- `results-ties` ([304c6e], Foundation): one award card naming every tied winner, three tied names in
  the headline, the gold outline on a tie's last row (reviewer [ba045e] #3). Tune In needs no change.
- The shell's ready-up stage ([46be3c], Foundation): then Tune In drops its intro ready-up and keeps
  a teams-only roster card ([4d6fb9]).
- The strip's scores frozen at 0 (TvPlaying.tsx:137, reported [ac5036] with a one-line fix).
- The shell goes faces-only when the strip's chips would take more than two rows (Foundation, after
  its branch lands) — gives the dial back ~136 px at 16 players.

## Left to do

Phone-only rooms and remote players on F4 presence; the speech-lab pass; drop the intro ready-up
when the shell's stage lands; 4 APPROVEs (2 DESIGN) on the current head, then merge.
