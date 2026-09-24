// Phone answer, tiles: the question, then the eight tiles in two columns (one column when the
// text is big). A tap locks that tile at once (✓ + buzz) and sends it; tapping another changes it
// until the phase ends. The server's echo (`mine`) confirms; a tap it never answered says so.
import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { buzz, Screen, useSound, useT } from '@partybox/game-sdk/ui';
import type { PushedView } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { HerdControllerView } from '../server/views';
import { kicker } from './labels';
import { WaitingFor } from './WaitingFor';
import { STRINGS } from './strings';
import styles from './Controller.module.css';

const ECHO_TIMEOUT_MS = 4_000;

export function PhoneTiles({
  view,
  send,
}: {
  view: PushedView<HerdControllerView>;
  send: (input: Input) => void;
}): JSX.Element {
  const L = useT(STRINGS);
  const play = useSound();
  const confirmed = view.mine?.tile ?? null;
  const [pending, setPending] = useState<{ id: string; at: number } | null>(null);
  const [failed, setFailed] = useState(false);
  // Each tap is its own attempt (the retry timer restarts per tap).
  const taps = useRef(0);
  // A pending tap resolves when the server echoes it (or times out into a retry line).
  const waiting = pending !== null && pending.id !== confirmed;
  useEffect(() => {
    if (!waiting) return undefined;
    const t = window.setTimeout(() => setFailed(true), ECHO_TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, [waiting, pending]);
  const chosen = waiting ? pending.id : confirmed;
  // Only a tap still unanswered is stuck; a late echo clears it.
  const stuck = failed && waiting;
  const tap = (id: string): void => {
    if (id === chosen && !stuck) return; // a second tap on your own pick is nothing
    taps.current += 1;
    setPending({ id, at: taps.current });
    setFailed(false);
    buzz(20);
    play('submit');
    send({ type: 'pick', tile: id });
  };
  const label = view.tiles?.find((t) => t.id === chosen)?.label ?? '';
  return (
    <Screen
      className={styles.answerScreen}
      footer={
        <p className={styles.status} role="status">
          {stuck
            ? L("✗ Didn't go through — tap again")
            : chosen
              ? L('Locked: {answer} · tap another to change', { answer: label })
              : L('Tap what most people will pick')}
          {chosen && !stuck ? <WaitingFor view={view} me={view.me.id} /> : null}
        </p>
      }
    >
      <header className={styles.ask}>
        <p className={styles.kicker}>{kicker(view.n, view.total, view.target, L)}</p>
        <h2 className={styles.prompt} lang="en">
          {view.prompt}
        </h2>
      </header>
      <div className={styles.tilesWrap}>
        <div
          className={`${styles.tiles} ${(view.tiles?.length ?? 0) <= 4 ? styles.few : ''}`}
          role="group"
          aria-label={L('answers')}
        >
          {(view.tiles ?? []).map((t) => {
            const on = t.id === chosen;
            return (
              <button
                key={t.id}
                type="button"
                className={`${styles.tile} ${on ? styles.tileOn : ''}`}
                aria-pressed={on}
                onClick={() => tap(t.id)}
              >
                <span className={styles.tileLabel} lang="en">
                  {t.label}
                </span>
                <span className={styles.tick} aria-hidden>
                  {on ? '✓' : ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Screen>
  );
}
