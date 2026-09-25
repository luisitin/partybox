// The VIP's "Where is everyone?" (game pack Part 00 §3.2, ADR-047), beside Phone only in the ★
// menu: three answers, one tap each, never mid-game (a running game keeps what it started with).
import type { JSX } from 'react';
import { PRESENCE_MODES } from '@partybox/shared';
import type { PresenceMode, RoomSnapshot } from '@partybox/shared';
import { t } from '../i18n';
import type { Controller } from '../net/controller';
import styles from './PresenceSwitch.module.css';

export function PresenceSwitch({
  room,
  controller,
  disabled,
}: {
  room: RoomSnapshot;
  controller: Controller;
  disabled: boolean;
}): JSX.Element {
  const mode: PresenceMode = room.presenceMode ?? 'together';
  return (
    <div className={`${styles.presence} ${disabled ? styles.off : ''}`}>
      <span className={styles.title} id="vip-presence">
        {t.presence.title}
        <small>{t.presence.hints[mode]}</small>
      </span>
      <div className={styles.options} role="radiogroup" aria-labelledby="vip-presence">
        {PRESENCE_MODES.map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={m === mode}
            className={styles.option}
            disabled={disabled}
            onClick={() => controller.vip({ action: 'setPresenceMode', mode: m })}
          >
            {m === mode ? '✓ ' : ''}
            {t.presence.modes[m]}
          </button>
        ))}
      </div>
    </div>
  );
}
