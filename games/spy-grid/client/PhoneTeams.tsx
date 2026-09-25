// The phone during `teams` (SPEC §9.6): Join Sun / Join Moon, "I'll be spymaster", and for the VIP
// Shuffle and Start. In co-op only the spymaster toggle.
import type { JSX } from 'react';
import { PrimaryButton, Screen, buzz, useT } from '@partybox/game-sdk/ui';
import type { SpyControllerView } from '../server/views';
import type { Input } from '../server/types';
import { Coach } from './Coach';
import { keepEmoji, SHAPE } from './model';
import styles from './Controller.module.css';
import { STRINGS } from './strings';

export function PhoneTeams({
  view,
  send,
  skip,
}: {
  view: SpyControllerView;
  send: (input: Input) => void;
  skip?: () => void;
}): JSX.Element {
  const L = useT(STRINGS);
  const me = view.me.id;
  const volunteering = view.volunteers.includes(me);
  const coop = view.mode === 'coop';
  return (
    <Screen
      className={styles.screen}
      title={coop ? L('Your crew') : L('Pick your team')}
      footer={
        skip ? (
          <div className={styles.row}>
            {coop ? null : (
              <button
                type="button"
                className={styles.button}
                onClick={() => send({ type: 'shuffle' })}
              >
                {keepEmoji(L('Shuffle 🔀'))}
              </button>
            )}
            <PrimaryButton onClick={skip}>{L('Start')}</PrimaryButton>
          </div>
        ) : undefined
      }
    >
      <div className={styles.stack}>
        <Coach view={view} />
        {coop ? (
          <p className={styles.hint}>
            {L('One spymaster gives the clues; everyone else guesses together.')}
          </p>
        ) : (
          <div className={styles.joins}>
            {(['sun', 'moon'] as const).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={view.team === t}
                className={`${styles.join} ${styles[`join-${t}`]} ${view.team === t ? styles.joinOn : ''}`}
                onClick={() => {
                  buzz(12);
                  send({ type: 'join', team: t });
                }}
              >
                <span className={styles.joinName}>
                  <span className={styles[`shape-${t}`]}>{SHAPE[t]}</span>{' '}
                  {t === 'sun' ? L('Sun') : L('Moon')}
                </span>
                <span className={styles.joinCount}>
                  {view.team === t
                    ? L("✓ You're in · {n} players", { n: view.teams[t].length })
                    : L('Join · {n} players', { n: view.teams[t].length })}
                </span>
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          role="switch"
          aria-checked={volunteering}
          className={styles.toggle}
          onClick={() => {
            buzz(12);
            send({ type: 'volunteer', on: !volunteering });
          }}
        >
          <span>{L("🕶️ I'll be spymaster")}</span>
          <span className={`${styles.switch} ${volunteering ? styles.switchOn : ''}`} />
        </button>
        <p className={styles.hint}>
          {coop
            ? L('The spymaster sees the key and gives one-word clues.')
            : L('Spymasters see the key and give one-word clues. Everyone else points.')}
        </p>
        {skip ? null : (
          <p className={styles.hint}>{L('The host starts when everyone is ready.')}</p>
        )}
      </div>
    </Screen>
  );
}
