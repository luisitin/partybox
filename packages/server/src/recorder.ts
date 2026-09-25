// Session recorder (ADR-035): every game a room plays with `recording` on is written to disk as it
// happens — `<dir>/<gameId>/<YYYY-MM-DD_HH-mm-ss>-<room>/` holds `session.json` (who played, the
// settings, the phase timeline, the results), `state.json` (the last game state) and, when the
// game offers one, `recap.md` with its files (Broken Pencil's drawings as SVG). Feeds the owner's
// feedback after a night; the VIP can switch it off per room from the game picker. Nothing here is
// on the hot path: writes are chained, fire-and-forget, and a failure only logs.
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { EngineDeps, RoomState } from '@partybox/engine';
import type {
  GamePresence,
  GameResults,
  GameStateBase,
  PlayerInfo,
  Settings,
} from '@partybox/shared';
import type { Host } from './host';

export interface RecorderOptions {
  host: Host;
  deps: EngineDeps;
  /** Root folder; one subfolder per game id. */
  dir: string;
  log?: (level: 'warn' | 'error' | 'info', text: string) => void;
}

export interface Recorder {
  dir: string;
  /** Sessions still being written (rooms mid-game). */
  open(): number;
  /** Closes every open session as aborted (dev reset, server shutdown). */
  abortAll(): Promise<void>;
  /** Resolves once every queued write has landed (tests). */
  flush(): Promise<void>;
  /** Stops listening to the host. */
  close(): void;
  /** I-034 A: the last finished session with a recap, if any (its folder, game and room). */
  latest(): { dir: string; gameId: string; code: string; files: string[] } | null;
}

interface TimelineEntry {
  phase: string;
  /** ISO time the phase instance began. */
  at: string;
  /** Seconds since the game started. */
  t: number;
  /** Seconds the phase was given, when it had a deadline. */
  seconds: number | null;
}

interface Session {
  dir: string;
  gameId: string;
  code: string;
  startedAt: number;
  seed: number;
  settings: Settings;
  /** ADR-047: where everyone was when the game started (a same-room game played anyway shows here). */
  presence: GamePresence;
  players: PlayerInfo[];
  timeline: TimelineEntry[];
  /** The state as each phase instance began, oldest first (what a recap reads). The closing phase
   * never appears: the engine turns it into results in the same dispatch. */
  history: { phase: string; at: number; state: GameStateBase }[];
  lastState: GameStateBase;
  lastPhaseKey: string;
  outcome: 'playing' | 'finished' | 'aborted';
  endedAt: number | null;
  results: GameResults | null;
  writes: Promise<void>;
}

function stamp(ms: number): string {
  const d = new Date(ms);
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`;
}

function sessionJson(s: Session): string {
  const byId = Object.fromEntries(s.players.map((p) => [p.id, p.name]));
  return JSON.stringify(
    {
      game: s.gameId,
      room: s.code,
      startedAt: new Date(s.startedAt).toISOString(),
      endedAt: s.endedAt === null ? null : new Date(s.endedAt).toISOString(),
      outcome: s.outcome,
      // The phase the game was in when it ended: a VIP `end` shows a scoreboard like a natural
      // finish, so this is how a reader tells the two apart (a mid-round phase = ended early).
      lastPhase: s.lastState.phase.id,
      seed: s.seed,
      settings: s.settings,
      presence: s.presence,
      players: s.players.map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatarId,
        bot: !!p.bot,
        ...(p.canSeeTv === false ? { remote: true } : {}),
      })),
      timeline: s.timeline,
      results:
        s.results === null
          ? null
          : {
              ranking: s.results.ranking.map((r) => ({
                rank: r.rank,
                name: byId[r.playerId] ?? r.playerId,
                score: r.score,
              })),
              winners: s.results.winnerIds.map((id) => byId[id] ?? id),
              awards: s.results.awards.map((a) => ({
                title: a.title,
                description: a.description,
                name: byId[a.playerId] ?? a.playerId,
              })),
            },
    },
    null,
    2,
  );
}

export function createRecorder(options: RecorderOptions): Recorder {
  const { host, deps, dir } = options;
  const log =
    options.log ??
    ((level, text) => console[level === 'info' ? 'log' : level](`[recorder] ${text}`));
  const sessions = new Map<string, Session>();
  let latest: { dir: string; gameId: string; code: string; files: string[] } | null = null; // I-034 A

  /** Serialises this session's writes so a later snapshot never lands before an earlier one. */
  function queue(s: Session, work: () => Promise<void>): void {
    s.writes = s.writes.then(work).catch((err: unknown) => {
      log('warn', `recording ${s.dir} failed: ${String(err)}`);
    });
  }

  function snapshot(s: Session): void {
    const state = s.lastState;
    const session = sessionJson(s);
    queue(s, async () => {
      await mkdir(s.dir, { recursive: true });
      await writeFile(join(s.dir, 'session.json'), session, 'utf8');
      await writeFile(join(s.dir, 'state.json'), JSON.stringify(state, null, 2), 'utf8');
    });
  }

  function start(room: RoomState): Session {
    const running = room.game as NonNullable<RoomState['game']>;
    const players = Object.values(running.state.players);
    const s: Session = {
      dir: join(dir, running.gameId, `${stamp(running.startedAt)}-${room.code}`),
      gameId: running.gameId,
      code: room.code,
      startedAt: running.startedAt,
      seed: running.seed,
      settings: running.settings,
      presence: { mode: room.presenceMode ?? 'together', phoneOnly: room.phoneOnly },
      players,
      timeline: [],
      history: [],
      lastState: running.state,
      lastPhaseKey: '',
      outcome: 'playing',
      endedAt: null,
      results: null,
      writes: Promise.resolve(),
    };
    sessions.set(room.code, s);
    log('info', `recording ${running.gameId} → ${s.dir}`);
    return s;
  }

  function observe(s: Session, state: GameStateBase): void {
    s.lastState = state;
    const key = `${state.phase.id}@${state.phase.startedAt}`;
    if (key === s.lastPhaseKey) return;
    s.lastPhaseKey = key;
    s.history.push({ phase: state.phase.id, at: state.phase.startedAt, state });
    s.timeline.push({
      phase: state.phase.id,
      at: new Date(state.phase.startedAt).toISOString(),
      t: Math.round((state.phase.startedAt - s.startedAt) / 100) / 10,
      seconds:
        state.phase.deadline === null
          ? null
          : Math.round((state.phase.deadline - state.phase.startedAt) / 1000),
    });
    snapshot(s);
  }

  // Writes of sessions that already left the map still need awaiting (tests, shutdown).
  const finished: Promise<void>[] = [];

  function finish(s: Session, results: GameResults | null, endedAt: number): void {
    sessions.delete(s.code);
    finished.push(s.writes);
    s.outcome = results ? 'finished' : 'aborted';
    s.endedAt = endedAt;
    s.results = results;
    snapshot(s);
    const game = deps.games[s.gameId];
    if (!game?.recap) return;
    let recap: ReturnType<NonNullable<typeof game.recap>> = null;
    try {
      recap = game.recap(s.lastState, { players: s.players, history: s.history, results });
    } catch (err) {
      log('warn', `recap(${s.gameId}) threw: ${String(err)}`);
    }
    if (!recap) return;
    const { markdown, files = [] } = recap;
    queue(s, async () => {
      await writeFile(join(s.dir, 'recap.md'), markdown, 'utf8');
      for (const f of files) await writeFile(join(s.dir, f.name), f.body, 'utf8');
      latest = { dir: s.dir, gameId: s.gameId, code: s.code, files: files.map((f) => f.name) }; // I-034 A
    });
    finished.push(s.writes);
  }

  const unsubscribe = host.subscribe((room) => {
    const s = sessions.get(room.code);
    const running = room.status === 'playing' ? room.game : null;
    if (running) {
      if (s && s.startedAt !== running.startedAt) finish(s, null, running.startedAt);
      const current =
        s && s.startedAt === running.startedAt ? s : room.recording ? start(room) : null;
      if (current) observe(current, running.state);
      return;
    }
    if (!s) return;
    const results = room.status === 'results' && room.results ? room.results.results : null;
    finish(s, results, Date.now());
  });

  async function abortAll(): Promise<void> {
    for (const s of [...sessions.values()]) finish(s, null, Date.now());
    await flush();
  }
  async function flush(): Promise<void> {
    await Promise.all([...sessions.values()].map((s) => s.writes));
    await Promise.all(finished.splice(0));
  }

  return {
    dir,
    open: () => sessions.size,
    abortAll,
    flush,
    close: () => {
      unsubscribe();
    },
    latest: () => latest,
  };
}
