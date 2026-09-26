# Secret Hitler

The game's working spec (≤ 120 lines). The full design, with every rule id (R1–R22, D1–D11,
V1–V10, S1–S3), is `docs/game-pack/secret-hitler/SPEC.md`; tests are named after those ids.
Status: **M1 merged; M2 visual pass merged**. The simple discussion chat is in this follow-up;
claims, Record input, narrator, full room-mode chat and PhoneStage remain. Adapted from Secret Hitler by Max
Temkin, Mike Boxleiter & Tommy Maranges, CC BY-NC-SA 4.0 (free, non-commercial play only).

## Overview

Hidden roles. Liberals, Fascists and Hitler. Each round a Presidential candidate nominates a
Chancellor and everyone votes Ja or Nein. An elected pair secretly passes one policy from a deck
of 6 Liberal and 11 Fascist cards. Liberals win with 5 Liberal policies or by executing Hitler;
Fascists win with 6 Fascist policies or by electing Hitler Chancellor after 3 Fascist policies.
Interaction: choice + table talk. No points beyond win or lose.

## Players

5–10 (R1: 5 → 3L 1F+H, 6 → 4L 1F+H, 7 → 4L 2F+H, 8 → 5L 2F+H, 9 → 5L 3F+H, 10 → 6L 3F+H).
Bots welcome (`supportsBots`): each bot decides from its own phone view only. Late joiners
spectate and see exactly the TV's information.

## Phases

| Phase         | TV                                                        | Phone                                            | Exit                                          |
| ------------- | --------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------- |
| `seating`     | seat order, dossier reading count                         | dossier (tap to read by default), I've read it   | all connected read; hidden 3–10 min net       |
| `nominate`    | who is choosing                                           | President: picker with reasons                   | a nominee, or 90 s → random eligible (named)  |
| `vote`        | President · Chancellor, "n of m voted"                    | JA! / NEIN! (changeable)                         | every living player voted, or 45 s            |
| `voteReveal`  | every vote, tally, ELECTED/REJECTED                       | same words                                       | 6 s                                           |
| `hitlerCheck` | only when elected with 3+ F: Hitler or ✓ Not Hitler       | same                                             | 5 s                                           |
| `presDraw`    | silence banner                                            | President: 3 cards, discard 1                    | a discard, or 45 s → random (unnamed)         |
| `chanEnact`   | silence banner                                            | Chancellor: 2 cards, enact 1; Request veto (5 F) | an enactment / veto request, or 45 s → random |
| `vetoAsk`     | VETO REQUESTED                                            | President: Agree / Refuse                        | an answer, or 20 s → refused                  |
| `enactReveal` | the policy lands; power tag                               | same words                                       | 6 s                                           |
| `claims`      | Discuss…                                                  | living players: room text chat                   | 60 s or VIP Next                              |
| `power`       | the power banner                                          | President: target picker / peek                  | a choice, or 45 s → random (named); peek 15 s |
| `powerReveal` | the public outcome; investigation pause 3 s then the file | same words                                       | 3–7 s                                         |
| `chaos`       | the top card enacted, term limits lifted                  | same words                                       | 8 s                                           |
| `gameOver`    | every role, the ending, the credit                        | own result and role                              | 15 s or VIP                                   |
| `done`        | results                                                   | results                                          | —                                             |

Order: `seating → nominate → vote → voteReveal → (hitlerCheck) → presDraw → chanEnact ⇄ vetoAsk →
enactReveal → claims → (power → powerReveal) → nominate`. A rejected vote goes back to `nominate`
with the next President, or to `chaos` when the tracker reaches 3; an agreed veto goes to `claims`
(or `chaos`). Chaos then goes to `claims` after a veto, else `nominate`. Any win → `gameOver`.
`pace` scales the timed rows (relaxed ×1.5, fast ×⅔, rounded to 5 s); reveals never change.
**VIP Skip is Last call** in `nominate`, `vote`, `presDraw`, `chanEnact`, `vetoAsk` and `power`: the
deadline drops to 10 s from now (never later) and the timeout result applies (D4); the VIP never
chooses for anyone. Elsewhere Skip moves on. Pause freezes everything.

## Inputs

`ready` · `nominate {target}` (President, eligible: R6) · `vote {ja}` (living players) ·
`discard {index 0–2}` (President) · `enact {index 0–1}` · `vetoRequest` (Chancellor, veto unlocked,
once per session) · `vetoAnswer {agree}` (President) · `target {target}` (valid for the power) ·
`peekDone` · `chat {text}` (claims only, 120 characters, 3 s cooldown). Anything else, from anyone else, or from ghosts, exiled players and spectators is
ignored. There is no undo.

## Scoring

The winning side scores 1, everyone else 0; dead members still win with their side (Fascists =
Fascists + Hitler). A game the VIP ended has no winner (all 0). Scores never go down. Awards arrive
in M4.

## Edge cases

- **Term limits (R6):** the last elected President and Chancellor can't be nominated; with 5 or
  fewer alive only the last Chancellor. Chaos clears them. A failed vote doesn't change them.
- **Tracker (R9, R10, R20):** +1 per failed vote and per agreed veto; at 3, chaos enacts the top card
  (power ignored). Any enactment resets it. Fewer than 3 cards after a session or chaos: reshuffle.
- **Special election (R16):** the chosen player presides once, then the rotation continues after
  the caller (the next seat may preside twice in a row).
- **Leaving (D7):** a seat is exiled on leave or kick, or after 120 s dropped (counted by the game
  on each event; main keeps dropped seats for the whole game, I-746 A). Hitler exiled → Liberals
  win. President exiled in `nominate` or `vote` → the candidacy passes on (tracker untouched);
  nominee exiled in `vote` → back to `nominate`, same President; a voter's vote is dropped; the
  chooser exiled in a session or power → the timeout result at once. A dropped seat just misses
  deadlines.
- **Too few (D8):** fewer than 3 alive: the side nearer its goal (L/5 vs F/6) wins; a tie is Fascist.
- **Everyone idle:** random nominations, all-Nein votes, chaos every third round; ends within
  ~73 min at normal pace (~108 min relaxed, inside 3 × 40).

## Settings

| Key    | Type                           | Default | Notes |
| ------ | ------------------------------ | ------- | ----- |
| `pace` | select relaxed / normal / fast | normal  | D1    |

Variants, presets and conditional settings (S1) arrive in M3; full room-mode chat and the reader voice in M2.

## Content

`content/about.json`: the credit line and the three how-to-play steps; `manifest.json` carries
`howToPlay`, `icon` and `presence`. No word packs: every card is a policy.
Narrator lines, headlines and bot chat lines arrive with M2/M4 (SPEC §19).
