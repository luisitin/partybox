import { describe, expect, it } from 'vitest';
import { applyRoomEvent } from './room';
import { coerceSettings, defaultSettings } from './settings';
import { controllerView, snapshot, tvView } from './views';
import { deps, joinEvent, playingRoom, roomWith, T0, vip } from './test-utils.helper';

describe('views', () => {
  it('snapshot lists players in join order with public fields only', () => {
    const room = roomWith(2);
    const snap = snapshot(room, deps);
    expect(snap.players.map((p) => p.id)).toEqual(['p1', 'p2']);
    expect(snap.players[0]).not.toHaveProperty('token');
    expect(snap.players[0]).toMatchObject({ isVip: true, connected: true, spectator: false });
    expect(snap).not.toHaveProperty('games');
    expect(snap).not.toHaveProperty('selectedGame');
    expect(snap.canStart).toEqual({ ok: false, reason: 'Pick a game first.' });
    expect(snap.results).toBeNull();
  });

  it('game views carry the VIP and are null outside play', () => {
    expect(tvView(roomWith(2), deps)).toBeNull();
    expect(controllerView(roomWith(2), 'p1', deps)).toBeNull();
    const playing = playingRoom(2);
    expect(tvView(playing, deps)).toMatchObject({ gameId: 'fake', phaseId: 'play', vip: 'p1' });
    expect(controllerView(playing, 'p2', deps)).toMatchObject({
      me: { id: 'p2', role: 'player' },
      vip: 'p1',
    });
    const withSpectator = applyRoomEvent(playing, joinEvent(3, T0 + 300), deps).room;
    expect(controllerView(withSpectator, 'p3', deps)?.me).toEqual({ id: 'p3', role: 'spectator' });
    expect(tvView(playing, { games: {} })).toBeNull();
    expect(controllerView(playing, 'p1', { games: {} })).toBeNull();
  });

  it('a throwing view degrades to a bare envelope', () => {
    const playing = playingRoom(2);
    expect(controllerView(playing, 'throw-me', deps)).toEqual({
      gameId: 'fake',
      phaseId: 'play',
      deadline: null,
      paused: false,
      players: [],
      me: { id: 'throw-me', role: 'spectator' },
      vip: 'p1',
      contentLang: 'en', // ADR-054: the running game's language rides on every view
    });
    const brokenTv = {
      games: {
        fake: {
          ...deps.games['fake']!,
          tvView: () => {
            throw new Error('x');
          },
        },
      },
    };
    expect(tvView(playing, brokenTv)).toMatchObject({ gameId: 'fake', players: [], vip: 'p1' });
  });

  it('results appear in the snapshot after the game', () => {
    const ended = vip(playingRoom(2), { action: 'end' }, T0 + 300).room;
    const snap = snapshot(ended, deps);
    expect(snap.status).toBe('results');
    expect(snap.results?.results.scores).toEqual({ p1: 0, p2: 0 });
    expect(snap.results?.players).toHaveLength(2);
  });

  it('a chosen game brings its settings form; the game list is never in the snapshot', () => {
    const room = { ...roomWith(2), status: 'selecting' as const, selectedGameId: 'fake' };
    const snap = snapshot(room, deps);
    expect(snap.selectedGame?.id).toBe('fake');
    expect(snap.selectedGame?.settings).toHaveLength(3);
    expect(snap).not.toHaveProperty('games');
  });
});

describe('settings', () => {
  const manifest = deps.games['fake']!.manifest;
  it('defaults come from the spec', () => {
    expect(defaultSettings(manifest)).toEqual({ rounds: 3, spicy: false, mode: 'a' });
  });
  it('coerces numbers (clamp + step), booleans and selects; drops unknown keys', () => {
    const current = defaultSettings(manifest);
    expect(coerceSettings(manifest, current, { rounds: 4.4 })).toMatchObject({ rounds: 4 });
    expect(coerceSettings(manifest, current, { rounds: -3 })).toMatchObject({ rounds: 1 });
    expect(coerceSettings(manifest, current, { rounds: Number.NaN })).toMatchObject({ rounds: 3 });
    expect(coerceSettings(manifest, current, { rounds: 'x' as never })).toMatchObject({
      rounds: 3,
    });
    expect(coerceSettings(manifest, current, { spicy: 'yes' as never })).toMatchObject({
      spicy: false,
    });
    expect(coerceSettings(manifest, current, { mode: 'b' })).toMatchObject({ mode: 'b' });
    expect(coerceSettings(manifest, current, { mode: 'q' })).toMatchObject({ mode: 'a' });
    expect(coerceSettings(manifest, current, { extra: 1 })).not.toHaveProperty('extra');
    expect(coerceSettings(manifest, { rounds: 2, spicy: true, mode: 'b' }, {})).toEqual({
      rounds: 2,
      spicy: true,
      mode: 'b',
    });
  });
});
