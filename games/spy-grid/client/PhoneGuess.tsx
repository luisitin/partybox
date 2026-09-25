// The active team's guesser (SPEC §9.5): tap a card → "Point at SHARK?" with Point ☝️ / Cancel;
// your face then sits on it and a second tap offers Take back. End turn ✋ comes after the turn's
// first flip and works the same way. Long-press a card for 👍 👎 🤔. A tap waits for the server's
// echo before it counts again, so mashing never double-sends.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { buzz, useT } from '@partybox/game-sdk/ui';
import type { SpyControllerView } from '../server/views';
import type { Input } from '../server/types';
import { BoardScreen } from './BoardScreen';
import { ClueLine, PhoneBoard, Scores } from './PhoneParts';
import styles from './Controller.module.css';
import { STRINGS } from './strings';

type Pending = { kind: 'confirm'; card: number } | { kind: 'react'; card: number } | null;

export function PhoneGuess({
  view,
  send,
}: {
  view: SpyControllerView;
  send: (input: Input) => void;
}): JSX.Element {
  const L = useT(STRINGS);
  const [pending, setPending] = useState<Pending>(null);
  // The target we sent and are waiting on (cleared by the echo: myPointer catches up).
  const [sent, setSent] = useState<number | 'end' | 'none' | null>(null);
  const mine = view.myPointer;
  if (sent !== null && ((sent === 'none' && mine === null) || sent === mine)) setSent(null);
  // An input the server ignored never echoes: give the taps back after a beat.
  useEffect(() => {
    if (sent === null) return undefined;
    const t = setTimeout(() => setSent(null), 1500);
    return () => clearTimeout(t);
  }, [sent]);
  const word = (i: number): string => view.words[i] ?? '';

  const point = (target: number | 'end'): void => {
    if (sent !== null) return;
    setSent(target);
    setPending(null);
    buzz(15);
    send({ type: 'point', target });
  };
  const takeBack = (): void => {
    if (sent !== null) return;
    setSent('none');
    setPending(null);
    send({ type: 'unpoint' });
  };
  const onTap = (i: number): void => {
    if (view.kinds[i] !== null) return;
    setPending(mine === i ? null : { kind: 'confirm', card: i });
  };
  const onLong = (i: number): void => {
    buzz(10);
    setPending({ kind: 'react', card: i });
  };

  let footer: JSX.Element;
  if (pending?.kind === 'react') {
    footer = (
      <div className={styles.bar}>
        <div className={styles.barLine}>{L('React to {word}', { word: word(pending.card) })}</div>
        <div className={styles.reactRow}>
          {(['👍', '👎', '🤔'] as const).map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={styles.react}
              aria-label={emoji}
              onClick={() => {
                send({ type: 'react', card: pending.card, emoji });
                setPending(null);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    );
  } else if (pending?.kind === 'confirm') {
    footer = (
      <div className={styles.bar}>
        <div className={styles.barLine}>{L('Point at {word}?', { word: word(pending.card) })}</div>
        <div className={styles.row}>
          <button type="button" className={styles.button} onClick={() => setPending(null)}>
            {L('Cancel')}
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.primary}`}
            onClick={() => point(pending.card)}
          >
            {L('Point ☝️')}
          </button>
        </div>
      </div>
    );
  } else if (mine !== null) {
    footer = (
      <div className={styles.bar}>
        <div className={styles.barLine}>
          {mine === 'end'
            ? L('You voted to end the turn ✋')
            : L('You point at {word} ☝️', { word: word(mine) })}
        </div>
        <button type="button" className={styles.button} onClick={takeBack}>
          {L('Take back')}
        </button>
      </div>
    );
  } else {
    footer = (
      <div className={styles.bar}>
        <div className={styles.barLine}>{L('Tap a card to point at it')}</div>
        {view.canEnd ? (
          <button type="button" className={styles.button} onClick={() => point('end')}>
            {L('End turn ✋')}
          </button>
        ) : null}
      </div>
    );
  }
  return (
    <BoardScreen
      footer={footer}
      side={
        <>
          <Scores view={view} />
          <ClueLine view={view} rule />
        </>
      }
      board={
        <PhoneBoard
          view={view}
          onTap={onTap}
          onLongPress={onLong}
          pending={pending?.kind === 'confirm' ? pending.card : null}
        />
      }
    />
  );
}
