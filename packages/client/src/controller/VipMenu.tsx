// VIP sheet: game controls while playing (skip / pause or resume / end), room lock, and per-player
// kick / transfer. Destructive actions ask once (tap again within 4 s) so a pocket-tap can't end a
// game; the confirm state is loud (danger tone + "Confirm …"). Close is a ✕ in the sticky header.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import type { PlayerPublic, RoomSnapshot } from '@partybox/shared';
import { Avatar, PrimaryButton, getLang } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import { serverText } from '../server-text';
import { setTipsSeen } from './vipTips';
import { useServerInfo } from '../net/info';
import type { Controller } from '../net/controller';
import styles from './VipMenu.module.css';

export interface VipMenuProps {
  controller: Controller;
  room: RoomSnapshot;
  me: PlayerPublic;
  /** Current game paused state (from the pushed view), for the Pause/Resume toggle. */
  paused?: boolean;
  /** I-774 B: the game's words for Skip / Next in this phase. */
  skipLabel?: string;
  onClose: () => void;
}

const CONFIRM_MS = 4000;

/** The pushed view's part of the menu: pause state and (I-774 B) the game's words for Skip / Next,
 *  translated through the game's strings. */
export function vipMenuState(
  view: { paused?: boolean; vipSkipLabel?: string; gameId?: string } | null,
): Pick<VipMenuProps, 'paused' | 'skipLabel'> {
  return {
    paused: view?.paused ?? false,
    skipLabel: view?.vipSkipLabel
      ? serverText(view.vipSkipLabel, getLang(), view.gameId)
      : undefined,
  };
}

export function VipMenu({
  controller,
  room,
  me,
  paused,
  skipLabel,
  onClose,
}: VipMenuProps): JSX.Element {
  const [confirm, setConfirm] = useState<string | null>(null);
  useEffect(() => {
    if (confirm === null) return;
    const handle = setTimeout(() => setConfirm(null), CONFIRM_MS);
    return () => clearTimeout(handle);
  }, [confirm]);
  const playing = room.status === 'playing';
  const info = useServerInfo(); // I-642 A: the recap link moved here from the picker
  const act = (key: string, run: () => void, dangerous = false): void => {
    if (dangerous && confirm !== key) {
      setConfirm(key);
      return;
    }
    setConfirm(null);
    run();
  };
  const label = (key: string, text: string): string =>
    confirm === key ? t.vip.confirm(text) : text;
  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label={t.vip.menu}
      onClick={onClose}
    >
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <h2 className={styles.title}>{t.vip.menu}</h2>
          {/* I-082 C: bring the tips back for the next host on this phone. */}
          <button
            type="button"
            className={styles.close}
            style={{ marginRight: 8 }}
            onClick={() => setTipsSeen(false)}
            aria-label={t.vip.tipsAgainLabel}
            title={t.vip.tipsAgain}
          >
            💡
          </button>
          <button type="button" className={styles.close} onClick={onClose} aria-label={t.vip.close}>
            ✕
          </button>
        </div>
        {playing ? (
          <section className={styles.section}>
            <h3 className={styles.label}>{t.vip.groupGame}</h3>
            <div className={styles.group}>
              <PrimaryButton
                tone="neutral"
                onClick={() => act('skip', () => controller.vip({ action: 'skip' }))}
              >
                {skipLabel ?? t.vip.skip}
              </PrimaryButton>
              <PrimaryButton
                tone="neutral"
                onClick={() => controller.vip({ action: paused ? 'resume' : 'pause' })}
              >
                {paused ? t.vip.resume : t.vip.pause}
              </PrimaryButton>
              <PrimaryButton
                tone={confirm === 'end' ? 'danger' : 'neutral'}
                className={`${styles.wide} ${confirm === 'end' ? '' : styles.dangerRest}`}
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
          </section>
        ) : null}
        <section className={styles.section}>
          <h3 className={styles.label}>{t.vip.groupRoom}</h3>
          <div className={styles.group}>
            <PrimaryButton
              tone="neutral"
              className={styles.wide}
              onClick={() => controller.vip({ action: room.locked ? 'unlock' : 'lock' })}
            >
              {room.locked ? t.vip.unlock : t.vip.lock}
            </PrimaryButton>
            {/* I-088 A: the room's own size — a stepper; the TV's "X / N" follows. */}
            <div className={styles.sizeRow} role="group" aria-label={t.vip.roomSizeGroup}>
              <span className={styles.sizeLabel}>{t.vip.roomSize}</span>
              <button
                type="button"
                className={styles.sizeBtn}
                aria-label={t.vip.smaller}
                disabled={room.capacity <= Math.max(4, room.players.length)}
                onClick={() =>
                  controller.vip({ action: 'setCapacity', capacity: room.capacity - 1 })
                }
              >
                −
              </button>
              <span className={styles.sizeValue} aria-live="polite">
                {room.players.length} / {room.capacity}
              </span>
              <button
                type="button"
                className={styles.sizeBtn}
                aria-label={t.vip.bigger}
                disabled={room.capacity >= 16}
                onClick={() =>
                  controller.vip({ action: 'setCapacity', capacity: room.capacity + 1 })
                }
              >
                +
              </button>
            </div>
            {/* I-088 C: the recurring-group case — size = head count, and locked. */}
            {!room.locked ? (
              <PrimaryButton
                tone="neutral"
                className={styles.wide}
                onClick={() => {
                  controller.vip({
                    action: 'setCapacity',
                    capacity: Math.max(4, room.players.length),
                  });
                  controller.vip({ action: 'lock' });
                }}
              >
                {t.vip.lockAtSize(room.players.length)}
              </PrimaryButton>
            ) : null}
            {/* The owner (2026-09-22): public rooms show up in the join page's list; a private
                room still joins by code. */}
            <PrimaryButton
              tone="neutral"
              className={styles.wide}
              onClick={() => controller.vip({ action: 'setListed', on: !room.listed })}
            >
              {room.listed ? t.vip.listed : t.vip.unlisted}
            </PrimaryButton>
            {/* I-642 A: the room's switches, set once a night — here with lock and size, not on
                every pick */}
            <RoomSwitch
              id="vip-recording"
              label={t.selecting.recording}
              hint={room.recording ? t.selecting.recordingHint : t.selecting.recordingOff}
              on={room.recording}
              disabled={playing}
              onChange={(on) => controller.vip({ action: 'setRecording', on })}
            />
            <RoomSwitch
              id="vip-music-all"
              label={t.selecting.musicOnPhones}
              hint={
                room.musicOnPhones ? t.selecting.musicOnPhonesHint : t.selecting.musicOnPhonesOff
              }
              on={room.musicOnPhones}
              onChange={(on) => controller.vip({ action: 'setMusicOnPhones', on })}
            />
            <RoomSwitch
              id="vip-phone-only"
              label={t.selecting.phoneOnly}
              hint={room.phoneOnly ? t.selecting.phoneOnlyOn : t.selecting.phoneOnlyOff}
              on={room.phoneOnly}
              disabled={playing}
              onChange={(on) => controller.vip({ action: 'setPhoneOnly', on })}
            />
            {playing ? <p className={styles.switchNote}>{t.roomRow.betweenGames}</p> : null}
            {info?.lastRecap ? (
              <a
                className={`pb-caption ${styles.wide}`}
                href="/api/recaps/latest/page"
                target="_blank"
                rel="noreferrer"
              >
                {t.selecting.lastRecap(info.lastRecap.gameId, info.lastRecap.code)}
              </a>
            ) : null}
          </div>
        </section>
        <section className={`${styles.section} ${styles.sectionPlayers}`}>
          <h3 className={styles.label}>{t.vip.groupPlayers}</h3>
          <ul className={styles.players} aria-label={t.vip.groupPlayers}>
            {room.players
              .filter((p) => p.id !== me.id)
              .map((p) => (
                <li key={p.id} className={styles.player}>
                  <Avatar avatarId={p.avatarId} size={32} dim={!p.connected} />
                  <span className={styles.playerName}>{p.name}</span>
                  <button
                    type="button"
                    className={`${styles.small} ${confirm === `vip:${p.id}` ? styles.confirming : ''}`}
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
                    className={`${styles.small} ${styles.danger} ${confirm === `kick:${p.id}` ? styles.confirming : ''}`}
                    onClick={() =>
                      act(
                        `kick:${p.id}`,
                        () => controller.vip({ action: 'kick', playerId: p.id }),
                        true,
                      )
                    }
                  >
                    <span aria-hidden>✕ </span>
                    {label(`kick:${p.id}`, t.vip.kick)}
                  </button>
                </li>
              ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

/** I-642 A: one room switch — the picker's old row, in the ★ menu's Room section. */
function RoomSwitch({
  id,
  label,
  hint,
  on,
  disabled = false,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  on: boolean;
  disabled?: boolean;
  onChange: (on: boolean) => void;
}): JSX.Element {
  return (
    <label className={`${styles.switchRow} ${disabled ? styles.switchOff : ''}`} htmlFor={id}>
      <span className={styles.switchLabel}>
        {label}
        <small>{hint}</small>
      </span>
      <input
        id={id}
        type="checkbox"
        className={styles.switchBox}
        checked={on}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
