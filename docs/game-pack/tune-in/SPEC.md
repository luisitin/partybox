<!-- Cut from parts/03-TUNE-IN-HIVE-RANK.md (received 2026-09-24). The part file is the original;
     this copy is the one game's spec, with the part's shared intro on top. -->

# PartyBox Game Pack · Part 03 — Tune In and Hive Rank

_Batch 4 of 7 · read Part 00 first · this part covers games 5 and 6 of the pack._

Both games are about **prediction**, a skill nothing in the current lineup covers (brief §14):

- **Tune In**: players place a clue on a dial between two opposites. It works from 2 players (co-op) up to 16.
- **Hive Rank**: a 5-minute game about predicting how the room orders five things.

Both play fully remote.

---

# Game 5 · Tune In 📻

## 5.1 Pitch

|                  |                                                                                                                               |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Name · tagline   | **Tune In** · "One clue. Everyone guesses where it lands."                                                                    |
| id · icon        | `tune-in` · 📻                                                                                                                |
| Players · length | 2–16 · about 12 min · `estimatedMinutes: 12`                                                                                  |
| Tags             | `words`, `co-op`, `teams`                                                                                                     |
| Bots             | Welcome. Psychic bots pick a clue from the spectrum's clue bank. Guesser bots place clues they recognise, and guess the rest. |
| Presence         | `anywhere`                                                                                                                    |
| Hook             | The shutter swings open on the target, and everyone's face lands on the dial: one dead centre, one hilariously far off.       |

**`howToPlay`**

1. One player, the psychic, secretly sees a target on a dial between two opposites.
2. The psychic gives a clue that belongs at that spot. Everyone else slides their dial.
3. The closer to the target, the more points, for you and for the psychic.

## 5.2 In plain words

The dial runs between two opposites, for example **COLD** on the left and **HOT** on the right. Only the psychic's phone shows where the target is.

### Solo (the default for 3–16 players)

Five players, and Ana is the psychic.

1. Ana's phone shows the target at 80, well towards HOT.
2. She types a clue that belongs there: "coffee".
3. Everyone else drags a slider on their phone to where they think coffee sits between cold and hot: Ben 85, Cy 70, Dee 60, Eli 95.
4. The target opens up and points are scored. With the normal target size:
   - within 5 of the target scores 4;
   - within 10 scores 3;
   - within 15 scores 2.

| Player        | Dial | Off by | Points                                    |
| ------------- | ---- | ------ | ----------------------------------------- |
| Ben           | 85   | 5      | 4                                         |
| Cy            | 70   | 10     | 3                                         |
| Eli           | 95   | 15     | 2                                         |
| Dee           | 60   | 20     | 0                                         |
| Ana (psychic) | —    | —      | 2 (the guessers' average, 9 ÷ 4, rounded) |

Next round, someone else is the psychic. Everyone gets a turn until the rounds run out.

### Teams (4–16 players)

Team ▲ Sun plays against team ● Moon, taking turns.

1. Sun's psychic gives a clue.
2. The other Sun players each drag their own dial.
   - When everyone can talk, they see each other's markers move and argue it out. This is the "huddle".
   - Sun's needle is the average of their dials.
3. Moon calls **LEFT** or **RIGHT**: is the target left or right of Sun's needle?
4. Scoring:
   - Sun scores 4, 3 or 2 based on where the needle lands.
   - Moon scores 1 for a correct call, unless Sun hit the bullseye.

The first team to 10 points wins. A team that hits a bullseye while still behind goes again.

### Co-op (automatic at 2 players, optional up to 8)

- Everyone is on one side, playing against the dial. The psychic role rotates.
- The group needle is the average of the guessers' dials. With two players, it's simply the other player's dial.
- Points add up to a group total.
- The finale rates the group: Static, Tuning in, Crystal clear or Mind meld.

## 5.3 Modes at a glance

|                  | Solo                                            | Teams                                  | Co-op                                   |
| ---------------- | ----------------------------------------------- | -------------------------------------- | --------------------------------------- |
| Players          | 3–16                                            | 4–16                                   | 2–8                                     |
| Who guesses      | everyone but the psychic, each alone and hidden | the psychic's teammates, as one needle | everyone but the psychic, as one needle |
| Talking          | not needed                                      | huddle when everyone can talk          | huddle when everyone can talk           |
| Extra step       | —                                               | the other team calls LEFT / RIGHT      | —                                       |
| Ends             | after the rounds                                | first to 10, or after 12 turns         | after the rounds, with a rating         |
| Chosen by `auto` | at 3+ players                                   | never (the VIP has to choose it)       | at 2 players                            |

## 5.4 Phases

**Order:**

1. `intro` (once)
2. `clue`
3. `dial`
4. `call` (teams only)
5. `reveal`
6. `scores`
7. The next `clue`, or `done`.

| Phase    | TV shows                                                                                           | Phone shows                                                                                                                    | Inputs                           | Ends when                                                        | Sound · bed                                                    |
| -------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------- |
| `intro`  | Title, mode, the three steps (teams: both team rosters)                                            | How to play; own team                                                                                                          | —                                | 8 s, or VIP                                                      | `start` · `lounge`                                             |
| `clue`   | "Round 3 · Ana is the psychic", the dial with its two ends, the shutter closed, "Ana is thinking…" | Psychic: the target (hold to see) and the clue box. Others: the two ends and "Ana is thinking of a clue…"                      | psychic: `clue`                  | clue sent, 45 s, or VIP. With no clue, the round is void (§5.16) | `card` · `latenight`                                           |
| `dial`   | The clue in large text, the dial, chips ✓. Huddle: live markers and the needle                     | Guessers: clue, `DialInput`, **Lock in**; in huddle, teammates' markers too. Psychic: own clue and the target. Others: waiting | `dial` (throttled, §5.9), `lock` | all guessers locked, 25 s, or VIP                                | `phase` · `marimba`                                            |
| `call`   | Sun's needle on the dial (target still hidden), "Moon: LEFT or RIGHT?"                             | Moon: ◀ LEFT / RIGHT ▶. Sun: waiting                                                                                           | `call`                           | all callers tapped, 15 s, or VIP                                 | `phase` · `pulse`                                              |
| `reveal` | The shutter swings open; faces land at their dials; the needle settles; distances and points       | Stage, then own result                                                                                                         | —                                | paced, about 6 s                                                 | `reveal`; `jackpot` on a bullseye; `bust` if everyone scored 0 |
| `scores` | Solo: scoreboard. Teams: the two totals racing to the target. Co-op: the group meter               | Solo: leaderboard; teams: both totals; co-op: points this round and group total. VIP: **Next round**                           | —                                | VIP, or 20 s fallback                                            | `tally` · `warm`                                               |

**Client hooks:**

- `quickInto: ['reveal']`
- `stripScores`: off during `dial` and `reveal`.
- `stripActive`:
  - the psychic, during `clue` and `dial`;
  - the calling team, during `call`.
- Timer: `quiet` during `clue`, because thinking time shouldn't feel like an alarm.

## 5.5 Screens

### TV (1920×1080)

**The dial** (`Dial`, P00 §6)

- A semicircle about 1400 px wide, centred low on the stage.
- Each end's label sits at that end's foot (h2), with ◀ on the left and ▶ on the right.
- The clue sits in a bubble above the top of the arc (h1, up to 30 characters).
- During `clue`, the bubble shows "Ana is thinking…" with moving dots.

**The target**

- Five wedges reading 2 · 3 · 4 · 3 · 2.
- Each number is printed inside its wedge, so colour is never the only signal.
- Colours: `--pb-info` for the 2 wedges, `--pb-accent` for the 3 wedges, `--pb-accent-2` for the 4 wedge.
- Until `reveal`, a shutter in `--pb-surface` covers the whole face. At the reveal it swings away (rotate, transform only).
- When the target sits near an edge, the wedges are clipped at the ends of the dial.

**Markers**

- At the reveal, each guesser's face (40 px) `land`s on the rim at their dial position.
- Faces stack outwards where they overlap.
- Team and co-op modes add a thick needle from the centre to the group position.
- "+4", "+3" or "+2" pops over each face.

**Huddle** (teams and co-op, when on)

- The active side's faces glide along the rim as they drag.
- The needle follows their average, live.

**Teams**

- A `TeamBanner` across the top shows both scores and the target ("First to 10").
- The active team's side glows.
- A "CATCH-UP!" tag appears on a bonus turn.

**Co-op**

- A group meter across the top: the total so far out of the maximum, with the four rating bands marked.

### Phone (320×568)

**Psychic, during `clue`**

- Header: "You're the psychic 📻".
- The target, drawn as a horizontal version of the dial between the two end labels, with the 2 · 3 · 4 · 3 · 2 zones and their numbers.
  - It sits behind a `SecretCard` cover ("Hold to see the target"), so neighbours can't peek.
- A `TextAnswer`: 30 characters, autocorrect on.
- The legality line (§5.8).
- A tip: "Name something that sits right on the target. No numbers, no 'left' or 'right'."
- Sticky **Send clue**.

**Guesser, during `clue`**

- The two end labels and "Ana is thinking of a clue…" (`WaitingScreen`).

**Guesser, during `dial`**

- The clue (h1) at the top, with the end labels under it.
- `DialInput` (P00 §6):
  - full width, minus 16 px margins;
  - a 48 px thumb, and tapping the track jumps the thumb there;
  - − / + buttons (44×44) below each end;
  - on Android, a haptic tick every 10.
- The thumb starts in the middle, and doesn't count until the player moves it.
- In huddle: teammates' faces (24 px) ride above the track, and a bold line marks the team needle.
- Sticky **Lock in**. Moving the thumb after locking unlocks.

**Psychic, during `dial`**

- "Your clue: coffee", and the target (hold to see).
- In huddle, the team's live markers.
- A reminder: "Psychics stay silent!"

**Caller, during `call`**

- "Sun set their needle. Is the target LEFT or RIGHT of it?"
- A small bar showing the needle between the two labels.
- Two full-width 80 px buttons: "◀ LEFT · colder" and "RIGHT · hotter ▶". The words after the dot come from the end labels.

**After `reveal`**

- Guessers: "+4 · Bullseye! You were 2 away", "+2 · 14 away", or "0 · 23 away".
- The psychic: "Your guessers averaged 2.25 → +2".

### PhoneStage

`phoneStagePhases: ['reveal']`. PhoneStage shows the dial's zones, markers, needle and verdict. At `scores`, phones use the controller scorecard so the VIP can tap **Next round** and the others can see who advances the game.

**Small-phone check:** every phase fits 320×568. The dial phase uses about 330 px for the clue, labels, track and fine-adjust buttons, plus the pinned **Lock in**.

## 5.6 Hidden information

| Secret       | Who may see it                                                      | When it goes public |
| ------------ | ------------------------------------------------------------------- | ------------------- |
| The target   | the psychic's phone                                                 | `reveal`            |
| Solo dials   | the dialler's own phone                                             | `reveal`            |
| Huddle dials | the active side's phones, and the TV (that's the point of a huddle) | live                |
| Calls        | the caller's own phone                                              | `reveal`            |

- The psychic's target view is hold-to-see, and it is the only view that contains `target`.
- Solo mode never shows dials live, not even to the psychic.
- The clue becomes public the moment the psychic sends it.

## 5.7 Scoring

**Distance** = |dial − target|, on the 0–100 scale.

**Target size** is a setting:

| Size   | 4 points | 3 points | 2 points |
| ------ | -------- | -------- | -------- |
| narrow | ≤ 4      | ≤ 8      | ≤ 12     |
| normal | ≤ 5      | ≤ 10     | ≤ 15     |
| wide   | ≤ 6      | ≤ 12     | ≤ 20     |

Anything further away scores 0.

### Solo

- Each guesser scores their own dial.
- The psychic scores the guessers' average, rounded half up using integers only: `floor((2 × sum + n) / (2 × n))`, over the n guessers who dialled.
  - If nobody dialled, the psychic gets 0.
- **Perfect tune:** if at least 2 guessers dialled and every one of them scored 4, the psychic gets +2 more.

### Teams

- **Needle:** the average of the active team's dials (not counting the psychic), rounded half up. The team scores the needle's points.
- **Call:** the other team's majority of LEFT / RIGHT taps.
  - If the target is on that side of the needle, the calling team gets +1. This doesn't apply when the needle scored 4.
  - A tied call, or no taps at all, doesn't score.
- **Catch-up:** a team that scores 4 and is still behind after the scores are added plays again straight away, with its next psychic.
- **End of the game:**
  - The game ends when a team reaches `targetScore` at the end of a turn.
  - If both teams reach it on the same turn, the higher score wins. Equal scores share the win.
  - After `maxTurns` (catch-up turns count), the higher team wins. Equal scores share the win.
- **Results:** every player carries their team's score, so teams rank together. `winnerIds` = the winning team.

### Co-op

- The group needle (the average of every guesser's dial) scores into the group total.
- At the end, the group gets a rating, measured against the maximum possible score (rounds × 4):

| Share of maximum | Rating           |
| ---------------- | ---------------- |
| under 35%        | 📺 Static        |
| 35–54%           | 📻 Tuning in     |
| 55–74%           | 📡 Crystal clear |
| 75% or more      | 🧠 Mind meld     |

- Every player's result is the group total. The game's `Finale` board shows the rating.
- Crystal clear or better crowns everyone; below that, nobody is crowned.
- If the results screen can't handle an empty `winnerIds`, crown everyone, let the finale carry the verdict, and tell the owner.

### Awards

Awards are individual, in every mode. Skip an award if nobody earned it; ties share it.

| Award           | Rule                                                   |
| --------------- | ------------------------------------------------------ |
| 🎯 Sharpshooter | most dials in the 4 zone                               |
| 📡 Clear Signal | best psychic: highest average points earned as psychic |
| 🧭 Steady Hand  | lowest average distance, over 3 or more dials          |
| 📺 Static       | most dials that scored 0 (at least 2)                  |

## 5.8 Rules for clues

The server checks every clue, and the psychic's phone runs the same checks as they type. The psychic already knows the labels, so these messages leak nothing.

| Check                                                                                                   | Player sees                                 |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Empty after normalization                                                                               | "Type a clue."                              |
| Longer than 30 characters                                                                               | "Keep it under 30 characters."              |
| Contains a digit after normalization (so number words count too)                                        | "No numbers. Describe it instead."          |
| A word whose stem matches a word of either label (3+ letters, whole words only)                         | "Don't use the dial's own words."           |
| A position word: left, right, middle, center, centre, halfway, midpoint, percent, scale, spectrum, dial | "Describe a thing, not a spot on the dial." |

Matching whole words keeps clever compounds legal. On Cold ↔ Hot, "hotdog" is fine, but "very hot" is not.

## 5.9 Inputs

```ts
const TuneInput = z.discriminatedUnion('type', [
  z.object({ type: z.literal('clue'), text: z.string().min(1).max(60) }),
  z.object({ type: z.literal('dial'), pos: z.number().int().min(0).max(100) }),
  z.object({ type: z.literal('lock') }),
  z.object({ type: z.literal('call'), side: z.enum(['left', 'right']) }),
]);
```

**Ignored:**

- inputs in the wrong phase;
- inputs from spectators;
- a `clue` from anyone but the psychic;
- a `dial` or `lock` from the psychic, from the calling team, or (teams) from the team that isn't dialling;
- a `call` from anyone but the calling team.

**Rejected with copy:** clues that fail §5.8.

**Throttle.** This keeps the PC light (P00 §2.6).

- Solo mode: a phone sends `dial` only when the finger lifts. Dials are hidden, so live updates would change nothing on screen.
- Huddle: at most 3 `dial` inputs per second while dragging, plus one on release.
- A `dial` after `lock` clears the lock.

## 5.10 State and views

```ts
type TuneState = {
  phase: PhaseState;
  rng: RngState;
  cfg: ResolvedSettings;
  presence: Presence;
  seats: PlayerId[];
  left: PlayerId[];
  mode: 'solo' | 'teams' | 'coop';
  teams: { sun: PlayerId[]; moon: PlayerId[] } | null; // teamsFromSeed at init
  psychicBag: Record<'all' | 'sun' | 'moon', PlayerId[]>;
  spectra: SpectrumItem[]; // drawn at init
  turn: {
    n: number;
    psychic: PlayerId;
    team: 'sun' | 'moon' | null;
    catchUp: boolean;
    spectrum: SpectrumItem;
    target: number; // SECRET: psychic only until reveal
    clue: string | null;
    dials: Record<PlayerId, number>; // SECRET until reveal, except in huddle
    locked: PlayerId[];
    needle: number | null;
    calls: Record<PlayerId, 'left' | 'right'>;
    points: Record<PlayerId, number>;
    teamPoints: { sun: number; moon: number };
  };
  scores: Record<PlayerId, number>;
  team: { sun: number; moon: number };
  coopTotal: number;
  stats: Record<
    PlayerId,
    { bulls: number; dials: number; dist: number; zeros: number; psyTurns: number; psyPts: number }
  >;
  speechMs: Record<string, number>;
};
```

**Budget:** under 16 KB at 16 players. A test fails above 32 KB.

**`tvView`** contains:

- mode, round or turn, the psychic, and the team;
- the labels, and the clue once it's sent;
- chip statuses;
- huddle markers and the needle (huddle only);
- the needle during `call`;
- after `reveal`: the target, the zones, every dial, and the points;
- team totals, or the co-op meter.

**`controllerView(p)`** contains:

- the player's role: psychic, guesser, caller, or waiting;
- the labels and the clue;
- the target (psychic only);
- their own dial and lock;
- huddle markers (active side only);
- the call buttons (calling team, during `call`);
- their own result, after the TV's reveal.

## 5.11 Bot

A bot treats each spectrum's clue bank as general knowledge, the way a person knows coffee is hot. It never uses the secret target, which it isn't allowed to see.

| Role    | What the bot does                                                                                                                                                               |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Psychic | Picks one of the two bank clues nearest the target (using the rng), so it plays well but not perfectly                                                                          |
| Guesser | If the clue matches a bank clue (`sameAnswer`), it dials that clue's position plus rng noise of up to ±8. Otherwise it dials anywhere from 10 to 90 at random. Then it locks in |
| Caller  | Estimates where the clue sits, using the bank position if it knows the clue. If that's above the needle it calls RIGHT; below, LEFT. With no estimate, it calls at random       |

## 5.12 VIP moments

| Phase              | VIP control                                          |
| ------------------ | ---------------------------------------------------- |
| `intro`            | **Let's go**                                         |
| `clue`             | Skip ends the phase. With no clue, the round is void |
| `dial`             | Skip locks everyone's dials where they are           |
| `reveal`, `scores` | **Next round**, or **See results** at the end        |

## 5.13 Voice

The reader defaults to `sky`.

**Live readings**

- At `clue`:
  - "Ana is the psychic." when the name is readable; otherwise the fixed clip "New psychic.";
  - then the ends: "From cold, to hot.".
- At `dial`: the clue itself ("Coffee."). Request it the moment the psychic sends it.

**Fixed clips**

- "New psychic."
- "Tune in!"
- "Lock it in."
- "Left or right?"
- "Bullseye!"
- "Close!"
- "Missed it."
- "Perfect tune!"
- "Catch-up! Go again."
- The four ratings: "Static." · "Tuning in." · "Crystal clear!" · "Mind meld!"

**Prefetch:** during `scores`, the next round's ends line. Nothing Tune In reads aloud is secret, and the target is never spoken.

## 5.14 Settings

| Key           | Type    | Default  | Options                  | Notes                                                                               |
| ------------- | ------- | -------- | ------------------------ | ----------------------------------------------------------------------------------- |
| `mode`        | select  | `auto`   | auto, solo, teams, co-op | auto = co-op at 2 players, solo at 3+. Teams needs 4+ players; co-op allows up to 8 |
| `rounds`      | select  | `auto`   | auto, 3–12               | Solo and co-op only. auto = 8 at 2 players, one per player at 3–8, and 8 at 9–16    |
| `targetScore` | number  | 10       | 6–15                     | Teams only                                                                          |
| `maxTurns`    | number  | 12       | 6–12                     | Teams only; catch-up turns count                                                    |
| `clueSeconds` | number  | 45       | 20–75, step 5            |                                                                                     |
| `dialSeconds` | number  | 25       | 15–45, step 5            |                                                                                     |
| `callSeconds` | number  | 15       | 10–30                    | Teams only                                                                          |
| `targetSize`  | select  | `normal` | narrow, normal, wide     | See §5.7                                                                            |
| `huddle`      | boolean | true     |                          | Teams and co-op; forced off in `remote-text`                                        |
| `spicy`       | boolean | false    |                          | Adds the spicy pack                                                                 |
| `reader`      | select  | `sky`    | every voice, none        |                                                                                     |

**Time check.** The slowest legal games both fit inside the limit of 3 × 12 = 36 minutes:

- **Solo:** 12 rounds × (3 + 75 + 45 + 8 + 6) s ≈ 27 minutes.
- **Teams:** 12 turns × (3 + 75 + 45 + 30 + 8 + 6) s ≈ 33 minutes.

## 5.15 Presence

| Mode           | Behaviour                                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| `together`     | Huddle is available in teams and co-op. The psychic's hold-to-see matters                                  |
| `remote-voice` | Same as together; huddles happen on the call                                                               |
| `remote-text`  | Huddle is forced off. Each teammate dials alone, and the needle is their average, shown only at the reveal |
| phone-only     | `reveal` runs on `PhoneStage`; `scores` shows the controller scorecard and VIP Next action                 |

Solo mode plays the same in every presence mode.

## 5.16 Content

**Files:** `content/family.json`, `content/spicy.json`, `content/pronunciations.json`.

```json
{
  "id": "tn-temp-001",
  "left": "Cold",
  "right": "Hot",
  "clues": [
    { "text": "ice cube", "pos": 3 },
    { "text": "snowman", "pos": 6 },
    { "text": "fridge", "pos": 14 },
    { "text": "autumn breeze", "pos": 30 },
    { "text": "tap water", "pos": 38 },
    { "text": "room temperature", "pos": 50 },
    { "text": "bath", "pos": 66 },
    { "text": "summer day", "pos": 72 },
    { "text": "coffee", "pos": 80 },
    { "text": "sauna", "pos": 86 },
    { "text": "oven", "pos": 92 },
    { "text": "lava", "pos": 97 }
  ]
}
```

**Spectra**

- Two clear opposites, each label at most 18 characters, capitalised.
- Three kinds:

| Kind           | Examples                                                                        |
| -------------- | ------------------------------------------------------------------------------- |
| Measurable-ish | Cold ↔ Hot, Cheap ↔ Expensive, Tiny ↔ Huge                                      |
| Opinion        | Underrated ↔ Overrated, Boring ↔ Exciting, Useless ↔ Useful superpower          |
| Playful        | Normal pet ↔ Weird pet, Smells bad ↔ Smells good, Easy to spell ↔ Hard to spell |

**Bank clues**

- 12 per spectrum.
- Spread them so every fifth of the dial (0–20, 20–40, and so on) has at least two.
- `pos` is the writer's best guess of where most people would put the clue.
- Every bank clue must pass the §5.8 checks against its own spectrum. The pack test checks this.

**Pack sizes**

- Family pack: 150 spectra.
- Spicy pack: 50 spectra, adult but not explicit (Bad date ↔ Great date, Innocent ↔ Scandalous, Tame ↔ Wild night out).

**Speech lab:** run every label pair through it in the form "From X, to Y."

**Void rounds.** If the psychic sends no clue before the deadline:

1. The TV shows "No signal!" and nobody scores.
2. The next round begins.
3. In solo and co-op, that psychic isn't drawn again until everyone else has had a turn. In teams, the turn passes to the other team.

## 5.17 Edge cases

| Situation                                   | What happens                                                                 |
| ------------------------------------------- | ---------------------------------------------------------------------------- |
| The psychic drops or leaves before the clue | Void round (§5.16). A player who left is removed from future psychic draws   |
| No guesser dials                            | Nobody scores; the psychic gets 0                                            |
| Teams: nobody on the active team dials      | There's no needle, so the team gets 0 and `call` is skipped                  |
| Teams: uneven sizes                         | Allowed; the needle is still an average                                      |
| Teams: a team loses every connected member  | Its turns are void until someone is back; the game still ends at `maxTurns`  |
| Target near an edge                         | The zones are clipped at 0 and 100                                           |
| 2 players in solo                           | Not offered. `auto` gives co-op, and choosing solo manually needs 3+ players |
| Late joiner                                 | Spectator. In teams, they aren't added to a team until the next game         |
| Everyone idle                               | Psychics send nothing, so every round is void and the game ends quickly      |
| Pause during `dial`                         | The helper stops the clock; phones keep their thumb positions                |

## 5.18 Tests to add

**Scoring**

- Band edges for each target size: exactly 5, 10 and 15 away, and one either side.
- The psychic's integer rounding.
- Perfect tune.
- Teams' call rules, including no call on a bullseye and tied calls.
- Catch-up turns.
- Both teams reaching the target on the same turn.
- Co-op rating thresholds.

**Leaks**

- `target` appears only in the psychic's view before `reveal`.
- Solo dials never appear in another view before `reveal`.
- Huddle markers appear only on the active side's phones and the TV, and never in `remote-text`.

**Clue rules:** digits, number words, label words and position words are rejected; a legal compound like "hotdog" is accepted.

**Throttle:** a simulated drag produces at most 3 `dial` inputs per second in huddle, and one per release in solo.

**Bots**

- A psychic bot picks a clue near the target.
- A guesser bot recognises bank clues.

## 5.19 Recap

"Tune In · <date>" contains:

- for each round: the ends, the psychic, the clue, the target, every dial (or the needle and the call), and the points;
- the team totals, or the co-op rating;
- awards.
