// Which ends of a scrolling box have more beyond them, watched through scroll and resize. Nobody
// scrolls a TV to find out, so a list that cannot fit fades the edge a row is cut at: a half row
// then reads as "more this way", not as a broken layout.
import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

export interface ScrollEdges {
  up: boolean;
  down: boolean;
}

export function useScrollEdges(ref: RefObject<HTMLElement | null>): ScrollEdges {
  const [edges, setEdges] = useState<ScrollEdges>({ up: false, down: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const check = (): void => {
      const up = el.scrollTop > 1;
      const down = el.scrollHeight - el.clientHeight - el.scrollTop > 1;
      setEdges((e) => (e.up === up && e.down === down ? e : { up, down }));
    };
    check();
    el.addEventListener('scroll', check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', check);
      ro.disconnect();
    };
  }, [ref]);
  return edges;
}
