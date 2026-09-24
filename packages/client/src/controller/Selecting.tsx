// Game selection. VIP: browse game cards, tweak settings from the manifest spec, start (disabled
// with the server's reason). Everyone else: a calm "X is choosing…" with the current pick.
import { minutesFor } from '../estimate';
import type { JSX } from 'react';
import type { PlayerPublic, RoomSnapshot } from '@partybox/shared';
import { PrimaryButton, Screen, WaitingScreen, useLang } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import { gameText } from '../i18n-games';
import { serverText } from '../server-text';
import { SettingField } from '../SettingField';
import type { Controller } from '../net/controller';
import styles from './Selecting.module.css';
import { VoteRow, voteCounts } from './VoteRow';
import { MAX_BOTS_PER_OWNER } from '@partybox/shared';
import { fixLabel, runFix, startFix } from '../startFix';

export interface SelectingProps {
  controller: Controller;
  room: RoomSnapshot;
  me: PlayerPublic;
}

export function Selecting({ controller, room, me }: SelectingProps): JSX.Element {
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
      >
        {/* I-650 A: the vote stays open while the VIP picks */}
        <VoteRow controller={controller} room={room} me={me} />
      </WaitingScreen>
    );
  }

  const start = (): void => controller.vip({ action: 'start' });
  // I-667 A: the red line's one-tap fix (the VIP's phone adds bots it owns — 4 at most)
  const myBots = room.players.filter((p) => p.bot?.ownerId === me.id).length;
  const fixFor = (g: (typeof room.games)[number]) => startFix(room, g, MAX_BOTS_PER_OWNER - myBots);
  const fix = !room.canStart.ok && selected ? fixFor(selected) : null;
  const botCount = room.players.filter((p) => p.bot).length;
  // I-650 A: the votes on each game
  const counts = voteCounts(room);
  // I-650 B: the most-wanted games first (a tie keeps the usual order)
  const games = [...room.games].sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0));
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
          {fix ? (
            <button
              type="button"
              className={styles.fix}
              onClick={() => runFix(fix, (a) => controller.bot(a))}
            >
              {fix.kind === 'remove' ? '✕' : '🤖'} {fixLabel(fix, t.fix)}
            </button>
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
      {/* I-642 B: the room's switches, one row — they are changed in the ★ menu */}
      <button
        type="button"
        className={styles.roomRow}
        aria-label={t.roomRow.aria(room.recording, room.musicOnPhones, room.phoneOnly)}
        onClick={() => window.dispatchEvent(new Event('pb:vip-menu'))}
      >
        <span className={styles.roomLabel}>{t.roomRow.label}</span>
        <span className={`${styles.roomChip} ${room.recording ? styles.roomOn : ''}`}>
          {room.recording ? '✓ ' : ''}
          {t.roomRow.recap}
        </span>
        <span className={`${styles.roomChip} ${room.musicOnPhones ? styles.roomOn : ''}`}>
          {room.musicOnPhones ? '✓ ' : ''}
          {t.roomRow.music}
        </span>
        <span className={`${styles.roomChip} ${room.phoneOnly ? styles.roomOn : ''}`}>
          {room.phoneOnly ? '✓ ' : ''}
          {t.roomRow.phoneOnly}
        </span>
        <span className={styles.roomEdit} aria-hidden>
          ›
        </span>
      </button>
      <ul className={styles.games} role="radiogroup" aria-label={t.selecting.games}>
        {games.map((g) => {
          const isSelected = g.id === room.selectedGameId;
          const wants = counts.get(g.id) ?? 0;
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
                  {wants > 0 ? (
                    <span className={styles.votes} aria-label={t.vote.want(wants)}>
                      🙋 {wants}
                    </span>
                  ) : null}
                  <span className={styles.check} aria-hidden>
                    {isSelected ? '✓' : ''}
                  </span>
                </span>
                <span className={styles.cardTagline}>{gameText(g.id, lang, g.tagline)}</span>
                {/* I-667 C: a game that doesn't fit the room says so, and what it would take */}
                {(() => {
                  const n = room.players.length;
                  const off =
                    (botCount > 0 && !g.supportsBots) || n > g.maxPlayers || n < g.minPlayers;
                  if (!off) return null;
                  const f = fixFor(g);
                  return (
                    <span className={styles.fit}>
                      {t.fix.here(n)}
                      {f
                        ? ` · ${fixLabel(f, { removeToPlay: t.fix.removeShort, removeAll: t.fix.removeAllShort, addToPlay: t.fix.addShort })}`
                        : ''}
                    </span>
                  );
                })()}
                <span className={styles.cardMeta}>
                  {t.selecting.players(g.minPlayers, g.maxPlayers)} ·{' '}
                  {/* I-189: from the game's pace, the settings and the room */}
                  {t.selecting.minutes(
                    minutesFor(
                      g,
                      g.id === room.selectedGameId ? room.settings : null,
                      room.players.length,
                    ),
                  )}{' '}
                  ·{' '}
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
          <h3 className={styles.settingsTitle}>{t.selecting.settings}</h3>
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
