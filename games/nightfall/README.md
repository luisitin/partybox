# Nightfall 🌙

The full spec is `docs/game-pack/nightfall/SPEC.md` (Part 06); this README is the contract the
code keeps. Build notes and stand-ins: `docs/game-pack/nightfall/NOTES.md`.

## Overview

Classic hidden roles (Werewolf / Mafia). Secret roles on phones; at night every living player picks
someone on the same screen (wolves a victim, the seer a check, the doctor a protection, everyone
else a hunch); dawn tells only deaths; by day the village argues and votes someone out. Village wins
when no wolf is left; wolves win when they equal the rest, or survive day `maxDays`.

## Players

6–16, about 20 min. Bots welcome (`supportsBots`): they act at night, vote, shoot, type last words
and post canned lines, each decided from its own phone view. A wolf bot never picks before a
connected human packmate and then follows them. Best with 6+ humans (bots cannot argue).

## Phases

| Phase       | Ends when                                                            |
| ----------- | -------------------------------------------------------------------- |
| `roles`     | every connected player tapped Got it, 20 s, or VIP                   |
| `night`     | every living connected player picked, `nightSeconds`, or VIP         |
| `dawn`      | paced steps: sunrise → the news → role cards flip (≈ 8 s), or VIP    |
| `hunter`    | the dead hunter shot (then its reveal step), 20 s (no shot), or VIP  |
| `day`       | more than half of the living tapped Ready, `daySeconds`, or VIP      |
| `vote`      | every living connected player voted, `voteSeconds`, or VIP           |
| `runoff`    | a tie at the top: the tied only, 20 s, or VIP                        |
| `verdict`   | paced steps: ballots land → spotlight → card flips (≈ 8 s), or VIP   |
| `lastWords` | remote-text only: the eliminated player's line (+ 5 s), 20 s, or VIP |
| `end`       | 12 s or VIP, then `done` (results)                                   |

Order: roles → night → dawn (→ hunter) → day → vote (→ runoff) → verdict (→ lastWords → hunter) →
night … A win check runs after every death and departure and can jump to `end`. Paced steps wait
for the narrator's reading (never more than 12 s) and re-time when it arrives.

## Inputs

`ready` (roles: got it; day: toggle) · `night {target}` (any living; the phone refuses picks the
role may not make: a packmate or self for wolves, self for seer and villager side, last night's
player for the doctor — the server ignores them) · `post {text}` (town board on, 3 per day, 80
chars kept) · `vote {target | 'none'}` (resend to change) · `shoot {target}` (the dying hunter) ·
`lastWords {text}` (the eliminated player, remote-text). Ghosts and spectators are ignored.

## Scoring

Every member of the winning side scores 1, dead or alive; the jester alone scores 1 when voted out.
Scores never go down. Win check order: jester voted out → no wolves → wolves ≥ the rest → day
`maxDays` over (wolves). Awards (skipped when nobody earned one, ties share): 🔮 Sharp Eyes (seer
found a wolf), 🩺 Life Saver (doctor saved someone), 🗳️ Wolf Hunter (most day votes on wolves, 2+),
🎭 Best Liar (wolf alive 2+ days with the fewest votes), 👻 First to Fall.

## Edge cases

- Wolves split evenly: the rng picks among the tied targets; no wolf picks: a quiet night.
- Vote: No one level with or ahead of the top = nobody; a tie at the top = one runoff; still tied =
  nobody. A dropped player can still be voted for.
- A player who leaves dies at the next dawn or verdict announcement (role shown if revealed); a
  departing hunter does not shoot.
- The seer's result survives the seer's death (shown on the ghost screen).
- One connected player, everyone idle: every phase ends on its clock; idle games end at `maxDays`.
- Late joiners are spectators and get exactly the TV view. Pause stops the night and day clocks.

## Settings

`flavour` village|mafia · `wolves` auto|1–4 (≤ a third) · `roles` multiselect seer, doctor, hunter,
jester (default seer+doctor; the jester needs 7+) · `revealRoles` on · `ghostsSeeAll` off ·
`hunches` on · `townBoard` auto|on|off (auto = remote-text) · `nightSeconds` 45 (30–60) ·
`daySeconds` 150 (60–240) · `voteSeconds` 30 (20–45) · `maxDays` 6 (4–8) · `reader` fable (every
voice, none). The four role switches share one multiselect because the manifest allows 12 settings.

## Content

`content/flavours.json` (both flavours: every role, side, narrator and live line),
`content/botlines.json` (40 accusations, 20 defences, 10 seer claims, 10 last words, 10 generic;
family-friendly, ≤ 80 characters with a 16-character name, `{name}` plus flavour tokens),
`content/pronunciations.json` (the reader's fixes). Every flavour string has Spanish in
`client/strings.ts`; narrator clips stay English. State at 16 players with the board on stays under
40 KB (a test fails above 80 KB).
