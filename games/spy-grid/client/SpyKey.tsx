// The spymaster's key (SPEC §9.5): hidden behind "Show key 👁" (a SecretCard-style cover, tap to
// toggle) and hidden again 20 s after the last touch; a grouped list by default — your agents,
// theirs, bystanders, the assassin — with flipped words struck through and the team's live
// pointers marked; a Grid view toggle shows the coloured 5×5 instead.
// SecretCard is Imposter's SDK piece: this cover is a local stand-in until it ships (NOTES.md).
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { useSound, useT } from '@partybox/game-sdk/ui';
import type { SpyControllerView } from '../server/views';
import { SHAPE, other } from './model';
import { PhoneBoard } from './PhoneParts';
import styles from './Controller.module.css';
import { STRINGS } from './strings';

const HIDE_MS = 20_000;

function useCover(): [boolean, (on: boolean) => void, () => void] {
  const [shown, setShown] = useState(false);
  const [touched, setTouched] = useState(0);
  useEffect(() => {
    if (!shown) return undefined;
    const t = setTimeout(() => setShown(false), HIDE_MS);
    return () => clearTimeout(t);
  }, [shown, touched]);
  return [shown, setShown, () => setTouched((n) => n + 1)];
}

export function SpyKey({ view }: { view: SpyControllerView }): JSX.Element {
  const L = useT(STRINGS);
  const play = useSound();
  // The spymaster's first move: the cover breathes while it's their clue to give.
  const urgent = view.phaseId === 'clue' && view.team === view.turnTeam;
  const [shown, setShown, touch] = useCover();
  const [grid, setGrid] = useState(true);
  // Covered, the spymaster still watches the public board under the button: the screen is never a
  // big empty space while the other team plays (session-c #13).
  if (!shown)
    return (
      <div className={styles.coveredKey}>
        <button
          type="button"
          className={`${styles.cover} ${urgent ? styles.breathe : ''}`}
          onClick={() => {
            play('card', { quiet: true, gain: 0.6 });
            setShown(true);
          }}
        >
          <span className={styles.coverTitle}>{L('Show key 👁')}</span>
          <span className={styles.hint}>{L('Tilt your phone away from your team.')}</span>
        </button>
        <PhoneBoard view={view} />
      </div>
    );
  const key = view.key ?? [];
  const mine = view.team ?? 'sun';
  const pointed = new Set(
    Object.values(view.pointers).filter((p): p is number => typeof p === 'number'),
  );
  const group = (kind: string): { word: string; gone: boolean; pointed: boolean }[] =>
    key
      .map((k, i) => ({ k, i }))
      .filter((x) => x.k === kind)
      .map(({ i }) => ({
        word: view.words[i] ?? '',
        gone: view.kinds[i] !== null,
        pointed: pointed.has(i),
      }));
  const rows: { head: string; items: ReturnType<typeof group> }[] = [
    {
      head: `${SHAPE[mine]} ${L('Your agents ({n} left)', { n: group(mine).filter((x) => !x.gone).length })}`,
      items: group(mine),
    },
    ...(view.mode === 'coop'
      ? []
      : [
          {
            head: `${SHAPE[other(mine)]} ${L('Their agents ({n} left)', { n: group(other(mine)).filter((x) => !x.gone).length })}`,
            items: group(other(mine)),
          },
        ]),
    { head: `🚶 ${L('Bystanders')}`, items: group('bystander') },
    { head: `💀 ${L('Assassin')}`, items: group('assassin') },
  ];
  return (
    <div className={styles.keyCard} onPointerDown={touch}>
      <div className={styles.keyHead}>
        <span className={styles.keyTitle}>{L('The key')}</span>
        <span className={styles.row}>
          <button type="button" className={styles.small} onClick={() => setGrid((g) => !g)}>
            {grid ? L('List view') : L('Grid view')}
          </button>
          <button type="button" className={styles.small} onClick={() => setShown(false)}>
            {L('Hide')}
          </button>
        </span>
      </div>
      {grid ? (
        <PhoneBoard view={view} withKey />
      ) : (
        rows.map((r) => (
          <div key={r.head} className={styles.group}>
            <div className={styles.groupHead}>{r.head}</div>
            <div className={styles.words}>
              {r.items.map((x, n) => (
                <span key={x.word}>
                  {n > 0 ? ' · ' : ''}
                  <span
                    className={`${x.gone ? styles.gone : ''} ${x.pointed ? styles.pointed : ''}`}
                  >
                    {x.word}
                  </span>
                </span>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
