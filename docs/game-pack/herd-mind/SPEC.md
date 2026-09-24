<!-- Cut from parts/01-IMPOSTER-HERD-MIND.md (received 2026-09-24). The part file is the original;
     this copy is the one game's spec, with the part's shared intro kept on top. -->

# PartyBox Game Pack · Part 01 — Imposter and Herd Mind

_Batch 2 of 7 · read Part 00 first. References like "P00 §4.7" point into Part 00; "brief §8" points into `GAME-DESIGN-BRIEF.md`._

These two games fill gaps listed in brief §14:

- **Imposter** adds hidden roles and bluffing, and it holds up at 10–16 players.
- **Herd Mind** is a quick prediction game that also shines at 16.

Both play fully remote, because every input is typed or tapped (P00 §3.7).

---

# Game 2 · Herd Mind 🐑

## 2.1 Pitch

|                  |                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------- |
| Name · tagline   | **Herd Mind** · "Think like the herd. Don't be the odd sheep."                     |
| id · icon        | `herd-mind` · 🐑                                                                   |
| Players · length | 3–16 · about 6 min · `estimatedMinutes: 8`                                         |
| Tags             | `quick`, `words`                                                                   |
| Bots             | Welcome. They pick answers weighted by how popular the pack says each one is.      |
| Presence         | `anywhere`                                                                         |
| Hook             | The Black Sheep flying across the screen onto the one person who said "pineapple". |

**`howToPlay`**

1. A question appears. Pick the answer you think most people will pick.
2. Everyone in the biggest group scores a point. A tie for biggest scores nothing.
3. Alone with your answer? You get the Black Sheep, and can't win while you hold it.

## 2.2 In plain words

It's not about the right answer. It's about what everyone else will say.

**An example.** Six players. The question is "Name a pizza topping." Each phone shows eight answer tiles: pepperoni, cheese, mushrooms, sausage, pineapple, olives, onions, ham. Everyone taps one.

- Ana, Ben and Cy tapped **pepperoni**. That's the biggest group, **the herd**, so each of them gets 1 point.
- Dee and Eli tapped **mushrooms**. That's a group, but not the biggest, so nothing.
- Fay tapped **pineapple**, alone. Fay takes **the Black Sheep**.

**Variations:**

- If pepperoni and mushrooms had tied for biggest, there's no herd, and nobody scores.
- If Fay and Dee had each been alone on different answers, the Black Sheep stays where it is. It only moves when exactly one person is alone.

**Winning:** first to 8 points **without** the Black Sheep wins. If 12 questions pass first, the top scorer without the Black Sheep wins.

## 2.3 Two ways to answer

- **Tiles** (default): eight tapped choices. Grouping is exact, it's fast, it works remote, and bots can play it with no guessing about what they mean.
- **Typed:** players type anything. The game groups the answers using the matcher and the question's answer list (P00 §4.5–4.6). Before scoring, the VIP can merge two groups that mean the same thing ("coke" and "cola").

## 2.4 Phases

**Order:** `intro` (once) → `answer` → `herd` → `score` → the next `answer`, or `done`.

| Phase    | TV shows                                                                                                                  | Phone shows                                                        | Inputs                              | Ends when                                                                   | Sound · bed                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------- |
| `intro`  | Title, the three rules, the Black Sheep token                                                                             | How to play                                                        | —                                   | 8 s, or VIP                                                                 | `start` · `bossa`                            |
| `answer` | The question, the tiles (tiles mode), chips ✓, "Question 4 · First to 8"                                                  | The question with 2×4 tiles, or a text box                         | `pick` or `type` (resend to change) | all connected answered, the deadline (§2.13), or VIP                        | `phase` · `bossa`                            |
| `herd`   | Answers land in groups; the biggest rises as the herd; lonely answers go to the side; in typed mode, VIP merges show live | stage. In typed mode, the VIP gets the merge tool and **Score it** | VIP: `merge`, `unmerge`             | Tiles: after the choreography (about 6 s). Typed: VIP **Score it**, or 20 s | `tally`, then `cheer` (herd) or `bust` (tie) |
| `score`  | +1 badges pop over herd faces; the Black Sheep flies to its new holder; the race track moves                              | Own result, points, sheep status                                   | —                                   | 5 s, or VIP                                                                 | `sweep` when the sheep moves · `warm`        |

**Client hooks:**

- `quickInto: ['herd']`
- `stripScores`: off during `herd`
- `stripActive`: the sheep holder during `score`

## 2.5 Screens

### TV (1920×1080)

**Answer**

- The question, centred, at h1 (72 px), at most two lines.
- The eight tiles below it in a 4×2 grid at h2 (48 px). Tiles aren't secret.
- The caption "Answer on your phone".
- Along the bottom, a **race track** from 0 to the target:
  - each player's face sits at their score;
  - faces on the same score stack;
  - the sheep holder carries a 🐑 badge.

**Herd**

- Each player's answer card (face and answer) appears, then `land`s into a column for its group. The biggest group is on the left.
- Each column header shows the answer (h2) and the count.
- The herd column gets a **HERD** banner with 🐑🐑 and lifts.
- On a tie, the tied columns shake gently, and the banner reads "No herd. It's a tie!".
- Lonely answers sit in a side column, "Alone". When exactly one is there, a sheep outline pulses over it.
- Typed mode shows each raw answer ("peperoni") under its group's label ("Pepperoni").

**Score**

- "+1" `pop`s over the herd faces.
- The sheep token travels (transform only) from the old holder's chip to the new holder's.
- The race track updates.
- When someone wins: an "Ana wins!" banner, then the results screen.

### Phone (320×568)

**Answer, tiles**

- The question (h2, up to three lines), then 2 columns × 4 rows of tiles. Each tile is at least 56 px tall, with 18 px text on up to two lines.
- Tapping a tile locks it in, with a ✓ and the `submit` haptic.
- Tap another tile to change, until the phase ends.
- Status line: "Locked: Pepperoni · tap another to change".

**Answer, typed**

- The question, a `TextAnswer` (30 characters) and **Lock it in**.
- The answer can be changed the same way, until the phase ends.

**Herd and score**

- At-TV phones show "👀 Watch the TV".
- Once the TV has shown the result, the phone shows the player's own line:
  - "🐑 In the herd! +1 (Pepperoni, 3 of you)"
  - "Alone with Pineapple. You've got the Black Sheep."
  - "Tie. Nobody scores."
  - "Mushrooms, 2 of you. Not the herd."
- Below that: points, as "5 / 8".
- When holding the sheep: "🐑 You hold the Black Sheep. You can't win until someone else is the only one alone."

**VIP merge tool** (typed mode, during `herd`)

- A list of groups, each with its label, count and raw answers.
- Tap two groups, then **Merge**.
- Merged groups are tagged "merged", with **Undo**.
- Sticky **Score it**.
- Merges appear on the TV as columns sliding together.
- The controls render only on the phone that has VIP powers, and the server accepts `merge` only with `vip: true`.

### PhoneStage

`phoneStagePhases: ['intro', 'herd', 'score']`. The stage shows:

- the groups as a vertical list with counts, with the herd highlighted;
- the sheep's move;
- a compact race list.

**Small-phone check:** at 320×568 the tile phase takes about 420 px (the question plus four rows of tiles), so it fits without scrolling.

## 2.6 Scoring

After each question, apply these steps in order:

1. **Group** the answers. Tiles group by tile id; typed answers group as in §2.8. Players who didn't answer are left out completely.
2. **Herd:** the single largest group with 2+ members.
   - Each member gets +1.
   - If two or more groups tie for largest, there is no herd and nobody scores.
3. **Black Sheep:**
   - Nobody has the sheep at the start; it sits in the pasture.
   - If exactly one group has exactly one member, that player takes the sheep, from its holder or from the pasture.
   - If there are no lonely players, or 2+, the sheep doesn't move.
4. **Win check:**
   - Every player at or above `target` who doesn't hold the sheep wins at once, sharing the win.
   - A holder at or above target keeps playing. They win the moment they lose the sheep while still at or above target.
5. **Question limit:** after `maxQuestions`, the winners are the highest scorers who don't hold the sheep.

**Results ranking**

- Rank by points, with one exception: if the sheep holder's points would put them above the winners, place them right below the winners.
- The results screen tags the holder "🐑 Held the Black Sheep".
- Scores never go down.

**Awards.** Skip an award nobody earned; ties share it.

| Award               | Rule                                                           |
| ------------------- | -------------------------------------------------------------- |
| 🐑 Head of the Herd | most times in the herd                                         |
| 🦄 Free Spirit      | most times alone                                               |
| 🖤 The Black Sheep  | held the sheep for the most questions                          |
| 🤝 Mind Meld        | the pair who landed in the same group most often (both get it) |

## 2.7 Inputs

```ts
const HerdInput = z.discriminatedUnion('type', [
  z.object({ type: z.literal('pick'), tile: z.string().max(64) }),
  z.object({ type: z.literal('type'), text: z.string().min(1).max(60) }),
  z.object({ type: z.literal('merge'), a: z.string().max(64), b: z.string().max(64) }), // VIP, typed mode, herd
  z.object({ type: z.literal('unmerge'), a: z.string().max(64), b: z.string().max(64) }), // VIP
]);
```

**Ignored:**

- inputs in the wrong phase or mode;
- unknown tiles;
- inputs from spectators;
- `merge` or `unmerge` without `vip: true`;
- merging a group with itself.

**Rejected, with copy:** typed text that normalizes to nothing: "Type an answer."

The server keeps the first 30 characters of typed text. A resent answer replaces the earlier one until the phase ends.

## 2.8 Grouping typed answers

1. **Match to the question's list.** For each typed answer, find the first of the question's answers where `matchAnswer` is `exact` or `stem`. If none, take the first `fuzzy` match.
   - A match joins that answer's group, labelled with its display answer.
2. **Group the rest.** Unmatched answers are grouped with each other using `sameAnswer` (union-find, in seat order).
   - The label is the most common raw form in the group.
   - Ties are broken by seat order.
3. **Apply the VIP's merges** in order. Each `unmerge` removes one merge.

Everything is pure and iterates in seat order, so the same answers always make the same groups.

## 2.9 State and views

```ts
type HerdState = {
  phase: PhaseState;
  rng: RngState;
  cfg: ResolvedSettings;
  presence: Presence;
  seats: PlayerId[];
  left: PlayerId[];
  questions: QuestionItem[]; // drawn at init: maxQuestions
  q: {
    n: number;
    item: QuestionItem;
    tiles: { id: string; label: string }[] | null; // tiles mode
    answers: Record<PlayerId, { tile?: string; text?: string }>; // private until herd
    merges: [string, string][];
    groups:
      { key: string; label: string; members: PlayerId[]; raw: Record<PlayerId, string> }[] | null;
    herd: string | null;
    lone: PlayerId | null;
  };
  scores: Record<PlayerId, number>;
  sheep: PlayerId | null;
  winners: PlayerId[];
  stats: Record<PlayerId, { herd: number; alone: number; sheepHeld: number }>;
  pairs: Record<string, number>; // "a|b" with ids sorted
  speechMs: Record<string, number>;
};
```

**Budget:** under 40 KB at 16 players; 20 questions with their answer lists make up most of it. A test fails above 64 KB.

**`tvView`** contains:

- the question and the tiles;
- chip statuses;
- the groups, after `herd`;
- deltas;
- the sheep holder;
- race positions;
- winners.

**`controllerView(p)`** contains:

- the question, the tiles, and the player's own answer;
- after the TV's reveal: their own group and result, points, and sheep flag;
- during `herd`: the groups, which are already public on the TV, so the VIP's phone can render the merge tool.

## 2.10 Bot

- **Tiles:** pick a tile with probability proportional to weight^1.5, using the pack's weights. Bots lean towards popular answers, but not always.
- **Typed:** pick an answer by weight.
  - 70% of the time, send its display form.
  - 30% of the time, send one of its `accept` variants. This exercises the matcher.
- **`herd` and `score`:** nothing to do. Bots are never VIP.

## 2.11 VIP moments

- `intro`: **Let's go**.
- `herd`:
  - tiles mode: **Next**;
  - typed mode: the merge tool and **Score it**.
- `score`: **Next question**.

## 2.12 Voice

The reader defaults to `jessica`.

**Live readings:**

- the question when `answer` starts ("Name a pizza topping.");
- the herd's answer during `herd` ("Pepperoni!").

**Fixed clips:**

- "The herd has spoken."
- "No herd. It's a tie."
- "Black sheep!"
- "Baa." Put this one through the speech lab; a silly result is fine.
- "We have a winner."

**Prefetch:** the next question, during `score`. Questions aren't secret.

## 2.13 Settings

| Key            | Type    | Default   | Options                                    |
| -------------- | ------- | --------- | ------------------------------------------ |
| `mode`         | select  | `tiles`   | tiles, typed                               |
| `target`       | number  | 8         | 3–15                                       |
| `maxQuestions` | number  | 12        | 5–20                                       |
| `pace`         | select  | `normal`  | relaxed, normal, fast (answer times below) |
| `spicy`        | boolean | false     | adds the spicy pack                        |
| `reader`       | select  | `jessica` | every voice, none                          |

**Answer time by pace:**

| Pace    | Tiles | Typed |
| ------- | ----- | ----- |
| relaxed | 25 s  | 35 s  |
| normal  | 15 s  | 25 s  |
| fast    | 10 s  | 20 s  |

**Time check:**

- The slowest legal game is 20 typed questions at relaxed pace.
- Each question takes about 66 s: 35 s answer, 20 s herd, 5 s score, and about 6 s of reveals.
- That's 22 minutes in total, inside 3 × 8.
- Typical games run 5–6 minutes.

## 2.14 Presence

The game is the same in every mode, because nothing needs talking or the TV. In phone-only rooms, `intro`, `herd` and `score` run on `PhoneStage`.

## 2.15 Content

**Files:** `content/family.json`, `content/spicy.json`, `content/pronunciations.json`.

```json
{
  "id": "hm-food-012",
  "prompt": "Name a pizza topping.",
  "answers": [
    {
      "id": "pepperoni",
      "answer": "pepperoni",
      "weight": 40,
      "accept": ["peperoni", "pepperonis", "pepparoni", "pepperoni slices", "roni", "pep"]
    },
    {
      "id": "cheese",
      "answer": "cheese",
      "weight": 18,
      "accept": ["extra cheese", "mozzarella", "mozz", "cheeze", "chese", "cheeses"]
    },
    {
      "id": "mushrooms",
      "answer": "mushrooms",
      "weight": 12,
      "accept": ["mushroom", "mushies", "shrooms", "mushrom", "musrooms", "champignons"]
    }
  ]
}
```

The real item lists 10–14 answers.

**Per question**

- 10–14 answers, each with a `weight` from 0 to 100, roughly the share of people who'd say it.
- Six or more `accept` forms for every common answer.

**Tiles**

- Eight per question: the top five by weight, plus three drawn from the rest with the state's rng, then shuffled.
- The pack test enforces at least 8 answers per question.

**Question styles**

- "Name a…": about 60%.
- "Best / worst…": 15%.
- "Pick a number / letter / colour…": 10%. Answers are digits, with number words as accepts.
- "Finish this…": 10%.
- "Would you rather…": 5%. These have only 2–4 answers, so they skip the eight-tile minimum; mark them `"tiles": "all"`.

**Pack sizes:** a family pack of 200 questions, and a spicy pack of 80.

**Wording**

- Well-known brands are fine where people really answer with them ("Name a soda").
- No real people.
- Every question ends with punctuation, and gets a `say` field when it needs one.

## 2.16 Edge cases

| Situation                               | What happens                                                                                                                                  |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| A player doesn't answer                 | Left out; they can't score or take the sheep                                                                                                  |
| One connected player                    | Their group of one can't be a herd (a herd needs 2+). But they are the only lonely player, so they take the sheep. The game runs on deadlines |
| Everyone picks the same                 | All +1; the sheep doesn't move                                                                                                                |
| Everyone picks differently              | No herd. There are 2+ lonely players, so the sheep doesn't move                                                                               |
| The sheep holder leaves                 | The sheep goes back to the pasture                                                                                                            |
| Two players reach the target together   | Both win                                                                                                                                      |
| The holder reaches the target           | Keeps playing until they lose the sheep or someone else wins                                                                                  |
| Typed mode, the VIP never taps Score it | After 20 s, the groups are scored as they stand                                                                                               |
| Late joiner                             | Spectator                                                                                                                                     |
| Pause during `herd`                     | The helper freezes the choreography; resume continues it                                                                                      |

## 2.17 Tests to add

- **Scoring:** a herd, a tie, everyone the same, everyone different, exactly one lonely player, two lonely players, nobody answering.
- **Sheep:**
  - moves;
  - stays;
  - returns to the pasture when its holder leaves;
  - blocks a win;
  - grants the win once it's shed.
- **Typed grouping:** misspellings, plurals, merges, unmerges, stable labels.
- **Leaks:** answers never reach another view before `herd`.
- **Ranking:** a sheep holder with the most points ranks below the winners.

## 2.18 Recap

A markdown file titled "Herd Mind · <date>", containing:

- every question, with its groups and the names in each;
- the herd, and each lonely answer ("Alone: Fay, pineapple");
- the sheep's journey;
- final scores and awards.
