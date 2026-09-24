# PartyBox Game Pack · Part 02 — Fake-Out and Who Said It

*Batch 3 of 7 · read Part 00 first.*

*References: "P00 §4.7" points into Part 00; "P01 §1.4" points into Part 01. Games are numbered across the whole pack, so this file holds games 3 and 4.*

These are two write-then-guess games. They play differently from Wisecrack and Blanks, which are write-and-vote comedy:

- **Fake-Out** is bluffing against a hidden truth.
- **Who Said It** is about reading the people in the room.

Both play fully remote (P00 §3.7).

---

# Game 3 · Fake-Out 🎭

## 3.1 Pitch

| | |
|---|---|
| Name · tagline | **Fake-Out** · "Write a fake answer. Find the real one." |
| id · icon | `fake-out` · 🎭 |
| Players · length | 2–12 · about 12 min at 7 questions · `estimatedMinutes: 12` |
| Tags | `bluff`, `trivia`, `comedy` |
| Bots | Welcome. They lie using the question's house lies, and they pick at random, because they can't know the truth. |
| Presence | `anywhere` |
| Hook | The reveal: lie after lie flips over, showing who fell for it and who wrote it. The truth comes last. |

**`howToPlay`**
1. A strange true fact appears with a blank. Type a fake answer that sounds real.
2. All answers are mixed with the truth. Pick the one you think is real.
3. Score for finding the truth, and for every player your fake fools.

## 3.2 A question in plain words

Five players: Ana, Ben, Cy, Dee and Eli. The TV shows this fact, and the reader reads it aloud:

> Norway's King's Guard knighted a ___ named Nils Olav.

The truth is "penguin". It's a real fact: Sir Nils Olav is a king penguin at Edinburgh Zoo.

1. **Lie.** Everyone types a fake answer that fits the blank.

   | Player | Fake answer |
   |---|---|
   | Ana | moose |
   | Ben | reindeer |
   | Cy | royal chef |
   | Dee | moose |
   | Eli | horse |

   Anyone stuck taps **💡 Suggest a lie** and gets two ready-made fakes to choose from.

2. **Pick.**
   - The TV shows every answer mixed with the truth, all styled the same: MOOSE · REINDEER · ROYAL CHEF · HORSE · PENGUIN.
   - Ana's and Dee's identical "moose" became a single option.
   - Each phone shows the list minus that player's own answer. Everyone taps the one they believe.

3. **Reveal.** Options that someone picked flip over one at a time, least-picked first:
   - "HORSE: Cy picked it… it's a LIE, written by Eli. +500 for Eli."
   - "MOOSE: Ben and Eli picked it… it's a LIE, written by Ana and Dee. +1000 each."
   - "PENGUIN: Ana and Dee picked it… it's the TRUTH! +1000 each."

4. **The fact completes:** "…knighted a PENGUIN named Nils Olav." Then scores.

**Special cases**
- If a player types the truth by accident, their phone says "That's actually the truth! Write a fake one."
- Picking one of the game's own padding lies (§3.8) means you were fooled, but nobody gets points for it.
- The last question is the **Final Fake-Out**, worth double.

## 3.3 Phases

Order: `intro` (once) → `question` → `lie` → `pick` → `reveal` → `scores` → the next `question`, or `done`.

| Phase | TV shows | Phone shows | Inputs | Ends when | Sound · bed |
|---|---|---|---|---|---|
| `intro` | Title and the three steps | How to play | — | 8 s, or VIP | `start` · `lounge` |
| `question` | "Question 3 of 7" (or **FINAL FAKE-OUT · double points**), the category, the fact with its blank, read aloud | The fact | — | reading + 1 s (at most 12 s; hidden timer), or VIP | `card` · none |
| `lie` | The fact, "Write a fake answer", chips ✓ | The fact, answer box, 💡 Suggest, legality line | `lie` (resend to change), `suggest` | all connected submitted, 45 s, or VIP | `phase` · `marimba` |
| `pick` | The fact and every option in a grid, chips ✓ | All options except their own, with a 👍 on each row | `pick` (resend to change), `like` | all connected picked, 25 s, or VIP | `phase` · `pulse` |
| `reveal` | Step by step (§3.4); then the completed fact; then "Nobody fell for…" | Stage; the player's own moments appear as the TV shows them | — | paced (§3.12); a VIP skip goes to the next step | `reveal`; `bust` for each lie; `jackpot` for the truth |
| `scores` | Scoreboard with deltas and reason chips | Own points and rank; VIP: **Next question** | — | 6 s, or VIP | `tally` · `warm` |

**Client hooks**
- `quickInto: ['question', 'reveal']`
- `stripCompact` during `pick`, so the option grid has room.
- `stripScores` off during `reveal`.
- `stripActive` = the players who picked the option on screen.
- Timer is `hidden` in `question` and `reveal`.

## 3.4 Screens

### TV (1920×1080)

**The fact**
- Up to two lines: h1 (72 px) in `question`, h2 (48 px) in `lie` and `pick`.
- The blank is a rounded box of `--pb-surface-2`, about four characters wide. Never a row of underscores.

**Option grid** (`pick`)
- Up to 13 options: 12 players plus the truth.
- Three columns, with as many rows as needed.
- Each card shows its text in capitals at h2, up to two lines, shrinking to no smaller than 36 px.
- Every card looks identical: no author, no colour, no order hint.

**Each reveal step**
1. The option card moves to the centre and grows (transform).
2. The faces of the players who picked it pop above it, captioned "picked by".
3. The reader reads the option aloud.
4. After 0.8 s, one stamp lands:
   - **LIE ✗** (`--pb-danger`). The author faces rise from below with their points, e.g. "+500 × 2 = +1000".
   - **PARTYBOX LIE 🤖**, for a padding lie, with "Nobody scores for this one".
   - **TRUTH ✓** (`--pb-accent-3`), with the finders' faces and "+1000 each", or "Nobody found the truth".

Each card also shows 👍 and its likes count, if it has any.

**Completed fact.** The blank fills with the truth in `--pb-accent-2`. It holds for 2 s and is read aloud in full.

**Nobody fell for.** A closing strip of the unpicked lies with their authors, for 1.5 s.

### Phone (320×568)

**Lie**
- The fact (h2, up to four lines).
- `TextAnswer`: 40 characters, with `autocorrect` on, because spelling mistakes give lies away.
- **💡 Suggest a lie**: once per question. It shows two chips; tapping one fills the box, and the player can still edit it.
- The legality line.
- Sticky **Lock it in**. Once locked, it shows "Locked in: 'moose'" with **Change**.

**Pick**
- A header line: "Pick the truth · 👍 the funniest (optional)".
- A full-width list of options:
  - Each row is at least 52 px tall, with 18 px text on up to two lines.
  - The list scrolls when there are more than 8 options.
- Tapping a row picks it, with ✓ and the `submit` haptic. Tapping another row changes the pick.
- On the right of each row is a 44×44 **👍**. Each player gets up to two likes per question, never on their own answer.

**Reveal**
- The phone shows "👀 Watch the TV".
- As each step lands on the TV, the phone adds the player's own moment to a short list:
  - "You fell for Ana's MOOSE"
  - "Your REINDEER fooled Ben +500"
  - "You found the truth! +1000"

**Scores.** Own points, rank, and the reasons for this question's points.

### PhoneStage

`phoneStagePhases: ['intro', 'reveal', 'scores']`.

On `PhoneStage`, the reveal becomes a vertical feed: option, pickers, stamp, authors. The completed fact sits at the end.

### Small-phone check

- `lie` fits at 320×568.
- `pick` scrolls when there are more than 8 options, with the header staying pinned.

## 3.5 Hidden information

| Secret | Who may see it | When it goes public |
|---|---|---|
| The truth | nobody (not even as a flagged option) | `reveal`, at the truth step |
| Each lie's author | the author's own phone | that option's `reveal` step |
| Which options are padding lies | nobody | that option's `reveal` step |
| Each pick | the picker's own phone | that option's `reveal` step |
| Likes | the liker's own phone | counts shown at `reveal` |

**Leak rules for Fake-Out**

- **Opaque option ids.**
  - Ids are drawn from the rng ("o3", "o9").
  - An id is never the player id, never "truth", and never in any meaningful order.
  - `authors`, `house` and `truth` stay on the server until the reveal.
- **One look for every option.**
  - Display form = trim, collapse spaces, drop one leading article (a, an, the), drop trailing punctuation, then capitalise.
  - The truth goes through the same function, so case, articles and full stops can't give it away.
  - Spelling is left as typed. That's part of the game.
- **Order.** One seeded shuffle, the same on the TV and on every phone (each phone minus its own lie).
- **Speech.**
  - Option readings are requested all together, once the options exist (at `pick`). That way the speech cache can't single out the truth.
  - The completed-fact line contains the truth, so request it only at the truth step.
- **The one deliberate exception to P00 §7 rule 13.** A player who types the truth is told so (§3.7), as in the classic game. This confirms their own correct guess; it isn't a hint. It also keeps the truth from appearing twice.

## 3.6 Scoring

| Event | Points |
|---|---|
| You pick the truth | +1000 |
| Each player who picks your lie | +500 |
| Final Fake-Out (setting on) | everything above doubled |
| You pick a padding lie | 0, and nobody scores for it |
| You type the truth | 0 (you must write a different lie) |

**Rules**
- **Shared lies.** When `sameAnswer` merges two players' lies, every author gets the full +500 per player fooled.
- **Idle players.**
  - A player who doesn't pick scores nothing for the truth.
  - A player who writes nothing has no option in play.
- **Scores** never go down. Ties share a rank.
- **Reason chips** on `scores`: "+1000 truth", "+1000 fooled 2", "×2 final".

**Awards.** Skip an award if nobody earned it; ties share it.

| Award | Rule |
|---|---|
| 🎭 Master Liar | most players fooled in total |
| 🔍 Truth Detector | most truths found |
| 👍 Crowd Favourite | most likes received |
| 🍀 Lucky Guess | typed the truth as a "lie" at least once (most times wins) |
| 🤖 Fooled by the House | picked the most padding lies |

## 3.7 Rules for lies

The server checks these in order. The phone runs the same checks for instant feedback.

| Check | Result | Player sees |
|---|---|---|
| Empty after normalization (P00 §4.3) | rejected | "Type a fake answer." |
| Longer than 40 characters | rejected | "Keep it under 40 characters." |
| `matchAnswer(lie, truth)` is `fuzzy` or better | rejected; `truthTyped` recorded | "That's actually the truth! Write a fake one." |
| The truth is 5+ letters and the compact lie contains it ("penguin chick") | rejected, as above | as above |
| `sameAnswer` with another player's lie | accepted silently; merged when options are built | nothing (saying so would leak the other lie) |
| Matches a padding lie | accepted; that padding lie is dropped | nothing |

The containment check only applies to truths of 5+ letters. Otherwise a short truth like "ant" would reject "elephant".

## 3.8 Building the options (start of `pick`)

1. Take every submitted lie. Merge duplicates with `sameAnswer`, using union-find in seat order. The display form comes from the first author's text.
2. Add the truth.
3. Pad with house lies until there are at least **5 options**.
   - Skip any house lie already claimed through Suggest, or matching a player's lie.
   - Padding keeps 2- and 3-player games interesting.
4. Give each option an opaque id, and shuffle once with the rng.

**Suggest** (the `suggest` input)
- The reducer draws 2 unclaimed house lies for that player and stores them in `suggestions[p]`.
- It marks them as claimed, so no two players are offered the same one.
- When the house-lie pool runs dry, it draws from the category's `fillers`.

## 3.9 Inputs

```ts
const FakeOutInput = z.discriminatedUnion('type', [
  z.object({ type: z.literal('lie'), text: z.string().min(1).max(80) }),
  z.object({ type: z.literal('suggest') }),
  z.object({ type: z.literal('pick'), option: z.string().max(16) }),
  z.object({ type: z.literal('like'), option: z.string().max(16), on: z.boolean() }),
]);
```

**Ignored**
- inputs in the wrong phase;
- inputs from unknown players or spectators;
- a second `suggest`;
- a `pick` or `like` on an unknown option, or on the player's own;
- a third like.

A resent `lie` or `pick` replaces the earlier one until the phase ends.

## 3.10 State and views

```ts
type FakeOutState = {
  phase: PhaseState; rng: RngState; cfg: ResolvedSettings; presence: Presence;
  seats: PlayerId[]; left: PlayerId[];
  questions: FactItem[];                         // drawn at init: questions + 2 spares
  q: {
    n: number; final: boolean;
    item: FactItem;                              // truth is SECRET until the truth step
    lies: Record<PlayerId, string>;              // SECRET (authorship)
    truthTyped: PlayerId[];
    suggestions: Record<PlayerId, string[]>;
    claimed: string[];                           // house lies taken by Suggest
    options: { id: string; display: string; authors: PlayerId[]; house: boolean; truth: boolean }[] | null;
    picks: Record<PlayerId, string>;             // SECRET until each step
    likes: Record<PlayerId, string[]>;
    revealOrder: string[];                       // picked lies by fewest pickers (ties: option order), then the truth
    step: number;
    delta: Record<PlayerId, { pts: number; why: string[] }>;
  };
  scores: Record<PlayerId, number>;
  stats: Record<PlayerId, { fooled: number; truths: number; likes: number; truthTyped: number; house: number }>;
  speechMs: Record<string, number>;
};
```

**Budget:** under 24 KB at 12 players. A test fails above 48 KB.

**`tvView`** holds:
- the fact, with the blank until the truth step;
- the category and the final flag;
- chip statuses;
- the options, as `{ id, display }` only;
- during `reveal`, for steps already shown: pickers, stamp, authors, likes and points.

**`controllerView(p)`** holds:
- the fact;
- the player's own lie, suggestions and legality message;
- all options except their own;
- their own pick and likes;
- their own moments, for steps already shown.

## 3.11 Bot

- **`lie`:** claims an unclaimed house lie, as Suggest does, falling back to the category's `fillers`. A bot never writes the same lie twice in a game.
- **`pick`:** uniformly random among its options. A bot can't know the truth, and guessing from the pack would be cheating.
- **`like`:** a 30% chance to like one random option.

## 3.12 VIP moments and pacing

**VIP moments**
- `intro`: **Let's go**.
- `question`: skip goes straight to `lie`.
- `reveal`: skip advances one step immediately, like turning a page.
- `scores`: **Next question** / **See results**.

**Pacing**
- Each reveal step lasts the reading, plus 0.8 s for the stamp, plus 1.2 s for the points. The total is clamped to 2.5–4.5 s.
- Completed fact: 2 s plus its reading.
- "Nobody fell for": 1.5 s.

## 3.13 Voice

The reader defaults to `fable`.

**Live readings**
- The fact, at `question`.
  - The blank is read as "blank" (P00 §5.3 rule 9).
  - "Norway's King's Guard" becomes "Norways Kings Guard" (rule 3). This is exactly the apostrophe case the rules exist for.
- Each option, at its reveal step.
- The completed fact, at the truth step.

**Fixed clips**
- "Here's your question."
- "Time to fool your friends."
- "Pick the truth."
- "It's a lie!"
- "That's the truth!"
- "Nobody found the truth."
- "A PartyBox lie!"
- "Final Fake-Out. Double points!"

**Prefetch**
- During `scores`: the next question's fact. It still has its blank, so it isn't secret.
- At `pick`: every option, all together (§3.5).

## 3.14 Settings

| Key | Type | Default | Options |
|---|---|---|---|
| `questions` | number | 7 | 3–10 |
| `lieSeconds` | number | 45 | 30–75, step 5 |
| `pickSeconds` | number | 25 | 15–40, step 5 |
| `finalDouble` | boolean | true | the last question doubles all points |
| `suggestions` | boolean | true | the 💡 Suggest button |
| `likes` | boolean | true | the 👍 buttons |
| `categories` | multiselect | all | the pack's categories |
| `spicy` | boolean | false | adds the spicy pack |
| `reader` | select | `fable` | every voice, none |

**Time check.** The slowest legal game is 10 questions × (12 + 75 + 40 + up to 60 of reveal + 6 seconds) ≈ 32 minutes. That's inside 3 × 12.

**Presence.** Identical in every mode. In phone-only rooms, `intro`, `reveal` and `scores` run on `PhoneStage`.

## 3.15 Content

**Files**
- `content/family.json`
- `content/spicy.json`
- `content/fillers.json`
- `content/pronunciations.json`
- `content/unverified.json` (not played; see "The truth has to be true" below)

**Example: a fact with a single-word truth**

```json
{
  "id": "fo-animals-007",
  "category": "animals",
  "fact": "Norway's King's Guard knighted a ___ named Nils Olav.",
  "truth": {
    "answer": "penguin",
    "accept": ["penguins", "king penguin", "emperor penguin", "pengiun", "penquin", "pinguin"],
    "reject": []
  },
  "houseLies": ["moose", "reindeer", "salmon", "horse", "polar bear", "puffin", "wolf", "golden retriever"],
  "source": "Wikipedia: Nils Olav",
  "verified": true
}
```

**Example: a fact with a year and a plural truth**

```json
{
  "id": "fo-history-012",
  "category": "history",
  "fact": "In 1932, Australia's army fought a war against ___ and lost.",
  "truth": {
    "answer": "emus",
    "accept": ["emu", "emu birds", "emoos", "emews", "emuz", "wild emus"],
    "reject": []
  },
  "houseLies": ["kangaroos", "rabbits", "koalas", "crocodiles", "cane toads", "dingoes", "wombats", "seagulls"],
  "source": "Wikipedia: Emu War",
  "verified": true
}
```

**The truth has to be true.** This is the game's biggest risk.

- Every fact needs a `source` that a person can check: a Wikipedia article title, or another well-known reference.
- Set `verified: true` only after the fact has been checked against that source.
  - If Claude Code has web access while writing the pack, it checks each fact itself.
  - If not, it writes everything to `unverified.json`. The owner spot-checks those facts before promoting them into a played pack.
- The pack test fails on any played fact that has no `source`, or has `verified: false`.

**Writing rules**

- **Blanks**
  - One blank per fact, standing for 1–3 words.
  - Keep articles outside the blank ("knighted a ___"), so every answer fits the sentence the same way.
- **Truths**
  - The truth should sound unlikely but be gettable; the fun is that the fact is real.
  - There must be only one reasonable truth. Avoid facts where a different answer could also be right.
  - Every truth has 6+ `accept` forms. These catch accidental truths, so include near-synonyms ("king penguin").
- **Facts**
  - Nothing that goes stale ("the current record…", "the newest…").
  - Public and historical facts only. No living private people, and nothing that mocks a group.
- **House lies**
  - 8 per fact, each one plausible and fitting the blank.
  - None may match the truth. The pack test runs every house lie through the §3.7 checks.
- **`fillers.json`:** 20+ generic fakes per category, as the bots' last resort.
- **Pack sizes**
  - Family pack: 150 facts, across animals, history, food, science, geography, weird laws, sports, inventions, space, the human body, words, and holidays.
  - Spicy pack: 60 facts, adult but not explicit (drinking history, strange dating customs, bizarre laws).
- **Speech lab:** run every fact and every truth through it.

## 3.16 Edge cases

| Situation | What happens |
|---|---|
| A player writes nothing | No option from them; they can still pick |
| Nobody writes anything | The truth plus padding (5 options); play on |
| A player types the truth, then never writes a lie | No lie from them in play; they can still pick (and probably will) |
| Two players write the same lie | One option with two authors; both are excluded from picking it |
| 2 players | Padding brings it to 5 options, so each player sees 4 |
| 1 connected player | Plays against the padding; the game runs on deadlines |
| Nobody picks the truth | Truth step: "Nobody found the truth!" |
| Nobody picks at all | The reveal shows only the truth step and the completed fact |
| A player drops during `pick` | No pick, no points |
| Late joiner | Spectator |
| Everyone idle | The truth plus padding, no picks; the truth is shown and the game moves on |
| Pause during `reveal` | The helper freezes the step; resume continues it |

## 3.17 Tests to add

- **Scoring:** the truth, one lie fooling several players, shared lies, padding lies, the final double, idle players.
- **Leaks**
  - Option ids carry no meaning.
  - No view holds `authors`, `house` or `truth` before that option's reveal step.
  - A player's own lie never appears in their own options.
  - The display form makes truth and lies indistinguishable. Snapshot the grid with a lowercase truth and mixed-case lies that include articles.
- **Typing the truth**
  - Exact, stem, fuzzy and containment matches are all rejected with the truth message.
  - A short truth doesn't block longer words that contain it.
- **Speech**
  - Option readings are requested together, at `pick`.
  - The completed fact is requested only at the truth step.
- **Bots:** random picks, and no repeated lies.
- **Pack:** every fact has a `source`, `verified: true`, 6+ accepts, and 8 house lies that pass the §3.7 checks.

## 3.18 Recap

"Fake-Out · <date>" contains:
- each fact and its truth;
- every lie, with its author and who fell for it;
- likes and points;
- final scores and awards.

The best-liked lies make a good "hall of fame" section.

---

# Game 4 · Who Said It 🗣️

## 4.1 Pitch

| | |
|---|---|
| Name · tagline | **Who Said It** · "Everyone answers. Everyone guesses who wrote what." |
| id · icon | `who-said-it` · 🗣️ |
| Players · length | 3–16 · about 10 min · `estimatedMinutes: 10` |
| Tags | `comedy`, `bluff` |
| Bots | Welcome. They answer from a bank of answers for each prompt, and guess at random. |
| Presence | `anywhere` |
| Hook | "It was… GRANDMA?!" The reveal of the least likely author. |

**`howToPlay`**
1. Everyone answers the same question on their phone.
2. The answers appear one at a time. Tap who you think wrote each one.
3. Score for every right guess, and for every player your answer fools.

## 4.2 In plain words

Six players. The prompt is "What's a food everyone loves that you secretly can't stand?"

1. **Write.** Everyone types an answer. Ana writes "avocado". Ben writes "bacon (don't tell anyone)". And so on.
2. **Guess.**
   - The TV shows one answer at a time, read aloud: "bacon (don't tell anyone)".
   - Every phone shows the other players' faces, and everyone taps who they think wrote it.
   - Ben's phone looks exactly like everyone else's, so a neighbour can't tell it's his. His tap just doesn't count.
3. **Reveal.** The guesses fly onto faces, then: "It was… BEN!"
   - Everyone who picked Ben gets +2.
   - Ben gets +1 for each player who guessed someone else.
4. **Next answer,** until every answer has had its turn. Then scores, and the next prompt.

**The twist:** you can answer honestly, or write like someone else to throw people off. Honesty earns points for your friends; misdirection earns points for you.

## 4.3 Phases

**Order:** `intro` (once) → `prompt` → `write` → `guess` → `reveal` (the `guess`/`reveal` pair repeats once per answer) → `scores` → the next `prompt`, or `done`.

| Phase | TV shows | Phone shows | Inputs | Ends when | Sound · bed |
|---|---|---|---|---|---|
| `intro` | Title and the three steps | How to play | — | 8 s, or VIP | `start` · `warm` |
| `prompt` | "Prompt 2 of 3" and the prompt, read aloud | The prompt | — | reading + 1 s (at most 10 s), or VIP | `card` · none |
| `write` | The prompt, "Answer on your phone", chips ✓ | Prompt, answer box, 💡 Need an idea? | `answer` (resend to change), `idea` | all connected answered, 60 s, or VIP | `phase` · `lofi` |
| `guess` | "Who said it?", the answer big, "Answer 3 of 6", chips ✓ | The answer, and a `FacePicker` of everyone except yourself | `guess` (resend to change) | all connected tapped, 12 s, or VIP | `phase` (quiet) · `lofi` |
| `reveal` | Guess faces land on the faces they picked; a pause; "It was…"; the author's face flips up; points | Stage, then the player's own result | — | paced, about 4.5 s | `tally`, then `reveal`, then `cheer` (most guessed right) or `bust` (nobody did) |
| `scores` | Scoreboard with deltas | Own points and rank; VIP: **Next prompt** | — | 6 s, or VIP | `tally` · `warm` |

**Client hooks**
- `quickInto: ['reveal']`
- `stripScores` off during `guess` and `reveal`.
- `stripActive` = the author, at the flip.
- Timer `quiet` during `guess`. It repeats every 12 s, and a big countdown that often feels like an alarm.

## 4.4 Screens

### TV (1920×1080)

**Answer card** (`guess`)
- The answer, centred at h1 (72 px), up to three lines. Long answers shrink to 48 px.
- Quote marks are drawn as decoration.
- Caption: "Answer 3 of 6".
- The player strip below shows ✓ as people tap. That includes the author, who taps like everyone else.

**Reveal**
1. Every player's face is shown in a row (two rows above 8 players).
2. Each guesser's small face flies to the face they picked and stacks under it (`land`).
3. Hold for 1 s.
4. "It was…" (caption), then the author's face lifts and grows, with their name at h1.
5. Right guessers' mini-faces glow with ✓; wrong ones fade.
6. "+2" pops over each right guesser, and "+4 · fooled 4" appears under the author.

**Merged card** (two people wrote the same thing): "It was… BOTH Ana and Eli!"

### Phone (320×568)

**Write**
- The prompt (h2).
- `TextAnswer`: 60 characters, autocorrect on.
- **💡 Need an idea?**: once per prompt. It shows two canned answers as chips; tapping one fills the box.
- Sticky **Lock it in**, then **Change**.

**Guess**
- The answer text at the top (h2, up to 4 lines).
- A `FacePicker` below: 2 columns for up to 8 faces, 3 columns above 8.
- Tap to pick; tap another face to change.
- Header: "Who said it?"
- **Identical for every player, the author included.** The author can't pick themselves either.

**Reveal**
- "👀 Watch the TV".
- Once the TV shows the result, the player's own line:
  - "✓ You knew it was Ben! +2"
  - "✗ You picked Cy · It was Ben"
  - for the author: "That was yours! You fooled 4 · +4"

**Scores.** Own points, rank, and this prompt's total.

### PhoneStage

`phoneStagePhases: ['intro', 'prompt', 'reveal', 'scores']`. On `PhoneStage`, the reveal is a list of guessers under each picked face, then the author card flipping.

**Small-phone check**
- The `guess` screen with 15 faces (3 × 5) fits 320×568 when the answer is up to 3 lines.
- A 4-line answer makes the grid scroll inside `Screen`.

## 4.5 Hidden information

| Secret | Who may see it | When it goes public |
|---|---|---|
| Each answer's author | the author's own phone | that answer's `reveal` |
| Answers not yet shown | the author's own phone | their own `guess` phase |
| Guesses | the guesser's own phone | that answer's `reveal` |

**Leak rules for Who Said It**

- **The author's phone is identical during their own card.**
  - It shows the same face grid, the same header, and the same haptic.
  - Their tap is accepted and their chip shows ✓, but it doesn't score.
  - So neither a glance at their screen nor the ✓ pattern on the TV gives them away.
- **"All done" counts every connected player,** the author included, for the same reason.
- **Card order** is a seeded shuffle, never submission order.
- **Text is shown exactly as typed** (trimmed). Writing style is a fair tell here; reading your friends is part of the game.
- **Speech:**
  - Readings of every answer may be rendered as soon as `write` ends, because they reveal no authors.
  - The line "It was Ben" is requested only at that card's reveal.

## 4.6 Scoring

Per answer card:

| Who | Event | Points |
|---|---|---|
| Guesser | You picked the author (or one of them) | +2 |
| Author | Each guesser who picked someone else | +1 |

**Rules**
- Guessers who don't tap don't count as fooled.
- The author's own tap never scores.
- **Merged card:** when two answers match (`sameAnswer`), they become one card with both authors.
  - A guess naming either author is right.
  - Each author gets +1 per guesser who named neither of them.
- Scores never go down, and ties share a rank.

**Awards.** Skip an award if nobody earned it; ties share it.

| Award | Rule |
|---|---|
| 🔮 Mind Reader | most right guesses |
| 🕶️ Mystery Guest | most guessers fooled |
| 📖 Open Book | most right guesses received on their answers |
| 💞 Knows You Best | the single guesser → author pair with the most right guesses. Shown as "Ana knows Ben best (3 of 3)"; the award goes to the guesser |

## 4.7 Rounds and length

**How many prompts** (`prompts: auto`):

| Players | Prompts |
|---|---|
| 3–6 | 4 |
| 7–10 | 3 |
| 11–16 | 2 |

**Clamping.** A manual `prompts` setting is clamped so that prompts × players ≤ 40 answer cards. The settings screen says when this happens. This keeps 16-player games inside the time limit.

**Length**
- Typical: 8 players × 3 prompts ≈ 10 minutes.
- Worst legal case: 40 cards (20 s guess + 5 s reveal each), plus 4 × 120 s of writing ≈ 25 minutes. That's inside 3 × 10.

## 4.8 Inputs

```ts
const WhoInput = z.discriminatedUnion('type', [
  z.object({ type: z.literal('answer'), text: z.string().min(1).max(120) }),
  z.object({ type: z.literal('idea') }),
  z.object({ type: z.literal('guess'), target: z.string().max(64) }),
]);
```

**Ignored**
- inputs in the wrong phase;
- inputs from unknown players or spectators;
- a second `idea`;
- a `guess` naming yourself, an unknown id, or a player who wasn't seated when the prompt began.

**Rejected with copy:** an answer that's empty after normalization gets "Type an answer." The server keeps the first 60 characters of an answer.

A resent `answer` or `guess` replaces the earlier one until the phase ends.

## 4.9 State and views

```ts
type WhoState = {
  phase: PhaseState; rng: RngState; cfg: ResolvedSettings; presence: Presence;
  seats: PlayerId[]; left: PlayerId[];
  prompts: PromptItem[];                      // drawn at init
  p: {
    n: number;
    item: PromptItem;
    seated: PlayerId[];                       // candidates for every card of this prompt
    answers: Record<PlayerId, string>;        // SECRET
    ideas: Record<PlayerId, string[]>;
    cards: { id: string; text: string; authors: PlayerId[] }[] | null;  // authors SECRET until each reveal
    order: string[];
    idx: number;
    guesses: Record<PlayerId, PlayerId>;      // current card; SECRET until reveal
    delta: Record<PlayerId, { pts: number; why: string[] }>;
  };
  scores: Record<PlayerId, number>;
  stats: Record<PlayerId, { right: number; fooled: number; readBy: number }>;
  pairs: Record<string, number>;              // "guesser>author" right-guess counts
  speechMs: Record<string, number>;
};
```

**Budget:** under 20 KB at 16 players. A test fails above 48 KB.

**`tvView`** contains:
- the prompt;
- chip statuses;
- the current card's text (never upcoming cards);
- after each reveal: the guess map, the authors, and the points.

**`controllerView(p)`** contains:
- the prompt;
- the player's own answer and ideas;
- the current card's text;
- the candidates (everyone seated, minus the player);
- the player's own guess;
- their own result, once the TV shows it.

## 4.10 Bot

- **`answer`:** a random `botAnswers` entry that no other bot has used this prompt.
- **`guess`:** uniformly random among the candidates. Recognising canned answers from the pack would use information no phone has, so bots don't.
- **Author bots** tap on their own card too, as humans do, so their ✓ looks normal.

## 4.11 VIP moments

| Phase | VIP control |
|---|---|
| `intro` | **Let's go** |
| `prompt` | skip goes to `write` |
| `write` | skip closes answers |
| `reveal` | skip jumps to the next card |
| `scores` | **Next prompt** / **See results** |

## 4.12 Voice

The reader defaults to `sky`.

**Live readings**
- The prompt.
- Each answer, at the start of its `guess` phase (setting `readAnswers`).
- "It was Ben!" at the flip, when the name is readable. Otherwise, the fixed "It was…", with the name shown on screen.

**Fixed clips**
- "Time to write."
- "Who said it?"
- "It was…"
- "Everyone knew!"
- "Nobody saw that coming!"

**Prefetch**
- Every answer's reading, once `write` ends.
- The next prompt, during `scores`.

Answers are player text, so `toSpeakable` handles emoji, shouting and stretched words (P00 §5.3 rules 7, 11, 12).

## 4.13 Settings

| Key | Type | Default | Options |
|---|---|---|---|
| `prompts` | select | `auto` | auto, 1, 2, 3, 4 (clamped per §4.7) |
| `writeSeconds` | number | 60 | 30–120, step 10 |
| `guessSeconds` | number | 12 | 8–20 |
| `ideas` | boolean | true | the 💡 Need an idea? button |
| `readAnswers` | boolean | true | read each answer aloud |
| `spicy` | boolean | false | adds the spicy pack |
| `reader` | select | `sky` | every voice, none |

**Presence:** identical in every mode. In the same room, authors get to protest their innocence out loud, which is half the fun, but nothing depends on it.

## 4.14 Content

**Files:** `content/family.json`, `content/spicy.json`, `content/pronunciations.json`.

```json
{
  "id": "ws-food-004",
  "prompt": "What's a food everyone loves that you secretly can't stand?",
  "botAnswers": [
    "avocado", "Bacon. Don't tell anyone.", "sushi", "chocolate cake, way too rich",
    "watermelon, it's the texture", "pancakes", "Ice cream!! brain freeze every time",
    "tacos", "mashed potatoes", "popcorn", "peanut butter", "cheesecake"
  ]
}
```

**Bot answers**
- 12+ per prompt, at most 60 characters each.
- Written in mixed styles (short, long, lowercase, capitals, one with "!!"), so bot answers don't all look alike.

**Prompts**
- **Mix of kinds:**
  - personal preferences and habits (about 60%);
  - hypotheticals, like "Your pro-wrestler name?" (about 30%);
  - "describe yourself in three words" style (about 10%).
- **Answerable by anyone:** no assumptions about partners, children, jobs, school, religion or money.
- **Nothing sensitive:** no prompt should push people to share health issues, trauma or money trouble. The spicy pack can be flirty and embarrassing, but never hurtful.

**Sizes:** a family pack of 120 prompts, and a spicy pack of 50.

**Speech lab:** run every prompt through it.

## 4.15 Edge cases

| Situation | What happens |
|---|---|
| A player doesn't answer | No card for them; they still guess, and still count as a candidate |
| Nobody answers | "Nobody answered!", then `scores`, then the next prompt |
| Two identical answers | One merged card with both authors |
| The author leaves before their card | The card still plays; the reveal names them |
| A guesser picks someone who has left | Allowed; the candidates are fixed when the prompt begins |
| 3 players | Each card has 2 guessers, each choosing between 2 faces |
| Late joiner | Spectator; not a candidate until the next game |
| Everyone idle | No cards; the game runs out on deadlines |
| Pause mid-reveal | The helper freezes it; resume continues from the same point |

## 4.16 Tests to add

- **Author camouflage:**
  - During their own card, the author's view equals everyone else's (snapshot).
  - Their tap is accepted and shows ✓, but scores nothing.
- **Leaks:**
  - No author ids in any view before that card's reveal.
  - The text of upcoming cards never appears in any view.
- **Scoring:** right, wrong and idle guessers; merged cards; the prompts × players clamp.
- **Bots:** random guesses; distinct answers per prompt.

## 4.17 Recap

"Who Said It · <date>" contains:
- each prompt;
- every answer, with its author and who guessed right;
- the "Knows You Best" pairs;
- final scores and awards.
