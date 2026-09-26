# Blind Auction — review package (round 1)

Branch `game/blind-auction` · worktree `C:/dev/partybox-game-blind-auction` · 2026-09-24. Media is
under `reports/design/record-review/blind-auction/` (PNG/WebM are gitignored; the JSON reports and
logs are committed).

## Five lines

1. The whole game plays: sealed and Live bidding, eight to twelve lots, the Grand Lot, heists, swaps,
   traps and all seven outcomes, awards and a recap, 2–16 players, bots welcome.
2. Content: 60 normal + 20 wild + 12 grand + 20 spicy lots, family-safe by default, balanced (≥ 90 %
   of normal lots worth 40–150 at 100 coins), every name and flavour line voice-checked.
3. Proven by 71 tests (68 game + 3 BidPad) (incl. non-interference proofs that no outcome or sealed bid reaches a view
   early), the contract suite, and the sim (200 random + 200 idle games, ≤ 3.6 min each).
4. Recorded 15 passes on the real clock (TV + phones, video + audio trace, dead-air, frame timing,
   touch abuse, SE / 200 % / sideways / 5 themes / Spanish / 16 players / phone-only / pause /
   reconnect) and fixed everything they showed — list below.
5. Nothing is merged to main; `pnpm verify` is green on the branch.

## What to look at

| Moment                                       | Where (under `reports/design/record-review/blind-auction/`)                               |
| -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| A sealed round, TV + phone                   | `p10/video/tv/round.webm`, `p10/video/phone/round.webm` (wild + spicy, 6 players)         |
| Live bidding with going-once                 | `p03/video/tv/round.webm`; 16 players + pause: `p13-16p-live/`                            |
| Phone-only room (PhoneStage)                 | `p11-phoneonly/video/phone/round.webm`, sheets `p11-sold-phone.png`, `p11-flip-phone.png` |
| Heist / trap / unsold flips                  | `p10/frames-flips.png`, `p15-tv-a.png`                                                    |
| Every screen, SE / 200 % / sideways / themes | `p04-matrix/`, `p06-matrix/` (tiles `se-all.png`, `f200-all.png`)                         |
| Spanish                                      | `p09-es/`, `p08-tv.png`, `p09-se.png`                                                     |
| 16 players fit                               | `p14.png`                                                                                 |
| Touch abuse (13/13)                          | `p05-touch/touch.json` + screenshots                                                      |

## Gates (last recordings)

- Dead air: TV — the lot orbit fix removed the last span (`p10`: one 1.7 s span in a lot before the
  fix); no hard cuts in any pass. Phones — only the deliberate "👀 Watch the TV" and the shell's
  results screen hold longer than 3 s.
- Frame timing: long-frame share 2–5 % and occasional 0.7–2.6 s stalls **on this PC while nine other
  sessions record**; each stall lined up with host load (no game work in flight), and passes on a
  quieter moment show none (`p02`, `p10`: worst 83–117 ms). To re-measure on a quiet machine.
- Sound: every phase cue lands on its frame (game-owned cues: the card on the deal, `phase` under
  "Place your bids!", `wager` / `countdown` per raise and stage, the hammer on the stamp, the flip's
  cue on the turn); readings and fixed lines play on their beats (`p03/trace-tv.json`).

## Fixed during the passes

TV pair re-centred at one panel width; sold opens on its header, the tie's winner tops the ladder,
the winning bid is no longer hidden; the flip turns in 3D over 850 ms, shows who paid from its first
frame, headlines tell the story once; game-owned cues (mapped phases re-chimed on every re-armed
deadline); "Going once / twice" sound again after each new bid; `wager` at most every 400 ms;
BidPad pad-first with a one-line title and compact hints, two columns sideways; fixed-px phone card;
SE and Spanish fits; the table sizes to the stage (a 16-player strip takes four rows); a continuous
card orbit and staggered chips so a lot never reads as dead air; "No takers!" has a rocking gavel.

## Decisions (round 2 — the owner: "use your intuition, document it")

1. **Music never stops.** One low caper playlist (Sneaky Snitch, Hep Cats, George Street Shuffle,
   chained, level 0.18) plays from the intro to the last flip without a break — no per-phase beds.
   Proven in `p16-music/trace-tv.json`: one `music:start` at the intro, no stop until the results.
   The auctioneer and every cue play over it (clips never duck it).
2. **What the VIP's Skip does** (the host bar and the ★ menu show the label):
   intro "Let's go" → the first lot · lot "Skip to bidding" → bidding opens · bid "Close bidding" →
   the ladder with the bids so far · live "SOLD!" → the hammer at the standing bid (no bid: no
   takers) · sold "Flip the card" → the flip (the outcome still applies) · flip "Next lot" / "See
   results". Pause freezes every clock, the going-once clock included.
3. **Heists skip players who have left**; a player who is only reconnecting can still be robbed.
   Swaps already skip players who left (spec).
4. **Strip coins pop** to their new value (the shell's chip); the count-up happens on the stage's
   purses. No shell change.
5. **BidPad ships with the game** (subpath `@partybox/game-sdk/ui/bid-pad`, pack layout
   `packages/game-sdk/src/pack/bid-pad/`, the same shape Imposter and Tune In use).
6. **Fixed voice lines** come from the host's speech cache until F6's `render-clips` reaches main;
   then they move to rendered WAVs.
