// The stage chrome: brand + room code on the left, join URL + QR on the right (large in the
// lobby, small during play), connection state and toasts. Overscan-safe padding is on the Stage.
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
  children: ReactNode;
}

export function TvFrame({ room, connected, toasts, compact, children }: TvFrameProps): JSX.Element {
  const info = useServerInfo();
  return (
    <div className={styles.frame} data-surface="tv">
      <header className={`${styles.header} ${compact ? styles.compact : ''}`}>
        <div className={styles.brandBlock}>
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
            {compact ? (
              <span
                className={styles.qr}
                dangerouslySetInnerHTML={{ __html: info.qrSvg }}
                aria-label={`QR code for ${info.joinUrl}`}
                role="img"
              />
            ) : null}
          </div>
        ) : null}
      </header>
      <main className={styles.main}>{children}</main>
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
