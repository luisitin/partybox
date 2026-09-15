// The envelope during play: chips + timer in a top strip, VIP overlay in a corner, "Paused" curtain,
// and the game's lazy Tv component in the middle.
import { Suspense, useCallback } from 'react';
import type { JSX } from 'react';
import type { PushedView, RoomSnapshot, TvView } from '@partybox/shared';
import { BigText, DeadlineBar, PlayerChips, Timer } from '@partybox/game-sdk/ui';
import { GameErrorBoundary } from '../controller/GameErrorBoundary';
import { clientGames } from '../games.generated';
import { t } from '../i18n';
import type { SoundEngine } from '../sound';
import styles from './TvPlaying.module.css';

export interface TvPlayingProps {
  room: RoomSnapshot;
  view: PushedView<TvView> | null;
  audio: SoundEngine;
}

export function TvPlaying({ room, view, audio }: TvPlayingProps): JSX.Element {
  const onTick = useCallback(() => audio.play('countdown'), [audio]);
  const module = room.selectedGameId ? clientGames[room.selectedGameId] : undefined;
  const vip = room.players.find((p) => p.id === (view?.vip ?? room.vip));
  if (!view) {
    return (
      <div className={styles.center}>
        <BigText tone="muted">{t.connection.connecting}</BigText>
      </div>
    );
  }
  const GameTv = module?.Tv as unknown as
    ((props: { view: PushedView<TvView> }) => JSX.Element) | undefined;
  return (
    <div className={styles.playing}>
      <div className={styles.strip}>
        <PlayerChips players={view.players} vip={view.vip} size="sm" />
        <div className={styles.timer}>
          <Timer deadline={view.deadline} paused={view.paused} onTick={onTick} size="lg" />
        </div>
      </div>
      <DeadlineBar
        deadline={view.deadline}
        phaseKey={view.phaseId}
        paused={view.paused}
        className={styles.bar}
      />
      <div className={styles.game} key={view.phaseId}>
        {GameTv ? (
          <GameErrorBoundary surface="tv">
            <Suspense fallback={<BigText tone="muted">…</BigText>}>
              <GameTv view={view} />
            </Suspense>
          </GameErrorBoundary>
        ) : (
          <BigText tone="muted">Unknown game "{room.selectedGameId}"</BigText>
        )}
      </div>
      {view.paused ? (
        <div className={styles.curtain} role="status">
          <BigText level="display">{t.tv.paused}</BigText>
        </div>
      ) : null}
      {vip ? (
        <div className={styles.vip} aria-label={`VIP ${vip.name}`}>
          ★ {vip.name}
        </div>
      ) : null}
    </div>
  );
}
