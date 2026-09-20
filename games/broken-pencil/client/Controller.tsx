// Controller (phone) view for Broken Pencil: pick a word, draw on the DrawPad, guess a drawing,
// then watch the TV. `send` is the only way out; the server validates every input first.
import { useCallback, useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import {
  PrimaryButton,
  Screen,
  TextAnswer,
  WaitingScreen,
  useServerOffset,
} from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { Input, Stroke } from '../server/types';
import type { PencilControllerView } from '../server/views';
import { DrawPad } from './DrawPad';
import { DrawingView } from './DrawingView';
import styles from './Controller.module.css';

function Pick({ view, send }: GameControllerProps<PencilControllerView, Input>): JSX.Element {
  const [custom, setCustom] = useState('');
  const offers = view.offers ?? [];
  const others = view.bookCount - 1;
  const reach = view.fullCircle
    ? `Everyone else (${others}) will touch your book before it comes home.`
    : `${view.passes} of your ${others} friends will touch your book.`;
  if (view.submitted)
    return (
      <WaitingScreen
        title="Locked in"
        hint="Drawing starts when everyone has picked."
        mood="done"
      />
    );
  const text = custom.trim();
  return (
    <Screen
      title="Pick your secret word"
      footer={
        view.customWords ? (
          <div className={styles.customRow}>
            <input
              className={styles.customInput}
              value={custom}
              maxLength={30}
              placeholder="…or write your own"
              onChange={(e) => setCustom(e.target.value)}
              aria-label="your own word"
            />
            <PrimaryButton
              tone="neutral"
              disabled={text.length === 0}
              onClick={() => send({ type: 'pickCustom', text })}
            >
              Use mine
            </PrimaryButton>
          </div>
        ) : undefined
      }
    >
      <p className={styles.hint}>{reach} Pick something drawable.</p>
      <ul className={styles.offers}>
        {offers.map((word, i) => (
          <li key={word}>
            <button
              type="button"
              className={styles.offer}
              onClick={() => send({ type: 'pick', option: i })}
            >
              {/* I-023 A: the tier as heat — one, two or three discs, green to red. */}
              <span className={`${styles.heat} ${styles[`heat${i}`]}`} aria-hidden>
                {Array.from({ length: i + 1 }, (_, k) => (
                  <span key={k} className={styles.heatDot} />
                ))}
              </span>
              <span className={styles.offerLevel}>{['easy', 'medium', 'hard'][i]}</span>
              <span className={styles.offerText}>{word}</span>
            </button>
          </li>
        ))}
      </ul>
    </Screen>
  );
}

function stepKicker(view: PencilControllerView): string {
  const who = view.bookOwnerName ?? 'Someone';
  return `${who}'s book · round ${view.step} of ${view.stepCount}`;
}

/** After both pages of a step are in: what I sent, and who gets the book next. */
function Sent({ view }: { view: PencilControllerView }): JSX.Element {
  return (
    <Screen title="Sent!">
      <p className={styles.kicker}>{stepKicker(view)}</p>
      {view.mine?.text ? (
        <p className={styles.bookLine}>
          You guessed <strong>“{view.mine.text}”</strong>
        </p>
      ) : null}
      {view.mine?.drawing ? <DrawingView drawing={view.mine.drawing} label="your drawing" /> : null}
      <p className={styles.hint}>
        {view.nextName
          ? `${view.nextName} gets this next. Good luck, ${view.nextName}.`
          : 'That was the last page of this book.'}
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
  const strokes = useRef<Stroke[]>([]);
  const [count, setCount] = useState(0);
  const text = view.prompt?.kind === 'text' ? view.prompt.text : '???';
  const own = view.step === 1;
  const draft = useDraftSender(send, view.deadline);
  // The draft the server kept, read once at mount (the pad's initializer ignores later values).
  const [initial] = useState(() => view.draft?.strokes ?? []);
  return (
    <Screen
      footer={
        // Quiet until the first stroke: an empty sheet is a shrug, not the primary action (loop #9).
        <PrimaryButton
          tone={count === 0 ? 'neutral' : 'accent'}
          onClick={() => send({ type: 'draw', strokes: strokes.current })}
          disabled={view.paused}
        >
          {count === 0 ? 'Send an empty sheet' : 'Done drawing'}
        </PrimaryButton>
      }
    >
      <p className={styles.kicker}>{stepKicker(view)}</p>
      <h2 className={styles.prompt}>
        {own ? 'Draw your word: ' : 'Now draw your guess: '}“{text}”
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

/** Guess the drawing that reached you; in a pass the DrawPad follows right after. */
function Guess({ view, send }: GameControllerProps<PencilControllerView, Input>): JSX.Element {
  const drawing = view.prompt?.kind === 'drawing' ? view.prompt.drawing : null;
  const last = view.phaseId === 'guess';
  return (
    <TextAnswer
      kicker={stepKicker(view)}
      prompt={
        <span className={styles.guessPrompt}>
          <span className={styles.guessDrawing}>
            <DrawingView drawing={drawing} label="the drawing to guess" />
          </span>
          <span className={styles.guessText}>
            {last ? 'Last guess — what is this?' : 'What is this? (you draw it next)'}
          </span>
        </span>
      }
      placeholder="Your best guess…"
      maxLength={40}
      submitted={false}
      submitLabel={last ? 'Send guess' : 'Guess, then draw it'}
      promptKey={`${view.step}:${view.deadline ?? ''}`}
      onSubmit={(text) => send({ type: 'guess', text })}
    />
  );
}

/** The show: the presenter turns the pages of their own book; everyone else watches the TV. */
function Show({ view, send }: GameControllerProps<PencilControllerView, Input>): JSX.Element {
  const s = view.showing;
  if (!s) return <WaitingScreen title="Watch the TV" mood="watch" />;
  const where = `page ${s.page + 1} of ${view.pageCount}`;
  if (!s.presenting)
    return (
      <WaitingScreen
        title={`${s.ownerName} is presenting`}
        hint={`${s.ownerName}'s book · ${where}. Your turn comes when your book is up.`}
        mood="watch"
      />
    );
  const label = !s.lastPage ? 'Next page ▸' : s.lastBook ? 'Finish ▸' : 'Next book ▸';
  return (
    <Screen
      title="Your book is on the TV"
      footer={
        <PrimaryButton onClick={() => send({ type: 'turn' })} disabled={view.paused}>
          {label}
        </PrimaryButton>
      }
    >
      <p className={styles.kicker}>
        {where} ·{' '}
        {s.pageKind === 'word' ? 'your word' : s.pageKind === 'draw' ? 'a drawing' : 'a guess'}
      </p>
      <p className={styles.hint}>
        Read it out, let everyone look, then turn the page. The TV turns it for you if you take too
        long.
      </p>
    </Screen>
  );
}

export function Controller(props: GameControllerProps<PencilControllerView, Input>): JSX.Element {
  const { view, me } = props;
  if (view.me.role === 'spectator')
    return (
      <WaitingScreen
        title="You're watching this one"
        hint="You get a book next game."
        mood="watch"
      />
    );

  switch (view.phaseId) {
    case 'pick':
      return <Pick {...props} />;
    case 'draw':
    case 'pass':
    case 'guess':
      if (view.stage === 'guess') return <Guess {...props} key={`g${view.step}`} />;
      if (view.stage === 'draw') return <Draw {...props} key={`d${view.step}`} />;
      return <Sent view={view} />;
    case 'show':
      return <Show {...props} />;
    default: {
      const mine = view.myBook;
      return (
        <Screen
          title={
            mine
              ? mine.intact
                ? 'Your book survived!'
                : 'Your book broke'
              : 'That was Broken Pencil'
          }
        >
          {mine ? (
            <p className={styles.bookLine}>
              <strong>{mine.word}</strong> → <strong>{mine.last}</strong>
            </p>
          ) : null}
          <p className={styles.hint}>
            {view.intactBooks} of {view.bookCount} books survived.
          </p>
          <ul className={styles.summary}>
            {(view.summary ?? []).map((b) => (
              <li key={b.ownerId} className={b.ownerId === me.id ? styles.me : ''}>
                <span className={styles.summaryOwner}>{b.ownerName}</span>
                <span>
                  {b.word} → {b.last}
                </span>
                <span className={b.intact ? styles.intact : styles.broken}>
                  {b.intact ? '✓' : '✕'}
                </span>
              </li>
            ))}
          </ul>
        </Screen>
      );
    }
  }
}
