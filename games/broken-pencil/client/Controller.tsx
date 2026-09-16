// Controller (phone) view for Broken Pencil: pick a word, draw on the DrawPad, guess a drawing,
// then watch the TV. `send` is the only way out; the server validates every input first.
import { useRef, useState } from 'react';
import type { JSX } from 'react';
import { PrimaryButton, Screen, TextAnswer, WaitingScreen } from '@partybox/game-sdk/ui';
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
              <span className={styles.offerLevel}>{['easy', 'medium', 'hard'][i]}</span>
              <span className={styles.offerText}>{word}</span>
            </button>
          </li>
        ))}
      </ul>
    </Screen>
  );
}

function Draw({ view, send }: GameControllerProps<PencilControllerView, Input>): JSX.Element {
  const strokes = useRef<Stroke[]>([]);
  const [count, setCount] = useState(0);
  const text = view.prompt?.kind === 'text' ? view.prompt.text : '???';
  const kicker = `${view.bookOwnerName ?? 'Someone'}'s book · page ${view.step + 1} of ${view.pageCount}`;
  if (view.submitted)
    return (
      <Screen title="Sent!">
        <p className={styles.kicker}>{kicker}</p>
        <DrawingView drawing={view.mine?.drawing ?? null} label="your drawing" />
        <p className={styles.hint}>
          {view.nextName
            ? `${view.nextName} gets this next. Good luck, ${view.nextName}.`
            : 'That was the last page.'}
        </p>
      </Screen>
    );
  return (
    <Screen
      footer={
        <PrimaryButton
          onClick={() => send({ type: 'draw', strokes: strokes.current })}
          disabled={view.paused}
        >
          {count === 0 ? 'Send an empty sheet' : 'Done drawing'}
        </PrimaryButton>
      }
    >
      <p className={styles.kicker}>{kicker}</p>
      <h2 className={styles.prompt}>Draw: “{text}”</h2>
      <DrawPad
        onChange={(s) => {
          strokes.current = s;
          setCount(s.length);
        }}
      />
    </Screen>
  );
}

function Guess({ view, send }: GameControllerProps<PencilControllerView, Input>): JSX.Element {
  const drawing = view.prompt?.kind === 'drawing' ? view.prompt.drawing : null;
  const kicker = `${view.bookOwnerName ?? 'Someone'}'s book · page ${view.step + 1} of ${view.pageCount}`;
  return (
    <TextAnswer
      kicker={kicker}
      prompt={
        <span className={styles.guessPrompt}>
          <DrawingView drawing={drawing} label="the drawing to guess" />
          <span>What is this?</span>
        </span>
      }
      placeholder="Your best guess…"
      maxLength={40}
      submitted={view.submitted}
      submitLabel="Send guess"
      promptKey={`${view.step}:${view.deadline ?? ''}`}
      onSubmit={(text) => send({ type: 'guess', text })}
    />
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
      return <Draw {...props} key={view.step} />;
    case 'guess':
      return <Guess {...props} />;
    case 'show': {
      const s = view.showing;
      return (
        <WaitingScreen
          title="Watch the TV"
          hint={
            s
              ? `${s.ownerName}'s book · page ${s.page + 1} of ${view.pageCount}${s.myPageAt !== null ? ` · your page is ${s.myPageAt === s.page + 1 ? 'next' : 'coming up'}` : ''}`
              : undefined
          }
          mood="watch"
        />
      );
    }
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
