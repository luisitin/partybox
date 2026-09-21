// Game selection. VIP: browse game cards, tweak settings from the manifest spec, start (disabled
// with the server's reason). Everyone else: a calm "X is choosing…" with the current pick.
import type { JSX } from 'react';
import type { PlayerPublic, RoomSnapshot } from '@partybox/shared';
import { PrimaryButton, Screen, WaitingScreen } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import { SettingField } from '../SettingField';
import type { Controller } from '../net/controller';
import styles from './Selecting.module.css';

export interface SelectingProps {
  controller: Controller;
  room: RoomSnapshot;
  me: PlayerPublic;
}

export function Selecting({ controller, room, me }: SelectingProps): JSX.Element {
  const selected = room.games.find((g) => g.id === room.selectedGameId) ?? null;
  const vip = room.players.find((p) => p.isVip);

  if (!me.isVip) {
    return (
      <WaitingScreen
        title={t.selecting.vipChoosing(vip?.name ?? 'The VIP')}
        hint={selected ? `${selected.name} — ${selected.tagline}` : undefined}
        mood="wait"
      />
    );
  }

  const start = (): void => controller.vip({ action: 'start' });
  const botCount = room.players.filter((p) => p.bot).length;
  return (
    <Screen
      title={t.lobby.pickGame}
      footer={
        <div className={styles.footer}>
          {!room.canStart.ok ? <p className={styles.reason}>{room.canStart.reason}</p> : null}
          <PrimaryButton onClick={start} disabled={!room.canStart.ok}>
            {t.selecting.start}
            {selected ? ` ${selected.name}` : ''}
          </PrimaryButton>
          <button
            type="button"
            className={styles.back}
            onClick={() => controller.vip({ action: 'toLobby' })}
          >
            {t.selecting.back}
          </button>
        </div>
      }
    >
      <label className={styles.recording} htmlFor="phone-recording">
        <span className={styles.recordingLabel}>
          {t.selecting.recording}
          <small>{room.recording ? t.selecting.recordingHint : t.selecting.recordingOff}</small>
        </span>
        <input
          id="phone-recording"
          type="checkbox"
          className={styles.recordingBox}
          checked={room.recording}
          onChange={(e) => controller.vip({ action: 'setRecording', on: e.target.checked })}
        />
      </label>
      {/* S-005 A: phone only — the TV's moments go to the phones. */}
      <label className={styles.recording} htmlFor="phone-only">
        <span className={styles.recordingLabel}>
          Phone only
          <small>{room.phoneOnly ? 'the phones show what the TV would' : 'the TV is the stage'}</small>
        </span>
        <input
          id="phone-only"
          type="checkbox"
          className={styles.recordingBox}
          checked={room.phoneOnly}
          onChange={(e) => controller.vip({ action: 'setPhoneOnly', on: e.target.checked })}
        />
      </label>
      <ul className={styles.games} role="radiogroup" aria-label="games">
        {room.games.map((g) => {
          const isSelected = g.id === room.selectedGameId;
          return (
            <li key={g.id}>
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`${styles.card} ${isSelected ? styles.selected : ''}`}
                onClick={() => controller.vip({ action: 'selectGame', gameId: g.id })}
              >
                <span className={styles.cardHead}>
                  <span className={styles.cardTitle}>{g.name}</span>
                  <span className={styles.check} aria-hidden>
                    {isSelected ? '✓' : ''}
                  </span>
                </span>
                <span className={styles.cardTagline}>{g.tagline}</span>
                <span className={styles.cardMeta}>
                  {t.selecting.players(g.minPlayers, g.maxPlayers)} ·{' '}
                  {t.selecting.minutes(g.estimatedMinutes)} ·{' '}
                  {g.supportsBots ? (
                    <span className={styles.botsOk}>🤖 {t.lobby.botsWelcome}</span>
                  ) : (
                    <span className={styles.botsNo}>
                      {t.lobby.noBots}
                      {botCount > 0 ? ` (${t.lobby.removeBotsFirst(botCount)})` : ''}
                    </span>
                  )}
                </span>
                {isSelected ? (
                  <span className={styles.cardDescription}>{g.description}</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      {selected && selected.settings.length > 0 ? (
        <section className={styles.settings} aria-label={t.selecting.settings}>
          <h3 className={styles.settingsTitle}>{t.selecting.settings}</h3>
          {selected.settings.map((spec) => (
            <SettingField
              key={spec.key}
              spec={spec}
              value={room.settings[spec.key]}
              players={room.players.length}
              settings={room.settings}
              onChange={(v) =>
                controller.vip({ action: 'updateSettings', settings: { [spec.key]: v } })
              }
            />
          ))}
        </section>
      ) : null}
    </Screen>
  );
}
