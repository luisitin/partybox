// Part 00 §3.5 (ADR-047): the VIP chose a game the room's presence doesn't suit — a talking game
// while some players are remote with no call, or a same-room game while someone can't see the TV.
// The notice says so on the VIP's chosen screen; Start stays available (the room decides).
import { useState } from 'react';
import type { JSX } from 'react';
import type { CatalogEntry, RoomSnapshot } from '@partybox/shared';
import { t } from '../../i18n';
import type { Controller } from '../../net/controller';
import styles from './picker.module.css';

/**
 * Which notice a game needs in this room, if any: a talking game when the room says some are remote
 * with no call; a same-room game when anyone can't see the TV or the room says some are remote.
 */
export function presenceNotice(game: CatalogEntry, room: RoomSnapshot): 'voice' | 'room' | null {
  if (game.presence === 'voice-if-remote' && room.presenceMode === 'remote-text') return 'voice';
  const away = room.players.some((p) => !p.bot && p.canSeeTv === false);
  if (game.presence === 'same-room' && (away || room.presenceMode !== undefined)) return 'room';
  return null;
}

export function PresenceNotice(props: {
  game: CatalogEntry;
  room: RoomSnapshot;
  controller: Controller;
}): JSX.Element | null {
  const { game, room, controller } = props;
  const [played, setPlayed] = useState<string | null>(null);
  const need = presenceNotice(game, room);
  if (!need || played === game.id) return null;
  const pickAnother = (): void => controller.vip({ action: 'selectGame', gameId: null });
  return (
    <div className={styles.notice} role="status">
      <p>{need === 'voice' ? t.presence.needsVoice : t.presence.needsRoom}</p>
      <div className={styles.noticeActions}>
        {need === 'voice' ? (
          <button
            type="button"
            onClick={() => controller.vip({ action: 'setPresenceMode', mode: 'remote-voice' })}
          >
            {t.presence.onCallPlay}
          </button>
        ) : (
          <button type="button" onClick={() => setPlayed(game.id)}>
            {t.presence.playAnyway}
          </button>
        )}
        <button type="button" className={styles.noticeQuiet} onClick={pickAnother}>
          {t.presence.pickAnother}
        </button>
      </div>
    </div>
  );
}
