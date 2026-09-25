// ADR-047 on the phone: the stored "I can see the TV" (and the harness's URL override), who the VIP
// is asked about, which notice a chosen game needs, and a remote phone's music default.
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CatalogEntry, PlayerPublic, RoomSnapshot } from '@partybox/shared';
import { presenceNotice } from './controller/picker/PresenceNotice';
import { phoneMusicWanted } from './phone-music';
import { awayToAsk, storeCanSeeTv, storedCanSeeTv } from './presence';

const person = (id: string, over: Partial<PlayerPublic> = {}): PlayerPublic => ({
  id,
  name: id.toUpperCase(),
  avatarId: 'fox',
  isVip: id === 'a',
  connected: true,
  spectator: false,
  joinedAt: 0,
  ...over,
});
const room = (over: Partial<RoomSnapshot> = {}): RoomSnapshot =>
  ({
    status: 'lobby',
    phoneOnly: false,
    players: [person('a'), person('b')],
    ...over,
  }) as RoomSnapshot;
const game = (presence: CatalogEntry['presence']): CatalogEntry =>
  ({ id: 'g', presence }) as CatalogEntry;

describe('the stored answer', () => {
  afterEach(() => vi.unstubAllGlobals());
  const stub = (search: string, stored: string | null): Map<string, string> => {
    const map = new Map<string, string>(stored ? [['partybox:can-see-tv', stored]] : []);
    vi.stubGlobal('location', { search });
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => map.set(k, v),
    });
    return map;
  };

  it('is unset until the player answers, then remembered in that room', () => {
    const map = stub('', null);
    expect(storedCanSeeTv('ABCD')).toBeUndefined();
    storeCanSeeTv(false, 'ABCD');
    expect(JSON.parse(map.get('partybox:can-see-tv') ?? '{}')).toMatchObject({ on: false, room: 'ABCD' }); // prettier-ignore
    expect(storedCanSeeTv('ABCD')).toBe(false);
  });

  it('never follows the phone to another room, or past the night (reviewer C3)', () => {
    const at = Date.now();
    stub('', JSON.stringify({ on: false, room: 'ABCD', at }));
    expect(storedCanSeeTv('WXYZ')).toBeUndefined();
    expect(storedCanSeeTv(undefined)).toBeUndefined();
    stub('', JSON.stringify({ on: false, room: 'ABCD', at: at - 13 * 60 * 60 * 1000 }));
    expect(storedCanSeeTv('ABCD')).toBeUndefined();
    stub('', 'off'); // the old global value from before this fix
    expect(storedCanSeeTv('ABCD')).toBeUndefined();
  });

  it('?canSeeTv=0 / =1 on the URL wins (the harness films a remote phone)', () => {
    stub('?canSeeTv=0', JSON.stringify({ on: true, room: 'ABCD', at: Date.now() }));
    expect(storedCanSeeTv('ABCD')).toBe(false);
    stub('?room=ABCD&canSeeTv=1', null);
    expect(storedCanSeeTv(undefined)).toBe(true);
  });
});

describe('who the VIP is asked about', () => {
  const remote = room({ players: [person('a'), person('b', { canSeeTv: false })] });
  it('someone can’t see the TV while the room says together, between games', () => {
    expect(awayToAsk(remote).map((p) => p.id)).toEqual(['b']);
  });
  it('nobody once the room has an answer, mid-game, or in a phone-only room', () => {
    expect(awayToAsk({ ...remote, presenceMode: 'remote-voice' })).toEqual([]);
    expect(awayToAsk({ ...remote, status: 'playing' })).toEqual([]);
    expect(awayToAsk({ ...remote, phoneOnly: true })).toEqual([]);
    expect(awayToAsk(room())).toEqual([]);
  });
});

describe('the notice on choosing (Part 00 §3.5)', () => {
  it('a talking game only when some are remote with no call', () => {
    expect(presenceNotice(game('voice-if-remote'), room({ presenceMode: 'remote-text' }))).toBe('voice'); // prettier-ignore
    expect(presenceNotice(game('voice-if-remote'), room({ presenceMode: 'remote-voice' }))).toBeNull(); // prettier-ignore
    expect(presenceNotice(game('voice-if-remote'), room())).toBeNull();
  });
  it('a same-room game when anyone can’t see the TV or the room says some are remote', () => {
    expect(presenceNotice(game('same-room'), room())).toBeNull();
    expect(presenceNotice(game('same-room'), room({ players: [person('a', { canSeeTv: false })] }))).toBe('room'); // prettier-ignore
    expect(presenceNotice(game('same-room'), room({ presenceMode: 'remote-voice' }))).toBe('room');
  });
  it('anywhere never', () => {
    expect(presenceNotice(game('anywhere'), room({ presenceMode: 'remote-text' }))).toBeNull();
  });
});

describe('music on a remote phone (ruling 14)', () => {
  it('plays by default, and the phone’s own switch still wins', () => {
    expect(phoneMusicWanted(null, room(), true)).toBe(true);
    expect(phoneMusicWanted(null, room(), false)).toBe(false);
    expect(phoneMusicWanted('off', room(), true)).toBe(false);
  });
});
