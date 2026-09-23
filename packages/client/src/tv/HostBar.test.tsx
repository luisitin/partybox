// The owner (2026-09-22): the TV speaks Spanish too. The host bar carries the language switch in
// every room status, offering the other language in its own words.
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { RoomSnapshot, RoomStatus } from '@partybox/shared';
import { createStore } from '../net/store';
import type { TvClient, TvState } from '../net/tv';
import { HostBar } from './HostBar';

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
  games: [],
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
