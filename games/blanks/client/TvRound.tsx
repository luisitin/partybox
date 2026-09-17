// TV: the round card ("intro") and the black card while the phones pick ("answer"). Nothing
// played is shown here: white cards stay off the TV until "reveal". The answer stage keeps one
// focal point — the black card — with a row of pips (one per expected card, the newest pops), the
// count re-entering on every change, and a line naming who the room is waiting for.
import type { JSX } from 'react';
import { Avatar, BigText, Stage, useSecondsLeft } from '@partybox/game-sdk/ui';
import type { GameTvProps, ViewPlayer } from '@partybox/game-sdk/ui';
import type { BlanksTvView } from '../server/index';
import { FilledCard } from './Cards';
import styles from './blanks.module.css';

type Props = GameTvProps<BlanksTvView>;

export function TvIntro({ view }: Props): JSX.Element {
  const last = view.round === view.rounds;
  return (
    <Stage center>
      <p className={styles.kicker}>Blanks</p>
      <BigText level="display">
        Round {view.round} of {view.rounds}
      </BigText>
      {view.czar ? (
        <div className={`${styles.judgeLine} pb-enter`}>
          <Avatar avatarId={view.czar.avatarId} size="var(--pb-chip-size)" />
          <BigText level="h2" tone="accent">
            {view.czar.name} judges this round
          </BigText>
        </div>
      ) : (
        <BigText level="h2" tone="muted">
          {last ? 'Last round. Make it count.' : 'Everyone votes. Play your worst.'}
        </BigText>
      )}
    </Stage>
  );
}

const LAST_CHANCE_S = 10;
const NAMED = 4;

/** Who the room is waiting for. Disconnected players never block the phase, so they are not named. */
function waitingLine(outstanding: ViewPlayer[]): string {
  const names = outstanding.map((p) => p.name);
  if (names.length === 0) return "Everyone's in!";
  if (names.length === 1) return `Just waiting for ${names[0]}…`;
  if (names.length <= NAMED)
    return `Waiting for ${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}…`;
  return `Waiting for ${names.slice(0, NAMED).join(', ')} and ${names.length - NAMED} more…`;
}

export function TvAnswer({ view }: Props): JSX.Element {
  const left = useSecondsLeft(view.deadline, view.paused);
  const lastChance = left !== null && left <= LAST_CHANCE_S && !view.paused;
  const connected = view.players.filter((p) => p.connected && p.status !== 'waiting');
  const outstanding = connected.filter((p) => p.status !== 'submitted');
  const nobodyDone = view.playedCount === 0;
  const pick = view.black?.pick ?? 1;
  const headline = lastChance
    ? 'Last chance!'
    : pick > 1
      ? `Play ${pick} cards from your hand`
      : 'Play a card from your hand';
  return (
    <Stage center>
      <div className={styles.kickerRow}>
        <p className={styles.kicker}>
          Round {view.round} of {view.rounds}
          {view.czar ? ` · ${view.czar.name} judges` : ''}
        </p>
      </div>
      {view.black ? (
        <FilledCard
          text={view.black.text}
          pick={view.black.pick}
          size="hero"
          className={styles.stageCard}
        />
      ) : null}
      <BigText key={headline} level="h2" className="pb-enter">
        {headline}
      </BigText>
      <div className={styles.pips} aria-hidden>
        {Array.from({ length: view.playersExpected }, (_, i) => (
          <span
            key={i}
            className={`${styles.pip} ${i < view.playedCount ? styles.pipDone : ''} ${i === view.playedCount - 1 ? styles.pipPop : ''}`}
          >
            {i < view.playedCount ? '✓' : ''}
          </span>
        ))}
      </div>
      <div key={view.playedCount} className="pb-enter" role="status">
        <BigText level="h2" tone={nobodyDone ? 'muted' : 'accent'}>
          {view.playedCount} / {view.playersExpected} in
          {nobodyDone ? ' · your cards are on your phone' : ` · ${waitingLine(outstanding)}`}
        </BigText>
      </div>
      {!view.timed && !nobodyDone ? (
        <BigText level="h2" tone="muted">
          No clock — anyone taps Next when the room is ready.
        </BigText>
      ) : null}
    </Stage>
  );
}
