# Live events: the owner's picks (2026-09-25)

Source: the options page https://claude.ai/artifact/2TjpEJDDYq6GvTzRnqCgGg (db collection `picks`).
Live events are a game-setting toggle; twists are a second toggle, and when on each event
gets one random twist that makes sense for it.

## Rules that apply to every event

- Before each event: a clear "how it works + how it pays" card, then everyone sets their chips
  and readies up. The event only runs once all are in (race note, ghost note, keno note).
- Bets lock before the reveal starts; no adding to a bet at the last moment (wires note).

## Kept events (15)

| Event            | Owner's note                                                                                                     | What I'll build                                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Animal race      | Explain before each race; ready up with chips before it runs                                                     | Rules card + chip/ready step; random 4 of 10 animals, coloured lanes                    |
| Prize wheel      | More 3D, cooler, many more emoji prizes, random subset each spin                                                 | Tilted 3D wheel with rim lights and a ticking pointer; pool of ~20 prizes, 4–6 per spin |
| Dice, 3D         | Good; dice go off screen in the throw                                                                            | Keep the throw inside the table bounds                                                  |
| Three doors      | Players choose their chip amount; win pays ×2                                                                    | Chip picker, then pick → host opens a goat → stay/switch, ×2                            |
| Briefcases       | Brainstorm how it works with many players                                                                        | Needs a design pass (options below)                                                     |
| Shell game       | Solo cups, real-looking ball; parimutuel pool; speed tiers with taunts                                           | See "Shell game" below                                                                  |
| Plinko           | Players choose where to drop; better ball/coin look                                                              | Each player picks a drop column; shiny coin sprite                                      |
| Higher or lower  | Kept, but maybe a round of blackjack everyone can play                                                           | Build as blackjack: everyone vs the dealer, hit/stand on phones                         |
| Lucky numbers    | Like KENO, Bingo-style balls, a tray for winning numbers, payouts clear up front                                 | Keno board + Bingo ball draw + pay table shown before picks                             |
| Penalty shootout | —                                                                                                                | As described                                                                            |
| Defuse the bomb  | No adding to your bet at the last cut; needs more testing                                                        | Move-your-bet allowed only before the last two wires; sim the odds first                |
| Hot potato       | Press the potato on your phone to pass it; pops at a random time between 3 and 30 s (like the Scribblenauts one) | Holder's phone shows the potato; tap passes; bets on who is holding it at the pop       |
| Tug of war       | Tap race on phones; team known before betting; each tap is weighted by your share of your team's bet             | See "Tug of war" below                                                                  |
| Ghost hunt       | Rules and payouts clear before                                                                                   | Pay table on the rules card                                                             |
| Coin-flip streak | —                                                                                                                | As described                                                                            |

## Deleted (9)

Claw machine, slot reels, dart throw, magic 8-ball, fishing pond, treasure dig, poker flop,
photo finish, the original auction.

## Twists (all 6 kept, as a toggle)

The crowd sets the odds, early-bird odds, peek for a price (price scaled to how strong the hint
is), split your stake, double or nothing, insurance. Only twists that fit the event are offered
(tug of war: no split stake).

## Shell game (owner's spec)

- Parimutuel pool: winners split the whole pool in proportion to their stakes
  (A 50 + C 25 right, B 25 wrong → A gets 2/3 of 100, C 1/3). All wrong or all right → everyone
  gets their stake back.
- Shuffle speed rises with the pool: breakpoints at ×2, ×3, ×5, ×8, ×10 speed, each with its
  own animation, more chaotic screen visuals the higher it goes, and taunts from a pool per tier.
- Red solo cups, a proper ball.

## Tug of war (owner's spec)

- Teams are assigned and shown before betting.
- Each player's tap counts as (their bet / their team's total bet), so a team's weights add to
  100 %. A player who bets 0 taps for nothing.
- Ends when the rope is fully pulled or the timer runs out; the side ahead wins.

## Briefcases with many players: options to take to the owner

- A. One shared board: each player holds their own case; the TV opens cases for everyone;
  after each one every player gets their own banker offer and may take it (then they watch).
- B. Turns: each player in turn opens one case; offers go to everyone still holding.
- C. Small stage: 2–3 players per event hold cases, the rest bet on whether they will beat the
  banker.
  Recommendation: A (no waiting, everyone decides every beat).

## Status

- 2026-09-25: the **Live events** setting is built for the animal race, the 3D dice and the prize
  wheel (every other ordinary box becomes an event; the grand box stays a box). Recorded in
  reports/design/loop/21–22. Next: doors, then the phone-played events (hot potato, tug of war,
  shells), then the rest of the kept list; twists after that.
- 2026-09-25: **Three doors** built (phase `swap`): everyone bets chips on a door (×2); the host
  opens a goat door, preferring one nobody backed; each bettor stays or switches on the phone (a
  bettor whose door opened must move; undecided = stays, or the lower closed door if forced);
  then every door opens. Recorded in reports/design/loop/23.
