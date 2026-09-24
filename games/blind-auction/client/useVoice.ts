// READER-VOICES on the TV (and on phone-only phones): readings play at the server time the view
// names; fixed lines play on the frame their moment lands. Each url plays once per mount. Mute,
// master level and the music duck come from the shell's sound API.
import { useEffect, useRef } from 'react';
import { useServerOffset, useSoundApi } from '@partybox/game-sdk/ui';

/** Plays `voice` at its server time (late → at once). */
export function useReading(voice: { url: string; at: number } | null): void {
  const sound = useSoundApi();
  const offset = useServerOffset();
  const said = useRef(new Set<string>());
  const url = voice?.url ?? null;
  const at = voice?.at ?? 0;
  useEffect(() => {
    if (!url || said.current.has(url)) return;
    said.current.add(url);
    const delayMs = Math.max(0, at - (Date.now() + offset));
    sound.clip(url, { gain: 1, duck: false, delayMs });
  }, [url, at, offset, sound]);
}

/** Plays a fixed line once per `occasion` when `on` turns true (and it is made): "Going once…"
 *  sounds again after a new bid resets the clock, because the occasion (the standing bid) moved. */
export function useLine(
  url: string | undefined,
  on: boolean,
  delayMs = 0,
  occasion: string | number = '',
): void {
  const sound = useSoundApi();
  const said = useRef(new Set<string>());
  useEffect(() => {
    const key = `${url ?? ''}|${occasion}`;
    if (!on || !url || said.current.has(key)) return;
    said.current.add(key);
    sound.clip(url, { gain: 1, duck: false, delayMs });
  }, [url, on, delayMs, occasion, sound]);
}
