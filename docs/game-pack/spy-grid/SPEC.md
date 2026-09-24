<!-- Cut from parts/05-SPY-GRID.md (received 2026-09-24). The part file is the original;
     this copy is the one game's spec, with the part's shared intro on top. -->

# PartyBox Game Pack · Part 05 — Spy Grid

_Batch 6 of 7 · read Part 00 first · game 9 of the pack._

Spy Grid is the pack's big team game, in the style of Codenames. It fills three gaps listed in brief §14:

- **teams**;
- a real **win-or-lose-together** structure inside each team;
- a game that **shines at 8–16 players**.

It also has a small co-op mode for 2–3 players.

It is the largest game in the pack: expect roughly 1,000–1,400 lines of TypeScript, plus content. Build it after the smaller games have exercised the shared components.

---

# Game 9 · Spy Grid 🗂️

## 9.1 Pitch

|                  |                                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Name · tagline   | **Spy Grid** · "One-word clues. Find your agents. Avoid the trap."                                                                                                 |
| id · icon        | `spy-grid` · 🗂️                                                                                                                                                    |
| Players · length | 4–16 in teams, 2–3 in co-op (manifest: 2–16) · about 18 min · `estimatedMinutes: 18`                                                                               |
| Tags             | `teams`, `words`, `strategy`                                                                                                                                       |
| Bots             | Welcome. The word pack is built from themes, so bot spymasters can give real clues and bot guessers can follow them. On mixed teams, bots follow the humans' lead. |
| Presence         | `anywhere` (P00 §3.8)                                                                                                                                              |
| Hook             | "Ocean, three." The team flips SHARK, then SHIP… then argues for a full minute about ANCHOR versus PIRATE.                                                         |

**`howToPlay`**

1. Two teams, one grid of 25 words. Only each team's spymaster knows which words are their agents.
2. Your spymaster gives a one-word clue and a number, like "Ocean, 3". Tap the words you think match.
3. Find all your agents first. Touch the assassin and your team loses on the spot.

## 9.2 In plain words

### The board

The TV shows 25 words in a 5×5 grid: SHARK, PIANO, SHIP, MOON, ANCHOR, and so on. Everyone can see the words. Only the two spymasters know what each word is.

### The key

Secretly, each word is one of four things:

| Identity                | How many                          |
| ----------------------- | --------------------------------- |
| ▲ Sun agent             | 9 if Sun goes first, 8 otherwise  |
| ● Moon agent            | 9 if Moon goes first, 8 otherwise |
| 🚶 Bystander (innocent) | 7                                 |
| 💀 Assassin             | 1                                 |

The two spymasters see this key on their phones. Everyone else only ever sees the words, until a card flips.

### A turn

1. **The clue.**
   - Sun's spymaster studies the key and gives **one word and one number**, for example "Ocean, 3".
   - That means "three of our agents have something to do with ocean".
   - Spymasters say nothing else: no hints, no faces, no pointing.
2. **The guesses.** Sun's players talk it over and tap words on their phones. (Remote players without a call point silently instead.) When most of the team points at the same word, it flips:
   - ▲ **Our agent:** great. Keep guessing, up to the clue's number + 1.
   - 🚶 **Bystander:** the turn ends.
   - ● **Their agent:** the turn ends, and we've just found one of _theirs_ for them.
   - 💀 **Assassin:** we lose, instantly.
3. **Stopping.** After the first guess, the team can stop whenever it likes by choosing **End turn**. Then it's Moon's turn.

### Winning

- The first team whose agents are all flipped wins. That still counts if the other team flipped some of them by mistake.
- Flip the assassin, and the other team wins.

**Why the "+1".** It lets a team go back for an agent it missed on an earlier clue.

### Co-op (2–3 players)

One spymaster, and everyone else guesses. There's no enemy team: the goal is to find all 9 agents within 8 clues without touching the assassin (§9.11).

## 9.3 The key and the board

|                        | Teams mode                                       | Co-op mode   |
| ---------------------- | ------------------------------------------------ | ------------ |
| Starting team's agents | 9                                                | 9 (one team) |
| Other team's agents    | 8                                                | —            |
| Bystanders             | 7                                                | 15           |
| Assassins              | 1 (2 with `assassins: 2`, replacing a bystander) | 1 (or 2)     |

- **Starting team.** The rng picks it at the start of each round. The TV shows it: "▲ Sun goes first: 9 agents".
- **The words.**
  - The 25 words are drawn from the pack by theme (§9.20), so every board has clusters that can be clued.
  - No two words on a board share a root: never SUN and SUNFLOWER together.
- **New rounds.** Each new round draws a new board and a new key.

## 9.4 Phases

There's no separate `intro`; the `teams` phase carries the how-to-play.

**Order:**

1. `teams`
2. `clue`
3. `guess`, then `flip`; these two alternate while the team keeps guessing
4. `turnEnd`
5. The next team's `clue`, and so on until a team wins
6. `win`
7. The next round's `clue` (teams stay; spymasters rotate), or `done`

| Phase     | TV shows                                                                                                                 | Phone shows                                                                                                                                                                      | Inputs                              | Ends when                                                               | Sound · bed                                                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `teams`   | Two columns, ▲ Sun and ● Moon, with faces; 🕶️ badges on spymaster volunteers; the three steps                            | **Join Sun** / **Join Moon**, **I'll be spymaster**. VIP: **Shuffle** and **Start**                                                                                              | `join`, `volunteer`; VIP: `shuffle` | VIP **Start**, or 45 s                                                  | `start` · `lounge`                                                                                                                            |
| `clue`    | The board; the active team's banner glowing; "▲ Sun's spymaster is thinking…"; the timer                                 | Spymaster: the key and the clue box. Everyone else: the board, read-only                                                                                                         | spymaster: `clue`                   | clue sent; 75 s (no clue means the turn passes); or VIP                 | `phase` (spymaster's phone only) · `latenight`                                                                                                |
| `guess`   | The clue bar ("▲ OCEAN · 3", "Guesses left: 4"); the board with the active team's pointers and reactions; the step timer | Active guessers: the board, pointers, **Point** confirm bar, **End turn**, reactions. Spymasters: the key, the live pointers, "Stay silent 🤐". Other team: the board, read-only | `point`, `unpoint`, `react`         | a card or End turn reaches a majority; the step deadline (§9.7); or VIP | `phase` when a turn starts · `pulse`                                                                                                          |
| `flip`    | The chosen card flips to show whether it's an agent, bystander, enemy agent or assassin                                  | At the TV: "👀 Watch the TV", then the board updates. Remote: the flip on `PhoneStage`                                                                                           | —                                   | about 2 s (paced to the clip)                                           | `reveal`, then `tie` (bystander), `bust` (enemy agent) or `bust` + `silence` (assassin). The guessing team's phones play `correct` or `wrong` |
| `turnEnd` | "▲ Sun found 2. ● Moon's turn." Agents left per team                                                                     | "Moon's turn"                                                                                                                                                                    | —                                   | 2.5 s                                                                   | `sweep`                                                                                                                                       |
| `win`     | Every remaining card flips to show the full key; "▲ SUN WINS!" with the reason; round wins, if `rounds` > 1              | Own team's result. VIP: **Next round** / **See results**                                                                                                                         | —                                   | 10 s, or VIP                                                            | `fanfare`, `win`                                                                                                                              |

**Client hooks**

- `stripHidden` in `clue`, `guess`, `flip` and `turnEnd`. The `TeamBanner` shows the players, and the board needs the room.
- `stripActive`:
  - the active spymaster, during `clue`;
  - the active team, during `guess`.
- `quickInto: ['flip', 'turnEnd']`
- Timer: `quiet` during `clue` (thinking time); normal digits during `guess`.

## 9.5 Screens

### `WordGrid` (P00 §6), specified here

#### TV (1920×1080)

**Layout**

- 5×5 cards, each about 340×130, with 12 px gaps.
- The grid fills the stage below the `TeamBanner` and the clue bar.
- Row letters A–E run down the left and column numbers 1–5 along the top (caption, `--pb-text-muted`), so the room can say "B3".

**Unflipped card**

- Background `--pb-surface`.
- The word in capitals at h2 (48 px), shrinking to 36 px for 9–10 letters.

**Pointed-at card**

- A ring in the active team's colour and shape.
- The pointers' faces (32 px) in the top-right corner: up to four, then "+2".
- Reactions (👍 👎 🤔) float above the card for 5 s.

**Flipped card**

- The card turns over (`flip`, 600 ms; a crossfade under reduced motion) to show its identity:

  | Identity   | Colour                        | Icon |
  | ---------- | ----------------------------- | ---- |
  | Sun agent  | `--pb-accent`                 | ▲    |
  | Moon agent | `--pb-info`                   | ●    |
  | Bystander  | `--pb-surface-2`, word dimmed | 🚶   |
  | Assassin   | `--pb-danger`                 | 💀   |

- The icon sits large in the centre. The word stays small in the top-left, so the room remembers what it was.
- Never colour alone.

#### Phone

**Grid mode** (default on screens 380 px wide or more)

- The same 5×5 grid.
- Cells at least 44×44.
- Words in capitals at 13 px, shrinking to 11 px.
- Row and column labels outside the grid.

**List mode** (default under 380 px wide, e.g. iPhone SE)

- Two columns of buttons in reading order, each at least 44 px tall.
- Each button shows the coordinate ("B3", caption) and the word at 16 px.

Players can switch between the two modes in the 🎨 sheet (a per-phone setting).

In both modes:

- flipped cards show their icon and a dimmed word;
- pointer faces (20 px) sit inside the cell or button.

### TV by phase

**`teams`**

- Two tall columns under ▲ Sun and ● Moon, with faces joining live.
- A 🕶️ badge beside each spymaster volunteer.
- The how-to-play steps in a side panel.
- "Pick a team on your phone".

**`clue`**

- The board.
- The active team's banner, half lit.
- "▲ Sun's spymaster is thinking…" in the clue bar.
- Agents left per team, in the banner ("▲ 6 left · ● 8 left").

**`guess`**

- The clue bar shows "▲ OCEAN · 3" in h1 and "Guesses left: 4" in caption.
- Pointers and reactions on the cards.
- An **End turn** tile at the end of the clue bar, showing how many are pointing at it.

**History strip**

- Shown along the bottom edge in every phase after the first clue.
- The last four clues as chips ("▲ OCEAN 3 → 2 found"), so late arrivals and remote players can catch up.

**`win`**

- All remaining cards flip in a fast ripple (60 ms apart) to reveal the whole key.
- The winner's banner fills the top.
- The reason in h2, for example:
  - "Every Sun agent found!"
  - "Moon found the assassin!"
  - "Out of turns: Sun had fewer agents left"

### Phone by role

#### Spymaster (`clue` and `guess`)

**Hiding the key**

- The key is hidden by default behind **Show key 👁**. This is a `SecretCard`-style cover in tap-to-toggle mode.
- After it's shown, it hides again 20 s after the last touch. That's longer than SecretCard's usual 5 s, because spymasters need time to study.
- A tip underneath: "Tilt your phone away from your team."

**The key layout** defaults to a **grouped list**, the easiest to read on any phone:

- "▲ Your agents (6 left): SHARK · SHIP · WAVE · …"
- "● Their agents (8 left): …"
- "🚶 Bystanders: …"
- "💀 Assassin: PIANO"

Flipped words are struck through. A **Grid view** toggle shows the coloured 5×5 instead.

**During `clue` only**

- A `TextAnswer` for the word: 20 characters, one word.
- A number stepper from 1 to 9, with 44 px buttons.
- The legality line (§9.8).
- A preview line: "You'll say: OCEAN, 3".
- Sticky **Send clue**.

**During `guess`**

- The key stays on screen, with the team's live pointers shown on it.
- A "Stay silent 🤐" banner.
- The number of guesses left.

#### Guesser on the active team (`guess`)

- The clue at the top: "OCEAN · 3 · 4 guesses left".
- A line under the clue explains the rule: "A card flips when most of your team points at it."
- **Pointing:**
  1. Tap a card. A confirm bar opens at the bottom: "Point at SHARK?" with **Point ☝️** and **Cancel**.
  2. Once you've pointed, your face sits on the card.
  3. Tapping the card again offers **Take back**.
- **End turn ✋** appears after the turn's first flip. It works the same way: point at it to vote to stop.
- **Reactions:** long-press a card to get a row of 👍 👎 🤔. Your team and the TV see the reaction for 5 s.

#### Guesser on the other team (`clue` and `guess`)

- The board, read-only, with the active team's pointers.
- "▲ Sun is guessing…".

#### Everyone (`flip`, `turnEnd`, `win`)

- At-TV phones show "👀 Watch the TV", then the board updates.
- After a flip on your team's turn, your phone plays an in-hand cue: `correct` for your own agent, `wrong` otherwise.

### PhoneStage

`phoneStagePhases: ['flip', 'turnEnd', 'win']`. PhoneStage shows:

- the flipped card, big, with its identity;
- the turn summary;
- the full key at the end.

Input phases need no stage, because every phone already has the board.

### Small-phone check

**Guesser, 320×568, list mode**

- The clue line: 40 px.
- 13 rows of 48 px buttons: about 620 px, scrolling inside `Screen`.
- The confirm bar, pinned.

**Spymaster**

- The grouped key fits without scrolling in most games.
- The clue box and **Send clue** stay pinned.

## 9.6 Picking teams and spymasters

**Starting point.** `init` places everyone with `teamsFromSeed` (P00 §6: even sizes, bots spread). The game is valid even if nobody taps anything.

**The `teams` phase** (setting `teamPick: choose`)

- Each phone can **Join Sun** or **Join Moon**, and toggle **I'll be spymaster**.
- The VIP gets:
  - **Shuffle**: re-runs `teamsFromSeed` with the next rng draw;
  - **Start**.
- In co-op, the phase only asks who wants to be spymaster.

**When `teams` ends**, apply these rules in order:

1. **Balance.** If the teams differ by more than one player, move the bigger team's most recent joiners across.
2. **Minimum.** Each team needs at least 2 members: a spymaster and a guesser. With 4 players, that's 2 against 2.
3. **Spymasters.** For each team, pick:
   - a volunteer, if there is one (the rng picks among several);
   - otherwise, a random human on the team;
   - a bot only if the team has no humans.

**Random teams.** `teamPick: random` skips the phase. Teams come from `teamsFromSeed`, and spymasters are picked by rule 3.

**Later rounds** keep the same teams. Each team's spymaster role rotates to the next member in seat order, humans first.

## 9.7 Guessing by pointing

A team guesses together by **pointing**. Each guesser has one pointer, which can be on a card, on **End turn**, or nowhere.

- **Majority flips it.** A card flips as soon as more than half of the team's connected guessers point at it. The spymaster doesn't count.

  | Connected guessers | Pointers needed               |
  | ------------------ | ----------------------------- |
  | 1                  | 1 (their own confirmed point) |
  | 2                  | 2 (both must agree)           |
  | 3                  | 2                             |
  | 4                  | 3                             |

- **End turn** works the same way, but only after the team's first flip this turn.
- **The step deadline.** Each guess step has a deadline (`guessSeconds`, default 60 s), which resets after every flip. When it expires:
  - if one card, or End turn, has more pointers than anything else, it wins;
  - if there's a tie, or nobody is pointing, the turn ends without a flip.
- **Pointers reset** after every flip.
- **Disconnects change the count.** When a guesser drops, the majority is recomputed at once (on the `player` event). A card may flip because of that.
- **Bots follow; humans lead.**
  - On a team with at least one connected human guesser, a bot points only after a human has pointed, and then at the card most humans are pointing at.
  - Only an all-bot team lets bots lead.
  - Without this rule, two fast bots could outvote a human before the human had even read the clue.
- **Limits.** A turn allows up to the clue's number + 1 flips. After the last allowed flip, the turn ends.
- **Reactions.** 👍 👎 🤔 on a card never move pointers; they exist so silent teams can talk (§9.19). One reaction per player per second.

## 9.8 Rules for clues

The spymaster sends one word and one number from 1 to 9.

The server checks each clue, and the spymaster's phone shows the same checks as they type. The board is public, so these checks leak nothing.

| Check                                                                                                                                                                             | Player sees                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Empty, or more than one word after normalization                                                                                                                                  | "One word only."                              |
| Longer than 20 characters                                                                                                                                                         | "Keep it under 20 letters."                   |
| Contains a digit (numbers belong in the number box, and grid spots like "B3" aren't clues)                                                                                        | "No numbers in the word. Use the number box." |
| `isLegalClue` (P00 §4.7) fails against **any unflipped board word**: the clue is that word or a form of it, contains it, is contained in it (4+ letters), or matches its `family` | "That's (too close to) a word on the board."  |
| Number outside 1–9                                                                                                                                                                | Can't happen: the stepper doesn't allow it    |

**Words already flipped** are fair game, as in the original.

**House rules.** Clues must be about meaning, not letters or positions, and spymasters make no gestures. These are shown in the `teams` panel and on the spymaster's phone; the game can't check them.

## 9.9 Turns and winning

| Card flipped       | Result                                              |
| ------------------ | --------------------------------------------------- |
| Own agent          | +1 found. If guesses remain, the team guesses again |
| Bystander          | The turn ends                                       |
| Other team's agent | It counts for the other team, and the turn ends     |
| Assassin           | The round ends at once, and the other team wins     |

**How a round ends**

- **All agents found.** A team wins the round the moment all its agents are flipped, whoever flipped them. So flipping the other team's last agent makes the other team win.
- **No clue.** If the spymaster gives no clue by the deadline, the TV shows "No clue!" and the turn passes to the other team.
- **Turn cap.** After `maxTurns` turns in a round (counting both teams), the team with fewer agents left wins. Equal counts are a draw.
- **Idle draw.** Four turns in a row with no clue given ends the round as a draw ("Nobody's talking!"). This keeps idle simulations short.
- **Forfeit.** If everyone on a team except the spymaster has left the game (left, not just dropped), the other team wins the round.

**Rounds.** With `rounds` > 1, the team with more round wins takes the game. Equal round wins are a draw.

## 9.10 Scoring and awards

**Results**

- Each player scores the number of rounds their team won: 0 or 1 in a one-round game.
- Teams rank together.
- `winnerIds` is the winning team, or both teams on a draw.

**During play** no points are shown. The `TeamBanner`'s "agents left" count is the score.

**Awards.** Skip an award if nobody earned it; ties share it.

| Award         | Rule                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------- |
| 🕶️ Master Spy | the spymaster with the best average number of own agents found per clue (at least 2 clues)  |
| 🔗 Big Link   | the single clue that found the most own agents (at least 3); goes to its spymaster          |
| 🎯 Sharp Eye  | the guesser who was first to point at the most cards that turned out to be their own agents |
| 💀 Trap Door  | the first player to point at the assassin, if it was flipped                                |

## 9.11 Co-op mode (2–3 players)

**Setup**

- One team with one spymaster; everyone else guesses. With 2 players, that's one guesser.
- The key has 9 agents, 15 bystanders and 1 assassin. With `assassins: 2`, a second assassin replaces a bystander.

**Play**

- The team has `coopTurns` clues (default 8).
- Clue rules, guessing by pointing, and the number + 1 limit all work as in teams mode.
- A bystander ends the turn.

**Ending**

- All 9 agents found: a win.
- The assassin flipped: a loss, ending the round at once.
- Clues run out: a loss.

**Rating** on the finale board: "Mission complete with 2 clues to spare 🕶️", or "Agents found: 6 of 9".

**Results**

- Everyone scores the number of agents found.
- A completed mission crowns everyone. The co-op fallback in P03 §5.7 applies.

**Rounds.** With `rounds` > 1, the spymaster rotates each round.

## 9.12 Hidden information

| Secret                          | Who may see it                                | When it goes public                         |
| ------------------------------- | --------------------------------------------- | ------------------------------------------- |
| The key (every card's identity) | both spymasters' phones                       | each card when it flips; all cards at `win` |
| An unsent clue                  | the spymaster's phone                         | when sent                                   |
| Pointers and reactions          | not secret: the TV and every phone, by design | live                                        |

**Leak rules for Spy Grid**

- **The key lives in its own array in state.** Only a spymaster's `controllerView` includes it. Guessers, the TV and spectators get identities only for flipped cards.
- **Card ids are grid positions (0–24).** Those are public anyway. Nothing sent to a non-spymaster before a card flips may reveal its identity: not its id, not its order, not any other field.
- **Two-stage flip, so the TV reveals first.**
  - Stage 0 (`flip` begins): the TV turns the card.
  - Stage 1, 0.8 s later: the identity is added to phone views.
- **Spymaster privacy in the room.** Show key is off by default and auto-hides (§9.5).
- **A replacement spymaster sees the key from then on** (§9.21). That can't be avoided. The replacement is chosen by rule, never by a player.
- **Flip clips** ("Assassin!") are fixed files, requested only when they play, after the flip.

## 9.13 Inputs

```ts
const SpyInput = z.discriminatedUnion('type', [
  z.object({ type: z.literal('join'), team: z.enum(['sun', 'moon']) }),
  z.object({ type: z.literal('volunteer'), on: z.boolean() }),
  z.object({ type: z.literal('shuffle') }), // VIP only
  z.object({
    type: z.literal('clue'),
    word: z.string().min(1).max(40),
    number: z.number().int().min(1).max(9),
  }),
  z.object({
    type: z.literal('point'),
    target: z.union([z.number().int().min(0).max(24), z.literal('end')]),
  }),
  z.object({ type: z.literal('unpoint') }),
  z.object({
    type: z.literal('react'),
    card: z.number().int().min(0).max(24),
    emoji: z.enum(['👍', '👎', '🤔']),
  }),
]);
```

**Ignored:**

- inputs in the wrong phase;
- inputs from spectators;
- `join` or `volunteer` outside `teams`;
- `shuffle` without `vip: true`;
- `clue` from anyone but the active spymaster;
- `point`, `unpoint` or `react` from the other team or from a spymaster;
- pointing at a card that's already flipped;
- pointing at `end` before the turn's first flip;
- more than one reaction per second from the same player.

**Rejected with copy:** clues that fail §9.8.

The Point confirm bar is handled on the phone. The server only ever sees the confirmed `point`.

## 9.14 State and views

```ts
type Team = 'sun' | 'moon';
type Kind = 'sun' | 'moon' | 'bystander' | 'assassin';
type SpyState = {
  phase: PhaseState;
  rng: RngState;
  cfg: ResolvedSettings;
  presence: Presence;
  seats: PlayerId[];
  left: PlayerId[];
  mode: 'teams' | 'coop';
  teams: Record<Team, PlayerId[]>; // co-op: sun only
  spymaster: Record<Team, PlayerId | null>;
  volunteers: PlayerId[];
  round: number;
  roundWins: Record<Team, number>;
  board: { word: string; itemId: string }[]; // 25, public
  key: Kind[]; // SECRET: spymasters only
  flipped: (0 | 1 | 2)[]; // 0 hidden · 1 flipping (TV only) · 2 shown everywhere
  starter: Team;
  turn: {
    team: Team;
    n: number;
    clue: { word: string; number: number } | null;
    left: number; // guesses left this turn
    made: number;
    pointers: Record<PlayerId, number | 'end'>;
    reactions: Record<PlayerId, { card: number; emoji: string; until: number }>;
    flip: { card: number } | null;
  };
  idleTurns: number;
  winner: Team | 'draw' | null;
  reason: 'agents' | 'assassin' | 'cap' | 'idle' | 'forfeit' | null;
  coop: { cluesLeft: number } | null;
  history: {
    team: Team;
    spymaster: PlayerId;
    word: string;
    number: number;
    flips: { card: number; kind: Kind; first: PlayerId | null }[];
  }[];
  stats: Record<
    PlayerId,
    { clues: number; agentsFromClues: number; bestClue: number; sharp: number; trap: number }
  >;
  speechMs: Record<string, number>;
};
```

**Budget:** under 24 KB at 16 players; the history is the bulk. A test fails above 48 KB.

**`tvView`** contains:

- mode, teams, spymasters, starting team, and agents left per team;
- the board, with identities for cards at stage 1 or 2;
- the clue, guesses left, and the active team's pointers and live reactions;
- the last four history entries;
- the round number and round wins;
- at `win`: the whole key and the reason.

**`controllerView(p)`** contains:

- the player's role (spymaster, guesser, other team, or spectator) and team;
- the board, with identities for cards at stage 2;
- **spymasters only:** the full key;
- the player's own pointer;
- the active team's pointers and reactions;
- the clue and guesses left;
- the legality message (spymaster only);
- the player's own team's result, at `win`.

Spectators receive exactly the TV view.

## 9.15 Bot

The pack's themes (§9.20) are the bots' general knowledge: a bot knows SHARK goes with "ocean" the way a person does. A bot never reads the key unless it is the spymaster.

**Bot spymaster**

1. **Filter themes.** For each theme, count its unflipped members that are own agents. Discard any theme that includes the assassin.
2. **Score themes.** Score = own agents covered − 1.5 × enemy agents covered − 0.5 × bystanders covered. That way enemy agents cost more than bystanders. Take the best-scoring theme that covers at least one own agent.
3. **Pick the clue.**
   - Clue word = the theme's `clue`, or one of its `alts` if the `clue` is illegal against the board (§9.8).
   - Number = own agents covered, capped at 4.
4. **Fallback.** If no theme works, clue a single own agent with one of its `hints`, number 1.
5. **Vary it.** When the top two themes score close together, pick between them with the rng.

**Bot guesser.** A bot guesser only leads on an all-bot team (§9.7).

1. If the clue matches a theme's `clue` or `alts` (`sameAnswer`), point at that theme's unflipped members, in the theme's order.
2. Otherwise, if the clue matches a word's `hints`, point at that word.
3. Otherwise:
   - with probability 0.3, point at a random unflipped card;
   - otherwise, point at **End turn** (after the first flip), or at nothing.
4. After the clue's number of flips, point at End turn.

**Following humans.** On a mixed team, a bot waits until a human points, then points at the card most humans are pointing at. If the humans point at End turn, so does the bot.

## 9.16 VIP moments

| Phase             | VIP control                        |
| ----------------- | ---------------------------------- |
| `teams`           | **Shuffle** and **Start**          |
| `clue`            | Skip: no clue, and the turn passes |
| `guess`           | Skip: End turn now                 |
| `flip`, `turnEnd` | Skip: move on                      |
| `win`             | **Next round** / **See results**   |

## 9.17 Voice

The reader defaults to `fable`.

**Live reading:** the clue, when it's sent: "Ocean, three." `toSpeakable` turns the number into a word.

**Fixed clips**

- "Sun goes first." · "Moon goes first."
- "Sun's turn." · "Moon's turn."
- "Agent!" · "Enemy agent!" · "Bystander." · "Assassin!"
- "No clue!" · "Out of guesses."
- "Sun wins!" · "Moon wins!" · "It's a draw."
- "Mission complete!" · "Mission failed."

**Prefetch:** none needed. Nothing Spy Grid reads aloud is secret, and the flip clips are fixed files.

## 9.18 Settings

| Key            | Type    | Default  | Options            | Notes                                    |
| -------------- | ------- | -------- | ------------------ | ---------------------------------------- |
| `mode`         | select  | `auto`   | auto, teams, co-op | auto = co-op at 2–3 players, teams at 4+ |
| `teamPick`     | select  | `choose` | choose, random     | `random` skips the `teams` phase         |
| `rounds`       | number  | 1        | 1–3                | A new board each round                   |
| `clueSeconds`  | number  | 75       | 30–180, step 15    |                                          |
| `guessSeconds` | number  | 60       | 20–120, step 10    | Per guess step (§9.7)                    |
| `maxTurns`     | number  | 24       | 16–30              | Teams mode only, per round               |
| `coopTurns`    | number  | 8        | 5–12               | Number of clues in co-op                 |
| `assassins`    | select  | 1        | 1, 2               | The second assassin replaces a bystander |
| `reactions`    | boolean | true     |                    | 👍 👎 🤔 on cards                        |
| `spicy`        | boolean | false    |                    | Adds the spicy word pack                 |
| `reader`       | select  | `fable`  | every voice, none  |                                          |

**Simulator note.**

- **Defaults are fine.** With default settings and random bots, games finish well under an hour.
- **Extremes don't fit.** The slowest legal combination doesn't fit 3 × 18 minutes: 3 rounds × 30 turns, with 180 s clues and 120 s guess steps, and bots on the `slow` strategy.
- **What to do.** Check how the simulator chooses settings and strategies. If it can combine those extremes, either:
  - cap the legal ranges, for example `rounds × maxTurns ≤ 48` and `clueSeconds + 3 × guessSeconds ≤ 360`; or
  - raise `estimatedMinutes`.

  Report which you did.

- **Idle games** are already kept short by the idle-draw rule.

## 9.19 Presence

| Mode           | Behaviour                                                                                                                                                   |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `together`     | Teams talk it over out loud; the other team can hear, as in the original. Spymaster privacy matters: Show key is off by default and auto-hides              |
| `remote-voice` | Teams talk on the call. On a single shared call, both teams hear each other, as in the room. Private team calls are the players' own setup and out of scope |
| `remote-text`  | No talking. The team decides by pointing alone, reactions (👍 👎 🤔) are the only chatter, and the history strip matters more. Everything still works       |
| phone-only     | `flip`, `turnEnd` and `win` run on `PhoneStage`                                                                                                             |

## 9.20 Content

**Files:** `content/words.json`, `content/themes.json`, `content/spicy-words.json`, `content/spicy-themes.json`, `content/pronunciations.json`.

A word entry:

```json
{
  "id": "shark",
  "word": "SHARK",
  "themes": ["ocean", "danger", "fish"],
  "hints": ["jaws", "fin"],
  "family": ["shark"]
}
```

A theme entry:

```json
{
  "id": "ocean",
  "clue": "ocean",
  "alts": ["sea", "marine", "underwater"],
  "members": [
    "shark",
    "ship",
    "wave",
    "whale",
    "anchor",
    "pirate",
    "coral",
    "island",
    "diver",
    "submarine"
  ]
}
```

### Words

- Single words of at most 10 letters, shown in capitals.
- Common enough that every player knows them.
- No brands and no real people.
- Every word needs:
  - membership in 2 or more themes;
  - 2 `hints`: one-word clues that point at that word alone;
  - `family` roots.
- No two words on a board may share a root. The draw rejects a pair if:
  - `sameAnswer` matches them;
  - one contains the other (4+ letters); or
  - their `family` roots overlap.

### Themes

- Each theme has a one-word `clue`, 2–3 `alts`, and 6–12 member words ordered from most to least obvious.
- Every theme's `clue` and `alts` must be legal against each of its own members. The pack test checks this, so the bot spymaster never gets stuck.

### Drawing a board

1. Pick 5 themes with the rng.
2. Take 3 members from each (15 words).
3. Fill the other 10 from the whole pool.
4. Reject any word that clashes (see Words above) and draw again.
5. Deal the key with the rng: the starting team's 9 agents, the other team's 8, the bystanders and the assassin.

### Pack sizes

- **Family pack:** 400 words in 120 themes.
- **Spicy pack:** 120 words in 36 themes, adult but not explicit (HANGOVER, TEQUILA, CRUSH, EX). When `spicy` is on, it mixes into the family pool.

**Speech lab:** run every theme `clue`, every `alt`, and every word through it. Words are spoken in the recap and the spoken history.

## 9.21 Edge cases

| Situation                                     | What happens                                                                                                                                                                 |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The spymaster drops                           | The team's turns run on deadlines. No clue in time means "No clue!" and the turn passes                                                                                      |
| The spymaster leaves the game                 | At the start of their team's next `clue`, the next human on that team in seat order becomes spymaster (a bot if there are no humans). The TV says "Ben is the new spymaster" |
| A team has no connected guessers              | Guess steps time out, and the turn ends without a flip                                                                                                                       |
| Everyone on a team but the spymaster has left | Forfeit: the other team wins the round                                                                                                                                       |
| A player drops while pointing                 | Their pointer is removed, and the majority is recomputed                                                                                                                     |
| Two cards tie at the step deadline            | No flip; the turn ends                                                                                                                                                       |
| A team flips the other team's last agent      | The other team wins                                                                                                                                                          |
| 4 players, some of them bots                  | Works. On mixed teams, bots follow the humans                                                                                                                                |
| Everyone idle                                 | Teams come from `teamsFromSeed`. Spymasters give no clues, four idle turns make a draw, and the game ends                                                                    |
| Late joiner                                   | Spectator: they get the TV view only, never the key                                                                                                                          |
| Pause                                         | The helper stops the step clock; pointers stay where they are                                                                                                                |
| VIP skip during `flip`                        | The flip completes instantly (the identity is shown everywhere), then the game moves on                                                                                      |

## 9.22 Tests to add

**Key**

- Composition is correct for each mode and each `assassins` value.
- The starting team has 9 agents.
- A board never contains a root clash.

**Pointing**

- Majority thresholds for 1, 2, 3 and 4 guessers.
- Plurality and ties at the step deadline.
- End turn is available only after a flip.
- The majority is recounted when a guesser disconnects.
- Bots never lead on a mixed team.

**Turn rules**

- The number + 1 limit.
- Bystander, enemy agent and assassin outcomes.
- Flipping the enemy's last agent.
- No clue given.
- The turn cap, the idle draw, and forfeit.
- Multiple rounds.

**Clue rules**

- Unflipped board words, and forms of them, are rejected.
- Flipped words are allowed.
- Digits are rejected.

**Leaks**

- The key appears only in spymaster views.
- Identities reach phones only at stage 2.
- Spectators never see the key.
- Nothing in a non-spymaster view differs by a card's identity before it flips.

**Co-op:** the clue budget, a win, a loss, and the rating.

**Bots**

- The bot spymaster avoids themes that contain the assassin.
- The bot guesser follows theme clues.
- Bot play varies across games.

## 9.23 Recap

A markdown file titled "Spy Grid · <date>". For each round, it includes:

- the board drawn as a 5×5 table, with each word's identity;
- every clue with its number and spymaster, what was flipped, and who pointed first;
- the winner and the reason.

After the rounds come the round wins and the awards.
