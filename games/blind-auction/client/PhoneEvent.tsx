// A live event, phone-sized: what the TV plays at `open` — the race, the dice, the wheel, the
// doors, the potato's burst, the rope, the cups. Used by PhoneStage (a room with no TV) and by the
// ordinary phone's reveal, so a phone never sits on "Watch the TV" while the event runs (Spy Grid's
// play-test: dead air in the hand).
import type { JSX } from 'react';
import type { PushedView } from '@partybox/game-sdk/ui';
import { betsMs } from '../server/timing';
import type { BlindAuctionControllerView } from '../server/views';
import liveStyles from './live.module.css';
import { Doors, LiveStage } from './LiveStage';
import { PotatoRing } from './Potato';
import { ShellStage } from './Shells';
import { TugRope } from './Tug';

export function PhoneEvent({
  view,
}: {
  view: PushedView<BlindAuctionControllerView>;
}): JSX.Element | null {
  const run = view.run;
  const box = view.box;
  if (!run || !box) return null;
  const bets = view.bets?.length ?? 0;
  return (
    <div className={liveStyles.phoneStage}>
      {run.kind === 'shells' && view.shells ? (
        <ShellStage
          start={view.shells.start}
          moves={view.shellSwaps}
          tier={view.shells.tier}
          reveal={run.outcome}
          revealAfter={betsMs(bets)}
          settled
        />
      ) : run.kind === 'tug' ? (
        <TugRope view={view} live={false} />
      ) : run.kind === 'potato' ? (
        <PotatoRing view={view} popped />
      ) : run.kind === 'doors' ? (
        <Doors opened={run.detail[0] ?? null} car={run.outcome} delay={betsMs(bets)} />
      ) : (
        <LiveStage run={run} options={box.options} bets={bets} />
      )}
    </div>
  );
}
