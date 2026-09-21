// The stage chrome: 🏠 + brand (Home: click twice to start over) + room code on the left, the join
// URL on the right (the lobby shows the big QR; during play a 120 px QR only crowded the timer),
// connection state and toasts. Overscan-safe padding is on the Stage.
import { useEffect, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import type { RoomSnapshot } from '@partybox/shared';
import { Avatar } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import { useServerInfo } from '../net/info';
import type { Toast } from '../net/store';
import type { HomeResult } from '../net/tv';
import styles from './TvFrame.module.css';

export interface TvFrameProps {
  room: RoomSnapshot | null;
  connected: boolean;
  toasts: Toast[];
  compact: boolean;
  /** 🏠: back to the lobby from a game, start over from the lobby. Absent in previews. */
  onHome?: () => Promise<HomeResult>;
  /** Bottom row, in the flow (never over the stage): the host toolbar (ADR-031). */
  footer?: ReactNode;
  children: ReactNode;
}

/** A misclick on the TV must not end the party: the first click arms, the second acts. */
const HOME_ARM_MS = 4000;

type HomeState = { kind: 'idle' } | { kind: 'armed' } | { kind: 'note'; text: string };

export function TvFrame({
  room,
  connected,
  toasts,
  compact,
  onHome,
  footer,
  children,
}: TvFrameProps): JSX.Element {
  const info = useServerInfo();
  const [home, setHome] = useState<HomeState>({ kind: 'idle' });
  useEffect(() => {
    if (home.kind === 'idle') return;
    const handle = setTimeout(() => setHome({ kind: 'idle' }), HOME_ARM_MS);
    return () => clearTimeout(handle);
  }, [home]);
  const clickHome = (): void => {
    if (!onHome) return;
    if (home.kind !== 'armed') {
      setHome({ kind: 'armed' });
      return;
    }
    setHome({ kind: 'idle' });
    void onHome().then((result) => {
      if (result === 'off') setHome({ kind: 'note', text: t.tv.homeOff });
      else if (result === 'error') setHome({ kind: 'note', text: t.tv.homeFailed });
    });
  };
  const inLobby = room === null || room.status === 'lobby';
  const brandText =
    home.kind === 'armed'
      ? inLobby
        ? t.tv.homeConfirmReset
        : t.tv.homeConfirm
      : home.kind === 'note'
        ? home.text
        : t.appName;
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
          {onHome ? (
            <button
              type="button"
              className={`${styles.home} ${home.kind === 'armed' ? styles.homeArmed : ''} ${home.kind === 'note' ? styles.homeNote : ''}`}
              onClick={clickHome}
              aria-label={t.tv.home}
              title={t.tv.homeTitle}
            >
              <span className={styles.homeGlyph} aria-hidden>
                🏠
              </span>
              <span className={styles.brand} aria-live="polite">
                {brandText}
              </span>
            </button>
          ) : (
            <span className={styles.brand}>{t.appName}</span>
          )}
          {room ? (
            <span className={`${styles.badge} ${styles.badgeBump}`} key={room.players.length}>
              <small>{t.lobby.room}</small>
              {room.code}
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
        {toasts.map((toast) => {
          // A handover changes who runs the room: the toast carries the face (review-loop #5).
          const handover = /^(.+) is now the VIP$/.exec(toast.text);
          const who = handover ? room?.players.find((p) => p.name === handover[1]) : undefined;
          return (
            <div key={toast.id} className={`${styles.toast} ${who ? styles.toastVip : ''}`}>
              {who ? <Avatar avatarId={who.avatarId} size={36} /> : null}
              {who ? `👑 ${who.name} is the VIP now` : toast.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}
