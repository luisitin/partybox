// I-792 E (design review): the lobby's ⋯ — the rare actions out of the way of the roster. Leave
// (one tap to arm, one to go: the ★ menu's confirm shape), the phone's 🎨 setup, and on a guest's
// phone the I-070 A nudge to the VIP ("👋 Hurry up, <VIP>!", one per 20 s from this phone).
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { t } from '../i18n';
import type { Controller } from '../net/controller';
import styles from './Lobby.module.css';

export interface LobbyMoreProps {
  controller: Controller;
  /** The VIP's name on a guest's phone (the nudge row); null on the VIP's own phone. */
  nudgeName: string | null;
  onSetup?: () => void;
}

export function LobbyMore({ controller, nudgeName, onSetup }: LobbyMoreProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [nudgedAt, setNudgedAt] = useState<number | null>(null);
  useEffect(() => {
    if (!leaving) return undefined;
    const h = setTimeout(() => setLeaving(false), 3000);
    return () => clearTimeout(h);
  }, [leaving]);
  useEffect(() => {
    if (nudgedAt === null) return undefined;
    const h = setTimeout(() => setNudgedAt(null), 20_000);
    return () => clearTimeout(h);
  }, [nudgedAt]);
  const close = (): void => {
    setOpen(false);
    setLeaving(false);
  };
  return (
    <span className={styles.moreWrap}>
      <button
        type="button"
        className={styles.morePill}
        aria-label={t.lobbyTop.more}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        ⋯
      </button>
      {open ? (
        <>
          <span className={styles.moreBack} onClick={close} aria-hidden />
          <span
            className={styles.moreMenu}
            role="menu"
            onKeyDown={(e) => (e.key === 'Escape' ? close() : undefined)}
          >
            {nudgeName ? (
              <button
                type="button"
                role="menuitem"
                className={styles.moreItem}
                disabled={nudgedAt !== null}
                onClick={() => {
                  controller.nudge();
                  setNudgedAt(Date.now());
                  close();
                }}
              >
                {nudgedAt !== null ? t.lobby.nudged : t.lobby.nudge(nudgeName)}
              </button>
            ) : null}
            <button
              type="button"
              role="menuitem"
              className={styles.moreItem}
              onClick={() => {
                close();
                onSetup?.();
              }}
            >
              {t.lobby.setup}
            </button>
            <button
              type="button"
              role="menuitem"
              className={`${styles.moreItem} ${leaving ? styles.moreLeave : ''}`}
              onClick={() => {
                if (leaving) controller.leave();
                else setLeaving(true);
              }}
            >
              {leaving ? t.lobby.leaveConfirm : t.lobby.leave}
            </button>
          </span>
        </>
      ) : null}
    </span>
  );
}
