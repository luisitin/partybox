# Secret Hitler — build notes

Branch `game/secret-hitler` (off main `fa3e9996`), worktree `C:/dev/partybox-game-secret-hitler`,
harness port 42410.

## Status

| Milestone                       | State                                                                                                                                                                                                                            |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1 rules engine + plain screens | done: 15 phases, every R1–R22 and D1–D11 rule has a named test (81 tests), contract green (random / fast / idle / skipper × normal / relaxed / fast), sim 4,800 games clean (5–10 players × random / idle / mixed / chaos × 200) |
| M2 Parliament Noir              | visual pass in progress after the owner's play-test: tokens, fonts, art, TV moments, phone dossier/roster/cards (see below); claims, Record input, narrator, chat, PhoneStage still to do                                        |
| M3 variants + S1                | not started                                                                                                                                                                                                                      |
| M4 polish                       | not started                                                                                                                                                                                                                      |

## The owner's play-test notes (2026-09-24) and the visual pass

1. **Better textures and motion** ("feel things coming in and out"): Parliament Noir — game tokens
   `--sh-*` scoped to the game root per platform theme (S2, hub #plans `a27573`), vendored Bebas
   Neue / Playfair Display / Special Elite (OFL, Apache-2.0; licences in `client/fonts/`), inline
   SVG art (lantern, serpent and cracked column, cracked mask, seals, guilloché backs, stamps,
   power icons), a rainy chamber backdrop with searchlights and grain, decree cards dealt and
   flipped in 3D, placards turned in a wave, rubber stamps, the session envelope gliding from the
   President to the Chancellor, the CLASSIFIED folder, a spotlight dim for the Hitler check and
   executions, and the newspaper (server-picked headlines, `content/headlines.json`). Cues land on
   the animation frames (`useCueAt`); the shell stays silent as those reveals begin.
2. **The dossier was hard to read with hold**: tap to open, tap to close by default (a phone set to
   "hold" keeps holding); it closes itself on each new phase. Hub #decisions `997c4d` item 4
   amended accordingly (card rows follow the same default).
3. **See every player at once**: a roster of every seat along the bottom of every phone screen;
   while your dossier is open, your teammates are marked there (Fascists see the other Fascists
   and Hitler), and nothing is marked while it is closed.

Implementation notes: the TV root scales its root font, so TV sizes are px (never rem); the TV
shell remounts the game per phase, so journeys across phases (the envelope, the plate) are keyframes
from an offset, and the vote placards arrive already face-up after the reveal; a child's layout
effect runs before the parent's ref is attached, so seat positions are measured in a frame. Evidence:
`reports/design/record-review/secret-hitler/m2-p1` (stills, 5 themes) and `m2-p2/burst` (filmstrips).

## The owner's rulings on the M1 plan (2026-09-24)

1. **Stand-ins** for SecretCard and FacePicker live in `games/secret-hitler/client/standin/`, with
   the real ones' prop names; swap when Imposter's land on main.
2. **D4 Last call = the VIP's Skip** in a choosing phase (`nominate`, `vote`, `presDraw`,
   `chanEnact`, `vetoAsk`, `power`): the deadline becomes min(deadline, now + 10 s) and
   `vipSkipLabel` reads "Last call"; a second Skip does nothing (`vipSkipHidden`). No new input,
   and the TV's host bar gets it for free.
3. **`relaxed` pace is contract-tested**, so `estimatedMinutes` is **40** (spec: 35). Worst idle
   game: ~73 min normal, ~108 min relaxed; the budget is 3 × 40 = 120.
4. **D7 exile after 120 s is counted by the game.** Main keeps a dropped seat for the whole game
   (I-746 A, `engine/src/players.ts` `expirePlayers`), and sends `gone` only on leave/kick. The
   game stores `droppedAt` and exiles on the first event at or after 120 s; every phase has a
   deadline ≤ 135 s, so an exile lands at most one phase late.

## Conflicts with main / the brief, and what was done

| #   | Spec                                                | Main                                                                                                     | Done                                                                                                                                                                                                                                                             |
| --- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | §1, §13 manifest `icon`, `howToPlay`, `presence`    | not in `gameManifestSchema` on main (Foundation F2/F4, unmerged); the contract deep-equals manifest.json | left out; the credit is in `description` (§20.1's minimum), the three steps in `content/about.json`. Values ready: 🏛️; `{ needs: 'voice-if-remote' }`; `addedOn` at ship                                                                                         |
| 2   | §14 has no input for D4                             | games only see `vip: true` on inputs                                                                     | ruling 2 above                                                                                                                                                                                                                                                   |
| 3   | D7 "after the 120 s hold"                           | seats are held all game                                                                                  | ruling 4 above                                                                                                                                                                                                                                                   |
| 4   | §21 "3 × 35"                                        | relaxed idle ≈ 107 min                                                                                   | ruling 3 above                                                                                                                                                                                                                                                   |
| 5   | Ruling 20: 4 KB views, `bot.decide(controllerView)` | main's API is `sampleInput(state)`                                                                       | `sampleInput` = `decide(controllerView(state, id))`. Views measured with UUID ids, photo avatars and 12-char names at 10 players: TV 3.6 KB, phone 4.0 KB (`leaks.test.ts` pins ≤ 4096). Seat flags are a `tags` list and Record rows name seats by index to fit |
| 6   | §4 "manhunt" is a phase                             | V8 is M3                                                                                                 | not in `phases` yet (every declared phase needs a fixture)                                                                                                                                                                                                       |

## Spec errata found while building

- **D7 "during `nominate` … if they were the nominee"** can't happen: `nominate` ends the moment a
  nominee is chosen. The nominee case is handled in `vote`.
- **D7 says nothing about the President exiled during `vote`.** Done: the candidacy passes on (no
  tracker change), as in `nominate`.
- **D8 with Hitler already exiled** never arises: Hitler's exile ends the game first.
- **`claims` in M1** is the timed "Discuss" beat only; the claim builder, the Record rows' claims
  and the ⚡ checks are M2 (§22).

## Settled on the hub (2026-09-24, #decisions `997c4d`)

Proposed in #plans `1fe99b` at 19:35; no objections by 20:07; Imposter agreed (`c56d4f`).

1. President exiled during `vote`: the candidacy passes on, no tracker change.
2. The M1 TV has no Parliament Record (tracks side by side); M2 lays out the rows already in the view.
3. D7's "nominee exiled during `nominate`" is an erratum; the case lives in `vote`.
4. Card rows stay their own control and follow the phone's SecretCard hold/tap setting, with
   SecretCard's hardening (`d879c931`).

## Decisions (small, mine)

- Chaos with a veto behind it goes to `claims`, where no power fires (the government enacted
  nothing), then `nominate`.
- An investigation's file reaches the President at the end of the 3 s pause (the second beat of
  `powerReveal`, ADR-033); a VIP skip of the pause still delivers it.
- The tracker moves at `voteReveal` entry, so the TV shows the rivet with the REJECTED line.
- History (the Record) keeps the last 40 rows in state; views carry the last 7.
- The card row on the phone: hold to see, slide onto a card and let go to mark it (one finger),
  or tap mode (see above); numbered "Card n" keys for keyboards and screen readers never name the
  card.

## Stand-ins in use

| Needed                               | Owner         | Stand-in                                                       |
| ------------------------------------ | ------------- | -------------------------------------------------------------- |
| `SecretCard`                         | Imposter      | `client/standin/SecretCard.tsx` (hold to see, no 3D)           |
| `FacePicker`                         | Imposter      | `client/standin/FacePicker.tsx` (2/3 columns, reason captions) |
| `toSpeakable`, clips                 | Foundation F6 | none needed in M1 (no narrator yet)                            |
| presence (P7), PhoneStage per player | Foundation F4 | none in M1                                                     |

## When Foundation lands on main

Foundation asked for review to merge F0–F3 + F5–F7 on 2026-09-24 (hub #merges `3ed9d4`). After it
lands, `git merge main` here needs: the ADR-050 layout (`client/shared.ts`, `phone-entry.ts`,
`tv-entry.ts`), `manifest.es.json`, the manifest fields (🏛️, the three `howToPlay` lines from
`content/about.json`, `presence: { needs: 'voice-if-remote' }`, `addedOn`, tags as now), a
description ≤ 300 (it is 244), and `rotation` / `majorityPick` from `@partybox/game-sdk` where
they fit (seat rotation stays game code: R16's return rule is game-specific).

When `results-kinds` (ADR-052, stacked on foundation) lands: set `results().outcome` to
`{ kind: 'teams', winner: 'liberals' | 'fascists' | null, teams }` and `headline` to the ending
("Hitler is dead"), so the results screen stops calling the winning side a tie.

## Screenshots

`reports/design/record-review/secret-hitler/shots/` (gitignored). Main's `/preview` rejects
camelCase fixture names, so the capture script (kept outside the repo) builds each scene with the
real reducer from a real room's state and loads it with `/api/dev/load-state`.

## Left for later milestones

M2: `--sh-*` tokens (S2) and fonts, the art, motion and signature moments, claims + ⚡ + the full
Record, narrator, chat, PhoneStage, tabs. M3: power cards, toggles, presets, S1 conditional
settings, `manhunt`. M4: bots per §16 in full + the honesty property test, presence modes, finale +
Truth panel + recap, awards, speech lab, the full screenshot matrix.
