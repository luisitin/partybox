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
  init(ctx: InitContext): S; // { players, settings, seed, now }
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
  players: Record<string, PlayerInfo>; // { id, name, avatarId, connected, bot? } — who is playing; bot: true for a bot (ADR-028) so a game can act for it where a person taps (Bingo's ready-up); avatarId is a face id or `photo:<id>` for a photo avatar (ADR-037) — pass it to `Avatar` as is
}
```

- Put everything else your game needs next to these (`round`, `answers`, `scores`, …). Keep it JSON.
- `rng`: draw with the game-sdk helpers, e.g. `const [value, rng] = nextFloat(state.rng)`, then store `rng`.
  Never `Math.random()`.

### Events (`GameEvent<I>`)

```ts
type GameEvent<I> =
  | { type: 'input'; now: number; playerId: string; input: I } // schema-valid input
  | { type: 'timer'; now: number; phaseId: string; startedAt: number } // once per deadline (ADR-033)
  | { type: 'player'; now: number; playerId: string; connected: boolean } // (re)connect / leave
  | { type: 'vip'; now: number; action: 'skip' | 'pause' | 'resume' | 'end' };
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

## Client side — `games/<id>/client/index.ts`

```ts
export const clientModule: GameClientModule = {
  id: 'my-game',
  Tv: lazy(() => import('./Tv').then((m) => ({ default: m.Tv }))),
  Controller: lazy(() => import('./Controller').then((m) => ({ default: m.Controller }))),
  sounds: { reveal: 'reveal' }, // optional: map your moments to design-system cue names
  quickInto: ['play'], // optional: phases the TV cuts into (their own entrance is the choreography)
  stripActive: (view) => [], // optional: player ids the TV strip rings as "on" — whoever the room should look at (I-017)
  ownLocks: ['answer'], // optional: TV phases where the game sounds its own lock-ins; the shell's `lock` tick stays quiet there (I-020)
  PhoneSettings: lazy(() => import('./PhonePanel')), // optional: the game's per-phone settings panel for the lobby's 🎨 sheet, under the game's name (S-003)
};
```

Components receive `{ view, send(input), me, skip? }` and are dumb (`skip` is set on the VIP's phone only and
fires the engine's VIP skip, so a game's own "Next" button is the VIP's without the game knowing who that is — ADR-036): no sockets, no global state, no game logic —
compose `@partybox/game-sdk/ui` primitives (`TextAnswer`, `ChoiceGrid`, `VoteList`, `WaitingScreen`,
`Stage`, `BigText`, `Timer`, `PlayerChips`, `Scoreboard`, `Reveal`). The shell already renders the envelope
(timer, chips, VIP overlay). Server code imports `@partybox/game-sdk` (pure); client code imports
`@partybox/game-sdk/ui` (ADR-023) — the linter enforces the split.

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
