// Phone "lie" (SPEC §3.4): the fact, a 40-character box (autocorrect on — spelling gives lies
// away), 💡 Suggest once per question (two chips; a tap fills the box, still editable), the
// legality line, and a sticky Lock it in. Locked: "Locked in: 'moose'" with Change. A refusal
// (the truth typed by accident) buzzes once and says so — the one deliberate exception to
// Part 00 §7 rule 13.
import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { PrimaryButton, Screen, buzz, usePhoneOnly, useSound, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { FakeOutControllerView } from '../server/index';
import type { Input } from '../server/types';
import { FactCard } from './FactCard';
import { STRINGS } from './strings';
import { EnglishTag } from './EnglishNote';
import { kicker } from './labels';
import styles from './phone.module.css';

type Props = GameControllerProps<FakeOutControllerView, Input>;

export const LIE_MAX = 40;
/** How long a sent lie shows as locked without the server's answer before the editor returns. */
const SEND_WAIT_MS = 4_000;

export function PhoneLie({ view, send }: Props): JSX.Element {
  const L = useT(STRINGS);
  const phoneOnly = usePhoneOnly();
  const play = useSound();
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(view.myLie === null);
  /** The lie on its way to the server: shown as locked at once (no flicker back to the editor)
   *  until the server's copy replaces the lie it had (`before`), a refusal arrives, or
   *  SEND_WAIT_MS passes. */
  const [sending, setSending] = useState<{ text: string; before: string | null } | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const rejectedN = view.rejected?.n ?? 0;
  const seenRejection = useRef(rejectedN);
  useEffect(() => {
    if (rejectedN <= seenRejection.current) return;
    seenRejection.current = rejectedN;
    setEditing(true);
    setSending(null);
    buzz([40, 60, 40]);
    play('wrong');
  }, [rejectedN, play]);
  useEffect(() => {
    if (sending === null) return undefined;
    const handle = setTimeout(() => setSending(null), SEND_WAIT_MS);
    return () => clearTimeout(handle);
  }, [sending]);
  const trimmed = draft.trim();
  const inFlight = sending !== null && view.myLie === sending.before ? sending.text : null;
  const canLock = trimmed.length > 0 && [...trimmed].length <= LIE_MAX && inFlight === null;
  const lock = (): void => {
    if (!canLock) return;
    setSending({ text: trimmed, before: view.myLie });
    setEditing(false);
    input.current?.blur();
    send({ type: 'lie', text: trimmed });
  };
  const message =
    view.rejected && editing
      ? view.rejected.why === 'truth'
        ? L("That's actually the truth! Write a fake one.")
        : view.rejected.why === 'too-long'
          ? L('Keep it under 40 characters.')
          : L('Type a fake answer.')
      : null;
  const shownLie = inFlight ?? view.myLie;
  const locked = shownLie !== null && !editing;
  return (
    <Screen
      className={styles.screen}
      footer={
        locked ? (
          <PrimaryButton
            tone="neutral"
            onClick={() => {
              setDraft(shownLie ?? '');
              setSending(null);
              setEditing(true);
              requestAnimationFrame(() => input.current?.focus());
            }}
          >
            {L('Change')}
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={lock} disabled={!canLock}>
            {L('Lock it in')}
          </PrimaryButton>
        )
      }
    >
      <p className={`${styles.kicker} ${view.final ? styles.kickerFinal : ''}`}>
        {kicker(L, view)}
        <EnglishTag />
      </p>
      <FactCard fact={view.fact} size="phone" className={styles.fact} />
      {locked ? (
        <div className={styles.locked} role="status" key="locked">
          <span className={styles.lockedLabel}>{L('Locked in')}</span>
          <span className={styles.lockedText}>“{shownLie}”</span>
          <span className={styles.lockedHint}>
            {phoneOnly ? L('Waiting for the others…') : L('Waiting for the others — watch the TV')}
          </span>
        </div>
      ) : (
        <>
          <label className={styles.inputWrap}>
            <span className={styles.srOnly}>{L('Your fake answer')}</span>
            <textarea
              ref={input}
              className={styles.input}
              value={draft}
              rows={2}
              maxLength={LIE_MAX}
              placeholder={L('A fake answer that sounds real…')}
              autoCorrect="on"
              autoCapitalize="none"
              spellCheck
              enterKeyHint="done"
              onChange={(e) => setDraft(e.target.value.replace(/\n/g, ' ').slice(0, LIE_MAX))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  lock();
                }
              }}
            />
            <span className={styles.counter} key={draft.length}>
              {[...draft].length} / {LIE_MAX}
            </span>
          </label>
          {/* Suggest sits right under the box: its chips must land in view on a 568-tall phone. */}
          {view.suggestions.length > 0 ? (
            <div className={styles.suggestions} role="group" aria-label={L('Tap one to use it')}>
              <span className={styles.suggestLabel} aria-hidden>
                💡
              </span>
              {view.suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={styles.suggestChip}
                  data-on={draft === s ? '' : undefined}
                  onClick={() => {
                    setDraft(s);
                    play('submit', { gain: 0.4 });
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : view.canSuggest ? (
            <button
              type="button"
              className={styles.suggestButton}
              onClick={() => send({ type: 'suggest' })}
            >
              💡 {L('Suggest a lie')}
            </button>
          ) : null}
          <p
            className={styles.legality}
            data-bad={message ? '' : undefined}
            role="status"
            aria-live="polite"
          >
            {message ?? L('Make it sound real. Spelling counts!')}
          </p>
        </>
      )}
    </Screen>
  );
}
