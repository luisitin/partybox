// The phone's `rank`: the question, "Tap from Best to Worst", the OrderPicker, and a sticky
// "Lock it in" that is live once all five have numbers. Locked: "✓ Locked in" with Change (the
// locked order keeps counting until a new one is locked). Only complete orders are ever sent; one
// tap sends once (a locking state until the server echoes, a retry after 4 s of silence).
import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { PrimaryButton, Screen, useSound, useT } from '@partybox/game-sdk/ui';
import { OrderPicker } from '@partybox/game-sdk/ui/order-picker';
import type { HiveControllerView } from '../server/views';
import type { Input } from '../server/types';
import { STRINGS } from './strings';
import styles from './Phone.module.css';

const ECHO_MS = 4000;
/** Change sits where Lock it in was: taps this soon after locking are the same mash, not a change. */
const CHANGE_ARM_MS = 700;
/** A prompt longer than this steps down a size: two lines on a 320 px phone, never three. */
const LONG_PROMPT = 36;

function same(a: readonly string[] | null, b: readonly string[] | null): boolean {
  return a !== null && b !== null && a.join('\n') === b.join('\n');
}

export function PhoneRank({
  view,
  send,
}: {
  view: HiveControllerView;
  send: (input: Input) => void;
}): JSX.Element {
  const L = useT(STRINGS);
  const play = useSound();
  const q = view.question;
  // Local picks; a reconnect (or a reload) starts from the order the server holds.
  const [picks, setPicks] = useState<string[]>(() => view.mine ?? []);
  const [editing, setEditing] = useState(false);
  const [sending, setSending] = useState<string[] | null>(null);
  const [failed, setFailed] = useState(false);
  // Synchronous guards: a triple tap lands before React re-renders the footer.
  const lockedAt = useRef(0);
  const echoed = same(view.mine, sending);
  useEffect(() => {
    if (sending === null || echoed) return;
    const h = setTimeout(() => {
      setSending(null);
      setFailed(true);
    }, ECHO_MS);
    return () => clearTimeout(h);
  }, [sending, echoed]);
  if (!q) return <Screen>{null}</Screen>;
  const locked = view.locked && !editing;
  const waiting = sending !== null && !echoed;
  const full = picks.length === q.items.length;
  const lock = (): void => {
    const now = performance.now();
    if (!full || waiting || now - lockedAt.current < CHANGE_ARM_MS) return;
    lockedAt.current = now;
    setFailed(false);
    setSending(picks);
    setEditing(false);
    play('submit');
    send({ type: 'order', items: picks });
  };
  const footer = locked ? (
    <div className={styles.lockedBar}>
      <span className={styles.lockedText} role="status">
        {L('✓ Locked in')}
      </span>
      <PrimaryButton
        tone="neutral"
        className={styles.change}
        onClick={() => {
          if (performance.now() - lockedAt.current < CHANGE_ARM_MS) return;
          setPicks(view.mine ?? picks);
          setEditing(true);
        }}
      >
        {L('Change')}
      </PrimaryButton>
    </div>
  ) : (
    <div className={styles.lockBar}>
      <button
        type="button"
        className={styles.resetButton}
        aria-label={L('Reset')}
        disabled={picks.length === 0 || waiting}
        onClick={() => {
          setFailed(false);
          setPicks([]);
        }}
      >
        ↺
      </button>
      <PrimaryButton disabled={!full || waiting} onClick={lock} className={styles.lockButton}>
        {waiting
          ? L('Locking in…')
          : full
            ? L('Lock it in')
            : L('{n} more to place', { n: q.items.length - picks.length })}
      </PrimaryButton>
    </div>
  );
  return (
    <Screen footer={footer} className={styles.rankScreen}>
      <h2 className={`${styles.prompt} ${q.prompt.length > LONG_PROMPT ? styles.promptLong : ''}`}>
        {q.prompt}
      </h2>
      <OrderPicker
        items={q.items}
        value={locked && view.mine ? view.mine : picks}
        onChange={(next) => {
          setFailed(false);
          setPicks(next);
        }}
        disabled={locked || waiting}
        reset={false}
        label={q.prompt}
        hint={
          <span className={styles.hintStack}>
            <span className={styles.kicker}>
              {L('Round {n} of {total}', { n: view.round, total: view.rounds })}
            </span>
            <span>{L('Tap from {top} to {bottom}', { top: q.top, bottom: q.bottom })}</span>
          </span>
        }
      />
      {failed ? (
        <p className={styles.retry} role="status">
          {L('✗ Didn’t go through — tap Lock it in again')}
        </p>
      ) : editing && view.locked ? (
        <p className={styles.note}>
          {L('Your locked order still counts until you lock a new one.')}
        </p>
      ) : null}
    </Screen>
  );
}
