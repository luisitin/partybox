// TV view for Bingo. Dumb component: renders `view`, composes game-sdk primitives, never touches
// sockets or game logic. During play the stage shows ONE thing: the current call — plus the one
// before it, small. A claim stops the caller at once (server); the stage then lands the
// claimant's card cell by cell for the whole room, and only then delivers the verdict: a buzzer
// and "NOT A BINGO", or a fanfare with confetti.
import { useEffect, useLayoutEffect } from 'react';
import type { CSSProperties, JSX } from 'react';
import {
  BigText,
  Confetti,
  Scoreboard,
  Stage,
  useBeats,
  usePrefersReducedMotion,
  useSoundApi,
} from '@partybox/game-sdk/ui';
import type { GameTvProps, PushedView, ScoreboardRow } from '@partybox/game-sdk/ui';
import type { BingoTvView, CallView, ClaimView } from '../server/views';
import { hushCaller, speakCall } from './caller';
import { Card, PatternIcon } from './Card';
import styles from './Tv.module.css';

// A claim on the stage, in beats: the card lands big and centred (LAND), then every daubed cell
// turns over one by one in the order the numbers were called — green (called) or red (never
// called) — with a breath between them (STEP), a moment of suspense (HOLD), and only then the
// verdict: BINGO! with the cheer and confetti, or NOT A BINGO with the buzzer. Reduced motion
// shows the settled verdict at once.
const LAND_MS = 900;
const STEP_MS = 220;
const HOLD_MS = 700;
/** The card settles into its column before the verdict pops beside it (= --pb-motion-slow). */
const SETTLE_MS = 600;
/** The VIP's choice line arrives after the celebration has had its moment. */
const DECIDE_AFTER_MS = 3200;

function vipName(view: PushedView<BingoTvView>): string {
  return view.players.find((p) => p.id === view.vip)?.name ?? 'The VIP';
}

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

/**
 * Daubed cells in the order their numbers were called (never-called ones last, as daubed); FREE
 * first when the pattern uses it — it was always "called".
 */
function revealOrder(claim: ClaimView, called: readonly number[]): number[] {
  const rank = new Map(called.map((n, i) => [n, i]));
  const daubed = [...claim.daubs].sort(
    (a, b) =>
      (rank.get(claim.card[a] ?? -1) ?? 1e9) - (rank.get(claim.card[b] ?? -1) ?? 1e9) || a - b,
  );
  return claim.green.includes(12) ? [12, ...daubed] : daubed;
}

function ClaimStage({
  claim,
  called,
  valid,
  verdict,
  aside,
}: {
  claim: ClaimView;
  called: readonly number[];
  valid: boolean;
  /** The verdict block, rendered once the reveal is done. */
  verdict: JSX.Element;
  /** Anything that belongs after the verdict (the VIP's choice). */
  aside?: JSX.Element | null;
}): JSX.Element {
  const order = revealOrder(claim, called);
  const revealMs = order.length * STEP_MS;
  const settleAt = LAND_MS + revealMs + HOLD_MS;
  const beat = useBeats([0, LAND_MS, settleAt, settleAt + SETTLE_MS]);
  const reduced = usePrefersReducedMotion();
  const sound = useSoundApi();
  const decided = beat >= 2; // the card slides to its column
  const shown = beat >= 3; // the verdict pops beside it — and sounds
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
          red={decided && valid ? [] : claim.red}
          missing={decided ? claim.missing : []}
          size="tv"
          verdict
          revealOrder={beat >= 1 || reduced ? order : []}
          revealStepMs={STEP_MS}
          settled={decided}
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
          called={view.called}
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
      const decideAfter: CSSProperties = { animationDelay: `${DECIDE_AFTER_MS}ms` };
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
            called={view.called}
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
                <p className={`${styles.decideLine} pb-enter`} style={decideAfter}>
                  <span className={styles.decideWho}>{vipName(view)}</span> decides on their phone:
                  keep going {view.decide.blackout ? '(same pattern or blackout)' : ''} or{' '}
                  {view.round < view.totalRounds ? 'next round' : 'finish'} — the caller waits.
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
