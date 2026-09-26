// The owner (2026-09-22): the TV speaks Spanish too. The host bar carries the language switch in
// every room status, offering the other language in its own words.
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { RoomSnapshot, RoomStatus } from '@partybox/shared';
import { setCatalog } from '../catalog';
import { createStore } from '../net/store';
import type { TvClient, TvState } from '../net/tv';
import { HostBar } from './HostBar';

vi.mock('../vipAway', () => ({
  useVipAway: () => ({ vip: 'Sam', next: 'Priya', nextId: 'priya', seconds: 29 }),
}));

const client: TvClient = {
  store: createStore<TvState>({
    connected: true,
    room: null,
    view: null,
    rev: 0,
    offsetMs: 0,
    toasts: [],
    homing: false,
  }),
  act: () => undefined,
  bot: () => undefined,
  home: () => Promise.resolve('ok'),
};

const room = (status: RoomStatus): RoomSnapshot => ({
  code: 'ABCD',
  status,
  locked: false,
  capacity: 8,
  players: [],
  vip: null,
  selectedGameId: null,
  settings: {},
  results: null,
  canStart: { ok: false, reason: 'Pick a game first.' },
  recording: false,
  musicOnPhones: false,
  phoneOnly: false,
  listed: true,
});

describe('HostBar language switch', () => {
  it.each(['lobby', 'selecting', 'playing', 'results'] as const)('is on the bar in %s', (s) => {
    const html = renderToStaticMarkup(<HostBar client={client} room={room(s)} view={null} />);
    // Rendered on the server the device language reads as English: the switch offers Spanish.
    expect(html).toContain('🌐 Español');
    expect(html).toContain('aria-label="Switch the TV to Spanish"');
  });
});

describe('I-663: the VIP handover countdown', () => {
  it.each(['lobby', 'selecting', 'results'] as const)(
    'does not promise a handover during %s',
    (status) => {
      const html = renderToStaticMarkup(
        <HostBar client={client} room={room(status)} view={null} />,
      );
      expect(html).not.toContain('passes to Priya');
    },
  );

  it('shows the handover during play', () => {
    const html = renderToStaticMarkup(
      <HostBar client={client} room={room('playing')} view={null} />,
    );
    expect(html).toContain('passes to Priya');
  });
});

describe('I-682 C: no "Pick a game" for a room of nobody', () => {
  const player = (id: string, bot: boolean) =>
    ({ id, name: id, avatarId: 'fox', bot, connected: true, isVip: !bot }) as never;
  setCatalog({ rev: 'test', games: [{ id: 'bingo', name: 'Bingo', icon: '🎱' }] as never });
  const lobby = (players: never[]): RoomSnapshot => ({ ...room('lobby'), players });
  const html = (r: RoomSnapshot): string =>
    renderToStaticMarkup(<HostBar client={client} room={r} view={null} />);
  it('an empty room and a bots-only room offer Add a bot, not a game', () => {
    expect(html(lobby([]))).not.toContain('Pick a game');
    expect(html(lobby([player('b1', true)]))).not.toContain('Pick a game');
  });
  it('a person in the room brings the game back', () => {
    expect(html(lobby([player('sam', false)]))).toContain('Pick a game');
  });
});

describe('I-589: a game with its own Next hides the host bar skip', () => {
  const view = (extra: object) =>
    ({
      gameId: 'g',
      phaseId: 'reveal',
      deadline: null,
      paused: false,
      players: [],
      vip: null,
      ...extra,
    }) as never;
  const html = (v: never): string =>
    renderToStaticMarkup(<HostBar client={client} room={room('playing')} view={v} />);
  it('shows Skip / Next normally and drops it when the view says so', () => {
    expect(html(view({}))).toContain('⏭');
    expect(html(view({ vipSkipHidden: true }))).not.toContain('⏭');
  });
});
