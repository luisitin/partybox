// The shell game (LIVE-EVENTS.md, the owner's spec): three red cups and a ball. `shuffle` shows
// the ball go under its cup, then the cups swap in the server's order at the pot's speed tier —
// ×1 … ×10, the stage getting wilder and the host's taunt louder at each breakpoint. `cups`: the
// cups sit still while everyone picks. `open`: the cups lift and the ball is where it ended up.
import { useEffect, useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import {
  PrimaryButton,
  Screen,
  WaitingScreen,
  buzz,
  useReducedMotion,
  useSound,
  useT,
} from '@partybox/game-sdk/ui';
import type { GameControllerProps, Translator } from '@partybox/game-sdk/ui';
import { SHELL_LEAD_MS, SHELL_SPEED, SHELL_SWAP_MS } from '../server/timing';
import type { Input } from '../server/types';
import type { BlindAuctionControllerView } from '../server/views';
import { COIN } from './copy';
import styles from './live.module.css';
import { STRINGS } from './strings';

/** The host's line per speed tier: a few each, one picked by the round. */
export function taunt(L: Translator, tier: number, seed: number): string {
  const lines: string[][] = [
    [L('Nice and slow. Keep your eyes on the ball.'), L('A warm-up. Easy money.')],
    [L('Double speed! Still with me?'), L('×2. Blink and you miss it.')],
    [L('Triple speed! Eyes up!'), L('×3. The cups are getting ideas.')],
    [L('FIVE times! Is that the ball or a rumour?'), L('×5. Your eyes are lying to you.')],
    [L('EIGHT times! Nobody can follow this!'), L('×8. Pure chaos. Good luck.')],
    [L('TEN TIMES! The cups have left the building!'), L('×10. Just guess. Seriously.')],
  ];
  const tierLines = lines[Math.max(0, Math.min(5, tier))] ?? [];
  return tierLines[seed % tierLines.length] ?? '';
}

interface StageProps {
  /** Where the ball started, the swaps (null = cups still, e.g. `cups`), the tier. */
  start: number;
  moves: readonly [number, number][] | null;
  tier: number;
  /** `open`: lift the cups on the final ball, after `revealAfter` ms (the bets land first). */
  reveal: number | null;
  revealAfter?: number;
  /** The shuffle is over (`cups`, `open`): cups stand where it left them, no replay. */
  settled?: boolean;
}

/** Three cups at positions 0, 1, 2 (left to right); each move swaps two positions' cups. */
export function ShellStage({
  start,
  moves,
  tier,
  reveal,
  revealAfter = 0,
  settled,
}: StageProps): JSX.Element {
  const reduced = useReducedMotion();
  const play = useSound();
  const speed = SHELL_SPEED[tier] ?? 1;
  const stepMs = Math.max(50, SHELL_SWAP_MS / speed);
  // The step reached in the shuffle: −1 before it starts (the ball shown), then one per move.
  const [step, setStep] = useState(moves && !settled ? -1 : Number.MAX_SAFE_INTEGER);
  useEffect(() => {
    if (!moves || reduced || settled) return;
    const handles = [setTimeout(() => setStep(0), SHELL_LEAD_MS)];
    moves.forEach((_, i) =>
      handles.push(setTimeout(() => setStep(i + 1), SHELL_LEAD_MS + (i + 1) * stepMs)),
    );
    return () => handles.forEach(clearTimeout);
  }, [moves, stepMs, reduced, settled]);
  useEffect(() => {
    if (step > 0 && moves && step <= moves.length && speed <= 3) play('tick');
  }, [step, moves, speed, play]);
  // pos[c] = where cup c stands; a move (a, b) swaps whichever cups stand at positions a and b.
  const pos = [0, 1, 2];
  const upTo = moves ? Math.min(Math.max(step, 0), moves.length) : 0;
  for (const [a, b] of (moves ?? []).slice(0, upTo)) {
    const ca = pos.indexOf(a);
    const cb = pos.indexOf(b);
    if (ca >= 0 && cb >= 0) {
      pos[ca] = b;
      pos[cb] = a;
    }
  }
  const [shown, setShown] = useState(reveal !== null && (revealAfter <= 0 || reduced));
  useEffect(() => {
    if (reveal === null || shown) return;
    const h = setTimeout(() => {
      setShown(true);
      play('reveal');
    }, revealAfter);
    return () => clearTimeout(h);
  }, [reveal, revealAfter, shown, play]);
  const revealed = reveal !== null && shown;
  const lifted = (moves !== null && !settled && step < 0) || revealed;
  const ballCup = start;
  return (
    <div
      className={`${styles.shells} ${styles[`speed${tier}`] ?? ''}`}
      style={{ '--ba-swap': `${stepMs}ms` } as CSSProperties}
    >
      {[0, 1, 2].map((cup) => {
        const at = pos[cup] ?? cup;
        const showBall = revealed ? at === reveal : cup === ballCup && lifted;
        return (
          <span key={cup} className={styles.cupSlot} style={{ '--ba-at': at } as CSSProperties}>
            {showBall ? <span className={styles.ball} aria-hidden /> : null}
            <span
              className={`${styles.cup} ${lifted && (revealed || cup === ballCup) ? styles.cupUp : ''}`}
              aria-hidden
            />
          </span>
        );
      })}
      {/* The numbers stay with the places, not the cups: "Cup 2" is the middle one. */}
      {[0, 1, 2].map((at) => (
        <span key={`n${at}`} className={styles.cupLabel} style={{ '--ba-at': at } as CSSProperties}>
          {at + 1}
        </span>
      ))}
    </div>
  );
}

type PhoneProps = GameControllerProps<BlindAuctionControllerView, Input>;

/** `shuffle` on a phone: watch the TV (or, with no TV, the cups right here). */
export function PhoneShuffle({ view }: PhoneProps): JSX.Element {
  const L = useT(STRINGS);
  const sh = view.shells;
  if (!view.shellSwaps || !sh)
    return <WaitingScreen title={L('👀 Watch the ball on the TV!')} mood="watch" />;
  return (
    <Screen className={styles.screen}>
      <p className={styles.potatoTitle}>{L('Follow the ball!')}</p>
      <div className={styles.phoneStage}>
        <ShellStage start={sh.start} moves={view.shellSwaps} tier={sh.tier} reveal={null} />
      </div>
    </Screen>
  );
}

/** `cups` on a phone: three big cups to pick from. */
export function PhoneCups({ view, send }: PhoneProps): JSX.Element {
  const L = useT(STRINGS);
  if (view.myStake <= 0)
    return (
      <WaitingScreen
        title={L('Which cup?')}
        hint={L('No coins in the pot: watch the others pick.')}
        mood="watch"
      />
    );
  return (
    <Screen className={styles.screen}>
      <p className={styles.potatoTitle}>{L('Which cup hides the ball?')}</p>
      <p className={styles.potatoHint}>
        {L('Your {coin} {n} is in the pot', { coin: COIN, n: view.myStake })}
      </p>
      <div className={styles.cupButtons}>
        {[0, 1, 2].map((c) => (
          <PrimaryButton
            key={c}
            tone={view.myCup === c ? 'accent' : 'neutral'}
            done={view.myCup === c}
            onClick={() => {
              buzz(15);
              send({ type: 'cup', cup: c });
            }}
          >
            🥤 {L('Cup {n}', { n: c + 1 })}
          </PrimaryButton>
        ))}
      </div>
    </Screen>
  );
}
