<!-- Cut from parts/04-ECHO-BLIND-AUCTION.md (received 2026-09-24). The part file is the original;
     this copy is the one game's spec, with the part's shared intro on top. -->

# PartyBox Game Pack · Part 04 — Echo and Blind Auction

_Batch 5 of 7 · read Part 00 first · games 7 and 8 of the pack._

These two games change the room's mood. Brief §14 asks for both kinds:

- **Echo** is the pack's real co-op game. Everyone wins or loses together against the deck.
- **Blind Auction** is the pack's most openly competitive and chaotic game.

Both play fully remote. Blind Auction adds a live bidding mode when everyone shares a room.

---

# Game 7 · Echo 🔁

## 7.1 Pitch

|                  |                                                                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name · tagline   | **Echo** · "One clue each. Same clue? Both vanish."                                                                                                            |
| id · icon        | `echo` · 🔁                                                                                                                                                    |
| Players · length | 3–10 · about 12 min for 10 words · `estimatedMinutes: 12`                                                                                                      |
| Tags             | `co-op`, `words`                                                                                                                                               |
| Bots             | Welcome. Clue bots pick from a bank of clues for each word. Guesser bots link the clues to a word the way a person would, and are right only some of the time. |
| Presence         | `anywhere`                                                                                                                                                     |
| Hook             | Three people write "stars", all three vanish, and the guesser is left staring at one lonely clue: "Galileo".                                                   |

**`howToPlay`**

1. One player guesses; everyone else sees the secret word and writes a one-word clue.
2. Clues that match each other vanish before the guesser sees them.
3. Guess the word from what's left. The whole group wins or loses together.

## 7.2 In plain words

Five players. It's Ana's turn to guess.

1. **Clues.**
   - Ana's phone says "You're guessing. No peeking at other phones!"
   - Everyone else's phone shows the secret word: **TELESCOPE**.
   - Each of them types one clue without seeing the others' clues: Ben writes "stars", Cy writes "stars", Dee writes "lens", Eli writes "Galileo".
2. **Echoes.**
   - Ben's and Cy's clues match, so both "stars" clues vanish.
   - Matching also catches spelling slips and plurals, so "star" and "stars" would vanish together too.
   - Before Ana sees anything, the clue-givers get a few seconds to check the game's call ("those two aren't really the same!").
3. **Guess.** The TV and Ana's phone show the surviving clues, LENS and GALILEO, plus two blank "echo" cards. Ana types "telescope".
4. **Result.**
   - **Right:** the word goes on the won pile.
   - **Pass:** the word is discarded.
   - **Wrong:** the word is discarded, _and so is the next word_ in the deck. A wild guess costs double.

Then the next player guesses. After the last word, the group gets its score (words won out of the deck) and a rating.

**With only 3 players,** each clue-giver writes **two** different clues, so the guesser has enough to go on.

## 7.3 Phases

Order: `intro` (once) → `clue` → `check` → `guess` → `result` → the next `clue`, or `done` (with the finale board).

| Phase    | TV shows                                                                                                                | Phone shows                                                                                                               | Inputs                | Ends when                                        | Sound · bed                                       |
| -------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------ | ------------------------------------------------- |
| `intro`  | Title, the three steps, "Deck: 10 words"                                                                                | How to play                                                                                                               | —                     | 8 s, or VIP                                      | `start` · `lounge`                                |
| `clue`   | "Word 4 of 10 · Ana is guessing", clue-givers' chips ✓, the deck (left / won / lost)                                    | Clue-givers: the word (hold to see), clue box, 🤔 Don't know it. Guesser: "You're guessing. No peeking!"                  | `clue`, `dontKnow`    | all clue-givers submitted, 35 s, or VIP          | `phase` · `lofi`                                  |
| `check`  | "Listening for echoes…" (no clues shown)                                                                                | Clue-givers: every clue, echoes struck through, with **Not the same**, **Same word** and **Looks good**. Guesser: waiting | `split`, `join`, `ok` | all clue-givers tapped Looks good, 12 s, or VIP  | `tally` · `lofi`                                  |
| `guess`  | Surviving clues as big cards, echoes as blank 🔇 cards, "Ana, what's the word?"                                         | Guesser: the clues, guess box, **Guess** and **Pass**. Others: the clues and "Ana is guessing…"                           | `guess`, `pass`       | a guess or pass, 25 s (counts as a pass), or VIP | `phase` · `pulse`                                 |
| `result` | "The word was TELESCOPE", the guess with ✓ / ✗ / PASS, the echoed clues uncovered with their authors, the deck updating | Stage, then own line; VIP override when allowed                                                                           | VIP: `countGuess`     | paced, about 6 s, or VIP                         | `jackpot` (right), `bust` (wrong), `sweep` (pass) |

**Client hooks**

- `quickInto: ['guess', 'result']`
- `stripActive`: the guesser, throughout.
- `stripScores`: off. It's co-op, so the deck counter is the score.
- `Finale`: the rating board (§7.8).
- Timer: `quiet` in `check`.

## 7.4 Screens

### TV (1920×1080)

**Never show the secret word before `result`.** The guesser is looking at this screen.

**Deck counter** (top right, in every phase)

- Three stacks, each with a number and an icon: 🂠 left · ✓ won · ✗ lost.
- In `result`, cards slide between the stacks (`deal`).

**Clue**

- "Ana is guessing", with Ana's face ringed (`stripActive`).
- A row of card backs, one per clue-giver. Each card turns face-down with a ✓ when that player's clue arrives.

**Guess**

- Surviving clues as cards in one row (two rows above 6), in h1 text.
- Each echoed clue is a blank card with 🔇 and the word "echo", so the room can see how many were lost.
- If nothing survived: "Total echo! Ana's on her own."

**Result**

- The word at display size (128 px), under "The word was".
- The guess below it, marked ✓ (`--pb-accent-3`), ✗ (`--pb-danger`) or PASS. The mark is always written out, never shown by colour alone.
- The echo cards flip to show their text and authors.
- On a wrong guess, the next word's card slides face-down onto the lost pile: "…and it burned the next word."

### Phone (320×568)

**Clue-giver, during `clue`**

- `SecretCard` with the word ("Hold to see the word").
- Prompt: "One word to help Ana guess it". With 3 players: "Two different words to help Ana".
- `TextAnswer`: one word, 20 characters, autocorrect on, with the legality line. 3-player games show two boxes.
- **🤔 Don't know this word**: small and secondary; see §7.6.
- Sticky **Lock it in**, which becomes **Change** once locked.

**Guesser, during `clue` and `check`**

- A calm waiting screen: "You're guessing! No peeking at other phones", with the deck counter.
- Nothing about the word.

**Clue-giver, during `check`**

- Every clue as a row, without authors.
- Echo groups are struck through and bracketed together. Each group has **Not the same ✋**.
- Each surviving row has a small **Same word ✋** to pair it with another survivor.
- Sticky **Looks good**.

**Guess**

- The surviving clues as chips (h2).
- Guesser: `TextAnswer` (30 characters), **Guess**, and a secondary **Pass**.
- Everyone else: "Ana is guessing…" under the chips.

**Result**

- At-TV phones show "👀 Watch the TV" first.
- Then one line:
  - "✓ Got it! 7 won so far"
  - "✗ Not quite. The next word burned too"
  - "Pass. On to the next"

### PhoneStage

`phoneStagePhases: ['intro', 'result']`. The `guess` phase needs no stage, because every phone already shows the surviving clues.

**Small-phone check:** all phases fit 320×568. The tallest is `check` with 9 clue-givers (9 rows of 48 px); it scrolls inside `Screen`, with **Looks good** pinned.

## 7.5 Hidden information

| Secret               | Who may see it                                                   | When it goes public                           |
| -------------------- | ---------------------------------------------------------------- | --------------------------------------------- |
| The word             | clue-givers' phones only (not the guesser, the TV or spectators) | `result`                                      |
| Clues                | the author's phone during `clue`; all clue-givers during `check` | survivors at `guess`; echoed ones at `result` |
| Who wrote which clue | nobody                                                           | `result`                                      |

- **Spectators** get TV-level views only. A spectator's phone never shows the word, because they may be sitting next to the guesser.
- **"Don't know it" taps** are never shown to the guesser. They would hint that the word is hard.
- **Speech:** survivors are read when `guess` begins. "The word was telescope" is requested only when `result` begins.

## 7.6 Clues and echoes

### Clue rules

The server checks each clue with `isLegalClue(clue, word, { oneWord: true, maxChars: 20 })` from P00 §4.7. That rejects:

- the word itself;
- its plurals and misspellings;
- anything containing it;
- its `family` roots.

The phone mirrors these checks. Clue-givers already know the word, so the rejection messages leak nothing.

In 3-player games, a player's two clues must not match each other (`sameAnswer`): "Two different words, please."

### Automatic echoes

At the start of `check`, group every clue with `sameAnswer` (union-find, in seat order). Any group with 2+ clues is an echo, and all its clues vanish.

`sameAnswer` treats "star"/"stars" and "pepperoni"/"peperoni" as the same. It leaves short near-misses like "card"/"cart" alone.

### The check

This phase is for clue-givers only, and lasts up to 12 s. The matcher can be wrong in both directions: "planet"/"planes" look like a typo pair, while "colour"/"color" don't. So:

- **Not the same ✋** on an echo group restores all its clues.
- **Same word ✋** on two survivors turns them into an echo.
- Any single clue-giver's tap applies at once, and anyone can undo it. There's no voting; it's co-op, so nobody gains by cheating.
- The guesser, the TV and spectators see only "Listening for echoes…".
- Setting `check: false` skips this phase and uses the automatic result.

### Don't know it

During `clue`, if at least half the connected clue-givers (rounded up) tap **Don't know this word** within the first 15 s:

- the word is swapped for a spare;
- the clues reset;
- the TV says "Word swapped!".

A word can be swapped at most 2 times. There's no swap once the spares run out.

## 7.7 Scoring

| Outcome                                              | What happens to the deck                                                                                                                                               |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Right (`matchAnswer` is `fuzzy` or better, P00 §4.5) | The word goes on the **won** pile                                                                                                                                      |
| Pass (or no guess by the deadline)                   | The word goes on the **lost** pile                                                                                                                                     |
| Wrong                                                | The word **and the next word in the deck** go on the lost pile. On the last word there's no next word, so one already-won word moves to lost instead (if there is one) |

- **Score** = words won.
- During `result`, the VIP can count a guess the matcher rejected (P00 §4.8). The deck is then recomputed.
- The game ends when the deck is empty.

**Rating** (the share of the deck won):

| Won         | Rating        |
| ----------- | ------------- |
| all of them | 🏆 Flawless   |
| 85% or more | 🌟 Brilliant  |
| 70–84%      | 🎉 Great      |
| 55–69%      | 👍 Solid      |
| 30–54%      | 🔥 Warming up |
| under 30%   | 🔁 Try again! |

**Results**

- Every player's score is the team's number of words won.
- Great or better crowns everyone; below that, nobody is crowned.
- If the results screen needs a winner, use the same fallback as Tune In co-op (P03 §5.7).

**Awards.** These are individual. Skip an award if nobody earned it; ties share it.

| Award            | Rule                                                            |
| ---------------- | --------------------------------------------------------------- |
| 🗝️ Key Clue      | wrote the most surviving clues on words that were guessed right |
| 🔁 Echo Chamber  | had the most clues vanish (at least 2)                          |
| 🎯 Sharp Guesser | most right guesses as the guesser                               |
| 🙈 Bold Guess    | most wrong guesses (at least 2)                                 |

## 7.8 Finale board

This board stays on the results screen. It shows:

- the won words as face-up cards;
- the lost words face-down;
- the score ("7 of 10");
- the rating, with its icon.

## 7.9 Inputs

```ts
const EchoInput = z.discriminatedUnion('type', [
  z.object({ type: z.literal('clue'), texts: z.array(z.string().min(1).max(40)).min(1).max(2) }),
  z.object({ type: z.literal('dontKnow') }),
  z.object({ type: z.literal('split'), group: z.string().max(16) }),
  z.object({ type: z.literal('join'), a: z.string().max(16), b: z.string().max(16) }),
  z.object({ type: z.literal('ok') }),
  z.object({ type: z.literal('guess'), text: z.string().min(1).max(60) }),
  z.object({ type: z.literal('pass') }),
  z.object({ type: z.literal('countGuess') }), // VIP only
]);
```

**Ignored:**

- inputs in the wrong phase;
- inputs from spectators;
- anything from the guesser except `guess` and `pass`;
- a `clue` with 2 texts outside 3-player games;
- `split`, `join` or `ok` from the guesser;
- `countGuess` without `vip: true`, or outside `result`.

**Rejected with copy:** clues that fail the §7.6 rules.

A resent `clue` replaces the earlier one, until `clue` ends.

## 7.10 State and views

```ts
type EchoState = {
  phase: PhaseState;
  rng: RngState;
  cfg: ResolvedSettings;
  presence: Presence;
  seats: PlayerId[];
  left: PlayerId[];
  deck: WordItem[]; // drawn at init: `words` items
  spares: WordItem[]; // drawn at init: 6 items for swaps
  rotation: PlayerId[]; // guesser order: seat order from a seeded start
  w: {
    idx: number;
    word: WordItem; // SECRET from the guesser, TV and spectators until result
    guesser: PlayerId;
    clues: Record<PlayerId, string[]>; // SECRET until guess / result
    dontKnow: PlayerId[];
    swaps: number;
    groups: { id: string; refs: { by: PlayerId; i: number }[]; echo: boolean }[] | null;
    checkOk: PlayerId[];
    guess: { text: string; result: 'right' | 'wrong' | 'pass'; byVip: boolean } | null;
  };
  won: string[];
  lost: string[];
  stats: Record<PlayerId, { keyClues: number; echoed: number; right: number; wrong: number }>;
  speechMs: Record<string, number>;
};
```

**Budget:** under 16 KB at 10 players. A test fails above 32 KB.

**`tvView`:**

- word number, deck counts, the guesser, and clue-giver chip statuses;
- at `guess`: the surviving clue texts and the echo count;
- at `result`: the word, the guess, the outcome, and every clue with its author.

**`controllerView(p)`**

- **Guesser:** role, deck counts, the surviving clues at `guess`, and their own outcome once the TV has shown it.
- **Clue-giver:** the word, their own clues, the legality message, the check list at `check`, the surviving clues at `guess`, and their own line once the TV has shown it.
- **Spectators:** the TV view.

## 7.11 Bot

| Role       | What the bot does                                                                                                                                                                                                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clue-giver | Picks from the word's `clues` bank, weighted towards the top of the list (the bank is ordered from most to least obvious). So bots sometimes echo each other, just like people. In 3-player games it gives two different clues                                                     |
| Check      | Taps **Looks good**                                                                                                                                                                                                                                                                |
| Guesser    | Ranks every word in the pack by how many of the surviving clues appear in its `clues` bank. With k matching survivors, it guesses the best word with probability 0.3 + 0.15 × k, capped at 0.85. Otherwise it passes half the time and guesses the second-best word the other half |

Bots never tap **Don't know it**.

## 7.12 VIP moments

| Phase    | VIP control                                                                                    |
| -------- | ---------------------------------------------------------------------------------------------- |
| `intro`  | **Let's go**                                                                                   |
| `clue`   | skip closes clues                                                                              |
| `check`  | skip counts as Looks good for everyone                                                         |
| `guess`  | skip counts as a pass                                                                          |
| `result` | **✓ That counts** (only when the guess was judged wrong), then **Next word** / **See results** |

If the VIP is the guesser, their override button still works. It's co-op, and the room will keep them honest.

## 7.13 Voice

The reader defaults to `george`.

**Live readings**

- At `guess`: each surviving clue in turn ("Lens. Galileo.").
- At `result`: "The word was telescope." Request it only when `result` begins.

**Fixed clips**

- "Clue time."
- "Echo!" (played once, when echo cards appear)
- "Total echo!"
- "Got it!"
- "Oh no."
- "Pass."
- "Word swapped."
- "Last word!"
- The six ratings: "Flawless!" · "Brilliant!" · "Great!" · "Solid." · "Warming up." · "Try again!"

**Prefetch:** the surviving clues are rendered when `check` ends. Never prefetch the word.

## 7.14 Settings

| Key            | Type        | Default  | Options                   |
| -------------- | ----------- | -------- | ------------------------- |
| `words`        | number      | 10       | 6–13                      |
| `clueSeconds`  | number      | 35       | 20–60, step 5             |
| `guessSeconds` | number      | 25       | 15–45, step 5             |
| `check`        | boolean     | true     | clue-givers review echoes |
| `categories`   | multiselect | all      | the pack's categories     |
| `spicy`        | boolean     | false    | adds the spicy words      |
| `reader`       | select      | `george` | every voice, none         |

**Time check:** the slowest legal game is 13 × (60 + 12 + 45 + 8) s, about 27 minutes. That's inside the 3 × 12 limit.

**Presence**

- Echo plays the same in every presence mode.
- In the same room, clue-givers must not say their clues out loud. That's a house rule; the game can't enforce it.
- In phone-only rooms, `intro` and `result` run on `PhoneStage`.

## 7.15 Content

**Files:** `content/family.json`, `content/spicy.json`, `content/pronunciations.json`.

```json
{
  "id": "echo-objects-044",
  "category": "objects",
  "answer": "telescope",
  "accept": ["telescopes", "telescop", "telliscope", "teloscope", "telascope", "tellescope"],
  "reject": ["microscope", "periscope", "stethoscope"],
  "family": ["tele", "scope"],
  "clues": [
    "stars",
    "space",
    "lens",
    "astronomer",
    "Galileo",
    "zoom",
    "observatory",
    "planets",
    "moon",
    "sky"
  ]
}
```

**Words**

- Concrete, well-known nouns, plus a few verbs; one or two words each.
- No brands, no real people.
- Categories: animals, food, objects, places, jobs, nature, activities, fantasy, sports, around the house.

**Each word needs**

- 6+ `accept` forms.
- A `reject` list for look-alikes, to avoid the microscope/telescope trap.
- `family` roots for compound words.
- 10 bank `clues`:
  - ordered from most to least obvious;
  - written as they'd be displayed;
  - each one legal for that word (checked by the pack test).

**Pack sizes**

- Family pack: 300 words, so a 10-word deck feels fresh on replays.
- Spicy pack: 80 words, adult but not explicit (hangover, tequila, flirt, speed dating).

**Speech lab:** run every word and every bank clue through it.

## 7.16 Edge cases

| Situation                                     | What happens                                                                     |
| --------------------------------------------- | -------------------------------------------------------------------------------- |
| The guesser drops                             | The turn still runs; no guess by the deadline counts as a pass                   |
| The guesser has left the game                 | They're skipped in the rotation, and the next player guesses                     |
| No clues at all                               | `guess` shows "No clues!"; the guesser can still try                             |
| Every clue echoes                             | "Total echo!"; the guesser can still try                                         |
| 3 players                                     | Two clue-givers, with two clues each                                             |
| Only one clue-giver connected                 | Their clue can't echo; play on                                                   |
| Wrong guess on the last word, nothing won yet | Nothing more to lose                                                             |
| No spares left for Don't know it              | The button hides                                                                 |
| Late joiner                                   | Spectator (TV view only)                                                         |
| Everyone idle                                 | No clues are written and each word times out; the deck empties and the game ends |
| Pause                                         | The helper pauses the game; the `check` clock stops too                          |

## 7.17 Tests to add

**Echoes**

- Identical clues, plurals, and typo pairs of 6+ letters cancel.
- "card"/"cart" survive.
- Split and join work in `check`.
- A 3-player duplicate pair is rejected.

**Deck rules**

- Right, pass, and wrong (burns the next word).
- Wrong on the last word (moves a won word to lost).
- A VIP-counted guess.

**Leaks**

- The word never appears in the guesser's, the TV's or a spectator's view before `result`.
- Clues never appear in the TV's or the guesser's view before `guess`.
- Echoed texts and authors never appear before `result`.
- "Don't know it" counts never appear in the guesser's view.

**Swaps:** the threshold, the 15 s window, the 2-swap limit, and running out of spares.

**Bots:** clue variety; guesser probabilities.

## 7.18 Recap

"Echo · <date>" contains:

- for each word: the guesser, every clue (survived or echoed, with authors), the guess, and the outcome;
- the final score, rating and awards.
