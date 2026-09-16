// The stage chrome: brand + room code on the left, the join URL on the right (the lobby shows the
// big QR; during play a 120 px QR only crowded the timer), connection state and toasts.
// Overscan-safe padding is on the Stage.
import { useEffect, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import type { RoomSnapshot } from '@partybox/shared';
import { t } from '../i18n';
import { useServerInfo } from '../net/info';
import type { Toast } from '../net/store';
import styles from './TvFrame.module.css';

export interface TvFrameProps {
  room: RoomSnapshot | null;
  connected: boolean;
  toasts: Toast[];
  compact: boolean;
  /** Top-left corner: the host's ⌂ button (ADR-031). */
  corner?: ReactNode;
  /** Bottom row, in the flow (never over the stage): the host toolbar (ADR-031). */
  footer?: ReactNode;
  children: ReactNode;
}

export function TvFrame({
  room,
  connected,
  toasts,
  compact,
  corner,
  footer,
  children,
}: TvFrameProps): JSX.Element {
  const info = useServerInfo();
  // A blip stays a header caption; after 3 s the whole stage says so (a lit lobby + QR would keep
  // inviting people to scan a dead server).
  const [lostAt, setLostAt] = useState(false);
  useEffect(() => {
    if (connected) return;
    const handle = setTimeout(() => setLostAt(true), 3000);
    return () => clearTimeout(handle);
  }, [connected]);
  const lost = lostAt && !connected;
  if (lostAt && connected) setLostAt(false);
  return (
    <div className={`${styles.frame} ${lost ? styles.lost : ''}`} data-surface="tv">
      <header className={`${styles.header} ${compact ? styles.compact : ''}`}>
        <div className={styles.brandBlock}>
          {corner}
          <span className={styles.brand}>{t.appName}</span>
          {room ? (
            <span className={styles.code}>
              <span className={styles.codeLabel}>{t.lobby.room}</span> {room.code}
              {room.locked ? <span className={styles.lock}> 🔒</span> : null}
            </span>
          ) : null}
          {!connected ? <span className={styles.offline}>{t.connection.connecting}</span> : null}
        </div>
        {info ? (
          <div className={styles.joinBlock}>
            <span className={styles.url}>
              {info.joinUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </span>
          </div>
        ) : null}
      </header>
      <main className={styles.main}>{children}</main>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
      {lost ? (
        <div className={styles.lostBanner} role="status">
          {t.connection.lostServer}
        </div>
      ) : null}
      <div className={styles.toasts} aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={styles.toast}>
            {toast.text}
          </div>
        ))}
      </div>
    </div>
  );
}
