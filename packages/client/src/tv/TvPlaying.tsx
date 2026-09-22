// The envelope during play: chips + timer in a top strip (the VIP is marked on their chip), a
// "Paused" curtain, and the game's lazy Tv component in the middle.
import { Suspense, useCallback, useEffect, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import type { PushedView, RoomSnapshot, TvView } from '@partybox/shared';
import {
  BigText,
  DeadlineBar,
  PlayerChips,
  SoundProvider,
  Stage,
  Timer,
} from '@partybox/game-sdk/ui';
import { GameErrorBoundary } from '../controller/GameErrorBoundary';
import { clientGames } from '../games.generated';
import { t } from '../i18n';
import { countdownSemitones } from '../sound';
import type { MusicEngine } from '../music';
import type { PlayCueOptions } from '@partybox/game-sdk/ui';
import type { SoundCue, SoundEngine } from '../sound';
import { CrossfadeSwap } from '../CrossfadeSwap';
import styles from './TvPlaying.module.css';

export interface TvPlayingProps {
  room: RoomSnapshot;
  view: PushedView<TvView> | null;
  audio: SoundEngine;
  /** The stage's background music: a cheer ducks it. */
  music?: MusicEngine;
  /** Fires once the game's own component has mounted (module loaded, first view rendered). */
  onGameReady?: () => void;
}

/** Mounts next to the game inside Suspense, so it reports exactly when the game painted. */
function Ready({ onReady }: { onReady?: () => void }): null {
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return null;
}

/** Shows its children only after a short wait: a game chunk that loads fast never flashes a
 *  placeholder; a slow one (a real TV browser over Wi-Fi) gets an on-brand card, not a stray "…".
 *  150 ms is timing, not motion, so it does not read the reduced-motion tokens. */
function DelayedFallback({ children }: { children: ReactNode }): JSX.Element | null {
  const [show, setShow] = useState(false);
  useEffect(() => {
    // 400 ms: a LAN load never shows this; only a genuinely slow module does (review-loop #10).
    const handle = setTimeout(() => setShow(true), 400);
    return () => clearTimeout(handle);
  }, []);
  return show ? <>{children}</> : null;
}

export function TvPlaying({ room, view, audio, onGameReady, music }: TvPlayingProps): JSX.Element {
  // The curtain stays mounted while it fades out after a resume ("adjust state during render":
  // the paused flag flipping true → false starts the leave; animationend or 400 ms clears it).
  const paused = view?.paused ?? false;
  const [prevPaused, setPrevPaused] = useState(paused);
  const [leaving, setLeaving] = useState(false);
  if (paused !== prevPaused) {
    setPrevPaused(paused);
    setLeaving(!paused);
  }
  useEffect(() => {
    if (!leaving) return;
    const handle = setTimeout(() => setLeaving(false), 400);
    return () => clearTimeout(handle);
  }, [leaving]);
  // The last five seconds climb a scale (5 → 1), so the room hears the deadline coming. Ticks
  // are not game cues: `quiet` keeps them from suppressing the next phase's chime.
  const onTick = useCallback(
    (s: number) => audio.play('countdown', { semitones: countdownSemitones(s), quiet: true }),
    [audio],
  );
  const play = useCallback(
    (cue: SoundCue, opts?: PlayCueOptions) => {
      // The winner moment sits on top of the music, not inside it.
      if (cue === 'cheer') music?.duck(9000);
      audio.play(cue, opts);
    },
    [audio, music],
  );
  const clip = useCallback(
    (src: string, opts?: { gain?: number; delayMs?: number }) => audio.clip(src, opts),
    [audio],
  );
  const hush = useCallback(() => audio.hushClips(), [audio]);
  const module = room.selectedGameId ? clientGames[room.selectedGameId] : undefined;
  const gameName = room.games.find((g) => g.id === room.selectedGameId)?.name ?? '';
  const vip = room.players.find((p) => p.id === (view?.vip ?? room.vip));
  // While a game withholds the strip (Wisecrack's reveal), the chips keep the numbers they last
  // showed, muted: the tally is not spoiled and the row does not reflow (review-loop #32).
  const [held, setHeld] = useState<Record<string, number>>({});
  if (!view) {
    return (
      <div className={styles.center}>
        <BigText tone="muted">{t.connection.connecting}</BigText>
      </div>
    );
  }
  const GameTv = module?.Tv as unknown as
    ((props: { view: PushedView<TvView> }) => JSX.Element) | undefined;
  // A phase the game cuts into (its own entrance is the choreography — loop 296).
  const quick = module?.quickInto?.includes(view.phaseId) === true;
  // ADR-030: a game may ask for a quiet timer (bar only — a rhythm, not a countdown) or none.
  const timerMode = view.timerMode ?? 'normal';
  // Running totals on the strip (R-068): every ViewPlayer already carries `score`; spectators and
  // score-less games (Broken Pencil) stay number-free; a game can hold the strip back per phase.
  const showScores =
    view.players.some((p) => p.score !== undefined) && (module?.stripScores?.(view) ?? true);
  if (showScores && view.players.some((p) => p.score !== undefined && held[p.id] !== p.score)) {
    const next: Record<string, number> = {};
    for (const p of view.players) if (p.score !== undefined) next[p.id] = p.score;
    setHeld(next);
  }
  const frozen = !showScores && view.players.some((p) => held[p.id] !== undefined);
  const players = frozen ? view.players.map((p) => ({ ...p, score: held[p.id] })) : view.players;
  return (
    // I-030: `held` steps the room back behind the curtain; `resumed` lands it as the curtain lifts.
    <div
      className={`${styles.playing} ${paused ? styles.held : ''} ${!paused && leaving ? styles.resumed : ''}`}
    >
      <div className={styles.strip}>
        {/* I-131 C: some phases take the whole stage. */}
        <PlayerChips
          players={[
            ...players,
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
          activeIds={[...(module?.stripActive?.(view) ?? [])]}
          botIds={room.players.filter((p) => p.bot).map((p) => p.id)}
          showScores={showScores || frozen}
          scoresMuted={frozen}
          size="sm"
          facesOnly={module?.stripCompact?.includes(view.phaseId) ?? false}
          leadId={view.phaseId === 'check' || view.phaseId === 'bingo' ? ((view as { claim?: { playerId?: string } }).claim?.playerId ?? null) : null}
        />
        {/* Quiet/hidden timers free the column: six chips fit on one row instead of wrapping (loop #1). */}
        <div className={timerMode === 'normal' ? styles.timer : styles.timerSlim}>
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
      {/* `.stage` carries the pause hold and the resume landing (I-030): the swap's own container
          animates each phase in, and an animation there would pin the transform. */}
      <div className={styles.stage}>
        <CrossfadeSwap
          swapKey={view.phaseId}
          className={quick ? styles.gameQuick : styles.game}
          quick={quick}
        >
          {GameTv ? (
            <GameErrorBoundary surface="tv">
              <Suspense
                fallback={
                  <DelayedFallback>
                    <Stage center>
                      <BigText level="h1" tone="muted">
                        {gameName}
                      </BigText>
                      <p className="pb-muted">{t.connection.loadingGame}</p>
                    </Stage>
                  </DelayedFallback>
                }
              >
                <SoundProvider play={play} clip={clip} hush={hush}>
                  <GameTv view={view} />
                  <Ready onReady={onGameReady} />
                </SoundProvider>
              </Suspense>
            </GameErrorBoundary>
          ) : (
            <BigText tone="muted">Unknown game "{room.selectedGameId}"</BigText>
          )}
        </CrossfadeSwap>
      </div>
      {view.paused || leaving ? (
        <div
          className={`${styles.curtain} ${!view.paused ? styles.leaving : ''}`}
          role="status"
          onAnimationEnd={() => !view.paused && setLeaving(false)}
        >
          <div className={styles.pausedCard}>
            <BigText level="h1">⏸ {t.tv.paused}</BigText>
            {vip ? <p className="pb-muted">{t.tv.pausedHint(vip.name)}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
