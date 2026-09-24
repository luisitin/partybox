// The guess screen and the timer bar's book line (split from Controller.tsx, its line cap).
// I-794 H: whose book and which round ride in the shell's timer bar ("Max's book · 1/6") instead
// of two lines of kicker above the sheet. I-795 I: on a guess the field and Send are laid out
// first and the drawing takes the height that is left (tap it to see it large); a keyboard that
// opens shrinks the drawing, never the field.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { TextAnswer, useT, useTimerLabel } from '@partybox/game-sdk/ui';
import type { GameControllerProps, Translator } from '@partybox/game-sdk/ui';
import type { Drawing, Input } from '../server/types';
import type { PencilControllerView } from '../server/views';
import styles from './Controller.module.css';
import { DrawingView } from './DrawingView';
import { STRINGS } from './strings';

/** The kicker's words for a phone with no countdown row (a hidden timer): the old line. */
export function stepKicker(L: Translator, view: PencilControllerView): string {
  const at = { step: view.step, count: view.stepCount };
  const name = view.bookOwnerName ?? null;
  if (name === null) return L("Someone's book · round {step} of {count}", at);
  return L("{name}'s book · round {step} of {count}", { name, ...at });
}

/**
 * Puts "<first name>'s book · step/count" in the shell's timer bar while the screen is mounted.
 * True when the bar carries it; false (no deadline, or the timer hidden) → the screen keeps its
 * kicker.
 */
export function useBookInBar(L: Translator, view: PencilControllerView): boolean {
  const inBar = view.deadline !== null && view.timerMode !== 'hidden';
  const first = view.bookOwnerName?.trim().split(/\s+/)[0] ?? '';
  const text = first ? L("{name}'s book", { name: first }) : L("Someone's book");
  useTimerLabel(inBar ? text : null, `${view.step}/${view.stepCount}`);
  return inBar;
}

/** The drawing over the whole phone; any tap (or Escape) puts it back. */
function DrawingLarge({
  drawing,
  onClose,
}: {
  drawing: Drawing | null;
  onClose: () => void;
}): JSX.Element {
  const L = useT(STRINGS);
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <button type="button" className={styles.large} onClick={onClose} aria-label={L('Close')}>
      <DrawingView
        drawing={drawing}
        label={L('the drawing to guess')}
        size="min(100%, calc(100dvh - 2 * var(--pb-space-4)))"
      />
    </button>
  );
}

/** Guess the drawing that reached you; in a pass the DrawPad follows right after. */
export function Guess({
  view,
  send,
}: GameControllerProps<PencilControllerView, Input>): JSX.Element {
  const L = useT(STRINGS);
  const drawing = view.prompt?.kind === 'drawing' ? view.prompt.drawing : null;
  const last = view.phaseId === 'guess';
  const inBar = useBookInBar(L, view);
  const [large, setLarge] = useState(false);
  return (
    <>
      <TextAnswer
        kicker={inBar ? undefined : stepKicker(L, view)}
        lead={
          <button
            type="button"
            className={styles.guessDrawing}
            onClick={() => setLarge(true)}
            aria-label={L('Show the drawing large')}
          >
            <DrawingView
              drawing={drawing}
              label={L('the drawing to guess')}
              size="min(100cqw, 100cqh)"
            />
          </button>
        }
        prompt={last ? L('Last guess: what is this?') : L('What is this? (you draw it next)')}
        placeholder={L('Your best guess…')}
        maxLength={40}
        submitted={false}
        submitLabel={last ? L('Send guess') : L('Guess, then draw it')}
        promptKey={`${view.step}:${view.deadline ?? ''}`}
        onSubmit={(text) => send({ type: 'guess', text })}
      />
      {large ? <DrawingLarge drawing={drawing} onClose={() => setLarge(false)} /> : null}
    </>
  );
}
