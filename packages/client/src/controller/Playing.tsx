// During a game: spectators wait; players get the game's lazy Controller component with
// `{ view, me, send }`. Unknown game ids (registry drift) show a plain message instead of crashing.
import { Suspense, useCallback, useEffect, useState } from 'react';
import type { JSX } from 'react';
import type { ControllerView, PlayerPublic, PushedView, RoomSnapshot } from '@partybox/shared';
import { SoundProvider, WaitingScreen } from '@partybox/game-sdk/ui';
import { clientGames } from '../games.generated';
import { t } from '../i18n';
import type { Controller } from '../net/controller';
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

export function Playing({
  controller,
  room,
  me,
  view,
  audio,
  onGameReady,
}: PlayingProps): JSX.Element {
  const play = useCallback((cue: SoundCue) => audio?.play(cue), [audio]);
  if (me.spectator || view?.me.role === 'spectator') {
    return <WaitingScreen title={t.spectator.title} hint={t.spectator.hint} mood="watch" />;
  }
  // The socket is up; we are waiting for the first view push or the lazy chunk — say so.
  if (!view) return <DelayedWaiting title={t.connection.loadingGame} />;
  const module = room.selectedGameId ? clientGames[room.selectedGameId] : undefined;
  if (!module)
    return (
      <WaitingScreen
        title={`Unknown game "${room.selectedGameId ?? ''}"`}
        hint="Run pnpm gen-registry and restart."
        mood="wait"
      />
    );
  const GameController = module.Controller as unknown as (props: {
    view: PushedView<ControllerView>;
    me: { id: string; name: string; avatarId: string };
    send: (input: unknown) => void;
  }) => JSX.Element;
  return (
    <GameErrorBoundary key={view.gameId}>
      <Suspense fallback={<DelayedWaiting title={t.connection.loadingGame} />}>
        <SoundProvider play={play}>
          <GameController
            view={view}
            me={{ id: me.id, name: me.name, avatarId: me.avatarId }}
            send={controller.sendInput}
          />
          <Ready onReady={onGameReady} />
        </SoundProvider>
      </Suspense>
    </GameErrorBoundary>
  );
}
