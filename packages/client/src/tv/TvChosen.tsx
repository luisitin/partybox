// A game is chosen (Part 00 §1.6, ruling 7: today's editable settings card, ADR-031): the game list
// on the left stays clickable, with "‹ All games" back to the grid, and the right shows the chosen
// game big — its words from the host (`about`), its settings editable from the TV.
import type { JSX } from 'react';
import type { RoomSnapshot } from '@partybox/shared';
import { BigText, useT } from '@partybox/game-sdk/ui';
import { gameEntry, taglineOf, useAbout, useCatalog, useGameText } from '../catalog';
import { voteCounts } from '../controller/VoteRow';
import { minutesFor } from '../estimate';
import { t } from '../i18n';
import { gameText } from '../i18n-games';
import { keySetting } from '../keySetting';
import type { TvClient } from '../net/tv';
import { serverText } from '../server-text';
import { SettingField } from '../SettingField';
import { useStepCycle } from '../useStepCycle';
import { STRINGS } from './strings';
import { TvRoomSwitches } from './TvRoomSwitches';
import styles from './TvSelecting.module.css';

export function TvChosen({ room, client }: { room: RoomSnapshot; client: TvClient }): JSX.Element {
  const { games } = useCatalog();
  const game = gameEntry(room.selectedGameId);
  const form = room.selectedGame;
  const botCount = room.players.filter((p) => p.bot).length;
  const counts = voteCounts(room); // I-650 C: the room's votes, shown while the VIP picks
  const L = useT(STRINGS);
  const lang = L.lang;
  useGameText(room.selectedGameId, lang);
  const about = useAbout(room.selectedGameId, lang);
  const settings = form?.id === game?.id ? (form?.settings ?? []) : [];
  const key = form ? keySetting(form, room.settings) : null;
  const lit = useStepCycle(about !== null);
  return (
    <div className={styles.columns}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.allGames}
          onClick={() => client.act({ action: 'selectGame', gameId: null })}
        >
          {t.picker.allGames}
        </button>
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
                  <span className={styles.gameIcon} aria-hidden>
                    {g.icon}
                  </span>
                  <span className={styles.gameName}>{g.name}</span>
                  {counts.get(g.id) ? (
                    <span className={styles.votes}>🙋 {counts.get(g.id)}</span>
                  ) : null}
                  <span className={styles.gameMeta}>
                    {t.picker.players(g.minPlayers, g.maxPlayers)} ·{' '}
                    {t.picker.minutes(
                      minutesFor(
                        g,
                        selected ? room.settings : room.tuned?.[g.id],
                        room.players.length,
                      ),
                    )}
                    {!g.supportsBots && botCount > 0 ? ` · ${t.lobby.noBots}` : ''}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <TvRoomSwitches room={room} client={client} />
      </div>
      {game ? (
        // Nobody scrolls a TV: a game with many settings (bingo's twelve) packs three columns and
        // a clamped description so every field stays above the host bar (review-loop #2).
        <div
          className={`${styles.card} ${settings.length > 8 ? styles.dense : ''} pb-enter`}
          key={game.id}
        >
          <BigText level="h1">
            <span aria-hidden>{game.icon}</span> {game.name}
          </BigText>
          <p className={styles.tagline}>{taglineOf(game, lang)}</p>
          {/* The room reads how to play while the VIP tunes (the steps light up in turn). */}
          {about ? (
            <ol className={styles.steps} aria-label={t.picker.howToPlay}>
              {about.howToPlay.map((step, i) => (
                <li key={step} className={lit === null || lit === i ? styles.stepLit : undefined}>
                  {step}
                </li>
              ))}
            </ol>
          ) : (
            <div className={styles.stepsWait} />
          )}
          <p className={styles.meta}>
            {t.selecting.players(game.minPlayers, game.maxPlayers)} ·{' '}
            {t.selecting.minutes(minutesFor(game, room.settings, room.players.length))}
            {/* I-187 C: the room sees the deck before the VIP starts */}
            {key ? (
              <>
                {' · '}
                <span className={`${styles.keyTag} ${key.mark === '🔞' ? styles.keyTagHot : ''}`}>
                  {L('{mark} {deck} deck', {
                    mark: key.mark,
                    deck: gameText(game.id, lang, key.short),
                  })}
                </span>
              </>
            ) : null}
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
  );
}
