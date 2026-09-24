# PartyBox Game Pack · Part 06 — Nightfall

*Batch 7 of 7 · read Part 00 first · game 10, the last game of the pack.*

Nightfall is the classic hidden-roles game (Werewolf, Mafia), built for PartyBox. It has:
- secret roles on phones;
- silent night actions;
- a day of arguing, then a vote.

**Presence.** The game needs talking, so its presence is `voice-if-remote` (P00 §3.5). Remote rooms without a call get a typed "town board" instead.

**Build it last.** It reuses the hidden-role plumbing that Imposter proves first (P01), and it's the second-largest game in the pack.

**How it differs from Imposter**

| | Imposter | Nightfall |
|---|---|---|
| Length | one quick bluff per round | a whole evening in one game |
| Roles | one hidden odd-one-out | several secret roles |
| Elimination | nobody is eliminated | people are eliminated night and day; the dead watch as ghosts |
| Talking | works fully typed | the argument is the game |

---

# Game 10 · Nightfall 🌙

## 10.1 Pitch

| | |
|---|---|
| Name · tagline | **Nightfall** · "By night the wolves hunt. By day, the village votes." |
| id · icon | `nightfall` · 🌙 |
| Players · length | 6–16 · about 20 min · `estimatedMinutes: 20` |
| Tags | `hidden-roles`, `bluff` |
| Bots | Allowed, to fill seats. They act at night and vote by day, and in remote-text rooms they post canned lines. They can't argue, so the game is best with 6+ humans. |
| Presence | `voice-if-remote` |
| Hook | "Dawn breaks… and Maya did not survive the night." Maya's card flips: SEER. The room groans; the wolves keep a straight face. |

**`howToPlay`**
1. Secret roles: a few wolves hide among the villagers. Only the wolves know each other.
2. At night everyone picks someone on their phone: wolves pick a victim; the seer and doctor use their powers.
3. By day, argue and vote someone out. Village wins when wolves are gone; wolves when they equal the village.

## 10.2 In plain words

Eight players. Secretly, the roles are:
- 2 wolves: Ben and Cy;
- a seer: Maya;
- a doctor: Eli;
- 4 villagers.

**1. Roles.** Everyone holds their phone to see their role.
- Ben's phone says "🐺 You're a WOLF. Your pack: Cy."
- Maya's phone says "🔮 You're the SEER."

**2. Night 1.** The TV goes dark: "Night falls. Everyone, look at your phone." *Everyone* picks a face, so nobody can tell who's doing what:
- the wolves pick tonight's victim, and can see each other's picks;
- the seer picks someone to check;
- the doctor picks someone to protect;
- villagers pick who they suspect. This is a "hunch", and the anonymous tally is shown at dawn.

**3. Dawn.**
- The TV announces: "Dawn breaks… Dee did not survive the night. Dee was a villager."
- If the doctor had protected Dee, it would say "Everyone survived the night!" instead.
- Maya's phone privately shows: "🔮 Ben is a WOLF."

**4. Day.** Two and a half minutes of arguing. Maya has a choice:
- claim she's the seer and name Ben, which makes her the wolves' next target; or
- just drop hints.

**5. Vote.**
- Everyone alive taps who to vote out, or "No one".
- The votes fly onto faces on the TV.
- Ben has the most votes: "Ben was… a WOLF!"

**6. The next night**, and so on. The game ends when the village has found every wolf, or when the wolves equal the rest.

**Ghosts.** Dead players become ghosts. They keep watching, but they don't act, vote or talk.

## 10.3 Roles

| Role | Team | Night action | Notes |
|---|---|---|---|
| 🐺 Wolf | Wolves | Pick a victim together | Knows the other wolves and sees their picks |
| 🔮 Seer | Village | Check one player: wolf or not | The answer is private, on the seer's phone |
| 🩺 Doctor | Village | Protect one player from the wolves | May protect themself, but never the same player two nights running |
| 🧑‍🌾 Villager | Village | A hunch: who do you suspect? | Hunches are tallied anonymously at dawn (a setting) |
| 🏹 Hunter (optional) | Village | A hunch, like villagers | When the hunter dies, they take one living player down with them |
| 🃏 Jester (optional) | Alone | A hunch | Wins alone if the village votes them out. A night kill just kills them |

**How many wolves** (with `wolves: auto`):

| Players | Wolves |
|---|---|
| 6–8 | 2 |
| 9–11 | 3 |
| 12–16 | 4 |

**Other roles**
- Seer and doctor are on by default.
- Hunter and jester are off by default. When switched on, each takes a villager's seat.

**What's public**
- The role list for the game is public, and the TV shows it at the start ("2 Wolves · Seer · Doctor · 4 Villagers").
- Who has which role is secret.

**Flavour** (a setting). The same game, reskinned: only names, icons, descriptions and narrator lines change (§10.18).

| Role | `village` flavour (default) | `mafia` flavour |
|---|---|---|
| Wolf | Wolf 🐺 | Mafia 🕴️ |
| Seer | Seer 🔮 | Detective 🕵️ |
| Doctor | Doctor 🩺 | Doctor 🩺 |
| Villager | Villager 🧑‍🌾 | Townsperson 🏙️ |
| Hunter | Hunter 🏹 | Vigilante 🎯 |
| Jester | Jester 🃏 | Jester 🃏 |

## 10.4 Phases

**Order:**

1. `roles`
2. `night`
3. `dawn`, then `hunter` if the hunter died in the night
4. `day`
5. `vote`, then `runoff` if the vote is tied
6. `verdict`, then `lastWords` (remote-text rooms only) and `hunter` if the hunter was voted out
7. back to `night` (step 2), until someone wins
8. `end`, then `done`

A win check runs after every death (§10.8) and can jump straight to `end`.

| Phase | TV shows | Phone shows | Inputs | Ends when | Sound · bed |
|---|---|---|---|---|---|
| `roles` | The public role list; "Check your role. Keep it secret."; chips ✓ | `SecretCard` with the role and what it does; wolves also see their pack; **Got it** | `ready` | everyone connected ready, or 20 s | `card` · `latenight` |
| `night` | Dark stage, moon, "Night 2. Everyone, look at your phone."; chips ✓ for the living (everyone acts) | The same "Choose someone" grid for every role; the role's meaning and the pack's picks under hold-to-see | `night` | every living connected player has picked, 45 s, or VIP | `phase` (quiet) · `latenight` |
| `dawn` | Sunrise; the news (who died and their role, or "Everyone survived!"); the hunch tally (if on) | Ghost / alive status; a hold-to-see night report (identical strip for every role); own role reminder | — | paced, about 8 s | `reveal`, then `bust` for a death or `cheer` for a quiet night |
| `hunter` | "The hunter takes aim…" | Hunter: a grid of living players. Everyone else: waiting | `shoot` | a shot, 20 s (no shot = nobody), or VIP | `wager` · `pulse` |
| `day` | "Day 2. Who's a wolf?"; the living, the graveyard with revealed roles, the timer, the hunch tally; the town board feed when on | Discuss; own role (hold to see); **Ready to vote ✋**; town board posting when on | `ready`, `post` | a majority of the living tap Ready, 150 s, or VIP | `start` · `lofi` |
| `vote` | "Vote now"; chips ✓ for the living | `FacePicker` of the living (not self), plus **No one** | `vote` (resend to change) | every living connected player voted, 30 s, or VIP | `phase` · `pulse` |
| `runoff` | "Tie! Ben or Ana?" | A picker limited to the tied players, plus No one | `vote` | all voted, 20 s, or VIP | `phase` · `pulse` |
| `verdict` | Voters' faces land on their targets; counts; the spotlight; the eliminated player's card flips (if roles are revealed); or "The village couldn't agree." | Stage, then own status | — | paced, about 8 s | `tally`, `reveal`, then `bust` or `cheer` depending on the role |
| `lastWords` | "Ben's last words…", then the line (remote-text rooms only) | The eliminated player: a text box. Others: waiting | `lastWords` | sent, 20 s, or VIP | — |
| `end` | Every role card flips; "🐺 The wolves win!" / "🏡 The village wins!" / "🃏 The jester wins!" and why | Own team's result | — | 12 s, or VIP | `fanfare`, `win` |

**Client hooks**
- `stripHidden` during `night`: the dark stage is the mood.
- `stripActive`:
  - the eliminated player, during `verdict`;
  - the hunter, during `hunter`.
- `quickInto: ['dawn', 'verdict', 'end']`
- Timer: `quiet` in `night`; normal in `day` and `vote`.
- `Finale`: the end board, showing every role (§10.9).

## 10.5 Night rules

**Everyone living acts,** so nobody can be spotted by what they're doing (§10.10). Picks can change until the phase ends.

**What each role picks**

| Role | Picks | Notes |
|---|---|---|
| Wolf | a non-wolf | Wolves see each other's picks live. The pack's target is the player most wolves picked; a tie is broken by the rng; no picks at all means no kill |
| Seer | anyone living except themself | The result ("wolf" or "not a wolf") appears privately at `dawn`. The jester and hunter show as "not a wolf" |
| Doctor | anyone living, themself included | Never the player they protected the night before |
| Villager, hunter, jester | anyone living except themself | This is a hunch |

**Resolution**, at the end of `night`, in this order:
1. The doctor's protection applies.
2. The wolves' target dies, unless protected.
3. The seer's result is stored.
4. Deaths are applied. If the hunter died, `hunter` runs after `dawn`.
5. The win check runs.

**Dawn tells only deaths.**
- It never says who was protected, who was attacked and saved, or whom the seer checked.
- A save reads "Everyone survived the night!"

**Hunches** (setting `hunches`)
- The anonymous tally of villager-side hunches is shown at `dawn` and through `day`, as small bars by faces ("🤔 Ben 3 · Ana 1").
- Hunches are just a nudge, never binding.
- With `revealRoles` off, the tally shows names in order without numbers. Otherwise the total could reveal what kind of role a dead player had.

## 10.6 Day and vote rules

**Discussion** (`day`)
- Players talk, or post on the town board (§10.17).
- Anyone living can tap **Ready to vote ✋**. When more than half of the living have tapped it, the day ends early.
- The VIP can start the vote at any time.

**The vote**
- Each living player picks one other living player, or **No one**.
- Votes stay secret until `verdict`, then are shown face by face.

**The result**
- The player with the most votes is eliminated, if they have more votes than **No one** and more than any other player.
- If players tie for the most votes, there's one `runoff` among them (plus No one). If it's still tied, nobody is eliminated.
- If **No one** is ahead of the top player, or level with them, nobody is eliminated.

**Reveal**
- With `revealRoles` on (the default), the eliminated player's role is shown.
- With it off, the graveyard shows "?" until `end`.

**Last words** (remote-text rooms only). The eliminated player can type one line (80 characters) for the TV. In rooms that talk, they just speak.

## 10.7 Hunter and jester

**Hunter** (optional)
1. Whenever the hunter dies, at night or by vote, `hunter` runs next.
2. The hunter's phone shows the living. The chosen player dies too, and their role is revealed like any other death.
3. If the hunter doesn't shoot within 20 s, nobody dies.
4. Then the win check runs.

**Jester** (optional)
- If the village votes the jester out, the game ends at once: "🃏 The jester fooled you all!" The jester alone wins.
- If the wolves kill the jester at night, the jester simply dies.
- For the wolves' "equal the village" check, the jester counts as a non-wolf.

## 10.8 Winning, scoring and awards

**The win check** runs after every death and every departure, in this order:
1. The jester was just voted out: **the jester wins**.
2. No wolves are alive: **the village wins**.
3. Living wolves ≥ living non-wolves: **the wolves win**.
4. Nobody has won after the vote on day `maxDays`: **the wolves win**, because they survived the village.

**Results**
- Every member of the winning side scores 1, dead or alive. Everyone else scores 0.
- If the jester wins, the jester alone scores 1.
- Ranking follows the score. `winnerIds` = the winning side.

**Awards.** Skip an award if nobody earned it; ties share it.

| Award | Rule |
|---|---|
| 🔮 Sharp Eyes | the seer, if they found at least one wolf |
| 🩺 Life Saver | the doctor, for at least one save |
| 🗳️ Wolf Hunter | the village-side player whose day votes hit wolves most often (at least 2) |
| 🎭 Best Liar | the wolf who drew the fewest day votes while alive for 2+ days |
| 👻 First to Fall | the first player to die (a consolation prize) |

## 10.9 Screens

### TV (1920×1080)

**The village**
- The living players appear as a ring of faces with names, or as 2–3 rows when there are more than 10.
- The dead sit in a graveyard row at the bottom, with their revealed role icon or "?".
- Colour is never the only signal: the dead are desaturated *and* carry a 🪦 badge.

**Night**
- The stage switches to the theme's darkest surface, with a slowly moving moon (transform only).
- "Night 2" in h1, and "Everyone, look at your phone and keep it close."
- Living faces show ✓ as picks come in. Nothing else is shown.

**Dawn**
- A sunrise gradient built from tokens.
- The news in h1, for example "Dee did not survive the night". Then the victim's card flips to show the role (if roles are revealed).
- If nobody died: "Everyone survived the night!" with a sun.
- The hunch tally appears as small bars by faces (if on).

**Day**
- "Day 2 · Who's a wolf?" in h2, with the timer.
- The village, the graveyard, and the hunch bars.
- A **Ready** count: "5 of 7 ready to vote".
- With the town board on, a feed fills the right third of the stage:
  - each post shows the author's face and name;
  - newest at the bottom, 36 px text;
  - the last 8 posts are visible.

**Verdict.** Works like Imposter's accusation (P01 §1.4):
1. Voters' faces land on their targets, and the counts appear.
2. The spotlight moves to the eliminated player.
3. Their role card flips.

When nobody is eliminated, the TV says why: "It's a tie" or "No one had the most votes".

**End** (and `Finale`)
- Every card flips in a ripple to show every role.
- The winning side's banner.
- A short timeline strip: "Night 1: Dee · Day 1: Ben 🐺 · Night 2: saved · Day 2: Cy 🐺".

### Phone (320×568)

**Roles**
- A full-width `SecretCard` ("Hold to see your role").
- The face shows:
  - the role icon and name (h1);
  - a one-line description ("Each night, check one player: wolf or not");
  - for wolves, "Your pack: Cy 🐺".
- **Got it**.

**Night.** Every living role sees the same screen:
- Header: "🌙 Night 2 · Choose someone".
- A mini `SecretCard` strip: "Hold: your night job". Holding it reveals one of:
  - "Choose tonight's victim" (wolves also see "Pack picks: Cy → Ana");
  - "Choose someone to check";
  - "Choose someone to protect";
  - "Who do you suspect?".
- A `FacePicker` of **every living player, self included, all enabled**, identical for all roles.
- Tapping an invalid choice shows a private message, and the pick doesn't count:
  - a wolf picking a packmate: "That's your packmate!";
  - the seer or a villager-side player picking themself: "Pick someone else.";
  - the doctor repeating last night's player: "You protected them last night."
- Once picked: "Chosen: Ana · tap another to change". This line is the same for every role.

**Dawn**
- A hold-to-see strip, "Hold: your night report", on **every** living phone, so the seer's phone doesn't stand out. What it reveals depends on the role:
  - seer: "🔮 Ben is a WOLF" or "🔮 Ana is not a wolf";
  - doctor: "You protected Ana";
  - wolves: "The pack chose Dee";
  - villager side: "Your hunch: Ben".
- Alive: "You survived the night 🌅".
- Dead: "👻 You didn't survive the night. You were the doctor."

**Day**
- Own role reminder (hold to see).
- "Discuss! Who's a wolf?"
- The living players, with hunch bars.
- **Ready to vote ✋** (a toggle).
- With the town board on:
  - a feed of the last 20 posts, scrolling;
  - an 80-character box with **Post**;
  - 3 posts per day, with a counter showing how many are left.

**Vote**
- A `FacePicker` of the living (not self), plus a **No one** tile.
- Sticky **Vote**. The vote can be changed until the phase ends.

**Hunter**
- The hunter: "You're taking someone with you. Choose.", with a picker of the living.
- Everyone else: waiting.

**Ghost** (any phase after death)
- "👻 You're a ghost. Watch, but stay silent."
- A TV-style view of the game.
- With `ghostsSeeAll` on, every role is shown under hold-to-see.

**End.** The player's own side's result: "🏡 The village wins! You were a villager."

### PhoneStage

`phoneStagePhases: ['dawn', 'verdict', 'end']`.

No other phase needs a stage. `roles`, `night`, `day` and `vote` are already fully on the phone, and the day screen carries the village, the graveyard and the board.

### Small-phone check

- **Night and vote:** with 15 faces, the grids use 3 columns (5 rows of about 88 px). They fit 320×568 together with the header and the hold strip.
- **Day with the town board on:** the feed scrolls inside `Screen`, while the Post box and Ready stay pinned.

## 10.10 Hidden information

| Secret | Who may see it | When it goes public |
|---|---|---|
| Each role | the player's own phone; wolves see the whole pack; ghosts see all with `ghostsSeeAll` | on death (with `revealRoles`); all at `end` |
| Night picks | the picker's own phone; wolves see the pack's picks | never during play (all in the recap) |
| Who was attacked, who was protected | nobody | never during play ("Everyone survived" hides both) |
| Night reports (the seer's results, the doctor's and the pack's choices) | the player's own phone | never (the seer may claim results out loud) |
| Hunches | the player's own phone | only as an anonymous tally at `dawn` |
| Day votes | the voter's own phone | `verdict`, face by face |

**Leak rules for Nightfall**

- **One night screen for all.** These are identical for every role:
  - the header, the grid (every living player, all enabled) and the button positions;
  - the timing and the haptics;
  - the dawn report strip.

  The role's meaning and the pack's picks live only under hold-to-see. Invalid picks are refused privately.
- **Chips at night.** Every living player gets ✓ when they pick, whatever their role. "All done" counts every living connected player.
- **Dawn reveals deaths only** (see the table above).
- **The TV never shows a living player's role.** Spectators get exactly the TV view.
- **Speech.** Request a line that contains a role ("Ben was a wolf") or a night result ("Dee did not survive") only at the moment it's revealed. Never prefetch anything about the night.
- **Ghosts** can leak by talking. That's a house rule, and the narrator repeats it ("Ghosts, stay silent"). It's also why `ghostsSeeAll` is off by default.
- **Bots** decide only from their own `controllerView` (P00 §7 rule 9). A wolf bot knows its pack; a villager bot knows nothing.

## 10.11 Inputs

```ts
const NightfallInput = z.discriminatedUnion('type', [
  z.object({ type: z.literal('ready') }),                                   // roles: got it · day: ready to vote (toggle)
  z.object({ type: z.literal('night'), target: z.string().max(64) }),
  z.object({ type: z.literal('post'), text: z.string().min(1).max(160) }),
  z.object({ type: z.literal('vote'), target: z.string().max(64) }),        // a player id, or 'none'
  z.object({ type: z.literal('shoot'), target: z.string().max(64) }),       // hunter only
  z.object({ type: z.literal('lastWords'), text: z.string().min(1).max(160) }),
]);
```

**Ignored:**
- inputs in the wrong phase;
- inputs from spectators;
- inputs from ghosts (dead players can't act);
- a `vote` for self, a dead player, or an unknown id;
- `shoot` from anyone but the dying hunter;
- `lastWords` from anyone but the eliminated player, or outside remote-text;
- `post` when the town board is off.

**Rejected with a private message.** The phone shows the message; nothing else changes.
- Invalid night picks (§10.9).
- A fourth post in one day: "That's your 3 posts for today".
- Posts and last words that normalize to nothing.

The server keeps only the first 80 characters of posts and last words.

## 10.12 State and views

```ts
type Role = 'wolf' | 'seer' | 'doctor' | 'villager' | 'hunter' | 'jester';
type NightfallState = {
  phase: PhaseState; rng: RngState; cfg: ResolvedSettings; presence: Presence;
  seats: PlayerId[]; left: PlayerId[];
  roles: Record<PlayerId, Role>;                 // SECRET (own phone; the pack; ghosts with ghostsSeeAll)
  alive: PlayerId[];
  dead: { id: PlayerId; day: number; how: 'night' | 'vote' | 'hunter' | 'left'; shown: boolean }[];
  day: number;
  ready: PlayerId[];
  night: {
    picks: Record<PlayerId, PlayerId>;           // SECRET
    lastProtected: PlayerId | null;              // doctor's previous night
    victim: PlayerId | null; saved: boolean;     // SECRET until dawn (saved: never shown)
    hunches: Record<PlayerId, PlayerId>;         // SECRET; tally is public at dawn
  };
  seerLog: { night: number; target: PlayerId; wolf: boolean }[];   // SECRET: seer only
  board: { day: number; by: PlayerId; text: string }[];
  votes: Record<PlayerId, PlayerId | 'none'>;    // SECRET until verdict
  runoff: { candidates: PlayerId[]; votes: Record<PlayerId, PlayerId | 'none'> } | null;
  eliminated: PlayerId | null;
  lastWords: string | null;
  hunterPending: PlayerId | null;
  winner: 'wolves' | 'village' | 'jester' | null;
  reason: string | null;
  log: { day: number; night: { victim: PlayerId | null; saved: boolean }; vote: { out: PlayerId | null; tally: Record<string, number> } }[];
  stats: Record<PlayerId, { votesOnWolves: number; votesReceived: number; saves: number; wolvesFound: number }>;
  speechMs: Record<string, number>;
};
```

**Budget:** under 40 KB at 16 players with the town board on; the board is the bulk. A test fails above 80 KB.

**`tvView`**
- Phase, day, and the public role list.
- The living, and the graveyard (roles only where they've been shown).
- Chip statuses and the ready count.
- The dawn news and the hunch tally.
- The town board, when on.
- The vote reveal, the verdict, and the hunter's shot.
- At `end`: every role, the winner, the reason, and the timeline.

**`controllerView(p)`**
- Whether the player is alive or a ghost.
- Their own role and its description.
- Role extras:
  - wolves: the pack, and the pack's picks tonight;
  - seer: their own results;
  - doctor: last night's protected player.
- Their own night pick, hunch, ready state and vote.
- The town board, and how many posts they have left.
- The hunter and last-words inputs, when they apply.
- Their own side's result, at `end`.

Ghosts with `ghostsSeeAll` also get every role. Spectators get exactly the TV view.

## 10.13 Bot

Every bot decides from its own view and its role's knowledge, and nothing else.

**Night**
- **Wolf:** follows a human packmate's pick if there is one. Otherwise, 50% of the time it targets someone who voted for a wolf yesterday; else a random non-wolf.
- **Seer:** checks a random living player it hasn't checked yet.
- **Doctor:** protects a random living player (itself 30% of the time), never last night's choice.
- **Villager, hunter, jester:** a random hunch.

**Day, with the town board on**
- **Wolf:** posts an accusation at a random non-wolf.
- **Seer:** once it has found a wolf, it has a 50% chance to post "I'm the seer. {name} is a wolf!". Otherwise it posts a generic line.
- **Doctor:** posts a generic line.
- **Villager, hunter, jester:** posts an accusation at whoever tops the hunch tally, or a defence if it was accused.
- **Everyone:** taps Ready 20–60 s into the day.

**Vote**
- **Wolf:** votes for whoever claimed to be the seer, if anyone did. Otherwise, the most-accused non-wolf.
- **Seer:** votes for a wolf it found; otherwise votes like a villager.
- **Doctor:** votes like a villager.
- **Villager, hunter, jester:** votes for the most-accused player, judged from the board and the hunches. 10% of the time, votes No one.

**Other moments**
- **Hunter phase:** the hunter bot shoots a player someone claimed as a wolf; otherwise a random living player.
- **Last words:** every bot posts a canned line.

**Lines and personality**
- Lines come from `botlines.json`, with `{name}` filled in (§10.18).
- A jester bot tries to look suspicious: it accuses at random and defends badly.

**Bots follow humans** among the wolves, as in Spy Grid (P05 §9.7). When a human packmate is connected, a wolf bot never picks before that human has.

## 10.14 VIP moments

| Phase | VIP control |
|---|---|
| `roles` | Skip: start the night |
| `night` | Skip: end the night; roles that haven't picked simply don't act |
| `hunter` | Skip: no shot |
| `day` | **Start the vote** |
| `vote`, `runoff` | Skip: close voting |
| `dawn`, `verdict` | Skip: move on |
| `end` | **See results** |

The VIP may be a ghost. Their controls still work, because they're room controls, not game actions.

## 10.15 Voice

The reader defaults to `fable`, as the narrator. Each flavour has its own clip set (§10.18).

**Fixed clips** (village flavour)
- **Night and dawn:** "Night falls. Everyone, look at your phone." · "The village sleeps." · "Dawn breaks." · "Everyone survived the night!"
- **Day and vote:** "Discuss. Who's a wolf?" · "Time to vote." · "The votes are in." · "It's a tie. Vote again." · "The village couldn't agree."
- **Special moments:** "The hunter takes aim…" · "Ghosts, stay silent."
- **Endings:** "The wolves win." · "The village wins!" · "The jester fooled you all!"
- **Role reveals, for names that can't be read aloud:** "A wolf!" · "The seer." · "The doctor." · "A villager." · "The hunter." · "The jester!"

**Live readings**
- At `dawn`: "Dee did not survive the night."
- At a reveal: "Ben was a wolf."
- In remote-text rooms: "Ben's last words."

Request each live line only at the moment it's revealed (§10.10). Names follow P00 §5.5. If a name can't be read aloud, the narrator uses the role clip while the TV shows the name.

**Town board posts are not read aloud.** There are too many, and reading everyone's suspicions in one voice flattens them. The TV shows them instead.

**Beds**
- `roles` and `night`: `latenight`.
- `dawn` and `verdict` reveals: silence.
- Day: `lofi`.
- Votes: `pulse`.

## 10.16 Settings

| Key | Type | Default | Options | Notes |
|---|---|---|---|---|
| `flavour` | select | `village` | village, mafia | Changes names, icons and the narrator only |
| `wolves` | select | `auto` | auto, 1, 2, 3, 4 | auto follows §10.3; never more than a third of the players |
| `seer` | boolean | true | | |
| `doctor` | boolean | true | | |
| `hunter` | boolean | false | | Takes a villager seat |
| `jester` | boolean | false | | Takes a villager seat; needs 7+ players |
| `revealRoles` | boolean | true | | Show a player's role when they die |
| `ghostsSeeAll` | boolean | false | | Ghosts see every role |
| `hunches` | boolean | true | | Villager-side night hunches, and the dawn tally |
| `townBoard` | select | `auto` | auto, on, off | auto = on only in `remote-text` |
| `nightSeconds` | number | 45 | 30–60, step 5 | |
| `daySeconds` | number | 150 | 60–240, step 15 | |
| `voteSeconds` | number | 30 | 20–45, step 5 | |
| `maxDays` | number | 6 | 4–8 | The wolves win if they survive the last day |
| `reader` | select | `fable` | every voice, none | |

**Time check**
- **Slowest legal game:** about 57 minutes, inside the limit of 3 × 20. That's 8 days of up to 425 s each:

  | Step | Seconds |
  |---|---|
  | night | 60 |
  | dawn | 10 |
  | day | 240 |
  | vote | 45 |
  | runoff | 20 |
  | verdict | 10 |
  | last words | 20 |
  | hunter | 20 |

- **Typical game:** 4–5 cycles, about 16–20 minutes.
- **Idle game** (no kills, no votes): runs to `maxDays`, about 30 minutes.

## 10.17 Presence

| Mode | Behaviour |
|---|---|
| `together` | The day is spoken. At night the TV reminds everyone to keep their phones close; the identical night screen and hold-to-see do the rest |
| `remote-voice` | The day happens on the call. Ghosts should mute, and the narrator says so at the first death |
| `remote-text` | The lobby shows the "needs a voice call" notice first (P00 §3.5). If the room plays anyway: the town board is on, with 3 posts per player per day; last words are typed; bots post canned lines |
| phone-only | `dawn`, `verdict` and `end` run on `PhoneStage`; everything else is already on the phones |

## 10.18 Content

**Files:** `content/flavours.json`, `content/botlines.json`, `content/pronunciations.json`.

### Flavours

```json
{
  "village": {
    "roles": {
      "wolf":     { "name": "Wolf",     "icon": "🐺", "desc": "Each night, choose a victim with your pack." },
      "seer":     { "name": "Seer",     "icon": "🔮", "desc": "Each night, check one player: wolf or not." },
      "doctor":   { "name": "Doctor",   "icon": "🩺", "desc": "Each night, protect one player from the wolves." },
      "villager": { "name": "Villager", "icon": "🧑‍🌾", "desc": "Find the wolves and vote them out." },
      "hunter":   { "name": "Hunter",   "icon": "🏹", "desc": "When you die, take someone with you." },
      "jester":   { "name": "Jester",   "icon": "🃏", "desc": "Get the village to vote you out, and you win." }
    },
    "sides": { "wolves": "The wolves", "village": "The village" },
    "narrator": { "nightFalls": "Night falls. Everyone, look at your phone.", "dawn": "Dawn breaks." }
  },
  "mafia": {
    "roles": {
      "wolf": { "name": "Mafia", "icon": "🕴️", "desc": "Each night, choose a target with your family." }
    }
  }
}
```

The example is shortened. In the real file, each flavour has every role, both sides, and every narrator line from §10.15. The `mafia` flavour renames:

| Village flavour | Mafia flavour |
|---|---|
| Seer | Detective 🕵️ |
| Villager | Townsperson 🏙️ |
| Hunter | Vigilante 🎯 |
| the village | the town |

### Bot lines

`botlines.json` holds:
- 40 accusations ("I don't trust {name}.", "{name} has been very quiet…");
- 20 defences ("I'm just a villager, I swear!");
- 10 seer claims;
- 10 last words.

All lines are family-friendly, fit either flavour, and are at most 80 characters.

### Spanish

- Every role name, description, side name and narrator line, in both flavours, goes in the game's Spanish table (brief rule 11).
- The narrator clips stay in English, because the voices are English, as in the other games.

### Speech lab

Run every narrator line, in both flavours, and every role name through the speech lab.

## 10.19 Edge cases

| Situation | What happens |
|---|---|
| A living player drops | They simply don't act while gone; they can still be voted for |
| A player leaves the game | They die at the next `dawn` or `verdict` announcement ("Ben packed up and left the village"). Their role is revealed if `revealRoles` is on; then the win check runs |
| Every wolf leaves | The village wins at the next check |
| Wolves split their picks evenly | The rng picks among the tied targets |
| No wolf picks at all | A quiet night: nobody dies |
| The seer dies on the night they check | Their result still appears, on their ghost screen |
| The hunter dies at night | `hunter` runs right after `dawn`'s news |
| The hunter drops before shooting | After 20 s, no shot |
| The jester is voted out | The jester wins, and the game ends |
| A tie for the most votes | One runoff. If it's still tied, nobody is voted out |
| "No one" leads the vote | Nobody is voted out |
| `maxDays` is reached | The wolves win |
| 6 players, some of them bots | Works; wolf bots follow their human packmates |
| Late joiner | Spectator: the TV view only |
| Everyone idle | No kills and no eliminations; `maxDays` ends the game, and the wolves win |
| Pause | The helper stops both the night and day clocks |

## 10.20 Tests to add

**Dealing**
- Role counts for each player count and each option.
- Wolves see their pack.
- The jester needs 7+ players.

**Night**
- Protection and saves.
- The doctor's no-repeat rule.
- Seer results, including the hunter and jester reading "not a wolf".
- Tied wolf picks, and no wolf picks.
- The resolution order.

**Day**
- Plurality, No one, runoffs and ties.
- A Ready majority ends the day early.
- The 3-post limit.

**Special roles and winning**
- Hunter shots, both at night and after a vote.
- A jester win.
- Win checks after every death and departure, including the wolves-equal-village check.
- `maxDays`.

**Leaks**
- No living player's role appears in the TV view, or in another phone's view (except the pack, for wolves).
- Night screens and dawn report strips are identical across roles (snapshot, excluding the hold-to-see areas).
- Night chips are identical across roles.
- Night reports stay private.
- Spectators get only the TV view.
- No speech key containing a role or a death is requested before its reveal.

**Flavours:** both are complete, in English and Spanish.

**Bots**
- Wolf bots follow human packmates.
- No bot acts on information outside its own view.

## 10.21 Recap

"Nightfall · <date>" contains:
- the role list, and who had which role;
- night by night: every night action (wolf picks, the doctor's protection, the seer's checks), revealed now that the game is over;
- day by day: the board posts, the votes, and who went out;
- the winner and why;
- awards.

The night reveals are the best part to read back.

---

# The pack, complete

| Part | Contents | Build order |
|---|---|---|
| 00 | Foundation: game picker, download-on-pick, presence, matcher, voices, shared components | 1st. Do F1–F3 first, on their own; then F4–F7 as the games need them |
| 01 | Imposter, Herd Mind | 2nd |
| 02 | Fake-Out, Who Said It | 3rd (Fake-Out's facts need checking) |
| 03 | Tune In, Hive Rank | 4th |
| 04 | Echo, Blind Auction | 5th |
| 05 | Spy Grid | 6th (the largest game) |
| 06 | Nightfall | 7th (reuses Imposter's hidden-role plumbing) |

**Each game gets its own Claude Code session.** That session:
1. reads Part 00 plus that game's part;
2. finishes the Definition of Done (P00 §8);
3. posts a screenshot review before the next game starts.
