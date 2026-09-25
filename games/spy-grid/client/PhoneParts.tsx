// Small pieces every phone screen shares: the agents-left line, the clue line, and the board in
// the phone's chosen layout (grid at 380 px and wider, list below or at large text; the 🎨 sheet
// can force either).
import type { JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { SpyControllerView } from '../server/views';
import { SHAPE, cardsOf, coordLabel, useBoardLayout } from './model';
import { WordGrid } from '@partybox/game-sdk/ui/word-grid';
import styles from './Controller.module.css';
import { STRINGS } from './strings';

export function Scores({ view }: { view: SpyControllerView }): JSX.Element {
  const L = useT(STRINGS);
  const teams = view.mode === 'coop' ? (['sun'] as const) : (['sun', 'moon'] as const);
  return (
    <div className={styles.scores}>
      {teams.map((t) => (
        <span
          key={t}
          className={`${styles.score} ${styles[`score-${t}`]} ${view.turnTeam === t ? styles.scoreOn : ''}`}
        >
          <span className={styles.nowrap}>
            <span className={styles[`shape-${t}`]}>{SHAPE[t]}</span>{' '}
            {view.mode === 'coop'
              ? L('{n} agents left', { n: view.left[t] })
              : L('{n} left', { n: view.left[t] })}
            {/* your team: a mark that never wraps onto its own line (session-c #9, #10) */}
            {view.team === t ? (
              <span aria-label={L('your team')} role="img">
                {' '}
                👤
              </span>
            ) : null}
          </span>
        </span>
      ))}
      {view.cluesLeft !== null ? (
        <span className={`${styles.score} ${styles.scoreOn}`}>
          {L('{n} clues left', { n: view.cluesLeft })}
        </span>
      ) : null}
    </div>
  );
}

export function ClueLine({
  view,
  rule,
}: {
  view: SpyControllerView;
  rule?: boolean;
}): JSX.Element | null {
  const L = useT(STRINGS);
  if (!view.clue) return null;
  return (
    <div className={styles.clue}>
      <span className={`${styles.clueWord} ${styles[`shape-${view.turnTeam}`]}`}>
        {SHAPE[view.turnTeam]}
      </span>
      <span className={styles.clueWord}>{view.clue.word}</span>
      <span className={styles.clueNum}>· {view.clue.number}</span>
      <span className={styles.clueMeta}>
        {L('{n} guesses left', { n: view.guessesLeft })}
        {rule ? ` · ${L('A card flips when most of your team points at it.')}` : ''}
      </span>
    </div>
  );
}

export function PhoneBoard({
  view,
  onTap,
  onLongPress,
  withKey,
  focus = null,
  pending = null,
}: {
  view: SpyControllerView;
  onTap?: (i: number) => void;
  onLongPress?: (i: number) => void;
  withKey?: boolean;
  focus?: number | null;
  /** A card waiting on the Point confirm bar: ringed as if pointed. */
  pending?: number | null;
}): JSX.Element {
  const L = useT(STRINGS);
  const layout = useBoardLayout();
  return (
    <WordGrid
      surface="phone"
      layout={layout}
      cards={cardsOf(view, { me: view.me.id, key: withKey ? view.key : null }).map((c, i) =>
        i === pending ? { ...c, mine: true, ring: view.turnTeam } : c,
      )}
      onTap={onTap}
      onLongPress={onLongPress}
      focus={focus}
      label={(i) => coordLabel(view, i, L)}
    />
  );
}
