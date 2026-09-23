// TV: the round card ("intro") and the writing progress ("answer"). Nothing written is shown
// here: answers stay off the TV until "vote". The answer stage keeps one focal point — the count —
// and lets the room see who is holding things up: a row of pips (one per expected answer, the
// newest pops), the count re-entering on every change, and a status line naming the outstanding
// players. The last ten seconds swap the headline for 'Last chance!'.
import type { JSX } from 'react';
import { BigText, Stage, useSecondsLeft, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps, Translator, ViewPlayer } from '@partybox/game-sdk/ui';
import type { WisecrackTvView } from '../server/index';
import { STRINGS } from './strings';
import styles from './wisecrack.module.css';

type Props = GameTvProps<WisecrackTvView>;

export function TvIntro({ view }: Props): JSX.Element {
  const L = useT(STRINGS);
  const last = view.round === view.rounds;
  return (
    <Stage center>
      <p className={styles.kicker}>Wisecrack</p>
      <BigText level="display">
        {L('Round {round} of {rounds}', { round: view.round, rounds: view.rounds })}
      </BigText>
      {last && view.multiplier > 1 ? (
        <BigText level="h1" tone="accent">
          {L('Final round — double points!')}
        </BigText>
      ) : (
        <BigText level="h2" tone="muted">
          {L('Two prompts each. Make them laugh.')}
        </BigText>
      )}
    </Stage>
  );
}

const LAST_CHANCE_S = 10;
const NAMED = 4;

/** Who the room is waiting for. Disconnected players never block the phase, so they are not named. */
function waitingLine(L: Translator, outstanding: ViewPlayer[]): string {
  const names = outstanding.map((p) => p.name);
  if (names.length === 0) return L("Everyone's in!");
  if (names.length === 1) return L('Just waiting for {name}…', { name: names[0]! });
  if (names.length <= NAMED)
    return L('Waiting for {names} and {last}…', {
      names: names.slice(0, -1).join(', '),
      last: names[names.length - 1]!,
    });
  return L('Waiting for {names} and {n} more…', {
    names: names.slice(0, NAMED).join(', '),
    n: names.length - NAMED,
  });
}

export function TvAnswer({ view }: Props): JSX.Element {
  const L = useT(STRINGS);
  const left = useSecondsLeft(view.deadline, view.paused);
  const lastChance = left !== null && left <= LAST_CHANCE_S && !view.paused;
  const connected = view.players.filter((p) => p.connected);
  const outstanding = connected.filter((p) => p.status !== 'submitted');
  const nobodyDone = outstanding.length === connected.length;
  const headline = lastChance ? L('Last chance!') : L('Write your answers!');
  const answered = view.answeredCount;
  return (
    <Stage center>
      <p className={styles.kicker}>
        {L('Round {round} of {rounds}', { round: view.round, rounds: view.rounds })}
        {view.multiplier > 1 ? ` · ${L('double points')}` : ''}
        {/* I-028 A: the minimum room is a mode, not an accident. */}
        {connected.length === 3 ? ` · ${L('cozy round, just the three of you')}` : ''}
      </p>
      <BigText key={headline} level="display" className="pb-enter">
        {headline}
      </BigText>
      <div className={styles.pips} aria-hidden>
        {Array.from({ length: view.answersExpected }, (_, i) => (
          <span
            key={i}
            className={`${styles.pip} ${i < answered ? styles.pipDone : ''} ${i === answered - 1 ? styles.pipPop : ''}`}
          >
            {i < answered ? '✓' : ''}
          </span>
        ))}
      </div>
      <div key={answered} className="pb-enter" role="status">
        <BigText level="h1" tone="accent">
          {L('{n} / {total} answers in', { n: answered, total: view.answersExpected })}
        </BigText>
      </div>
      <BigText level="h2" tone={nobodyDone ? 'muted' : 'accent'}>
        {nobodyDone ? L('Two prompts are waiting on your phone.') : waitingLine(L, outstanding)}
      </BigText>
    </Stage>
  );
}
