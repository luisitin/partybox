// TV title screens: the intro (the three steps, dealt one by one), the prompt (a card that swings
// in and holds while the reader says it) and the writing stage (the prompt stays up; the count of
// answers in is the one focal point, with pips and who we are waiting for).
import type { CSSProperties, JSX } from 'react';
import { BigText, Stage, useSecondsLeft, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps, Translator, ViewPlayer } from '@partybox/game-sdk/ui';
import type { WsTvView } from '../server/views';
import { STEPS } from './steps';
import { STRINGS } from './strings';
import styles from './tv.module.css';

type Props = GameTvProps<WsTvView>;

export function TvIntro(_: Props): JSX.Element {
  const L = useT(STRINGS);
  return (
    <Stage center>
      <div className={styles.title}>
        <span className={styles.titleIcon} aria-hidden>
          🗣️
        </span>
        <BigText level="display">{L('Who Said It?')}</BigText>
      </div>
      <ol className={styles.steps}>
        {STEPS.map((step, i) => (
          <li key={step} className={styles.step} style={{ '--i': i } as CSSProperties}>
            <span className={styles.stepNo} aria-hidden>
              {i + 1}
            </span>
            <span>{L(step)}</span>
          </li>
        ))}
      </ol>
    </Stage>
  );
}

export function questionOf(L: Translator, view: WsTvView): string {
  return L('Question {n} of {total}', { n: view.n, total: view.total });
}

export function TvPrompt({ view }: Props): JSX.Element {
  const L = useT(STRINGS);
  return (
    <Stage center>
      <p className={styles.kicker}>{questionOf(L, view)}</p>
      <div className={styles.scene}>
        <div className={styles.drift}>
          <div key={view.n} className={`${styles.promptCard} ${styles.swingIn}`}>
            <p className={styles.promptText}>{view.prompt}</p>
          </div>
        </div>
      </div>
    </Stage>
  );
}

const NAMED = 4;
const LAST_CHANCE_S = 10;

function waitingLine(L: Translator, outstanding: ViewPlayer[]): string {
  const names = outstanding.map((p) => p.name);
  if (names.length === 0) return L("Everyone's in!");
  if (names.length === 1) return L('Just waiting for {name}…', { name: names[0] as string });
  if (names.length <= NAMED)
    return L('Waiting for {names} and {last}…', {
      names: names.slice(0, -1).join(', '),
      last: names.at(-1) as string,
    });
  return L('Waiting for {names} and {n} more…', {
    names: names.slice(0, NAMED).join(', '),
    n: names.length - NAMED,
  });
}

export function TvWrite({ view }: Props): JSX.Element {
  const L = useT(STRINGS);
  const left = useSecondsLeft(view.deadline, view.paused);
  const allIn = view.expected > 0 && view.answered >= view.expected;
  const lastChance = !allIn && left !== null && left <= LAST_CHANCE_S && !view.paused;
  const waiting = view.players.filter((p) => p.connected && p.status === 'active');
  const nobody = view.answered === 0;
  const headline = allIn
    ? L("Everyone's in!")
    : lastChance
      ? L('Last chance!')
      : L('Answer on your phone');
  return (
    <Stage center>
      <p className={styles.kicker}>{questionOf(L, view)}</p>
      <p className={styles.promptSmall}>{view.prompt}</p>
      <BigText key={headline} level="h1" className="pb-enter">
        {headline}
      </BigText>
      <div className={styles.pips} aria-hidden>
        {Array.from({ length: view.expected }, (_, i) => (
          <span
            key={i}
            className={`${styles.pip} ${i < view.answered ? styles.pipDone : ''} ${i === view.answered - 1 ? styles.pipPop : ''}`}
          >
            {i < view.answered ? '✓' : ''}
          </span>
        ))}
      </div>
      <p key={view.answered} className={`${styles.count} pb-tick`} role="status">
        {L('{n} / {total} answers in', { n: view.answered, total: view.expected })}
      </p>
      <p className={styles.waitLine}>
        {nobody ? L('Write like yourself — or like someone else.') : waitingLine(L, waiting)}
      </p>
    </Stage>
  );
}
