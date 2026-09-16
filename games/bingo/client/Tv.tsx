// TV view for Bingo. Dumb component: renders `view`, composes game-sdk primitives, never touches
// sockets or game logic. During play the stage shows ONE thing: the current call — plus the one
// before it, small. A check puts the claimant's card up for the whole room.
import type { JSX } from 'react';
import { BigText, Scoreboard, Stage } from '@partybox/game-sdk/ui';
import type { GameTvProps, ScoreboardRow } from '@partybox/game-sdk/ui';
import type { BingoTvView, CallView, ClaimView } from '../server/views';
import { Card, PatternIcon } from './Card';
import styles from './Tv.module.css';

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
    <div className={`${big ? styles.callBig : styles.callSmall} pb-enter`} key={call.number}>
      <span className={styles.letter}>{call.letter}</span>
      <span className={styles.number}>{call.number}</span>
    </div>
  );
}

function ClaimCard({ claim, celebrate }: { claim: ClaimView; celebrate: boolean }): JSX.Element {
  return (
    <div className={styles.claim}>
      <Card
        numbers={claim.card}
        daubs={claim.daubs}
        green={claim.green}
        red={celebrate ? [] : claim.red}
        missing={celebrate ? [] : claim.missing}
        size="tv"
        verdict
      />
    </div>
  );
}

export function Tv({ view }: GameTvProps<BingoTvView>): JSX.Element {
  const roundLabel = `Round ${view.round} of ${view.totalRounds}`;

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
          <div className={styles.verdict}>
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
          <div className={styles.checkHead}>
            <BigText level="h1" tone="accent">
              BINGO! {view.winnerName} wins round {view.round}
            </BigText>
          </div>
          <div className={styles.checkBody}>
            <ClaimCard claim={view.claim} celebrate />
            <div className={styles.verdict}>
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
