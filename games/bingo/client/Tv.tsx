// TV view for Bingo. Dumb component: renders `view`, composes game-sdk primitives, never touches
// sockets or game logic. During play the stage shows ONE thing: the current call — plus the one
// before it, small, and the hall board when the VIP left it on. A claim stops the caller at once
// (server); the stage then drops the claimant's card, turns the pattern's cells in reading order
// for the whole room, shows the rest of the card, and only then delivers the verdict: a buzzer
// and "NOT A BINGO", or the cheer with confetti — and waits for a phone to move on.
import { useEffect, useLayoutEffect } from 'react';
import type { JSX } from 'react';
import { BigText, Scoreboard, Stage, useSecondsLeft, useSoundApi } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { BingoTvView } from '../server/views';
import { hushCaller, speakCall } from './caller';
import { PatternIcon } from './Card';
import { pendingLine, winHeadline } from './copy';
import { Call, CalledBoard, ClaimStage, rows, whichCard } from './TvParts';
import styles from './Tv.module.css';

/** "Sam is" / "Sam and Priya are" / "Sam and 2 others are". */
function joinNames(names: string[]): string {
  if (names.length === 1) return `${names[0]} is`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are`;
  return `${names[0]} and ${names.length - 1} others are`;
}

/** The 3 · 2 · 1 after the last card-style menu closes: one tick per second, then the next number. */
function Resume({ roundLabel, resumeAt }: { roundLabel: string; resumeAt: number }): JSX.Element {
  const left = Math.min(3, useSecondsLeft(resumeAt) ?? 0); // a 4 would tick four times on a 3 s hold
  const sound = useSoundApi();
  useEffect(() => {
    if (left > 0) sound.play('tick');
  }, [left, sound]);
  return (
    <Stage center>
      <p className={styles.kicker}>{roundLabel} · calling resumes in</p>
      <BigText key={left} level="display" tone="accent" className="pb-pop">
        {Math.max(1, left)}
      </BigText>
      <BigText level="h2" tone="muted">
        get your thumbs ready
      </BigText>
    </Stage>
  );
}

export function Tv({ view }: GameTvProps<BingoTvView>): JSX.Element {
  const roundLabel = `Round ${view.round} of ${view.totalRounds}`;
  const sound = useSoundApi();
  const phaseId = view.phaseId;
  const number = view.current?.number ?? null;
  const letter = view.current?.letter ?? null;
  // Every new number: the "boing" the instant the push lands (a layout effect, before paint), the
  // recorded call 120 ms behind it; no per-second ticking — the timer is quiet. Leaving play (a
  // claim, a check) hushes the caller mid-word.
  useLayoutEffect(() => {
    if (phaseId !== 'play' || number === null || letter === null) {
      hushCaller(sound);
      return;
    }
    sound.play('call');
    speakCall(sound, letter, number);
  }, [phaseId, number, letter, sound]);

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
      </Stage>
    );
  }

  if (view.phaseId === 'play') {
    // A menu open somewhere holds the caller; the last one closing runs a 3 · 2 · 1 on the stage.
    if (view.resumeAt !== null) return <Resume roundLabel={roundLabel} resumeAt={view.resumeAt} />;
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
        {view.current ? <Call call={view.current} big /> : null}
        {/* Ball first (180 ms pop), nickname 120 ms behind it: the number is the news (review-loop #1). */}
        {view.current ? (
          <div key={view.current.number} className={styles.caption}>
            <BigText level="h1">{view.current.call}</BigText>
          </div>
        ) : null}
        {/* No reserved slot on the first call (review-loop #3): the row arrives with number two. */}
        {view.showPrevious && view.previous ? (
          <div className={styles.previousRow}>
            <span className={styles.previousLabel}>Before that</span>
            <Call call={view.previous} />
          </div>
        ) : null}
        {view.showBoard ? (
          <CalledBoard called={view.called} current={view.current?.number ?? null} />
        ) : null}
        {view.arm ? (
          <BigText level="h2" tone="accent" className="pb-pop">
            {view.arm.name} says BINGO?…
          </BigText>
        ) : null}
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
          key={`${view.claim.playerId}:${view.callIndex}`}
          claim={view.claim}
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
            key={`${view.claim.playerId}:${view.callIndex}`}
            claim={view.claim}
            valid
            verdict={
              <>
                <BigText level="display" tone="accent" className={styles.bingoTitle}>
                  BINGO!
                </BigText>
                <BigText level="h1">{winHeadline(view, view.winnerName)}</BigText>
                <p className={styles.winLine}>
                  <PatternIcon cells={view.patternCells} size={72} />
                  <span>
                    {view.patternLabel} on call {view.callIndex} · round {view.round}
                    {whichCard(view.claim)}
                  </span>
                </p>
              </>
            }
            aside={
              view.pendingDecision ? (
                <p className={`${styles.decideLine} pb-enter`}>
                  {pendingLine(view.pendingDecision, view.round >= view.totalRounds)}
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

  if (view.phaseId === 'scoreboard') {
    const next = view.patterns[view.round] ?? null;
    // Centred like the game-end board (loop 6 pick 2A): the rounds-won table sat in the left half.
    return (
      <Stage center>
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
    <Stage center>
      <BigText level="h1" tone="accent">
        That's bingo!
      </BigText>
      <Scoreboard rows={rows(view)} />
    </Stage>
  );
}
