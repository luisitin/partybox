// The psychic's phone. `clue`: the target behind a hold-to-see card, a one-line clue box that runs
// the server's rules as they type (spec §5.8), a tip and a sticky Send clue. `dial`: their own
// clue, the target (hold to see) with the huddle's live markers, and a reminder to stay silent.
import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { PrimaryButton, Screen, buzz, useSound, useT } from '@partybox/game-sdk/ui';
import { DialStrip } from '@partybox/game-sdk/ui/dial';
import { CLUE_MAX_CHARS, checkClue } from '../server/clue';
import type { TuneControllerView } from '../server/index';
import type { Input } from '../server/types';
import { avatarOf, clueMessage, roundLine } from './copy';
import { HoldToSee } from './HoldToSee';
import { LockRow } from './LockRow';
import styles from './phone.module.css';
import { STRINGS } from './strings';

interface Props {
  view: TuneControllerView;
  send: (input: Input) => void;
}

function Target({ view, live }: { view: TuneControllerView; live: boolean }): JSX.Element {
  const L = useT(STRINGS);
  const marks = live
    ? (view.huddleMarks ?? []).map((m) => ({ ...m, avatarId: avatarOf(view.players, m.id) }))
    : [];
  return (
    <HoldToSee label={L('Hold to see the target')}>
      <DialStrip
        left={view.turn.left}
        right={view.turn.right}
        target={view.bullseyeAt ?? null}
        bands={view.turn.bands}
        marks={marks}
        needle={live ? view.needle : null}
      />
    </HoldToSee>
  );
}

export function PsychicClue({ view, send }: Props): JSX.Element {
  const L = useT(STRINGS);
  const play = useSound();
  const [text, setText] = useState('');
  const [sent, setSent] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const verdict = checkClue(text, view.turn.left, view.turn.right);
  const rejected = view.rejected;
  // The server refused what we sent (a rule the phone missed): say why, buzz, let them retype.
  const lastRejection = useRef(rejected?.n ?? 0);
  useEffect(() => {
    if (!rejected || rejected.n === lastRejection.current) return;
    lastRejection.current = rejected.n;
    setSent(null);
    buzz([40, 60, 40]);
    play('error');
  }, [rejected, play]);
  const submit = (): void => {
    if (!verdict.ok || sent !== null) return;
    setSent(verdict.text);
    play('submit');
    send({ type: 'clue', text: verdict.text });
  };
  const message =
    rejected && sent === null
      ? clueMessage(L, rejected.reason)
      : text.trim() !== '' && !verdict.ok
        ? clueMessage(L, verdict.reason)
        : null;
  return (
    <Screen
      className={styles.screen}
      footer={
        <PrimaryButton disabled={!verdict.ok} done={sent !== null} onClick={submit}>
          {sent !== null ? L('Sent') : L('Send clue')}
        </PrimaryButton>
      }
    >
      <p className={styles.kicker}>{roundLine(L, view.turn)}</p>
      <h2 className={styles.role}>{L("You're the psychic 📻")}</h2>
      <div className={styles.pair}>
        <Target view={view} live={false} />
        <div className={styles.pairSide}>
          <form
            className={styles.clueForm}
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <input
              ref={input}
              className={`${styles.clueInput} ${message ? styles.clueBad : ''}`}
              value={text}
              maxLength={CLUE_MAX_CHARS + 10}
              placeholder={L('Your clue…')}
              aria-label={L('Your clue')}
              aria-invalid={message !== null}
              autoComplete="off"
              autoCorrect="on"
              spellCheck
              enterKeyHint="send"
              disabled={sent !== null}
              onChange={(e) => setText(e.target.value)}
            />
            <span className={styles.counter} aria-hidden>
              {[...text.trim()].length} / {CLUE_MAX_CHARS}
            </span>
          </form>
          <p className={message ? styles.legalBad : styles.legal} role="status" aria-live="polite">
            {message ?? (verdict.ok ? L('✓ Good to go') : ' ')}
          </p>
        </div>
      </div>
      <p className={`${styles.tip} ${styles.roomy}`}>
        {L("Name something that sits right on the target. No numbers, no 'left' or 'right'.")}
      </p>
    </Screen>
  );
}

export function PsychicDial({ view }: { view: TuneControllerView }): JSX.Element {
  const L = useT(STRINGS);
  return (
    <Screen className={styles.screen}>
      <p className={styles.kicker}>{roundLine(L, view.turn)}</p>
      <p className={styles.yourClue}>
        {L('Your clue:')} <strong>“{view.turn.clue}”</strong>
      </p>
      <div className={styles.pair}>
        {view.huddleMarks ? (
          // The huddle isn't secret from its psychic: the team's markers ride in the open, and the
          // target stays under the card (holding it shows both together).
          <DialStrip
            left={view.turn.left}
            right={view.turn.right}
            target={null}
            bands={view.turn.bands}
            marks={view.huddleMarks.map((m) => ({ ...m, avatarId: avatarOf(view.players, m.id) }))}
            needle={view.needle}
          />
        ) : null}
        <Target view={view} live />
      </div>
      <p className={styles.hush}>{L('Psychics stay silent! 🤫')}</p>
      {/* A short screen keeps the count and drops the faces (the card and the strip come first). */}
      <LockRow
        players={view.players}
        phase={view.phaseId}
        className={`${styles.roomy} ${styles.lockTight}`}
      />
    </Screen>
  );
}
