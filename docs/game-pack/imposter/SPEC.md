<!-- Cut from parts/01-IMPOSTER-HERD-MIND.md (received 2026-09-24). The part file is the original;
     this copy is the one game's spec, with the part's shared intro kept on top. -->

# PartyBox Game Pack · Part 01 — Imposter and Herd Mind

_Batch 2 of 7 · read Part 00 first. References like "P00 §4.7" point into Part 00; "brief §8" points into `GAME-DESIGN-BRIEF.md`._

These two games fill gaps listed in brief §14:

- **Imposter** adds hidden roles and bluffing, and it holds up at 10–16 players.
- **Herd Mind** is a quick prediction game that also shines at 16.

Both play fully remote, because every input is typed or tapped (P00 §3.7).

---

# Game 1 · Imposter 🕵️

## 1.1 Pitch

|                  |                                                                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Name · tagline   | **Imposter** · "One of you doesn't know the word."                                                                                        |
| id · icon        | `imposter` · 🕵️                                                                                                                           |
| Players · length | 4–16 · about 10 min at 3 rounds · `estimatedMinutes: 10`                                                                                  |
| Tags             | `bluff`, `hidden-roles`, `words`                                                                                                          |
| Bots             | Welcome. Crew bots clue from a bank per word; imposter bots clue from a bank per category (§1.9).                                         |
| Presence         | `anywhere` (P00 §3.8)                                                                                                                     |
| Hook             | The clue cards flip up one by one, and one of them makes no sense. Then the caught imposter guesses the word and steals the round anyway. |

**`howToPlay`**

1. Everyone gets the secret word except the imposter, who only knows the category.
2. Everyone types one word about it. The imposter has to fake it.
3. Vote out the imposter. A caught imposter can still steal it by guessing the word.

## 1.2 A round in plain words

Six players. The word is PIZZA, the category is Food, and Sam is the imposter.

1. **Deal.** Five phones say "Your word: PIZZA". Sam's says "You're the imposter · Food". The category is the imposter's hint; the crew sees only its word until the word reveal. Each player holds the card to peek, so neighbours can't see.
2. **Clues.** Everyone types one word at the same time.
   - The crew want to prove they know the word without making it easy: "pepperoni", "slice", "delivery", "cheese", "oven".
   - Sam only knows "Food" and types "dinner".
3. **Reveal.** The TV deals the clue cards face up, one at a time, each with its author. The reader reads each one.
4. **Talk** (when everyone can talk). 60 seconds of "Dinner? Really, Sam?"
5. **Another clue round.** This happens automatically when nobody can talk, and is optional otherwise.
   - Round-one clues are now on everyone's phone, including Sam's.
   - Sam works out it's probably pizza and types "crust".
   - No clue may repeat one already on the board.
6. **Vote.** Everyone taps the face they suspect, never their own.
7. **Accusation.**
   - Voters' faces fly onto the faces they picked.
   - The most-voted player is spotlighted, and their card flips: IMPOSTER or INNOCENT.
   - A tie for most votes gets one 20-second runoff between the tied players. If it's still tied, the imposter escapes.
8. **Last chance.** A caught imposter sees six words from the category. Picking PIZZA steals 3 points.
9. **Word reveal and scores.** "The word was PIZZA", Sam's clues are highlighted, and the scoreboard climbs.

**Why the rounds work this way.** Round one is typed blind: the imposter can't copy anyone, because nobody has seen anything yet. Later clue rounds give the imposter something to work with, and also give the crew more clues to judge by. That trade is the heart of the game.

**Two imposters.** With 10+ players there can be two imposters (setting `imposters`). Each voter then picks two faces, and the two most-voted are accused (§1.6).

## 1.3 Phases

**Order:**

1. `intro` (first round only)
2. `deal`
3. `clue` → `clueReveal`, repeated once per clue round
4. `talk` (optional)
5. `vote` → `voteReveal`
6. On a tie only: `runoff` → `voteReveal`
7. `accuse`
8. `lastChance` (only if an imposter was caught and last chance is on)
9. `wordReveal`
10. `scores`
11. Next round's `deal`, or `done`

| Phase        | TV shows                                                           | Phone shows                                                                                             | Inputs                    | Ends when                                             | Sound · bed                                            |
| ------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | ------------------------- | ----------------------------------------------------- | ------------------------------------------------------ |
| `intro`      | Title and the three steps                                          | How to play                                                                                             | —                         | 8 s, or VIP                                           | `start` · `lounge`                                     |
| `deal`       | "Round 2 of 3", card backs dealt to every chip                     | `SecretCard` with the role; **Got it**                                                                  | `ready`                   | all connected ready, or 12 s (quiet timer)            | `card` · `lounge`                                      |
| `clue`       | "Type one word", chips ✓                                           | Clue box, legality line (crew only), earlier clues, mini `SecretCard`                                   | `clue` (resend to change) | all connected submitted, 40 s, or VIP                 | `phase` · `marimba`                                    |
| `clueReveal` | Clue cards dealt one at a time with their authors, each read aloud | "👀 Watch the TV" / stage                                                                               | —                         | last card + 2 s, paced to the readings (hidden timer) | `reveal`, then `card` per card · none                  |
| `talk`       | All clue cards, "Talk it over. Who's faking?", timer               | All clues listed; VIP: **Start the vote**                                                               | —                         | 60 s, or VIP                                          | `sweep` · `latenight`                                  |
| `vote`       | Clue cards dimmed, "Vote on your phone", chips ✓                   | `FacePicker` (1 or 2 picks), each face with its clues                                                   | `vote` (resend to change) | all connected voted, 30 s, or VIP                     | `phase` · `pulse`                                      |
| `voteReveal` | Voters' faces land on their targets; counts appear                 | stage                                                                                                   | —                         | paced, about 4 s                                      | `tally` · none                                         |
| `runoff`     | "Tie! Vote again: Sam or Ana?" with their clues                    | `FacePicker` limited to the tied players (never self)                                                   | `vote`                    | all voted, 20 s, or VIP                               | `phase` · `pulse`                                      |
| `accuse`     | Spotlight on the accused, a pause, then the role card flips        | stage                                                                                                   | —                         | paced, about 5 s per accused player                   | `reveal`, then `cheer` (imposter) or `bust` (innocent) |
| `lastChance` | "Sam's last chance" and the six options, or "Sam is typing…"       | Accused imposter: `ChoiceGrid` of 6 or `TextAnswer`. Everyone else: "Sam is guessing…" plus the options | `guess`                   | guess received, 20 s, or VIP                          | `wager` · `pulse`                                      |
| `wordReveal` | "The word was PIZZA", imposter clues highlighted, the guess result | stage, then the player's own result line; VIP override when allowed                                     | VIP: `countGuess`         | paced, about 6 s, or VIP                              | `reveal`, plus `jackpot` if stolen                     |
| `scores`     | Scoreboard with round deltas and reason chips, climbing            | Own points and rank; VIP: **Next round**                                                                | —                         | 8 s, or VIP                                           | `tally` · `warm`                                       |

**Client hooks:**

- `quickInto: ['clueReveal', 'accuse', 'wordReveal']`
- `stripScores`: off from `clueReveal` to `wordReveal`, so nothing is spoiled.
- `stripActive`: the accused during `accuse`; the guessing imposter during `lastChance`.
- Timer mode: `quiet` in `deal`; `hidden` in the paced reveals.

## 1.4 Screens

### TV (1920×1080)

**Clue grid**

- Four columns. Rows grow with the player count:

  | Players | Rows |
  | ------- | ---- |
  | up to 4 | 1    |
  | 5–8     | 2    |
  | 9–12    | 3    |
  | 13–16   | 4    |

- A card shows the author's face (64 px) and name (caption) on top, and the clue in the middle.
- Clue size: h1 (72 px) up to 8 players, h2 (48 px) above 8. It shrinks to fit 20 characters, but never below 36 px.
- No clue → a muted "—".
- From round two, each card stacks the player's clues: the newest big, older ones as a caption line above ("slice · crust").

**Accusation**

- Everything dims except the accused face, which scales up (transform only) with the caption "The room accuses…".
- After 1.5 s the role card flips:
  - **IMPOSTER**, with ✓ and a `--pb-accent-3` border; or
  - **INNOCENT**, with ✗ and a `--pb-danger` border.
- The word is always written; colour is never the only signal.

**Last chance**

- The accused imposter's face at the top, the six options as a 3×2 grid below (h2), and a 20 s timer.
- Typed mode: "Sam is typing…" with a pulsing dot.

**Word reveal**

- The category (caption) over **PIZZA** at display size (128 px).
- The imposter's clue cards slide forward with a 🕵️ tag.
- The guess line: "Sam guessed PIZZA · stolen! +3", or "Sam guessed PASTA · no luck".
- If the VIP counts a typed guess, the line adds "Counted by the VIP".

### Phone (320×568)

**Deal**

- A full-width `SecretCard`. Its back reads "Hold to see your word" for everyone.
- Crew face: "Your word" (caption), **PIZZA** (h1). The category stays hidden from crew until word reveal.
- Imposter face:
  - "You're the" (caption), **IMPOSTER 🕵️** (h1);
  - "Category: Food", or "No hint this round";
  - "Blend in. Don't get caught.";
  - with two imposters: "There are 2 imposters. You don't know the other one."
- Sticky **Got it**.

**Clue** (top to bottom)

- A mini `SecretCard` strip (56 px, hold to peek).
- The prompt, **identical for every role**: "One word about the secret word".
- A `TextAnswer`: 20 characters, one word. Set `autocapitalize="none"`, `autocorrect="off"` and `spellcheck={false}`, so the clue is exactly what was typed.
- The legality line, crew only (P00 §4.7).
- From round two, "Clues so far" (name · clues), collapsed by default on screens under 600 px tall.
- Sticky **Lock it in**. Once locked, the screen shows "Locked in: 'crust'" with **Change**, which reopens the box until the phase ends.

**Talk**

- A scrolling list of face, name and clues.
- The VIP gets a sticky **Start the vote**.

**Vote**

- A `FacePicker`: 2 columns for up to 8 candidates, 3 columns above 8.
- Each tile shows the face (40 px), the name (one line) and the clues (caption, one line with ellipsis). Press and hold shows all the clues.
- Self is excluded.
- With two imposters, the header says "Pick 2", and **Vote** unlocks only at exactly two.

**Last chance**

- Accused imposter: "Caught! Last chance: what's the word?", with a 2×3 `ChoiceGrid` (choices mode) or a `TextAnswer` (typed mode).
- Everyone else: "Sam is guessing…" with the six options listed, so remote players see them too.

**Own result**, shown only after the TV shows it:

- "+3 · You caught the imposter and read it right"
- "+4 · You escaped!"
- "0 · They got you"
- "+2 · Caught, but Sam stole it"

### PhoneStage (remote and phone-only)

`phoneStagePhases: ['intro', 'clueReveal', 'voteReveal', 'accuse', 'wordReveal', 'scores']`. Each one is a vertical version of the TV moment:

- the clue cards as a list, appearing at the same pace as the TV's cards;
- the votes as rows grouped by target ("Sam ← Ana, Ben, Cy");
- the accused face and the flip;
- the word, with the imposter's clues;
- a compact scoreboard.

**Small-phone check:** every phase fits 320×568 at 18 px body text. The exceptions are `talk` and `vote` above 12 players: there the list scrolls inside `Screen` and the action button stays pinned.

## 1.5 Hidden information

| Secret                | Who may see it before the reveal                     | When it's revealed                                               |
| --------------------- | ---------------------------------------------------- | ---------------------------------------------------------------- |
| The word              | crew phones                                          | `wordReveal`, TV first                                           |
| Who the imposters are | each imposter's own phone (not the other imposter's) | `accuse` for accused players; `wordReveal` for anyone not caught |
| Clues                 | the author's own phone                               | `clueReveal`, card by card                                       |
| Votes                 | the voter's own phone                                | `voteReveal`                                                     |
| Last-chance options   | not secret: the crew already know the word           | shown at `lastChance`                                            |

Declare these as secrets for the contract suite: `word`, `imposters`, unrevealed `clues`, and unrevealed `votes`.

**Leak rules specific to Imposter:**

- The imposter's clue is never checked against the word (P00 §4.7).
- Crew and imposter screens look the same during `clue` and `vote`: same prompt, same layout, same haptics. A glance at a neighbour's phone must not give the role away.
- Clue cards are revealed in a seeded shuffle, never in submission order.
- Request the line "The word was pizza" from the speech service only when `wordReveal` begins; never prefetch it. Otherwise a player could test guesses against the speech cache.
- The number of imposters is public, because it's a setting. Which seats they occupy is not.

## 1.6 Scoring

| Who      | Event                                                  | Points                   |
| -------- | ------------------------------------------------------ | ------------------------ |
| Crew     | Each of your main-vote picks that lands on an imposter | +1                       |
| Crew     | Each imposter the room catches                         | +2 for every crew member |
| Imposter | Not caught                                             | +4                       |
| Imposter | Caught, then guesses the word                          | +3                       |
| Imposter | Caught, with a wrong guess or none                     | 0                        |

**Definitions**

- **Caught** means the player is among the accused (after any runoff) and is an imposter.
- The **+1 read point** uses the main vote, even when a runoff decides the accusation. A runoff may not include the imposter at all.

**Who gets accused**

- **One imposter:**
  - The single most-voted player is accused.
  - A tie for most votes gets one runoff among the tied players.
  - If the runoff is still tied, or nobody voted at all, nobody is accused and the imposter escapes.
- **Two imposters:**
  - Each voter picks two different players, and the two most-voted are accused.
  - If players tie across the boundary, one runoff among them decides the remaining slot.
  - If the runoff is still tied, that slot stays empty.

**Judging the last-chance guess**

- **Choices mode:** the guess must be the exact option.
- **Typed mode:** `matchAnswer` against the word item must be `fuzzy` or better (P00 §4.5).
- In typed mode, the VIP may count a guess the matcher rejected (P00 §4.8). The reducer then re-scores the round.

**Other rules**

- Scores never go down.
- Ties share a rank (use the rank helper).
- The `scores` phase shows reason chips for each player: "+2 caught", "+1 read", "+4 escaped", "+3 stole".

**Awards.** Skip an award nobody earned; ties share it.

| Award                    | Rule                              |
| ------------------------ | --------------------------------- |
| 🕵️ Master of Disguise    | most escapes as imposter          |
| 🐕 Bloodhound            | most main-vote picks on imposters |
| 🎯 Word Thief            | most last-chance steals           |
| 😬 Suspiciously Innocent | most votes received while crew    |

## 1.7 Inputs

```ts
const ImposterInput = z.discriminatedUnion('type', [
  z.object({ type: z.literal('ready') }),
  z.object({ type: z.literal('clue'), text: z.string().min(1).max(40) }),
  z.object({ type: z.literal('vote'), targets: z.array(z.string().max(64)).min(1).max(2) }),
  z.object({
    type: z.literal('guess'),
    option: z.string().max(64).optional(),
    text: z.string().max(40).optional(),
  }),
  z.object({ type: z.literal('countGuess') }), // VIP only
]);
```

**Ignored silently:**

- inputs in the wrong phase;
- inputs from unknown ids (check with `hasPlayer`) or from spectators;
- a `vote` that names self, repeats a target, names an unknown id, has the wrong count, or names a player outside the runoff;
- a `guess` from anyone but an accused imposter, or a second guess;
- a `countGuess` without `vip: true`, outside `wordReveal`, or in choices mode.

**Rejected with a reason.** The phone shows the copy and plays the `rejected` haptic.

- A crew clue that fails `isLegalClue(text, word, { oneWord: true, maxChars: 20 })`.
- From round two, any clue that `sameAnswer` matches to a clue already on the board: "Someone already said that." This check uses only public clues, so it's safe to run for the imposter too.

A resent `clue` or `vote` replaces the earlier one until the phase ends.

## 1.8 State and views

```ts
type ImposterState = {
  phase: PhaseState; // id, deadline, paused (helper)
  rng: RngState;
  cfg: ResolvedSettings; // after the presence rules in §1.13
  presence: Presence;
  seats: PlayerId[]; // everyone who started, fixed order
  left: PlayerId[];
  imposterBag: PlayerId[]; // not yet imposter; refilled by seeded shuffle when empty
  words: WordItem[]; // drawn at init: rounds + 2 spares
  round: {
    n: number;
    word: WordItem; // SECRET
    category: CategoryRef;
    imposters: PlayerId[]; // SECRET
    clueRound: number;
    clues: { by: PlayerId; text: string; r: number }[]; // SECRET until revealed
    revealOrder: PlayerId[];
    revealed: number;
    ready: PlayerId[];
    votes: Record<PlayerId, PlayerId[]>; // SECRET until voteReveal
    runoff: { candidates: PlayerId[]; slots: number; votes: Record<PlayerId, PlayerId[]> } | null;
    accused: PlayerId[];
    options: string[] | null;
    guesses: Record<PlayerId, { said: string; ok: boolean; byVip: boolean }>;
    delta: Record<PlayerId, { pts: number; why: string[] }>;
  };
  scores: Record<PlayerId, number>;
  stats: Record<PlayerId, { escapes: number; reads: number; steals: number; suspicion: number }>;
  speechMs: Record<string, number>;
};
```

**Budget:** about 12 KB at 16 players. A test fails above 32 KB.

**`tvView`** contains:

- the phase and "round n of N";
- no category label before `wordReveal`; at reveal, the public category and secret word;
- revealed clue cards only;
- chip statuses;
- tallies, after `voteReveal`;
- the accused and the flip, after `accuse`;
- the options, at `lastChance`;
- the word and the guess result, at `wordReveal`;
- deltas, at `scores`.

**`controllerView(p)`** contains:

- the role;
- the word (crew only);
- the category hint, if enabled (visible only to the imposter's phone before reveal);
- the imposter count;
- the player's own clue and vote;
- the candidates, with their revealed clues;
- at `lastChance`, the options (sent to everyone), with a flag for who is guessing;
- the player's own result, after the TV shows it.

Spectators get `{ spectator: true }` plus the stage data.

**View size targets:** TV view ≤ 4 KB; phone view ≤ 2 KB.

## 1.9 Bot

Bots decide from `controllerView(state, botId)` plus the packs, which play the part of a person's general knowledge. They never read a secret they aren't allowed.

| Phase            | Crew bot                                                                                                                    | Imposter bot                                                                                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `deal`           | ready (the game may ready bots itself)                                                                                      | ready                                                                                                                                                                            |
| `clue`, round 1  | a random clue from the word's `clues` bank                                                                                  | a random clue from the category's `imposterClues`                                                                                                                                |
| `clue`, round 2+ | the same, skipping clues already on the board                                                                               | 50%: another category clue. 50%: rank the category's words by how many of their `clues` are on the board, then play an unused clue from the best one                             |
| `vote`           | suspects = players with a clue outside the word's `clues`, `accept` and `family`; pick among the suspects, otherwise anyone | pick a crew player whose clue best fits a different word from the bot's best guess, otherwise anyone                                                                             |
| `runoff`         | the same, limited to the candidates                                                                                         | a random candidate                                                                                                                                                               |
| `lastChance`     | —                                                                                                                           | Choices: the option whose `clues` overlap the board most (70% of the time), otherwise random. Typed: that option's `answer`, or 30% of the time one of its `accept` misspellings |

A bot never sends the same clue twice in a game, which keeps the variety tests happy.

## 1.10 VIP moments

| Phase        | VIP gets                                                                            |
| ------------ | ----------------------------------------------------------------------------------- |
| `intro`      | **Let's go**                                                                        |
| `talk`       | **Start the vote**; the TV shows "Next on the VIP's phone"                          |
| `wordReveal` | **✓ That counts** (typed mode, only when the guess was judged wrong) and **Scores** |
| `scores`     | **Next round**, or **See results** after the last round                             |

## 1.11 Voice

The reader defaults to `george`. Every line goes through `toSpeakable` (P00 §5).

**Live readings**

| Phase        | Line                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| `deal`       | "Round two."                                                                                                   |
| `clueReveal` | each clue on its own ("Pepperoni.")                                                                            |
| `accuse`     | "The room accuses Sam." when the name is readable (P00 §5.5); otherwise the fixed clip "The room has decided." |
| `wordReveal` | "The word was pizza." Requested only when the phase begins (§1.5)                                              |

**Fixed clips:**

- "Clues are in."
- "Time to vote."
- "It's a tie. Vote again."
- "Imposter!"
- "Innocent."
- "The imposter escapes!"
- "Last chance."
- "Stolen!"
- "The room has decided."

**Pacing:**

- Each clue card holds for its reading plus 0.3 s: at least 1.2 s, at most 3 s.
- With no reader, each card holds 1.4 s.

**Prefetch:** during `vote`, the next round's short deal line. It contains no category.

## 1.12 Settings

| Key           | Type        | Default    | Options               | Notes                                                                                        |
| ------------- | ----------- | ---------- | --------------------- | -------------------------------------------------------------------------------------------- |
| `rounds`      | number      | 3          | 1–8                   |                                                                                              |
| `imposters`   | select      | `auto`     | auto, 1, 2            | auto = 1 for 4–9 players, 2 for 10–16. Two needs 7+ players; below that it falls back to one |
| `clueRounds`  | select      | `auto`     | auto, 1, 2, 3         | auto = 1 with talk, 2 without                                                                |
| `clueSeconds` | number      | 40         | 20–90, step 5         |                                                                                              |
| `talk`        | boolean     | true       |                       | forced off when presence is `remote-text`                                                    |
| `talkSeconds` | number      | 60         | 30–180, step 15       |                                                                                              |
| `voteSeconds` | number      | 30         | 15–60, step 5         |                                                                                              |
| `hint`        | select      | `category` | category, none        | none = the imposter gets no category (hard mode)                                             |
| `lastChance`  | select      | `choices`  | choices, typed, off   |                                                                                              |
| `categories`  | multiselect | all        | the pack's categories | spicy categories are listed only when `spicy` is on                                          |
| `spicy`       | boolean     | false      |                       | adds the spicy categories                                                                    |
| `reader`      | select      | `george`   | every voice, none     |                                                                                              |

**Simulator note.** Check how the simulator chooses settings. The slowest legal combination (8 rounds, 3 clue rounds of 90 s each, 180 s of talk) runs far past 3 × `estimatedMinutes`. If the simulator can pick maximums, either lower the maximums or raise `estimatedMinutes`, and tell the owner which you did.

## 1.13 Presence

| Mode           | Behaviour                                                                                     |
| -------------- | --------------------------------------------------------------------------------------------- |
| `together`     | `talk` is on by default. Hold-to-peek matters, because people sit together                    |
| `remote-voice` | As together; the talking happens on their call                                                |
| `remote-text`  | `talk` is skipped, and `clueRounds: auto` becomes 2, so a second clue round replaces the talk |
| phone-only     | Every stage moment runs on `PhoneStage`                                                       |

Remote players see the clue cards through the per-player stage (P1) and hear the reader (P2).

## 1.14 Content

**Files:** `content/family.json`, `content/spicy.json`, `content/pronunciations.json`.

```json
{
  "category": "food",
  "label": "Food",
  "imposterClues": [
    "tasty",
    "dinner",
    "snack",
    "kitchen",
    "plate",
    "fork",
    "hungry",
    "yum",
    "menu",
    "recipe",
    "lunch",
    "leftovers"
  ],
  "words": [
    {
      "id": "food-pizza",
      "answer": "pizza",
      "accept": ["pizzas", "piza", "pitza", "pizzza", "pizza pie", "za"],
      "reject": ["pasta", "piazza"],
      "family": ["pizz"],
      "clues": [
        "pepperoni",
        "slice",
        "cheese",
        "delivery",
        "crust",
        "oven",
        "toppings",
        "margherita",
        "box",
        "napoli"
      ]
    }
  ]
}
```

A compound word shows how `family` works:

```json
{
  "id": "animals-starfish",
  "answer": "starfish",
  "accept": ["star fish", "star-fish", "starfishes", "sea star", "seastar", "starfsh"],
  "reject": ["swordfish", "sunfish"],
  "family": ["star", "fish"],
  "clues": [
    "ocean",
    "tidepool",
    "arms",
    "beach",
    "reef",
    "aquarium",
    "regrow",
    "spiky",
    "coral",
    "points"
  ]
}
```

**Pack sizes**

- **Family pack:** 14 categories × 12 words = 168 words. Categories: Food, Drinks, Animals, Around the house, Places, Jobs, Sports, Vehicles, Nature and weather, Clothes, Holidays and parties, Music, Fantasy, Tech.
- **Spicy pack:** 6 categories × 12 words, adult but not explicit. Categories: Dating, Night out, Guilty pleasures, Awkward moments, Party fouls, Bad habits.

**Rules for every word**

- 6+ `accept` forms (P00 §4.2).
- 8–10 `clues`, each passing `isLegalClue` for that word. The pack test checks this.
- `family` roots for compound words ("starfish" → `star`, `fish`).
- Known to teens and adults in any English-speaking country. No brand names, no real people, and no words only one region uses.

**Rules for every category**

- 12+ `imposterClues`, vague enough to fit every word in the category.
- Pack test: no imposter clue appears in any word's `accept` or `family`.

**Drawing and options**

- Last-chance options: the word plus 5 decoys from the same category, drawn with the state's rng. A decoy never shares an `accept` form or `family` root with the word.
- At init, draw `rounds + 2` words. Never draw two in a row from the same category.

**Speech lab:** run every category label and every clue through it.

## 1.15 Edge cases

| Situation                                      | What happens                                                                                                            |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| A player drops during `clue`                   | Counts as no clue ("—"). They can still be voted for, and can vote if they're back                                      |
| An imposter drops                              | The round goes on, and they can still be accused. `lastChance` times out if they're gone, which counts as a wrong guess |
| Every imposter **left** the game before `vote` | The round is void: "The imposter left the building." Jump to `wordReveal`, award no points, and start the next round    |
| A crew player leaves                           | Out of future imposter draws; stays in results                                                                          |
| One connected player                           | Phases run on deadlines, and the game ends normally                                                                     |
| Late joiner                                    | Spectator: stage only, no role                                                                                          |
| Two crew clues identical in round 1            | Allowed; both cards show it                                                                                             |
| A clue already on the board, round 2+          | Rejected: "Someone already said that."                                                                                  |
| The imposter types the actual word             | Accepted, because imposters aren't checked. A crew member could never type it, so it's a funny giveaway                 |
| A tie, and the runoff is still tied            | Nobody is accused for that slot                                                                                         |
| No votes at all                                | Nobody is accused; the imposters escape                                                                                 |
| Everyone idle                                  | Deadlines carry every phase, the imposters escape, and the game ends                                                    |
| The VIP skips `clue`                           | The game moves on with whatever was submitted                                                                           |
| Pause mid-reveal                               | The helper freezes the step; resume continues from the same card                                                        |
| `imposters: 2` with fewer than 7 players       | Falls back to one imposter; the settings screen says why                                                                |
| Imposter bag empty                             | Refill it with every seated player who hasn't left, in a seeded shuffle                                                 |

## 1.16 Tests to add

- **Scoring:** caught, escaped, stolen, a runoff, a two-imposter boundary tie, no votes, and a VIP-counted guess.
- **Leaks:**
  - The word never appears in an imposter's view, or in the TV view, before `wordReveal`.
  - Imposter ids never appear in another phone's view before `accuse`.
  - Unrevealed clues and votes stay private.
- **Imposter clues** are never legality-checked.
- **Same screen for both roles:** during `clue` and `vote`, crew and imposter phones render the same prompt text (snapshot test).
- **Presence:** under `remote-text`, there's no `talk`, and auto gives two clue rounds.
- **Speech:** the word's reading key is never requested before `wordReveal`.
- **Bots:** no bot repeats a clue within a game.

## 1.17 Recap

A markdown file titled "Imposter · <date>".

- **Per round:** the category, the word, the imposters, every player's clues, the votes, who was accused, the last-chance guess, and the points.
- **At the end:** final scores and awards.
