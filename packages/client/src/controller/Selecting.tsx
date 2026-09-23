// Game selection. VIP: browse game cards, tweak settings from the manifest spec, start (disabled
// with the server's reason). Everyone else: a calm "X is choosing…" with the current pick.
import type { JSX } from 'react';
import type { GameSummary, PlayerPublic, RoomSnapshot, Settings } from '@partybox/shared';
import { PrimaryButton, Screen, WaitingScreen, useLang } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import { gameText } from '../i18n-games';
import { serverText } from '../server-text';
import { useServerInfo } from '../net/info';
import { SettingField } from '../SettingField';
import type { Controller } from '../net/controller';
import styles from './Selecting.module.css';

export interface SelectingProps {
  controller: Controller;
  room: RoomSnapshot;
  me: PlayerPublic;
}

export function Selecting({ controller, room, me }: SelectingProps): JSX.Element {
  const info = useServerInfo(); // I-034 B
  const selected = room.games.find((g) => g.id === room.selectedGameId) ?? null;
  const vip = room.players.find((p) => p.isVip);
  const lang = useLang();

  if (!me.isVip) {
    return (
      <WaitingScreen
        title={t.selecting.vipChoosing(vip?.name ?? t.selecting.theVip)}
        hint={
          selected
            ? `${selected.name} — ${gameText(selected.id, lang, selected.tagline)}`
            : undefined
        }
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
          {/* The engine writes the reason in English; the phone shows it in its own language. */}
          {!room.canStart.ok ? (
            <p className={styles.reason}>
              {serverText(room.canStart.reason, lang, room.selectedGameId)}
            </p>
          ) : null}
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
      {/* I-034 B: a way into the last recap from the phone. */}
      {info?.lastRecap ? (
        <a className="pb-caption" href="/api/recaps/latest/page" target="_blank" rel="noreferrer">
          {t.selecting.lastRecap(info.lastRecap.gameId, info.lastRecap.code)}
        </a>
      ) : null}
      {/* S-004 (the owner): the VIP's switch — music on every phone. */}
      <label className={styles.recording} htmlFor="phone-music-all">
        <span className={styles.recordingLabel}>
          {t.selecting.musicOnPhones}
          <small>
            {room.musicOnPhones ? t.selecting.musicOnPhonesHint : t.selecting.musicOnPhonesOff}
          </small>
        </span>
        <input
          id="phone-music-all"
          type="checkbox"
          className={styles.recordingBox}
          checked={room.musicOnPhones}
          onChange={(e) => controller.vip({ action: 'setMusicOnPhones', on: e.target.checked })}
        />
      </label>
      {/* S-005 A: phone only — the TV's moments go to the phones. */}
      <label className={styles.recording} htmlFor="phone-only">
        <span className={styles.recordingLabel}>
          {t.selecting.phoneOnly}
          <small>{room.phoneOnly ? t.selecting.phoneOnlyOn : t.selecting.phoneOnlyOff}</small>
        </span>
        <input
          id="phone-only"
          type="checkbox"
          className={styles.recordingBox}
          checked={room.phoneOnly}
          onChange={(e) => controller.vip({ action: 'setPhoneOnly', on: e.target.checked })}
        />
      </label>
      <ul className={styles.games} role="radiogroup" aria-label={t.selecting.games}>
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
                <span className={styles.cardTagline}>{gameText(g.id, lang, g.tagline)}</span>
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
                {/* I-763 B: the card says what is tuned, so the VIP can see it stuck */}
                {tunedLine(g, room.tuned?.[g.id]) ? (
                  <span className={styles.cardTuned}>{tunedLine(g, room.tuned?.[g.id])}</span>
                ) : null}
                {isSelected ? (
                  <span className={styles.cardDescription}>
                    {gameText(g.id, lang, g.description)}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      {selected && selected.settings.length > 0 ? (
        <section className={styles.settings} aria-label={t.selecting.settings}>
          <h3 className={styles.settingsTitle}>
            {t.selecting.settings}
            {/* I-763 B: the factory numbers, one tap away */}
            {tunedLine(selected, room.settings) ? (
              <button
                type="button"
                className={styles.resetDefaults}
                onClick={() =>
                  controller.vip({
                    action: 'updateSettings',
                    settings: Object.fromEntries(selected.settings.map((s) => [s.key, s.default])),
                  })
                }
              >
                Reset to defaults
              </button>
            ) : null}
          </h3>
          {selected.settings.map((spec) => (
            <SettingField
              key={spec.key}
              spec={spec}
              value={room.settings[spec.key]}
              players={room.players.length}
              settings={room.settings}
              gameId={selected.id}
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

/** I-763 B: "Your settings: Cards 4 · Seconds per call 3" — the settings that differ from the
 *  game's defaults, up to three, or null when nothing is tuned. */
function tunedLine(game: GameSummary, values: Settings | undefined): string | null {
  if (!values) return null;
  const changed = game.settings.filter(
    (s) => values[s.key] !== undefined && values[s.key] !== s.default,
  );
  if (changed.length === 0) return null;
  const say = (s: GameSummary['settings'][number]): string => {
    const v = values[s.key];
    if (typeof v === 'boolean') return `${s.label} ${v ? 'on' : 'off'}`;
    if (s.type === 'select') return `${s.label} ${s.options.find((o) => o.value === v)?.label ?? String(v)}`;
    return `${s.label} ${String(v)}`;
  };
  const shown = changed.slice(0, 3).map(say).join(' · ');
  return `Your settings: ${shown}${changed.length > 3 ? ` · +${changed.length - 3} more` : ''}`;
}
