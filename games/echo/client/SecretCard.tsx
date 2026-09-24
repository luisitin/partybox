// LOCAL STAND-IN for the SDK `SecretCard` (foundation §6; the Imposter session owns it). A card
// back that turns over while held and back when released, so nobody reads the word over a
// shoulder. No text selection, no callout, no context menu; a finger that slides off, a cancelled
// touch or the page hiding all turn it back. Keyboard: hold Space or Enter.
import { useEffect, useState } from 'react';
import type { JSX, PointerEvent } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';
import styles from './secret.module.css';

export interface SecretCardProps {
  word: string;
  /** What the back says. */
  label?: string;
}

export function SecretCard({ word, label }: SecretCardProps): JSX.Element {
  const L = useT(STRINGS);
  const [held, setHeld] = useState(false);
  useEffect(() => {
    if (!held) return undefined;
    const hide = (): void => setHeld(false);
    window.addEventListener('blur', hide);
    document.addEventListener('visibilitychange', hide);
    return () => {
      window.removeEventListener('blur', hide);
      document.removeEventListener('visibilitychange', hide);
    };
  }, [held]);
  const down = (e: PointerEvent<HTMLButtonElement>): void => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setHeld(true);
  };
  const up = (): void => setHeld(false);
  return (
    <button
      type="button"
      className={styles.card}
      data-held={held ? '1' : '0'}
      aria-pressed={held}
      aria-label={held ? word : (label ?? L('Hold to see the word'))}
      onPointerDown={down}
      onPointerUp={up}
      onPointerCancel={up}
      onLostPointerCapture={up}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          setHeld(true);
        }
      }}
      onKeyUp={() => setHeld(false)}
      onBlur={up}
    >
      <span className={styles.inner}>
        <span className={styles.back} aria-hidden>
          <span className={styles.backIcon}>👆</span>
          <span>{label ?? L('Hold to see the word')}</span>
        </span>
        <span className={styles.face} aria-hidden>
          {word}
        </span>
      </span>
    </button>
  );
}
