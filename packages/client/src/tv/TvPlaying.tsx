// The envelope during play: chips + timer in a top strip (the VIP is marked on their chip), a
// "Paused" curtain, and the game's lazy Tv component in the middle.
import { Suspense, useCallback } from 'react';
import type { JSX } from 'react';
import type { PushedView, RoomSnapshot, TvView } from '@partybox/shared';
import { BigText, DeadlineBar, PlayerChips, SoundProvider, Timer } from '@partybox/game-sdk/ui';
import { GameErrorBoundary } from '../controller/GameErrorBoundary';
import { clientGames } from '../games.generated';
import { t } from '../i18n';
import type { SoundCue, SoundEngine } from '../sound';
import styles from './TvPlaying.module.css';

export interface TvPlayingProps {
  room: RoomSnapshot;
  view: PushedView<TvView> | null;
  audio: SoundEngine;
}

export function TvPlaying({ room, view, audio }: TvPlayingProps): JSX.Element {
  const onTick = useCallback(() => audio.play('countdown'), [audio]);
  const play = useCallback((cue: SoundCue) => audio.play(cue), [audio]);
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
  // ADR-030: a game may ask for a quiet timer (bar only — a rhythm, not a countdown) or none.
  const timerMode = view.timerMode ?? 'normal';
  return (
    <div className={styles.playing}>
      <div className={styles.strip}>
        <PlayerChips
          players={[
            ...view.players,
            // Spectators are not in the game state; show them dimmed so late joiners feel seen.
            ...room.players
              .filter((p) => p.spectator)
              .map((p) => ({
                id: p.id,
                name: p.name,
                avatarId: p.avatarId,
                connected: p.connected,
                status: 'spectator' as const,
              })),
          ]}
          vip={view.vip}
          botIds={room.players.filter((p) => p.bot).map((p) => p.id)}
          size="sm"
        />
        <div className={styles.timer}>
          {timerMode === 'normal' ? (
            <Timer deadline={view.deadline} paused={view.paused} onTick={onTick} size="lg" />
          ) : view.paused ? (
            <span className={styles.pausedGlyph} aria-label={t.tv.paused}>
              ⏸
            </span>
          ) : null}
        </div>
      </div>
      {timerMode !== 'hidden' ? (
        <DeadlineBar
          deadline={view.deadline}
          phaseKey={view.phaseId}
          paused={view.paused}
          className={styles.bar}
        />
      ) : null}
      <div className={styles.game} key={view.phaseId}>
        {GameTv ? (
          <GameErrorBoundary surface="tv">
            <Suspense fallback={<BigText tone="muted">…</BigText>}>
              <SoundProvider play={play}>
                <GameTv view={view} />
              </SoundProvider>
            </Suspense>
          </GameErrorBoundary>
        ) : (
          <BigText tone="muted">Unknown game "{room.selectedGameId}"</BigText>
        )}
      </div>
      {view.paused ? (
        <div className={styles.curtain} role="status">
          <div className={styles.pausedCard}>
            <BigText level="h1">⏸ {t.tv.paused}</BigText>
            {vip ? <p className="pb-muted">{t.tv.pausedHint(vip.name)}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
