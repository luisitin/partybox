// I-589 (the owner's note on option B): "a bit more time at the standings page with a 'next
// question' button the vip or tv can click to go next. If a new button is added then the
// 'skip/next' should be hidden in this game." A regular reveal carries `next` (and the envelope's
// `vipSkipHidden`, so the host bar and the ★ menu drop their generic Skip / Next); the button
// arrives with the standings (RACE_MS in) on the TV stage and on the VIP's phone. Both send the
// engine's VIP skip; one tap locks the button, so a double tap never skips two phases. On the TV it
// takes the header's topic slot (right of "Question n of m"): at sixteen players the stage has no
// free row for it above the host bar, and the header's line keeps its height.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { PrimaryButton, useT } from '@partybox/game-sdk/ui';
import type { Translator } from '@partybox/game-sdk/ui';
import type { RevealNext } from '../server/views';
import { STRINGS } from './strings';
import { RACE_MS } from './timing';
import styles from './Tv.module.css';

function nextLabel(next: RevealNext, L: Translator): string {
  return next === 'wager' ? L('On to the wager') : L('Next question');
}

/** True once the standings are up: RACE_MS after this reveal mounted (keyed by its deadline). */
export function useStandingsUp(key: number | null): boolean {
  const [upFor, setUpFor] = useState<number | null>(null);
  useEffect(() => {
    const h = setTimeout(() => setUpFor(key), RACE_MS);
    return () => clearTimeout(h);
  }, [key]);
  return key !== null && upFor === key;
}

/** The TV stage's Next: the host clicks it on the screen the party is run from (ADR-031). The
 *  caller shows it once the standings are up (useStandingsUp). */
export function TvNext({ next, skip }: { next: RevealNext; skip: () => void }): JSX.Element {
  const L = useT(STRINGS);
  const [sent, setSent] = useState(false);
  return (
    <button
      type="button"
      className={styles.nextButton}
      disabled={sent}
      onClick={() => {
        setSent(true);
        skip();
      }}
    >
      {sent ? L('Moving on…') : `${nextLabel(next, L)} ▶`}
    </button>
  );
}

/** The VIP's phone: the same Next, under the outcome card (other phones get no `skip`). */
export function PhoneNext({
  next,
  skip,
  phaseKey,
}: {
  next: RevealNext | undefined;
  skip: (() => void) | undefined;
  phaseKey: number | null;
}): JSX.Element | null {
  const L = useT(STRINGS);
  const up = useStandingsUp(phaseKey);
  const [sent, setSent] = useState(false);
  if (!next || !skip || !up) return null;
  return (
    <PrimaryButton
      tone="neutral"
      done={sent}
      onClick={() => {
        if (sent) return;
        setSent(true);
        skip();
      }}
    >
      {sent ? L('Moving on…') : nextLabel(next, L)}
    </PrimaryButton>
  );
}
