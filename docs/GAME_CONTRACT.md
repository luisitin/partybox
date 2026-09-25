# The game contract

Source of truth: `packages/shared/src/contract.ts` (types + zod schemas). This page explains it.
A game is a **pure, deterministic state machine**. The engine owns time, seeds, players and networking;
the game owns its state, phase transitions, views and scoring.

## `GameDefinition<S, I>` — what `games/<id>/server/index.ts` exports as `game`

```ts
// S = your state, I = your input union; TV / CV = your view interfaces (default: the bare envelopes).
export interface GameDefinition<
  S extends GameStateBase,
  I,
  TV extends TvView = TvView,
  CV extends ControllerView = ControllerView,
> {
  manifest: GameManifest; // must deep-equal games/<id>/manifest.json (contract test)
  phases: readonly string[]; // every phase id, in typical order; each needs fixtures/<id>.json
  inputSchema: z.ZodType<I>; // validated at the socket BEFORE reduce sees the input
  init(ctx: InitContext): S; // { players, settings, seed, now, presence? } — presence (ADR-047): { mode: 'together' | 'remote-voice' | 'remote-text', phoneOnly }, fixed for the game; absent = together with a TV
  reduce(state: S, event: GameEvent<I>): S; // PURE + TOTAL — never throws
  tvView(state: S): TV; // JSON; identical for every TV
  controllerView(state: S, playerId: string): CV; // JSON; per player
  results(state: S): GameResults | null; // non-null once the game is over
  bot: { sampleInput(state: S, playerId: string, rng: Rng): I | null }; // REQUIRED
}
```

### State base (`GameStateBase`)

```ts
interface GameStateBase {
  phase: { id: string; startedAt: number; deadline: number | null; paused?: { at: number } };
  rng: RngState; // { seed, step } — pure PRNG state lives IN the state
  players: Record<string, PlayerInfo>; // { id, name, avatarId, connected, bot?, canSeeTv? } — who is playing; bot: true for a bot (ADR-028) so a game can act for it where a person taps (Bingo's ready-up); avatarId is a face id or `photo:<id>` for a photo avatar (ADR-037) — pass it to `Avatar` as is; canSeeTv (ADR-047) is whether the player could see the TV at start (bots always) — switch features with it and with ctx.presence, never branch view content on it (a remote phone needs every input phase on its own screen)
}
```

- Put everything else your game needs next to these (`round`, `answers`, `scores`, …). Keep it JSON.
- `rng`: draw with the game-sdk helpers, e.g. `const [value, rng] = nextFloat(state.rng)`, then store `rng`.
  Never `Math.random()`.

### Events (`GameEvent<I>`)

```ts
type GameEvent<I> =
  | { type: 'input'; now: number; playerId: string; input: I; vip?: boolean } // schema-valid input; `vip` = sent by the VIP (ADR-042)
  | { type: 'timer'; now: number; phaseId: string; startedAt: number } // once per deadline (ADR-033)
  | { type: 'player'; now: number; playerId: string; connected: boolean; gone?: 'left' | 'kicked' } // (re)connect / leave; `gone` = for good (ADR-046)
  | { type: 'vip'; now: number; action: 'skip' | 'pause' | 'resume' | 'end' }
  | { type: 'speech'; now: number; key: string; ms: number }; // a reading you asked for is ready: its length, or -1 (ADR-045)
```

`reduce` must handle every event in every phase. A timer fires once per phase instance — unless
the reducer answers it by staying in the phase with a _later_ `deadline`, which is a second beat
and fires too (ADR-033; Bingo scores a win at the TV's verdict, then waits for the room). Ignoring
a timer, or a pause shifting the deadline, never re-arms it. The usual shape:

```ts
// server/index.ts owns the phase ORDER; phase files never import each other (no import cycles).
// `advance` is what a deadline does — and what a VIP skip does.
export function advance(state: S, now: number): S {
  switch (state.phase.id) {
    case 'answer':
      return enterReveal(state, now);
    case 'reveal':
      return enterDone(state, now);
    default:
      return state;
  }
}

function reduce(state: S, event: GameEvent<I>): S {
  if (event.type === 'player') return setConnected(state, event); // sdk helper
  const vip = applyVip(state, event, { skip: advance, end: enterDone }); // sdk: pause/resume/skip/end
  if (vip) return vip;
  if (state.phase.paused) return state; // inputs and timers wait while paused
  switch (state.phase.id) {
    case 'answer':
      return reduceAnswer(state, event, advance); // one file per phase; `next` injected
    case 'reveal':
      return reduceReveal(state, event, advance);
    default:
      return state;
  }
}
```

Inside a phase file, `isTimerFor(state, event)` tells a live timer from a stale one and
`hasPlayer(state, id)` (never `state.players[id]` truthiness — `'__proto__'` is truthy) tells a player
from a spectator. `reduce` receives only schema-valid inputs (the socket validates with `inputSchema`
first, ADR-024) but must tolerate everything else: inputs from spectators, unknown ids and other phases,
stale timers, VIP actions in any order.

### Rules the engine and `packages/game-sdk/src/contract-tests` enforce

| #   | Rule                                                                                                                                          | How it is checked                                                                                                                                                                                                                                                                                                                                          |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `reduce` never throws; unexpected events return `state` unchanged (same reference is fine).                                                   | fuzz: every event type in every phase, from spectators/unknown ids, stale timers                                                                                                                                                                                                                                                                           |
| 2   | No `Date.now()`, `Math.random()`, timers, I/O or module-level mutable state under `games/*/server`.                                           | ESLint rules on `games/**/server/**` + source scan test                                                                                                                                                                                                                                                                                                    |
| 3   | **Timers are data.** Set `state.phase.deadline`; the engine schedules ONE `timer` event per `phase.id + startedAt`. Never register callbacks. | engine unit tests; contract test asserts a timer event for a stale `startedAt` is ignored                                                                                                                                                                                                                                                                  |
| 4   | State is JSON-serializable, ≤ 256 KB, deterministic: same seed + same events ⇒ byte-identical state.                                          | every game replayed twice, hashes compared after every event                                                                                                                                                                                                                                                                                               |
| 5   | Views never throw for any `(state, playerId)` — spectators, disconnected, unknown ids — and never leak hidden info.                           | fuzz + each game's `__tests__/contract.config.ts` declares `hiddenFromTv(state)` / `hiddenFromController(state, viewer)`: strings that must not appear in the serialized view outside `players[]`. For numeric secrets omit the KEY from the view and list the key name. Exclude what the viewer may see (own answer, own id — `me.id` is always present). |
| 6   | Every phase is exitable: a deadline, an "all submitted" rule, or VIP `skip`.                                                                  | random + idle bots must finish within `estimatedMinutes × 3` of simulated time                                                                                                                                                                                                                                                                             |
| 7   | `results()` includes every player from `init` (even ones who left) with finite scores.                                                        | asserted at termination                                                                                                                                                                                                                                                                                                                                    |
| 8   | `bot.sampleInput` returns schema-valid input (or `null`) in every phase for every player.                                                     | asserted after every event of the bot runs                                                                                                                                                                                                                                                                                                                 |
| 9   | `manifest` deep-equals `manifest.json`; a fixture exists for every id in `phases`; content packs validate.                                    | contract test + `pnpm check-drift`                                                                                                                                                                                                                                                                                                                         |

### Pausing

On `vip.pause` the shared helper stores `phase.paused = { at: now }`; on `resume` it shifts `deadline` by
the paused duration and clears `paused`. While paused, ignore inputs and timers (the helper does this for you).

### Views

Both views share the envelope; the shells render it (timer, player chips, VIP overlay) and hand the whole
view to your components.

```ts
interface ViewEnvelope {
  gameId: string;
  phaseId: string;
  deadline: number | null;
  paused: boolean;
  players: ViewPlayer[]; // { id, name, avatarId, connected, status, score? }  status: 'active' | 'submitted' | 'waiting' | 'spectator'
  timerMode?: 'normal' | 'quiet' | 'hidden'; // ADR-030: quiet = bar only (a rhythm, not a countdown); hidden = nothing
}
type TvView = ViewEnvelope & Record<string, JsonValue>; // + your fields
type ControllerView = ViewEnvelope & { me: { id: string; role: 'player' | 'spectator' } } & Record<
    string,
    JsonValue
  >;
```

The engine adds `vip` (current VIP id) and `rev` on the wire; games never see who is VIP.
Do not reuse envelope keys for game fields. Keep views small (a few KB) — they are pushed in full.
Views must survive `JSON.parse(JSON.stringify(view))` unchanged: no `undefined`, no `NaN`, no `-0`
(`0 - 0` is fine, `-wager` with `wager === 0` is not — write `|| 0`). Declare your view interfaces
(`interface MyTvView extends TvView { … }`) and pass them as the `TV`/`CV` generics so tests and client
code get typed fields.

### Results

```ts
interface GameResults {
  scores: Record<string, number>; // every player from init
  ranking: { playerId: string; score: number; rank: number }[]; // rank 1 = winner; ties share a rank
  winnerIds: string[];
  awards: { id: string; title: string; description: string; playerId: string }[];
}
```

### Recap (optional, ADR-035)

`recap?(state, ctx)` returns `{ markdown, files? }` — what the host writes to disk when a room records a
game (`recordings/<gameId>/<time>-<room>/recap.md` next to `session.json` and `state.json`). `ctx` has
the players, the results (null when the VIP ended the game) and `history`: the state as each phase
instance began, oldest first — read the reveal states there for anything the game clears per round
(Lightning's picks, Wisecrack's votes). Files are plain names written beside the markdown (Broken
Pencil writes each drawing as an SVG). Pure like every other method; without it the host keeps only the
state.

### Speech (optional, ADR-045)

`speech?(state)` lists the readings the state wants: `SpeechRequest { key, voice, parts }`, where a part
is `{ text }` or `{ ipa, text }` — `text` is required on phoneme parts too, because Zira (`original`)
reads it where Kokoro reads the phonemes. The host makes each key once, serves it at
`/api/speech/<key>.wav` (cached for good: the key is a content hash) and answers with the `speech`
event; `-1` means no voice — carry on with reading time. Ask for a line as soon as its text is known,
never before a secret it contains is revealed, and at most `pendingCap(players)` at a time. Build
readings with the server-only `@partybox/game-sdk/speech` (never from `client/`):

```ts
import { parsePronunciations, speechKey, toSpeakable } from '@partybox/game-sdk/speech';
import list from '../content/pronunciations.json' with { type: 'json' };
const OVERRIDES = parsePronunciations(list); // validated once, at module level

const parts = toSpeakable(prompt.text, {
  voice,
  lang: 'en',
  overrides: OVERRIDES,
  itemId: prompt.id,
});
// player-written text: { ..., playerText: true } (shouting, stretched words, 140 characters)
const req = { key: speechKey('fake-out', voice, parts), voice, parts };
```

- `toSpeakable(text, { voice, lang, overrides?, itemId?, playerText? })` applies Part 00 §5.3's rules:
  numbers, money, times and years as words, symbols and abbreviations, acronyms spelled (as phonemes,
  so a mid-line "A" is not "uh"), pacing, no emoji. Spanish gets rules 1, 9, 10 and 11 only.
- Overrides: the SDK's `speech/overrides.en.json`, beaten by your `content/pronunciations.json`
  (`docs/game-pack/schemas/pronunciations.schema.json`: `words`, `items`, `patterns`; each entry
  `say` / `ipa` (alias `phonemes`) / `spell`), whole words, **case-sensitive** unless `anyCase: true`.
  Test your list: it parses, and `unknownPhonemes(ipa)` is empty for every entry.
- `speakableName(name)`: the name to read, or `null` to skip it. `speechKey(gameId, voice, parts)`:
  `<gameId>-<16 hex>`, a hash of `SPEECH_ENGINE_VERSION`, the voice and the parts.

### Bots (`manifest.supportsBots`)

Every game ships `bot.sampleInput` (sim, e2e and the contract suite need it). Setting
`"supportsBots": true` in `manifest.json` additionally declares the game **available for bots**: players may
add bot seats from the lobby and they will play with your bot logic. Without the flag the engine refuses to
start your game while bots are in the room. When you set it, make the bot an honest opponent: it acts in
every input phase, its inputs vary (the contract suite fails a bot that always sends the same input), and it
never needs information a phone would not have. Bots are never VIP and count toward `minPlayers`/`maxPlayers`.

### Settings

`manifest.settings` is a list of specs (`number` with min/max/step, `boolean`, `select` with options,
`multiselect` with options — several picks, stored as one comma-joined string, `''` = none; with
`groupBy: '<select key>'` and a `group` per option only the options of the sibling select's current
value are offered and kept, ADR-034). The VIP edits them in the lobby; the engine validates against the
spec and passes `settings` to `init` (`multiselectPicks(value)` from `@partybox/shared` splits one).

### Typed answers — `@partybox/game-sdk/match` (ADR-048)

Whatever a player types that the game compares — a guess, a clue, a lie, a free-text answer — goes
through the shared matcher, never `===` on raw text. It is pure and gives the same answer on every
machine, so `reduce` may call it and a phone may run the same check as the player types. Every
function takes the content's `lang` (`'en' | 'es'`), read from the pack's required `lang` field.

| Function                                                   | Returns                                                                                                                                                                          |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `normalize(text, lang)`                                    | `{ norm, compact }`: lowercase, no accents, quotes or punctuation, one leading article dropped, number words to 99 as digits ("The Twenty-One Pilots" → `21 pilots`, `21pilots`) |
| `stem(word, lang)`                                         | a key where singular and plural meet (movies, movie → `movi`; luces, luz → `luz`)                                                                                                |
| `matchAnswer(input, item, lang)`                           | `'exact' \| 'stem' \| 'fuzzy' \| 'none'` against `{ answer, accept?, reject?, family? }`; a reject blocks every level, digits never fuzz                                         |
| `sameAnswer(a, b, lang)`                                   | one player's text against another's: the same compact form, the same stems, or 6+ letters one edit apart                                                                         |
| `groupAnswers(texts, lang)`                                | `number[][]`: indices grouped by chains of `sameAnswer`, in submission order                                                                                                     |
| `isLegalClue(clue, secret, { lang, maxChars?, oneWord? })` | `{ ok: true }` or `{ ok: false, reason }`: `empty`, `too-long`, `not-one-word`, `is-secret`, `contains-secret` (the game words the message, in both languages)                   |

Each game picks the level it accepts (a guess usually scores at `fuzzy` or better); `isLegalClue`
calls a clue the secret at `stem` or better. Pass `secret: null` for a player who does not know the
secret (Imposter's imposter): the error itself would tell them their clue is close. Sort ids with
`compareCodeUnits` (`@partybox/game-sdk`): `localeCompare`, `toLocale*` and `Intl` are banned under
`games/*/server`.

**Answer packs.** A content file with typed answers carries `lang` and items `{ id, answer, accept,
reject, family }`, all lowercase (`docs/game-pack/schemas/answer-item.schema.json`); spacing, case,
accent and apostrophe variants are automatic and never listed. Build the content schema with
`answerItemSchema` and test the pack with `checkAnswerPack({ lang, items }, { isCommon? })` (both from
`@partybox/game-sdk`, not `./match`, so zod stays off phones): it fails on two entries equal after
normalization and on an accept that does not come back `exact`, and warns on common words with fewer
than 3 accepts.

**"That counts" (game pack §4.8).** When a guess is judged below the game's bar, the reveal shows what
was typed and the VIP's phone (`view.vip === me.id`) shows ✓ That counts until Next. The button sends a
game input the reducer honours only when `event.vip === true` (ADR-042); it re-scores through the same
`judged()` helper that feeds the score, awards, views and recap, and the TV tags the answer "Counted by
the VIP". Store what was counted, never who counted it. Only a phone sends game inputs, so a room run
from the TV host bar has no override. The contract fuzz sends every input stamped `vip: true` too.

## Client side — `games/<id>/client/{shared,phone-entry,tv-entry}.ts` (ADR-050)

Each surface is its own download: a phone fetches the game's phone entry once the game is chosen
(and never a TV entry), the TV fetches the TV entry. The generated registry imports them lazily;
nothing in `packages/client` may import a game statically (lint).

```ts
// shared.ts — what both surfaces carry
export const shared: GameShared = {
  id: 'my-game',
  strings: STRINGS, // from ./strings.ts: the game's Spanish, keyed by the English sentence (ADR-044)
  sounds: { reveal: 'reveal' }, // optional: map your moments to design-system cue names
  music,
  beds,
  scoreless, // optional: the sound plan (a phone plays it in a phone-only room)
};
// phone-entry.ts
export const phone: GamePhoneModule = {
  ...shared,
  Controller,
  PhoneStage: lazy(() => import('./PhoneStage')), // optional: in a "phone only" room the phones show what the TV would for `phoneStagePhases`, in place of the Controller (S-005)
  phoneStagePhases: ['bingo'],
};
// tv-entry.ts
export const tv: GameTvModule = {
  ...shared,
  Tv,
  quickInto: ['play'], // optional: phases the TV cuts into (their own entrance is the choreography)
  stripActive: (view) => [], // optional: player ids the TV strip rings as "on" — whoever the room should look at (I-017)
  ownLocks: ['answer'], // optional: TV phases where the game sounds its own lock-ins; the shell's `lock` tick stays quiet there (I-020)
  finale,
  Finale, // optional: keep the game's last board on the results stage
};
// settings-entry.ts (optional; `"phoneSettings": true` in the manifest): the game's per-phone
// panel for the lobby's 🎨 sheet — a closed row until a player opens it (S-003)
export const settings: GameSettingsModule = { PhoneSettings: PhonePanel };
```

Never import a TV file from the phone side (a constant both need goes in its own file, like Blanks'
`timing.ts`): the phone would download the TV screen with it.

Components receive `{ view, send(input), me, skip? }` and are dumb (`skip` is set on the VIP's phone only and
fires the engine's VIP skip, so a game's own "Next" button is the VIP's without the game knowing who that is — ADR-036): no sockets, no global state, no game logic —
compose `@partybox/game-sdk/ui` primitives (`TextAnswer`, `ChoiceGrid`, `VoteList`, `WaitingScreen`,
`Stage`, `BigText`, `Timer`, `PlayerChips`, `Scoreboard`, `Reveal`). The shell already renders the envelope
(timer, chips, VIP overlay). Server code imports `@partybox/game-sdk` (pure); client code imports
`@partybox/game-sdk/ui` (ADR-023) — the linter enforces the split.

Every sentence a player or the room reads goes through the device's language (ADR-044): `const L =
useT(STRINGS)` at the top of a component, then `L('Waiting for {name}…', { name })` — the key is the
literal English, placeholders instead of template strings, one key per plural form. A sentence your
server writes renders through `L.sent(text)` (the table's exact entry, or a `{placeholder}` entry that
matches it). The manifest's own sentences (tagline, description, how-to-play, setting labels) go in
`manifest.es.json` next to it: the host serves them to the picker, About and the settings form, so the
picker never loads game code (ADR-049). `scripts/i18n-coverage.test.ts` fails until each has its
Spanish. Content stays as written.

## Worked example — the template game (`games/_template`)

"Quick Poll": one input phase (`answer`, 30 s, everyone types a word), one `reveal` phase (10 s), then `done`.

1. **State**: `{ ...base, answers: Record<playerId, string>, scores: Record<playerId, number> }`.
2. **`init`**: seeds `rng` from `ctx.seed`, copies `ctx.players`, enters `answer` with `deadline = now + 30_000`.
3. **`answer` phase**: `input` stores the trimmed answer for a _playing_ player (spectators ignored);
   when every connected player has answered **or** the `timer` fires → `next(state, now)`, which
   `index.ts` wires to `enterReveal`.
4. **`reveal` phase**: everyone who answered scores 1; `timer` → `enterDone`. `results()` is non-null in `done`.
5. **Views**: `tvView` lists who has submitted (status chips) and, in `reveal`, the answers.
   `controllerView` in `answer` returns `{ submitted: boolean }` for the player and hides other answers.
6. **`bot.sampleInput`**: in `answer` returns `{ type: 'answer', text: rng.pick(WORDS) }`; else `null`.
7. **Fixtures**: `fixtures/answer.json`, `fixtures/reveal.json`, `fixtures/done.json` — a full state each.

Read the real files; they are ~150 lines total and every line is commented with _why_.

## Things that are deliberately possible

- A canvas/drawing game: inputs are JSON, so a stroke list is a fine `I`; raise `manifest.maxInputBytes`
  (default 16 KB, hard cap 256 KB, ADR-002) if strokes need it.
- Team games: keep team membership in state; the envelope's `players[]` is still per player.
- Hidden roles: keep secrets in state, expose them only through `controllerView(state, playerId)`.
