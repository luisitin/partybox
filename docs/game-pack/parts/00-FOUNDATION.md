# PartyBox Game Pack · Part 00 — Platform Foundation

*Batch 1 of 7 · written 2026-09-24 against `GAME-DESIGN-BRIEF.md` (commit f4f43d17) · read this before any game file.*

This pack adds nine games to PartyBox and the platform work they depend on. Part 00 is that platform work:
- how players find games in the lobby;
- how a game downloads only when it's picked;
- how remote players are handled;
- how typed answers are matched;
- how every spoken line is made to sound right.

The game files (Parts 01–06) assume everything here exists.

---

## 0. How to use this pack

### 0.1 Files

| Part | File | Contents | Size |
|---|---|---|---|
| 00 | `PARTYBOX-GAMES-00-FOUNDATION.md` | Platform work (this file) | — |
| 01 | `PARTYBOX-GAMES-01-IMPOSTER-HERD-MIND.md` | **Imposter** (hidden odd-one-out) · **Herd Mind** (match the majority) | medium · small |
| 02 | `PARTYBOX-GAMES-02-FAKE-OUT-WHO-SAID-IT.md` | **Fake-Out** (bluff a fake answer) · **Who Said It** (guess the author) | medium · small |
| 03 | `PARTYBOX-GAMES-03-TUNE-IN-HIVE-RANK.md` | **Tune In** (Wavelength-style dial) · **Hive Rank** (predict the group's order) | medium · small |
| 04 | `PARTYBOX-GAMES-04-ECHO-BLIND-AUCTION.md` | **Echo** (Just One-style co-op) · **Blind Auction** (bid on mystery cards) | medium · medium |
| 05 | `PARTYBOX-GAMES-05-SPY-GRID.md` | **Spy Grid** (Codenames-style teams) | large |
| 06 | `PARTYBOX-GAMES-06-NIGHTFALL.md` | **Nightfall** (Mafia/Werewolf-style hidden roles) | large |

The names are working names in the style of the existing games (Blanks, Broken Pencil, Wisecrack). The owner may rename any of them.

### 0.2 For the implementing agent

1. **The code on `main` is the truth.** This pack was written from the brief, not from the code. If anything here conflicts with the code or with a hard rule in the brief (brief §4), stop. Report the conflict with a proposed fix. Never bend a hard rule quietly.
2. **Work order:** first the F-tasks in §9 of this file, then the games in part order. One game per branch and per session.
3. **Every game ships** everything in the Definition of Done (§8).
4. **Review loop:** after each F-task and each game, post screenshots, a five-line summary and your open questions. Then wait for the owner before starting the next one.
5. **"Exists"** in this pack means the brief says the platform already has it; reuse it. **"Platform request P#"** means new platform work, listed in §10.

### 0.3 Words used in this pack

- **TV**: the `/tv` stage.
- **Phone**: a player's controller.
- **At-TV player**: can see and hear the room's TV.
- **Remote player**: can't see or hear the TV. They are joining from another place, or playing in a phone-only room.
- **Stage moment**: a phase whose job is to show something (a reveal, a scoreboard). Nobody inputs anything.
- **Secret**: anything only some phones may know. It lives only in `controllerView`, for those phones.
- **Reader**: the voice that reads lines aloud (brief §9).

---

## 1. The game picker (lobby navigation)

### 1.1 The problem

The lobby shows each game's full description. On a phone this fills the screen and scrolls badly, and this pack takes the lineup from 5 games to 14. The picker has to stay quick at 20+ games.

### 1.2 What the lobby downloads: a catalog, not the games

Phones and TVs get a small **catalog** when they connect. The server builds it at startup from every manifest:

```ts
type CatalogEntry = {
  id: string;
  name: string;
  tagline: string;          // ≤ 60 chars, translatable
  icon: string;             // one emoji (new manifest field)
  minPlayers: number;
  maxPlayers: number;
  estimatedMinutes: number;
  tags: string[];           // 1–3 from the fixed list below
  presence: 'anywhere' | 'voice-if-remote' | 'same-room';   // §3.5
  supportsBots: boolean;
  isNew: boolean;           // server-computed: addedOn is within the last 30 days
};
```

- **Budget:** at most 400 bytes per entry and 8 KB for the whole catalog.
- **Long text is not in the catalog.** It is fetched only when someone opens **About** (§1.4).
  - Request: `about(gameId, lang)` over the socket, or `GET /api/games/:id/about?lang=`.
  - It returns the description, the three how-to-play steps, and one plain-language line per setting.
  - Size: at most 2 KB. The phone caches it for the session.

**New manifest fields.** Add these to all 14 games, including the existing five:

| Field | Type | Notes |
|---|---|---|
| `icon` | string | One emoji. Bingo 🎱, Blanks 🃏, Broken Pencil ✏️, Lightning Round ⚡, Wisecrack 😂, Imposter 🕵️, Herd Mind 🐑, Fake-Out 🎭, Who Said It 🗣️, Tune In 📻, Hive Rank 🐝, Echo 🔁, Blind Auction 🔨, Spy Grid 🗂️, Nightfall 🌙 |
| `howToPlay` | `[string, string, string]` | Three steps, at most 90 chars each, translatable |
| `presence` | object | See §3.5 |
| `addedOn` | ISO date | Drives the NEW badge |

`description` stays in the manifest, but it is served only through `about`.

**Tag list.** These drive the filter chips. Reuse any existing tag that means the same thing.
- `quick` (8 minutes or less)
- `words`, `drawing`, `trivia`, `bluff`, `hidden-roles`, `teams`, `co-op`, `comedy`, `strategy`

Each game has 1–3 tags.

### 1.3 Phone picker (the VIP's phone)

Designed at 320×568. From top to bottom:

1. **Shell header** (exists).
2. **Title row:** "Pick a game" (h1) and a pill showing the player count, for example "👥 6 players" (bots included).
3. **Filter chips:** one horizontally scrolling row. Each chip is at least 44 px tall, and one chip is selected at a time:
   All · Quick · Words · Bluff · Teams · Co-op · Drawing · Trivia · Plays anywhere
4. **Game list:** compact rows.
   - **Row box:** at least 72 px tall, full width, radius 12, `--pb-surface`, 8 px gap between rows.
   - **Left:** a 48×48 icon tile (`--pb-surface-2`, emoji at 28 px).
   - **Middle, three lines:**
     - the name (h2, one line);
     - the tagline (caption, `--pb-text-muted`, one line with ellipsis);
     - a meta line (caption): `👥 3–12 · ⏱ 10 min`, then badges (`NEW`, and 🌐 / 🎧 / 📍 for presence).
   - **Right:** an **ⓘ** button, 44×44, with an accessible label such as "About Fake-Out".
   - **Taps:** tapping the row chooses the game (§1.5). Tapping ⓘ opens the About sheet (§1.4).
   - **Doesn't fit the player count:**
     - The row is dimmed to 50% opacity.
     - The meta line says why, for example "Needs 4+ · you have 3".
     - Tapping the row opens About instead of choosing.
     - If the game supports bots, About shows **Add a bot to play**, which adds one bot owned by the VIP.
   - **Presence conflict** (§3.5): the row shows a ⚠ badge, and choosing it shows the notice first.
5. **Sort order:**
   - games that fit the player count first;
   - then NEW games;
   - then A–Z.

   Games already played in this room get a small "↻ played" marker. This is room state, not game memory.
6. **No results:** show "No games match" and a **Clear filters** button.

**At 200% text size:** rows grow taller and the tagline may wrap to two lines, never more. The icon and ⓘ keep their size.

**Other phones during `selecting`:**
- They see the same list, read-only.
- Their About sheet shows **👍 Suggest** instead of **Choose**.
- Suggest sends a toast to the room, like the existing nudge ("Maya suggests Fake-Out").
- Limit: one suggestion per player every 10 s.

### 1.4 About sheet

A bottom sheet:
- at most 85% of the screen height, scrolling inside;
- closed by swiping down, tapping ✕, or tapping outside.

Contents, in order:

1. Icon, name and tagline.
2. Badge row: players, minutes, bots, presence.
3. **How to play**, as a numbered 1-2-3 list.
4. The description (at most 300 chars).
5. **Good to know:**
   - Players
   - Length
   - Bots: "Bots can fill seats" or "Humans only"
   - Where: "Plays anywhere, even with remote friends" / "Needs a voice call if anyone is remote" / "Everyone in the same room"
6. A sticky bottom bar: **Choose this game** on the VIP's phone, **👍 Suggest** on everyone else's.

**TV mirror.** While the VIP's About sheet is open, the TV shows that game big: icon, name, tagline, and the three how-to-play steps at TV body size. This uses a room-level `highlightedGameId`, set when the VIP opens About and cleared when it closes. The TV becomes the room's reading surface, so the phone can stay short.

### 1.5 After choosing

The settings screen already exists. It gets two changes:

- A sticky **Start** button at the bottom, usable right away with default settings.
- Settings collapse under **Game options (5) ▾**, closed by default. Opening it shows today's settings editor.

Choosing a game also starts the background download (§2.3).

### 1.6 TV picker

While the room is `selecting`, the TV shows a grid of game cards:
- 4 columns at 1920×1080, about 400×220 each;
- each card shows the icon, the name (h2), the tagline (caption), and the player count and minutes;
- games that don't fit the player count are dimmed, with the reason shown;
- the VIP's highlighted game gets an accent ring and the side panel from §1.4.

If the TV host bar already accepts keyboard input, arrow keys move a focus ring over the grid and Enter chooses. That way a room can be run from the TV alone.

### 1.7 Acceptance checks

- With 20 catalog entries, the phone list scrolls smoothly on a low-end Android.
- The picker is fully usable at 320×568 and at 200% text. Every control is at least 44 px, and no state is shown by colour alone.
- Opening About downloads no game code. Check the network log in a test.
- Every picker string exists in English and Spanish.

---

## 2. Download a game only when it's picked

### 2.1 Goal

Opening the join page downloads only:
- the shell;
- the lobby;
- the shared SDK UI;
- the catalog.

Each game's parts arrive later:
- **Code** downloads only after the VIP chooses the game.
- **Content** never downloads to phones at all.
- **Audio** downloads the first time it plays.

The host PC serves static files and small JSON views, and does no per-phone work.

### 2.2 Code splitting

Each game's client module becomes its own chunk, loaded through one registry:

```ts
// Client registry. Put it where the shell resolves games today.
export const gameLoaders: Record<string, () => Promise<GameClientModule>> = {
  bingo: () => import('@games/bingo/client'),
  blanks: () => import('@games/blanks/client'),
  // one line per game; `pnpm new-game` appends it
};
```

- **Only the registry imports game client code.** Enforce this two ways:
  - a lint rule (`no-restricted-imports` on `games/*/client` outside the registry);
  - a build check that reads Vite's `manifest.json` and fails if any game file lands in the entry chunk.
- **Preferred split:** give each game a phone entry and a TV entry, so phones never download TV-only code.
  - Phone entry: controller, `PhoneStage`, `PhoneSettings`, strings.
  - TV entry: stage components, strings.
  - If this fights the existing client module contract, one chunk per game is acceptable.
- **Existing games:** move the five existing games to the registry in the same change. While doing so, fix I-752 (content in the client bundle) for them.
- **Budget:**
  - After the move, measure each existing game's phone chunk (gzip). The largest one sets the budget, and new games stay under it.
  - The entry chunk must not grow when a game is added.

### 2.3 When downloads happen

| Moment | TV | Phones | Host |
|---|---|---|---|
| Lobby / `selecting` | catalog | catalog | nothing new |
| Someone opens About | nothing | `about` text only (≤ 2 KB) | serves `about` |
| VIP chooses a game (settings screen) | starts loading that game's TV chunk | start loading the phone chunk in the background | may read the game's packs from disk |
| VIP taps Start | "Getting the game ready" card (exists) until the chunk is in | same | runs `init`, pushes views |
| Late joiner, or a reload mid-game | — | loads the chunk, then renders the latest view | — |
| Play again | already loaded | already loaded | — |

No new message is needed. Clients already receive room state, so they start the background load when the room's selected game changes.

**Slow or failed downloads:**
- Retry 3 times, after 1 s, 3 s and 6 s.
- Then show "Couldn't load the game. Tap to retry." on that phone.
- The engine never waits for downloads. Views are pushed in full, so a late phone catches up the moment it renders, and deadlines keep the room moving meanwhile.

### 2.4 Caching

- **Chunks** have content hashes. Serve them with `Cache-Control: public, max-age=31536000, immutable`, so a phone that played Fake-Out last week loads it from its own cache.
- **`index.html` and the catalog:** serve with `no-cache`.
- **Audio** (Bingo clips, music MP3s, new fixed clips, generated speech WAVs) is fetched by URL when first played. It is never bundled into JavaScript.
- **Speech WAVs** are `immutable` too, because their keys are content hashes (§5.6).
- **No service worker.** On a LAN, stale-cache bugs cost more than a service worker saves.

### 2.5 Content stays on the host

- **Packs live on the host.** `init` uses the state's PRNG to draw exactly what this game needs: rounds × items per round, plus a small spare pool for rerolls. Only those items go into state. The rest of the pack never enters state or any view.
- **Views carry only the current item.** Secret fields (the answer, the secret word, a role) go only into the `controllerView` of phones allowed to see them.
- **Lint:** forbid imports of `content/**` from `client/**`.
- **How packs reach `init`:** follow the existing games' pattern. If the server imports packs directly, that's fine: all packs for all 14 games together use far under 10 MB of host RAM. The download rule is about phones.

### 2.6 Keeping the PC light

Plan for the worst case: 12 rooms × 16 phones.

- **Views:** target at most 4 KB each, pushed only when something changes (brief rule 3).
- **State:** at most 256 KB (brief rule 2). Each game file states its size at 16 players.
- **Speech:**
  - Render one line at a time per voice.
  - Deduplicate by key.
  - Cap the queue at 64.
  - Games already fall back after 12 s.
  - Games prefetch the next round's readings during quiet phases (§5.7), so the queue drains while people type.
- **Nothing else runs on the host:** no images, no per-phone rendering, no background jobs per room.

---

## 3. Where is everyone? Together, remote and mixed rooms

### 3.1 The problem

Some parties share one TV. Others have friends joining from home, who can't see or hear the TV and may or may not be on a voice call (Discord, a phone call). Each game needs to know which situation it's in, so features that need eyes on the TV, or talking, can adapt or switch off.

Getting remote phones to reach the host at all is the owner's network setup and out of scope here. That means a VPN such as Tailscale, or port forwarding. Games never add internet calls.

### 3.2 Room setting: "Where is everyone?"

The VIP sets this room switch in the lobby, next to Phone only. It can't change mid-game.

| Value | Label on the phone | Meaning |
|---|---|---|
| `together` | "All in one room" | Everyone sees the TV and can talk. Default. |
| `remote-voice` | "Some remote, on a call" | At least one remote player; everyone can hear each other on a call. |
| `remote-text` | "Some remote, no call" | At least one remote player; PartyBox is the only shared channel. |

Phone-only rooms (exists) combine with any of these:
- phone-only + `together` is a couch with no TV;
- phone-only + `remote-voice` is everyone at home on a call.

### 3.3 Per phone: "I can see the TV"

- **Where:** a toggle in each phone's 🎨 sheet, remembered on the phone.
- **Default:**
  - On, unless the phone's address is outside the private LAN ranges (10.x, 172.16–31.x, 192.168.x). The socket knows each phone's address.
  - Phones outside those ranges default to off. VPN addresses such as Tailscale's 100.x count as outside, so remote friends start as remote automatically.
- **Check with the VIP:** if any phone is set to off while the room is `together`, the VIP gets a toast: "Maya can't see the TV. Are you on a call?"
  - **[On a call]** switches the room to `remote-voice`.
  - **[No call]** switches the room to `remote-text`.
- **Changing it mid-game:**
  - The toggle can change at any time, but the game only gets a snapshot at start (§3.4).
  - A mid-game change affects only the shell, which decides whether that phone shows the stage.

### 3.4 What the game sees

Games stay pure, and they still never learn who the VIP is. They do learn presence, fixed at start:

```ts
ctx.presence = { mode: 'together' | 'remote-voice' | 'remote-text', phoneOnly: boolean };
player.canSeeTv: boolean;   // on every player in ctx.players
```

- **Preferred:** add these to the `init` context.
- **Fallback:** if changing the context type is hard, pass them as a reserved read-only setting, `__presence`.

Either way they are part of the seeded inputs, so determinism holds. A game uses them only to switch features on or off; each game file has a table. A game never changes scoring mid-game.

### 3.5 Manifest `presence` and the lobby notice

```ts
presence: {
  needs: 'anywhere' | 'voice-if-remote' | 'same-room';
  note?: string;   // one translatable sentence for the notice
};
```

| `needs` | Badge | Notice when the VIP chooses it |
|---|---|---|
| `anywhere` | 🌐 Plays anywhere | None. |
| `voice-if-remote` | 🎧 Needs a call if anyone's remote | Only if the room is `remote-text`. Text: "This game needs talking. Remote players should join a voice call." Buttons: **[We're on a call, play]** (switches the room to `remote-voice`) and **[Pick another]**. |
| `same-room` | 📍 Same room only | Only if any player can't see the TV. Text: "Everyone needs to be in the same room for this one." Buttons: **[Play anyway]** and **[Pick another]**. Play anyway is allowed, and the recap notes it. |

No game in this pack needs `same-room`. The value exists for future games such as charades or physical challenges.

### 3.6 Remote phones get the stage (Platform requests P1, P2)

**P1: a per-player stage.**
- Today, phone-only rooms fork the TV's moments to every phone through `PhoneStage` and `phoneStagePhases`.
- Make that fork work per player: a phone whose player has `canSeeTv === false` gets it, even when the room has a TV.
- At-TV phones keep the normal controller.
- Add a `useCanSeeTv()` hook alongside `usePhoneOnly()`, so the copy never says "look at the TV" to someone who can't.

**P2: sound on remote phones.**
- Today, only phone-only rooms can play readings and `clip`s on phones.
- Let remote phones play them too, so remote players hear the reader.
- At-TV phones stay silent, as they are now.

### 3.7 The rule that makes remote play easy

**Every input phase is self-sufficient on the phone.**
- Whatever a player needs in order to decide (the prompt, the clue, the options, the grid, the dial's two ends) is in their `controllerView`.
- The TV adds drama, never information someone needs to act.
- With this rule, remote players can play every input phase with no extra work. Only stage moments need `PhoneStage`.

**Every spoken line is also shown as text**, both on the TV and in `PhoneStage`, so muted and remote players never miss it.

### 3.8 Presence in this pack (details in each game file)

| Game | `needs` | All in one room | Remote, on a call | Remote, no call |
|---|---|---|---|---|
| Imposter | anywhere | optional talk timer before the vote | same | typed clues only; a second clue round replaces the talk |
| Herd Mind | anywhere | — | — | — |
| Fake-Out | anywhere | — | — | — |
| Who Said It | anywhere | — | — | — |
| Tune In | anywhere | optional Huddle: one shared dial the group agrees on | same | individual dials only |
| Hive Rank | anywhere | — | — | — |
| Echo | anywhere | — | — | — |
| Blind Auction | anywhere | optional Live mode: open rising bids with a going-once clock | sealed bids only (network lag makes live bidding unfair) | sealed bids only |
| Spy Grid | anywhere | teams talk it over | teams talk on the call | team picks by majority tap |
| Nightfall | voice-if-remote | open discussion | discussion on the call | allowed after the notice, with typed accusations |

---

## 4. Typed answers: the shared matcher

### 4.1 Who uses it

| Game | Uses the matcher for |
|---|---|
| Imposter | clue legality; the imposter's last-chance guess |
| Herd Mind | free-text mode |
| Fake-Out | a lie too close to the truth; merging duplicate lies |
| Echo | cancelling duplicate clues; clue legality; checking the guess |
| Spy Grid | clue legality |

**Platform request P3:** pure functions in `@partybox/game-sdk/match`. They must be deterministic and must not use locale APIs whose output can differ between machines.

### 4.2 Content format for anything a player might type

Every answer or secret word ships with its variants. Aim for **six or more accepted forms** wherever they honestly exist.

```json
{
  "id": "animals-017",
  "answer": "penguin",
  "accept": ["penguins", "pengiun", "penquin", "pinguin", "penguine", "emperor penguin"],
  "reject": ["puffin", "pelican"],
  "family": ["pengu"]
}
```

| Field | Meaning | Examples |
|---|---|---|
| `answer` | The display form | `penguin` |
| `accept` | Counts as the same answer | plurals; common misspellings; US/UK spellings (color/colour); abbreviations (TV/television); with or without spaces and hyphens (ice cream/icecream); true synonyms for this item (sofa/couch); brand vs generic where people really say both (Band-Aid/bandage) |
| `reject` | Looks close but is wrong; blocks fuzzy matches | `cat` when the answer is car; `puffin` for penguin |
| `family` | Word games only: roots that give the secret away as a clue | sunflower → `sun`, `flower` |

**Rules for content writers:**
- Everything is lowercase.
- No two entries may be equal after normalization. The pack test dedupes and fails on a clash.
- Common words get six or more entries. The test warns under three.

### 4.3 `normalize(text, lang)`

Apply these steps in order:

1. Unicode NFKD, then drop combining marks (é → e, ñ → n, ü → u).
2. Lowercase.
3. Remove apostrophes and quotes of every kind (' ’ ‘ ʼ ´ ` " “ ”). For example "don't" → "dont", and "O'Neill" → "oneill".
4. Replace `&` with " and " (" y " in Spanish), and `+` with " plus ".
5. Turn hyphens, underscores, slashes, dots and commas into spaces. Remove every other symbol and emoji.
6. Turn number words up to ninety-nine into digits ("twenty-one" → "21"), in English and Spanish.
7. Collapse runs of spaces, and trim.
8. Drop one leading article:
   - English: `the`, `a`, `an`
   - Spanish: `el`, `la`, `los`, `las`, `un`, `una`, `unos`, `unas`

It returns two forms:
- `norm`, for example "ice cream";
- `compact`, the same without spaces, for example "icecream".

### 4.4 `stem(word, lang)`

Light and rule-based, applied per word, with no dictionary. Multi-word text stems each word.

**English:**
- `ies` → `y` (berries → berry)
- `ves` → `f`, when at least 3 letters remain (wolves → wolf)
- drop `es` after s, x, z, ch or sh (boxes → box)
- drop a final `s`, but not after `ss`, `us` or `is`

**Spanish:**
- `ces` → `z` (luces → luz)
- drop `es` after a consonant
- drop a final `s`

### 4.5 `matchAnswer(input, item)` → `'exact' | 'stem' | 'fuzzy' | 'none'`

Check in this order and stop at the first hit:

1. `compact(input)` equals the compact form of a `reject` entry → **none**.
2. It equals the compact `answer` or any compact `accept` → **exact**.
3. Its stems equal the stems of the answer or of any accept → **stem**.
4. The Damerau–Levenshtein distance between compact forms is within the allowance → **fuzzy**. The allowance depends on the target's length:

   | Target length | Edits allowed |
   |---|---|
   | up to 4 letters | 0 |
   | 5–7 | 1 |
   | 8–11 | 2 |
   | 12 or more | 3 |

5. Otherwise → **none**.

Each game sets the level it accepts. Guesses usually accept `fuzzy`.

### 4.6 `sameAnswer(a, b)`: one player's text against another's

Used to:
- merge duplicate lies (Fake-Out);
- cancel duplicate clues (Echo);
- group free-text answers (Herd Mind).

Two texts count as the same if any of these holds:
- their compact forms are equal;
- their stems are equal;
- both are at least 6 letters long and they are one edit apart.

### 4.7 `isLegalClue(clue, secret, opts)` → `{ ok: true } | { ok: false, reason }`

| Reason | Rule | Player sees |
|---|---|---|
| `empty` | nothing left after normalization | "Type a clue first." |
| `too-long` | longer than `opts.maxChars` (default 20) | "Keep it under 20 letters." |
| `not-one-word` | a space remains after normalization, when `opts.oneWord` is set | "One word only." |
| `is-secret` | `matchAnswer(clue, secret)` is `stem` or better | "That's the word! Try another." |
| `contains-secret` | the compact clue contains the compact secret or a `family` root of 3+ letters; or the compact secret contains a clue of 4+ letters | "Too close to the word. Try another." |

- **On the phone:** the phone runs the same check as the player types, for instant feedback.
- **On the server:** the server re-checks and rejects with the `rejected` haptic.

**Never run a secret-based check for a player who doesn't know the secret.** The error message itself would tell them their clue is close. In Imposter, the imposter's clue is never checked against the word.

### 4.8 The VIP's "That counts" override

1. When a guess is judged below the game's bar, the reveal shows what was typed.
2. The VIP's phone shows **✓ That counts** until the VIP taps Next. This is a VIP-stamped input, like Broken Pencil's veto.
3. When it arrives, the reducer re-scores, and the TV tags the answer "Counted by the VIP".

### 4.9 Tests

- **Unit tests:** table-driven, with 60+ cases in English and Spanish. Cover:
  - apostrophes and accents;
  - plurals and articles;
  - number words and compound words;
  - rejects;
  - each illegal-clue reason.
- **Pack test:**
  - normalize every entry and fail on duplicates;
  - fail if any `accept` entry doesn't come back as `exact`.

---

## 5. Voices and pronunciation

### 5.1 What exists (reuse it)

- **Voices:**
  - `george`, `fable`, `jessica` and `sky`: Kokoro, running on the host;
  - `original`: Windows' Zira;
  - `none`.
- **Fixed lines** are recorded clips, played with `clip()`.
- **Lines made during play** come from `speech(state)` as `{ key, voice, parts }`:
  - The host renders each key once and serves it at `/api/speech/<key>.wav`.
  - It sends a `speech` event with the clip's length, so the game can pace itself to the voice.
  - The game waits at most 12 s, then falls back to reading time.
- **Never use `speechSynthesis`.**
- **A missing voice never stalls the room.**

### 5.2 The rule: every spoken line goes through `toSpeakable`

**Platform request P4:** a pure function `toSpeakable(text, { voice, lang, overrides })` that returns `parts[]`.
- The display text never changes; only what the voice receives does.
- It runs on pack content and on player-written text.

### 5.3 Rewrite rules (English), in order

1. **Straighten apostrophes and quotes.** Turn ’ ‘ ʼ ´ ` into `'`, and remove “ ”. Curly apostrophes are the most common cause of mangled words.
2. **Keep contractions.** This fixed list stays as written: don't, can't, won't, isn't, it's, I'm, I'll, I'd, I've, you're, we're, they're, they've, let's, that's, what's, who's, where's, there's, here's, he's, she's, o'clock, ma'am, y'all.
3. **Respell possessives as plurals.** They sound identical, and every voice reads plurals more reliably.
   - `Norway's` → `Norways`
   - `players'` → `players`
   - `the 1990's` → `the 1990s`
   - Words ending in s, x, z, ch or sh add `es`: `James's` → `Jameses`, `Max's` → `Maxes`, `Chris's` → `Chrises`.
   - Anything that still sounds wrong in the speech lab (§5.9) gets an override.
4. **Numbers to words.**
   - Four-digit years from 1100 to 2099 → "nineteen eighty-seven" (2000–2009 → "two thousand seven").
   - Decades: `1990s` → "nineteen nineties"; `'90s` → "nineties".
   - Other integers → words.
   - `3.5` → "three point five"; `21st` → "twenty-first".
   - `%` → "percent".
   - `$5` → "five dollars", and `$1.50` → "one dollar fifty". Do £ and € the same way.
   - `10–20` → "ten to twenty"; `7:30` → "seven thirty".
   - `1/2` → "one half"; `3/4` → "three quarters".
5. **Symbols.**
   - `&` → "and"; `+` → "plus"; `@` → "at"; `#1` → "number one"; `=` → "equals"
   - `/` between words → "or"
   - Remove any other symbol.
6. **Abbreviations.**
   - Dr. → Doctor; Mr. → Mister; Mrs. → Missus; Ms. → Miz
   - St. → Saint before a capitalised name, otherwise Street
   - vs. → versus; etc. → et cetera; e.g. → for example; i.e. → that is
   - No. before a digit → number
7. **Shouting.** If more than half the letters in a player's line are capitals, lowercase the line, keeping the acronyms listed in rule 8. Otherwise "OMG THAT'S SO FUNNY" gets spelled out letter by letter.
8. **Acronyms.**
   - First remove dots (U.S.A. → USA).
   - Then spell out runs of 2–5 capital letters with spaces (FBI → "F B I").
   - Exception, the say-as-word list: NASA, NATO, UNICEF, FIFA, IKEA, SCUBA, LASER, RADAR, NASCAR.
9. **Blanks.** Two or more underscores → the word "blank".
10. **Punctuation for pacing.**
    - `…` and `...` → a comma
    - an em or en dash between words → a comma
    - parentheses → commas
    - `!!!` → `!`, and `?!` → `?`
11. **Emoji and stray symbols** → removed. The screen still shows them.
12. **Stretched words** in player text: three or more repeated letters collapse to two ("sooooo" → "soo").
13. **Length cap** for player text: 140 characters, cut at a word boundary.

**Spanish:** Spanish content, if added later, gets its own rule table. The four Kokoro voices listed are English, so for now all readings are in English.

### 5.4 Overrides

- **Two lists:** a global one in the SDK (`speech/overrides.en.json`) and a per-game one in `content/pronunciations.json`. The game's list wins.
- **Entry format:**
  - Plain respelling: `"Worcestershire": { "say": "Wuss-ter-sher" }`
  - With Kokoro phonemes: `{ "phonemes": "…", "say": "…" }`
  - `say` is required even when `phonemes` is given, because Zira can't read Kokoro phonemes.
- **Matching:** whole words, case-insensitive. Overrides apply after rule 1 and before rules 2–13.
- **Per-part fallback:** if the speech pipeline can't yet fall back per part, add it. A part is either `{ text }` or `{ phonemes, text }`, and each voice uses what it supports.

### 5.5 Player names

- Each game file says whether it reads names aloud. Names go through `toSpeakable`.
- **Platform request P5 (optional):** a per-phone "Say my name as" field in the 🎨 sheet (at most 24 characters), so "xX_Slayer_Xx" can be read as "Slayer".
- If a name has no vowels, or is mostly digits and symbols after cleaning, the reader skips it.

### 5.6 Keys and caching

- **Key:** the game id plus a hash of `voice + '|' + final speakable text`, for example `fakeout-3f9a1c`.
- The same line hits the cache in any room, on any night.
- The WAV route is immutable.

### 5.7 Render a round ahead

- While this round is being typed or voted, `speech(state)` lists the next round's reading. Kokoro then works during quiet time, so reveals never wait.
- Store the returned lengths in state (`speechMs[key]`).
- Keep at most 10 pending keys.
- **A key never appears in any view before its line plays.**
- **Secret content is never read before its reveal**, for example the imposter's word or the Fake-Out truth.

### 5.8 Fixed clips

1. Each game file lists its fixed lines ("Going once…", "Night falls.").
2. Generate them in every voice with the pipeline that made Bingo's calls: trim the silence and match Bingo's loudness.
3. Store the WAVs in the game's folder, and play them with `clip()`.
4. They load on first play, not with the game's chunk.

### 5.9 Speech lab (dev tool)

Route: `/dev/speech-lab?game=<id>&voice=<voice>`.

- **The list:** every read-aloud line in the game's packs, shown after `toSpeakable`, each with a ▶ button. The host renders the audio.
- **Try box:** type any text to hear it.
- **🚩 Sounds wrong:** appends `{ gameId, itemId, voice, text }` to `dev/speech-flags.json` on the host.
- **Process:** the owner listens once per new pack, and the agent fixes each flag with an override.
- Local only.

### 5.10 Default reader per new game

The defaults vary so the games feel different. Each game has a `reader` select setting listing every voice, plus `none`.

| Game | Default | Reads |
|---|---|---|
| Imposter | george | the category; each clue at the reveal |
| Herd Mind | jessica | the prompt |
| Fake-Out | fable | the question; each answer at the reveal |
| Who Said It | sky | each answer before the guessing |
| Tune In | sky | the dial's two ends and the clue |
| Hive Rank | jessica | the ranking question |
| Echo | george | the clues that survive |
| Blind Auction | george | auctioneer lines (fixed clips) |
| Spy Grid | fable | each clue ("Ocean, three") |
| Nightfall | fable | the narrator (fixed clips plus live lines) |

---

## 6. Shared components (Platform request P6)

Build each component once, in `@partybox/game-sdk/ui`, when the first game needs it. Every component:
- uses tokens only;
- respects reduced motion;
- has tap targets of at least 44 px;
- never relies on colour alone.

**`SecretCard`** (phone). Used by Imposter, Echo, Spy Grid and Nightfall.
- Shows a card back: "Hold to see your word".
- Press and hold flips it with the `flip` animation; releasing flips it back.
- A per-phone accessibility setting switches to tap-to-toggle, which auto-hides after 5 s.
- Purpose: stops shoulder-surfing in same-room play.

**`FacePicker`** (phone). Used by Imposter, Who Said It and Nightfall.
- A two-column grid of avatars with names.
- Options: exclude yourself, allow "Skip", disable some faces with a reason shown.
- The selected face gets a ring and a ✓. The player confirms with the sticky button.
- If `VoteList` can already do all of this, extend it instead.

**`Dial` + `DialInput`** (TV + phone). Used by Tune In.
- **TV (`Dial`):**
  - a semicircle gauge (SVG) with labels at both ends;
  - a target band, hidden until the reveal;
  - player faces that `land` on the gauge at the reveal.
- **Phone (`DialInput`):**
  - a horizontal slider from 0 to 100, with the two end labels;
  - a 48 px thumb, and tapping the track jumps the thumb there;
  - − / + buttons for fine moves;
  - on Android, a haptic tick every 10.

**`OrderPicker`** (phone). Used by Hive Rank.
- Tap items in order to fill slots 1 to N.
- Tap a placed item to take it back. A Reset button clears everything.
- Five items must fit on 320×568 without scrolling.

**`WordGrid`** (TV + phone). Used by Spy Grid; full spec in Part 05.

**`BidPad`** (phone). Used by Blind Auction.
- A big number with − / + steppers.
- Quick chips: +5, +10, +25, All in.
- Shows the coins left, and a confirm button.

**`TeamBanner`** (TV + phone). Used by Spy Grid and Tune In's team mode.
- Two teams, always shown with shape, name and colour together:
  - **▲ Sun** uses `--pb-accent`;
  - **● Moon** uses `--pb-info`.

**New helpers:**
- `teamsFromSeed(players, rng)`: even team sizes, with bots spread across teams.
- `majorityPick(votes, rng)`: seeded tie-break.
- `rotation(order, round)`.

Reuse the existing `speedPoints`, the rank helper and the results builder.

---

## 7. Rules every game in this pack follows

1. **Type, don't talk,** by default. Talking features are extras that presence switches on (§3).
2. **Input phases are self-sufficient on the phone** (§3.7).
3. **The TV reveals; the phone never spoils.**
   - During reveals, at-TV phones show "👀 Watch the TV".
   - A player's own result appears on their phone only after the TV has shown it. Gate it on the view's reveal step.
4. **Every phase can exit** by deadline, by all connected players being done, or by VIP skip. Where the VIP paces the show, the game's own Next button comes through `skip()`.
5. **Theme-agnostic:** tokens only. Player colours repeat after eight players, so a colour always travels with its face.
6. **Sounds:**
   - The `phase` cue means "pick up your phone".
   - The `reveal`, `card`, `tally` and `wager` cues mean "look at the TV".
   - Phones play only in-hand cues.
7. **Music:** each game file names its beds per phase. Results screens are silent.
8. **Content:**
   - A family pack by default, and a spicy pack behind a `spicy` switch.
   - Theme-neutral wording, and every item has a stable `id`.
   - UI strings in English and Spanish; content stays in English.
9. **Bots decide from their own phone's view.**
   - Implement `bot.sampleInput` by computing `controllerView(state, botId)` first and choosing only from that. This keeps bots honest by construction.
   - Creative inputs come from the content banks each game file lists.
10. **State holds only what's drawn** (§2.5). Each game file gives its size at 16 players.
11. **Awards:**
    - Each game defines 3–5 awards, built with the results builder.
    - Every player who started the game appears in the results.
12. **Recaps:** each game file says what its recap saves.
13. **Errors never leak secrets** (§4.7).
14. **Size:** most games land at 400–800 lines of TypeScript plus content. The large ones say so.

---

## 8. Definition of done (every game)

**Spec and manifest**
- [ ] README spec of at most 120 lines, with the fixed headings: Overview, Players, Phases, Inputs, Scoring, Edge cases, Settings, Content.
- [ ] Manifest complete, including `icon`, `howToPlay`, `presence`, `addedOn`, tags and settings.

**Phases and tests**
- [ ] Every phase exits by deadline, by all-done, and by VIP skip. Pause and resume go through the helper.
- [ ] Contract suite passes, and declared secrets never appear in the wrong view.
- [ ] The bot is honest and varied.
- [ ] Simulator is green on 200+ seeds, with random bots and with idle bots.
- [ ] The game finishes within 3× `estimatedMinutes`.
- [ ] Tests cover:
  - one connected player;
  - a drop mid-phase;
  - a late joiner;
  - everyone idle;
  - ties.

**Presence, voice and text**
- [ ] `PhoneStage` for every stage moment, checked with `canSeeTv = false` in a room that has a TV.
- [ ] The game's presence table is implemented and tested in each mode.
- [ ] The matcher and `toSpeakable` are used wherever the game file says.
- [ ] A speech-lab pass is done and its flags are fixed.
- [ ] English and Spanish strings. No hard-coded colours, sizes or durations.

**Screenshots and budgets**
- [ ] Phone screenshots at 320×568, 390×844, sideways, and at 200% text.
- [ ] TV screenshots at 1920×1080.
- [ ] All five themes.
- [ ] Game code is not in the entry chunk, and the phone chunk is under the budget (§2.2).
- [ ] A test logs the 16-player state size, and it is under the game file's budget.
- [ ] Recap, if the game file lists one.

---

## 9. Work order (F-tasks)

| # | Task | Needed before |
|---|---|---|
| F1 | Code-split games: registry, lint rule and build check. Move the five existing games, and fix I-752 for them. | everything |
| F2 | Catalog and `about`; new manifest fields for the five existing games | F3 |
| F3 | Phone picker, About sheet, TV grid and mirror, collapsed settings with the Start button | — |
| F4 | Presence: room setting; per-phone toggle with the address-based default; `init` context; per-player stage (P1); readings on remote phones (P2); lobby notices | Imposter, Spy Grid, Nightfall |
| F5 | `match` module and its tests | Imposter, Herd Mind, Fake-Out, Echo, Spy Grid |
| F6 | `toSpeakable`, override lists, per-part fallback, speech lab | every game with a reader |
| F7 | SDK components, each built when its first game needs it | per game |

F1–F3 are worth shipping first, on their own. They fix the cramped phone picker before any new game exists.

---

## 10. Platform requests (summary)

| # | Request | Section |
|---|---|---|
| P1 | Per-player phone stage for players who can't see the TV; `useCanSeeTv()` | §3.6 |
| P2 | Readings and clips on remote phones | §3.6 |
| P3 | `match` module: `normalize`, `stem`, `matchAnswer`, `sameAnswer`, `isLegalClue` | §4 |
| P4 | `toSpeakable`, override lists, per-part phoneme fallback, speech lab | §5 |
| P5 | "Say my name as" (optional) | §5.5 |
| P6 | SDK components | §6 |
| P7 | Presence: room setting, per-phone toggle, `init` context, manifest field, notices | §3 |
| P8 | Catalog, `about`, new manifest fields, picker | §1 |
| P9 | Game code splitting and background preload | §2 |
| P10 | *Parked:* shared drawing pad, lifted from Broken Pencil | Appendix |
| P11 | *Parked:* HTTPS on the LAN | Appendix |

---

## Appendix: parked ideas

**Saboteur Sketch**
- **The game:** one player draws a word while a secret saboteur adds strokes. Everyone guesses the word and the saboteur.
- **Needs:**
  - P10;
  - a stroke budget for two artists that fits inside 256 KB of state.
- **When:** design it after Broken Pencil's drawing pad moves into the SDK.

**Motion games** (steady hand, shake race)
- **The blocker:**
  - Browsers only give tilt and motion data to secure (HTTPS) pages.
  - iPhones also need a permission tap.
- **Needs:** P11, a local certificate for the host (for example, made with mkcert) that every phone trusts. That's real friction for guests.
- **When:** park this until the owner wants HTTPS for other reasons.
