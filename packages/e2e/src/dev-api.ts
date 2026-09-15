// Typed client for the dev API (docs/DEV_API.md) used by both harness commands.
export interface DevState {
  room: {
    code: string;
    status: 'lobby' | 'selecting' | 'playing' | 'results';
    players: Record<
      string,
      { id: string; name: string; isVip: boolean; connected: boolean; spectator: boolean }
    >;
    vipId: string | null;
    game: {
      gameId: string;
      state: { phase: { id: string; startedAt: number; deadline: number | null } };
    } | null;
  } | null;
  clock: { now: number; frozen: boolean };
  bots: string[];
}

export class DevApi {
  constructor(private readonly base: string) {}

  private async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.base}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`${path} → ${res.status} ${await res.text()}`);
    return (await res.json()) as T;
  }

  reset(): Promise<{ room: string }> {
    return this.post('/api/dev/reset');
  }

  bots(count: number, strategy = 'random', reactionMs?: number): Promise<{ playerIds: string[] }> {
    return this.post('/api/dev/bots', { count, strategy, reactionMs });
  }

  start(
    gameId: string,
    seed?: number,
    settings?: Record<string, unknown>,
  ): Promise<{ status: string }> {
    return this.post('/api/dev/start', { gameId, seed, settings });
  }

  skip(): Promise<{ status: string; phase: string | null }> {
    return this.post('/api/dev/skip');
  }

  act(
    playerId?: string,
    seed?: number,
  ): Promise<{ acted: string[]; status: string; phase: string | null }> {
    return this.post('/api/dev/act', { playerId, seed });
  }

  clock(freeze: boolean, now?: number): Promise<{ now: number; frozen: boolean }> {
    return this.post('/api/dev/clock', { freeze, now });
  }

  disconnect(playerId: string, seconds: number): Promise<{ ok: boolean }> {
    return this.post('/api/dev/disconnect', { playerId, seconds });
  }

  async state(): Promise<DevState> {
    const res = await fetch(`${this.base}/api/dev/state`);
    if (!res.ok) throw new Error(`state → ${res.status}`);
    return (await res.json()) as DevState;
  }

  async games(): Promise<{ id: string; name: string; minPlayers: number; maxPlayers: number }[]> {
    const res = await fetch(`${this.base}/api/games`);
    if (!res.ok) throw new Error(`games → ${res.status}`);
    return (await res.json()) as {
      id: string;
      name: string;
      minPlayers: number;
      maxPlayers: number;
    }[];
  }
}
