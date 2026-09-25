// PhoneStage (S-005, P00 §3.6): what the TV shows, on a phone that has no TV — the rules and the
// reveal: the bets on the table, the box turning, what was inside, your own line. Same beats as
// the TV (timing.ts), same readings and fixed lines.
import type { JSX } from 'react';
import { Screen, useSequence, useT } from '@partybox/game-sdk/ui';
import type { PushedView } from '@partybox/game-sdk/ui';
import { BETS_LEAD_MS, BET_STEP_MS, OPEN_LINE_AT_MS } from '../server/timing';
import type { BlindAuctionControllerView } from '../server/views';
import { KIND_ICON, kindName, payText, toneOf } from './copy';
import { LotCard } from './LotCard';
import { OptionBoard } from './Options';
import { LotTitle, PhoneRules } from './PhoneLot';
import { OwnLineCard, insideWords } from './PhoneResult';
import styles from './phone.module.css';
import { STRINGS } from './strings';
import { useLine, useReading } from './useVoice';

type View = PushedView<BlindAuctionControllerView>;

function StageOpen({ view }: { view: View }): JSX.Element | null {
  const L = useT(STRINGS);
  const bets = view.bets ?? [];
  const seq = useSequence([0, ...bets.map((_, i) => BETS_LEAD_MS + i * BET_STEP_MS)]);
  const opened = view.step === 1 && view.outcome !== null;
  const landed = useSequence(opened ? [0, OPEN_LINE_AT_MS] : [0]) >= 1 && opened;
  const inside = opened && view.box ? view.box.options[view.outcome ?? 0] : undefined;
  useLine(view.clips.closed, true);
  useLine(inside ? view.clips[inside.kind] : undefined, landed);
  useReading(landed ? view.voice : null);
  if (!view.box) return null;
  return (
    <Screen className={styles.screen}>
      <LotTitle box={view.box} />
      <div className={styles.stageTop}>
        <LotCard
          icon={view.box.icon}
          grand={view.box.grand}
          flipped={Boolean(inside)}
          size="phone"
          face={
            inside
              ? {
                  icon: KIND_ICON[inside.kind],
                  kicker: kindName(L, inside.kind),
                  big: payText(L, inside.pay),
                  tone: toneOf(inside.kind),
                }
              : null
          }
        />
      </div>
      <OptionBoard
        options={view.box.options}
        size="phone"
        bets={bets}
        shown={Math.max(0, seq)}
        players={view.players}
        outcome={landed ? view.outcome : null}
      />
      {landed && view.line ? (
        <OwnLineCard
          line={view.line}
          inside={insideWords(L, view)}
          coins={view.coins}
          from={view.coins}
        />
      ) : null}
    </Screen>
  );
}

export function PhoneStage({ view }: { view: View }): JSX.Element | null {
  switch (view.phaseId) {
    case 'rules':
      return <PhoneRules view={view} />;
    case 'open':
      return <StageOpen key={view.box?.n ?? 0} view={view} />;
    default:
      return null;
  }
}
