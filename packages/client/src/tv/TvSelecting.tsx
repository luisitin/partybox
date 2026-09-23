// Choosing a game. The TV is the host's screen (ADR-031): the game list on the left is clickable
// and the settings on the right are editable — the same picks the VIP phone makes, on the same
// room state. The room sees the highlighted game big, its settings, and who is here.
import { minutesFor } from '../estimate';
import type { JSX } from 'react';
import type { RoomSnapshot } from '@partybox/shared';
import { Avatar, BigText, PlayerChips, Stage, useT } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import { gameText } from '../i18n-games';
import type { TvClient } from '../net/tv';
import { SettingField } from '../SettingField';
import { serverText } from '../server-text';
import { STRINGS } from './strings';
import styles from './TvSelecting.module.css';

export interface TvSelectingProps {
  room: RoomSnapshot;
  client: TvClient;
}

export function TvSelecting({ room, client }: TvSelectingProps): JSX.Element {
  const game = room.games.find((g) => g.id === room.selectedGameId);
  const vip = room.players.find((p) => p.isVip);
  const botCount = room.players.filter((p) => p.bot).length;
  const L = useT(STRINGS);
  const lang = L.lang;
  return (
    <Stage>
      <p className={`pb-muted ${styles.choosing}`}>
        {/* I-045 C: the sentence and the person are one thing — the VIP's face inline. */}
        {vip ? (
          <span className={styles.picking}>
            <Avatar avatarId={vip.avatarId} size={28} />
            {t.selecting.vipChoosing(vip.name)}
          </span>
        ) : (
          t.host.choosing
        )}
      </p>
      <div className={styles.columns}>
        <div className={styles.left}>
          <ul className={styles.games} role="radiogroup" aria-label={L('games')}>
            {room.games.map((g) => {
              const selected = g.id === room.selectedGameId;
              return (
                <li key={g.id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`${styles.gameButton} ${selected ? styles.gameSelected : ''}`}
                    onClick={() => client.act({ action: 'selectGame', gameId: g.id })}
                  >
                    <span className={styles.gameName}>{g.name}</span>
                    <span className={styles.gameMeta}>
                      {t.selecting.players(g.minPlayers, g.maxPlayers)} ·{' '}
                      {t.selecting.minutes(
                        minutesFor(g, g.id === room.selectedGameId ? room.settings : null, room.players.length),
                      ) /* I-189 */}
                      {g.supportsBots ? ' · 🤖' : botCount > 0 ? ` · ${t.lobby.noBots}` : ''}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <label className={styles.recording} htmlFor="tv-recording">
            <input
              id="tv-recording"
              type="checkbox"
              checked={room.recording}
              onChange={(e) => client.act({ action: 'setRecording', on: e.target.checked })}
            />
            {room.recording ? t.selecting.recording : t.selecting.recordingOff}
          </label>
          <label className={styles.recording} htmlFor="tv-music-all">
            <input
              id="tv-music-all"
              type="checkbox"
              checked={room.musicOnPhones}
              onChange={(e) => client.act({ action: 'setMusicOnPhones', on: e.target.checked })}
            />
            {t.selecting.musicOnPhones}
          </label>
          <PlayerChips
            players={room.players.map((p) => ({
              id: p.id,
              name: p.name,
              avatarId: p.avatarId,
              connected: p.connected,
              status: p.spectator ? 'spectator' : 'active',
            }))}
            vip={room.vip}
            // I-045 A + B (the owner's note): the VIP is picking — ringed, thinking dots over
            // their portrait; the plain lobby shows the ring alone.
            activeIds={vip ? [vip.id] : []}
            thinkingIds={vip ? [vip.id] : []}
            botIds={room.players.filter((p) => p.bot).map((p) => p.id)}
            layout="grid"
            size="sm"
          />
        </div>
        {game ? (
          // Nobody scrolls a TV: a game with many settings (bingo's ten) packs three columns and a
          // clamped description so every field stays above the host bar (review-loop #2).
          <div
            className={`${styles.card} ${game.settings.length > 8 ? styles.dense : ''} pb-enter`}
            key={game.id}
          >
            <BigText level="h1">{game.name}</BigText>
            <p className={styles.tagline}>{gameText(game.id, lang, game.tagline)}</p>
            <p className={styles.description}>{gameText(game.id, lang, game.description)}</p>
            <p className={styles.meta}>
              {t.selecting.players(game.minPlayers, game.maxPlayers)} ·{' '}
              {t.selecting.minutes(minutesFor(game, room.settings, room.players.length)) /* I-189 */}
            </p>
            {game.settings.length > 0 ? (
              <div className={styles.settings} aria-label={t.selecting.settings}>
                {game.settings.map((spec) => (
                  <SettingField
                    key={spec.key}
                    spec={spec}
                    value={room.settings[spec.key]}
                    players={room.players.length}
                    settings={room.settings}
                    idPrefix="tv-setting"
                    gameId={game.id}
                    onChange={(v) =>
                      client.act({ action: 'updateSettings', settings: { [spec.key]: v } })
                    }
                  />
                ))}
              </div>
            ) : null}
            {!room.canStart.ok ? (
              <p className={styles.reason}>
                {serverText(room.canStart.reason, lang, room.selectedGameId)}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </Stage>
  );
}
