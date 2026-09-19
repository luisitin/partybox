// Choosing a game. The TV is the host's screen (ADR-031): the game list on the left is clickable
// and the settings on the right are editable — the same picks the VIP phone makes, on the same
// room state. The room sees the highlighted game big, its settings, and who is here.
import type { JSX } from 'react';
import type { RoomSnapshot } from '@partybox/shared';
import { BigText, PlayerChips, Stage } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import type { TvClient } from '../net/tv';
import { SettingField } from '../SettingField';
import styles from './TvSelecting.module.css';

export interface TvSelectingProps {
  room: RoomSnapshot;
  client: TvClient;
}

export function TvSelecting({ room, client }: TvSelectingProps): JSX.Element {
  const game = room.games.find((g) => g.id === room.selectedGameId);
  const vip = room.players.find((p) => p.isVip);
  const botCount = room.players.filter((p) => p.bot).length;
  return (
    <Stage>
      <p className={`pb-muted ${styles.choosing}`}>
        {vip ? t.selecting.vipChoosing(vip.name) : t.host.choosing}
      </p>
      <div className={styles.columns}>
        <div className={styles.left}>
          <ul className={styles.games} role="radiogroup" aria-label="games">
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
                      {t.selecting.minutes(g.estimatedMinutes)}
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
          <PlayerChips
            players={room.players.map((p) => ({
              id: p.id,
              name: p.name,
              avatarId: p.avatarId,
              connected: p.connected,
              status: p.spectator ? 'spectator' : 'active',
            }))}
            vip={room.vip}
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
            <p className={styles.tagline}>{game.tagline}</p>
            <p className={styles.description}>{game.description}</p>
            <p className={styles.meta}>
              {t.selecting.players(game.minPlayers, game.maxPlayers)} ·{' '}
              {t.selecting.minutes(game.estimatedMinutes)}
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
                    onChange={(v) =>
                      client.act({ action: 'updateSettings', settings: { [spec.key]: v } })
                    }
                  />
                ))}
              </div>
            ) : null}
            {!room.canStart.ok ? <p className={styles.reason}>{room.canStart.reason}</p> : null}
          </div>
        ) : null}
      </div>
    </Stage>
  );
}
