// Phone for Herd Mind: the question with its tiles (or a text box) while people answer, then the
// stage phases (PhoneStages.tsx), and the VIP's merge tool in typed mode. Dumb: `send` is the only
// way out and the server validates everything.
import type { JSX } from 'react';
import { usePhoneOnly, useT, WaitingScreen } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { HerdControllerView } from '../server/views';
import { MergeTool } from './MergeTool';
import { PhoneHerd, PhoneIntro, PhoneScore } from './PhoneStages';
import { PhoneTiles } from './PhoneTiles';
import { PhoneTyped } from './PhoneTyped';
import { STRINGS } from './strings';

export function Controller({
  view,
  send,
  skip,
}: GameControllerProps<HerdControllerView, Input>): JSX.Element {
  const L = useT(STRINGS);
  const phoneOnly = usePhoneOnly();
  if (view.me.role === 'spectator')
    return (
      <WaitingScreen
        title={L('Watching this game')}
        hint={L('You can play in the next one.')}
        mood="watch"
      />
    );
  switch (view.phaseId) {
    case 'intro':
      return <PhoneIntro view={view} skip={skip} />;
    case 'answer':
      return view.mode === 'typed' ? (
        <PhoneTyped view={view} send={send} />
      ) : (
        <PhoneTiles view={view} send={send} />
      );
    case 'herd':
      if (view.mode === 'typed' && skip && (view.groups?.length ?? 0) >= 2)
        return <MergeTool view={view} send={send} skip={skip} />;
      return <PhoneHerd view={view} skip={skip} phoneOnly={phoneOnly} />;
    case 'score':
      return <PhoneScore view={view} skip={skip} phoneOnly={phoneOnly} />;
    default:
      return <WaitingScreen title={L('Thanks for playing!')} mood="done" />;
  }
}
