// The reader, on the device that speaks (the TV; a phone only in a phone-only room, where the shell
// hands it `clip`). Each line in `view.say` carries the server time it belongs to and plays then,
// once per phase instance. A line that arrives late plays at once if it still ends before the phase
// does; a stale one (a reload) never.
//
// The bookings live at module level, not in the component: the shell's crossfade hands the old
// component the new view and then unmounts it as the fading ghost, which took its timers with it —
// every line booked at a phase's start was lost (record-review p20 trace). A line is handed to the
// shell only when due: the shell counts a clip as a cue the moment it is asked for, and a voice
// booked ahead swallowed the phase's "pick up your phone" chime (p18).
import { useEffect } from 'react';
import { trace, useServerOffset, useSoundApi } from '@partybox/game-sdk/ui';
import type { SoundApi } from '@partybox/game-sdk/ui';
import type { SayItem } from '../server/views';

/** A line more than this late is stale unless it still fits before the deadline. */
const STALE_MS = 1_500;
const FIT_MS = 300;

/** The newest phase instance any surface has shown, and what it has booked or said. */
let current = { startedAt: -1, instance: '' };
const booked = new Map<string, ReturnType<typeof setTimeout> | null>();

function enter(instance: string, startedAt: number, sound: SoundApi): boolean {
  if (startedAt < current.startedAt) return false; // a fading ghost of an older phase
  if (instance === current.instance) return true;
  const spoke = booked.size > 0;
  for (const timer of booked.values()) if (timer) clearTimeout(timer);
  booked.clear();
  current = { startedAt, instance };
  if (spoke) sound.hush(); // the last phase's line never runs on under this one
  return true;
}

export function useSay(
  items: readonly SayItem[],
  startedAt: number,
  phaseId: string,
  deadline: number | null,
  on = true,
): void {
  const sound = useSoundApi();
  const offset = useServerOffset();
  const instance = `${phaseId}@${startedAt}`;
  const signature = items.map((i) => `${i.key}@${i.at}`).join(',');
  useEffect(() => {
    if (!on || !enter(instance, startedAt, sound)) return;
    const now = Date.now() + offset;
    for (const item of items) {
      const id = `${item.key}@${item.at}`;
      if (booked.has(id)) continue;
      const delay = item.at - now;
      const fits = deadline !== null && now + item.ms + FIT_MS < deadline;
      if (delay < -STALE_MS && !fits) {
        booked.set(id, null);
        trace('ws-say', { key: item.key, instance, skipped: 'stale', delay });
        continue;
      }
      trace('ws-say', { key: item.key, instance, booked: Math.max(0, delay) });
      const timer = setTimeout(
        () => {
          booked.set(id, null);
          trace('ws-say', { key: item.key, instance, fired: true });
          // No duck: the bed stays quietly under the reader (the owner, 2026-09-23, Blanks).
          sound.clip(item.url, { gain: 1, duck: false });
        },
        Math.max(0, delay),
      );
      booked.set(id, timer);
    }
    // `signature` stands for `items` (a new array every push).
  }, [signature, instance, startedAt, on, sound, offset, deadline]);
}
