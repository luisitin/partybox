// A clue-giver's phone during `clue` (§7.4): the word behind a hold-to-see card, one box (two in a
// 3-player game) with the legality line checked as they type (the server re-checks), 🤔 Don't know
// this word (small, only in the first 15 s and while spares last), and a sticky Lock it in that
// becomes Change. A sent clue is held locally until the view confirms it — no double send.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { PrimaryButton, Screen, useHold, useServerNow, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps, Translator } from '@partybox/game-sdk/ui';
import { isLegalClue, sameAnswer } from '@partybox/game-sdk/match';
import type { ClueReject, Input } from '../server/types';
import { CLUE_MAX_CHARS } from '../shared/rules';
import type { EchoControllerView } from '../server/views';
import { SecretCard } from '@partybox/game-sdk/ui/secret-card';
import { EnglishTag } from './EnglishTag';
import { STRINGS } from './strings';
import styles from './phone.module.css';

export function rejectText(L: Translator, reason: ClueReject): string {
  switch (reason) {
    case 'empty':
      return L('Type a clue first.');
    case 'too-long':
      return L('Keep it under 20 letters.');
    case 'not-one-word':
      return L('One word only.');
    case 'is-secret':
      return L("That's the word! Try another.");
    case 'contains-secret':
      return L('Too close to the word. Try another.');
    case 'twin':
      return L('Two different words, please.');
    case 'count':
      return L('Two clues, please.');
  }
}

type Secret = NonNullable<EchoControllerView['secret']>;

function problemOf(text: string, secret: Secret): ClueReject | null {
  if (text.trim().length === 0) return null;
  const res = isLegalClue(text, secret, { lang: 'en', oneWord: true, maxChars: CLUE_MAX_CHARS });
  return res.ok ? null : res.reason;
}

export function PhoneClue({
  view,
  send,
}: GameControllerProps<EchoControllerView, Input>): JSX.Element {
  const L = useT(STRINGS);
  const secret = view.secret as Secret;
  const n = view.tv.twoClues ? 2 : 1;
  const locked = view.myClues.length > 0;
  const [drafts, setDrafts] = useState<string[]>(() =>
    locked ? [...view.myClues] : Array.from({ length: n }, () => ''),
  );
  const [editing, setEditing] = useState(!locked);
  const [pending, setPending] = useState<string | null>(null);
  const now = useServerNow(500);
  // An empty box breathes after 3 s: a nudge, and the waiting screen is never frozen.
  const stalled = useHold(secret.id, 3000);
  // The server took it: leave edit mode (adjusted in render, React's pattern for derived state).
  // A refused one (or no answer in 2 s) frees the button again.
  if (pending && JSON.stringify(view.myClues) === pending) {
    setPending(null);
    setEditing(false);
  }
  useEffect(() => {
    if (!pending) return undefined;
    const t = setTimeout(() => setPending(null), 2000);
    return () => clearTimeout(t);
  }, [pending, view.reject]);
  const problems = drafts.map((d) => problemOf(d, secret));
  const twin =
    n === 2 && drafts[0]?.trim() && drafts[1]?.trim() && sameAnswer(drafts[0], drafts[1], 'en');
  const firstProblem: ClueReject | null =
    problems.find((p) => p !== null) ?? (twin ? 'twin' : null);
  const complete = drafts.every((d) => d.trim().length > 0);
  const canSend = complete && !firstProblem && !pending && editing;
  const guesser = view.players.find((p) => p.id === view.tv.guesser)?.name ?? '?';
  const submit = (): void => {
    if (!canSend) return;
    const texts = drafts.map((d) => d.trim());
    setPending(JSON.stringify(texts));
    send({ type: 'clue', texts });
  };
  const dk = view.dontKnow;
  const showDontKnow = dk !== null && dk.open && now < dk.closesAt && !locked;
  const serverReject = view.reject && !pending && editing ? rejectText(L, view.reject) : null;
  const legalLine = firstProblem
    ? rejectText(L, firstProblem)
    : complete
      ? L('✓ Good to go')
      : L('Type one word, then Lock it in');
  const footer = editing ? (
    <PrimaryButton disabled={!canSend} onClick={submit}>
      {pending ? L('Sending…') : L('Lock it in')}
    </PrimaryButton>
  ) : (
    <PrimaryButton tone="neutral" onClick={() => setEditing(true)}>
      {L('Change')}
    </PrimaryButton>
  );
  return (
    <Screen className={styles.screen} footer={footer}>
      <div className={styles.stack}>
        <p className={styles.kicker}>
          {L('Word {n} of {total}', { n: view.tv.wordNo, total: view.tv.deckSize })}
          <EnglishTag />
        </p>
        <p className={styles.prompt}>
          {n === 2
            ? L('Two different words to help {name}', { name: guesser })
            : L('One word to help {name}', { name: guesser })}
        </p>
        {editing ? (
          drafts.map((d, i) => (
            <div className={styles.field} key={i}>
              <input
                className={styles.input}
                value={d}
                maxLength={CLUE_MAX_CHARS}
                data-bad={problems[i] ? '1' : '0'}
                data-idle={stalled && d.length === 0 ? '1' : '0'}
                aria-label={n === 2 ? L('Clue {n}', { n: i + 1 }) : L('Your clue')}
                placeholder={n === 2 ? L('Clue {n}', { n: i + 1 }) : L('Your clue')}
                autoComplete="off"
                autoCorrect="on"
                autoCapitalize="none"
                spellCheck
                enterKeyHint="done"
                onChange={(e) => setDrafts(drafts.map((x, j) => (j === i ? e.target.value : x)))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submit();
                }}
              />
            </div>
          ))
        ) : (
          <div className={styles.locked}>
            {view.myClues.map((c) => (
              <span key={c} className={`${styles.chip} ${styles.chipMine}`}>
                ✓ {c}
              </span>
            ))}
          </div>
        )}
        {editing ? (
          <p
            className={styles.legal}
            data-bad={firstProblem ? '1' : '0'}
            data-ok={complete && !firstProblem ? '1' : '0'}
          >
            {legalLine}
          </p>
        ) : (
          <p className={styles.hint}>{L('Locked in. Waiting for the others…')}</p>
        )}
        <SecretCard
          key={secret.id}
          backLabel={L('Hold to see the word')}
          label={L('Hold to see the word')}
        >
          <span className={styles.secretWord}>{secret.answer}</span>
        </SecretCard>
        {serverReject ? <p className={styles.errorLine}>{serverReject}</p> : null}
        {showDontKnow ? (
          <button
            type="button"
            className={styles.ghost}
            data-on={dk.mine ? '1' : '0'}
            disabled={dk.mine}
            onClick={() => send({ type: 'dontKnow' })}
          >
            {dk.mine ? L('🤔 Asked for a new word…') : L("🤔 Don't know this word")}
          </button>
        ) : null}
      </div>
    </Screen>
  );
}
