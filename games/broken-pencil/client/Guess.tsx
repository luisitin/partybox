// The guess screen and the timer bar's book line (split from Controller.tsx, its line cap).
// I-794 H: whose book and which round ride in the shell's timer bar ("Max's book · 1/6") instead
// of two lines of kicker above the sheet.
import type { JSX } from 'react';
import { TextAnswer, useT, useTimerLabel } from '@partybox/game-sdk/ui';
import type { GameControllerProps, Translator } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
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

/** Guess the drawing that reached you; in a pass the DrawPad follows right after. */
export function Guess({
  view,
  send,
}: GameControllerProps<PencilControllerView, Input>): JSX.Element {
  const L = useT(STRINGS);
  const drawing = view.prompt?.kind === 'drawing' ? view.prompt.drawing : null;
  const last = view.phaseId === 'guess';
  const inBar = useBookInBar(L, view);
  return (
    <TextAnswer
      kicker={inBar ? undefined : stepKicker(L, view)}
      prompt={
        <span className={styles.guessPrompt}>
          <span className={styles.guessDrawing}>
            <DrawingView drawing={drawing} label={L('the drawing to guess')} />
          </span>
          <span className={styles.guessText}>
            {last ? L('Last guess — what is this?') : L('What is this? (you draw it next)')}
          </span>
        </span>
      }
      placeholder={L('Your best guess…')}
      maxLength={40}
      submitted={false}
      submitLabel={last ? L('Send guess') : L('Guess, then draw it')}
      promptKey={`${view.step}:${view.deadline ?? ''}`}
      onSubmit={(text) => send({ type: 'guess', text })}
    />
  );
}
