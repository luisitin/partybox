// TV view for Hive Rank. Dumb component: renders `view`, composes game-sdk primitives, never
// touches sockets or game logic. The shell shows the timer, the player strip and the host bar.
// A slow honeycomb drifts behind every phase (transform only), so no screen is ever still.
import type { JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { HiveTvView } from '../server/views';
import { STRINGS } from './strings';
import { TvHive } from './TvHive';
import { TvIntro, TvRank } from './TvRank';
import { TvScore } from './TvScore';
import { Honeycomb } from './Honeycomb';
import { useReading } from './useReading';
import styles from './Tv.module.css';

export function Tv({ view, skip }: GameTvProps<HiveTvView>): JSX.Element {
  const L = useT(STRINGS);
  useReading(view.speech);
  const body =
    view.phaseId === 'intro' ? (
      <TvIntro skip={view.next ? skip : undefined} />
    ) : view.phaseId === 'rank' ? (
      <TvRank view={view} />
    ) : view.phaseId === 'hive' ? (
      <TvHive view={view} />
    ) : view.phaseId === 'score' ? (
      <TvScore view={view} skip={skip} />
    ) : (
      <div className={styles.doneLine}>{L('That’s the hive!')}</div>
    );
  return (
    <div className={styles.root}>
      <Honeycomb />
      {body}
    </div>
  );
}
