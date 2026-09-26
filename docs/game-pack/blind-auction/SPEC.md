<!-- Cut from parts/04-ECHO-BLIND-AUCTION.md (received 2026-09-24). The part file is the original;
     this copy is the one game's spec, with the part's shared intro on top. -->

# PartyBox Game Pack · Part 04 — Echo and Mystery Box

_Batch 5 of 7 · read Part 00 first · games 7 and 8 of the pack._

These two games change the room's mood. Brief §14 asks for both kinds:

- **Echo** is the pack's real co-op game. Everyone wins or loses together against the deck.
- **Mystery Box** is the pack's most openly competitive and chaotic game.

Both play fully remote. Mystery Box adds a live bidding mode when everyone shares a room.

---

# Game 8 · Mystery Box 🔨

## 8.1 Pitch

|                  |                                                                                                          |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| Name · tagline   | **Mystery Box** · "Bid on mystery lots. Treasure or trap?"                                               |
| id · icon        | `blind-auction` · 🔨                                                                                     |
| Players · length | 2–16 · about 8 min · `estimatedMinutes: 8`                                                               |
| Tags             | `strategy`, `bluff`, `quick`                                                                             |
| Bots             | Welcome. They bid around each lot's expected value, worked out from its public hint, with a personality. |
| Presence         | `anywhere`; Live mode needs everyone in one room                                                         |
| Hook             | Ana pays 90 coins for the Getaway Van. It flips: a heist, and she steals 60 from the leader.             |

**`howToPlay`**

1. Everyone starts with 100 coins. A mystery lot appears with a hint of what's inside.
2. Bid in secret. The highest bid wins the lot and pays for it.
3. The lot flips: treasure, trap, heist or swap. Most coins at the end wins.

## 8.2 In plain words

Five players, with 100 coins each.

1. **The lot.**
   - The TV shows a face-down card: **Pirate's Chest**.
   - Its hint reads: "LIKELY 💰 +120 · MAYBE 💰 +300 · RARE 💀 −60".
   - Nobody knows which of those it is.
2. **Bids.** Everyone types a secret bid on their phone: Ana 90, Ben 40, Cy 0 (a pass), Dee 75, Eli 60.
3. **Sold.**
   - The TV reveals the bids from lowest to highest: "SOLD to Ana for 90!"
   - Ana pays 90 coins to the bank, leaving her with 10.
   - Nobody else pays anything.
4. **Flip.** The card turns over: 💰 +300. Ana now has 310.

**Chaos lots.** Some lots hide chaos instead of coins:

- 🦝 **Heist:** steal a share of the richest other player's coins.
- 🔄 **Swap:** trade all your coins with a random player.
- ✖️2 **Double:** get twice what you paid.
- 🕳️ **Dud:** nothing at all.

**The Grand Lot.** The last lot has bigger stakes. Most coins at the end wins.

**Live mode** (only when everyone's in one room)

- Bidding is open and rising instead of secret.
- Tap +5, +10, +25 or All in.
- Every new bid restarts the auctioneer's "Going once… going twice… SOLD!"

## 8.3 Lots and outcomes

Each lot has 1–3 possible outcomes, each with a fixed chance.

- The outcome is drawn at `init` with the state's rng.
- It is stored in state and never shown before the flip.

The card's hint lists every possible outcome, each with a tier word:

| Chance      | Tier word shown |
| ----------- | --------------- |
| 50% or more | LIKELY          |
| 20–49%      | MAYBE           |
| under 20%   | RARE            |

The possible outcomes:

| Outcome       | Effect on the winner                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------- |
| 💰 `gain` N   | +N coins                                                                                            |
| 💀 `lose` N   | −N coins, never going below 0                                                                       |
| 🦝 `steal` P% | Takes P% (rounded down) of the richest other player's coins. A tie for richest is broken by the rng |
| 🔄 `swap`     | Trades coin totals with a random other player who hasn't left                                       |
| ✖️2 `double`  | Gains twice the price paid                                                                          |
| ↩️ `refund`   | Gets the price back                                                                                 |
| 🕳️ `dud`      | Nothing                                                                                             |

Hints are always true and always complete. The only secret is which outcome the lot holds.

## 8.4 Phases

Order: `intro` (once) → `lot` → `bid` (sealed) or `live` (Live mode) → `sold` → `flip` → the next `lot`, or `done`. Before the last lot, `lot` announces the Grand Lot.

| Phase   | TV shows                                                                                                                                                                    | Phone shows                                      | Inputs                   | Ends when                               | Sound · bed                                                                         |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------ | --------------------------------------- | ----------------------------------------------------------------------------------- |
| `intro` | Title, the three steps, "Everyone starts with 100"                                                                                                                          | How to play                                      | —                        | 8 s, or VIP                             | `start` · `lounge`                                                                  |
| `lot`   | "Lot 3 of 8" (or **THE GRAND LOT**); the face-down card; its name, flavour line and hint chips, read aloud                                                                  | The lot's name and hint; own coins               | —                        | reading + 1 s (at most 10 s), or VIP    | `card` · `lounge`                                                                   |
| `bid`   | The card, "Place your secret bids!", chips ✓, timer                                                                                                                         | `BidPad`, own coins                              | `bid` (resend to change) | all connected players bid, 20 s, or VIP | `phase` · `pulse`                                                                   |
| `live`  | The card; the current bid, huge; the high bidder's face; the auctioneer's stage (going once / twice); a ring clock                                                          | Current bid and bidder; raise buttons; own coins | `raise`                  | "Sold!" after the clock (§8.6), or VIP  | `wager` on each bid; `countdown` on going once / twice · `pulse`                    |
| `sold`  | Sealed: bids rise from lowest to highest as a ladder of faces and amounts, and the top one is stamped SOLD. Live: the hammer falls on the final bid. "No takers!" if unsold | Stage, then own line                             | —                        | paced, about 5 s                        | `lock` (the hammer)                                                                 |
| `flip`  | The card flips and the outcome shows, big. Faces and coins move for heists and swaps; coin counts update on the strip                                                       | Stage, then own line                             | —                        | paced, about 6 s, or VIP                | `jackpot` (gain, double), `bust` (lose), `sweep` (heist, swap), `tie` (dud, refund) |

**Client hooks**

- `stripScores` = coins, always on. Coins are public.
- `quickInto: ['sold', 'flip']`
- `stripActive`: the high bidder during `live`; the winner during `flip`.
- `ownLocks: ['sold']`. The hammer replaces the shell's tick.

## 8.5 Screens

### TV (1920×1080)

**The lot card**

- A large face-down card, about 560×780, in the centre. Its patterned back is built from tokens: `--pb-surface-2` with `--pb-accent-2` trim.
- The lot's icon and name sit on a plate beneath it (h1), with the flavour line as a caption.
- The hint appears as chips. Each chip shows the tier word (caption) over the outcome (h2), for example **LIKELY** 💰 +120.
- Never rely on colour alone: every chip has its icon and its tier word.

**Sealed bidding**

- The card stays in the centre.
- "Place your secret bids!" sits above it.
- Chips ✓ show in the strip, and the timer runs.

**Live bidding**

- The current bid is shown at display size (128 px), with the high bidder's face and name beside it.
- Beneath it, the auctioneer's stage in h2 ("Going once…").
- A ring clock around the amount drains during each stage.
- Each new bid `pop`s the number and swaps in the new bidder's face.

**Sold (sealed)**

- Bids appear from lowest to highest as a rising ladder of faces and amounts, 0.4 s apart.
- The highest bid gets the SOLD stamp and the price.
- On a tie, the TV shows "Tie: fewer coins wins" before the stamp.

**Flip**

- The card `flip`s, and the outcome fills its face:
  - "💰 +300!"
  - "💀 TRAP −60"
  - "🦝 HEIST! Ana steals 45 from Ben", with both faces and coins flying between them
  - "🔄 SWAP! Ana ⇄ Cy", with the two coin totals trading places
  - "✖️2 DOUBLE! +180"
  - "🕳️ A dud."
- The strip's coin counts `count-up` to their new values.

**Grand Lot**

- A banner, and a gold border (`--pb-accent-2`) on the card.
- The hint shows bigger numbers.

### Phone (320×568)

**Lot**

- The lot's name, icon and hint chips.
- Own coins ("🪙 140").

**Bid (sealed):** a `BidPad` (P00 §6) with:

- the bid in large digits;
- − / + steppers of 5;
- chips: +5, +10, +25, **All in**;
- "You have 🪙 140";
- **Place bid** (resend to change);
- a secondary **Pass**, which bids 0.

A bid above your coins can't be entered.

**Live**

- The current bid and bidder at the top.
- Four big buttons: **+5**, **+10**, **+25** and **All in**. Each one shows the amount it would bid ("Bid 85").
- Buttons you can't afford are disabled, with the reason shown.
- When you're the high bidder, the buttons are replaced by "You're winning! 🔨". You can't bid against yourself.

**Sold and flip**

- At-TV phones show "👀 Watch the TV".
- Then the player's own line, for example:
  - "You won it for 90!"
  - "Outbid by Ana (90)"
  - "+300 coins!"
  - "Ben stole 45 from you"
  - "You swapped with Cy"

### PhoneStage

`phoneStagePhases: ['intro', 'sold', 'flip']`. The `lot`, `bid` and `live` phases already carry everything a player needs on the phone.

**Small-phone check:** `bid` is the tallest screen (number, steppers, four chips and two buttons, about 400 px), and it fits 320×568.

## 8.6 Bidding rules

### Sealed (default)

- Bids are whole numbers from 0 up to your coins. 0 means pass.
- The highest bid wins, and the winner pays it to the bank. Nobody else pays.
- **Ties:** the tied player with fewer coins wins, as a small catch-up. If they're still tied, the rng decides. Submission time never matters.
- **No takers:** if everyone bids 0, or nobody bids, the TV shows "No takers!". The card still flips so the room sees what it missed. Nobody gains or loses.

### Live (Live mode; `together` rooms only)

- The opening bid is 5.
- A `raise` carries the **absolute** amount the phone showed ("Bid 85"), not a step. That way, a late tap can't overpay.
- The server accepts a raise only if all three are true:
  - it's higher than the current bid;
  - it's within the bidder's coins;
  - the bidder isn't already the high bidder.

  Otherwise the phone shows "Outbid! Try again."

- **The clock.** It runs on deadlines: the phase re-arms its own deadline for each stage.

  | Stage            | Starts                 |
  | ---------------- | ---------------------- |
  | 0 (bid accepted) | when a bid is accepted |
  | "Going once…"    | 3 s later              |
  | "Going twice…"   | 2 s after that         |
  | "SOLD!"          | 2 s after that         |

  Any new bid resets the clock to stage 0.

- **Cap:** 40 s after the lot opens, the next stage goes straight to SOLD.
- **No bids at all:** "No takers!" after 8 s.

## 8.7 Scoring

- **Score** = your coins at the end. Coins are public all game.
- The flip's outcome applies to the winner, and to the other player in a heist or swap.
- Coins never go below 0.
- Most coins wins. Ties share the win and the rank.

**Awards.** Skip an award if nobody earned it; ties share it.

| Award             | Rule                                                               |
| ----------------- | ------------------------------------------------------------------ |
| 🎲 High Roller    | the single biggest winning bid                                     |
| 🧾 Bargain Hunter | the best single profit on a lot (what it gave, minus what it cost) |
| 🦝 Master Thief   | the most coins gained from heists and swaps                        |
| 💀 Trap Magnet    | the most coins lost to traps (at least 1 trap)                     |
| 🛍️ Big Spender    | the most coins spent on winning bids                               |

## 8.8 Hidden information

| Secret                           | Who may see it                           | When it goes public |
| -------------------------------- | ---------------------------------------- | ------------------- |
| Each lot's outcome               | nobody (state only)                      | `flip`              |
| Sealed bids                      | the bidder's own phone                   | `sold`              |
| The heist victim or swap partner | nobody (chosen at the flip with the rng) | `flip`              |

**Outcomes stay in state.** They're drawn at `init`, but no view carries them. That includes ids: nothing in a view may differ depending on the outcome.

**Live bids** are public by design.

**Speech:** request the outcome line only when `flip` begins.

## 8.9 Inputs

```ts
const AuctionInput = z.discriminatedUnion('type', [
  z.object({ type: z.literal('bid'), amount: z.number().int().min(0).max(100000) }),
  z.object({ type: z.literal('raise'), amount: z.number().int().min(1).max(100000) }),
]);
```

**Ignored:**

- inputs in the wrong phase or mode;
- inputs from spectators;
- a `raise` in sealed mode, or a `bid` in Live mode.

**Rejected, with copy shown to the player:**

- a sealed bid above your coins: "You only have 140";
- a raise that isn't higher than the current bid, or is above your coins: "Outbid! Try again.";
- a raise from the current high bidder: "You're already winning".

## 8.10 State and views

```ts
type AuctionState = {
  phase: PhaseState;
  rng: RngState;
  cfg: ResolvedSettings;
  presence: Presence;
  seats: PlayerId[];
  left: PlayerId[];
  live: boolean; // Live mode in effect (together rooms only)
  lots: { item: LotItem; outcome: number }[]; // outcome index SECRET until flip
  l: {
    idx: number;
    bids: Record<PlayerId, number>; // sealed: SECRET until sold
    high: { by: PlayerId; amount: number } | null; // live: public
    stage: 0 | 1 | 2;
    openedAt: number;
    winner: PlayerId | null;
    price: number;
    effect: { kind: string; amount: number; other?: PlayerId } | null; // filled at flip
  };
  coins: Record<PlayerId, number>;
  stats: Record<
    PlayerId,
    { biggestBid: number; bestProfit: number; thief: number; trapped: number; spent: number }
  >;
  speechMs: Record<string, number>;
};
```

**Budget:** under 12 KB at 16 players. A test fails above 32 KB.

**`tvView`** contains:

- the lot number, and the card's name, flavour line and hint chips;
- the Grand Lot flag;
- everyone's coins;
- chip statuses;
- in Live mode: the current high bid, the bidder and the stage;
- at `sold`: all bids (sealed) or the final bid, plus the winner and price;
- at `flip`: the effect.

**`controllerView(p)`** contains:

- the lot's name and hint;
- own coins and own sealed bid;
- in Live mode: the current high bid, the bidder, and which raises are affordable;
- the player's own line, once the TV has shown it.

## 8.11 Bot

Bots read the same hint as everyone else, and turn it into an expected value (EV):

- **Chances.** Tier words become chances: LIKELY 60%, MAYBE 30%, RARE 10%. Rescale them so the lot's outcomes sum to 100%.
- **Outcome values:**

  | Outcome | Value to the bot                                             |
  | ------- | ------------------------------------------------------------ |
  | gain N  | N                                                            |
  | lose N  | −N                                                           |
  | heist   | P% of the richest other player's coins                       |
  | swap    | the average of the other players' coins, minus the bot's own |
  | double  | 100 (valued as if the bot paid 50)                           |
  | refund  | 50 (valued as if the bot paid 50)                            |
  | dud     | 0                                                            |

  Scale every value by `startCoins / 100`.

**Personality:** at `init`, each bot gets a factor between 0.5 and 1.1, from cautious to reckless.

**Sealed bidding**

- Bid = EV × factor, plus rng noise of ±10%.
- Round to the nearest 5, and clamp between 0 and the bot's coins.
- If EV is 0 or less, the bot passes.

**Live bidding**

- The bot keeps raising by the smallest step while the next amount is no more than EV × factor and within its coins.
- It waits a moment between raises, using the host's timing strategies.

**Bots never read the stored outcome.**

## 8.12 VIP moments

| Phase          | VIP control                                         |
| -------------- | --------------------------------------------------- |
| `intro`        | **Let's go**                                        |
| `lot`          | Skip to bidding                                     |
| `bid`          | Skip closes bidding                                 |
| `live`         | Skip = **SOLD!** at the current bid                 |
| `sold`, `flip` | **Next lot**, or **See results** after the last lot |

## 8.13 Voice

The reader defaults to `george`, playing the auctioneer. Fixed clips do most of the work.

**Fixed clips**

- "Place your bids!"
- "Going once…" and "Going twice…"
- "Sold!"
- "No takers!"
- "Bidding is closed."
- "It's a trap!"
- "Jackpot!"
- "A heist!"
- "Swap!"
- "Double it!"
- "Money back."
- "A dud."
- "The grand lot!"

"Going once" and "Going twice" must be clips, because they have to start instantly. A live reading could lag behind the clock.

**Live readings**

- At `lot`: "Lot three: the Pirate's Chest." P00 §5.3 respells "Pirate's" as "Pirates" for the voice.
- At `sold`: "Sold, for ninety coins."
- At `flip`: the amount, when there is one ("Plus three hundred!"). Request it only when `flip` begins.

**Prefetch:** during `flip`, the next lot's opening line. It becomes public at the next `lot` anyway.

## 8.14 Settings

| Key          | Type    | Default  | Options            | Notes                                                                                                    |
| ------------ | ------- | -------- | ------------------ | -------------------------------------------------------------------------------------------------------- |
| `lots`       | number  | 8        | 5–12               |                                                                                                          |
| `startCoins` | number  | 100      | 50–300, step 50    | Lot values in the pack assume 100. The game scales every coin amount by `startCoins / 100`, rounded to 5 |
| `bidSeconds` | number  | 20       | 10–40, step 5      | Sealed only                                                                                              |
| `style`      | select  | `sealed` | sealed, live       | Live only when presence is `together`. Otherwise the game uses sealed, and the settings screen says why  |
| `chaos`      | select  | `normal` | calm, normal, wild | calm: no heists or swaps. wild: draws more heist, swap and trap lots                                     |
| `grandLot`   | boolean | true     |                    | The last lot comes from the Grand pool                                                                   |
| `spicy`      | boolean | false    |                    | Adds spicy-flavoured lots. Only names and flavour lines change; the mechanics are the same               |
| `reader`     | select  | `george` | every voice, none  |                                                                                                          |

**Time check:** the slowest legal game is 12 × (10 + 40 + 5 + 6) s, about 12 minutes. That's inside the limit of 3 × 8.

## 8.15 Presence

| Mode           | Behaviour                                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| `together`     | Sealed by default; Live mode allowed                                                                     |
| `remote-voice` | Sealed only: network lag would make live bidding unfair                                                  |
| `remote-text`  | Sealed only                                                                                              |
| phone-only     | `intro`, `sold` and `flip` run on `PhoneStage`. Live mode is allowed only if the room is also `together` |

## 8.16 Content

**Files:** `content/lots.json`, `content/grand.json`, `content/spicy.json`, `content/pronunciations.json`.

A normal lot:

```json
{
  "id": "ba-chest-003",
  "name": "Pirate's Chest",
  "icon": "🏴‍☠️",
  "flavour": "Found under a palm tree. Smells faintly of rum.",
  "outcomes": [
    { "type": "gain", "amount": 120, "chance": 60 },
    { "type": "gain", "amount": 300, "chance": 30 },
    { "type": "lose", "amount": 60, "chance": 10 }
  ],
  "chaos": "normal"
}
```

A wild lot:

```json
{
  "id": "ba-heist-011",
  "name": "Getaway Van",
  "icon": "🚐",
  "flavour": "Engine running. Nobody's asking questions.",
  "outcomes": [
    { "type": "steal", "percent": 30, "chance": 60 },
    { "type": "dud", "chance": 40 }
  ],
  "chaos": "wild"
}
```

**Rules for lots**

- Each lot has 1–3 outcomes. Chances are whole numbers that sum to 100.
- **Balance:**
  - At 100 starting coins, most normal lots should have an expected value between 40 and 150 coins, so bids matter.
  - Every lot has at least one outcome worth wanting.
- **`chaos` tag:**
  - `calm` lots use only gain, lose, double, refund and dud.
  - `wild` lots lean on heists, swaps and traps.
- **Text limits:** names up to 20 characters; flavour lines up to 60. Both must pass the speech lab.

**Pack sizes**

| Pool                      | Lots |
| ------------------------- | ---- |
| Normal                    | 60   |
| Wild                      | 20   |
| Grand (values about ×2.5) | 12   |
| Spicy-flavoured           | 20   |

## 8.17 Edge cases

| Situation                           | What happens                                                             |
| ----------------------------------- | ------------------------------------------------------------------------ |
| Nobody bids                         | "No takers!"; the card flips; no coins move                              |
| The winner drops before the flip    | They still won, and the outcome applies                                  |
| The winner has left the game        | The outcome still applies to their coins, because they're in the results |
| Heist when every other player has 0 | Steals 0: "Nothing to steal!"                                            |
| Swap with nobody eligible           | Counts as a dud                                                          |
| Sealed tie                          | Fewer coins wins, then the rng decides                                   |
| Live: two raises arrive together    | Processed in order. The second is rejected if it's no longer higher      |
| 2 players                           | A head-to-head duel; everything works                                    |
| Late joiner                         | Spectator                                                                |
| Everyone idle                       | Every lot goes unsold, and the game ends within minutes                  |
| Pause in Live mode                  | The helper freezes the clock and the stage                               |

## 8.18 Tests to add

**Sealed bidding**

- The highest bid wins and pays.
- Ties go to fewer coins, then the rng.
- Bids of 0.
- Bids above a player's coins are rejected.

**Live bidding**

- Raises use absolute amounts.
- A raise is rejected when it isn't higher, is over the player's coins, or comes from the current high bidder.
- The stage clock resets on each bid.
- The 40 s cap.
- No bids at all.

**Outcomes**

- gain, lose (floor 0), steal from the richest other player (including ties), swap, double, refund, dud.
- `startCoins` scaling.

**Leaks**

- The outcome never appears in any view before `flip`.
- Sealed bids never appear before `sold`.
- The outcome's reading key is never requested before `flip`.

**Presence:** Live mode is refused outside `together`.

**Bots**

- EV bidding varies by personality.
- No bot reads the stored outcome.

## 8.19 Recap

"Mystery Box · <date>" contains:

- for each lot: its name and hint, every bid, the winner and price, the outcome, and the coins afterwards;
- final coins and awards.
