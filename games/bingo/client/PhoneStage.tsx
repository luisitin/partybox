// S-005 A: what the TV would show, on the phone — Bingo's check, for a room in "phone only"
// mode: "Priya says BINGO!", the claimed card turning over cell by cell (the phone's own Card with
// the claim's colouring, as the claimant's phone already shows a verdict), then the verdict.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { BigText, Screen } from '@partybox/game-sdk/ui';
import type { PushedView } from '@partybox/game-sdk/ui';
import type { BingoControllerView } from '../server/views';
import { Card } from './Card';
import { whyNot } from './copy';
import styles from './Controller.module.css';

const ANNOUNCE_MS = 900;
const STEP_MS = 140;

export function PhoneStage({
  view,
}: {
  view: PushedView<BingoControllerView>;
}): JSX.Element | null {
  const claim = view.claim;
  const [t, setT] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const h = setInterval(() => setT(Date.now() - start), 100);
    return () => clearInterval(h);
  }, [claim?.playerId, claim?.cardIndex]);
  if (!claim) return null;
  const order = [...claim.green, ...claim.red, ...claim.missing];
  const revealDone = t > ANNOUNCE_MS + order.length * STEP_MS + 400;
  const settled = view.verdictShown && revealDone;
  return (
    <Screen title={`${claim.name} says BINGO!`}>
      <p className="pb-muted">
        {view.patternLabel} · checking against {view.callIndex} calls
      </p>
      <div className={styles.phoneStageCard}>
        <Card
          numbers={claim.card}
          daubs={claim.daubs}
          green={claim.green}
          red={claim.red}
          missing={claim.missing}
          verdict
          reveal={t > ANNOUNCE_MS}
          revealOrder={order}
          revealStepMs={STEP_MS}
          restShown={revealDone}
          settled={settled}
          disabled
          size="phone"
        />
      </div>
      {settled ? (
        <div className="pb-enter">
          <BigText level="h1" tone="accent">
            NOT A BINGO
          </BigText>
          {whyNot(claim) ? <p className="pb-muted">{whyNot(claim)}</p> : null}
          <p className="pb-muted">Card wiped. Next number in a moment…</p>
        </div>
      ) : (
        <p className="pb-muted">checking…</p>
      )}
    </Screen>
  );
}
