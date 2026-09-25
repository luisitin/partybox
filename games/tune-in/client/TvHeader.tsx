// The round's header on the TV (teams and co-op; solo has none — the bubble names the round):
// teams get the TeamBanner (both scores racing to the target, the active side glowing, CATCH-UP!
// on a bonus turn); co-op gets its group meter with the four rating bands, one slim row each.
import type { CSSProperties, JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import { TeamBanner } from '@partybox/game-sdk/ui/team-banner';
import type { TuneTvView } from '../server/index';
import { STRINGS } from './strings';
import styles from './tv.module.css';

/** The rating bands' starts as shares of the maximum (spec §5.7). */
const BANDS = [
  { at: 0, glyph: '📺' },
  { at: 35, glyph: '📻' },
  { at: 55, glyph: '📡' },
  { at: 75, glyph: '🧠' },
];

export function CoopMeter({
  total,
  max,
  slim = false,
  from,
}: {
  total: number;
  max: number;
  slim?: boolean;
  /** The scores beat: the fill grows from this old total once the stage has landed. */
  from?: number;
}): JSX.Element {
  const L = useT(STRINGS);
  const share = (n: number): number => (max > 0 ? Math.min(1, Math.max(0, n / max)) : 0);
  const gain = from !== undefined && from !== total;
  return (
    <div
      className={`${styles.meter} ${slim ? styles.meterSlim : ''} ${gain ? styles.meterGain : ''}`}
      style={{ '--fill': share(total), '--from': share(from ?? total) } as CSSProperties}
    >
      <span className={styles.meterLabel}>{L('Group {total} / {max}', { total, max })}</span>
      <span className={styles.meterTrack} aria-hidden>
        <span className={styles.meterFill} />
        {BANDS.map((b) => (
          <span key={b.at} className={styles.meterBand} style={{ left: `${b.at}%` }}>
            {b.glyph}
          </span>
        ))}
      </span>
    </div>
  );
}

export function TvHeader({ view }: { view: TuneTvView }): JSX.Element {
  const L = useT(STRINGS);
  const { turn } = view;
  if (turn.mode === 'teams')
    return (
      <TeamBanner
        className={styles.banner}
        sun={view.team.sun}
        moon={view.team.moon}
        winAt={view.winAt}
        active={turn.team}
        tag={turn.catchUp ? L('CATCH-UP!') : undefined}
        words={{
          sun: L('Sun'),
          moon: L('Moon'),
          middle: L('First to {n}', { n: view.winAt }),
        }}
      />
    );
  // Co-op: the group meter as one slim row across the stage (the bubble names the round and the
  // psychic), so the dial keeps its height and nothing floats over the clue.
  return (
    <div className={styles.coopRow}>
      {view.coop ? <CoopMeter total={view.coop.total} max={view.coop.max} slim /> : null}
    </div>
  );
}
