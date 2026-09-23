// During a game: spectators wait; players get the game's lazy Controller component with
// `{ view, me, send }`. Unknown game ids (registry drift) show a plain message instead of crashing.
import { Suspense, useCallback, useEffect, useState } from 'react';
import type { JSX } from 'react';
import type { ControllerView, PlayerPublic, PushedView, RoomSnapshot } from '@partybox/shared';
import {
  Avatar,
  PhoneOnlyProvider,
  SoundProvider,
  WaitingScreen,
  getLang,
} from '@partybox/game-sdk/ui';
import styles from './ControllerShell.module.css';
import { clientGames } from '../games.generated';
import { t } from '../i18n';
import { serverText } from '../server-text';
import type { Controller } from '../net/controller';
import type { PlayCueOptions } from '@partybox/game-sdk/ui';
import type { SoundCue, SoundEngine } from '../sound';
import { GameErrorBoundary } from './GameErrorBoundary';

export interface PlayingProps {
  controller: Controller;
  room: RoomSnapshot;
  me: PlayerPublic;
  view: PushedView<ControllerView> | null;
  /** The phone's sound engine; absent in /preview, where every cue is silent. */
  audio?: SoundEngine;
  /** Fires once the game's own component has mounted (module loaded, first view rendered). */
  onGameReady?: () => void;
}

/** Shown only after 400 ms: a LAN load never flashes the placeholder (review-loop #11). */
function DelayedWaiting({ title }: { title: string }): JSX.Element | null {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const handle = setTimeout(() => setShow(true), 400);
    return () => clearTimeout(handle);
  }, []);
  return show ? <WaitingScreen title={title} mood="wait" /> : null;
}

/** Mounts next to the game inside Suspense: reports exactly when the game painted. */
function Ready({ onReady }: { onReady?: () => void }): null {
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return null;
}

/** I-057 A: the bench — what the game's own view already tells a spectator, read-only. */
function Bench({
  view,
  room,
  play,
}: {
  view: PushedView<ControllerView> | null;
  room: RoomSnapshot;
  play: (cue: SoundCue, opts?: PlayCueOptions) => void;
}): JSX.Element | null {
  const rows = [...(view?.players ?? [])]
    .filter((p) => p.score !== undefined)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  // I-057 C: a total that changes bumps and ticks. The previous totals live in state, adjusted
  // during render when the scores move (no ref read in render, no setState in an effect).
  const scoresKey = rows.map((r) => `${r.id}:${r.score ?? 0}`).join(',');
  const [seen, setSeen] = useState<{
    key: string;
    scores: Record<string, number>;
    changed: string[];
  }>(() => ({
    key: scoresKey,
    scores: Object.fromEntries(rows.map((r) => [r.id, r.score ?? 0])),
    changed: [],
  }));
  if (seen.key !== scoresKey) {
    const changed = rows
      .filter((r) => seen.scores[r.id] !== undefined && seen.scores[r.id] !== (r.score ?? 0))
      .map((r) => r.id);
    setSeen({
      key: scoresKey,
      scores: Object.fromEntries(rows.map((r) => [r.id, r.score ?? 0])),
      changed,
    });
  }
  const changed = new Set(seen.changed);
  useEffect(() => {
    if (seen.changed.length > 0) play('tally', { quiet: true });
  }, [seen, play]);
  if (rows.length === 0) return null;
  const top = rows[0]?.score ?? 0;
  const gameName =
    room.games.find((g) => g.id === room.selectedGameId)?.name ?? room.selectedGameId ?? '';
  // The phase id as a word in the device's language (the id itself in English, or when unknown).
  const phaseId = view?.phaseId ?? '';
  const phase = (t.phases as Readonly<Record<string, string>>)[phaseId] ?? phaseId;
  return (
    <div className={styles.bench} aria-label={t.playing.scoresSoFar}>
      <p className={styles.benchWhere}>
        {gameName} · {phase}
      </p>
      <ol className={styles.benchList}>
        {rows.map((p) => (
          <li
            key={p.id}
            className={`${styles.benchRow} ${top > 0 && p.score === top ? styles.benchLead : ''}`}
          >
            <Avatar avatarId={p.avatarId} size={24} />
            <span className={styles.benchName}>{p.name}</span>
            <span
              key={p.score}
              className={`${styles.benchScore} ${changed.has(p.id) ? styles.benchBump : ''}`}
            >
              {top > 0 && p.score === top ? '🏆 ' : ''}
              {p.score}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Playing({
  controller,
  room,
  me,
  view,
  audio,
  onGameReady,
}: PlayingProps): JSX.Element {
  const play = useCallback(
    (cue: SoundCue, opts?: PlayCueOptions) => audio?.play(cue, opts),
    [audio],
  );
  if (me.spectator || view?.me.role === 'spectator') {
    // A spectator's screen is the game screen for them: release the game-start hold (loop #22).
    return (
      <>
        <WaitingScreen title={t.spectator.title} hint={t.spectator.hint} mood="watch">
          {/* I-134 A: the game says what a waiting phone should see — here, the live call. */}
          {view?.spectator ? (
            <p className={styles.watchLine}>
              {serverText(view.spectator.line, getLang(), room.selectedGameId)}
            </p>
          ) : null}
          <Bench view={view} room={room} play={play} />
        </WaitingScreen>
        <Ready onReady={onGameReady} />
      </>
    );
  }
  // The socket is up; we are waiting for the first view push or the lazy chunk — say so.
  if (!view) return <DelayedWaiting title={t.connection.loadingGame} />;
  const module = room.selectedGameId ? clientGames[room.selectedGameId] : undefined;
  if (!module)
    return (
      <WaitingScreen
        title={t.playing.unknownGame(room.selectedGameId ?? '')}
        hint={t.playing.unknownHint}
        mood="wait"
      />
    );
  // S-005 A: a "phone only" room hands the phones the TV's moment for the phases the game names.
  const PhoneStage =
    room.phoneOnly && module.PhoneStage && module.phoneStagePhases?.includes(view.phaseId)
      ? module.PhoneStage
      : null;
  const GameController = module.Controller as unknown as (props: {
    view: PushedView<ControllerView>;
    me: { id: string; name: string; avatarId: string };
    send: (input: unknown) => void;
    skip?: () => void;
  }) => JSX.Element;
  return (
    <GameErrorBoundary key={view.gameId}>
      <Suspense fallback={<DelayedWaiting title={t.connection.loadingGame} />}>
        <PhoneOnlyProvider value={room.phoneOnly}>
          <SoundProvider
            play={play}
            clip={audio ? (src, opts) => audio.clip(src, opts) : undefined}
            hush={audio ? () => audio.hushClips() : undefined}
          >
            {PhoneStage ? (
              <PhoneStage view={view} />
            ) : (
              <GameController
                view={view}
                me={{ id: me.id, name: me.name, avatarId: me.avatarId }}
                send={controller.sendInput}
                skip={me.isVip ? () => controller.vip({ action: 'skip' }) : undefined}
              />
            )}
            <Ready onReady={onGameReady} />
          </SoundProvider>
        </PhoneOnlyProvider>
      </Suspense>
    </GameErrorBoundary>
  );
}
