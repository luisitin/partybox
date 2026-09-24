// Phone for Herd Mind: the ready-up, the question with its tiles (or a text box), the stage
// phases (PhoneStages.tsx) and the VIP's merge tool in typed mode — and over any of them, this
// phone's settings sheet, the curtain while someone else is in theirs, and the 3 · 2 · 1s.
// Dumb: `send` is the only way out and the server validates everything.
import { useState } from 'react';
import type { JSX } from 'react';
import { usePhoneOnly, useServerNow, useT, WaitingScreen } from '@partybox/game-sdk/ui';
import type { GameControllerProps, PushedView } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { HerdControllerView } from '../server/views';
import { MergeTool } from './MergeTool';
import { PhoneIntro } from './PhoneIntro';
import { PhoneHerd, PhoneScore } from './PhoneStages';
import { PhoneTiles } from './PhoneTiles';
import { PhoneTyped } from './PhoneTyped';
import { Countdown, HoldCurtain, OpenSettings, SettingsSheet } from './Settings';
import { STRINGS } from './strings';

type V = PushedView<HerdControllerView>;

function Screen({
  view,
  send,
  skip,
  phoneOnly,
}: {
  view: V;
  send: (i: Input) => void;
  skip?: () => void;
  phoneOnly: boolean;
}): JSX.Element {
  const L = useT(STRINGS);
  switch (view.phaseId) {
    case 'intro':
      return <PhoneIntro view={view} send={send} skip={skip} />;
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

export function Controller({
  view,
  send,
  skip,
}: GameControllerProps<HerdControllerView, Input>): JSX.Element {
  const L = useT(STRINGS);
  const phoneOnly = usePhoneOnly();
  const now = useServerNow(200);
  // This phone's menu: open at once on a tap (the server echoes `menuOpen`; a reload reopens it).
  const [open, setOpen] = useState(view.menuOpen);
  if (view.me.role === 'spectator')
    return (
      <WaitingScreen
        title={L('Watching this game')}
        hint={L('You can play in the next one.')}
        mood="watch"
      />
    );
  const menu = (next: boolean): void => {
    setOpen(next);
    send({ type: 'menu', open: next });
  };
  const offered = view.phaseId !== 'done';
  const others = view.holdBy
    .filter((id) => id !== view.me.id)
    .map((id) => view.players.find((p) => p.id === id)?.name ?? '?');
  const resuming = view.resumeAt !== null && now < view.resumeAt;
  const starting = view.startAt !== null && now < view.startAt;
  // The stage stands still under a sheet, a hold or a count: its beats resume where they stopped.
  const frozen = open || others.length > 0 || resuming || starting;
  const shown: V = frozen ? { ...view, paused: true } : view;
  return (
    <OpenSettings.Provider value={offered && !open ? () => menu(true) : null}>
      <Screen view={shown} send={send} skip={skip} phoneOnly={phoneOnly} />
      {open && offered ? (
        <SettingsSheet onClose={() => menu(false)} />
      ) : others.length > 0 ? (
        <HoldCurtain names={others} onOpen={() => menu(true)} />
      ) : resuming && view.resumeAt !== null ? (
        <Countdown until={view.resumeAt} line={L('Back to the game')} />
      ) : starting && view.startAt !== null ? (
        <Countdown until={view.startAt} line={L('Question 1 coming up')} />
      ) : null}
    </OpenSettings.Provider>
  );
}
