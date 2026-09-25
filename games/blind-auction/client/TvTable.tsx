// The round's table on the TV: the box's kicker on top, the box on the left, the panel on the right.
// box · the name, the flavour line and what it might hold, read aloud; bet · "Place your bets!",
// the odds and who has bet; open · the bets land on the contents they back (step 0), then the box
// turns, the content inside lights up and the winnings roll in (step 1). The same frame in all
// three, so the box holds its place (the phases cut into each other: `quickInto`).
import { useEffect, useRef } from 'react';
import type { JSX } from 'react';
import { Avatar, Confetti, Stage, useSequence, useSound, useT } from '@partybox/game-sdk/ui';
import type { PushedView, SoundCue } from '@partybox/game-sdk/ui';
import { BETS_LEAD_MS, BET_STEP_MS, OPEN_LINE_AT_MS } from '../server/timing';
import type { BlindAuctionTvView } from '../server/views';
import { COIN, iconOf, kindName, nameOf as optionName, payText, toneOf } from './copy';
import type { Tone } from './copy';
import { LiveStage } from './LiveStage';
import { LotCard } from './LotCard';
import { OptionBoard } from './Options';
import { STRINGS } from './strings';
import styles from './tv.module.css';
import { useLine, useReading } from './useVoice';

type View = PushedView<BlindAuctionTvView>;

const CUE: Record<Tone, SoundCue> = { good: 'jackpot', bad: 'bust', odd: 'sweep' };

function Kicker({ view }: { view: View }): JSX.Element {
  const L = useT(STRINGS);
  const box = view.box;
  if (box?.grand)
    return (
      <p className={`${styles.kicker} ${styles.grandKicker}`}>
        <span aria-hidden>★</span> {L('THE GRAND BOX · PAYS DOUBLE')} <span aria-hidden>★</span>
      </p>
    );
  return (
    <p className={styles.kicker}>
      {L('Box {n} of {total}', { n: box?.n ?? 1, total: box?.of ?? 1 })}
    </p>
  );
}

function BoxPanel({ view }: { view: View }): JSX.Element | null {
  const play = useSound();
  useEffect(() => play('card'), [play]);
  useReading(view.voice);
  if (!view.box) return null;
  return (
    <div className={styles.panel}>
      <h1 className={styles.plate}>{view.box.name}</h1>
      <p className={styles.flavour}>{view.box.flavour}</p>
      <OptionBoard options={view.box.options} />
    </div>
  );
}

function BetPanel({ view }: { view: View }): JSX.Element | null {
  const L = useT(STRINGS);
  const play = useSound();
  // "Pick up your phone", then the auctioneer's call over it.
  useEffect(() => play('phase'), [play]);
  useLine(view.clips.bets, true, 350);
  if (!view.box) return null;
  return (
    <div className={styles.panel}>
      <h1 className={styles.call}>{L('Place your bets!')}</h1>
      <OptionBoard options={view.box.options} />
      <p className={styles.count} aria-live="polite">
        <span className={styles.pips} aria-hidden>
          {Array.from({ length: view.bettors }, (_, i) => (
            <span key={i} className={`${styles.pip} ${i < view.betsIn ? styles.pipIn : ''}`}>
              {i < view.betsIn ? COIN : '·'}
            </span>
          ))}
        </span>
        {L('{n} of {total} bets in', { n: view.betsIn, total: view.bettors })}
      </p>
    </div>
  );
}

function OpenPanel({ view }: { view: View }): JSX.Element | null {
  const L = useT(STRINGS);
  const play = useSound();
  const bets = view.bets ?? [];
  const seq = useSequence([0, ...bets.map((_, i) => BETS_LEAD_MS + i * BET_STEP_MS)]);
  const opened = view.step === 1 && view.outcome !== null;
  const inside = opened && view.box ? view.box.options[view.outcome ?? 0] : undefined;
  const landed = useSequence(opened ? [0, OPEN_LINE_AT_MS] : [0]) >= 1 && opened;
  useLine(view.clips.closed, true);
  const kind = inside?.kind;
  useLine(kind ? view.clips[kind] : undefined, landed);
  useReading(landed ? view.voice : null);
  const cued = useRef(false);
  useEffect(() => {
    if (!landed || !kind || cued.current) return;
    cued.current = true;
    play(CUE[toneOf(kind)]);
  }, [landed, kind, play]);
  if (!view.box) return null;
  const winners = (view.results ?? []).filter((r) => r.delta >= 0);
  const losers = (view.results ?? []).filter((r) => r.delta < 0);
  const nameOf = (id: string): string => view.players.find((p) => p.id === id)?.name ?? '?';
  return (
    <div className={styles.panel}>
      {landed && kind ? (
        <p className={`${styles.insideLine} ${styles[toneOf(kind)]}`}>
          <span aria-hidden>{inside ? iconOf(inside) : ''}</span>{' '}
          {inside?.label
            ? L('{what} wins!', { what: optionName(L, inside) })
            : L("It's {what}!", { what: kindName(L, kind) })}
        </p>
      ) : (
        <p className={styles.soldHead}>
          {view.run
            ? view.run.kind === 'race'
              ? L('Bets are closed. And they’re off!')
              : view.run.kind === 'dice'
                ? L('Bets are closed. Roll the dice!')
                : L('Bets are closed. Spin the wheel!')
            : bets.length
              ? L('Bets are closed. What’s inside?')
              : L('Nobody bet. What’s inside?')}
        </p>
      )}
      <OptionBoard
        options={view.box.options}
        bets={bets}
        shown={Math.max(0, seq)}
        players={view.players}
        outcome={landed ? view.outcome : null}
      />
      {landed ? (
        <div className={styles.payouts} aria-live="polite">
          {winners.length ? (
            <p className={styles.winners}>
              {winners.map((w) => {
                const p = view.players.find((x) => x.id === w.id);
                return (
                  <span key={w.id} className={styles.winner}>
                    {p ? (
                      <span className={styles.winnerFace}>
                        <Avatar avatarId={p.avatarId} size="100%" />
                      </span>
                    ) : null}
                    {nameOf(w.id)} <b>+{w.delta}</b>
                  </span>
                );
              })}
            </p>
          ) : (
            <p className={styles.nobody}>{L('Nobody called it!')}</p>
          )}
          {losers.length ? (
            <p className={styles.losers}>{L('{n} lost their stake', { n: losers.length })}</p>
          ) : null}
        </div>
      ) : null}
      {landed && winners.length && inside && toneOf(inside.kind) !== 'bad' ? (
        <Confetti pieces={30} />
      ) : null}
    </div>
  );
}

export function TvTable({ view }: { view: View }): JSX.Element {
  const L = useT(STRINGS);
  const box = view.box;
  const phase = view.phaseId;
  const inside =
    view.step === 1 && box && view.outcome !== null ? box.options[view.outcome] : undefined;
  return (
    // The frame measures the stage the shell leaves (a 16-player strip takes four rows): the box
    // and the panel size to it (container units, zoom-safe), so nothing runs under the host bar.
    <div className={styles.frame}>
      <Stage className={styles.table}>
        <Kicker view={view} />
        <div className={styles.row}>
          <div
            className={`${styles.cardCol} ${inside && toneOf(inside.kind) === 'bad' ? styles.shake : ''}`}
          >
            {phase === 'open' && view.run && box ? (
              <LiveStage run={view.run} options={box.options} bets={view.bets?.length ?? 0} />
            ) : (
              <LotCard
                icon={box?.icon ?? '📦'}
                grand={box?.grand ?? false}
                flipped={Boolean(inside)}
                deal={phase === 'box'}
                face={
                  inside
                    ? {
                        icon: iconOf(inside),
                        kicker: optionName(L, inside),
                        big: payText(L, inside.pay),
                        tone: toneOf(inside.kind),
                      }
                    : null
                }
              />
            )}
          </div>
          {phase === 'box' ? <BoxPanel view={view} /> : null}
          {phase === 'bet' ? <BetPanel view={view} /> : null}
          {phase === 'open' ? <OpenPanel view={view} /> : null}
        </div>
      </Stage>
    </div>
  );
}
