// Game selection. VIP: browse game cards, tweak settings from the manifest spec, start (disabled
// with the server's reason). Everyone else: a calm "X is choosing…" with the current pick.
import type { JSX } from 'react';
import type { PlayerPublic, RoomSnapshot, SettingSpec, Settings } from '@partybox/shared';
import { PrimaryButton, Screen, WaitingScreen } from '@partybox/game-sdk';
import { t } from '../i18n';
import type { Controller } from '../net/controller';
import styles from './Selecting.module.css';

export interface SelectingProps {
  controller: Controller;
  room: RoomSnapshot;
  me: PlayerPublic;
}

function SettingField({
  spec,
  value,
  onChange,
}: {
  spec: SettingSpec;
  value: Settings[string] | undefined;
  onChange: (v: Settings[string]) => void;
}): JSX.Element {
  const id = `setting-${spec.key}`;
  switch (spec.type) {
    case 'boolean':
      return (
        <label className={styles.setting} htmlFor={id}>
          <span className={styles.settingLabel}>
            {spec.label}
            {spec.description ? <small>{spec.description}</small> : null}
          </span>
          <input
            id={id}
            type="checkbox"
            className={styles.checkbox}
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
          />
        </label>
      );
    case 'number':
      return (
        <label className={styles.setting} htmlFor={id}>
          <span className={styles.settingLabel}>
            {spec.label}
            {spec.description ? <small>{spec.description}</small> : null}
          </span>
          <span className={styles.stepper}>
            <button
              type="button"
              aria-label={`less ${spec.label}`}
              onClick={() =>
                onChange(Math.max(spec.min, Number(value ?? spec.default) - (spec.step ?? 1)))
              }
            >
              −
            </button>
            <output id={id}>{String(value ?? spec.default)}</output>
            <button
              type="button"
              aria-label={`more ${spec.label}`}
              onClick={() =>
                onChange(Math.min(spec.max, Number(value ?? spec.default) + (spec.step ?? 1)))
              }
            >
              +
            </button>
          </span>
        </label>
      );
    case 'select':
      return (
        <label className={styles.setting} htmlFor={id}>
          <span className={styles.settingLabel}>
            {spec.label}
            {spec.description ? <small>{spec.description}</small> : null}
          </span>
          <select
            id={id}
            className={styles.select}
            value={String(value ?? spec.default)}
            onChange={(e) => onChange(e.target.value)}
          >
            {spec.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      );
  }
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
                <span className={styles.cardTitle}>{g.name}</span>
                <span className={styles.cardTagline}>{g.tagline}</span>
                <span className={styles.cardMeta}>
                  {t.selecting.players(g.minPlayers, g.maxPlayers)} ·{' '}
                  {t.selecting.minutes(g.estimatedMinutes)}
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
