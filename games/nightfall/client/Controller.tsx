// Phone view for Nightfall: one screen per phase (SPEC §10.9 "Phone"). A ghost gets the ghost screen
// in every phase after the TV announced their death; spectators wait for the next game.
import type { JSX } from 'react';
import { WaitingScreen, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { NightfallControllerView } from '../server/index';
import type { Input } from '../server/types';
import { GhostScreen } from './PhoneBits';
import { DayPhone } from './PhoneDay';
import { NightPhone, RolesPhone } from './PhoneNight';
import { HunterPhone, LastWordsPhone, VotePhone } from './PhoneVote';
import { DawnPhone, EndPhone, VerdictPhone } from './PhoneWatch';
import { STRINGS } from './strings';

export function Controller({
  view,
  send,
}: GameControllerProps<NightfallControllerView, Input>): JSX.Element {
  const L = useT(STRINGS);
  if (view.me.role !== 'player')
    return <WaitingScreen title={L("You're in as soon as this one ends")} mood="watch" />;
  const phase = view.phaseId;
  if (phase === 'end' || phase === 'done') return <EndPhone view={view} />;
  if (phase === 'roles') return <RolesPhone view={view} send={send} />;
  // Your own death is told on the dawn / verdict screens first, then you are a ghost.
  if (phase === 'dawn') return <DawnPhone view={view} />;
  if (phase === 'verdict') return <VerdictPhone view={view} />;
  if (phase === 'hunter') return <HunterPhone view={view} send={send} />;
  if (phase === 'last-words') return <LastWordsPhone view={view} send={send} />;
  if (view.ghost) return <GhostScreen view={view} />;
  if (phase === 'night') return <NightPhone view={view} send={send} />;
  if (phase === 'day') return <DayPhone view={view} send={send} />;
  if (phase === 'vote' || phase === 'runoff') return <VotePhone view={view} send={send} />;
  return <GhostScreen view={view} />;
}
