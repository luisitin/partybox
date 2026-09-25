// Controller (phone) view for Fake-Out: lie, pick, and a calm "watch the TV" everywhere else.
// `send` is the only way out; the server validates with inputSchema before reduce sees it.
import type { JSX } from 'react';
import { WaitingScreen, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { FakeOutControllerView } from '../server/index';
import type { Input } from '../server/types';
import { PhoneLie } from './PhoneLie';
import { PhonePick } from './PhonePick';
import { PhoneQuestion, PhoneReveal, PhoneScores } from './PhoneScreens';
import { STRINGS } from './strings';

type Props = GameControllerProps<FakeOutControllerView, Input>;

export function Controller(props: Props): JSX.Element {
  const L = useT(STRINGS);
  const { view } = props;
  if (view.me.role !== 'player')
    return (
      <WaitingScreen
        mood="watch"
        title={L('Watching this one')}
        hint={L("You're in as soon as this game ends.")}
      />
    );
  switch (view.phaseId) {
    case 'question':
      return <PhoneQuestion {...props} />;
    case 'lie':
      return <PhoneLie key={`lie${view.n}`} {...props} />;
    case 'pick':
      return <PhonePick key={`pick${view.n}`} {...props} />;
    case 'reveal':
      return <PhoneReveal {...props} />;
    case 'scores':
    case 'done':
      return <PhoneScores {...props} />;
    default:
      return <WaitingScreen title={L('One moment…')} />;
  }
}
