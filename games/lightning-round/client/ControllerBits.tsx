// Small presentational pieces for the phone: the reveal outcome line and wager button labels.
import type { JSX } from 'react';
import type { WagerOption } from '../server/scoring';
import type { LightningControllerView } from '../server/views';

export function wagerLabel(option: WagerOption): string {
  if (option.percent === 0) return 'Nothing (0 points)';
  return `${option.percent} % · ${option.amount} points`;
}

function deltaText(delta: number): string {
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `−${-delta}`;
  return '+0';
}

export function Outcome({ view }: { view: LightningControllerView }): JSX.Element {
  const outcome = view.outcome;
  if (!outcome) return <p role="status">Look at the TV</p>;
  const points = deltaText(outcome.delta);
  const missed = view.myPickIndex === null ? 'No answer' : 'Wrong';
  if (view.round?.final) {
    return (
      <p role="status">
        {outcome.correct ? 'Correct!' : `${missed}.`} {points} · final score {view.myScore}
      </p>
    );
  }
  if (!outcome.correct) {
    return (
      <p role="status">
        {missed} · streak reset · {view.myScore} points
      </p>
    );
  }
  return (
    <p role="status">
      Correct! {points}
      {view.myStreak >= 2 ? ` · 🔥 streak ${view.myStreak}` : ''} · {view.myScore} points
    </p>
  );
}
