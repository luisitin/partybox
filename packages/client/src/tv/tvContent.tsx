// What the TV stage shows for the room's status: the lobby, the picker, the game, or the results.
// Split out of TvApp (I-589 handed the game the host's skip and TvApp hit the 300-line cap).
import type { JSX } from 'react';
import type { PushedView, RoomSnapshot, TvView } from '@partybox/shared';
import type { MusicEngine } from '../music';
import type { TvClient, TvState } from '../net/tv';
import type { SoundEngine } from '../sound';
import { TvLobby } from './TvLobby';
import { TvPlaying } from './TvPlaying';
import { TvResults } from './TvResults';
import { TvSelecting } from './TvSelecting';
import { TvStartStage } from './TvStartStage';

export interface TvContentArgs {
  room: RoomSnapshot | null;
  view: PushedView<TvView> | null;
  lastView: PushedView<TvView> | null;
  toasts: TvState['toasts'];
  client: TvClient;
  audio: SoundEngine;
  music: MusicEngine;
  onGameReady: () => void;
}

export function tvContent(a: TvContentArgs): JSX.Element {
  const { room } = a;
  if (!room) return <TvLobby room={null} />;
  if (room.status === 'lobby')
    return (
      <TvLobby room={room} nudgeIds={a.toasts.flatMap((t) => (t.playerId ? [t.playerId] : []))} />
    );
  // ADR-053: between Start and the game, the start stage (rules, READY faces, 3·2·1)
  if (room.status === 'selecting' && room.starting)
    return <TvStartStage room={room} audio={a.audio} />;
  if (room.status === 'selecting') return <TvSelecting room={room} client={a.client} />;
  if (room.status === 'playing')
    return (
      <TvPlaying
        room={room}
        view={a.view}
        audio={a.audio}
        onGameReady={a.onGameReady}
        music={a.music}
        // I-589: the host bar's skip, for a game's own on-stage Next button
        onSkip={() => a.client.act({ action: 'skip' })}
      />
    );
  return <TvResults room={room} lastView={a.lastView} />;
}
