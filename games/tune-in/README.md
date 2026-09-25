# Tune In 📻

## Overview

A dial runs between two opposites (Cold ↔ Hot). Only the psychic's phone shows a secret target
(0–100). They type one clue that belongs there ("coffee"); everyone else slides a dial to where
they think it lands. The closer, the more points. Three modes: **solo** (everyone for themselves),
**teams** (▲ Sun vs ● Moon, a shared needle, the other team calls LEFT / RIGHT) and **co-op**
(the whole room against the dial, rated at the end). Full spec: `docs/game-pack/tune-in/SPEC.md`.

## Players

2–16, bots welcome (`supportsBots`). Mode `auto`: co-op at 2, solo at 3+. Solo needs 3+, teams 4+
(else auto decides), co-op allows up to 8 (else solo). The psychic rotates from a bag per side, so
everyone goes once before anyone goes twice; a player who left for good is never drawn again.
Late joiners are spectators. Bots: a psychic bot sends one of the two bank clues nearest the target;
a guesser bot recognises bank clues (±8 noise) or guesses 10–90, drifts in a huddle, then locks; a
caller bot compares the clue's bank spot with the needle. Bots decide from their own phone's view.

## Phases

| Phase  | Ends when                                         | Notes                                                    |
| ------ | ------------------------------------------------- | -------------------------------------------------------- |
| intro  | 8 s or VIP                                        | once; mode, steps, teams' rosters                        |
| clue   | legal clue, `clueSeconds`, VIP                    | quiet timer; no clue = void round ("No signal!")         |
| dial   | all connected guessers locked, `dialSeconds`, VIP | VIP skip locks the dials where they are                  |
| call   | all connected callers tapped, `callSeconds`, VIP  | teams only; skipped when there is no needle or no caller |
| reveal | two beats: 3.6 s open, then ≥ 3 s points          | a void round is one 3.5 s beat and skips `scores`        |
| scores | VIP Next round / See results, or 20 s fallback    | phone-only rooms show the scorecard and VIP control      |

A psychic who drops during `clue` keeps it open 10 s at most and gets the full time back on
return; one who leaves for good voids the round. The last outstanding guesser or caller dropping
ends the phase like their input would. Pause holds the clock; phones keep their thumb positions.

## Inputs

`{type:'clue', text≤60}` (psychic, `clue`), `{type:'dial', pos 0–100}` and `{type:'lock'}`
(guessers, `dial`), `{type:'call', side:'left'|'right'}` (calling team, `call`). Anything else,
from anyone else, in any other phase is ignored. A dial after a lock clears the lock; a lock needs
a dial. Clue rules (server and phone): empty · over 30 characters · a digit or number word · a word
sharing a stem (or an inflection: hotter, spelling) with a label word of 3+ letters · a position
word (left, right, middle, center, centre, halfway, midpoint, percent, scale, spectrum, dial).
A refused clue sets the psychic's `rejected` reason (buzz + copy); whole words only, so "hotdog"
passes on Cold ↔ Hot. Phones throttle a huddle drag to 3 dials/s and send solo dials on release.

## Scoring

Distance = |dial − target|. Bands (4 / 3 / 2 points, else 0): narrow ≤4/8/12, normal ≤5/10/15,
wide ≤6/12/20. **Solo**: each guesser scores their band; the psychic scores
`floor((2·sum + n) / (2·n))` over the n who dialled (0 if none), +2 for a perfect tune (2+ dialled,
all 4s). **Teams**: the needle is the rounded average of the active team's dials; the team scores
its band; the other team's majority call scores +1 when right, never on a bullseye, never on a tie or
no taps. A bullseye that leaves the team still behind is a catch-up: same team again, next psychic.
The game ends when a team reaches `targetScore` at the end of a turn (higher wins, equal shares) or
after `maxTurns` (catch-ups count). Every player carries their team's total. **Co-op**: the group
needle's band adds to the group total; the finale rates total ÷ (rounds × 4): <35 % 📺 Static,
35–54 % 📻 Tuning in, 55–74 % 📡 Crystal clear, 75 %+ 🧠 Mind meld. Everyone carries the group
total and everyone is crowned (the contract needs a winner; the finale carries the verdict).
Scores never go down. Awards (ties share, skipped if unearned): 🎯 Sharpshooter (most 4s),
📡 Clear Signal (best average as psychic), 🧭 Steady Hand (lowest average distance, 3+ dials),
📺 Static (most zero dials, at least 2).

## Edge cases

Void round: no scores; solo/co-op psychic goes to the back of the bag, teams pass the turn. No
guesser dialled: nobody scores, psychic 0; teams: no needle, 0, `call` skipped. A team with nobody
left: its turns are void. Target near an edge: the zones clip at 0 and 100. Uneven teams: allowed.
Everyone idle: every round is void and the game ends in minutes. Secrets: the target only on the
psychic's phone until the reveal; solo dials only on their own phone; huddle markers only on the
active side and the TV (never in remote-text); calls only on the caller's phone. A phone shows its
own result only at the reveal's points beat.

## Settings

`mode` auto/solo/teams/coop · `rounds` auto/3–12 (auto: 8 at 2, one per player at 3–8, 8 at 9–16)
· `targetScore` 6–15 (10) · `maxTurns` 6–12 (12) · `clueSeconds` 20–75 (45) · `dialSeconds` 15–45
(25) · `callSeconds` 10–30 (15) · `targetSize` narrow/normal/wide · `huddle` (on; teams and co-op,
off in remote-text) · `spicy` (off; half the dials from the spicy pack) · `reader` (sky; every
voice or none: the psychic and the ends, the clue, the verdict, fixed lines).

## Content

`content/family.json` (150 spectra) and `content/spicy.json` (50, adult not explicit), each
`{lang:'en', spectra:[{id, left, right, kind, clues:[12 × {text, pos}]}]}`: labels ≤ 18 characters,
two bank clues or more in every fifth of the dial, every bank clue legal against its own labels, no
brands or real people. `content/pronunciations.json` holds reader overrides. init draws only the
spectra this game needs (≤ 12); the state stays under 11 KB at 16 players.
