// The reader, on the device that speaks (the TV; a phone only in a phone-only room, where the shell
// hands it `clip`). Each line in `view.say` carries the server time it belongs to: a line plays at
// that moment — scheduled, so two lines land back to back — once per phase instance. A line that
// arrives late plays at once if it still ends before the phase does; a stale one (a reload) never.
import { useEffect, useRef } from 'react';
import { useServerOffset, useSoundApi } from '@partybox/game-sdk/ui';
import type { SayItem } from '../server/views';

/** A line more than this late is stale unless it still fits before the deadline. */
const STALE_MS = 1_500;
const FIT_MS = 300;

export function useSay(
  items: readonly SayItem[],
  instance: string,
  deadline: number | null,
  on = true,
): void {
  const sound = useSoundApi();
  const offset = useServerOffset();
  const said = useRef(new Set<string>());
  const phase = useRef(instance);
  const signature = items.map((i) => `${i.key}@${i.at}`).join(',');
  // A new phase instance: whatever the last one was saying stops, so lines never overlap.
  useEffect(() => {
    if (phase.current === instance) return;
    phase.current = instance;
    if (said.current.size > 0) sound.hush();
  }, [instance, sound]);
  useEffect(() => {
    if (!on) return;
    const now = Date.now() + offset;
    for (const item of items) {
      const id = `${instance}|${item.key}@${item.at}`;
      if (said.current.has(id)) continue;
      said.current.add(id);
      const delay = item.at - now;
      const fits = deadline !== null && now + item.ms + FIT_MS < deadline;
      if (delay < -STALE_MS && !fits) continue;
      // No duck: the bed stays quietly under the reader (the owner, 2026-09-23, Blanks).
      sound.clip(item.url, { delayMs: Math.max(0, delay), gain: 1, duck: false });
    }
    // `signature` stands for `items` (a new array every push).
  }, [signature, instance, on, sound, offset, deadline]);
}
