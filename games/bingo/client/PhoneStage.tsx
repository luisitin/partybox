// S-005 A: what the TV would show, on the phone — Bingo's check, for a room in "phone only"
// mode: "Priya says BINGO!", the claimed card turning over cell by cell (the phone's own Card with
// the claim's colouring, as the claimant's phone already shows a verdict), then the verdict.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { BigText, Screen, useT } from '@partybox/game-sdk/ui';
import type { PushedView } from '@partybox/game-sdk/ui';
import type { BingoControllerView } from '../server/views';
import { Card } from './Card';
import { wipeKind, botLine, whyNot } from './copy';
import { STRINGS } from './strings';
import styles from './Controller.module.css';

const ANNOUNCE_MS = 900;
const STEP_MS = 140;

export function PhoneStage({
  view,
}: {
  view: PushedView<BingoControllerView>;
}): JSX.Element | null {
  const claim = view.claim;
  const L = useT(STRINGS);
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
    <Screen title={L('{name} says BINGO!', { name: claim.name })}>
      <p className="pb-muted">
        {L.sent(view.patternLabel)} · {L('checking against {n} calls', { n: view.callIndex })}
      </p>
      <div className={styles.phoneStageCard}>
        <Card
          numbers={claim.card}
          daubs={claim.daubs}
          green={claim.green}
          red={claim.red}
          missing={claim.missing}
          verdict
          // The turn starts once the announcement has had its moment (as on the TV: the order is
          // handed over then). Not `reveal`: that is the card's arrival pop, and its animation
          // outranks the turn's — every square fell back to the viewer's daub pink (2026-09-23).
          revealOrder={t > ANNOUNCE_MS ? order : []}
          revealStepMs={STEP_MS}
          restShown={revealDone}
          settled={settled}
          disabled
          size="phone"
        />
      </div>
      {settled && view.phaseId === 'bingo' ? (
        // The owner (2026-09-21): a RIGHT claim shows on every phone too, not only a wrong one.
        <div className="pb-enter">
          <BigText level="h1" tone="accent">
            {L('BINGO!')}
          </BigText>
          <p className="pb-muted">
            {view.claimPoints === 1
              ? L('+1 point for {name}.', { name: claim.name })
              : L('+{n} points for {name}.', { n: view.claimPoints, name: claim.name })}
          </p>
          {/* I-138 B: a bot's win line, as on the TV. */}
          {botLine(claim, 'win', L) ? <p className="pb-muted">{botLine(claim, 'win', L)}</p> : null}
        </div>
      ) : settled ? (
        <div className="pb-enter">
          <BigText level="h1" tone="accent">
            {L('NOT A BINGO')}
          </BigText>
          {whyNot(claim, L) ? <p className="pb-muted">{whyNot(claim, L)}</p> : null}
          {/* I-138 A: the bot answers for itself, as on the TV. */}
          {botLine(claim, 'miss', L) ? <p>{botLine(claim, 'miss', L)}</p> : null}
          <p className="pb-muted">{claim && wipeKind(claim) !== 'card'
                  ? L('Wrong daubs wiped. Next number in a moment…')
                  : L('Card wiped. Next number in a moment…')}</p>
        </div>
      ) : (
        <p className="pb-muted">{L('checking…')}</p>
      )}
    </Screen>
  );
}
