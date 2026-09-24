// The VIP's merge tool (typed mode, during `herd`): every group with its label, count and what
// people actually typed. Tap two groups, then Merge ("coke" + "cola"); a merged group carries a
// tag and Undo. Score it (sticky) ends the phase — the engine's VIP skip, so only the VIP's phone
// ever renders this, and the server takes merges only with the VIP stamp.
import { useState } from 'react';
import type { JSX } from 'react';
import { buzz, DeadlineBar, PrimaryButton, Screen, useT } from '@partybox/game-sdk/ui';
import type { PushedView } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { GroupView, HerdControllerView } from '../server/views';
import { SettingsPill } from './Settings';
import { STRINGS } from './strings';
import styles from './Controller.module.css';

/** The last merge that built this group (what its Undo takes back). */
function lastMerge(g: GroupView, merges: [string, string][]): [string, string] | null {
  const keys = [g.key, ...g.merged];
  for (let i = merges.length - 1; i >= 0; i--) {
    const m = merges[i];
    if (m && keys.includes(m[0]) && keys.includes(m[1])) return m;
  }
  return null;
}

export function MergeTool({
  view,
  send,
  skip,
}: {
  view: PushedView<HerdControllerView>;
  send: (input: Input) => void;
  skip: () => void;
}): JSX.Element {
  const L = useT(STRINGS);
  const [picked, setPicked] = useState<string[]>([]);
  const groups = view.groups ?? [];
  // Keys that no longer exist (merged away) drop out of the selection.
  const live = picked.filter((k) => groups.some((g) => g.key === k));
  const toggle = (key: string): void => {
    buzz(15);
    setPicked((p) => {
      const now = p.filter((k) => groups.some((g) => g.key === k));
      if (now.includes(key)) return now.filter((k) => k !== key);
      return [...now, key].slice(-2);
    });
  };
  const merge = (): void => {
    const [a, b] = live;
    if (!a || !b) return;
    send({ type: 'merge', a, b });
    setPicked([]);
  };
  const name = (id: string): string => view.players.find((p) => p.id === id)?.name ?? '?';
  return (
    <Screen
      footer={
        <div className={styles.mergeBar}>
          {/* When the groups score themselves if nobody taps Score it (20 s). */}
          <DeadlineBar
            deadline={view.deadline}
            phaseKey={`herd:${view.n}`}
            paused={view.paused}
            className={styles.mergeClock}
          />
          <PrimaryButton tone="neutral" disabled={live.length < 2} onClick={merge}>
            {L('Merge')}
          </PrimaryButton>
          <PrimaryButton onClick={skip}>{L('Score it')}</PrimaryButton>
        </div>
      }
    >
      <div className={styles.kickerRow}>
        <p className={styles.kicker}>{L('Same answer, different words? Tap two, then Merge.')}</p>
        <SettingsPill />
      </div>
      <ul className={styles.mergeList}>
        {groups.map((g) => {
          const on = live.includes(g.key);
          const undo = lastMerge(g, view.merges);
          return (
            <li key={g.key} className={styles.mergeRow}>
              <button
                type="button"
                className={`${styles.mergeGroup} ${on ? styles.mergeOn : ''}`}
                aria-pressed={on}
                onClick={() => toggle(g.key)}
              >
                <span className={styles.groupLabel}>
                  {on ? '✓ ' : ''}
                  {g.label}
                </span>
                <span className={styles.groupCount}>{g.members.length}</span>
                <span className={styles.groupNames}>
                  {g.members.map((id) => `${name(id)}: “${g.raw?.[id] ?? ''}”`).join(' · ')}
                </span>
              </button>
              {g.merged.length > 0 ? (
                <span className={styles.mergedTag}>
                  {L('merged')}
                  {undo ? (
                    <button
                      type="button"
                      className={styles.undo}
                      onClick={() => send({ type: 'unmerge', a: undo[0], b: undo[1] })}
                    >
                      {L('Undo')}
                    </button>
                  ) : null}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </Screen>
  );
}
