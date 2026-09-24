// Choosing a game on the TV (game pack Part 00 §1.6; the TV is the host's screen, ADR-031). Who is
// choosing, with the room's faces; then either the game grid with its spotlight (nothing chosen)
// or the chosen game's editable card. The glows keep drifting behind both.
import type { JSX } from 'react';
import type { RoomSnapshot } from '@partybox/shared';
import { Avatar, Stage, useT } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import type { TvClient } from '../net/tv';
import { Glow } from './Glow';
import { STRINGS } from './strings';
import { TvChosen } from './TvChosen';
import { TvGameGrid } from './TvGameGrid';
import { TvRoomSwitches } from './TvRoomSwitches';
import styles from './TvSelecting.module.css';

export interface TvSelectingProps {
  room: RoomSnapshot;
  client: TvClient;
}

export function TvSelecting({ room, client }: TvSelectingProps): JSX.Element {
  const vip = room.players.find((p) => p.isVip);
  return (
    <Stage>
      <Glow />
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
        {/* I-668 B: the room on the sentence's line */}
        <FaceStack room={room} />
      </p>
      {room.selectedGameId ? (
        <TvChosen room={room} client={client} />
      ) : (
        <>
          <TvGameGrid room={room} client={client} />
          <div className={styles.gridFoot}>
            <TvRoomSwitches room={room} client={client} />
          </div>
        </>
      )}
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
