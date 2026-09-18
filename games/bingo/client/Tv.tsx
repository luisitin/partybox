// TV view for Bingo. Dumb component: renders `view`, composes game-sdk primitives, never touches
// sockets or game logic. During play the stage shows ONE thing: the current call — plus the one
// before it, small, and the hall board when the VIP left it on. A claim stops the caller at once
// (server); the stage then drops the claimant's card, turns the pattern's cells in reading order
// for the whole room, shows the rest of the card, and only then delivers the verdict: a buzzer
// and "NOT A BINGO", or the cheer with confetti — and waits for a phone to move on.
import { useEffect, useLayoutEffect } from 'react';
import type { JSX } from 'react';
import { Avatar, BigText, Scoreboard, Stage, useSoundApi } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { BingoTvView } from '../server/views';
import { BALL_LAND_MS, hushCaller, speakCall } from './caller';
import { PATTERN_LABEL, patternCells } from '../server/patterns';
import { PatternIcon } from './Card';
import { PatternDemo } from './PatternDemo';
import { pendingLine, whyNot, winHeadline } from './copy';
import { IntroCountdown, Resume } from './TvCountdown';
import { Call, CalledBoard, ClaimStage, DibsLine, rows, whichCard } from './TvParts';
import styles from './Tv.module.css';

/** "Sam is" / "Sam and Priya are" / "Sam and 2 others are". */
function joinNames(names: string[]): string {
  if (names.length === 1) return `${names[0]} is`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are`;
  return `${names[0]} and ${names.length - 1} others are`;
}

export function Tv({ view }: GameTvProps<BingoTvView>): JSX.Element {
  const roundLabel = `Round ${view.round} of ${view.totalRounds}`;
  const sound = useSoundApi();
  const phaseId = view.phaseId;
  const number = view.current?.number ?? null;
  const letter = view.current?.letter ?? null;
  // Every new number: the ball drops out of the cage (Tv.module.css, 420 ms); the recorded call's
  // first syllable starts on the frame it enters (loop 335 — the owner, twice: a listener must be
  // as fast as a watcher) and the "boing" lands as it squashes (BALL_LAND_MS after the push); no
  // per-second ticking — the timer is quiet. Leaving play (a claim, a check) hushes the caller mid-word and cancels a
  // boing or a voice still in the air.
  // Dibs (loop 252): the "says BINGO?…" line pops with a soft rising "hm?"; a window passing on
  // to the next in line is a new window, so it sounds again.
  const armWindow = view.arm?.until ?? null;
  useEffect(() => {
    if (armWindow !== null) sound.play('dibs');
  }, [armWindow, sound]);
  // A call is the server's stamp (`calledAt`, loop 294): a resume countdown or a card-style hold
  // shows the same number without re-calling it, and the repeat after "keep going" is a new stamp.
  const calledAt = view.calledAt;
  const quiet = view.resumeAt !== null || view.pausedBy.length > 0;
  useLayoutEffect(() => {
    if (phaseId !== 'play' || number === null || letter === null) {
      hushCaller(sound);
      return;
    }
    if (quiet || calledAt === null) return;
    // The voice starts now — its first syllable on the frame the ball enters (loop 335, the owner
    // twice); the boing waits for the squash, BALL_LAND_MS in.
    speakCall(sound, letter, number);
    const t = setTimeout(() => sound.play('call'), BALL_LAND_MS);
    return () => {
      clearTimeout(t);
    };
  }, [phaseId, number, letter, quiet, calledAt, sound]);

  if (view.phaseId === 'intro') {
    return (
      <Stage center>
        <BigText level="h2" tone="muted">
          {roundLabel}
        </BigText>
        <div className={styles.patternRow}>
          <PatternDemo pattern={view.pattern} cells={view.patternCells} size={200} />
          <BigText level="display" tone="accent">
            {view.patternLabel}
          </BigText>
        </div>
        <BigText level="h2">{view.patternHint}</BigText>
        {view.cardsPerPlayer > 1 ? (
          <BigText level="h2" tone="muted">
            {view.cardsPerPlayer} cards each — BINGO! checks the card you press it on.
          </BigText>
        ) : null}
        <p className={styles.programme}>
          {view.patterns.map((p, i) => (
            <span key={i} className={i + 1 === view.round ? styles.programmeNow : ''}>
              {i + 1}. {p}
            </span>
          ))}
        </p>
        <IntroCountdown deadline={view.deadline} cards={view.cardsPerPlayer} />
      </Stage>
    );
  }

  if (view.phaseId === 'play') {
    // A menu open somewhere holds the caller; the last one closing runs a 3 · 2 · 1 on the stage.
    if (view.resumeAt !== null)
      return (
        <Resume
          roundLabel={roundLabel}
          resumeAt={view.resumeAt}
          pattern={view.patternLabel}
          by={view.resumeBy}
        />
      );
    if (view.pausedBy.length > 0)
      return (
        <Stage center className={styles.held}>
          <p className={styles.kicker}>
            {roundLabel} · call {view.callIndex} of 75
          </p>
          {view.current ? (
            <div className={styles.heldCall}>
              <Call call={view.current} big />
            </div>
          ) : null}
          <BigText level="h1">⏸ {joinNames(view.pausedBy)} changing card style…</BigText>
          <BigText level="h2" tone="muted">
            calling resumes when they are done
          </BigText>
        </Stage>
      );
    return (
      // Two chip rows (9+ players) eat ~70 px of stage: everything below tightens a notch (loop #3).
      <Stage
        center
        className={`${styles.playStage} ${view.showBoard ? '' : styles.roomy} ${view.players.length > 8 ? styles.crowded : ''}`}
      >
        <p className={styles.kicker}>
          {roundLabel} · {view.patternLabel} · call {view.callIndex} of 75
          {view.bingosThisRound > 0
            ? ` · ${view.bingosThisRound} bingo${view.bingosThisRound === 1 ? '' : 's'} so far`
            : ''}
        </p>
        {view.current ? <Call call={view.current} big stamp={view.calledAt} /> : null}
        {/* Ball first (180 ms pop), nickname 120 ms behind it: the number is the news (review-loop #1). */}
        {view.current ? (
          <div key={`${view.current.number}:${view.calledAt ?? ''}`} className={styles.caption}>
            <BigText level="h1">{view.current.call}</BigText>
          </div>
        ) : null}
        {/* No reserved slot on the first call (review-loop #3): the row arrives with number two. */}
        {/* Crowded and the board on: the board is the history, the tray row gives its 80 px back. */}
        {view.showPrevious && view.previous && !(view.players.length > 8 && view.showBoard) ? (
          <div className={styles.previousRow}>
            <span className={styles.previousLabel}>Before that</span>
            <Call call={view.previous} />
          </div>
        ) : null}
        {view.showBoard ? (
          <CalledBoard called={view.called} current={view.current?.number ?? null} />
        ) : null}
        <DibsLine arm={view.arm} queue={view.queue} />
      </Stage>
    );
  }

  // Nine or more players wrap the roster to two or three rows: the claim card lands smaller.
  const crowd = view.players.length > 8 ? styles.crowdedClaim : '';
  if (view.phaseId === 'check' && view.claim) {
    return (
      <Stage className={crowd}>
        <div className={`${styles.checkHead} pb-enter`}>
          <BigText level="h2" tone="accent">
            {view.claim.name} says BINGO!
          </BigText>
          <p className={styles.kicker}>
            {view.patternLabel}
            {whichCard(view.claim)} · checking against {view.callIndex} calls
          </p>
        </div>
        <ClaimStage
          key={`${view.claim.playerId}:${view.claim.cardIndex}:${view.callIndex}`}
          claim={view.claim}
          judged={view.verdictShown}
          valid={false}
          verdict={
            <>
              <BigText level="h1" className={styles.no}>
                NOT A BINGO
              </BigText>
              <p className={styles.legend}>
                <span className={styles.legendGreen}>✓ right</span>
                <span className={styles.legendRed}>✕ never called</span>
                <span className={styles.legendMissing}>▢ missed</span>
              </p>
              {whyNot(view.claim) ? <BigText level="h2">{whyNot(view.claim)}</BigText> : null}
              <BigText level="h2" tone="muted">
                Card wiped. Next number in a moment…
              </BigText>
            </>
          }
        />
      </Stage>
    );
  }

  if (view.phaseId === 'bingo') {
    if (view.claim && view.winnerName) {
      const winnerAvatar = view.players.find((p) => p.id === view.claim?.playerId)?.avatarId ?? '';
      return (
        <Stage className={crowd}>
          <div className={`${styles.checkHead} pb-enter`}>
            <BigText level="h2" tone="accent">
              {view.winnerName} says BINGO!
            </BigText>
            <p className={styles.kicker}>
              {view.patternLabel}
              {whichCard(view.claim)} · checking against {view.callIndex} calls
            </p>
          </div>
          <ClaimStage
            key={`${view.claim.playerId}:${view.claim.cardIndex}:${view.callIndex}:${view.bingosThisRound}`}
            claim={view.claim}
            judged={view.verdictShown}
            valid
            verdict={
              <>
                <BigText level="display" tone="accent" className={styles.bingoTitle}>
                  BINGO!
                </BigText>
                {/* The winner's face beside their name (loop 331): the room looks up from the
                    phones and sees who, not just a name in the roster. */}
                <div className={styles.winWho}>
                  <Avatar avatarId={winnerAvatar} size="var(--pb-win-avatar)" />
                  <BigText level="h1">{winHeadline(view, view.winnerName)}</BigText>
                </div>
                <p className={styles.winLine}>
                  <PatternIcon cells={view.patternCells} size={72} />
                  <span>
                    {/* No "round N" here: the kicker above the card says it (loop 337). */}
                    {view.patternLabel} on call {view.callIndex} · +{view.claimPoints}{' '}
                    {view.claimPoints === 1 ? 'point' : 'points'}
                    {whichCard(view.claim)}
                  </span>
                </p>
              </>
            }
            aside={
              view.autoEnd ? (
                <p className={`${styles.decideLine} pb-enter`}>
                  Nothing left to play for on these cards — the scores in a moment.
                </p>
              ) : view.pendingDecision ? (
                <p className={`${styles.decideLine} pb-enter`}>
                  {pendingLine(
                    view.pendingDecision,
                    view.round >= view.totalRounds,
                    view.pendingBy,
                  )}
                </p>
              ) : view.decide && (view.decide.same || view.decide.blackout) ? (
                <p className={`${styles.decideLine} pb-enter`}>
                  <span className={styles.decideWho}>Anyone</span> picks on their phone: keep going
                  {view.decide.blackout ? ' (same pattern or blackout)' : ''} or{' '}
                  {view.round < view.totalRounds ? 'next round' : 'finish'}. The caller waits.
                  {view.decide.same && view.claim.cardCount > 1
                    ? ' The winning card sits the pattern out; the rest play on.'
                    : ''}
                </p>
              ) : null
            }
          />
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

  if (view.phaseId === 'final') {
    // The drumroll (loop 246): the final board with the crown withheld, "and the winner is…" —
    // the engine's results screen names them with the fanfare 4 s later.
    const tied = view.standings.filter((r) => r.rank === 1).length > 1;
    return (
      <Stage center>
        <BigText level="h2" tone="muted">
          Final round played
        </BigText>
        <BigText level="h1">Final points</BigText>
        <Scoreboard rows={rows(view)} noTrophy stagger="up" />
        <BigText level="h2" tone="accent">
          {tied ? "It's a tie" : 'And the winner is'}
          <span className={styles.ellipsis} aria-hidden>
            …
          </span>
        </BigText>
      </Stage>
    );
  }

  if (view.phaseId === 'scoreboard') {
    const next = view.patterns[view.round] ?? null;
    // Centred like the game-end board (loop 6 pick 2A): the rounds-won table sat in the left half.
    return (
      <Stage center>
        <BigText level="h1">Points</BigText>
        <Scoreboard rows={rows(view)} noTrophy />
        {next ? (
          // The next pattern's shape beside its name (loop 287): the room sees the goal early.
          <div className={styles.nextUp}>
            <PatternIcon cells={patternCells(next)} size={56} />
            <BigText level="h2" tone="accent">
              Next: round {view.round + 1} — {PATTERN_LABEL[next]}
            </BigText>
          </div>
        ) : null}
      </Stage>
    );
  }

  return (
    <Stage center>
      <BigText level="h1" tone="accent">
        That's bingo!
      </BigText>
      <Scoreboard rows={rows(view)} />
    </Stage>
  );
}
