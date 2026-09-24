// Phone during "clue" (SPEC §1.4): the secret strip, one prompt for every role, a one-word box
// (autocapitalize/autocorrect/spellcheck off, so the clue is exactly what was typed), the legality
// line (crew only — its space is reserved for everyone so both roles' screens look the same),
// "Clues so far" from clue round two, and a sticky Lock it in → "Locked in: 'crust'" with Change.
import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { PrimaryButton, Screen, buzz, useSound, useT } from '@partybox/game-sdk/ui';
import type { Translator } from '@partybox/game-sdk/ui';
import { isLegalClue, sameAnswer } from '../match';
import type { RejectReason } from '../server/types';
import { PhoneSecret } from './PhoneCards';
import type { Props } from './PhoneCards';
import { byId } from './shared';
import { STRINGS } from './strings';
import styles from './phone.module.css';

const MAX = 20;

export function reasonText(L: Translator, why: RejectReason): string {
  switch (why) {
    case 'empty':
      return L('Type a clue first.');
    case 'too-long':
      return L('Keep it to 20 letters.');
    case 'not-one-word':
      return L('One word only.');
    case 'is-secret':
      return L("That's the word! Try another.");
    case 'contains-secret':
      return L('Too close to the word. Try another.');
    case 'repeat':
      return L('Someone already said that.');
  }
}

/** The live check as the player types: the same rules the server runs, secret ones crew-only. */
function liveProblem(view: Props['view'], text: string): RejectReason | null {
  const raw = text.trim();
  if (!raw) return null;
  if ([...raw].length > MAX) return 'too-long';
  if (raw.split(/\s+/).length > 1) return 'not-one-word';
  if (view.role === 'crew' && view.word) {
    const v = isLegalClue(raw, { id: 'w', ...view.word }, { oneWord: true, maxChars: MAX });
    if (!v.ok) return v.reason;
  }
  const board = view.stage.board.flatMap((c) => c.before);
  if (board.some((b) => sameAnswer(b, raw))) return 'repeat';
  return null;
}

export function PhoneClue({ view, send }: Props): JSX.Element {
  const L = useT(STRINGS);
  const play = useSound();
  const locked = view.mine.clue;
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const reject = view.mine.reject;
  // A server turn-down buzzes once per new reason (the counter changes), like the shell's error.
  const seen = useRef(reject?.n ?? 0);
  useEffect(() => {
    if (reject && reject.n !== seen.current) {
      seen.current = reject.n;
      buzz([40, 60, 40]);
      play('error');
    }
  }, [reject, play]);
  const open = locked === null || editing;
  const problem = liveProblem(view, text);
  const shown = problem ?? (reject && !editing && locked === null ? reject.why : null);
  const canSend = text.trim().length > 0 && problem === null;
  const submit = (): void => {
    if (!canSend) return;
    send({ type: 'clue', text: text.trim() });
    setEditing(false);
  };
  const who = byId(view.players);
  const earlier = view.stage.board.filter((c) => c.before.length > 0);
  return (
    <Screen
      footer={
        open ? (
          <PrimaryButton disabled={!canSend} onClick={submit}>
            {L('Lock it in')}
          </PrimaryButton>
        ) : (
          <PrimaryButton
            tone="neutral"
            onClick={() => {
              setText(locked ?? '');
              setEditing(true);
              requestAnimationFrame(() => input.current?.focus());
            }}
          >
            {L('Change')}
          </PrimaryButton>
        )
      }
    >
      <PhoneSecret view={view} mini />
      <p className={styles.prompt}>{L('One word about the secret word')}</p>
      {open ? (
        <input
          ref={input}
          className={styles.clueBox}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX + 4))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
          maxLength={MAX + 4}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="done"
          placeholder={L('one word')}
          aria-label={L('Your clue')}
          aria-invalid={shown !== null}
          aria-describedby="imp-clue-line"
        />
      ) : (
        <p className={styles.locked} role="status">
          <span>{L('Locked in:')}</span> <b>“{locked}”</b>
        </p>
      )}
      <p
        id="imp-clue-line"
        className={`${styles.legal} ${shown ? styles.bad : ''}`}
        aria-live="polite"
      >
        {open
          ? shown
            ? `⚠ ${reasonText(L, shown)}`
            : `${[...text.trim()].length} / ${MAX}`
          : L('Waiting for the others…')}
      </p>
      {earlier.length > 0 ? (
        <details className={styles.soFar} open={window.innerHeight >= 600}>
          <summary>{L('Clues so far')}</summary>
          <ul>
            {earlier.map((c) => (
              <li key={c.by}>
                <b>{who.get(c.by)?.name ?? '?'}</b> · {c.before.join(', ')}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </Screen>
  );
}
