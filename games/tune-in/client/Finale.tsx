// The results stage keeps Tune In's own last board for teams and co-op (spec §5.7): the final
// banner, or co-op's rating — the verdict the headline cannot give (everyone is crowned).
import type { JSX } from 'react';
import { BigText, useT } from '@partybox/game-sdk/ui';
import type { GameFinaleProps } from '@partybox/game-sdk/ui';
import { TeamBanner } from '@partybox/game-sdk/ui/team-banner';
import type { TuneTvView } from '../server/index';
import { ratingText } from './copy';
import { STRINGS } from './strings';
import styles from './tv.module.css';
import { CoopMeter } from './TvHeader';
import { useReading } from './useReading';

export function Finale({ lastView }: GameFinaleProps<TuneTvView>): JSX.Element | null {
  const L = useT(STRINGS);
  useReading(lastView.reading);
  if (lastView.turn.mode === 'teams')
    return (
      <div className={styles.finale}>
        <TeamBanner
          className={styles.bigBanner}
          sun={lastView.team.sun}
          moon={lastView.team.moon}
          winAt={lastView.winAt}
          words={{ sun: L('Sun'), moon: L('Moon'), middle: L('Final score') }}
        />
      </div>
    );
  if (!lastView.coop) return null;
  return (
    <div className={styles.finale}>
      <BigText level="display" className={styles.rating}>
        {ratingText(L, lastView.coop.rating)}
      </BigText>
      <div className={styles.bigMeter}>
        <CoopMeter total={lastView.coop.total} max={lastView.coop.max} />
      </div>
    </div>
  );
}
