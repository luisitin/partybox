// The read-along: a soft highlight steps from word to word as the reader reads, timed from the
// server's reading start and the reading's real length (by characters), so every TV and phone
// lands each word on the same frame. While the voice is still being made, a shimmer wave runs
// through the words instead. Opacity only (a ::before per word); off under reduced motion.
import { Fragment, useLayoutEffect, useRef } from 'react';
import type { JSX, ReactNode } from 'react';
import { useServerOffset } from '@partybox/game-sdk/ui';
import type { ReadAlongView } from '../server/views-common';
import styles from './fakeout.module.css';

/** One piece of text to read: words, or an element (the blank) that counts as `chars` letters. */
export type ReadPiece = { text: string } | { node: ReactNode; chars: number };

interface Timed {
  key: string;
  node: ReactNode;
  word: boolean;
  t: number;
  dur: number;
}

/** Splits the pieces into words (spaces kept as plain text) and times each word by characters. */
export function timeWords(pieces: readonly ReadPiece[], ms: number): Timed[] {
  const out: Timed[] = [];
  const weights: number[] = [];
  pieces.forEach((p, i) => {
    if ('node' in p) {
      out.push({ key: `n${i}`, node: p.node, word: true, t: 0, dur: 0 });
      weights.push(p.chars);
      return;
    }
    p.text.split(/(\s+)/).forEach((tok, j) => {
      if (tok.length === 0) return;
      const word = !/^\s+$/.test(tok);
      out.push({ key: `w${i}.${j}`, node: tok, word, t: 0, dur: 0 });
      weights.push(word ? tok.length + (/[,.;:!?]$/.test(tok) ? 3 : 0) : 0);
    });
  });
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  out.forEach((w, i) => {
    const weight = weights[i] ?? 0;
    w.t = Math.round((acc / total) * ms);
    w.dur = Math.max(160, Math.round((weight / total) * ms));
    acc += weight;
  });
  return out;
}

export interface ReadAlongProps {
  pieces: readonly ReadPiece[];
  read: ReadAlongView | undefined;
}

export function ReadAlong({ pieces, read }: ReadAlongProps): JSX.Element {
  const offset = useServerOffset();
  const host = useRef<HTMLSpanElement>(null);
  const timed = read && read !== 'waiting' ? read : null;
  const at = timed?.at ?? 0;
  const ms = timed?.ms ?? 0;
  const words = timeWords(pieces, ms || 1200);
  // The start is written straight onto the DOM, once per reading (its start and length): a new
  // animation-delay on every push would shift the running highlight (a jump), and the clock
  // offset's small re-measures must not restart it either.
  useLayoutEffect(() => {
    const el = host.current;
    if (!el) return;
    el.classList.remove(styles.reading ?? 'reading');
    if (ms <= 0) return;
    el.style.setProperty('--read-base', `${at - (Date.now() + offset)}ms`);
    void el.offsetWidth; // restart the animations for this reading
    el.classList.add(styles.reading ?? 'reading');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on the reading, not the offset
  }, [at, ms]);
  return (
    <span ref={host} className={read === 'waiting' ? styles.waiting : undefined}>
      {words.map((w, i) =>
        w.word ? (
          <span
            key={w.key}
            className={styles.word}
            style={{
              ['--t' as string]: `${w.t}ms`,
              ['--dur' as string]: `${w.dur}ms`,
              ['--wi' as string]: i,
            }}
          >
            {w.node}
          </span>
        ) : (
          <Fragment key={w.key}>{w.node}</Fragment>
        ),
      )}
    </span>
  );
}
