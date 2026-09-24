<!-- Cut from parts/03-TUNE-IN-HIVE-RANK.md (received 2026-09-24). The part file is the original;
     this copy is the one game's spec, with the part's shared intro on top. -->

# PartyBox Game Pack · Part 03 — Tune In and Hive Rank

_Batch 4 of 7 · read Part 00 first · this part covers games 5 and 6 of the pack._

Both games are about **prediction**, a skill nothing in the current lineup covers (brief §14):

- **Tune In**: players place a clue on a dial between two opposites. It works from 2 players (co-op) up to 16.
- **Hive Rank**: a 5-minute game about predicting how the room orders five things.

Both play fully remote.

---

# Game 6 · Hive Rank 🐝

## 6.1 Pitch

|                  |                                                                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Name · tagline   | **Hive Rank** · "Rank five things the way the hive would."                                                                          |
| id · icon        | `hive-rank` · 🐝                                                                                                                    |
| Players · length | 2–16 · about 5 min · `estimatedMinutes: 5`                                                                                          |
| Tags             | `quick`, `comedy`                                                                                                                   |
| Bots             | Welcome. They start from the pack's expected order and shuffle it a little.                                                         |
| Presence         | `anywhere`                                                                                                                          |
| Hook             | The countdown from fifth place to first, and the one player who ranked the toddler as the _best_ person to be stuck in a lift with. |

**`howToPlay`**

1. You get five things and a question, like "best to worst road-trip snack". Put them in order.
2. Everyone's orders are combined into the hive's order.
3. Score 2 for each thing in the hive's exact spot, and 1 if you're one spot off.

## 6.2 In plain words

Six players. The question is **Best to worst road-trip snack.** The five things are potato chips, beef jerky, grapes, gummy candy and egg sandwich.

1. **Rank.** Everyone taps the five things in order, best first. Nobody sees anyone else's order.
2. **The hive decides.**
   - The game adds up where everyone put each thing.
   - The thing with the best average spot becomes the hive's number 1, and so on down.
   - The TV counts down: "Number 5: egg sandwich… number 1: potato chips!"
3. **Score.** For each of your five things:
   - in the hive's exact spot: +2;
   - one spot off: +1;
   - all five exact: +2 bonus.

   The round's top scorer is crowned Queen Bee 👑.

You're not ranking what _you_ like. You're predicting what the room likes.

## 6.3 Phases

**Order:** `intro` (once) → `rank` → `hive` → `score` → next `rank`, or `done`.

| Phase   | TV shows                                                                                                                                | Phone shows                                                         | Inputs                     | Ends when                                     | Sound · bed                                            |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------- | --------------------------------------------- | ------------------------------------------------------ |
| `intro` | Title and the three steps                                                                                                               | How to play                                                         | —                          | 8 s, or VIP                                   | `start` · `lofi`                                       |
| `rank`  | "Round 2 of 6", the question with its top and bottom labels, the five things as cards, chips ✓                                          | `OrderPicker`                                                       | `order` (resend to change) | all connected players submitted, 30 s, or VIP | `phase` · `lofi`                                       |
| `hive`  | "The hive has decided…", then a ladder filling from 5th to 1st. Beside each spot, the faces of players who put that thing there exactly | Stage                                                               | —                          | paced, about 12 s; VIP skip = next step       | `reveal`; `card` per spot; `jackpot` on a perfect hive |
| `score` | Each player's points pop (+2 / +1 chips); the Queen Bee's face is crowned; running scores                                               | Own order against the hive, marked ✓ (exact) or ± (one off); points | —                          | 6 s, or VIP                                   | `tally` · `warm`                                       |

**Client hooks**

- `quickInto: ['hive']`
- `stripScores`: off during `hive`.
- `stripActive`: the Queen Bee, during `score`.

## 6.4 Screens

### TV (1920×1080)

**Rank**

- The question at h1, with its labels as a caption ("1 = Best · 5 = Worst").
- The five things as a row of cards (h2).
- Chips ✓ as players submit.

**Hive**

- A ladder of five numbered spots on the left half, with #1 at the top.
- The things fly in from 5th to 1st (`land`). Each is held for about 2 s and read aloud.
- To the right of each spot:
  - the faces of the players who put that thing exactly there;
  - a thin bar showing the thing's average spot.
- A thing that lands in the same spot for everyone gets a "Unanimous!" tag.

**Score**

- "+2" and "+1" chips pop by faces.
- "PERFECT HIVE" appears if someone got all five exact.
- The Queen Bee's face gets the `crown` animation.

### Phone (320×568)

**Rank** (`OrderPicker`, from P00 §6, refined here so it never scrolls)

- The question (h2, up to two lines) and the labels: "Tap from Best to Worst".
- Five full-width rows that stay in place:
  - Tapping a row gives it the next number, shown as a round badge (1–5) on its left.
  - Tapping a numbered row takes it out, and the numbers after it move up by one.
  - **Reset** clears all the numbers.
- Sticky **Lock it in**, enabled once all five rows have numbers. Once locked, it shows "Locked in" with **Change**.
- The whole screen takes about 400 px, so it fits 320×568.

**Hive:** "👀 Watch the TV".

**Score**

- The player's order next to the hive's order. Each row is marked:
  - ✓ for exact (+2);
  - ±1 for one spot off (+1);
  - ✗ otherwise.
- The round's points.
- "👑 You're the Queen Bee!" when it applies.

### PhoneStage

`phoneStagePhases: ['intro', 'hive', 'score']`. On PhoneStage, the ladder is a vertical list filling from the bottom, with faces beside each spot.

## 6.5 Hidden information

| Secret              | Who may see it                              | When it goes public                                  |
| ------------------- | ------------------------------------------- | ---------------------------------------------------- |
| Each player's order | their own phone                             | `hive` (faces appear beside exact spots) and `score` |
| The hive's order    | nobody (it doesn't exist until `rank` ends) | `hive`, spot by spot                                 |

The spoken lines ("Number one: potato chips") are requested only when `hive` begins. All five are requested at once, while the 1.5 s "The hive has decided…" clip plays.

## 6.6 The hive's order and scoring

**Building the hive** from every complete order submitted:

1. Each thing's total = the sum of the spots it was given (1–5).
2. Sort by total, lowest first.
3. Break ties, in this order:
   - more first-place votes wins;
   - then more second-place votes, and so on;
   - then the pack's item order.
4. At least **2** orders are needed. With fewer, the round shows "Not enough bees!" and scores nothing.

**Scoring per round**

| For each of your five things | Points                             |
| ---------------------------- | ---------------------------------- |
| In the hive's exact spot     | +2                                 |
| One spot off                 | +1                                 |
| All five exact               | +2 bonus (12 is the round maximum) |

**Rules**

- Your own order counts towards the hive, like everyone else's.
- Incomplete orders (fewer than five numbers at the deadline) don't count and don't score.
- **Queen Bee:** the round's top scorer; ties share it. It's shown, not scored.
- **2 players:** the hive is just the two of you, so the game becomes "how alike are you?". It still works; it's just more personal.
- Scores never go down. Tied players share a rank.

**Awards.** Skip an award if nobody earned it; ties share it.

| Award          | Rule                                                                |
| -------------- | ------------------------------------------------------------------- |
| 👑 Queen Bee   | most rounds as the round's top scorer                               |
| 🎯 Hive Mind   | most exact spots in total                                           |
| 🦗 Odd Bug     | most rounds with the round's lowest score                           |
| 🧠 Twin Brains | the pair with the most things placed in the same spot (both get it) |

## 6.7 Inputs

```ts
const HiveInput = z.discriminatedUnion('type', [
  z.object({ type: z.literal('order'), items: z.array(z.string().max(32)).length(5) }),
]);
```

**Ignored:**

- inputs in the wrong phase;
- inputs from spectators;
- an `items` list that isn't exactly the round's five ids, each used once.

A resent `order` replaces the earlier one until the phase ends. The phone only sends complete orders.

## 6.8 State and views

```ts
type HiveState = {
  phase: PhaseState;
  rng: RngState;
  cfg: ResolvedSettings;
  presence: Presence;
  seats: PlayerId[];
  left: PlayerId[];
  questions: HiveItem[]; // drawn at init
  q: {
    n: number;
    item: HiveItem;
    orders: Record<PlayerId, string[]>; // SECRET until hive
    hive: string[] | null; // built when rank ends
    totals: Record<string, number>;
    step: number; // reveal step, 0–5
    delta: Record<PlayerId, { pts: number; exact: number; near: number; perfect: boolean }>;
    queens: PlayerId[];
  };
  scores: Record<PlayerId, number>;
  stats: Record<PlayerId, { exact: number; queens: number; lows: number; perfects: number }>;
  pairs: Record<string, number>; // "a|b" sorted: same-spot count
  speechMs: Record<string, number>;
};
```

**Budget:** under 20 KB at 16 players. A test fails above 40 KB.

**`tvView`** contains:

- the question, the labels and the five things;
- chip statuses;
- during `hive`: the spots revealed so far, with their faces and averages;
- at `score`: deltas and Queen Bees.

**`controllerView(p)`** contains:

- the question, the labels and the five things;
- the player's own order and lock;
- at `score`, after the TV: their own order against the hive, with marks and points.

## 6.9 Bot

1. Start from the question's `expected` order.
2. Make 0–3 random swaps of neighbouring items. Draw the number of swaps from 0, 1, 1, 2, 2, 3 using the rng.

Bots land near the hive often, but not always, and never send the same order every round.

## 6.10 VIP moments

| Phase   | VIP control                                             |
| ------- | ------------------------------------------------------- |
| `intro` | **Let's go**                                            |
| `rank`  | Skip closes ranking                                     |
| `hive`  | Skip = next spot                                        |
| `score` | **Next round**, or **See results** after the last round |

## 6.11 Voice

The reader defaults to `jessica`.

**Live readings**

- At `rank`: the question as a sentence, taken from the item's `say` field ("Rank these road-trip snacks, from best to worst.").
- At `hive`: each spot ("Number five: egg sandwich.").

**Fixed clips**

- "Rank them!"
- "The hive has decided."
- "Perfect hive!"
- "Queen bee!"
- "Not enough bees."

**Prefetch:** during `score`, the next question's sentence.

## 6.12 Settings

| Key           | Type    | Default   | Options             |
| ------------- | ------- | --------- | ------------------- |
| `rounds`      | number  | 6         | 3–10                |
| `rankSeconds` | number  | 30        | 15–60, step 5       |
| `spicy`       | boolean | false     | adds the spicy pack |
| `reader`      | select  | `jessica` | every voice, none   |

**Time check.** The slowest legal game is 10 × (60 + 14 + 6 + 3) s ≈ 14 minutes, inside 3 × 5. The default game takes about 5 minutes.

**Presence.** Identical in every mode. In phone-only rooms, `intro`, `hive` and `score` run on `PhoneStage`.

## 6.13 Content

**Files:** `content/family.json`, `content/spicy.json`, `content/pronunciations.json`.

```json
{
  "id": "hr-food-009",
  "prompt": "Best to worst road-trip snack",
  "say": "Rank these road-trip snacks, from best to worst.",
  "top": "Best",
  "bottom": "Worst",
  "items": [
    { "id": "chips", "label": "Potato chips" },
    { "id": "jerky", "label": "Beef jerky" },
    { "id": "grapes", "label": "Grapes" },
    { "id": "gummies", "label": "Gummy candy" },
    { "id": "eggsandw", "label": "Egg sandwich" }
  ],
  "expected": ["chips", "gummies", "jerky", "grapes", "eggsandw"]
}
```

**Items**

- Exactly five per question.
- Labels at most 22 characters.
- No item that means different things in different countries: "Potato chips", not "Chips".

**Questions**

- Opinions only. Hive Rank predicts the room, not facts; Fake-Out and Lightning Round already cover facts.
- Kinds:

| Kind          | Example                                        |
| ------------- | ---------------------------------------------- |
| Preferences   | best → worst                                   |
| Usefulness    | most → least useful on a desert island         |
| Hypotheticals | who'd win in a fight                           |
| Social        | worst → best person to be stuck in a lift with |

**`expected`:** the writer's guess at the typical order. Only bots use it.

**Pack sizes**

- Family pack: 150 questions.
- Spicy pack: 50 questions (worst → best first-date activity; least → most embarrassing thing to be caught doing).

**Speech lab:** run every `say` sentence and every item label through it.

## 6.14 Edge cases

| Situation                                      | What happens                                                                 |
| ---------------------------------------------- | ---------------------------------------------------------------------------- |
| Fewer than 2 complete orders                   | "Not enough bees!"; no points; next round                                    |
| A player's order is incomplete at the deadline | It doesn't count; they score 0 this round                                    |
| Ties in the hive                               | Resolved by first-place votes, then second-place, and so on, then pack order |
| Everyone submits the same order                | Everyone gets a perfect 12                                                   |
| 2 players                                      | Plays as a matching game (§6.6)                                              |
| Late joiner                                    | Spectator                                                                    |
| Everyone idle                                  | Every round is "Not enough bees!", so the game ends within minutes           |
| Pause during `hive`                            | The helper freezes the countdown; resume continues it                        |

## 6.15 Tests to add

- **Hive building:** totals, the full tie-break chain, the 2-order minimum, and incomplete orders being ignored.
- **Scoring:** exact, one off, the perfect bonus, Queen Bee ties, and the pair counts for Twin Brains.
- **Input:** orders that aren't a permutation of the five ids are ignored.
- **Leaks:**
  - no player's order appears in another view before `hive`;
  - spot readings are requested only when `hive` begins.
- **Bots:** orders vary between rounds.

## 6.16 Recap

"Hive Rank · <date>" contains:

- each question, with the hive's order and every player's order and points;
- the Queen Bees for each round;
- awards.
