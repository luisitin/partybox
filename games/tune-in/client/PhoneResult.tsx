// The phone after the TV's points beat (never before it, P00 §7.3): the player's own result, big —
// "+4 · Bullseye! You were 2 away", the psychic's average, the caller's verdict — then, in
// `scores`, the running total and the VIP's Next round / See results.
import type { JSX } from 'react';
import { PrimaryButton, Screen, WaitingScreen, usePhoneOnly, useT } from '@partybox/game-sdk/ui';
import type { Translator } from '@partybox/game-sdk/ui';
import type { TuneControllerView } from '../server/index';
import { ratingText, roundLine, teamName, verdictText } from './copy';
import styles from './phone.module.css';
import { STRINGS } from './strings';

function band(L: Translator, pts: number): string {
  if (pts === 4) return L('Bullseye!');
  return pts > 0 ? L('Close!') : L('Missed it.');
}

/** One big number and the sentence under it. */
function lines(L: Translator, view: TuneControllerView): { big: string; line: string } {
  const reveal = view.reveal;
  const mine = view.mine;
  if (!reveal || reveal.void)
    return { big: '📺', line: L('No signal — nobody scores this round.') };
  const isPsychic = view.me.id === view.turn.psychic;
  if (isPsychic && mine) {
    if (mine.psychic) {
      const { sum, n, perfect } = mine.psychic;
      if (n === 0) return { big: '0', line: L('Nobody dialled — 0 this time.') };
      const avg = String(Math.round((sum / n) * 100) / 100);
      const line = L('Your guessers averaged {avg} → +{pts}', { avg, pts: mine.pts });
      return { big: `+${mine.pts}`, line: perfect ? `${line} · ${L('Perfect tune!')}` : line };
    }
    return {
      big: `+${mine.pts}`,
      line:
        view.turn.mode === 'coop'
          ? L('The group needle scored +{pts}', { pts: mine.pts })
          : L("Your team's needle scored +{pts}", { pts: mine.pts }),
    };
  }
  if (mine && mine.away !== null) {
    const away = L('You were {n} away', { n: mine.away });
    if (view.turn.mode === 'solo')
      return { big: mine.pts > 0 ? `+${mine.pts}` : '0', line: `${band(L, mine.pts)} ${away}` };
    return { big: `+${mine.pts}`, line: `${verdictText(L, reveal.verdict)} ${away}` };
  }
  const calls = reveal.revealCalls;
  if (view.turn.mode === 'teams' && view.myTeam !== view.turn.team && calls) {
    if (!calls.side) return { big: '0', line: L('No call this time.') };
    const side = calls.side === 'left' ? L('LEFT') : L('RIGHT');
    return calls.scored
      ? { big: '+1', line: L('Your team called {side} — right!', { side }) }
      : { big: '0', line: L('Your team called {side} — not this time.', { side }) };
  }
  return { big: '·', line: L("You didn't dial this time.") };
}

export function WatchTv(): JSX.Element {
  const L = useT(STRINGS);
  const phoneOnly = usePhoneOnly();
  return (
    <WaitingScreen
      mood="watch"
      title={phoneOnly ? L('Here it comes…') : L('👀 Watch the TV')}
      hint={L('The target is opening up.')}
    />
  );
}

export function PhoneResult({
  view,
  skip,
}: {
  view: TuneControllerView;
  skip?: () => void;
}): JSX.Element {
  const L = useT(STRINGS);
  const { big, line } = lines(L, view);
  const scores = view.phaseId === 'scores';
  const me = view.players.find((p) => p.id === view.me.id);
  const total =
    view.turn.mode === 'teams' && view.myTeam
      ? L('{team}: {n} of {goal}', {
          team: teamName(L, view.myTeam),
          n: view.team[view.myTeam],
          goal: view.winAt,
        })
      : view.turn.mode === 'coop' && view.coop
        ? `${L('Group {total} / {max}', { total: view.coop.total, max: view.coop.max })} · ${ratingText(L, view.coop.rating)}`
        : L('Your total: {n}', { n: me?.score ?? 0 });
  return (
    <Screen
      className={styles.screen}
      footer={
        scores && skip ? (
          <PrimaryButton onClick={skip}>
            {view.last ? L('See results') : L('Next round')}
          </PrimaryButton>
        ) : undefined
      }
    >
      <p className={styles.kicker}>{roundLine(L, view.turn)}</p>
      <div className={styles.result} role="status">
        <span key={big} className={styles.big}>
          {big}
        </span>
        <span className={styles.resultLine}>{line}</span>
      </div>
      {scores ? <p className={styles.total}>{total}</p> : null}
    </Screen>
  );
}
