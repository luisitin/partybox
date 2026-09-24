// PhoneStage (S-005, P00 §3.6): what the TV shows, on a phone that has no TV — the intro, the
// ladder and stamp, the flip. Same beats as the TV (timing.ts), same readings and fixed lines, and
// the player's own line once the moment has landed.
import type { JSX } from 'react';
import { Avatar, Screen, useSequence, useT } from '@partybox/game-sdk/ui';
import type { PushedView } from '@partybox/game-sdk/ui';
import { FLIP_LINE_AT_MS, LADDER_LEAD_MS, ladderStepMs } from '../server/timing';
import type { BlindAuctionControllerView } from '../server/views';
import { COIN, ICON, effectHeadline, hintText, kickerWord, toneOf } from './copy';
import { LotCard } from './LotCard';
import { HowTo } from './PhoneLot';
import { OwnLineCard } from './PhoneResult';
import styles from './phone.module.css';
import { STRINGS } from './strings';
import { useLine, useReading } from './useVoice';

type View = PushedView<BlindAuctionControllerView>;

function StageSold({ view }: { view: View }): JSX.Element {
  const L = useT(STRINGS);
  const sale = view.sale;
  const rungs = (sale?.ladder ?? []).slice(-6);
  const hidden = (sale?.ladder.length ?? 0) - rungs.length;
  const step = ladderStepMs(sale?.ladder.length ?? 0);
  const seq = useSequence(
    view.live ? [0] : [0, ...rungs.map((_, i) => LADDER_LEAD_MS + (hidden + i) * step)],
  );
  const shown = view.live ? rungs.length : Math.max(0, seq);
  const stamped = view.step === 1;
  const winner = view.players.find((p) => p.id === sale?.winner);
  useLine(view.clips.closed, !view.live);
  useReading(stamped ? view.voice : null);
  useLine(view.clips.sold, stamped && Boolean(winner) && !view.voice, 120);
  useLine(view.clips.none, stamped && !winner, 120);
  return (
    <Screen className={styles.screen}>
      <div className={styles.stageTop}>
        {view.lot ? (
          <LotCard
            icon={view.lot.icon}
            grand={view.lot.grand}
            face={null}
            flipped={false}
            size="phone"
          />
        ) : null}
        <ol className={styles.miniLadder}>
          {rungs.slice(0, shown).map((r) => {
            const p = view.players.find((x) => x.id === r.id);
            return (
              <li
                key={r.id}
                className={`${styles.miniRung} ${stamped && r.id === sale?.winner ? styles.miniWon : ''}`}
              >
                {p ? <Avatar avatarId={p.avatarId} size={24} /> : null}
                <span className={styles.miniName}>{p?.name ?? '?'}</span>
                <span className={styles.miniAmount}>
                  {COIN} {r.amount}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      {stamped ? (
        <p className={styles.stageSold}>
          {winner
            ? L('SOLD to {name} for {coin} {n}!', {
                name: winner.name,
                coin: COIN,
                n: sale?.price ?? 0,
              })
            : L('No takers!')}
        </p>
      ) : sale?.tie && shown >= rungs.length ? (
        <p className={styles.stageTie}>{L('Tie: fewer coins wins')}</p>
      ) : null}
      {stamped && view.line ? (
        <OwnLineCard line={view.line} coins={view.coins} from={view.coins} />
      ) : null}
    </Screen>
  );
}

function StageFlip({ view }: { view: View }): JSX.Element {
  const L = useT(STRINGS);
  const beat = useSequence([0, FLIP_LINE_AT_MS]);
  const e = view.effect;
  const o = view.outcome;
  const winner = view.players.find((p) => p.id === view.sale?.winner);
  const other = view.players.find((p) => p.id === e?.other);
  useLine(Object.values(view.clips)[0], beat >= 1);
  useReading(view.voice);
  const kind = e && e.kind !== 'none' ? e.kind : (o?.type ?? 'dud');
  const face =
    o && view.lot
      ? {
          icon: ICON[o.type],
          kicker: kickerWord(L, kind),
          big:
            e && e.kind !== 'none' && e.kind !== 'dud' && e.kind !== 'swap'
              ? `${e.kind === 'lose' ? '−' : '+'}${e.amount}`
              : hintText(L, o),
          tone: toneOf(o.type),
        }
      : null;
  return (
    <Screen className={styles.screen}>
      <div className={styles.stageTop}>
        {view.lot ? (
          <LotCard icon={view.lot.icon} grand={view.lot.grand} face={face} flipped size="phone" />
        ) : null}
        {beat >= 1 && e ? (
          <p className={styles.stageHeadline}>
            {effectHeadline(L, e, winner?.name ?? '?', other?.name ?? '?')}
          </p>
        ) : null}
      </div>
      {view.step === 1 && view.line ? (
        <OwnLineCard line={view.line} coins={view.coins} from={view.coins} />
      ) : null}
    </Screen>
  );
}

export function PhoneStage({ view }: { view: View }): JSX.Element | null {
  switch (view.phaseId) {
    case 'intro':
      return <HowTo view={view} />;
    case 'sold':
      return <StageSold key={view.lot?.n ?? 0} view={view} />;
    case 'flip':
      return <StageFlip key={view.lot?.n ?? 0} view={view} />;
    default:
      return null;
  }
}
