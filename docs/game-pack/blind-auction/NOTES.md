# Mystery Box — build notes

Session: Mystery Box · worktree `C:/dev/partybox-game-blind-auction` · branch `game/blind-auction` ·
harness port 42380. Started 2026-09-24 (after the 30-minute foundation wait).

## Where it stands

| Stage                                    | State                                                                       |
| ---------------------------------------- | --------------------------------------------------------------------------- |
| 1 Content                                | done: 60 normal + 20 wild (`lots.json`), 12 grand, 20 spicy, pronunciations |
| 2 Server logic + tests                   | done: 68 unit tests, contract suite green, sim 200 random + 200 idle clean  |
| 3 Client (TV, phone, PhoneStage, BidPad) | done: EN + ES, 5 themes, SE / 200 % / sideways fits, 16-player TV fit       |
| 4 Record → review → fix                  | 15 passes so far (see REVIEW.md); keeps going                               |
| 5 Review package                         | `REVIEW.md` round 1, waiting for the owner                                  |

Measured: 16 players, wild + spicy, 12 lots → state 7.6 KB (budget 12 KB), largest view 2.3 KB
(4 KB). Sim: 198 s simulated per game with random bots (max 215 s), 294 s all idle — far inside
3 × 8 min.

## Stand-ins (the foundation is on branch `foundation`, not on main yet)

| Needed                      | Stand-in here                                                                                                                                                                                                                   | Swap when                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| F2 manifest fields          | `icon`, `howToPlay`, `presence`, `addedOn` cannot go in `manifest.json` yet (zod strips them; the contract deep-equals). Ready below.                                                                                           | F2 lands                           |
| F4 presence in `init`       | `server/index.ts` `presenceOf` reads `ctx.presence` if present (the ADR-047 shape) and defaults to together. PhoneStage follows the engine's `phoneOnly` stamp, which F4 makes per-phone (audit #13) — no game change needed.   | F4 lands: drop the cast            |
| F6 `toSpeakable`            | `server/speak.ts`: the rules this game's lines need (quotes, overrides, possessives, years, times, numbers, a.m.). Pack test checks every name and flavour line.                                                                | F6 lands: import the SDK's         |
| F6 fixed clips pipeline     | Fixed lines ("Going once…") are requested through `speech()` early (intro, then 10 at a time) and served from the host's speech cache — every voice, Zira included, no out-of-repo script. They play by URL like Bingo's clips. | `render-clips` lands: move to WAVs |
| F7 `BidPad` (mine to build) | Built in `packages/game-sdk/src/pack/bid-pad/` as a subpath export (`@partybox/game-sdk/ui/bid-pad`, audit #23) so it never lands in the entry chunk.                                                                           | —                                  |

Manifest fields to add with F2:

```json
"icon": "🔨",
"howToPlay": [
  "Everyone starts with 100 coins. A mystery lot appears with a hint of what's inside.",
  "Bid in secret. The highest bid wins the lot and pays for it.",
  "The lot flips: treasure, trap, heist or swap. Most coins at the end wins."
],
"presence": { "needs": "anywhere", "note": "Live bidding needs everyone in one room." },
"addedOn": "2026-09-24"
```

## Decisions (owner, round 2: "use your intuition, document it" — see REVIEW.md)

- **Music:** one continuous low playlist for the whole game (owner: never stop the music).

- **Chaos mix:** calm = only calm-tagged lots; normal = 20 % of the ordinary slots from the wild pool;
  wild = 50 %. Spicy on = half the ordinary slots from the spicy pack (its wild-tagged lots join the
  wild pool). The Grand Lot follows chaos too (calm → a calm grand lot).
- **Heist victim:** the richest other player _still in the game_ (players who left are skipped, like
  the spec's swap rule), so a heist never robs an empty chair.
- **VIP skip in `sold`** goes to the flip ("Flip the card"), not straight to the next lot — the
  outcome must still apply. `flip` → "Next lot" / "See results".
- **Two beats per reveal phase** (ADR-033 re-arm): `sold` step 0 = ladder, step 1 = stamp; `flip`
  step 0 = card turning, step 1 = outcome up. Own lines and the strip's coins wait for step 1, so
  the phone never leads the TV and the strip never spoils the stamp.
- **Readings:** "Lot three: the Pirate's Chest. <flavour>" (grand: "The grand lot! The …");
  "Sold, for ninety coins." on the stamp if it is ready by then, else the "Sold!" clip; flip = its
  fixed line ("Jackpot!") on the turn, then "Plus three hundred!" if ready within 3.5 s (the card
  waits for it, ≤ 6 s extra). A lot reading later than 3 s in is dropped for that lot.
- **Ladder pacing:** 0.4 s per bid, closing up so a 16-bid ladder never passes 4 s.
- **Award ids** carry the player (`high-roller:p2`) so shared awards never collide as React keys.

## Conflicts found (none blocking)

- Spec §8.4 says `stripScores = coins, always on`; the SDK hook is a function per view. Coins are
  always on the strip; what moves with the stage is the _value_ (see "Two beats").
- Spec §8.5 phone "Four big buttons … Each one shows the amount it would bid" + §8.6 "opening bid
  is 5": the opening +5 / +10 / +25 bid 5 / 10 / 25.

## Harness notes (for the next pass)

- Probes (`capture-ba`, `touch-ba`, `es-ba`, `frames-ba`) live in the session scratchpad, copied into
  `packages/e2e/src/design/*.tmp.ts` only while they run (typecheck sees them otherwise).
  `capture-ba` = capture-loop + the platform's audio trace (`trace-tv.json`) + `PB_PHONE_ONLY=1`.
- Two server tests are timing-based and fail only under this PC's load (push-dedupe "a VIP action
  that changes nothing", sockets "rate limits a flood of inputs"); both pass alone every time.
- Mapped TV phases re-chime whenever their deadline moves: every phase that re-arms (lot, live,
  sold, flip) is mapped to `silence` or left unmapped, and the game plays its own cues.

## Payouts: at or just above fair odds (decided 2026-09-25)

Reviewers pointed out that every option paid a little under fair odds (0.92 / chance), so the
best play was never to bet. Payouts are now fair odds rounded **up** to the tenth
(`server/odds.ts payOf`): a bet returns 1.00–1.08 of its stake on average, so betting beats
sitting out, and the long shot still pays big. Keno's table is 0 / back / ×2.2 / ×30 (≈1.01);
the doors stay ×2 (switching wins 2 in 3, the Monty Hall lesson); the shell game is a shared pot.
Decided by the game session under the owner's "decide and document" instruction.
