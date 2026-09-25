import { describe, expect, it } from 'vitest';
import { applyRoomEvent } from './room';
import { canStart } from './vip';
import {
  deps,
  effectTypes,
  errorsOf,
  playingRoom,
  roomWith,
  T0,
  throughStage,
  toasts,
  vip,
} from './test-utils.helper';

describe('VIP validation', () => {
  it('setMusicOnPhones flips the room flag any time, and is a no-op when unchanged (S-004)', () => {
    // Owner 2026-09-24: new rooms start with music on the phones; the VIP can turn it off and on.
    expect(roomWith(2).musicOnPhones).toBe(true);
    const room = vip(roomWith(2), { action: 'setMusicOnPhones', on: false }).room;
    expect(room.musicOnPhones).toBe(false);
    const on = vip(room, { action: 'setMusicOnPhones', on: true });
    expect(on.room.musicOnPhones).toBe(true);
    // I-642 C: the room is told — on the TV and the VIP's phone only (S2)
    expect(effectTypes(on.effects)).toEqual(['toast', 'toast', 'push']);
    expect(on.effects.map((e) => (e.type === 'toast' ? e.to : null))).toEqual(['tvs', room.vipId, null]); // prettier-ignore
    expect(vip(on.room, { action: 'setMusicOnPhones', on: true }).effects).toEqual([]);
    expect(vip(playingRoom(2), { action: 'setMusicOnPhones', on: true }).room.musicOnPhones).toBe(
      true,
    );
  });
  it('setRecording flips the room flag except mid-game, and is a no-op when unchanged', () => {
    const room = roomWith(2);
    expect(room.recording).toBe(true);
    const off = vip(room, { action: 'setRecording', on: false });
    expect(off.room.recording).toBe(false);
    expect(effectTypes(off.effects)).toEqual(['toast', 'toast', 'push']); // TV + VIP (S2)
    expect(vip(off.room, { action: 'setRecording', on: false }).effects).toEqual([]);
    expect(errorsOf(vip(playingRoom(2), { action: 'setRecording', on: false }).effects)).toEqual([
      'cannot_start',
    ]);
  });

  it('setListed makes a room public or private any time; a no-op when unchanged (ADR-043)', () => {
    const room = roomWith(2);
    expect(room.listed).toBe(true);
    const off = vip(room, { action: 'setListed', on: false });
    expect(off.room.listed).toBe(false);
    expect(effectTypes(off.effects)).toEqual(['push']);
    expect(vip(off.room, { action: 'setListed', on: false }).effects).toEqual([]);
    expect(vip(playingRoom(2), { action: 'setListed', on: false }).room.listed).toBe(false);
  });
  it('setCapacity clamps to 16 and never goes below the people already in (I-088)', () => {
    const room = roomWith(5);
    expect(vip(room, { action: 'setCapacity', capacity: 8 }).room.capacity).toBe(8);
    // below the head count: floored at it
    expect(vip(room, { action: 'setCapacity', capacity: 4 }).room.capacity).toBe(5);
    expect(vip(room, { action: 'setCapacity', capacity: 16 }).room.capacity).toBe(16);
    const same = vip(room, { action: 'setCapacity', capacity: room.capacity });
    expect(same.effects).toEqual([]);
  });
  it('non-VIPs are rejected with not_vip and nothing changes', () => {
    const room = roomWith(2);
    const r = vip(room, { action: 'lock' }, T0 + 5, 'p2');
    expect(errorsOf(r.effects)).toEqual(['not_vip']);
    expect(r.room).toBe(room);
    expect(errorsOf(vip(room, { action: 'lock' }, T0 + 5, 'ghost').effects)).toEqual([
      'not_in_room',
    ]);
  });

  it('selectGame → selecting with default settings; unknown game rejected', () => {
    const r = vip(roomWith(2), { action: 'selectGame', gameId: 'fake' });
    expect(r.room.status).toBe('selecting');
    expect(r.room.settings).toEqual({ rounds: 3, spicy: false, mode: 'a' });
    expect(errorsOf(vip(r.room, { action: 'selectGame', gameId: 'nope' }).effects)).toEqual([
      'unknown_game',
    ]);
    expect(errorsOf(vip(playingRoom(2), { action: 'selectGame', gameId: 'fake' }).effects)).toEqual(
      ['cannot_start'],
    );
  });

  it('updateSettings coerces against the spec', () => {
    const selecting = vip(roomWith(2), { action: 'selectGame', gameId: 'fake' }).room;
    const r = vip(selecting, {
      action: 'updateSettings',
      settings: { rounds: 99, spicy: true, mode: 'zzz', extra: 1 },
    });
    expect(r.room.settings).toEqual({ rounds: 5, spicy: true, mode: 'a' });
    expect(errorsOf(vip(roomWith(2), { action: 'updateSettings', settings: {} }).effects)).toEqual([
      'cannot_start',
    ]);
  });

  it('start respects min/max players and reports why', () => {
    const one = vip(roomWith(1), { action: 'selectGame', gameId: 'fake' }).room;
    expect(canStart(one, deps)).toEqual({
      ok: false,
      reason: 'Fake needs at least 2 players (1 here).',
    });
    expect(errorsOf(vip(one, { action: 'startNow' }).effects)).toEqual(['cannot_start']);
    const five = vip(roomWith(5), { action: 'selectGame', gameId: 'fake' }).room;
    expect(canStart(five, deps)).toEqual({
      ok: false,
      reason: 'Fake takes at most 4 players (5 here).',
    });
    expect(canStart(roomWith(2), deps)).toEqual({ ok: false, reason: 'Pick a game first.' });
    expect(errorsOf(vip(roomWith(2), { action: 'startNow' }).effects)).toEqual(['cannot_start']);
    const ok = vip(roomWith(3), { action: 'selectGame', gameId: 'fake' }).room;
    expect(canStart(ok, deps)).toEqual({ ok: true });
    const started = vip(ok, { action: 'startNow' }, T0 + 100, 'p1', 7);
    expect(started.room.status).toBe('playing');
    expect(started.room.game?.seed).toBe(7);
    expect(canStart(started.room, deps)).toEqual({
      ok: false,
      reason: 'A game is already running.',
    });
  });

  it('skip/pause/resume/end reach the game; end forces results', () => {
    const playing = playingRoom(3);
    expect(errorsOf(vip(roomWith(2), { action: 'skip' }).effects)).toEqual(['not_playing']);
    const paused = vip(playing, { action: 'pause' }, T0 + 200).room;
    expect(paused.game?.state.phase.paused).toEqual({ at: T0 + 200 });
    const resumed = vip(paused, { action: 'resume' }, T0 + 1200).room;
    expect(resumed.game?.state.phase.paused).toBeUndefined();
    expect(resumed.game?.state.phase.deadline).toBe(playing.game!.state.phase.deadline! + 1000);
    const ended = vip(playing, { action: 'end' }, T0 + 300);
    expect(ended.room.status).toBe('results');
    expect(ended.room.results?.gameId).toBe('fake');
    expect(ended.room.game).toBeNull();
    const skipped = vip(playing, { action: 'skip' }, T0 + 300).room;
    expect(skipped.status).toBe('results');
  });

  it('end aborts a game that refuses to finish', () => {
    const stubborn = {
      games: { fake: { ...deps.games['fake']!, results: () => null } },
    };
    const playing = playingRoom(2);
    const r = vip(playing, { action: 'end' }, T0 + 300);
    expect(r.room.status).toBe('results');
    const aborted = applyRoomEvent(
      playing,
      { type: 'vip', now: T0 + 300, playerId: 'p1', action: { action: 'end' } },
      stubborn,
    );
    expect(aborted.room.status).toBe('lobby');
    expect(toasts(aborted.effects)).toEqual(['The game was ended.']);
  });

  it('kick removes the player and notifies them; self-kick and ghosts rejected', () => {
    const r = vip(roomWith(3), { action: 'kick', playerId: 'p3' });
    expect(r.room.players['p3']).toBeUndefined();
    expect(effectTypes(r.effects)).toEqual(['kicked', 'toast', 'push']);
    expect(toasts(r.effects)).toEqual(['P3 was kicked']);
    expect(errorsOf(vip(roomWith(2), { action: 'kick', playerId: 'p1' }).effects)).toEqual([
      'cannot_start',
    ]);
    expect(errorsOf(vip(roomWith(2), { action: 'kick', playerId: 'zz' }).effects)).toEqual([
      'not_in_room',
    ]);
    const playing = playingRoom(3);
    const kicked = vip(playing, { action: 'kick', playerId: 'p2' }, T0 + 200).room;
    expect(kicked.game?.state.players['p2']?.connected).toBe(false);
  });

  it('transferVip swaps the badge', () => {
    const r = vip(roomWith(2), { action: 'transferVip', playerId: 'p2' });
    expect(r.room.vipId).toBe('p2');
    expect(r.room.players['p1']?.isVip).toBe(false);
    expect(r.room.players['p2']?.isVip).toBe(true);
    expect(toasts(r.effects)).toEqual(['P2 is now the VIP']);
    expect(
      errorsOf(vip(r.room, { action: 'transferVip', playerId: 'p2' }, T0 + 5, 'p2').effects),
    ).toEqual(['not_in_room']);
    expect(
      errorsOf(vip(r.room, { action: 'transferVip', playerId: 'p9' }, T0 + 5, 'p2').effects),
    ).toEqual(['not_in_room']);
  });

  it('playAgain replays the last game; toLobby resets', () => {
    const ended = vip(playingRoom(3), { action: 'end' }, T0 + 300).room;
    expect(errorsOf(vip(roomWith(2), { action: 'playAgain' }).effects)).toEqual(['cannot_start']);
    // ADR-053: Play again opens the start stage with the seed it was given
    const again = vip(ended, { action: 'playAgain' }, T0 + 400, 'p1', 9);
    expect(again.room.starting).toMatchObject({ gameId: 'fake', seed: 9, ready: [] });
    const playing = throughStage(again.room);
    expect(playing.status).toBe('playing');
    expect(playing.game?.seed).toBe(9);
    const lobby = vip(ended, { action: 'toLobby' }, T0 + 400).room;
    expect(lobby.status).toBe('lobby');
    // I-073: the results stay with the room in the lobby (the "last up" card); the next game's
    // start clears them (runner).
    expect(lobby.results).toBe(ended.results);
    expect(errorsOf(vip(playingRoom(2), { action: 'toLobby' }, T0 + 400).effects)).toEqual([
      'cannot_start',
    ]);
    const tooMany = { ...ended, players: { ...ended.players } };
    for (let i = 4; i <= 5; i++)
      tooMany.players[`p${i}`] = {
        ...ended.players['p1']!,
        id: `p${i}`,
        name: `P${i}`,
        isVip: false,
        token: `t${i}`,
      };
    expect(errorsOf(vip(tooMany, { action: 'playAgain' }, T0 + 400).effects)).toEqual([
      'cannot_start',
    ]);
  });
});
