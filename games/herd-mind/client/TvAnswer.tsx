// TV answer: the question at h1, the eight tiles dealt in (tiles aren't secret), who holds the
// Black Sheep, and how many have locked in. The reader says the question as the tiles land.
import type { CSSProperties, JSX } from 'react';
import { Avatar, BigText, useT } from '@partybox/game-sdk/ui';
import type { PushedView } from '@partybox/game-sdk/ui';
import type { HerdTvView } from '../server/views';
import { useLines, useStageBeats } from './beats';
import { kicker } from './labels';
import { SheepCoin } from './SheepCoin';
import { STRINGS } from './strings';
import styles from './Tv.module.css';

/** The voice starts once the tiles have dealt, so the room reads and hears together. */
const QUESTION_VOICE_MS = 450;

export function TvAnswer({ view }: { view: PushedView<HerdTvView> }): JSX.Element {
  const L = useT(STRINGS);
  const beat = useStageBeats([0, QUESTION_VOICE_MS], view.paused);
  useLines(view.lines, { question: 1 }, beat);
  const holder = view.players.find((p) => p.id === view.sheep);
  // Connected players still in the game (gone-for-good players read as 'waiting').
  const pool = view.players.filter((p) => p.connected && p.status !== 'waiting');
  const locked = pool.filter((p) => p.status === 'submitted').length;
  const total = pool.length;
  return (
    <div className={`${styles.page} ${view.paused ? styles.paused : ''}`}>
      <div className={styles.header}>
        <span className={styles.kicker}>{kicker(view.n, view.total, view.target, L)}</span>
        {holder ? (
          <span className={styles.holder}>
            <SheepCoin size="sm" />
            <Avatar avatarId={holder.avatarId} size={40} />
            {L('{name} has the Black Sheep', { name: holder.name })}
          </span>
        ) : null}
      </div>
      <div className={styles.ask}>
        <BigText level="h1" className={styles.prompt}>
          <span lang="en">{view.prompt}</span>
        </BigText>
        {view.tiles ? (
          <ul className={styles.tiles} aria-label={L('answers')}>
            {view.tiles.map((t, i) => (
              <li key={t.id} className={styles.tile} style={{ '--i': i } as CSSProperties}>
                <span className={styles.tileText} lang="en">
                  {t.label}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.typeCard}>
            <span aria-hidden>⌨️</span>
            {L('Type what you think most people will say.')}
          </div>
        )}
      </div>
      <p className={styles.count} aria-live="polite">
        <span key={locked} className={styles.countNum}>
          {L('{locked} / {total} locked in', { locked, total })}
        </span>
        {locked < total ? (
          <span className={styles.onPhone}> · {L('Answer on your phone')}</span>
        ) : null}
      </p>
    </div>
  );
}
