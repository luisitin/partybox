// Controller (phone) view for Broken Pencil: pick a word, draw on the DrawPad, guess a drawing,
// then watch the TV. `send` is the only way out; the server validates every input first.
import { useCallback, useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { PrimaryButton, Screen, WaitingScreen, useServerOffset, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps, Translator } from '@partybox/game-sdk/ui';
import type { Input, Stroke } from '../server/types';
import type { PencilControllerView } from '../server/views';
import { DrawPad } from './DrawPad';
import { DrawingView } from './DrawingView';
import styles from './Controller.module.css';
import { Guess, stepKicker, useBookInBar } from './Guess';
import { Offers } from './Offers';
import { Show } from './Show';
import { STRINGS } from './strings';

/** Who touches my book, in the pick screen's hint. */
function reachLine(L: Translator, view: PencilControllerView): string {
  const others = view.bookCount - 1;
  if (view.fullCircle)
    return L('Everyone else ({others}) will touch your book before it comes home.', { others });
  return L('{passes} of your {others} friends will touch your book.', {
    passes: view.passes,
    others,
  });
}

function Pick({ view, send }: GameControllerProps<PencilControllerView, Input>): JSX.Element {
  const L = useT(STRINGS);
  const [custom, setCustom] = useState('');
  // I-023 B: the tapped tier bumps, the other two step back, until the server moves us on.
  const [picked, setPicked] = useState<number | null>(null);
  const spicy = view.spicy;
  const offers = view.offers ?? [];
  if (view.submitted)
    return (
      <WaitingScreen
        title={L('Locked in')}
        hint={L('Drawing starts when everyone has picked.')}
        mood="done"
      />
    );
  const text = custom.trim();
  return (
    <Screen
      title={L('Pick your secret word')}
      footer={
        view.customWords ? (
          <div className={styles.customRow}>
            <input
              className={styles.customInput}
              value={custom}
              maxLength={30}
              placeholder={L('…or write your own')}
              onChange={(e) => setCustom(e.target.value)}
              aria-label={L('your own word')}
            />
            <PrimaryButton
              tone="neutral"
              disabled={text.length === 0}
              onClick={() => send({ type: 'pickCustom', text })}
            >
              {L('Use mine')}
            </PrimaryButton>
          </div>
        ) : undefined
      }
    >
      <p className={styles.hint}>
        {reachLine(L, view)} {L('Pick something drawable.')}
      </p>
      <Offers
        offers={offers}
        spicy={spicy}
        picked={picked}
        onPick={(i) => {
          setPicked(i);
          send({ type: 'pick', option: i });
        }}
      />
    </Screen>
  );
}

/** After both pages of a step are in: what I sent, and who gets the book next. */
function Sent({ view }: { view: PencilControllerView }): JSX.Element {
  const L = useT(STRINGS);
  return (
    <Screen title={L('Sent!')}>
      <p className={styles.kicker}>{stepKicker(L, view)}</p>
      {view.mine?.text ? (
        <p className={styles.bookLine}>
          {L('You guessed')} <strong>“{view.mine.text}”</strong>
        </p>
      ) : null}
      {view.mine?.drawing ? (
        <DrawingView drawing={view.mine.drawing} label={L('your drawing')} />
      ) : null}
      <p className={styles.hint}>
        {view.nextName
          ? L('{name} gets this next. Good luck, {name}.', { name: view.nextName })
          : L('That was the last page of this book.')}
      </p>
    </Screen>
  );
}

/** Drafts go out at most this often; in the last seconds more often, so the buzzer loses less. */
const DRAFT_MS = 1500;
const DRAFT_LATE_MS = 400;
const DRAFT_LATE_WINDOW_MS = 6000;

/**
 * Sends the sheet so far as a `draft` (throttled, trailing) so the deadline keeps what was drawn
 * instead of a blank page. Nothing is sent after the phone's own "Done".
 */
function useDraftSender(
  send: (input: Input) => void,
  deadline: number | null,
): (strokes: Stroke[]) => void {
  // The deadline is server time: compare on the server's clock (game-sdk ServerClockProvider).
  const offset = useServerOffset();
  const pending = useRef<Stroke[] | null>(null);
  const lastSentAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const done = useRef(false);
  useEffect(() => {
    // Mount (again, under StrictMode's rehearsal) re-arms; unmount stops any trailing draft.
    done.current = false;
    return () => {
      done.current = true;
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
    };
  }, []);
  const flush = useCallback((): void => {
    timer.current = null;
    if (done.current || !pending.current) return;
    lastSentAt.current = Date.now();
    send({ type: 'draft', strokes: pending.current });
    pending.current = null;
  }, [send]);
  return useCallback(
    (strokes: Stroke[]): void => {
      if (done.current) return;
      pending.current = strokes;
      if (timer.current) return;
      const now = Date.now();
      const late = deadline !== null && deadline - (now + offset) < DRAFT_LATE_WINDOW_MS;
      const every = late ? DRAFT_LATE_MS : DRAFT_MS;
      timer.current = setTimeout(flush, Math.max(0, lastSentAt.current + every - now));
    },
    [deadline, flush, offset],
  );
}

/** Draw the text in `prompt`: your own word (round 1) or the guess you just wrote (a pass). */
function Draw({ view, send }: GameControllerProps<PencilControllerView, Input>): JSX.Element {
  const L = useT(STRINGS);
  const strokes = useRef<Stroke[]>([]);
  const [count, setCount] = useState(0);
  const text = view.prompt?.kind === 'text' ? view.prompt.text : '???';
  const own = view.step === 1;
  const draft = useDraftSender(send, view.deadline);
  // The draft the server kept, read once at mount (the pad's initializer ignores later values).
  const [initial] = useState(() => view.draft?.strokes ?? []);
  // I-794 H: whose book and the round ride in the timer bar; the prompt is one bold line.
  const inBar = useBookInBar(L, view);
  return (
    <Screen
      footer={
        // Quiet until the first stroke: an empty sheet is a shrug, not the primary action (loop #9).
        <PrimaryButton
          tone={count === 0 ? 'neutral' : 'accent'}
          onClick={() => send({ type: 'draw', strokes: strokes.current })}
          disabled={view.paused}
        >
          {count === 0 ? L('Send an empty sheet') : L('Done drawing')}
        </PrimaryButton>
      }
    >
      {inBar ? null : <p className={styles.kicker}>{stepKicker(L, view)}</p>}
      <h2 className={styles.prompt}>
        {own ? L('Draw:') : L('Draw your guess:')}{' '}
        <span className={styles.promptWord}>“{text}”</span>
      </h2>
      <DrawPad
        initial={initial}
        onChange={(s) => {
          strokes.current = s;
          setCount(s.length);
          draft(s);
        }}
        onProgress={draft}
      />
    </Screen>
  );
}

export function Controller(props: GameControllerProps<PencilControllerView, Input>): JSX.Element {
  const L = useT(STRINGS);
  const { view, me, send } = props;
  if (view.me.role === 'spectator')
    return (
      <WaitingScreen
        title={L("You're watching this one")}
        hint={L('You get a book next game.')}
        mood="watch"
      />
    );

  // I-213 A: back from a drop — the room moved on without waiting, and this says with what
  const away =
    view.awayPage === 'draft'
      ? L('While you were away the round moved on — your drawing went on as far as you got.')
      : view.awayPage === 'empty'
        ? L('While you were away the round moved on — your page went on as an empty sheet.')
        : view.awayPage === 'guess'
          ? L('While you were away the round moved on — your guess went on as ???.')
          : null;
  const awayNote = away ? (
    <p className={styles.awayNote} role="status">
      {away}
    </p>
  ) : null;
  switch (view.phaseId) {
    case 'pick':
      return <Pick {...props} />;
    case 'draw':
    case 'pass':
    case 'guess':
      if (view.stage === 'guess')
        return (
          <>
            {awayNote}
            <Guess {...props} key={`g${view.step}`} />
          </>
        );
      if (view.stage === 'draw')
        return (
          <>
            {awayNote}
            <Draw {...props} key={`d${view.step}`} />
          </>
        );
      return (
        <>
          {awayNote}
          <Sent view={view} />
        </>
      );
    case 'show':
      return <Show {...props} />;
    default: {
      const mine = view.myBook;
      return (
        <Screen
          title={
            mine
              ? mine.intact
                ? L('Your book survived!')
                : L('Your book broke')
              : L('That was Broken Pencil')
          }
        >
          {mine ? (
            <p className={styles.bookLine}>
              <strong>{mine.word}</strong> → <strong>{mine.last}</strong>
            </p>
          ) : null}
          <p className={styles.hint}>
            {view.intactBooks === 1
              ? L('1 of {total} books survived.', { total: view.bookCount })
              : L('{n} of {total} books survived.', {
                  n: view.intactBooks,
                  total: view.bookCount,
                })}
          </p>
          {/* The VIP's "close enough" (the owner, 2026-09-21): a broken book counts as intact —
              the server takes the input from the VIP alone (ADR-042), during the summary. */}
          <ul className={styles.summary}>
            {(view.summary ?? []).map((b, i) => (
              <li key={b.ownerId} className={b.ownerId === me.id ? styles.me : ''}>
                <span className={styles.summaryOwner}>{b.ownerName}</span>
                <span>
                  {b.word} → {b.last}
                </span>
                {!b.intact && view.vip === me.id && view.phaseId === 'summary' ? (
                  <button
                    type="button"
                    className={styles.veto}
                    onClick={() => send({ type: 'veto', book: i })}
                  >
                    {L('close enough ✓')}
                  </button>
                ) : (
                  <span className={b.intact ? styles.intact : styles.broken}>
                    {b.intact ? '✓' : '✕'}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Screen>
      );
    }
  }
}
