<!-- Cut from parts/02-FAKE-OUT-WHO-SAID-IT.md (received 2026-09-24). The part file is the original;
     this copy is the one game's spec, with the part's shared intro on top. -->

# PartyBox Game Pack · Part 02 — Fake-Out and Who Said It

_Batch 3 of 7 · read Part 00 first._

_References: "P00 §4.7" points into Part 00; "P01 §1.4" points into Part 01. Games are numbered across the whole pack, so this file holds games 3 and 4._

These are two write-then-guess games. They play differently from Wisecrack and Blanks, which are write-and-vote comedy:

- **Fake-Out** is bluffing against a hidden truth.
- **Who Said It** is about reading the people in the room.

Both play fully remote (P00 §3.7).

---

# Game 4 · Who Said It 🗣️

## 4.1 Pitch

|                  |                                                                                   |
| ---------------- | --------------------------------------------------------------------------------- |
| Name · tagline   | **Who Said It** · "Everyone answers. Everyone guesses who wrote what."            |
| id · icon        | `who-said-it` · 🗣️                                                                |
| Players · length | 3–16 · about 10 min · `estimatedMinutes: 10`                                      |
| Tags             | `comedy`, `bluff`                                                                 |
| Bots             | Welcome. They answer from a bank of answers for each prompt, and guess at random. |
| Presence         | `anywhere`                                                                        |
| Hook             | "It was… GRANDMA?!" The reveal of the least likely author.                        |

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

| Phase    | TV shows                                                                                          | Phone shows                                                | Inputs                              | Ends when                            | Sound · bed                                                                      |
| -------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------- |
| `intro`  | Title and the three steps                                                                         | How to play                                                | —                                   | 8 s, or VIP                          | `start` · `warm`                                                                 |
| `prompt` | "Prompt 2 of 3" and the prompt, read aloud                                                        | The prompt                                                 | —                                   | reading + 1 s (at most 10 s), or VIP | `card` · none                                                                    |
| `write`  | The prompt, "Answer on your phone", chips ✓                                                       | Prompt, answer box, 💡 Need an idea?                       | `answer` (resend to change), `idea` | all connected answered, 60 s, or VIP | `phase` · `lofi`                                                                 |
| `guess`  | "Who said it?", the answer big, "Answer 3 of 6", chips ✓                                          | The answer, and a `FacePicker` of everyone except yourself | `guess` (resend to change)          | all connected tapped, 12 s, or VIP   | `phase` (quiet) · `lofi`                                                         |
| `reveal` | Guess faces land on the faces they picked; a pause; "It was…"; the author's face flips up; points | Stage, then the player's own result                        | —                                   | paced, about 4.5 s                   | `tally`, then `reveal`, then `cheer` (most guessed right) or `bust` (nobody did) |
| `scores` | Scoreboard with deltas                                                                            | Own points and rank; VIP: **Next prompt**                  | —                                   | 6 s, or VIP                          | `tally` · `warm`                                                                 |

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

| Secret                | Who may see it          | When it goes public     |
| --------------------- | ----------------------- | ----------------------- |
| Each answer's author  | the author's own phone  | that answer's `reveal`  |
| Answers not yet shown | the author's own phone  | their own `guess` phase |
| Guesses               | the guesser's own phone | that answer's `reveal`  |

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

| Who     | Event                                  | Points |
| ------- | -------------------------------------- | ------ |
| Guesser | You picked the author (or one of them) | +2     |
| Author  | Each guesser who picked someone else   | +1     |

**Rules**

- Guessers who don't tap don't count as fooled.
- The author's own tap never scores.
- **Merged card:** when two answers match (`sameAnswer`), they become one card with both authors.
  - A guess naming either author is right.
  - Each author gets +1 per guesser who named neither of them.
- Scores never go down, and ties share a rank.

**Awards.** Skip an award if nobody earned it; ties share it.

| Award             | Rule                                                                                                                                |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 🔮 Mind Reader    | most right guesses                                                                                                                  |
| 🕶️ Mystery Guest  | most guessers fooled                                                                                                                |
| 📖 Open Book      | most right guesses received on their answers                                                                                        |
| 💞 Knows You Best | the single guesser → author pair with the most right guesses. Shown as "Ana knows Ben best (3 of 3)"; the award goes to the guesser |

## 4.7 Rounds and length

**How many prompts** (`prompts: auto`):

| Players | Prompts |
| ------- | ------- |
| 3–6     | 4       |
| 7–10    | 3       |
| 11–16   | 2       |

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
  phase: PhaseState;
  rng: RngState;
  cfg: ResolvedSettings;
  presence: Presence;
  seats: PlayerId[];
  left: PlayerId[];
  prompts: PromptItem[]; // drawn at init
  p: {
    n: number;
    item: PromptItem;
    seated: PlayerId[]; // candidates for every card of this prompt
    answers: Record<PlayerId, string>; // SECRET
    ideas: Record<PlayerId, string[]>;
    cards: { id: string; text: string; authors: PlayerId[] }[] | null; // authors SECRET until each reveal
    order: string[];
    idx: number;
    guesses: Record<PlayerId, PlayerId>; // current card; SECRET until reveal
    delta: Record<PlayerId, { pts: number; why: string[] }>;
  };
  scores: Record<PlayerId, number>;
  stats: Record<PlayerId, { right: number; fooled: number; readBy: number }>;
  pairs: Record<string, number>; // "guesser>author" right-guess counts
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

| Phase    | VIP control                       |
| -------- | --------------------------------- |
| `intro`  | **Let's go**                      |
| `prompt` | skip goes to `write`              |
| `write`  | skip closes answers               |
| `reveal` | skip jumps to the next card       |
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

| Key            | Type    | Default | Options                             |
| -------------- | ------- | ------- | ----------------------------------- |
| `prompts`      | select  | `auto`  | auto, 1, 2, 3, 4 (clamped per §4.7) |
| `writeSeconds` | number  | 60      | 30–120, step 10                     |
| `guessSeconds` | number  | 12      | 8–20                                |
| `ideas`        | boolean | true    | the 💡 Need an idea? button         |
| `readAnswers`  | boolean | true    | read each answer aloud              |
| `spicy`        | boolean | false   | adds the spicy pack                 |
| `reader`       | select  | `sky`   | every voice, none                   |

**Presence:** identical in every mode. In the same room, authors get to protest their innocence out loud, which is half the fun, but nothing depends on it.

## 4.14 Content

**Files:** `content/family.json`, `content/spicy.json`, `content/pronunciations.json`.

```json
{
  "id": "ws-food-004",
  "prompt": "What's a food everyone loves that you secretly can't stand?",
  "botAnswers": [
    "avocado",
    "Bacon. Don't tell anyone.",
    "sushi",
    "chocolate cake, way too rich",
    "watermelon, it's the texture",
    "pancakes",
    "Ice cream!! brain freeze every time",
    "tacos",
    "mashed potatoes",
    "popcorn",
    "peanut butter",
    "cheesecake"
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

| Situation                            | What happens                                                       |
| ------------------------------------ | ------------------------------------------------------------------ |
| A player doesn't answer              | No card for them; they still guess, and still count as a candidate |
| Nobody answers                       | "Nobody answered!", then `scores`, then the next prompt            |
| Two identical answers                | One merged card with both authors                                  |
| The author leaves before their card  | The card still plays; the reveal names them                        |
| A guesser picks someone who has left | Allowed; the candidates are fixed when the prompt begins           |
| 3 players                            | Each card has 2 guessers, each choosing between 2 faces            |
| Late joiner                          | Spectator; not a candidate until the next game                     |
| Everyone idle                        | No cards; the game runs out on deadlines                           |
| Pause mid-reveal                     | The helper freezes it; resume continues from the same point        |

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
