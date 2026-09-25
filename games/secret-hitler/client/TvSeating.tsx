// The TV while everyone reads their dossier (seating). The shell's start stage (ADR-053) has already
// shown the rules and counted 3 · 2 · 1, so this is no second rules page and no second READY: the
// front page announces the new parliament, and a line counts the dossiers read (each seat gets a ✓
// in the seat row). Round 1 begins when every connected seat has read theirs.
import type { JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { ShTvView } from '../server/views';
import { Newspaper } from './Newspaper';
import { STRINGS } from './strings';
import styles from './seating.module.css';

export function TvSeating({ view }: { view: ShTvView }): JSX.Element {
  const L = useT(STRINGS);
  const here = view.seats.filter((s) => !s.tags.includes('exiled'));
  const read = here.filter((s) => s.tags.includes('ready')).length;
  return (
    <div className={styles.seating}>
      <div className={styles.paper}>
        <Newspaper headline={L('A new parliament')} session={0} kicker={L('Special edition')} />
      </div>
      <p className={styles.reading} data-all={read === here.length || undefined}>
        <span className={styles.readCount}>
          {L('{read} of {total} have read their dossier', { read, total: here.length })}
        </span>
        <span className={styles.readHint}>{L('Round 1 begins when everyone has read theirs')}</span>
      </p>
    </div>
  );
}
