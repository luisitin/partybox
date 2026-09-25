// Echo's phone: one screen per role and phase. Dumb: renders the view, sends inputs.
import type { JSX } from 'react';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { EchoControllerView } from '../server/views';
import { PhoneCheck } from './PhoneCheck';
import { PhoneClue } from './PhoneClue';
import { PhoneGuess } from './PhoneGuess';
import { PhoneResult } from './PhoneResult';
import { PhoneGuesserWait, PhoneIntro, PhoneWatcher } from './PhoneWait';

export function Controller(props: GameControllerProps<EchoControllerView, Input>): JSX.Element {
  const { view } = props;
  const phase = view.phaseId;
  if (phase === 'intro') return <PhoneIntro {...props} />;
  if (view.role === 'watcher' && phase !== 'guess' && phase !== 'result')
    return <PhoneWatcher view={view} />;
  switch (phase) {
    case 'clue':
      // Keyed by the word: a swap starts the boxes over.
      return view.role === 'giver' && view.secret ? (
        <PhoneClue key={view.secret.id} {...props} />
      ) : (
        <PhoneGuesserWait view={view} />
      );
    case 'check':
      return view.role === 'giver' ? (
        <PhoneCheck key={view.tv.phaseAt} {...props} />
      ) : (
        <PhoneGuesserWait view={view} />
      );
    case 'guess':
      return <PhoneGuess key={view.tv.phaseAt} {...props} />;
    case 'result':
      return <PhoneResult key={view.tv.phaseAt} {...props} />;
    default:
      return <PhoneWatcher view={view} />;
  }
}
