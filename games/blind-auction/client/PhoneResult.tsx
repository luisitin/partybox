// `sold` and `flip` on an at-TV phone (P00 §7.3): "👀 Watch the TV" while the TV builds the moment,
// then — once the server's step 1 says the TV has shown it — your own line, big, with your coins.
import type { JSX } from 'react';
import { Screen, WaitingScreen, buzz, useCountUp, useSound, useT } from '@partybox/game-sdk/ui';
import type { PushedView } from '@partybox/game-sdk/ui';
import { useEffect, useRef, useState } from 'react';
import type { OwnLine } from '../server/views';
import type { BlindAuctionControllerView } from '../server/views';
import { ownLineText } from './copy';
import { Purse } from './PhoneLot';
import styles from './phone.module.css';
import { STRINGS } from './strings';

type Mood = 'up' | 'down' | 'flat';

function moodOf(line: OwnLine): Mood {
  switch (line.kind) {
    case 'won':
      return 'up';
    case 'stolen':
      return 'down';
    case 'mine':
      return line.effect === 'gain' ||
        line.effect === 'double' ||
        (line.effect === 'steal' && line.amount > 0)
        ? 'up'
        : line.effect === 'lose'
          ? 'down'
          : 'flat';
    default:
      return 'flat';
  }
}

const GLYPH: Record<Mood, string> = { up: '🎉', down: '💀', flat: '🔨' };

/** The own line as a card (shared with PhoneStage). */
export function OwnLineCard({
  line,
  coins,
  from,
}: {
  line: OwnLine;
  coins: number;
  /** Your coins before this moment: the purse counts from here. */
  from: number;
}): JSX.Element {
  const L = useT(STRINGS);
  const play = useSound();
  const mood = moodOf(line);
  const text = ownLineText(L, line);
  const shown = useCountUp(coins, from, 900, 250);
  const felt = useRef(false);
  useEffect(() => {
    if (felt.current) return;
    felt.current = true;
    if (mood === 'up') {
      play('correct');
      buzz([30, 40, 30]);
    } else if (mood === 'down') {
      buzz(120);
    }
  }, [mood, play]);
  return (
    <div className={`${styles.ownLine} ${styles[mood]}`} role="status" aria-live="polite">
      <span className={styles.ownGlyph} aria-hidden>
        {line.kind === 'stolen' ? '🦝' : line.kind === 'swapped' ? '🔄' : GLYPH[mood]}
      </span>
      <p className={styles.ownBig}>{text.big}</p>
      {text.small ? <p className={styles.ownSmall}>{text.small}</p> : null}
      <Purse coins={shown} />
    </div>
  );
}

export function PhoneResult({
  view,
}: {
  view: PushedView<BlindAuctionControllerView>;
}): JSX.Element {
  const L = useT(STRINGS);
  // The coins this phone last showed before the moment landed: the own line counts from them.
  const [before, setBefore] = useState(view.coins);
  if (view.step === 0 && before !== view.coins) setBefore(view.coins);
  if (!view.line || view.step === 0)
    return (
      <WaitingScreen
        title={L('👀 Watch the TV')}
        hint={view.phaseId === 'sold' ? L('Who bid the most?') : L('What was inside?')}
        mood="watch"
      />
    );
  return (
    <Screen className={styles.screen}>
      <OwnLineCard
        key={`${view.phaseId}-${view.lot?.n ?? 0}`}
        line={view.line}
        coins={view.coins}
        from={before}
      />
    </Screen>
  );
}
