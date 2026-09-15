// Phone frame: header (room code, me, connection, VIP badge + menu), calm reconnect banner,
// toasts and the error strip. Everything below the header is the current screen.
import { useState } from 'react';
import type { JSX, ReactNode } from 'react';
import type { PlayerPublic } from '@partybox/shared';
import { Avatar } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import type { Controller, ControllerState } from '../net/controller';
import styles from './ControllerShell.module.css';
import { VipMenu } from './VipMenu';

export interface ControllerShellProps {
  controller: Controller;
  state: ControllerState;
  me: PlayerPublic | null;
  children: ReactNode;
}

export function ControllerShell({
  controller,
  state,
  me,
  children,
}: ControllerShellProps): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);
  const room = state.room;
  const showBanner = state.connection !== 'connected' && state.joined;
  return (
    <div className={styles.shell} data-surface="controller">
      <header className={styles.header}>
        <div className={styles.left}>
          <span className={styles.brand}>{t.appName}</span>
          {room ? (
            <span className={styles.code} aria-label={`${t.lobby.room} ${room.code}`}>
              {room.code}
            </span>
          ) : null}
        </div>
        <div className={styles.right}>
          <span
            className={`${styles.dot} ${state.connection === 'connected' ? styles.on : styles.off}`}
            role="status"
            aria-label={state.connection}
          />
          {me ? (
            <>
              {me.isVip ? (
                <button
                  type="button"
                  className={styles.vipBadge}
                  onClick={() => setMenuOpen(true)}
                  aria-haspopup="dialog"
                >
                  ★ {t.vip.badge}
                </button>
              ) : null}
              <span className={styles.me}>
                <Avatar avatarId={me.avatarId} size={32} />
                <span className={styles.meName}>{me.name}</span>
              </span>
            </>
          ) : null}
        </div>
      </header>
      {showBanner ? (
        <div className={styles.banner} role="status">
          {t.connection.reconnecting}
        </div>
      ) : null}
      {state.error ? (
        <button type="button" className={styles.error} onClick={controller.dismissError}>
          {state.error.message}
        </button>
      ) : null}
      <main className={styles.main}>{children}</main>
      <div className={styles.toasts} aria-live="polite">
        {state.toasts.map((toast) => (
          <button
            key={toast.id}
            type="button"
            className={`${styles.toast} ${styles[toast.kind]}`}
            onClick={() => controller.dismissToast(toast.id)}
          >
            {toast.text}
          </button>
        ))}
      </div>
      {menuOpen && room && me?.isVip ? (
        <VipMenu controller={controller} room={room} me={me} onClose={() => setMenuOpen(false)} />
      ) : null}
    </div>
  );
}
