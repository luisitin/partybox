// While the VIP's phone is gone the engine hands the role over after LIMITS.vipHandoverMs. Moved
// here from HostBar (I-663): the TV's lobby line — and the phones — say it too.
import { useEffect, useState } from 'react';
import { LIMITS } from '@partybox/shared';
import type { RoomSnapshot } from '@partybox/shared';

/** Who the engine hands the VIP to: the longest-joined connected person (players.ts promoteVip). */
export function nextVip(room: RoomSnapshot): { id: string; name: string } | null {
  const next = room.players
    .filter((p) => p.connected && p.id !== room.vip && !p.bot && !p.spectator)
    .sort((a, b) => a.joinedAt - b.joinedAt)[0];
  return next ? { id: next.id, name: next.name } : null;
}

/**
 * The VIP's phone is gone: who they are, who takes over and in how many seconds; null while the
 * VIP is here. Counted locally from the first snapshot that shows the VIP offline (the server flips
 * `connected` on socket close, so this trails the engine's clock by a push at most); a 1 s tick
 * keeps the digits moving.
 */
export function useVipAway(
  room: RoomSnapshot | null,
): { vip: string; next: string | null; nextId: string | null; seconds: number } | null {
  const vip = room?.players.find((p) => p.id === room.vip);
  const away = vip !== undefined && !vip.connected;
  const [tick, setTick] = useState<{ now: number; since: number | null }>({ now: 0, since: null });
  useEffect(() => {
    if (!away) return;
    const update = (): void => setTick((t) => ({ now: Date.now(), since: t.since ?? Date.now() }));
    const handle = setInterval(update, 1000);
    return () => {
      clearInterval(handle);
      setTick({ now: 0, since: null });
    };
  }, [away]);
  if (!room || !vip || !away || tick.since === null) return null;
  const seconds = Math.max(0, Math.ceil((tick.since + LIMITS.vipHandoverMs - tick.now) / 1000));
  const next = nextVip(room);
  return { vip: vip.name, next: next?.name ?? null, nextId: next?.id ?? null, seconds };
}
