// Choosing a game. The TV is the host's screen (ADR-031): the game list on the left is clickable
// and the settings on the right are editable — the same picks the VIP phone makes, on the same
// room state. The room sees the highlighted game big, its settings, and who is here.
import { minutesFor } from '../estimate';
import type { JSX } from 'react';
import type { RoomSnapshot } from '@partybox/shared';
import { Avatar, BigText, Stage, useT } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import { gameText } from '../i18n-games';
import type { TvClient } from '../net/tv';
import { SettingField } from '../SettingField';
import { serverText } from '../server-text';
import { STRINGS } from './strings';
import styles from './TvSelecting.module.css';
import { keySetting } from '../keySetting';
import { voteCounts } from '../controller/VoteRow';
import { gameEntry, taglineOf, useAbout, useCatalog, useGameText } from '../catalog';

export interface TvSelectingProps {
  room: RoomSnapshot;
  client: TvClient;
}

export function TvSelecting({ room, client }: TvSelectingProps): JSX.Element {
  const { games } = useCatalog();
  const game = gameEntry(room.selectedGameId);
  const form = room.selectedGame;
  const vip = room.players.find((p) => p.isVip);
  const botCount = room.players.filter((p) => p.bot).length;
  const counts = voteCounts(room); // I-650 C: the room's votes, shown while the VIP picks
  const L = useT(STRINGS);
  const lang = L.lang;
  useGameText(room.selectedGameId, lang);
  const about = useAbout(room.selectedGameId, lang);
  const settings = form?.id === game?.id ? (form?.settings ?? []) : [];
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
        {/* I-668 B: the room on the sentence's line — the column is the games and the switches */}
        <FaceStack room={room} />
      </p>
      <div className={styles.columns}>
        <div className={styles.left}>
          <ul className={styles.games} role="radiogroup" aria-label={L('games')}>
            {games.map((g) => {
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
                    <span className={styles.gameName}>
                      {g.name}
                      {counts.get(g.id) ? (
                        <span className={styles.votes}>🙋 {counts.get(g.id)}</span>
                      ) : null}
                    </span>
                    <span className={styles.gameMeta}>
                      {t.selecting.players(g.minPlayers, g.maxPlayers)} ·{' '}
                      {
                        t.selecting.minutes(
                          minutesFor(
                            g,
                            g.id === room.selectedGameId ? room.settings : null,
                            room.players.length,
                          ),
                        ) /* I-189 */
                      }
                      {g.supportsBots ? ' · 🤖' : botCount > 0 ? ` · ${t.lobby.noBots}` : ''}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {/* I-668 C: the room's switches, one line of toggles — the list keeps the column */}
          <div className={styles.switches}>
            <button
              type="button"
              aria-pressed={room.recording}
              className={`${styles.switchChip} ${room.recording ? styles.switchOn : ''}`}
              onClick={() => client.act({ action: 'setRecording', on: !room.recording })}
            >
              📼 {L('Recap')} {room.recording ? '✓' : ''}
            </button>
            <button
              type="button"
              aria-pressed={room.musicOnPhones}
              className={`${styles.switchChip} ${room.musicOnPhones ? styles.switchOn : ''}`}
              onClick={() => client.act({ action: 'setMusicOnPhones', on: !room.musicOnPhones })}
            >
              🎵 {L('Phone music')} {room.musicOnPhones ? '✓' : ''}
            </button>
          </div>
        </div>
        {game ? (
          // Nobody scrolls a TV: a game with many settings (bingo's ten) packs three columns and a
          // clamped description so every field stays above the host bar (review-loop #2).
          <div
            className={`${styles.card} ${settings.length > 8 ? styles.dense : ''} pb-enter`}
            key={game.id}
          >
            <BigText level="h1">{game.name}</BigText>
            <p className={styles.tagline}>{taglineOf(game, lang)}</p>
            <p className={styles.description}>{about?.description ?? ''}</p>
            <p className={styles.meta}>
              {t.selecting.players(game.minPlayers, game.maxPlayers)} ·{' '}
              {
                t.selecting.minutes(
                  minutesFor(game, room.settings, room.players.length),
                ) /* I-189 */
              }
              {/* I-187 C: the room sees the deck before the VIP starts — on the meta line, so the
                  settings below keep their room */}
              {(() => {
                const key = form ? keySetting(form, room.settings) : null;
                return key ? (
                  <>
                    {' · '}
                    <span
                      className={`${styles.keyTag} ${key.mark === '🔞' ? styles.keyTagHot : ''}`}
                    >
                      {L('{mark} {deck} deck', {
                        mark: key.mark,
                        deck: gameText(game.id, lang, key.short),
                      })}
                    </span>
                  </>
                ) : null;
              })()}
            </p>
            {settings.length > 0 ? (
              <div className={styles.settings} aria-label={t.selecting.settings}>
                {settings.map((spec) => (
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

/** I-668: the room as one row of overlapping faces — never taller than one line. */
function FaceStack({ room }: { room: RoomSnapshot }): JSX.Element {
  const L = useT(STRINGS);
  return (
    <span className={styles.faces} aria-label={L('{n} players', { n: room.players.length })}>
      {room.players.map((p) => (
        <Avatar key={p.id} avatarId={p.avatarId} size={40} dim={!p.connected} />
      ))}
    </span>
  );
}
