// Phone during `write` (SPEC §4.4): the prompt, an answer box (60 characters, autocorrect on),
// 💡 Need an idea? (once per question: two ready-made answers as chips; a tap fills the box), and a
// sticky Lock it in → Change. The draft lives here so a push never wipes it; "Lock it in" is inert
// while a send is in flight, so a mash sends one answer.
import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { PrimaryButton, Screen, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { WsPhoneView } from '../server/views';
import { STRINGS } from './strings';
import styles from './phone.module.css';

const MAX = 60;
/** The chips pop in where the 💡 button was: taps this soon after are the same mash, not a pick. */
const CHIP_GUARD_MS = 450;

export function PhoneWrite({ view, send }: GameControllerProps<WsPhoneView, Input>): JSX.Element {
  const L = useT(STRINGS);
  const [draft, setDraft] = useState(view.myAnswer ?? '');
  // Locked whenever the server holds an answer — however it got there (this send, a reload, a
  // reconnect) — unless the player tapped Change.
  const [changing, setChanging] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [nudge, setNudge] = useState(false);
  const [asked, setAsked] = useState(false);
  const chipsAt = useRef(0);
  const chipsRef = useRef<HTMLDivElement>(null);
  const hasIdeas = view.ideas.length > 0;
  // The chips arrive below the fold on a small phone: bring them up so the answer is seen.
  useEffect(() => {
    if (hasIdeas) chipsRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [hasIdeas]);
  const held = view.myAnswer;
  // The server confirmed the send: leave editing (adjust state on a prop change, in render).
  if (sent !== null && held === sent) {
    setSent(null);
    setChanging(false);
  }
  const text = draft.replace(/\s+/g, ' ').trim();
  const lock = (): void => {
    if (sent !== null) return;
    if (!text) {
      setNudge(true);
      return;
    }
    if (text === held) {
      setChanging(false);
      return;
    }
    setSent(text);
    send({ type: 'answer', text });
  };
  const kicker = L('Question {n} of {total}', { n: view.n, total: view.total });
  if (held !== null && !changing) {
    return (
      <Screen
        className="pb-enter"
        footer={
          <PrimaryButton
            tone="neutral"
            onClick={() => {
              setDraft(held);
              setChanging(true);
            }}
          >
            {L('Change')}
          </PrimaryButton>
        }
      >
        <p className={styles.kicker}>{kicker}</p>
        <p className={styles.prompt}>{view.prompt}</p>
        <div className={styles.locked} role="status">
          <span className={styles.lockedLabel}>✓ {L('Locked in')}</span>
          <span className={styles.lockedText}>{held}</span>
          <span className={styles.lockedHint}>
            {view.phoneOnly
              ? L('Waiting for the others… then the guessing.')
              : L('Waiting for the others… then watch the TV.')}
          </span>
        </div>
      </Screen>
    );
  }
  return (
    <Screen
      footer={
        <PrimaryButton onClick={lock} done={sent !== null} aria-disabled={!text}>
          {sent !== null ? L('Sending…') : L('Lock it in')}
        </PrimaryButton>
      }
    >
      <p className={styles.kicker}>{kicker}</p>
      <p className={styles.prompt}>{view.prompt}</p>
      <textarea
        className={styles.input}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value.slice(0, MAX));
          setNudge(false);
        }}
        placeholder={L('Your answer…')}
        maxLength={MAX}
        rows={2}
        autoCapitalize="sentences"
        autoCorrect="on"
        spellCheck
        enterKeyHint="done"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            lock();
          }
        }}
        aria-label={L('your answer')}
      />
      <div className={styles.underBox}>
        {nudge ? (
          <span className={styles.nudge} role="alert">
            {L('Type an answer.')}
          </span>
        ) : (
          <span className={styles.boxHint}>{L('Write like yourself — or like someone else.')}</span>
        )}
        <span key={draft.length} className={styles.counter} aria-live="off">
          {draft.length} / {MAX}
        </span>
      </div>
      {view.ideas.length > 0 ? (
        <div className={styles.ideas} ref={chipsRef}>
          <p className={styles.ideasLabel}>{L('Tap one to use it:')}</p>
          {view.ideas.map((idea) => (
            <button
              key={idea}
              type="button"
              className={`${styles.chip} ${draft === idea ? styles.chipOn : ''}`}
              onClick={() => {
                if (performance.now() - chipsAt.current < CHIP_GUARD_MS) return;
                setDraft(idea.slice(0, MAX));
                setNudge(false);
              }}
            >
              {idea}
            </button>
          ))}
        </div>
      ) : view.canIdea ? (
        <button
          type="button"
          className={styles.ideaBtn}
          disabled={asked}
          onClick={() => {
            if (asked) return;
            setAsked(true);
            chipsAt.current = performance.now();
            send({ type: 'idea' });
          }}
        >
          💡 {L('Need an idea?')}
        </button>
      ) : null}
    </Screen>
  );
}
