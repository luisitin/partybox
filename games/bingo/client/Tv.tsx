// TV view for Bingo. Dumb component: renders `view`, composes game-sdk primitives, never touches
// sockets or game logic. During play the stage shows ONE thing: the current call — plus the one
// before it, small. A claim stops the caller at once (server); the stage then lands the
// claimant's card cell by cell for the whole room, and only then delivers the verdict: a buzzer
// and "NOT A BINGO", or a fanfare with confetti.
import { useEffect } from 'react';
import type { CSSProperties, JSX } from 'react';
import { BigText, Confetti, Scoreboard, Stage, useSound } from '@partybox/game-sdk/ui';
import type { GameTvProps, ScoreboardRow } from '@partybox/game-sdk/ui';
import type { BingoTvView, CallView, ClaimView } from '../server/views';
import { Card, PatternIcon, REVEAL_STEP_MS } from './Card';
import styles from './Tv.module.css';

/** The verdict waits for the last cell to land (25 cells × step + the pop itself). */
const VERDICT_DELAY: CSSProperties = { animationDelay: `${25 * REVEAL_STEP_MS + 300}ms` };

function rows(view: BingoTvView): ScoreboardRow[] {
  const avatar = (id: string): string => view.players.find((p) => p.id === id)?.avatarId ?? '';
  return view.standings.map((s) => ({
    playerId: s.playerId,
    name: s.name,
    avatarId: avatar(s.playerId),
    score: s.wins,
    rank: s.rank,
    connected: view.players.find((p) => p.id === s.playerId)?.connected,
  }));
}

function Call({ call, big }: { call: CallView; big?: boolean }): JSX.Element {
  return (
    <div
      className={`${big ? styles.callBig : styles.callSmall} ${big ? 'pb-pop' : 'pb-enter'}`}
      key={call.number}
    >
      <span className={styles.letter}>{call.letter}</span>
      <span className={styles.number}>{call.number}</span>
    </div>
  );
}

function ClaimCard({ claim, celebrate }: { claim: ClaimView; celebrate: boolean }): JSX.Element {
  return (
    <div className={`${styles.claim} pb-pop`}>
      <Card
        numbers={claim.card}
        daubs={claim.daubs}
        green={claim.green}
        red={celebrate ? [] : claim.red}
        missing={celebrate ? [] : claim.missing}
        size="tv"
        verdict
        reveal
      />
    </div>
  );
}

export function Tv({ view }: GameTvProps<BingoTvView>): JSX.Element {
  const roundLabel = `Round ${view.round} of ${view.totalRounds}`;
  const play = useSound();
  const phaseId = view.phaseId;
  const number = view.current?.number ?? null;
  // Every new number bounces in with a "boing" (no per-second ticking: the timer is quiet).
  useEffect(() => {
    if (phaseId === 'play' && number !== null) play('call');
  }, [phaseId, number, play]);
  // The verdict sounds once the card has landed: buzzer for a failed claim, fanfare for a bingo.
  const winner = view.winnerId;
  useEffect(() => {
    if (phaseId !== 'check' && !(phaseId === 'bingo' && winner)) return;
    const handle = setTimeout(
      () => play(phaseId === 'check' ? 'wrong' : 'fanfare'),
      25 * REVEAL_STEP_MS + 300,
    );
    return () => clearTimeout(handle);
  }, [phaseId, winner, play]);

  if (view.phaseId === 'intro') {
    return (
      <Stage center>
        <BigText level="h2" tone="muted">
          {roundLabel}
        </BigText>
        <div className={styles.patternRow}>
          <PatternIcon cells={view.patternCells} size={140} />
          <BigText level="display" tone="accent">
            {view.patternLabel}
          </BigText>
        </div>
        <BigText level="h2">{view.patternHint}</BigText>
        <p className={styles.programme}>
          {view.patterns.map((p, i) => (
            <span key={i} className={i + 1 === view.round ? styles.programmeNow : ''}>
              {i + 1}. {p}
            </span>
          ))}
        </p>
      </Stage>
    );
  }

  if (view.phaseId === 'play') {
    return (
      <Stage center>
        <p className={styles.kicker}>
          {roundLabel} · {view.patternLabel} · call {view.callIndex} of 75
        </p>
        {view.current ? <Call call={view.current} big /> : null}
        {view.current ? <BigText level="h1">{view.current.call}</BigText> : null}
        <div className={styles.previousRow}>
          <span className={styles.previousLabel}>{view.previous ? 'Before that' : ' '}</span>
          {view.previous ? <Call call={view.previous} /> : null}
        </div>
      </Stage>
    );
  }

  if (view.phaseId === 'check' && view.claim) {
    return (
      <Stage>
        <div className={styles.checkHead}>
          <BigText level="h2" tone="accent">
            {view.claim.name} says BINGO!
          </BigText>
          <p className={styles.kicker}>
            {view.patternLabel} · checking against {view.callIndex} calls
          </p>
        </div>
        <div className={styles.checkBody}>
          <ClaimCard claim={view.claim} celebrate={false} />
          <div className={`${styles.verdict} pb-pop`} style={VERDICT_DELAY}>
            <BigText level="h1" className={styles.no}>
              NOT A BINGO
            </BigText>
            <p className={styles.legend}>
              <span className={styles.legendGreen}>✓ right</span>
              <span className={styles.legendRed}>✕ never called</span>
              <span className={styles.legendMissing}>▢ missed</span>
            </p>
            <BigText level="h2" tone="muted">
              Card wiped. Next number in a moment…
            </BigText>
          </div>
        </div>
      </Stage>
    );
  }

  if (view.phaseId === 'bingo') {
    if (view.claim && view.winnerName) {
      return (
        <Stage>
          <Confetti />
          <div className={`${styles.checkHead} pb-pop`} style={VERDICT_DELAY}>
            <BigText level="display" tone="accent" className={styles.bingoTitle}>
              BINGO!
            </BigText>
            <BigText level="h1">
              {view.winnerName} wins round {view.round}
            </BigText>
          </div>
          <div className={styles.checkBody}>
            <ClaimCard claim={view.claim} celebrate />
            <div className={`${styles.verdict} pb-pop`} style={VERDICT_DELAY}>
              <PatternIcon cells={view.patternCells} size={120} />
              <BigText level="h2" tone="muted">
                {view.patternLabel} on call {view.callIndex}
              </BigText>
            </div>
          </div>
        </Stage>
      );
    }
    return (
      <Stage center>
        <BigText level="display" tone="muted">
          No bingo
        </BigText>
        <BigText level="h1">The deck's empty — nobody wins round {view.round}.</BigText>
      </Stage>
    );
  }

  if (view.phaseId === 'scoreboard') {
    const next = view.patterns[view.round] ?? null;
    return (
      <Stage>
        <BigText level="h1">Rounds won</BigText>
        <Scoreboard rows={rows(view)} noTrophy />
        {next ? (
          <BigText level="h2" tone="accent">
            Next: round {view.round + 1} — {next}
          </BigText>
        ) : null}
      </Stage>
    );
  }

  return (
    <Stage>
      <BigText level="h1" tone="accent">
        That's bingo!
      </BigText>
      <Scoreboard rows={rows(view)} />
    </Stage>
  );
}
