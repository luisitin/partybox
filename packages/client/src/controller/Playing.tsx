// During a game: spectators wait; players get the game's lazy Controller component with
// `{ view, me, send }`. Unknown game ids (registry drift) show a plain message instead of crashing.
import { Suspense } from 'react';
import type { JSX } from 'react';
import type { ControllerView, PlayerPublic, PushedView, RoomSnapshot } from '@partybox/shared';
import { WaitingScreen } from '@partybox/game-sdk/ui';
import { clientGames } from '../games.generated';
import { t } from '../i18n';
import type { Controller } from '../net/controller';
import { GameErrorBoundary } from './GameErrorBoundary';

export interface PlayingProps {
  controller: Controller;
  room: RoomSnapshot;
  me: PlayerPublic;
  view: PushedView<ControllerView> | null;
}

export function Playing({ controller, room, me, view }: PlayingProps): JSX.Element {
  if (me.spectator || view?.me.role === 'spectator') {
    return <WaitingScreen title={t.spectator.title} hint={t.spectator.hint} mood="watch" />;
  }
  // The socket is up; we are waiting for the first view push or the lazy chunk — say so.
  if (!view) return <WaitingScreen title={t.connection.loadingGame} mood="wait" />;
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
      <Suspense fallback={<WaitingScreen title={t.connection.loadingGame} mood="wait" />}>
        <GameController
          view={view}
          me={{ id: me.id, name: me.name, avatarId: me.avatarId }}
          send={controller.sendInput}
        />
      </Suspense>
    </GameErrorBoundary>
  );
}
