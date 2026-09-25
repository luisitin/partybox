# Fake-Out 🎭

## Overview

A bluffing game against a hidden truth (the owner's game pack, Part 02 — full spec in
`docs/game-pack/fake-out/SPEC.md`). A strange TRUE fact appears with a blank. Everyone types a fake
answer that sounds real; all the fakes are mixed with the truth; everyone picks the one they
believe. You score for finding the truth and for every player your fake fools. The reveal flips the
picked lies over one by one, least-picked first, with the truth last.

## Players

2–12 (`minPlayers` 2, `maxPlayers` 12), about 12 minutes at 7 questions. Plays anywhere, fully
remote too: every input phase is self-sufficient on the phone. `supportsBots: true`: a bot lies
through 💡 Suggest (the question's house lies, then the category fillers, never the same fake twice
in a game), picks uniformly at random (it cannot know the truth), and likes one option about a third
of the time — all decided from its own controller view.

## Phases

| Phase      | Ends when                                         | Timer  |
| ---------- | ------------------------------------------------- | ------ |
| `intro`    | 8 s, or VIP                                       | quiet  |
| `question` | its reading + 1 s (at most 12 s), or VIP          | hidden |
| `lie`      | every connected player has a lie in, 45 s, or VIP | normal |
| `pick`     | every connected player has picked, 25 s, or VIP   | normal |
| `reveal`   | paced steps (below); a VIP skip turns one page    | hidden |
| `scores`   | 6 s, or VIP (Next question / See results)         | quiet  |

Then the next `question`, or `done`. The reveal is one phase instance whose deadline re-arms per
step (ADR-033): each picked option, least-picked first (ties in option order), the truth last —
reading + 0.8 s stamp + 1.2 s points, clamped to 2.5–4.5 s; then the completed fact (its reading
plus 2 s); then "Nobody fell for…" (1.5 s, only when a player's lie went unpicked). A reading still
being made holds its moment at most 12 s (question) or 6 s (reveal); a failed voice never holds the
room. The drop of the last missing player closes `lie` / `pick`.

## Inputs

`{ type: 'lie', text }` (1–80 chars sent, 40 allowed; resend to change) · `{ type: 'suggest' }`
(once per question; people only when the setting is on, bots always) · `{ type: 'pick', option }`
(resend to change; never your own option) · `{ type: 'like', option, on }` (two per question, never
your own, only with likes on). Ignored: wrong phase, spectators and unknown ids, a second suggest,
unknown options, a third like.

Lies are checked in order: empty → "Type a fake answer."; over 40 characters → "Keep it under 40
characters."; the truth (`fuzzy` or better through the matcher, or containing a truth of 5+
letters) → "That's actually the truth! Write a fake one." and a Lucky Guess mark. A lie matching
another player's merges silently; one matching a house lie keeps that house lie out of the padding.

## Scoring

+1000 for picking the truth; +500 per player your lie fools (every author of a merged lie gets the
full amount); a padding ("PartyBox") lie scores nobody; the last question doubles everything when
Final Fake-Out is on. Scores never go down; ties share a rank. Points are computed as the reveal
begins and shown step by step; the strip shows them only once the reveal ends. Reason chips:
"+1000 truth", "+1000 fooled 2", "×2 final". Awards (skipped if unearned, ties shared): 🎭 Master
Liar (most fooled), 🔍 Truth Detector (most truths), 👍 Crowd Favourite (most likes), 🍀 Lucky Guess
(truth typed as a lie), 🤖 Fooled by the House (most padding lies picked).

## Edge cases

Nobody writes: the truth plus padding (at least 5 options) — every room sees 5+. A player who types
only the truth has no option but can pick. Two players with the same lie: one option, two authors,
neither may pick it. Nobody picks: only the truth step and the completed fact. A dropped player
scores nothing for that pick. Late joiners are spectators. Pause freezes the reveal step. Option ids
are drawn from the rng ("o37"), never a player id; the display form (trim, fold case, drop one
article and trailing punctuation, capitalise) makes the truth look like every lie; one seeded order
for the TV and every phone. Option readings are asked for together at `pick`; the completed fact
only at the truth step.

## Settings

`questions` 3–10 (7) · `lieSeconds` 30–75 (45) · `pickSeconds` 15–40 (25) · `finalDouble` (on) ·
`suggestions` (on) · `likes` (on) · `categories` multiselect (none ticked = all; drinking and dating
are spicy-only) · `spicy` (off) · `reader` every voice or none (Young British Man, `fable`).

## Content

`content/family.json` 158 facts across 12 categories and `content/spicy.json` 62 (drinking,
dating, bawdy laws and history) — every fact sourced and checked (`verified: true`), 6+ distinct
accepted forms, 8 house lies that pass the lie checks. `fillers.json`: 28 generic fakes per kind and
per category (the bots' last resort). `pronunciations.json`: reader overrides. `unverified.json`:
never played. State at 12 players ≈ 14 KB (16 players ≈ 16 KB).
