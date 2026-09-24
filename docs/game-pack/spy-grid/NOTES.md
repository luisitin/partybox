# Spy Grid — build notes

Session: worktree `C:/dev/partybox-game-spy-grid`, branch `game/spy-grid`, harness port 42390.
Started 2026-09-24 from `main` @ 4bfd10eb. The Foundation's F0 + F2 are on branch `foundation` only;
F1, F3–F7 are not built yet, so everything below that needs them runs on a stand-in.

## Where it stands (2026-09-24)

- **Content:** done. 604 family words / 209 themes, 122 spicy words / 54 themes (spec asks 400 / 120
  and 120 / 36). Every word in 2+ themes with 2 hints and family roots; every theme clue and
  alternate legal against its own members (checked by `content.test.ts` with the matcher).
- **Server:** done. All phases, pointing/majority, turn rules, co-op, bots, awards, recap, speech.
  65 unit tests (content, pointing, turns, rules, leaks incl. a re-dealt-key non-interference check,
  16-player budget); contract suite green; sim 600 runs (200 random / idle / mixed, 2–16 players),
  0 failures, longest 43 simulated minutes (budget 54).
- **Client:** TV + phone + PhoneStage + 🎨 layout row, EN + ES. Recorded and reviewed passes
  p01–p06 (`reports/design/record-review/spy-grid/`, gitignored). Latest: 0 hard cuts, no dead span
  in play, TV long frames 5.5 % on the capture rig (a shipped game, Lightning Round, measures 5.7 %
  on the same rig).
- **Not done yet:** hands-on touch abuse pass, 200 % / SE / sideways / five themes / Spanish
  screenshot matrix, reduced-motion pass, remote-phone (needs F4), speech-lab pass (needs F6),
  review package.

## Conflicts with the spec (main is the truth) — for the owner

1. **Co-op failed mission crowns nobody (SPEC §9.11, P03 §5.7) vs the platform.** The sim invariant
   requires `winnerIds` non-empty, and `GameClientModule` has no per-game results headline. Today a
   failed mission ties everyone (all score the agents found); the TV's win banner and every phone
   say "Mission failed". _Proposed fix (platform):_ allow empty `winnerIds` for games tagged co-op,
   and let a game name its results headline.
2. **TV guess timer.** Spec: normal digits during `guess`. The shell's normal timer adds a ~140 px
   row, so the whole board jumped down when guessing opened and back up at the next clue. All board
   phases use `quiet` (one shell height); the guess seconds are drawn in the clue bar with the same
   last-5-s red + `countdown` tick.
3. **TV card size.** Spec 340×130; the stage below the shell chrome, with the team banners and the
   history column, gives ~250×105. Words fit their card (container-query sizing, 48 px → 36 px for
   long words).
4. **Phone grid word size.** Spec 13 → 11 px; a 10-letter word in a 393-wide grid cell fits only at
   ~9–10 px. Words now size to their cell (never clipped); list mode below 380 px or at large text.
5. **Phase id `turn-end`** (spec `turnEnd`): the dev preview route (and every other game) uses
   kebab-case ids.
6. **Bot spymaster:** takes the best theme only when its score ≥ 1, else the one-agent hint (spec:
   best theme covering ≥ 1 own agent even when enemies make it negative).

## Stand-ins (swap when the owner's piece lands)

| Piece                                                            | Owner                  | Stand-in                                                                                                                                |
| ---------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `match` (normalize, stem, sameAnswer, isLegalClue)               | Foundation F5          | `games/spy-grid/server/match.ts` — written to audit errata #15/#16/#25–#27/#31                                                          |
| `teamsFromSeed`, `majorityPick`, `rotation`                      | Foundation F7          | `server/helpers.ts` (`[value, rng]` returns)                                                                                            |
| `toSpeakable` + fixed-clip pipeline                              | Foundation F6          | `server/speech.ts`: fixed lines are live readings prefetched at start (≤ 10 pending)                                                    |
| presence (`ctx.presence`, `canSeeTv`, per-player stage)          | Foundation F4          | none: phone-only rooms use PhoneStage; remote phones wait for F4                                                                        |
| manifest `icon` 🗂️, `howToPlay`, `presence: anywhere`, `addedOn` | Foundation F2          | not in `manifest.json` (main's schema would strip them) — add on merge                                                                  |
| `WordGrid`                                                       | Spy Grid (mine)        | **done**: `packages/game-sdk/src/pack/word-grid/` → `@partybox/game-sdk/ui/word-grid` (tests: `packages/client/src/word-grid.test.tsx`) |
| `TeamBanner`                                                     | Tune In                | `client/TeamBanner.tsx`                                                                                                                 |
| `SecretCard`                                                     | Imposter               | the Show key cover in `client/SpyKey.tsx` (tap to toggle, hides 20 s after the last touch)                                              |
| team tokens `--pb-team-sun/moon`                                 | Foundation (audit #52) | CSS falls back to `--pb-accent` / `--pb-info`                                                                                           |

## Harness notes

- Contract `settingsVariants` are two (co-op; random teams + 2 rounds + 2 assassins + spicy + no reader).
  With four, the 16-player "terminates" runs took 10–31 s inside the suite on a loaded box (the same
  games replay in < 1 s outside it) and hit the 20 s limit. Bingo's contract run timed out the same way
  under load and passes alone in 1.2 s.
- Recording frame timing on this box: a shipped game (Lightning Round) reads 5.7 % long frames; Spy
  Grid now 5.5 %. Board cards are flat until they turn (25 permanent 3D layers cost frames).
- The reader is audible in recordings (TV trace: clips for "Sun goes first", each clue, each flip line
  330 ms in, the turn's end 300 ms after its sweep).

## Decisions made

- **Simulator note (§9.18):** the sim only plays defaults plus the declared `settingsVariants`, so
  it never combines the slow extremes; I did not cap the ranges or raise `estimatedMinutes`.
- **Sim/e2e seats that are not bots lead** (they play people); bots follow people.
- Spectators receive the TV view (they see a card at stage 1, like the TV).
- `mode: teams` with fewer than 4 players plays co-op (§9.6 rule 2 cannot hold).
- Reactions float 5 s on the TV and phones; a remount resumes the float from the server time.
- Fixed voice lines prefetched for the room's reader; the TV plays the flip line 330 ms in, when
  the turning card shows its face.
- The TV's board phases are all `quickInto` (the shell remounts the stage each phase; no rise, a
  quick ghost), and nothing that persists across phases animates on mount.
- Fixtures are hand-built (a guess with pointers and a reaction, a bystander flip, an assassin win)
  so previews show real moments.
