// ADR-053 on the TV: the start stage. The chosen game big, its three steps at full strength (none
// lights in turn or hides: the room reads at its own pace), and a row of everyone's faces that
// lights up as each person taps READY on their phone (bots are lit already), with who the room is
// still waiting for under it. The host bar has ‹ Back and Start now. Then the 3·2·1, on the server
// clock like the phones', a cue per number.
import { useCallback } from 'react';
import type { JSX } from 'react';
import type { RoomSnapshot } from '@partybox/shared';
import { Avatar, BigText, useLang } from '@partybox/game-sdk/ui';
import { gameEntry, useAbout } from '../catalog';
import { t } from '../i18n';
import type { TvClient } from '../net/tv';
import type { SoundEngine } from '../sound';
import hostStyles from './HostBar.module.css';
import { StageCount } from '../StageCount';
import styles from './TvStartStage.module.css';

export function TvStartStage({
  room,
  audio,
}: {
  room: RoomSnapshot;
  audio?: SoundEngine;
}): JSX.Element | null {
  const lang = useLang();
  const stage = room.starting;
  const about = useAbout(stage?.gameId, lang);
  const onNumber = useCallback(() => audio?.play('countdown'), [audio]);
  const game = gameEntry(stage?.gameId);
  if (!stage || !game) return null;
  const isReady = (id: string, bot: boolean): boolean => bot || stage.ready.includes(id);
  const waiting = room.players.filter((p) => p.connected && !p.bot && !stage.ready.includes(p.id));
  const names = waiting.slice(0, 3).map((p) => p.name);
  return (
    <div className={styles.stage}>
      <div className={styles.card}>
        <BigText level="h1">
          <span aria-hidden>{game.icon}</span> {game.name}
        </BigText>
        <h2 className={styles.label}>{t.picker.howToPlay}</h2>
        {about ? (
          <ol className={styles.steps}>
            {about.howToPlay.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        ) : (
          <div className={styles.stepsWait} />
        )}
      </div>
      <ul className={styles.faces} aria-label={t.lobby.playersList}>
        {room.players.map((p) => {
          const ready = isReady(p.id, p.bot !== undefined);
          return (
            <li key={p.id} className={`${styles.face} ${ready ? styles.ready : ''}`}>
              <Avatar avatarId={p.avatarId} size={88} dim={!p.connected} />
              <span className={styles.faceName}>
                {ready ? '✓ ' : ''}
                {p.name}
              </span>
            </li>
          );
        })}
      </ul>
      <p className={styles.waiting} role="status">
        {stage.held
          ? t.stage.held
          : waiting.length === 0
            ? t.stage.everyoneReady
            : t.stage.waitingFor(names, waiting.length - names.length)}
      </p>
      <StageCount at={stage.countdownAt} surface="tv" onNumber={onNumber} />
    </div>
  );
}

/** The host bar during the stage: ‹ Back and Start now (gone once the count runs). */
export function StageHostButtons({
  client,
  room,
}: {
  client: TvClient;
  room: RoomSnapshot;
}): JSX.Element {
  // during the count: Wait (the count stops, the rules stay up until Start now)
  if (room.starting?.countdownAt !== null)
    return (
      <button
        type="button"
        className={hostStyles.button}
        onClick={() => client.act({ action: 'pause' })}
      >
        ⏸ {t.stage.wait}
      </button>
    );
  return (
    <>
      <button
        type="button"
        className={hostStyles.button}
        onClick={() => client.act({ action: 'back' })}
      >
        {t.stage.back}
      </button>
      <button
        type="button"
        className={`${hostStyles.button} ${hostStyles.primary}`}
        title={t.stage.startNowHint}
        onClick={() => client.act({ action: 'startNow' })}
      >
        ▶ {t.stage.startNow}
      </button>
    </>
  );
}
