# Blind Auction

Bid on mystery lots. Treasure or trap? The pack's most openly competitive game. Full design:
`docs/game-pack/blind-auction/SPEC.md`; this file is the game's spec as built (checked by `pnpm verify`).

## Overview

Everyone starts with 100 coins. Each lot is a face-down card with a hint that lists every possible
outcome with a tier word (LIKELY ≥ 50 %, MAYBE 20–49 %, RARE < 20 %) — always true and complete.
Players bid in secret (or, in Live mode, openly with a going-once clock); the highest bid wins the
lot and pays the bank. The card flips: 💰 gain, 💀 trap, 🦝 heist, 🔄 swap, ✖️2 double, ↩️ refund or
🕳️ dud. The last lot is the Grand Lot (≈ 2.5× stakes). Most coins at the end wins.

## Players

2–16. Late joiners spectate. Bots welcome (`supportsBots`): each bot turns the hint into an expected
value (LIKELY 60 · MAYBE 30 · RARE 10, rescaled) and bids EV × a personality (0.5–1.1, drawn at
init) ± 10 %, from its own controller view only. Presence `anywhere`; Live mode only when the room
is `together` (read from the init context once F4 lands; until then a room counts as together).

## Phases

| Phase   | TV                                                                      | Phone                                          | Exit                                                                                     |
| ------- | ----------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `intro` | title, three steps, "Everyone starts with N"                            | how to play (PhoneStage)                       | 8 s or VIP                                                                               |
| `lot`   | "Lot 3 of 8" / THE GRAND LOT, face-down card, name, flavour, hint chips | the lot and its hint; own coins                | reading + 1 s (≤ 10 s; 6 s with no voice) or VIP                                         |
| `bid`   | card, "Place your secret bids!", chips ✓, timer                         | BidPad; own coins                              | all connected in-game players bid, `bidSeconds`, or VIP → `sold`                         |
| `live`  | card, current bid huge, bidder's face, going once / twice, ring clock   | current bid; +5 / +10 / +25 / All in           | clock (bid → 3 s → once → 2 s → twice → 2 s), 40 s cap, 8 s with no bid, or VIP → `sold` |
| `sold`  | ladder of bids lowest→highest (0.4 s apart), tie line, SOLD stamp       | Watch the TV → own line at the stamp           | step 0 (ladder) → step 1 (stamp, ≥ 2.6 s) → `flip`; VIP → `flip`                         |
| `flip`  | card flips; outcome big; heist/swap faces; strip coins count up         | Watch the TV → own line once the outcome is up | step 0 (1.1 s) → step 1 (≥ 5.2 s, waits for the amount reading) → next `lot` / `done`    |
| `done`  | results                                                                 | results                                        | terminal                                                                                 |

VIP Skip: intro → first lot; lot → bidding; bid → close bidding; live → SOLD at the standing bid;
sold → the flip (the outcome still applies); flip → next lot / results. Music: one continuous low
playlist under the whole game (no per-phase beds). `sold` and `flip` each have two beats in one phase (ADR-033); phones get their own line only at
step 1, after the TV has shown it. Strip coins follow the stage: the price leaves at the stamp, the
flip's coins move at its step 1.

## Inputs

`{ type: 'bid', amount: int 0..100000 }` (sealed; resend to change; 0 = pass) and
`{ type: 'raise', amount: int 1..100000 }` (Live; the absolute amount the phone showed). Ignored:
wrong phase or mode, spectators, players who left. Refused with a notice on that phone: a bid above
your coins ("You only have N"); a raise not higher than the standing bid (or under the opening 5) or
above your coins ("Outbid! Try again."); a raise from the high bidder ("You're already winning").

## Scoring

Score = coins at the end (never below 0). The winner pays their bid at `sold`; nobody else pays. At
`flip`: gain +N; lose −N (floor 0); steal P % (rounded down) of the richest other player still in
the game (a tie by the rng); swap totals with a random other player still in the game; double +2 ×
price; refund + price; dud nothing. Scores can go down. Ties share the win and the rank.
Awards (skipped when unearned, shared on ties): 🎲 High Roller (biggest winning bid), 🧾 Bargain
Hunter (best single profit: what the lot gave minus its price), 🦝 Master Thief (most gained from
heists and swaps), 💀 Trap Magnet (most lost to traps, ≥ 1 trap), 🛍️ Big Spender (most spent).

## Edge cases

- Sealed tie: the tied player with fewer coins wins, then the rng; submission time never matters.
- Nobody bids / all pass: "No takers!", the card still flips, no coins move.
- The winner drops or leaves before the flip: they still won; the outcome applies.
- Heist when every other player has 0: steals 0 ("Nothing to steal!"). Swap with nobody: a dud.
- Live: two raises together are processed in order; the second is refused if no longer higher.
- A drop can complete a sealed round (everyone still connected has bid). One connected player
  still plays; everyone idle: every lot goes unsold and the game ends in minutes.
- Pause freezes every deadline, the live clock included; VIP End goes straight to `done`.

## Settings

| Key          | Type    | Default  | Range / options                                            |
| ------------ | ------- | -------- | ---------------------------------------------------------- |
| `lots`       | number  | 8        | 5–12                                                       |
| `startCoins` | number  | 100      | 50–300 step 50; every amount × startCoins / 100, to 5      |
| `bidSeconds` | number  | 20       | 10–40 step 5 (sealed only)                                 |
| `style`      | select  | `sealed` | sealed, live (live only in `together` rooms)               |
| `chaos`      | select  | `normal` | calm (no heist/swap), normal (20 % wild), wild (50 % wild) |
| `grandLot`   | boolean | true     | the last lot from the Grand pool                           |
| `spicy`      | boolean | false    | half the ordinary lots from the spicy pack                 |
| `reader`     | select  | `george` | every voice, or none                                       |

## Content

`content/lots.json` (60 normal lots, chaos calm/normal, + 20 wild), `content/grand.json` (12),
`content/spicy.json` (20, grown-up names and flavour, same mechanics), `content/pronunciations.json`.
Each lot: id, name ≤ 20, icon, flavour ≤ 60, 1–3 outcomes whose chances sum to 100, a chaos tag.
`init` draws only the lots it plays, with each lot's outcome (secret until its flip); nothing else of
the packs enters state. Voice: fixed lines (Place your bids!, Going once…, Sold!, …) and live
readings (the lot, the price, the amount) through the host's speech service, keys never in a view
before their line plays; the flip's amount is requested only once the flip begins.
