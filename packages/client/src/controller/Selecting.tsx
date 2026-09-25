// Game selection (game pack Part 00 §1.3–1.5). Nothing chosen: the game list — the VIP chooses,
// everyone else reads and suggests. A game chosen: the VIP's settings screen with Start, and for
// everyone else what was picked and how it plays. The pieces live in ./picker/.
import type { JSX } from 'react';
import type { PlayerPublic, RoomSnapshot } from '@partybox/shared';
import { useLang } from '@partybox/game-sdk/ui';
import type { Controller } from '../net/controller';
import { ChosenGame } from './picker/ChosenGame';
import { GuestChosen } from './picker/GuestChosen';
import { PickerList } from './picker/PickerList';

export interface SelectingProps {
  controller: Controller;
  room: RoomSnapshot;
  me: PlayerPublic;
}

export function Selecting({ controller, room, me }: SelectingProps): JSX.Element {
  const lang = useLang();
  if (room.selectedGameId)
    return me.isVip ? (
      <ChosenGame controller={controller} room={room} me={me} />
    ) : (
      <GuestChosen room={room} />
    );
  return <PickerList controller={controller} room={room} me={me} lang={lang} />;
}
