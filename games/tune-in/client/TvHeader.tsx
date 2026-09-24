// The round's header on the TV: teams get the TeamBanner (both scores racing to the target, the
// active side glowing, CATCH-UP! on a bonus turn); solo and co-op get the round line, the psychic,
// and co-op's group meter with its four rating bands.
import type { CSSProperties, JSX } from 'react';
import { Avatar, useT } from '@partybox/game-sdk/ui';
import { TeamBanner } from '@partybox/game-sdk/ui/team-banner';
import type { TuneTvView } from '../server/index';
import { avatarOf, nameOf, roundLine } from './copy';
import { STRINGS } from './strings';
import styles from './tv.module.css';

/** The rating bands' starts as shares of the maximum (spec §5.7). */
const BANDS = [
  { at: 0, glyph: '📺' },
  { at: 35, glyph: '📻' },
  { at: 55, glyph: '📡' },
  { at: 75, glyph: '🧠' },
];

export function CoopMeter({ total, max }: { total: number; max: number }): JSX.Element {
  const L = useT(STRINGS);
  const share = max > 0 ? Math.min(1, total / max) : 0;
  return (
    <div className={styles.meter} style={{ '--fill': share } as CSSProperties}>
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
  return (
    <div className={styles.header}>
      <span className={styles.kicker}>
        {roundLine(L, turn)}
        {turn.psychic ? (
          <>
            {' · '}
            <Avatar avatarId={avatarOf(view.players, turn.psychic)} size={40} />{' '}
            {L('{name} is the psychic', { name: nameOf(view.players, turn.psychic) })}
          </>
        ) : null}
      </span>
      {view.coop ? <CoopMeter total={view.coop.total} max={view.coop.max} /> : null}
    </div>
  );
}
