// `open` on an at-TV phone (P00 §7.3): "👀 Watch the TV" while the bets land and the box turns, then
// — once the server's step 1 says the TV has shown it — your own line, big, with your coins
// counting to their new total.
import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { Screen, WaitingScreen, buzz, useCountUp, useSound, useT } from '@partybox/game-sdk/ui';
import type { PushedView } from '@partybox/game-sdk/ui';
import type { BlindAuctionControllerView, OwnLine } from '../server/views';
import { KIND_ICON, kindName, ownLineText } from './copy';
import { Purse } from './PhoneLot';
import styles from './phone.module.css';
import { STRINGS } from './strings';

type Mood = 'up' | 'down' | 'flat';

const moodOf = (line: OwnLine): Mood =>
  line.kind === 'won' ? 'up' : line.kind === 'lost' ? 'down' : 'flat';

const GLYPH: Record<Mood, string> = { up: '🎉', down: '💸', flat: '🪑' };

/** The own line as a card (shared with PhoneStage). */
export function OwnLineCard({
  line,
  inside,
  coins,
  from,
}: {
  line: OwnLine;
  /** What was inside, in words ("💀 A trap"). */
  inside: string;
  coins: number;
  /** Your coins before this moment: the purse counts from here. */
  from: number;
}): JSX.Element {
  const L = useT(STRINGS);
  const play = useSound();
  const mood = moodOf(line);
  const text = ownLineText(L, line, inside);
  const shown = useCountUp(coins, from, 900, 250);
  const felt = useRef(false);
  useEffect(() => {
    if (felt.current) return;
    felt.current = true;
    if (mood === 'up') {
      play('correct');
      buzz([30, 40, 30]);
    } else if (mood === 'down') buzz(120);
  }, [mood, play]);
  return (
    <div className={`${styles.ownLine} ${styles[mood]}`} role="status" aria-live="polite">
      <span className={styles.ownGlyph} aria-hidden>
        {GLYPH[mood]}
      </span>
      <p className={styles.ownBig}>{text.big}</p>
      <p className={styles.ownSmall}>{text.small}</p>
      <Purse coins={shown} />
    </div>
  );
}

export function insideWords(
  L: ReturnType<typeof useT>,
  view: PushedView<BlindAuctionControllerView>,
): string {
  const o = view.box && view.outcome !== null ? view.box.options[view.outcome] : undefined;
  return o ? `${KIND_ICON[o.kind]} ${kindName(L, o.kind)}` : '?';
}

export function PhoneResult({
  view,
}: {
  view: PushedView<BlindAuctionControllerView>;
}): JSX.Element {
  const L = useT(STRINGS);
  // The coins this phone showed before the box opened: the own line counts from them.
  const [before, setBefore] = useState(view.coins);
  if (view.step === 0 && before !== view.coins) setBefore(view.coins);
  if (!view.line || view.step === 0)
    return <WaitingScreen title={L('👀 Watch the TV')} hint={L('What is inside?')} mood="watch" />;
  return (
    <Screen className={styles.screen}>
      <OwnLineCard
        key={view.box?.n ?? 0}
        line={view.line}
        inside={insideWords(L, view)}
        coins={view.coins}
        from={before}
      />
    </Screen>
  );
}
