// TV: the round card ("intro") and the black card while the phones pick ("answer"). Nothing
// played is shown here: white cards stay off the TV until "reveal". The answer stage keeps one
// focal point — the black card — with a row of face-down cards on the table (one slot per expected
// card; a played card lands in its slot, the newest with a bounce), the
// count re-entering on every change, and a line naming who the room is waiting for.
import { useEffect } from 'react';
import type { JSX } from 'react';
import { Avatar, BigText, Stage, useBeats, useSecondsLeft, useSound } from '@partybox/game-sdk/ui';
import type { GameTvProps, ViewPlayer } from '@partybox/game-sdk/ui';
import type { BlanksTvView } from '../server/index';
import { CardFan, FilledCard, FlipCard } from './Cards';
import styles from './blanks.module.css';

type Props = GameTvProps<BlanksTvView>;

/** The round card's three beats: the fan and the round (0), who is judging (400), who is ahead
 *  (800) — the hold used to land as one pop and then sit still for four seconds (loop #194). */
export const INTRO_BEATS_MS = [0, 400, 800] as const;
/** I-015 A: when each card of the round card's fan lands (the fan's own rise delays). */
const FAN_PLUCKS_MS = [0, 75, 150] as const;

export function TvIntro({ view }: Props): JSX.Element {
  const last = view.round === view.rounds;
  const beat = useBeats(INTRO_BEATS_MS);
  // I-015 A: each card of the fan lands with the game's own `card` pluck — on the cards' own
  // delays (0 / 75 / 150 ms); the shell's phase chime has already sounded.
  const play = useSound();
  useEffect(() => {
    const ts = FAN_PLUCKS_MS.map((ms) => setTimeout(() => play('card'), ms));
    return () => ts.forEach((t) => clearTimeout(t));
  }, [play]);
  // Nobody has scored yet → no leader line (every rank-1 row would be the whole room).
  const top = view.standings.filter((r) => r.rank === 1);
  const leaders =
    top.length > 0 && (top[0]?.score ?? 0) > 0 && top.length < view.standings.length
      ? top.slice(0, 3)
      : [];
  return (
    <Stage center className={styles.table}>
      <CardFan />
      <p className={styles.kicker}>Blanks</p>
      <BigText level="display">
        Round {view.round} of {view.rounds}
      </BigText>
      {/* Both lines stay mounted and fade in on their beat: mounting them late re-centred the
          stage and the fan jumped (loop #194). */}
      {view.czar ? (
        <div className={`${styles.judgeLine} ${beat >= 1 ? 'pb-enter' : styles.beatWait}`}>
          <Avatar avatarId={view.czar.avatarId} size="var(--pb-chip-size)" />
          <BigText level="h2" tone="accent">
            {view.czar.name} judges this round
          </BigText>
        </div>
      ) : (
        <div className={beat >= 1 ? 'pb-enter' : styles.beatWait}>
          <BigText level="h2" tone="muted">
            {last ? 'Last round. Make it count.' : 'Everyone votes. Play your worst.'}
          </BigText>
        </div>
      )}
      {/* From round 2 the card says who is ahead — one line, because the chip strip above already
          carries every score (review-loop #164). */}
      {/* A run is the better story: while someone is on one, the third beat says that instead of
          who leads (review-loop #236). */}
      {view.streak ? (
        <div className={`${styles.introLead} ${beat >= 2 ? 'pb-enter' : styles.beatWait}`}>
          <span className={styles.leadChip}>
            <Avatar avatarId={view.streak.avatarId} size="var(--pb-space-7)" />
            {view.streak.name}
          </span>
          <BigText level="h2" tone="accent">
            is on a {view.streak.runs}-round streak
          </BigText>
        </div>
      ) : leaders.length > 0 ? (
        <div className={`${styles.introLead} ${beat >= 2 ? 'pb-enter' : styles.beatWait}`}>
          {leaders.map((row) => (
            <span key={row.playerId} className={styles.leadChip}>
              <Avatar avatarId={row.avatarId} size="var(--pb-space-7)" />
              {row.name}
            </span>
          ))}
          <BigText level="h2" tone="accent">
            {leaders.length > 1 ? 'lead with' : 'leads with'} {leaders[0]?.score}
          </BigText>
        </div>
      ) : null}
    </Stage>
  );
}

/** czar mode: the judge chooses the round's black card from three (review-loop #154). */
export function TvPick({ view }: Props): JSX.Element {
  const taken = view.blackChoices.some((b) => b.chosen);
  // The judge's choice is a real beat — the card lifts and rings gold while the other two step
  // back — and it was the one beat in the round the room heard nothing for (review-loop #221).
  // A single lock tick, the same note a played card makes, on the frame the ring appears.
  const play = useSound();
  useEffect(() => {
    if (taken) play('lock');
  }, [taken, play]);
  return (
    <Stage className={styles.table}>
      <div className={styles.kickerRow}>
        <p className={styles.kicker}>
          Round {view.round} of {view.rounds} · {view.czar?.name ?? 'The judge'} judges
        </p>
        <span className={styles.progressPill}>
          {view.czar ? (
            <>
              <Avatar avatarId={view.czar.avatarId} size="var(--pb-space-7)" />
              {taken
                ? `${view.czar.name} picked this one`
                : `${view.czar.name} is picking the question…`}
            </>
          ) : (
            'Picking the question…'
          )}
        </span>
      </div>
      <ul className={styles.choices} aria-label="the black cards to choose from">
        {view.blackChoices.map((b, i) => (
          <li
            key={i}
            className={taken && !b.chosen ? styles.notChosen : ''}
            style={{ animationDelay: `calc(${i} * 160ms)` }}
          >
            <FilledCard
              text={b.text}
              pick={b.pick}
              size="medium"
              className={b.chosen ? styles.chosenCard : ''}
            />
          </li>
        ))}
      </ul>
      <BigText level="h2" tone="muted">
        {taken ? "That's the round's card." : "One of these is this round's card."}
      </BigText>
    </Stage>
  );
}

const LAST_CHANCE_S = 10;
const NAMED = 4;

/** Who the room is waiting for. Disconnected players never block the phase, so they are not named. */
function waitingLine(outstanding: ViewPlayer[]): string {
  const names = outstanding.map((p) => p.name);
  if (names.length === 0) return 'here comes the reading…';
  if (names.length === 1) return `Just waiting for ${names[0]}…`;
  if (names.length <= NAMED)
    return `Waiting for ${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}…`;
  return `Waiting for ${names.slice(0, NAMED).join(', ')} and ${names.length - NAMED} more…`;
}

export function TvAnswer({ view }: Props): JSX.Element {
  const left = useSecondsLeft(view.deadline, view.paused);
  const connected = view.players.filter((p) => p.connected && p.status !== 'waiting');
  const outstanding = connected.filter((p) => p.status !== 'submitted');
  // The "Everyone's in!" beat is a short deadline too: no last chance once nobody is missing.
  const lastChance =
    left !== null && left <= LAST_CHANCE_S && !view.paused && outstanding.length > 0;
  const nobodyDone = view.playedCount === 0;
  const pick = view.black?.pick ?? 1;
  const headline = lastChance
    ? 'Last chance!'
    : !nobodyDone && outstanding.length === 0
      ? "Everyone's in!"
      : pick > 1
        ? `Play ${pick} cards from your hand`
        : 'Play a card from your hand';
  return (
    <Stage center className={styles.table}>
      <div className={styles.kickerRow}>
        <p className={styles.kicker}>
          Round {view.round} of {view.rounds}
          {view.czar ? ` · ${view.czar.name} judges` : ''}
        </p>
      </div>
      {/* The round's question is turned face-up for the room — the same move the read-out uses,
          so the judge's pick lands as a card on the table (review-loop #166). */}
      {view.black ? (
        <FlipCard
          flipKey={view.black.text}
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
          />
        ))}
      </div>
      <div key={view.playedCount} className="pb-enter" role="status">
        <BigText level="h2" tone={nobodyDone ? 'muted' : 'accent'}>
          {view.playedCount} / {view.playersExpected} in
          {nobodyDone ? ' · your cards are on your phone' : ` · ${waitingLine(outstanding)}`}
        </BigText>
      </div>
      {!view.timed && !nobodyDone && outstanding.length > 0 ? (
        <BigText level="h2" tone="muted">
          No clock — the VIP taps Next when the room is ready.
        </BigText>
      ) : null}
    </Stage>
  );
}
