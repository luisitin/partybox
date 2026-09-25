// The active spymaster's clue box (SPEC §9.5, §9.8): one word (20 letters), a number from 1 to 9
// on 44 px steppers, the same legality check the server runs as they type, a preview of what the
// reader will say, and a sticky Send clue. A refused clue shows the server's reason.
import { useState } from 'react';
import type { JSX } from 'react';
import { PrimaryButton, buzz, useSound, useT } from '@partybox/game-sdk/ui';
import type { Translator } from '@partybox/game-sdk/ui';
import { CLUE_MAX, clueClash, clueProblem } from '../server/clue-rules';
import type { SpyControllerView } from '../server/views';
import type { ClueReason, Input } from '../server/types';
import styles from './Controller.module.css';
import { STRINGS } from './strings';

export function reasonText(reason: ClueReason, L: Translator, clash?: string | null): string {
  // Name the clashing word: 'BATHROOM' against BAT reads as a bug until you see why (session-c).
  if (reason === 'board' && clash)
    return L('Too close to {word} on the board.', { word: clash.toUpperCase() });
  switch (reason) {
    case 'one-word':
      return L('One word only.');
    case 'too-long':
      return L('Keep it under 20 letters.');
    case 'digits':
      return L('No numbers in the word. Use the number box.');
    default:
      return L("That's (too close to) a word on the board.");
  }
}

function targets(view: SpyControllerView): { answer: string; family: string[] }[] {
  return view.words
    .map((w, i) => ({ w, i }))
    .filter(({ i }) => view.kinds[i] === null)
    .map(({ w, i }) => ({ answer: w.toLowerCase(), family: view.roots?.[String(i)] ?? [] }));
}

export function useClueDraft(): {
  word: string;
  setWord: (w: string) => void;
  number: number;
  setNumber: (n: number) => void;
} {
  const [word, setWord] = useState('');
  const [number, setNumber] = useState(2);
  return { word, setWord, number, setNumber };
}

export function ClueInputs({
  view,
  draft,
}: {
  view: SpyControllerView;
  draft: ReturnType<typeof useClueDraft>;
}): JSX.Element {
  const L = useT(STRINGS);
  const problem = draft.word.trim() ? clueProblem(draft.word, targets(view)) : null;
  const server =
    view.clueError && view.clueError.word.trim().toUpperCase() === draft.word.trim().toUpperCase()
      ? view.clueError.reason
      : null;
  const bad = problem ?? server;
  const n = draft.number;
  return (
    <div className={styles.form}>
      <div className={styles.clueRow}>
        <input
          className={`${styles.input} ${bad ? styles.bad : ''}`}
          value={draft.word}
          maxLength={CLUE_MAX}
          placeholder={L('One word')}
          aria-label={L('Your clue')}
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="send"
          onChange={(e) => draft.setWord(e.target.value.replace(/\s+/g, ''))}
        />
        <div className={styles.stepper}>
          <button
            type="button"
            className={styles.step}
            aria-label={L('One fewer')}
            aria-disabled={n <= 1}
            onClick={() => {
              if (n > 1) {
                draft.setNumber(n - 1);
                buzz(8);
              }
            }}
          >
            −
          </button>
          <span className={styles.stepValue} aria-live="polite">
            {n}
          </span>
          <button
            type="button"
            className={styles.step}
            aria-label={L('One more')}
            aria-disabled={n >= 9}
            onClick={() => {
              if (n < 9) {
                draft.setNumber(n + 1);
                buzz(8);
              }
            }}
          >
            +
          </button>
        </div>
      </div>
      <div className={`${styles.legal} ${bad ? styles.legalBad : styles.legalOk}`}>
        {bad
          ? reasonText(bad, L, clueClash(draft.word, targets(view)))
          : draft.word.trim()
            ? L("You'll say: {word}, {n}", { word: draft.word.trim().toUpperCase(), n })
            : L('Clues are about meaning — not letters or spots on the grid.')}
      </div>
    </div>
  );
}

export function SendClue({
  view,
  draft,
  send,
}: {
  view: SpyControllerView;
  draft: ReturnType<typeof useClueDraft>;
  send: (input: Input) => void;
}): JSX.Element {
  const L = useT(STRINGS);
  const play = useSound();
  const [sentWord, setSentWord] = useState<string | null>(null);
  const word = draft.word.trim();
  const ok = word.length > 0 && clueProblem(word, targets(view)) === null;
  const waiting = sentWord !== null && sentWord === word && !view.clueError;
  return (
    <PrimaryButton
      disabled={!ok || waiting}
      className={ok && !waiting ? styles.breathe : undefined}
      onClick={() => {
        buzz(20);
        play('submit');
        setSentWord(word);
        send({ type: 'clue', word, number: draft.number });
      }}
    >
      {waiting ? L('Sending…') : L('Send clue')}
    </PrimaryButton>
  );
}
