// TV view for Bingo. Dumb component: renders `view`, composes game-sdk primitives, never touches
// sockets or game logic. During play the stage shows ONE thing: the current call — plus the one
// before it, small. A claim stops the caller at once (server); the stage then drops the
// claimant's card, turns the pattern's cells in reading order for the whole room, shows the rest
// of the card, and only then delivers the verdict: a buzzer and "NOT A BINGO", or the cheer with
// confetti — and waits for a phone to move on.
import { useEffect, useLayoutEffect } from 'react';
import type { JSX } from 'react';
import {
  BigText,
  Confetti,
  Scoreboard,
  Stage,
  useBeats,
  usePrefersReducedMotion,
  useSoundApi,
} from '@partybox/game-sdk/ui';
import type { GameTvProps, ScoreboardRow } from '@partybox/game-sdk/ui';
import type { BingoTvView, CallView, ClaimView } from '../server/views';
import { hushCaller, speakCall } from './caller';
import { Card, PatternIcon } from './Card';
import type { SweepKind } from './Card';
import styles from './Tv.module.css';

// A claim on the stage, in beats. The card drops in with a bounce (DROP), every daub an outline,
// unread. Then the pattern's cells turn one by one in reading order — a row left to right, a
// column top down, a diagonal from its top corner — a gold sweep travelling a winning line
// (STEP per cell); a breath (LINE_HOLD); then every other tile takes its final look at once,
// slowly (REST), so the room sees the whole card; suspense (HOLD); the card settles left
// (SETTLE) and only then the verdict: BINGO! with the cheer and confetti, or NOT A BINGO with the
// buzzer. After that nothing is on a timer — the phones decide. Reduced motion shows the settled
// verdict at once.
const DROP_MS = 700;
const STEP_MS = 220;
/** Blackout turns 25 cells: quicker steps keep the line under 3 s. */
const STEP_MANY_MS = 120;
const LINE_HOLD_MS = 400;
const REST_MS = 900;
const HOLD_MS = 700;
/** The card settles into its column before the verdict pops beside it (= --pb-motion-slow). */
const SETTLE_MS = 600;

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

/** The pattern's cells in reading order: rows left→right, columns top→down, diagonals from the top. */
function patternOrder(claim: ClaimView): number[] {
  return [...claim.cells].sort((a, b) => a - b);
}

/** Which line five cells make (for the sweep); other shapes get the ordered turns alone. */
function lineOf(cells: readonly number[]): { kind: SweepKind; index: number } | null {
  if (cells.length !== 5) return null;
  const first = cells[0] ?? 0;
  if (cells.every((i) => Math.floor(i / 5) === Math.floor(first / 5)))
    return { kind: 'row', index: Math.floor(first / 5) };
  if (cells.every((i) => i % 5 === first % 5)) return { kind: 'col', index: first % 5 };
  if (cells.every((i, k) => i === k * 6)) return { kind: 'diagA', index: 0 };
  if (cells.every((i, k) => i === 4 + k * 4)) return { kind: 'diagB', index: 0 };
  return null;
}

function ClaimStage({
  claim,
  valid,
  verdict,
  aside,
}: {
  claim: ClaimView;
  valid: boolean;
  /** The verdict block, rendered once the reveal is done. */
  verdict: JSX.Element;
  /** Anything that belongs with the verdict (how the room moves on). */
  aside?: JSX.Element | null;
}): JSX.Element {
  const order = patternOrder(claim);
  const step = order.length > 9 ? STEP_MANY_MS : STEP_MS;
  const lineMs = order.length * step;
  const restAt = DROP_MS + lineMs + LINE_HOLD_MS;
  // A card with nothing beyond the pattern has no "rest" to show: straight on to the suspense.
  const restMs = claim.daubs.some((i) => !order.includes(i)) ? REST_MS : 0;
  const settleAt = restAt + restMs + HOLD_MS;
  const beat = useBeats([0, DROP_MS, restAt, settleAt, settleAt + SETTLE_MS]);
  const reduced = usePrefersReducedMotion();
  const sound = useSoundApi();
  const turning = beat >= 1 || reduced; // the pattern's cells turn, the sweep runs
  const restShown = beat >= 2 || reduced; // the other tiles fade in together
  const decided = beat >= 3 || reduced; // the card settles into its column
  const shown = beat >= 4 || reduced; // the verdict pops beside it — and sounds
  const line = valid ? lineOf(order) : null;
  const sweeps = turning && line !== null && !reduced;
  useEffect(() => {
    if (sweeps) sound.play('sweep');
  }, [sweeps, sound]);
  // The verdict's sound lands on the verdict — cheer + confetti for a bingo, the buzzer otherwise.
  useEffect(() => {
    if (!shown) return;
    sound.play(valid ? 'cheer' : 'wrong');
  }, [shown, valid, sound]);
  return (
    <div className={`${styles.claimStage} ${decided ? styles.decided : ''}`}>
      {shown && valid ? <Confetti /> : null}
      <div className={`${styles.claim} ${styles.claimLand}`}>
        <Card
          numbers={claim.card}
          daubs={claim.daubs}
          green={claim.green}
          red={valid ? [] : claim.red}
          missing={claim.missing}
          size="tv"
          verdict
          revealOrder={turning ? order : []}
          revealStepMs={step}
          restShown={restShown}
          settled={decided}
          sweep={turning && line && !reduced ? { ...line, ms: lineMs } : null}
        />
      </div>
      <div className={`${styles.verdict} ${shown ? 'pb-pop' : styles.verdictPending}`}>
        {shown ? verdict : null}
        {shown ? aside : null}
      </div>
    </div>
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
        <div className={`${styles.checkHead} pb-enter`}>
          <BigText level="h2" tone="accent">
            {view.claim.name} says BINGO!
          </BigText>
          <p className={styles.kicker}>
            {view.patternLabel} · checking against {view.callIndex} calls
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
        <Stage>
          <div className={`${styles.checkHead} pb-enter`}>
            <BigText level="h2" tone="accent">
              {view.winnerName} says BINGO!
            </BigText>
            <p className={styles.kicker}>
              {view.patternLabel} · checking against {view.callIndex} calls
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
                <BigText level="h1">
                  {view.winnerName} wins round {view.round}
                </BigText>
                <p className={styles.winLine}>
                  <PatternIcon cells={view.patternCells} size={72} />
                  <span>
                    {view.patternLabel} on call {view.callIndex}
                    {view.bingosThisRound > 1 ? ` · bingo #${view.bingosThisRound} this round` : ''}
                  </span>
                </p>
              </>
            }
            aside={
              view.decide && (view.decide.same || view.decide.blackout) ? (
                <p className={`${styles.decideLine} pb-enter`}>
                  <span className={styles.decideWho}>Anyone</span> picks on their phone: keep going
                  {view.decide.blackout ? ' (same pattern or blackout)' : ''} or{' '}
                  {view.round < view.totalRounds ? 'next round' : 'finish'}. The caller waits.
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
