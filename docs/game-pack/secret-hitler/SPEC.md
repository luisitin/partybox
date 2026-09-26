# PartyBox · Secret Hitler — Complete Game Spec

_A standalone spec for one game. Written 2026-09-24 against `GAME-DESIGN-BRIEF.md` (commit f4f43d17) and the PartyBox Game Pack (Parts 00–06). Hand this file to Claude Code on its own; §20 lists everything it needs from the platform._

> **Credit and licence.** Secret Hitler is designed by Max Temkin, Mike Boxleiter and Tommy Maranges (Goat, Wolf, & Cabbage) and released under **CC BY-NC-SA 4.0**. This adaptation is for private, non-commercial play:
>
> - keep the credit line on the game's About sheet and on its results screen;
> - never charge for it;
> - if this adaptation is ever shared, it must carry the same licence.
>
> The **rules** are adapted from the original. **Everything visual and audible in this spec is original.** Do not copy the original game's artwork, or the look of any existing website or app.

---

## 0. How to use this spec

**For the implementing agent (Claude Code)**

1. **The code on `main` is the truth.** If anything here conflicts with the code or with a hard rule in brief §4, stop and report it with a proposed fix.
2. **Build in the four milestones of §22, in order.** After each one:
   - post screenshots (phone at 320×568 and 390×844, TV at 1920×1080, all five themes);
   - wait for the owner.
3. **Rules carry ids** (**R**, **D**, **V**, **S**). Name tests after them, for example `R7 tie vote fails`, so every rule has a test.
4. **§20 lists what this game needs from the platform.** Anything from the Game Pack's Part 00 is reused if it already exists. If it doesn't, §20 describes the minimum to build.

**Words used**

| Word             | Meaning                                                                                         |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| Government       | a President and a Chancellor                                                                    |
| Candidate        | the Presidential candidate before a vote, and their nominee                                     |
| Policy           | a card: Liberal (L) or Fascist (F)                                                              |
| Deck / discards  | the face-down draw pile / the face-down used pile                                               |
| Board            | the two tracks where enacted policies go: Liberal (5 slots) and Fascist (6 slots)               |
| Election tracker | counts failed governments in a row (0–3)                                                        |
| Chaos            | what happens when the tracker reaches 3                                                         |
| Hitler zone      | 3 or more Fascist policies enacted. From here, electing Hitler Chancellor wins for the Fascists |
| Term-limited     | barred from being nominated Chancellor this round                                               |
| Power            | a one-time action that some Fascist slots give the President                                    |
| Ghost            | an executed player: can't talk, vote or be nominated (except the optional ghost vote, V6)       |
| Exiled           | a player who has left the game for good (D7)                                                    |
| Seat order       | the order the presidency moves in ("clockwise" in the original rules)                           |
| Session          | one legislative session: the President's draw through to an enactment or a veto                 |

---

## 1. The game at a glance

|                  |                                                                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Name · tagline   | **Secret Hitler** · "Pass laws. Spot the liars. Stop Hitler."                                                                            |
| id · icon        | `secret-hitler` · 🏛️                                                                                                                     |
| Players · length | 5–10 · about 35 min · `estimatedMinutes: 35`                                                                                             |
| Tags             | `hidden-roles`, `bluff`, `strategy`                                                                                                      |
| Bots             | Allowed. They play honestly by simple rules (§16), but the game is about talking, so it's best with 5+ humans                            |
| Presence         | `voice-if-remote` (§13)                                                                                                                  |
| Hook             | The vote cards flip: Ja, Ja, Nein, Ja. Elected. Three Fascist policies are already law… and the searchlight lands on the new Chancellor. |

**`howToPlay`** (at most 90 characters each)

1. Secret roles: Liberals, Fascists and Hitler. The Fascists know each other.
2. Elect a President and Chancellor. They secretly pass one policy from a stacked deck.
3. Liberals: 5 Liberal laws or kill Hitler. Fascists: 6 Fascist laws or elect Hitler.

**What makes this version special**

- The TV is a 1930s parliament in film-noir light (§7).
- Every claim and vote lands in a live Parliament Record (§10).
- Eight optional toggles (§5) turn one game into many.

---

## 2. Rules of record

These are the base rules. Everything else in this spec builds on them.

### R1 · Roles

Players are secretly split into Liberals and Fascists. One of the Fascists is Hitler.

| Players | Liberals | Fascists | Hitler |
| ------- | -------- | -------- | ------ |
| 5       | 3        | 1        | 1      |
| 6       | 4        | 1        | 1      |
| 7       | 4        | 2        | 1      |
| 8       | 5        | 2        | 1      |
| 9       | 5        | 3        | 1      |
| 10      | 6        | 3        | 1      |

Each player has two things:

- a **party**: Liberal or Fascist. Hitler's party is Fascist.
- a **role**: Liberal, Fascist or Hitler.

Investigations show the party, never the role.

### R2 · Who knows what at the start

- Fascists know every Fascist, and they know who Hitler is.
- At 5–6 players, Hitler also knows the Fascist.
- At 7–10 players, Hitler knows nobody.
- Liberals know nothing.

### R3 · The deck

17 policies: 6 Liberal and 11 Fascist, shuffled with the state's rng.

### R4 · Winning

**Liberals win when:**

- the 5th Liberal policy is enacted; or
- Hitler is executed.

**Fascists win when:**

- the 6th Fascist policy is enacted; or
- Hitler is elected Chancellor while 3 or more Fascist policies are enacted (R8).

### R5 · Seats and the first President

- Seat order is shuffled with the rng at the start and shown on the TV.
- A random player is the first Presidential candidate.
- After each round, the candidacy passes to the next living player in seat order. Special elections are the exception (R16).

### R6 · Nomination

The Presidential candidate nominates a Chancellor candidate: any other living player who is not term-limited.

- **Term limits:** the last _elected_ President and the last _elected_ Chancellor can't be nominated as Chancellor.
- **Five or fewer alive:** only the last elected Chancellor is term-limited. The last President may be nominated.
- Term limits never stop anyone from being President.
- Chaos clears term limits (R10).

### R7 · The vote

Every living player votes Ja or Nein in secret, and then all votes are shown at once.

- **Elected:** Ja votes are more than half of the votes. A tie fails. (D2: a living player who doesn't vote counts as Nein.)
  - The candidates become President and Chancellor.
  - They become the term-limited pair for the _next_ nomination.
  - The election tracker is not touched until a policy is enacted (R20).
- **Not elected:**
  - the tracker moves up one (R9);
  - the candidacy passes on.

### R8 · The Hitler check

When a government is elected while 3 or more Fascist policies are enacted, the game checks the new Chancellor:

- **Hitler:** the Fascists win at once.
- **Not Hitler:** everyone now knows it. The TV marks that player **✓ Not Hitler** for the rest of the game.

### R9 · Failed governments

The election tracker moves up one for:

- each failed vote;
- each agreed veto (R19).

### R10 · Chaos

When the tracker reaches 3, in this order:

1. The top policy of the deck is revealed and enacted.
2. Its power, if it has one, is ignored.
3. The tracker resets to 0.
4. All term limits are cleared: anyone living can be nominated Chancellor next.
5. If fewer than 3 policies remain in the deck, the discards are shuffled back in (R13).

A chaos policy can win the game (the 5th Liberal or 6th Fascist).

### R11 · The legislative session

1. The President draws the top 3 policies, secretly discards 1, and passes the other 2 to the Chancellor.
2. The Chancellor secretly discards 1 and enacts the other, face up on its track.
3. Discards stay face down. Nobody sees them.

### R12 · Silence during the session

From the moment the President draws until the policy is enacted (or vetoed), the President and Chancellor must not communicate. After that, anyone may say anything.

### R13 · Reshuffle

At the end of a legislative session, and after chaos: if fewer than 3 policies remain in the deck, shuffle the discards and the rest of the deck together into a new deck.

### R14 · Powers

Enacting a Fascist policy on some slots gives the President a one-time power.

- The power is used immediately, before the next round.
- Liberal policies give nothing.
- Slot 5 also unlocks the veto (R19) for the rest of the game.

| Fascist slot | 5–6 players               | 7–8 players               | 9–10 players              |
| ------------ | ------------------------- | ------------------------- | ------------------------- |
| 1            | —                         | —                         | Investigate               |
| 2            | —                         | Investigate               | Investigate               |
| 3            | Policy peek               | Special election          | Special election          |
| 4            | Execution                 | Execution                 | Execution                 |
| 5            | Execution · veto unlocked | Execution · veto unlocked | Execution · veto unlocked |
| 6            | Fascists win              | Fascists win              | Fascists win              |

### R15 · Investigate

1. The President chooses a player who is:
   - living;
   - not the President;
   - not already investigated in this game.
2. The President privately sees that player's **party**.
3. The President may tell the truth or lie about it.

### R16 · Special election

1. The President chooses any other living player to be the next Presidential candidate. Term limits don't apply to the presidency.
2. After that special round, the candidacy returns to the next living player after the President who called the special election. Nobody is skipped.

If the President chooses the next player in seat order, that player is President twice in a row.

### R17 · Policy peek

The President privately sees the top 3 policies of the deck. They go back in the same order.

### R18 · Execution

The President chooses a living player other than themself, who is executed.

- **Hitler:** the Liberals win at once.
- **Anyone else:**
  - the table learns only "not Hitler";
  - their role stays hidden until the end;
  - they become a ghost: no talking, no voting, never nominated.

### R19 · Veto

Once 5 Fascist policies are enacted, every legislative session gains a veto option:

1. After receiving the 2 policies, the Chancellor may request a veto instead of enacting.
2. **If the President agrees:**
   - both policies are discarded and nothing is enacted;
   - the tracker moves up one, which can cause chaos;
   - the candidacy passes on.
3. **If the President refuses:** the Chancellor must enact one.

Each session allows only one veto request.

### R20 · Tracker reset

The tracker resets to 0 whenever any policy is enacted, whether by a government or by chaos.

### R21 · Lying

Anyone may lie about anything, at any time. The only thing nobody can do is show their cards. The game itself never lies; the one exception is the optional Forger (V4).

### R22 · The end

When a side wins, every role is revealed on the TV (§18).

---

## 3. Digital adaptations

The table game has no clocks and no disconnects. PartyBox has both, so these rules fill the gaps. The brief's hard rules require that every phase can end (brief §4).

### D1 · Deadlines and timeouts

| Phase               | Normal pace | When time runs out                                          |
| ------------------- | ----------- | ----------------------------------------------------------- |
| `seating`           | 30 s        | the game continues                                          |
| `nominate`          | 90 s        | a random eligible nominee (D3)                              |
| `vote`              | 45 s        | missing votes count as Nein (D2)                            |
| `presDraw`          | 45 s        | a random discard                                            |
| `chanEnact`         | 45 s        | a random policy is enacted (no veto)                        |
| `vetoAsk`           | 20 s        | the veto is refused                                         |
| `claims`            | 60 s        | the game moves on; unposted claims stay unposted            |
| `power` (choosing)  | 45 s        | a random valid target (D3)                                  |
| `power` (peek view) | 15 s        | the view closes                                             |
| `manhunt`           | 60 s        | the most-tapped player so far; nobody tapped means no guess |

- The `pace` setting scales every row above: `relaxed` ×1.5, `fast` ×⅔, rounded to 5 s.
- Paced reveals (§4) never change length with pace.

### D2 · Missing votes are Nein

- When `vote` ends, any living player who hasn't voted counts as Nein ("no confidence").
- Votes can be changed until the phase ends.
- The phase ends early once every living player has voted.

### D3 · Random choices are announced, never hidden

When a timeout picks at random, the TV says "Time ran out. A random choice was made."

- **Nominations and power targets:** the TV also names the result.
- **Discards and enactments:** the TV says only that time ran out. The choice itself stays secret.

### D4 · VIP "Last call"

- The VIP can hurry any player's choice. The chooser's phone then shows a 10-second "Last call" bar, after which the timeout result applies.
- The VIP can never choose for anyone.

### D5 · ✓ Not Hitler

The badge from R8 stays on that player's seat, on the TV and the phones, for the rest of the game.

### D6 · Silence in the session

R12, made digital:

- From `presDraw` until the session's outcome, the President's and Chancellor's chat boxes are locked.
- The TV shows "Legislative session: the President and Chancellor may not speak."
- In rooms that talk out loud, this is a house rule that the narrator announces.

### D7 · Leaving the game (exile)

A player whose seat is released is **exiled**. That happens after the brief's 120-second hold, or immediately if they leave on purpose.

**What exile means**

- They are removed from the seat order, the votes and the nominations.
- Their role stays hidden until the end.
- No Coroner information (V3) and no ghost vote (V6).

**Special cases**

- **Hitler exiled:** the Liberals win ("Hitler fled the country").
- **During `nominate`:**
  - if the exiled player was the Presidential candidate, the candidacy passes on (no tracker change);
  - if they were the nominee, the game returns to `nominate` with the same President.
- **During `vote`:**
  - if the exiled player was the nominee, the votes are discarded and the game returns to `nominate`;
  - if they were a voter, their vote is dropped from the count.
- **During `presDraw`, `chanEnact`, `vetoAsk` or `power`,** if the exiled player was the one choosing, the timeout result applies at once.

A dropped player who hasn't been exiled yet simply misses deadlines.

### D8 · Too few players

If fewer than 3 players remain who are alive and not exiled, the game ends:

- the side closer to its policy goal wins (Liberal policies ÷ 5 against Fascist policies ÷ 6);
- a tie goes to the Fascists.

This can only happen through exiles.

### D9 · Seat order is always visible

The TV shows the seats as a row with an arrow, and highlights the next President with "Next".

### D10 · Pause

The brief's pause helper freezes every deadline and animation.

### D11 · Nothing carries over

No ratings, no stats and no accounts between games (brief rule 7). The finale and the recap are the only record.

---

## 4. Flow and phases

### Transitions

1. `seating` → `nominate`. The rng picks the first President.
2. `nominate` → `vote`, once a nominee is chosen.
3. `vote` → `voteReveal`.
4. `voteReveal`:
   - **rejected:** the tracker moves up one. If it's now 3, go to `chaos`; otherwise go to `nominate` with the next President.
   - **elected, with 3+ Fascist policies enacted:** go to `hitlerCheck`.
   - **elected, otherwise:** go to `presDraw`.
5. `hitlerCheck`: Hitler → `gameOver`; not Hitler → `presDraw`.
6. `presDraw` → `chanEnact`.
7. `chanEnact`:
   - enact → `enactReveal`;
   - veto request (only once the veto is unlocked, and only once per session) → `vetoAsk`.
8. `vetoAsk`:
   - refuse → back to `chanEnact`, where the veto is no longer offered;
   - agree → the VETO stamp shows, and the tracker moves up one. If it's now 3, go to `chaos`; otherwise go to `claims`.
9. `enactReveal`:
   - a win → `manhunt` (only for the 5th Liberal policy, with Manhunt in effect, V8), then `gameOver`;
   - no win → `claims`.
10. `claims`:
    - if the government enacted a Fascist policy onto a power slot → `power`;
    - otherwise → `nominate` with the next President.
11. `power` → `powerReveal`:
    - Hitler executed → `gameOver`;
    - otherwise → `nominate`. After a special election, the chosen player is the next President.
12. `chaos`:
    - a win → `gameOver` (for the 5th Liberal policy, `manhunt` comes first if it's in effect, V8);
    - after a veto → `claims`;
    - after failed votes → `nominate` with the next President.
13. `manhunt` → `gameOver`.
14. `gameOver` → results (`done`).

### Phase table

| Phase         | TV shows                                                                                                                                        | Phone shows                                                                                                                    | Inputs                       | Ends when                                       | Sound · bed                                                                     |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------- |
| `seating`     | The seat order; "Check your dossier. Keep it secret."; the setup line (power cards dealt, toggles in effect)                                    | The dossier: party, role, team, intel, power (hold to see); **Got it**                                                         | `ready`                      | everyone connected is ready, or 30 s            | `card` · `lounge`                                                               |
| `nominate`    | The President's seat under a spotlight; eligible seats lit; ineligible seats tagged with the reason                                             | President: a picker of eligible players. Everyone else: status, Board and Record tabs                                          | `nominate`                   | a nominee is chosen, or 90 s                    | `phase` (President's phone) · `latenight`                                       |
| `vote`        | "President Ana · Chancellor Ben", "VOTE NOW", ✓ over each seat as votes arrive                                                                  | JA! and NEIN! placards; ghosts: the ghost vote prompt (V6)                                                                     | `vote`, `ghostVote`          | every living player has voted, or 45 s          | `phase` · `pulse`                                                               |
| `voteReveal`  | All placards flip together; the tally; ELECTED or REJECTED; the tracker moves on a fail                                                         | Stage (§9)                                                                                                                     | —                            | paced, about 6 s                                | `reveal`, then `cheer` or `bust`, and a `lock` clank when a tracker rivet fills |
| `hitlerCheck` | Lights down, a spotlight on the Chancellor, searchlights sweeping; then NOT HITLER, or the Hitler reveal                                        | Stage                                                                                                                          | —                            | paced, about 5 s                                | silence, then `tie` or `fanfare`                                                |
| `chaos`       | Sirens and cracked glass; the top card torn off and enacted; the tracker resets; term-limit tags fall away                                      | Stage                                                                                                                          | —                            | paced, about 8 s                                | `bust` + `sweep`                                                                |
| `presDraw`    | The sealed envelope over the President; "Reviewing three policies…"; the silence banner                                                         | President: 3 cards (hold to see), then tap one to discard. Others: waiting                                                     | `discard`                    | a discard, or 45 s                              | `phase` (President's phone) · `pulse`                                           |
| `chanEnact`   | The envelope glides to the Chancellor; "Choosing one of two…"                                                                                   | Chancellor: 2 cards (hold to see), tap one to enact; **Request veto** once unlocked                                            | `enact`, `vetoRequest`       | an enactment or a veto request, or 45 s         | `phase` (Chancellor's phone) · `pulse`                                          |
| `vetoAsk`     | VETO REQUESTED stamp; "President Ana decides…"                                                                                                  | President: **Agree** / **Refuse**                                                                                              | `vetoAnswer`                 | an answer, or 20 s                              | `wager` · `pulse`                                                               |
| `enactReveal` | The decree flies to its slot, flips and is stamped; the newspaper headline spins in                                                             | Stage                                                                                                                          | —                            | paced, about 6 s                                | `cheer` (Liberal) or `bust` (Fascist)                                           |
| `claims`      | Claims appear by the President's and Chancellor's seats and in the Record; a ⚡ marks conflicting claims; "Discuss"                             | President and Chancellor: the claim builder. Everyone: Board, Record, Chat                                                     | `claim`, `pressPass`, `chat` | 60 s, or VIP Next                               | `latenight`                                                                     |
| `power`       | The power banner ("The President may investigate a player"); the target picked                                                                  | President: the target picker, or the peek cards                                                                                | `target`, `peekDone`         | a choice, or the deadline                       | `phase` (President's phone) · `pulse`                                           |
| `powerReveal` | The outcome: "Ana has seen Ben's file" / "Cy is the next President" / "The President has seen the top three" / EXECUTED, then "…was not Hitler" | Stage. For an investigation, every phone shows the same "Checking the files…" card; the Forger's has a secret prompt (V4, 9.4) | `forge`                      | paced, 3–10 s (V4 sets the investigation pause) | `reveal`; `bust` for an execution                                               |
| `manhunt`     | "The Fascists have one last chance…"                                                                                                            | Fascists (not Hitler): a picker. Others: waiting                                                                               | `manhunt`                    | agreement, or 60 s                              | `wager` · `pulse`                                                               |
| `gameOver`    | Every dossier flips in seat order; the winning banner; the finale newspaper                                                                     | Own side's result and role                                                                                                     | —                            | 15 s, or VIP                                    | `fanfare`, `win`                                                                |

### Client hooks

- **`stripHidden` in every phase.** The game's own seat row (§8) replaces the platform strip. It must show connection states itself: dropped players get a dimmed "reconnecting…" badge.
- **`quickInto`:** `voteReveal`, `hitlerCheck`, `chaos`, `enactReveal`, `powerReveal`, `gameOver`.
- **Timers:**
  - visible (small, in the corner) during `nominate`, `vote`, `claims`, `power` and `manhunt`;
  - `quiet` during `presDraw` and `chanEnact`;
  - `hidden` during reveals.

---

## 5. Variants: power cards and rule toggles

Every variant is a toggle, and **all toggles are off by default**. With everything off, the game is exactly the rules of record (§2). Settings, presets and the conditions that lock a toggle are in §6.

### Power cards

A power card is dealt secretly, on top of a player's party and role. It shows in the dossier (§9).

#### V1 · 📰 Journalist (Liberal)

**Once per game**, the Journalist can use the press pass to privately learn which policy the President discarded in a session.

**When it can be used:** during a `claims` phase, if all of these are true:

- the session just ended with an enactment or an agreed veto (never after chaos, which has no President);
- the Journalist is alive and wasn't that session's President;
- the press pass hasn't been used yet.

**What happens:** the Journalist's dossier gains "Session 4: the President discarded a FASCIST policy". The window closes when `claims` ends.

**What others see:** nothing. There's no TV cue and no delay.

If the Journalist was that session's Chancellor, the press pass tells them the President's whole hand.

#### V2 · 🕵️ Undercover Agent (Liberal)

At `seating`, the Agent's dossier names one Fascist, picked with the rng. It is never Hitler, and never the Anarchist.

At 5–6 players there is only one Fascist, so the Agent learns exactly who it is.

#### V3 · ⚰️ Coroner (Liberal)

Whenever a player is executed (R18) while the Coroner is alive, the Coroner's dossier privately gains that player's **party**:

- Hitler's party shows as Fascist, but executing Hitler ends the game anyway;
- the Anarchist's shows as Liberal.

Exiles (D7) don't trigger it.

#### V4 · ✒️ Forger (Fascist; needs 7+ players)

**Once per game**, the Forger can make an investigated Fascist-team player show as **Liberal**.

**When the chance comes up:**

- a living Fascist-team player is investigated (R15). That includes Hitler, and includes the Forger;
- the Forger is alive;
- the Forger hasn't forged yet.

**How it plays out:**

1. During the investigation pause (below), the Forger's phone shows a secret prompt: "Forge Ben's file? The President will see LIBERAL." **Yes** / **No**.
2. No answer means no forgery.
3. The President sees the forged party.

**What it can't do:**

- frame a Liberal;
- touch a Policy Peek or the Coroner;
- change the end-of-game reveal.

**The uniform pause.** Whenever the Forger toggle is in effect (§6), _every_ investigation holds a 10-second "Checking the files…" pause. That's true even if no Forger was dealt, and even when the target is a Liberal. So neither the pause nor its length ever gives anything away. With the toggle off, the pause is 3 s.

**Why 7+ players:** below 7 there are no investigations (R14), so the card would do nothing.

#### V5 · 👂 Informant (Fascist)

At `seating`, the Informant's dossier names one player who holds a Liberal power card (picked with the rng if there are several), but not which card. If no Liberal power card was dealt, it says "No Liberal power cards are in play."

### Rule toggles

#### V6 · 👻 Ghost vote

Each executed player gets one ghost vote.

**Using it**

- During any later `vote`, the ghost's phone offers **Use your ghost vote: JA! / NEIN! / Save it**.
- A used ghost vote counts like any other vote in that election, and appears in the reveal with a 👻 mark.

**How it counts.** The government is elected when Ja votes are more than half of the votes:

- every living player counts, with a missing vote counted as Nein (D2);
- a ghost vote counts only if it was used.

**Limits**

- Unused ghost votes never count, and the vote never waits for ghosts: it ends early once every living player has voted (D2).
- Exiled players get none.
- Ghosts still can't talk or be nominated.

#### V7 · 🏴 Anarchist (neutral; needs 7+ players)

The Anarchist takes one Liberal seat. With this on, 7 players become 3 Liberals, 1 Anarchist, 2 Fascists and Hitler.

**Who the Anarchist is**

- They know nobody, and nobody knows them.
- Their party shows as **Liberal** for every check.
- They never hold a power card.

**The Anarchist wins alone** when the **second** chaos event of the game happens (R10), as long as they haven't been exiled. That applies even if they've been executed: their movement lives on.

**Unrest meter.** While this toggle is in effect, the TV shows a public meter, "Unrest ●○". It counts chaos events, which are public anyway.

**Why 7+ players:** at 5–6 players, removing a Liberal breaks the balance.

#### V8 · 🎯 Manhunt (needs the Undercover Agent)

The Manhunt is a last chance for the Fascists after a Liberal win.

**When it happens:** only when the Liberals win with the **5th Liberal policy**, whether a government or chaos enacted it. It never happens when Hitler is executed or flees (D7), and it's skipped if every hunter has been exiled.

**Who hunts:** every Fascist except Hitler, whether alive or dead (but not exiled).

**How it works**

1. Each hunter taps one player who isn't on the Fascist team: Liberals and the Anarchist, alive, dead or exiled.
2. The most-tapped player is the guess. A tie means no guess.
3. If the guess is the Undercover Agent, the Fascists steal the win: "The Agent's cover was blown."

**If no Agent was dealt** (§6 over-selection), the Manhunt still runs, so it doesn't give away the setup. It can't succeed.

### V9 · Dealing power cards

**Who can get them**

- Liberal cards go to Liberals only; Fascist cards go to Fascists only.
- Never to Hitler, and never to the Anarchist.
- One card per player at most.

**How many are dealt** (the caps):

| Players | Liberal cards | Fascist cards |
| ------- | ------------- | ------------- |
| 5–6     | 1             | 1             |
| 7–8     | 2             | 1             |
| 9–10    | 3             | 2             |

**How the cards are chosen**

- If no more cards are in effect than the cap, all of them are dealt.
- If more are in effect than the cap, the rng deals a random selection.
- Holders are picked with the rng.

**What the table is told:** at `seating`, the TV shows "Power cards dealt: 2 Liberal · 1 Fascist". It shows the counts only, never which cards or who holds them.

### Interactions

| When…            | …and…                              | What happens                                                                              |
| ---------------- | ---------------------------------- | ----------------------------------------------------------------------------------------- |
| Forger           | Coroner                            | The Coroner always learns the true party; forging only changes investigations             |
| Forger           | Undercover Agent                   | Unaffected: the Agent's `seating` intel is always true                                    |
| Forger           | Anarchist                          | Can't touch them (not Fascist-team); they already show Liberal                            |
| Forger           | Forger investigated                | They can forge their own file                                                             |
| Forger           | Forger dead                        | No prompt, no forgery; the uniform pause still happens                                    |
| Journalist       | agreed veto                        | Usable: the President still discarded a card                                              |
| Journalist       | chaos                              | Not usable: no President, no discard                                                      |
| Journalist       | Journalist was the Chancellor      | Usable, and reveals the President's whole hand                                            |
| Journalist       | Journalist was the President       | Button hidden (they already know)                                                         |
| Coroner          | exile                              | Not triggered                                                                             |
| Coroner          | Anarchist executed                 | Learns "Liberal"                                                                          |
| Informant        | no Liberal cards dealt             | Told "No Liberal power cards are in play"                                                 |
| Informant        | Anarchist                          | Never named (holds no card)                                                               |
| Undercover Agent | Anarchist                          | Never named (not a Fascist)                                                               |
| Undercover Agent | 5–6 players                        | Names the only Fascist                                                                    |
| Ghost vote       | Anarchist executed                 | Can use it (a Nein can feed chaos)                                                        |
| Ghost vote       | Manhunt                            | Not used                                                                                  |
| Anarchist        | agreed vetoes                      | Vetoes move the tracker (R19), so they can cause chaos                                    |
| Anarchist        | chaos also enacts a winning policy | The Anarchist wins (V10)                                                                  |
| Manhunt          | no Agent dealt                     | Runs, can't succeed                                                                       |
| Manhunt          | Hitler executed or fled            | No Manhunt                                                                                |
| Special election | term limits                        | The chosen President can be term-limited; their nominee must still be eligible            |
| Chaos            | term limits                        | Cleared for the next nomination only; the next elected pair becomes term-limited as usual |

### V10 · Which win comes first

Only one event resolves at a time, so the order only matters for chaos:

1. **Hitler elected Chancellor with 3+ Fascist policies** (R8): checked at the vote result.
2. **Hitler executed** (R18) **or exiled** (D7): the Liberals win.
3. **Chaos enactment:**
   - if it's the second chaos event and the Anarchist is in play and not exiled, the Anarchist wins;
   - otherwise, the chaos policy can win for its side. For the 5th Liberal policy, the Manhunt then runs if it's in effect.
4. **Government enactment:**
   - the 5th Liberal policy: the Liberals win, then the Manhunt runs if it's in effect;
   - the 6th Fascist policy: the Fascists win.

---

## 6. Settings, presets and conditional toggles

### 6.1 The settings

| Key               | Type    | Default   | Group                 | Condition                   | Notes                                                                        |
| ----------------- | ------- | --------- | --------------------- | --------------------------- | ---------------------------------------------------------------------------- |
| `preset`          | select  | `classic` | Mode                  | —                           | classic, cloak, chaos, custom (6.4)                                          |
| `journalist`      | boolean | false     | Power cards · Liberal | —                           | V1                                                                           |
| `undercoverAgent` | boolean | false     | Power cards · Liberal | —                           | V2                                                                           |
| `coroner`         | boolean | false     | Power cards · Liberal | —                           | V3                                                                           |
| `forger`          | boolean | false     | Power cards · Fascist | **7+ players**              | V4                                                                           |
| `informant`       | boolean | false     | Power cards · Fascist | —                           | V5                                                                           |
| `ghostVote`       | boolean | false     | Rules                 | —                           | V6                                                                           |
| `anarchist`       | boolean | false     | Rules                 | **7+ players**              | V7                                                                           |
| `manhunt`         | boolean | false     | Rules                 | **needs `undercoverAgent`** | V8                                                                           |
| `pace`            | select  | `normal`  | Timing                | —                           | relaxed, normal, fast (D1)                                                   |
| `chat`            | select  | `auto`    | Table talk            | —                           | auto = on only in `remote-text` rooms; on; off (§10.4). Claims are always on |
| `reader`          | select  | `george`  | Sound                 | —                           | every voice, or none (§12)                                                   |

Player counts always include bots.

### 6.2 Two kinds of condition (S1)

A toggle can be blocked for two different reasons, and each behaves differently on purpose.

**Room conditions** (Forger and Anarchist need 7+ players)

The room changes on its own: people join, leave, and add or remove bots. The VIP's choice is kept, and only its effect changes:

- **Below 7 players, the toggle can't be switched on.** Tapping it explains why (6.3).
- **If it was already on when the room drops below 7,** it becomes **Paused**. It stays switched on but has no effect, and turns back on by itself when the 7th player joins.

**Setting conditions** (Manhunt needs Undercover Agent)

These only change when the VIP acts, so they follow the VIP's hand:

- **While Undercover Agent is off, Manhunt is locked** and can't be switched on. Tapping it explains why and offers a fix.
- **Switching Undercover Agent off also switches Manhunt off,** and a toast says so.
- **Switching Undercover Agent back on doesn't bring Manhunt back.** The VIP chooses again.

### 6.3 What every state looks like and does

| State                                     | How it looks                                                                   | Tapping it                                                                                                                                                        |
| ----------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Available**                             | a normal toggle                                                                | toggles it                                                                                                                                                        |
| **Blocked by the room**                   | dimmed to 60%, 🔒 icon, caption "Needs 7+ players · you have 6"                | the row shakes (transform, 200 ms; none with reduced motion), the `rejected` haptic plays, and the caption opens into a one-line reason with a fix button (below) |
| **Paused** (was on, room dropped below 7) | switched on but dimmed, ⏸ badge, caption "Paused · turns back on at 7 players" | switches it off (clears the intent)                                                                                                                               |
| **Locked by a setting**                   | dimmed, 🔒 icon, caption "Needs Undercover Agent"                              | the row shakes, the `rejected` haptic plays, a reason line and a **Turn on both** button appear                                                                   |

**Messages** (English here; every line also needs Spanish, brief rule 11):

| Toggle             | Reason line                                                          | Fix button                                                            |
| ------------------ | -------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Forger, blocked    | "The Forger works on investigations, which start at 7 players."      | VIP only: **Add a bot** (adds one bot)                                |
| Anarchist, blocked | "The Anarchist needs 7+ players so the Liberals aren't too thin."    | VIP only: **Add a bot**                                               |
| Manhunt, locked    | "The Manhunt hunts the Undercover Agent, so that card has to be on." | VIP only: **Turn on both** (switches on Undercover Agent and Manhunt) |

- The reason line closes after 4 s, or on the next tap anywhere. There are never pop-up modals.
- **Add a bot** appears only if the room can take another bot. A bot added this way counts towards the 7 immediately, so one tap can unlock the toggle.

**Toasts for changes the VIP didn't make directly:**

- "Forger paused: needs 7+ players" (someone left).
- "Forger is back on: 7 players" (someone joined).
- "Manhunt switched off too: it needs Undercover Agent."

### 6.4 Presets

A preset is a one-tap shortcut that sets the eight variant toggles.

| Preset         | Journalist | Agent | Coroner | Forger | Informant | Ghost vote | Anarchist | Manhunt |
| -------------- | ---------- | ----- | ------- | ------ | --------- | ---------- | --------- | ------- |
| Classic        | off        | off   | off     | off    | off       | off        | off       | off     |
| Cloak & Dagger | on         | on    | on      | on     | on        | on         | off       | off     |
| Full Chaos     | on         | on    | on      | on     | on        | on         | on        | on      |

- A preset sets the VIP's choices. Room conditions still apply, so Full Chaos at 6 players shows Forger and Anarchist as **Paused**, ready for a 7th player.
- Changing any toggle by hand switches the preset label to **Custom**.
- If the toggles happen to match a preset, the label switches back to that preset.

### 6.5 Section summaries

The "Power cards" group header always says what will actually be dealt, for example:

- "Up to 2 Liberal and 1 Fascist card will be dealt (7 players)."
- If more cards are on than the caps allow: "3 Liberal cards on · 2 will be dealt at random. Nobody will know which." This is information, not an error.

### 6.6 Starting the game

When the VIP taps **Start** and any chosen toggle is paused, a bottom sheet lists what won't be used, and why:

> **Won't be used this game:** Forger (needs 7+ players), Anarchist (needs 7+ players)
> **Start anyway** · **Back**

The sheet also repeats the Power cards summary.

### 6.7 The server decides (never trust the screen)

**`resolveSettings(chosen, playerCount)`** is a pure function in the game's shared code. It returns:

- the effective settings;
- the list of paused and locked toggles, with their reasons;
- the dealing caps (V9).

**Where it's used**

- The settings editor calls it to draw the states in 6.3.
- `init` calls it again before dealing anything, so an old or modified phone can't turn on something the room doesn't allow.
- Conditions are checked **once, at Start**. Players who leave during the game never switch a variant off. A game that started with 7 keeps its Forger and Anarchist, even at 6.

**What everyone else sees**

- The TV's `seating` screen shows the effective setup: toggles in effect, plus the power-card counts.
- Non-VIP phones see the same settings screen, read-only, with the same states. Tapping ⓘ shows the reasons, but there are no fix buttons.

### 6.8 How this reaches the platform

**Platform request S1: conditional settings.** Extend the manifest's settings with the following, rendered by the platform's settings editor:

- groups (`group`);
- one-line help text (`hint`);
- conditions (`requires`);
- the locked-state reason (`lockedReason`);
- fix actions (`fix`);
- presets.

```ts
type SettingCondition =
  { minPlayers: number } | { maxPlayers: number } | { setting: string; equals: unknown };

interface SettingExtras {
  group?: string; // translatable heading
  hint?: string; // one-line help, translatable
  requires?: SettingCondition[]; // all must hold
  lockedReason?: Record<string, string>; // per condition type, translatable
  fix?: { label: string; set?: Record<string, unknown>; addBot?: boolean };
}

interface Preset {
  id: string;
  label: string;
  values: Record<string, unknown>;
}
```

S1 is generic: other games in the pack need the same thing (Tune In's teams mode, Blind Auction's Live mode).

If the platform can't take S1, report it to the owner. Don't ship a game-only workaround that bypasses the settings contract.

---

## 7. Visual design: Parliament Noir

### 7.1 The look in one paragraph

A parliament at midnight in the 1930s.

- **The TV is the chamber:** dark wood and brass, rain on tall windows, searchlights sweeping outside.
- **The sound:** a radio announcer's voice.
- **The newspaper** prints the country's fate after every vote.
- **The objects:** policies are official decrees on heavy paper with wax seals; votes are big printed placards.
- **Everything important is stamped.**

The drama is political, never violent.

### 7.2 Ground rules

1. **Original work only.** Every emblem, card, texture and layout is drawn for this game, as inline SVG and CSS. Nothing is traced from, or modelled on, the original game's art or any existing app or website.
2. **Forbidden imagery:**
   - real Nazi or fascist symbols: swastikas, SS runes, eagle insignia, Iron Crosses, fasces;
   - real flags, uniforms or insignia;
   - real propaganda posters or photographs;
   - a likeness of Hitler or of any real person;
   - any imagery of the Holocaust or its victims.

   Hitler only ever appears as a silhouette behind a cracked mask. The satire stays on politics: ambition, lies, fear, posters, stamps and newspapers.

3. **Works in every platform theme** (S2, 7.3). High Contrast uses patterns as well as colour.
4. **Satire, never celebration.** A Fascist victory is shown as the country going dark: lights fading, windows shuttered, rain. It is never triumphant, and it has no marching, no rallies and no salutes.
5. **Performance and accessibility** follow the brief. Animate only transform and opacity; keep 60 fps on the TV; meet the minimum sizes; respect reduced motion.

### 7.3 Game tokens (platform request S2)

The game defines its own palette as CSS custom properties, set once per platform theme in `client/tokens.css`. Components use only these tokens and the platform's `--pb-*` tokens; no raw colours anywhere else.

Values for the default dark theme:

| Token              | Used for                       | Default (dark)              |
| ------------------ | ------------------------------ | --------------------------- |
| `--sh-night`       | stage background               | `#0D0E13`                   |
| `--sh-wood`        | panels, seat row               | `#231A14`                   |
| `--sh-paper`       | policy cards, files, newspaper | `#EFE5CF`                   |
| `--sh-ink`         | text on paper                  | `#1C1A16`                   |
| `--sh-brass`       | placards, rivets, frames       | `#C8A24A`                   |
| `--sh-liberal`     | Liberal cards and track        | `#2E6BB0`                   |
| `--sh-liberal-ink` | text on Liberal                | `#F2F7FF`                   |
| `--sh-fascist`     | Fascist cards and track        | `#A3262A`                   |
| `--sh-fascist-ink` | text on Fascist                | `#FFF1EC`                   |
| `--sh-spot`        | spotlight glow                 | `rgba(255, 238, 200, 0.22)` |
| `--sh-alarm`       | chaos siren                    | `#E0432F`                   |

**Other themes**

- **Light themes:**
  - `paper` stays paper-coloured;
  - `night` becomes pale stone, and `wood` a mid brown;
  - `liberal` and `fascist` deepen until text contrast is at least 4.5:1.
- **High Contrast:**
  - black, white and yellow only;
  - Liberal is a white card with diagonal stripes; Fascist is a black card with crosshatching;
  - no grain and no rain.

If the brief's "tokens only" rule doesn't allow a game-scoped token file, flag it. This is a deliberate, contained exception that needs the owner's approval.

Durations are tokens too (`--sh-dur-stamp`, `--sh-dur-flip`, and so on).

### 7.4 Typography

| Role       | Font (bundled, open licence) | Used for                                    |
| ---------- | ---------------------------- | ------------------------------------------- |
| Display    | Bebas Neue (SIL OFL)         | stamps, placards, big banners, track titles |
| Headline   | Playfair Display (SIL OFL)   | newspaper headlines, role names             |
| Typewriter | Special Elite (Apache 2.0)   | files, the Parliament Record, claims        |
| Body       | the platform's body font     | everything else                             |

- Commit each font's licence file next to it, and subset each font to Latin plus Spanish characters.
- Load the fonts with the game's own chunk, never the lobby (P9).
- Give every font a fallback stack.
- Follow the brief's minimum sizes: TV body 36 px and captions 28 px; phone body 18 px and captions 14 px.

### 7.5 Emblems and art

Everything below is inline SVG drawn for this game.

**Party and role emblems**

| Element        | Design                                                          |
| -------------- | --------------------------------------------------------------- |
| Liberal emblem | A lantern with a steady flame, inside a ring                    |
| Fascist emblem | A serpent coiled around a cracked column                        |
| Hitler         | A black silhouette behind a white theatre mask split by a crack |
| Anarchist      | A torn black flag on a broken pole                              |

**Policy cards and the deck**

| Element            | Design                                                                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Policy card        | A heavy paper decree with a deckled edge; a wax seal with the party emblem; a ribbon in the party colour; "LIBERAL POLICY" or "FASCIST POLICY" in the Display font |
| Card back and deck | An engraved guilloché pattern (generated SVG lines) with a small brass star seal                                                                                   |

**Placards and the tracker**

| Element          | Design                                                                       |
| ---------------- | ---------------------------------------------------------------------------- |
| JA! placard      | A paper placard, bold ✓, "JA!"                                               |
| NEIN! placard    | An ink-black placard, bold ✗, "NEIN!"                                        |
| President plate  | Brass, with a star and "PRESIDENT"                                           |
| Chancellor plate | Brass, with a key and "CHANCELLOR"                                           |
| Election tracker | Three brass rivets on a gauge that fill red; the fourth position reads CHAOS |

**Power icons**

| Power            | Icon                                 |
| ---------------- | ------------------------------------ |
| Investigate      | A magnifier over a file              |
| Special election | A hand passing a brass plate         |
| Peek             | An eye over three cards              |
| Execution        | An empty chair in a spotlight        |
| Veto             | Two crossed-out decrees under "VETO" |

**Power cards**

| Card             | Design                          |
| ---------------- | ------------------------------- |
| Journalist       | A press card and a fountain pen |
| Undercover Agent | A fedora and a turned-up collar |
| Coroner          | A ledger with a black ribbon    |
| Forger           | A quill and a wax seal          |
| Informant        | An ear at a keyhole             |

**The newspaper and the stamps**

| Element   | Design                                                                                                                                  |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Newspaper | Masthead "THE EVENING REPUBLIC", a headline, "Session 7" as the date line, grey bars for body text                                      |
| Stamps    | Rubber-stamp frames with uneven ink (an SVG turbulence mask): ELECTED, REJECTED, ENACTED, VETO, EXECUTED, NOT HITLER, CHAOS, CLASSIFIED |

### 7.6 Light, texture and weather

**The stage**

- A deep gradient, with tall window shapes at the back.
- Rain streaks on the windows: repeating gradients moved slowly. Off with reduced motion.
- Searchlight cones sweep across the windows during tense moments.

**Film grain**

- One static noise layer at 5% opacity, on the TV only (phones skip it to save battery).
- Off in High Contrast.

**Vignette and spotlights**

- A vignette around the edges.
- Spotlights are radial gradients, moved only with transform.

### 7.7 Motion vocabulary

| Name          | What moves                                     | Duration               | With reduced motion             |
| ------------- | ---------------------------------------------- | ---------------------- | ------------------------------- |
| stamp         | scale 1.6 → 1, rotate −4° → −2°, opacity 0 → 1 | 180 ms + 120 ms settle | 150 ms fade                     |
| deal          | translate and rotate from deck to target       | 350 ms                 | fade                            |
| flip          | rotateY 0 → 180° (two faces)                   | 500 ms                 | crossfade                       |
| headline spin | rotate 720°, scale 0.2 → 1                     | 800 ms                 | fade                            |
| sweep         | a light cone translates across                 | 1.2 s                  | a static highlight              |
| shake         | translate ±6 px, 4 times                       | 300 ms                 | none                            |
| envelope pass | translate along a curve between seats          | 600 ms                 | fade out, fade in               |
| shred         | a card splits into 6 strips that fall and fade | 700 ms                 | fade                            |
| ticker        | translateX loop                                | continuous             | static, showing the latest item |

- Everything uses transform and opacity only.
- At most two heavy animations run at once.

### 7.8 Signature moments

§8 says where each of these sits on the TV.

1. **The vote reveal.** All placards flip together in a wave (40 ms apart). Then the tally, then an ELECTED or REJECTED stamp. On a fail, a tracker rivet fills with a clank.
2. **The Hitler check.**
   - The lights drop, one spotlight finds the Chancellor, and searchlights sweep outside.
   - Two seconds of silence.
   - Then either a NOT HITLER stamp, or the mask cracks open onto the Hitler emblem.
3. **The session.** A sealed envelope glides from the President to the Chancellor. The TV never shows the cards.
4. **Enactment.**
   - The decree flies to its slot, flips, and the seal stamps down.
   - The newspaper spins in with the headline.
   - The ticker updates.
5. **Chaos.**
   - The alarm colour sweeps the room and the window glass cracks.
   - The top card is torn from the deck and slammed onto its track, stamped CHAOS.
   - Term-limit tags peel off the seats.
6. **Veto.** A VETO stamp. If agreed, both decrees shred.
7. **Investigation.**
   - A CLASSIFIED folder slides over the target's seat.
   - "Checking the files…" types out.
   - The folder returns to the President.
8. **Execution.**
   - The room darkens except the target's seat, and the spotlight clicks off.
   - The seat shows an empty chair and EXECUTED, then "…was not Hitler", or the mask reveal.
9. **Game over.**
   - Every seat's dossier flips, in seat order.
   - The winning banner drops.
   - The finale newspaper prints the ending.

### 7.9 Accessibility

- **Sizes and contrast:** the brief's minimum sizes everywhere; contrast of at least 4.5:1 in every theme.
- **Never colour alone:**
  - policy cards always carry their emblem and the word;
  - Ja and Nein always carry ✓ or ✗ and the word;
  - High Contrast adds patterns (7.3).
- **Screen readers:** every phone control has a label, such as "Vote Ja", "Discard this Fascist policy", "Nominate Ben".
- **Reduced motion:** follows 7.7.
- **Haptics:** the brief's patterns.

---

## 8. TV screens

### 8.1 Layout (1920×1080)

| Zone              | Where                         | What's in it                                                                                                               |
| ----------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Shell header      | top, 64 px                    | platform                                                                                                                   |
| Headline ticker   | 64–124 px                     | a newspaper banner with the latest headline (Headline font, 40 px) and an "EXTRA" tag                                      |
| Boards            | left, x 40–1360, y 140–700    | the Liberal track (5 slots) above the Fascist track (6 slots)                                                              |
| Parliament Record | right, x 1400–1880, y 140–700 | the last 7 governments (§10), typewriter font at 28 px. With chat on, the Record takes the top 55% and chat the bottom 45% |
| Middle band       | y 710–820                     | the election tracker, the Unrest meter (V7), the deck and discard piles with counts, "Next Fascist slot: Special election" |
| Seat row          | y 830–1080                    | up to 10 seats, 170 px each (details below)                                                                                |

**The boards**

- Slots are about 170×240.
- Under each Fascist slot, its power icon and a label (28 px).
- A brass line after Fascist slot 3 reads **HITLER ZONE →**. It glows once 3 Fascist policies are enacted.
- Liberal slot 5 and Fascist slot 6 read **VICTORY**.

**Each seat shows**

- avatar (88 px) and name (28 px);
- the brass plates (PRESIDENT, CHANCELLOR) and a "Next" marker;
- status tags: Term-limited, ✓ Not Hitler, 🔎 Investigated, 👻 (executed), "Left" (exiled, greyed), and "reconnecting…" (dropped);
- the vote placard, which pops above the avatar during a reveal.

An arrow along the row shows the direction the presidency moves.

### 8.2 What the TV does in each phase

| Phase                    | On screen                                                                                                                                                                                                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `seating`                | A full-width newspaper, "THE EVENING REPUBLIC · SPECIAL EDITION: A NEW PARLIAMENT", with the setup line: "7 players · 4 Liberals · 2 Fascists · Hitler", "Power cards dealt: 2 Liberal · 1 Fascist", and icons for the toggles in effect. Seats tick ✓ as players tap Got it |
| `nominate`               | Spotlight on the President's seat; "President Ana is choosing a Chancellor". Eligible seats are lit. Ineligible seats are dimmed, with a reason tag: Last Chancellor, Last President, Executed. Then "Ana nominates Ben"                                                     |
| `vote`                   | Brass plates side by side, "PRESIDENT ANA · CHANCELLOR BEN" (72 px), and "VOTE NOW". Each seat shows a face-down placard once its player has voted; a used ghost vote shows 👻                                                                                               |
| `voteReveal`             | Placards flip in a wave, then the tally ("5 JA · 2 NEIN"), then the ELECTED or REJECTED stamp. When elected, the plates slide onto the seats. When rejected, a tracker rivet fills                                                                                           |
| `hitlerCheck`            | Moment 2 of 7.8. On a pass, the ✓ Not Hitler badge lands on the seat and stays                                                                                                                                                                                               |
| `presDraw` / `chanEnact` | The envelope (moment 3), the silence banner, the boards dimmed by 20%, and a quiet timer                                                                                                                                                                                     |
| `vetoAsk`                | VETO REQUESTED stamped over the boards; "President Ana decides…"                                                                                                                                                                                                             |
| `enactReveal`            | Moment 4. If the slot has a power, a brass tag drops under it: "Power: Investigate"                                                                                                                                                                                          |
| `claims`                 | Claim bubbles by the government's seats, showing the claimed policies as small cards; the new Record row pulses; a ⚡ chip on conflicting claims (§10.2); "Discuss…"; "Next on the VIP's phone"                                                                              |
| `power`                  | A banner for the power ("The President may investigate a player"). For a peek, the deck lifts its top three cards a little, never face up                                                                                                                                    |
| `powerReveal`            | By power:<br>• **Investigate:** moment 7, with the uniform pause from V4.<br>• **Special election:** the President plate travels to the chosen seat, labelled "Special election".<br>• **Peek:** "The President has seen the top three."<br>• **Execution:** moment 8        |
| `chaos`                  | Moment 5; the Unrest meter moves (V7)                                                                                                                                                                                                                                        |
| `manhunt`                | The stage darkens, "THE FASCISTS HAVE ONE LAST CHANCE", and every non-Fascist seat is lit. Then the guess is spotlighted, with the result                                                                                                                                    |
| `gameOver`               | Moment 9. The banner is one of: THE LIBERALS SAVE THE REPUBLIC · HITLER IS DEAD · FASCISM TAKES THE COUNTRY · HITLER IS CHANCELLOR · THE AGENT'S COVER IS BLOWN · THE STREETS WIN: THE ANARCHIST. Then the finale newspaper (§18)                                            |

---

## 9. Phone screens

### 9.1 Tabs

A bottom tab bar, 56 px tall:

| Tab         | What's in it                 |
| ----------- | ---------------------------- |
| **Game**    | whatever you do now          |
| **Board**   | the compact tracks           |
| **Record**  | the Parliament Record        |
| **Dossier** | your secret file             |
| **Chat**    | only when chat is on (§10.4) |

- A tab shows a dot when something new arrives in it.
- When you have to act, the Game tab comes to the front on its own, and the `phase` cue plays.

### 9.2 The dossier (the Dossier tab, hold to see)

The dossier is a `SecretCard`. Everyone's dossier has the same five sections in the same order, with "—" when a section is empty. That way its size and shape never give anything away.

1. **Party:** the card with its emblem.
2. **Role:** Liberal, Fascist, Hitler or Anarchist, with one line on how that role wins.
3. **Team:**
   - Fascists see the other Fascists and Hitler;
   - Hitler at 5–6 players sees the Fascist;
   - everyone else sees "—".
4. **Intel**, time-stamped by session:
   - Agent and Informant information;
   - Coroner results;
   - your own investigation results, peeks and press-pass results;
   - "You forged Ben's file" (for the Forger).
5. **Power card:** the card, its one-line rule, and the **Use press pass** button when V1 allows it.

### 9.3 The Board tab

- Both tracks, compact: small cards, with the power icons on the Fascist track.
- The tracker, and the Unrest meter.
- Deck and discard counts.
- "Next Fascist slot: …".
- The seat list, with the same tags as the TV.

In rooms with no TV, and for remote players, this tab is their view of the table.

### 9.4 The Game tab, phase by phase

**`seating`**

- The dossier (hold to see) and **Got it**.

**`nominate`**

- **President:**
  - A "Choose your Chancellor" `FacePicker`: 3 columns on narrow phones, 2 on wider ones.
  - Ineligible players are disabled, with their reason as a caption ("Last Chancellor").
  - Tapping a face opens a confirm bar: "Nominate Ben?" **Nominate**.
- **Everyone else:** "President Ana is choosing a Chancellor…", with a mini board.

**`vote`**

- A header: "President Ana · Chancellor Ben".
- Two tall placards side by side, **JA! ✓** and **NEIN! ✗**, each at least 140×200.
  - Tap to choose. The chosen placard lifts and gets a border.
  - "You can change your vote until the timer ends."
- **Ghosts with a ghost vote:** "Use your ghost vote?" **JA!** / **NEIN!** / **Save it**.
- **Other ghosts:** "Ghosts can't vote."

**`presDraw`**

- **President:** "Discard one policy. The other two go to Chancellor Ben."
  1. Three face-down cards. Hold anywhere on the row to reveal all three; let go to hide them again.
  2. While they're revealed, tap one to mark it. It tilts and greys.
  3. **Discard** confirms.
- **Everyone else:** the envelope, and "Legislative session in progress".

**`chanEnact`**

- **Chancellor:** "Enact one policy."
  - Two face-down cards: hold to reveal, then tap one.
  - The button names the choice: **Enact this Liberal policy**.
  - **Request veto** is a secondary button, shown only once the veto is unlocked and hasn't been used this session.
- **Everyone else:** the envelope.

**`vetoAsk`**

- **President:** "Chancellor Ben requests a veto. Both policies will be thrown away, and the tracker moves up one." **Agree** / **Refuse**.
- **Everyone else:** waiting.

**`claims`**

- **President:** "Claim your draw."
  - Three slots, each tapping between blank, L and F.
  - Quick chips: FFF · FFL · FLL · LLL.
  - **Post claim** or **No comment**.
- **Chancellor:** "Claim your hand."
  - Two slots.
  - Quick chips: FF · FL · LL.
- **Everyone else:** "Discuss." plus the claims so far.
- The Journalist's press pass lives in the Dossier tab, never on the Game tab, so a glance at the screen shows nothing.

**`power`** (President)

| Power            | What the President does                                                                                                                               |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Investigate      | Pick from living players who aren't the President and haven't been investigated. Others are disabled, with the reason "Already investigated". Confirm |
| Special election | Pick any other living player. Confirm: "Make Cy the next President?"                                                                                  |
| Peek             | Three cards, hold to see, then **Done**                                                                                                               |
| Execution        | Pick a living player who isn't the President. Confirm, then a second hold-to-confirm (1 s): "This can't be undone. Execute Ben?"                      |

**`powerReveal`** (investigation)

- **Every phone** shows the same "Checking the files…" card with a hold area:
  - **The Forger, when V4 allows it:** holding shows **Forge it** / **Leave it**.
  - **Everyone else:** holding shows "Nothing for you."
- **Afterwards, the President** gets the result file (hold to see): "BEN · PARTY: FASCIST". Then the claim chips: **Claim Liberal** / **Claim Fascist** / **No comment**.
- **After a peek,** the President gets claim chips for three cards.

**`manhunt`**

- **Hunters:** "Name the Undercover Agent."
  - A picker of every non-Fascist-team player, with dead and exiled players badged.
  - The hunters see the running tally ("Cy ×2").
- **Everyone else:** "The Fascists are hunting…"

**`gameOver`**

- The result ("The Liberals win!"), your role, and your power card if you had one.

### 9.5 PhoneStage

`phoneStagePhases: ['voteReveal', 'hitlerCheck', 'chaos', 'enactReveal', 'powerReveal', 'gameOver']`.

These are vertical versions of the TV moments:

- the placard grid;
- the spotlight card;
- the decree and the headline;
- the chaos card;
- the power outcome;
- the dossier cascade.

In a room with a TV, `powerReveal` still shows the uniform "Checking the files…" card on every phone (9.4).

**Small-phone check** (320×568, 18 px body)

- The vote screen fits.
- A 9-candidate picker fits in 3 columns.
- The discard row of three cards fits (about 92×130 each).
- The Record and Chat tabs scroll inside `Screen`.

---

## 10. Claims, the Parliament Record and chat

### 10.1 Claims

A claim is a structured statement that a player posts to the Record. Claims can be lies (R21). The game only files them.

| Claim         | Who                            | Shape                                |
| ------------- | ------------------------------ | ------------------------------------ |
| `draw`        | the President of a session     | 3 cards, e.g. F F L                  |
| `hand`        | the Chancellor of a session    | 2 cards                              |
| `investigate` | the President who investigated | Liberal or Fascist, about the target |
| `peek`        | the President who peeked       | 3 cards                              |

- **Event ids:** every claimable event has an id in the Record: `s6` for session 6 (the draw and the hand), `i6` for an investigation in round 6, and `p6` for a peek. The `claim` input (§14) names one of these ids.
- **One claim per event per player:** either the claim, or **No comment**.
- **No editing.** Like spoken words, a claim can't be edited once posted.
- **Deadline:** a claim can be posted until the next `vote` begins.
- **Where it appears:** a bubble by the seat on the TV, and a line in the Record.

### 10.2 Conflict markers ⚡

The game marks claims that can't all be true. It uses only public information, and it never says who lied.

**Checks within a session.** Let D be the President's claimed draw, H the Chancellor's claimed hand, and E the enacted policy (there's no E if the session was vetoed).

- If H is claimed and a policy was enacted, E must be in H.
- If D is claimed and a policy was enacted, E must be in D.
- If both D and H are claimed, H must be D with exactly one card removed.

**Peek against the next draw.** This check runs when all three of these are true:

- a President claimed a peek;
- the next session draws those same three cards (no chaos card and no reshuffle in between, both of which are public events);
- that session's President claims a draw that doesn't match (compared as a set of three, ignoring order).

When it triggers, both Record rows get a ⚡.

**Investigations are never checked.** And with the Forger in play, even an honest claim can be wrong.

When a check fails, the row gets ⚡ "These claims don't add up."

### 10.3 The Parliament Record

The Record has one row per government attempt, newest at the top. The TV shows the last 7 rows; phones scroll back through the whole game.

| Kind    | Example row                                                                                                            |
| ------- | ---------------------------------------------------------------------------------------------------------------------- |
| Elected | `#6 · Ana → Ben · 5 JA 2 NEIN · ELECTED · F enacted · Ana: FFL · Ben: FF ⚡ · 🔎 Ana investigated Cy → claims Liberal` |
| Failed  | `#7 · Cy → Dee · 3 JA 4 NEIN · REJECTED · tracker 1`                                                                   |
| Chaos   | `CHAOS · L enacted from the deck · term limits cleared`                                                                |
| Veto    | `#9 · Eli → Ana · ELECTED · VETO agreed · tracker 2`                                                                   |

- Policies in rows are small cards carrying their emblem and the letter L or F. Never colour alone.
- Tapping a row on a phone expands it to show who voted how: faces under JA, NEIN and 👻.

### 10.4 Chat

**When it's on:** `chat: auto` turns chat on only in `remote-text` rooms. The VIP can force it on or off.

**Limits**

- Messages are at most 120 characters (the server keeps the first 120).
- One message every 3 s per player.

**Who can post**

- Ghosts can read but not post; exiled players can do neither.
- The President and Chancellor are locked during a session (D6).

**Where it shows**

- The TV shows chat under the Record (8.1); phones show it in the Chat tab.
- Chat is never read aloud.

**Storage:** state keeps the last 200 messages. The recap doesn't include chat.

---

## 11. Hidden information

| Secret                       | Who can see it                                         | When it goes public                          |
| ---------------------------- | ------------------------------------------------------ | -------------------------------------------- |
| Roles and parties            | own dossier; the Fascist team as in R2                 | `gameOver`                                   |
| Power cards                  | own dossier; the Informant gets one holder's name (V5) | `gameOver`                                   |
| Which power cards were dealt | nobody (the TV shows counts only)                      | `gameOver`                                   |
| Deck order                   | nobody; the President sees the top three during a peek | never (chaos shows one card as it's enacted) |
| President's three cards      | the President                                          | the Truth panel (§18)                        |
| Chancellor's two cards       | the Chancellor and the President                       | the Truth panel                              |
| Discards                     | nobody; the Journalist learns one President discard    | the Truth panel                              |
| Votes                        | own phone                                              | `voteReveal`                                 |
| Investigation results        | the President (possibly forged)                        | the Truth panel shows the real party         |
| Coroner results, forgeries   | the Coroner, the Forger                                | the Truth panel                              |
| An executed player's role    | nobody                                                 | `gameOver`                                   |
| Manhunt taps                 | the hunters                                            | the result                                   |

**Leak rules**

- **Secrets live only in the `controllerView` of players allowed to see them.** The TV shows none of them, and spectators get exactly the TV view.
- **Same screens for everyone.** Differences between roles must not show on a glance at a phone:
  - every dossier has the same five sections (9.2);
  - the press pass lives inside the dossier;
  - the investigation pause card is identical on every phone (9.4);
  - during a session, every phone except the government's shows the same waiting screen.
- **Same timing for everyone.** The only pause is V4's uniform 10 s. The Journalist, Coroner, Informant and Agent never cause a pause or a TV cue.
- **Cards stay hidden until enacted.** No policy identity reaches the TV view before its enactment. Deck and discard _counts_ are public (the table could count them), but their contents are not.
- **The rng stays private.** The deck is shuffled with the state's rng at `init` and at every reshuffle, and nothing about its order is ever exposed.
- **Speech.** A line that reveals something ("Hitler has been elected Chancellor") is requested only at its reveal (Part 00 P4 rule).
- **Bots** decide only from their own view (§16).
- **No undo after confirming.** A visible "undo" would leak what was chosen.
- **What can't be hidden:** how long someone takes to choose. It shows at a real table too, and it's part of the game.

---

## 12. Voice, sound and music

### 12.1 The narrator

The narrator is a radio announcer: "Good evening. This is Radio Parliament." The `reader` setting chooses the voice; the default is `george`.

**Fixed clips**, grouped by moment:

| Moment                    | Lines                                                                                                                                                                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Opening                   | "Good evening. This is Radio Parliament." · "A new parliament is seated. Check your dossiers, and keep them secret."                                                                                                                                    |
| Nomination                | "The President will now choose a Chancellor."                                                                                                                                                                                                           |
| Vote                      | "Cast your votes." · "The votes are in." · "The government is elected." · "The government has fallen." · "The country grows restless." (tracker at 2)                                                                                                   |
| Hitler zone and the check | "Three Fascist policies are now law. From now on, electing Hitler as Chancellor ends the game." (once, at the 3rd Fascist policy) · "Is the new Chancellor… Hitler?" · "The Chancellor is not Hitler." · "Hitler has been elected Chancellor."          |
| The session               | "The legislative session begins. The President and Chancellor may not speak." · "Two policies go to the Chancellor." · "A Liberal policy is enacted." · "A Fascist policy is enacted."                                                                  |
| Veto                      | "The Chancellor requests a veto." · "The veto is agreed." · "The veto is refused."                                                                                                                                                                      |
| Chaos                     | "The country is in chaos. The next policy is enacted from the top of the deck." · "Term limits are lifted."                                                                                                                                             |
| Powers                    | "The President may investigate a player." · "The President will call a special election." · "The President may look at the next three policies." · "The President must execute a player." · "…was not Hitler."                                          |
| Endings                   | "Hitler is dead. The Liberals win." · "The Liberals have saved the republic." · "Fascism has taken the country." · "The Fascists have one last chance." · "The Agent's cover is blown. The Fascists win." · "The streets have won. The Anarchist wins." |
| Timeouts                  | "Time ran out. A random choice was made."                                                                                                                                                                                                               |

**Live lines**, via `toSpeakable`. Use them when the names can be read aloud; otherwise fall back to the fixed clip shown in brackets.

- "President Ana nominates Ben." (fallback: "The President has made a nomination.")
- "Ben has been executed."
- "Cy will be the next President."

**Pronunciations** (`content/pronunciations.json`):

- "Ja" → say "yah";
- "Nein" → say "nine".

Check both in the speech lab.

**Timing:** request every line at the moment it plays. No line that contains a secret is ever prefetched.

### 12.2 Sound cues

These use existing platform cues.

| Event                     | Cue                                                    |
| ------------------------- | ------------------------------------------------------ |
| Your turn (phone)         | `phase`                                                |
| Dossiers dealt            | `card`                                                 |
| Vote cast (phone)         | `lock` (quiet)                                         |
| Vote reveal               | `reveal`                                               |
| Elected / rejected        | `cheer` (soft) / `bust`                                |
| Tracker rivet fills       | `lock`                                                 |
| Liberal / Fascist enacted | `cheer` / `bust`                                       |
| Hitler check              | silence, then `tie` (not Hitler) or `fanfare` (Hitler) |
| Chaos                     | `sweep` + `bust`                                       |
| Execution                 | `bust`                                                 |
| Game over                 | `fanfare`, then `win`                                  |

**Optional new cues (S3).** These are synthesized like the platform's own cues. Until they exist, each falls back to the cue shown.

| New cue      | Sound                              | Fallback |
| ------------ | ---------------------------------- | -------- |
| `stamp`      | a heavy rubber-stamp thud          | `lock`   |
| `gavel`      | two knocks                         | `tick`   |
| `typewriter` | a short burst of keys              | `tick`   |
| `siren`      | a rising two-tone                  | `sweep`  |
| `radio`      | a static burst before the narrator | none     |

### 12.3 Music

| Phases                                  | Bed                                 |
| --------------------------------------- | ----------------------------------- |
| `seating`                               | `lounge`                            |
| `nominate`, `claims`                    | `latenight`                         |
| `vote`, the session, `power`, `manhunt` | `pulse`                             |
| Reveals                                 | silence (the room holds its breath) |

**Optional (S3):** a bundled "noir" track (slow brushed drums and upright bass) could replace `latenight`, if the owner adds one with a licence that allows it.

---

## 13. Presence (remote play)

The manifest sets `presence: { needs: 'voice-if-remote' }`. Because of that, the lobby warns rooms without a voice call before they start (Part 00 §3.5).

| Mode           | How the game plays                                                                                                   |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| `together`     | Talk out loud. Chat is off (auto). The narrator announces the silence rule (D6). Hold-to-see protects every secret   |
| `remote-voice` | Talk on the call. Chat is off by default and can be switched on                                                      |
| `remote-text`  | The lobby notice comes first. Then chat is on (auto), claims carry the argument, and the `relaxed` pace is suggested |
| phone-only     | `PhoneStage` covers the TV moments (9.5), and the Board tab is the table                                             |

Players who can't see the TV get the stage on their phone and hear the narrator there (Part 00 P1 and P2).

---

## 14. Inputs

```ts
const SHInput = z.discriminatedUnion('type', [
  z.object({ type: z.literal('ready') }),
  z.object({ type: z.literal('nominate'), target: z.string().max(64) }),
  z.object({ type: z.literal('vote'), ja: z.boolean() }),
  z.object({ type: z.literal('ghostVote'), ja: z.boolean().nullable() }), // null = save it
  z.object({ type: z.literal('discard'), index: z.number().int().min(0).max(2) }),
  z.object({ type: z.literal('enact'), index: z.number().int().min(0).max(1) }),
  z.object({ type: z.literal('vetoRequest') }),
  z.object({ type: z.literal('vetoAnswer'), agree: z.boolean() }),
  z.object({ type: z.literal('target'), target: z.string().max(64) }), // investigate · special · execute
  z.object({ type: z.literal('peekDone') }),
  z.object({ type: z.literal('forge'), yes: z.boolean() }),
  z.object({ type: z.literal('pressPass') }),
  z.object({
    type: z.literal('claim'),
    event: z.string().max(32),
    cards: z
      .array(z.enum(['L', 'F']))
      .max(3)
      .optional(),
    party: z.enum(['L', 'F']).optional(),
    noComment: z.boolean().optional(),
  }),
  z.object({ type: z.literal('manhunt'), target: z.string().max(64) }),
  z.object({ type: z.literal('chat'), text: z.string().min(1).max(240) }),
]);
```

### Always ignored, whatever the input

- Inputs in the wrong phase.
- Inputs from spectators or exiled players.
- Inputs from ghosts, except `ghostVote` (V6).

### Per-input checks (the reducer ignores anything that fails)

| Input         | Accepted only when…                                                                                                                                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nominate`    | it's from the Presidential candidate, and the target is eligible (R6)                                                                                                                                                                  |
| `vote`        | it's from a living player. A resend replaces the earlier vote until the phase ends                                                                                                                                                     |
| `ghostVote`   | V6 is on, it's from an executed player with the vote still unused, and it's during `vote`. It can change until the phase ends; it's used only if it's still cast at the end                                                            |
| `discard`     | it's from the President, in `presDraw`. `index` points into the President's own ordered hand                                                                                                                                           |
| `enact`       | it's from the Chancellor, in `chanEnact`                                                                                                                                                                                               |
| `vetoRequest` | it's from the Chancellor, the veto is unlocked, and there's been no request yet this session                                                                                                                                           |
| `vetoAnswer`  | it's from the President, with a request pending                                                                                                                                                                                        |
| `target`      | it's from the President, and the target is valid for this power (R15, R16, R18)                                                                                                                                                        |
| `peekDone`    | it's from the President, during a peek                                                                                                                                                                                                 |
| `forge`       | it's from the Forger, with the V4 window open                                                                                                                                                                                          |
| `pressPass`   | it's from the Journalist, and V1's conditions hold                                                                                                                                                                                     |
| `claim`       | the event exists and is still open (before the next `vote`); the sender is that event's claimant; the shape fits (3 cards for `draw` and `peek`, 2 for `hand`, a party for `investigate`); and there's no earlier claim for that event |
| `manhunt`     | it's from a hunter (V8), and the target isn't on the Fascist team                                                                                                                                                                      |
| `chat`        | chat is on, the D6 lock doesn't apply, and the rate limit allows it. Empty text after trimming is dropped; only the first 120 characters are kept                                                                                      |

**The one private rejection message:** when a chat message hits the rate limit, the sender's phone says "Slow down a little." Every other rejected input is prevented by the UI in the first place, so the server silently ignores it.

---

## 15. State and views

```ts
type Party = 'L' | 'F';
type Role = 'liberal' | 'fascist' | 'hitler' | 'anarchist';
type Power = 'journalist' | 'agent' | 'coroner' | 'forger' | 'informant';
type PowerKind = 'investigate' | 'special' | 'peek' | 'execute';

type SHState = {
  phase: PhaseState;
  rng: RngState;
  presence: Presence;
  cfg: EffectiveSettings; // from resolveSettings (§6.7)
  seats: PlayerId[]; // seat order (R5)
  role: Record<PlayerId, Role>; // SECRET
  power: Record<PlayerId, Power | null>; // SECRET
  dealt: { L: number; F: number }; // public counts
  intel: Record<PlayerId, IntelEntry[]>; // SECRET, per player
  alive: PlayerId[];
  executed: PlayerId[];
  exiled: PlayerId[];
  ghostVoteLeft: PlayerId[];
  deck: Party[]; // SECRET (order)
  discards: Party[]; // SECRET (contents)
  board: { L: number; F: number };
  tracker: 0 | 1 | 2;
  chaosCount: number;
  vetoUnlocked: boolean;
  presPointer: number; // normal rotation position in seats
  special: { president: PlayerId; returnAfter: PlayerId } | null;
  lastElected: { president: PlayerId | null; chancellor: PlayerId | null };
  termLimitsCleared: boolean;
  investigated: PlayerId[];
  notHitler: PlayerId[];
  round: {
    n: number;
    president: PlayerId;
    nominee: PlayerId | null;
    votes: Record<PlayerId, boolean>; // SECRET until voteReveal
    ghostVotes: Record<PlayerId, boolean>; // SECRET until voteReveal
    elected: boolean | null;
    draw: Party[] | null; // SECRET: President
    passed: Party[] | null; // SECRET: President and Chancellor
    presDiscard: Party | null; // SECRET (the Journalist may learn it)
    vetoRequested: boolean;
    vetoAgreed: boolean | null;
    enacted: Party | null;
    power: {
      kind: PowerKind;
      target: PlayerId | null;
      forgeOpen: boolean;
      forged: boolean;
      peek: Party[] | null;
    } | null;
    lastCall: PlayerId | null;
  };
  claims: Claim[]; // public
  record: RecordRow[]; // public
  truth: TruthRow[]; // SECRET until gameOver: real hands, discards, forgeries
  chat: { by: PlayerId; text: string; at: number }[]; // the last 200
  manhunt: { hunters: PlayerId[]; taps: Record<PlayerId, PlayerId> } | null;
  winner: 'liberals' | 'fascists' | 'anarchist' | null;
  winReason: WinReason | null;
  stats: Record<PlayerId, Stats>;
  speechMs: Record<string, number>;
};
```

**Budget:** about 50 KB at 10 players with the chat full. A test fails above 96 KB.

### `tvView`

**Always**

- The phase, and the seats: names, alive / executed / exiled, plates, Next, term limits, ✓ Not Hitler, 🔎, connection state.
- The board and the tracker. The chaos count, when V7 is in effect.
- Whether the veto is unlocked.
- Deck and discard **counts**, and the power on the next Fascist slot.
- The current government or nominee.
- Claims, the Record, and chat (when on).
- The headline, and the setup line.
- The power banner and its public outcome.

**Only at the right moment**

- Before `voteReveal`: only a ✓ for who has voted. The votes themselves appear at `voteReveal`.
- The enacted card, at its reveal.
- At `gameOver`: every role, every power card, and the Truth panel.

### `controllerView(p)`

**Always**

- Everything public from `tvView` that a phone needs.
- The player's own dossier: party, role, team, intel, and power card, including whether the press pass can be used right now.

**When it applies**

- **The President:** the eligible list with reasons, the draw, the valid power targets, and the peek cards.
- **The Chancellor:** the two passed cards, and whether a veto can be requested.
- **Voters:** their own vote. Ghosts: their ghost vote status.
- **Claimants:** the claim builders for the events they can still claim.
- **The Forger:** the forge window, inside the hold area only.
- **Hunters:** the manhunt picker and the other hunters' taps.
- **Everyone:** their own result.

Spectators get exactly the TV view.

---

## 16. Bots

Bots decide from their own `controllerView` plus the public Record. They never look at anyone else's secrets. Timing uses the platform's strategies.

### 16.1 Suspicion (built from public information only)

Each bot keeps a score for every other player. It starts at 0.

| Event                                                        | Change                                                         |
| ------------------------------------------------------------ | -------------------------------------------------------------- |
| In a government that enacted a Fascist policy                | +2 (each member)                                               |
| In a government that enacted a Liberal policy                | −1 (each member)                                               |
| In a government whose claims got ⚡                          | +3 (each member)                                               |
| Claimed Fascist by an investigation                          | +3. Halve it if the claimer is more suspicious than the target |
| Voted Ja for a government that then enacted a Fascist policy | +1                                                             |

The ✓ Not Hitler badge removes a player from the bot's "might be Hitler" list, but doesn't change their score.

### 16.2 What each bot does

| Moment                 | Liberal bot                                                                                                                                                           | Fascist bot                                                                                                                                      | Hitler bot                                                             | Anarchist bot                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Nominate               | lowest suspicion (rng breaks ties)                                                                                                                                    | a teammate 40% of the time (never Hitler before 3 Fascist policies; Hitler whenever eligible after that); otherwise the least suspicious Liberal | like a Liberal                                                         | random eligible                                                             |
| Vote                   | Ja if both candidates are below the median suspicion, or the tracker is at 2. **But** Nein in the Hitler zone if the nominee is above the median and not ✓ Not Hitler | Ja if a teammate or Hitler is in the government; otherwise Ja 50% of the time. In the Hitler zone, Ja whenever Hitler is the nominee             | like a Liberal, but always Ja on its own government                    | Nein 65% of the time while the tracker is below 2; otherwise like a Liberal |
| Discard (as President) | a Fascist policy if it holds one                                                                                                                                      | in its first two sessions, 50% of the time like a Liberal. Otherwise, with a mixed hand, it discards the Liberal 70% of the time                 | like a Liberal, to build trust                                         | random                                                                      |
| Enact (as Chancellor)  | a Liberal policy if it holds one                                                                                                                                      | a Fascist policy 75% of the time                                                                                                                 | Liberal if possible until 3 Fascist policies are enacted, then Fascist | random                                                                      |
| Veto                   | requests when holding FF; as President, agrees when it passed FF                                                                                                      | never requests; refuses                                                                                                                          | like a Liberal                                                         | always requests, always agrees                                              |
| Claims                 | the truth                                                                                                                                                             | a story that makes a Fascist enactment look forced (claims FFF / FF). Fascist bots follow the same rule, so their claims agree with each other   | the truth                                                              | random                                                                      |
| Investigate            | the most suspicious eligible player; claims what it saw                                                                                                               | a Liberal; claims "Fascist" 50% of the time                                                                                                      | like a Liberal                                                         | random                                                                      |
| Execute                | the most suspicious living player                                                                                                                                     | the least suspicious Liberal (trusted Liberals are dangerous), or the player the Informant named                                                 | like a Liberal                                                         | random                                                                      |

**Special abilities**

- **Forger bot:** always forges when it can.
- **Journalist bot:** uses the press pass on the first session that enacts a Fascist policy where it wasn't President.

**In the Manhunt,** a bot taps the non-Fascist player with the lowest suspicion who has claimed an investigation or a peek. It falls back to the lowest suspicion overall, with the rng breaking ties.

**Chat** (only when chat is on): bots post occasional canned lines from `botlines.json`, like "I trust {name}." or "{name}'s claim doesn't add up.", at most one every 20 s.

**Honesty test:** a property test randomizes every secret the bot isn't allowed to see. Its decisions must not change.

---

## 17. Edge cases

| Situation                                               | What happens                                                                                                                                |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| No eligible Chancellor                                  | Can't happen while 3+ players are alive: R6's five-alive rule always leaves one. Fewer than 3 ends the game first (D8)                      |
| Fewer than 3 cards at `presDraw`                        | Can't happen: R13 reshuffles after every session and after chaos                                                                            |
| No valid investigation target                           | The power is skipped: "No one left to investigate."                                                                                         |
| Nobody votes                                            | Every living vote is Nein, so the government is rejected                                                                                    |
| Everyone idle                                           | Random nominations, rejected votes, chaos every third round. Chaos policies end the game within about 70 min at normal pace (inside 3 × 35) |
| Hitler exiled                                           | Liberals win (D7)                                                                                                                           |
| Nominee exiled during the vote                          | Back to `nominate`, same President (D7)                                                                                                     |
| President or Chancellor exiled during the session       | The timeout result applies at once (D7)                                                                                                     |
| Special-election President exiled before their turn     | The special round is skipped; the candidacy continues as R16 says                                                                           |
| Agreed veto with the tracker at 2                       | The tracker hits 3 and chaos follows (R19)                                                                                                  |
| The chaos card lands on a power slot                    | The power is ignored (R10)                                                                                                                  |
| The chaos card is the 5th Liberal or 6th Fascist policy | That side wins, unless V10 gives the win to the Anarchist                                                                                   |
| Ghost votes swing a vote                                | The tally shows them: "4 JA + 1 👻 JA · 3 NEIN"                                                                                             |
| Tie in the Manhunt                                      | No guess; the Liberals keep the win                                                                                                         |
| Every hunter has been exiled                            | No Manhunt; the Liberals keep the win                                                                                                       |
| An executed player's phone                              | Ghost view: Board, Record and their own dossier; no actions except V6                                                                       |
| Late joiner                                             | Spectator: the TV view only                                                                                                                 |
| Pause during a reveal                                   | The helper freezes it; resume continues from the same step                                                                                  |
| The VIP is executed                                     | Their VIP controls (Next, Last call, Pause) still work; they're room controls, not game actions                                             |

---

## 18. Results, awards, finale and recap

### 18.1 Results

- **Winners score 1, everyone else scores 0.** The winning side includes its dead members:
  - Liberals: every Liberal;
  - Fascists: every Fascist, plus Hitler;
  - the Anarchist wins alone.
- `winnerIds` is the winning side. Ranking follows the score.
- **Credit line.** The results screen shows it under the winner banner: "Based on Secret Hitler by Max Temkin, Mike Boxleiter & Tommy Maranges · CC BY-NC-SA 4.0".

### 18.2 Awards

Skip an award if nobody earned it. Ties share it.

| Award            | Rule                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| 🏛️ Statesman     | the Liberal who was in the most governments that enacted a Liberal policy                          |
| 🐍 Silver Tongue | the Fascist-team player elected to the most governments                                            |
| 🔎 Detective     | a President who investigated a Fascist-team player and claimed the truth (the one who did it most) |
| 🎯 Sharpshooter  | a President who executed a Fascist-team player                                                     |
| 🤡 Useful Idiot  | the Liberal who voted Ja for the most governments that then enacted a Fascist policy               |

### 18.3 The finale board (stays up on the results screen)

**1. The front page.** THE EVENING REPUBLIC, with the ending as its headline and a one-line summary: "Session 11 · Fascist policies 6–3".

**2. The Truth panel.** For each government, the real story next to the claims:

| Line          | Example                                                   |
| ------------- | --------------------------------------------------------- |
| Draw          | "Ana drew FFL · claimed FFF ✗"                            |
| Hand          | "Ben received FF · claimed FF ✓"                          |
| Investigation | "Cy investigated Dee: really Fascist · claimed Liberal ✗" |
| Forgery       | "✒️ Eli forged Ben's file (session 4)"                    |
| Other powers  | press-pass uses, Coroner results, and the Manhunt guess   |

- ✓ marks an honest claim; ✗ marks a lie.
- The panel scrolls on its own. On the VIP's phone, it can be stepped through by hand.
- This is the best moment of the game: everyone learns who lied, and when.

### 18.4 Recap

A markdown file titled "Secret Hitler · <date>", containing:

- the settings in effect;
- the seat order, roles and power cards;
- the full Parliament Record, with the Truth beside each claim;
- awards;
- the credit line.

Chat isn't included.

---

## 19. Content files

| File                          | What's in it                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| `content/narrator.json`       | every fixed line in 12.1, rendered to clips for each voice with the platform's clip pipeline |
| `content/headlines.json`      | 6–8 variants per event, picked with the rng                                                  |
| `content/roles.json`          | role and power-card names, one-line rules, dossier lines, and the About text with the credit |
| `content/botlines.json`       | 30 canned chat lines with `{name}` placeholders                                              |
| `content/pronunciations.json` | Ja → "yah" and Nein → "nine", plus anything else the speech lab flags                        |

### Headline events

`headlines.json` needs variants for each of these events:

- Liberal enacted, Fascist enacted;
- elected, rejected;
- tracker at 2;
- chaos, the Hitler zone opening, Not Hitler;
- veto, execution, special election, investigation;
- each ending.

**Examples**

- Liberal enacted: "REFORM BILL PASSES" · "PARLIAMENT BACKS THE PEOPLE"
- Fascist enacted: "EMERGENCY DECREE SIGNED" · "CRACKDOWN ORDERED"
- Rejected: "GOVERNMENT COLLAPSES" · "NO CONFIDENCE"
- Chaos: "UNREST IN THE STREETS" · "PARLIAMENT PARALYSED"
- Not Hitler: "CHANCELLOR CLEARED"

**Headline rules**

- At most 40 characters, so they fit the TV banner.
- Satire of politics only: no real events, no real people, no atrocities.

### Language

- Every UI string is in English and Spanish (brief rule 11): buttons, labels, rule text, lock reasons, fix buttons, dossier lines.
- Narrator lines and headlines count as content, so they stay in English, like the other games' content.
- **Ja** and **Nein** stay as they are in both languages. They're part of the theme.

---

## 20. What must exist on the platform

### 20.1 Reused from the Game Pack's Part 00

Reuse these if they already exist. If they don't, the "minimum" column says what to build first.

| Part 00 item                     | Used here for                                                                                           | Minimum, if Part 00 isn't built                                      |
| -------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| P9 code splitting                | this game's chunk, fonts and art load only once the game is chosen                                      | the game's client and fonts load after selection, not with the lobby |
| P8 catalog and About             | the About sheet carries the credit line                                                                 | the credit in the manifest `description`                             |
| P7 presence; P1 and P2           | the `voice-if-remote` notice; `PhoneStage` for players who can't see the TV; narration on remote phones | the lobby notice, plus `PhoneStage` for phone-only rooms             |
| P4 `toSpeakable`                 | names and pronunciations                                                                                | straight apostrophes, and the pronunciation overrides                |
| P6 `SecretCard` and `FacePicker` | the dossier, hold-to-see cards, every picker                                                            | as specified in Part 00 §6                                           |

### 20.2 New for this game

| Request | What                                                                                                                                                                         | Section    |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| **S1**  | Conditional settings: groups, hints, `requires` (player counts and other settings), lock reasons, fix buttons, presets, paused state. Generic, so other games can use it too | §6         |
| **S2**  | Game-scoped design tokens per platform theme, plus bundled display fonts loaded with the game chunk                                                                          | §7.3, §7.4 |
| **S3**  | Optional: new synthesized cues (`stamp`, `gavel`, `typewriter`, `siren`, `radio`) and an optional noir music track; every one has a fallback                                 | §12        |

---

## 21. Tests

### Rules

Every rule R1–R22 needs at least one named test. Must-haves:

- role counts and knowledge for each player count;
- the 6/11 deck;
- term limits, including the five-alive rule and chaos clearing them;
- the majority rule, with ties and missing votes;
- the Hitler check;
- the tracker and chaos, including chaos caused by a veto;
- the tracker resetting on any enactment;
- reshuffles;
- the power table for each player count;
- no repeat investigations;
- special-election return, including the twice-in-a-row case;
- peek order unchanged;
- executing Hitler;
- veto unlock, and one request per session.

### Digital

- D1: every timeout.
- D2, D3.
- D4: "Last call".
- Every D7 exile case, including Hitler.
- D8.

### Variants

- V1–V10, plus every row of the interactions table.

### Settings (S1)

- `resolveSettings` across 5–10 players × every toggle combination.
- Blocked, paused and locked states.
- Switching Undercover Agent off also switches Manhunt off.
- The Custom preset label.
- Caps and random dealing.
- A modified client can't enable a blocked toggle.

### Leaks

- Roles never appear in the TV view or in another player's view.
- Every dossier has the same structure.
- The investigation pause takes identical time whether or not a Forger was dealt, and whether the target is Liberal or Fascist.
- The press pass causes no TV cue.
- Votes stay hidden until `voteReveal`.
- Card identities never appear early.
- Spectators get exactly the TV view.
- No speech key is requested before its reveal.

### Claims

- Every conflict rule in 10.2, including peek-against-draw.
- No ⚡ on consistent claims.

### Bots

- The honesty property test (§16).
- Bots vary their play between games.

### Simulation

- 200+ seeds for every player count from 5 to 10, × every preset (Classic, Cloak & Dagger, Full Chaos), with random and idle bots.
- Every game finishes within 3 × `estimatedMinutes`.
- Check how the simulator chooses `pace`. At `relaxed`, the worst idle case is about 107 min (10 chaos policies × 3 failed rounds of 135 s + 70 s + 6 s), just over 3 × 35. If the simulator samples `relaxed`, raise `estimatedMinutes` to 40 and tell the owner.

### State

- Under 96 KB at 10 players, with the chat full.

---

## 22. Milestones and definition of done

| Milestone                | Scope                                                                                                                          | Done when                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| **M1 · Rules engine**    | The base game (Classic) with plain TV and phone screens                                                                        | Every R and D test passes, and the simulator is green                                              |
| **M2 · Parliament Noir** | Tokens, fonts, art, motion, TV and phone screens, claims, Record, conflicts, narrator, existing sound cues, chat, `PhoneStage` | Screenshots and a short screen recording of each signature moment in 7.8 are approved by the owner |
| **M3 · Variants and S1** | Power cards, toggles, presets, conditional settings, interactions                                                              | Every V and S test passes. The owner has tried each locked and paused state on a phone             |
| **M4 · Polish**          | Bots, presence modes, accessibility, performance, finale and recap, Spanish, speech lab                                        | The full definition of done below                                                                  |

### Definition of done (all milestones together)

**Spec and manifest**

- [ ] The README spec is at most 120 lines, with the fixed headings.
- [ ] The manifest is complete: icon, `howToPlay`, presence, tags, settings with S1 fields, and the credit in About.

**Phases and tests**

- [ ] Every phase ends by deadline, by all players being done, or by a VIP action. Pause works throughout.
- [ ] The contract suite passes, with all secrets declared.
- [ ] The simulator is green (§21).
- [ ] Bots pass the honesty property test.

**Screens and accessibility**

- [ ] Screenshots are approved:
  - phone at 320×568, 390×844, sideways, and at 200% text;
  - TV at 1920×1080;
  - all five themes, including High Contrast.
- [ ] Reduced motion is checked on every signature moment.
- [ ] Performance: TV at 60 fps; no animation outside transform and opacity.

**Language and sound**

- [ ] All English and Spanish UI strings are in place.
- [ ] Every narrator line and name has passed the speech lab.

**Finale and credit**

- [ ] The recap and the Truth panel are verified against a scripted game.
- [ ] The credit line shows on the About sheet, the results screen and the recap.

---

## 23. Decisions and why

**Timing and voting**

- **Missing votes count as Nein.** This keeps the table rule "a majority of players", and "no confidence" fits the theme. Idle players can't prop up a government.
- **Timeouts pick at random and say so.** The game keeps moving, and stalling never helps anyone.

**Role changes from the owner's review**

- **The Bodyguard was cut.** It was too strong.
- **The Resistance Leader was merged into the Undercover Agent.** Once nerfed to "knows one Fascist", the two were the same role.
- **The Forger:**
  - Fascist-team targets only;
  - investigations only;
  - once per game;
  - 7+ players only.

  The uniform pause hides it completely.

- **The Informant** names one card holder, never the card.

**Variant details**

- **The Anarchist wins even if executed** (but not if exiled). If their death stopped the win, a second chaos event with no winner would reveal that the Anarchist was dead.
- **The Manhunt runs even when no Agent was dealt.** Skipping it would give away the setup.

**Claims**

- **Claims are structured and final.** Like spoken words, they can't be edited, and conflicts are flagged only from public facts.

**The look**

- **Everything is original.** No real symbols, and the satire stays on politics.

**Scope**

- **5–10 players only,** the original's range.
- **No ratings or stats.** It's a party game.
