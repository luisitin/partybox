// VIP sheet: game controls while playing (skip / pause / resume / end), room lock, and per-player
// kick / transfer. Destructive actions ask once (tap again) so a pocket-tap can't end a game.
import { useState } from 'react';
import type { JSX } from 'react';
import type { PlayerPublic, RoomSnapshot } from '@partybox/shared';
import { Avatar, PrimaryButton } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import type { Controller } from '../net/controller';
import styles from './VipMenu.module.css';

export interface VipMenuProps {
  controller: Controller;
  room: RoomSnapshot;
  me: PlayerPublic;
  onClose: () => void;
}

export function VipMenu({ controller, room, me, onClose }: VipMenuProps): JSX.Element {
  const [confirm, setConfirm] = useState<string | null>(null);
  const playing = room.status === 'playing';
  const act = (key: string, run: () => void, dangerous = false): void => {
    if (dangerous && confirm !== key) {
      setConfirm(key);
      return;
    }
    setConfirm(null);
    run();
  };
  const label = (key: string, text: string): string => (confirm === key ? `${text}?` : text);
  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label={t.vip.menu}
      onClick={onClose}
    >
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{t.vip.menu}</h2>
        {playing ? (
          <div className={styles.group}>
            <PrimaryButton
              tone="neutral"
              onClick={() => act('skip', () => controller.vip({ action: 'skip' }))}
            >
              {t.vip.skip}
            </PrimaryButton>
            <PrimaryButton
              tone="neutral"
              onClick={() => act('pause', () => controller.vip({ action: 'pause' }))}
            >
              {t.vip.pause}
            </PrimaryButton>
            <PrimaryButton
              tone="neutral"
              onClick={() => act('resume', () => controller.vip({ action: 'resume' }))}
            >
              {t.vip.resume}
            </PrimaryButton>
            <PrimaryButton
              tone="danger"
              onClick={() =>
                act(
                  'end',
                  () => {
                    controller.vip({ action: 'end' });
                    onClose();
                  },
                  true,
                )
              }
            >
              {label('end', t.vip.end)}
            </PrimaryButton>
          </div>
        ) : null}
        <div className={styles.group}>
          <PrimaryButton
            tone="neutral"
            onClick={() => controller.vip({ action: room.locked ? 'unlock' : 'lock' })}
          >
            {room.locked ? t.vip.unlock : t.vip.lock}
          </PrimaryButton>
        </div>
        <ul className={styles.players} aria-label="players">
          {room.players
            .filter((p) => p.id !== me.id)
            .map((p) => (
              <li key={p.id} className={styles.player}>
                <Avatar avatarId={p.avatarId} size={32} dim={!p.connected} />
                <span className={styles.playerName}>{p.name}</span>
                <button
                  type="button"
                  className={styles.small}
                  onClick={() =>
                    act(
                      `vip:${p.id}`,
                      () => controller.vip({ action: 'transferVip', playerId: p.id }),
                      true,
                    )
                  }
                >
                  {label(`vip:${p.id}`, t.vip.transfer)}
                </button>
                <button
                  type="button"
                  className={`${styles.small} ${styles.danger}`}
                  onClick={() =>
                    act(
                      `kick:${p.id}`,
                      () => controller.vip({ action: 'kick', playerId: p.id }),
                      true,
                    )
                  }
                >
                  {label(`kick:${p.id}`, t.vip.kick)}
                </button>
              </li>
            ))}
        </ul>
        <PrimaryButton onClick={onClose}>{t.vip.close}</PrimaryButton>
      </div>
    </div>
  );
}
