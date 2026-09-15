// Controller (phone) view for Lightning Round: a ChoiceGrid for the question (locked after one
// tap, ✓/✗ in reveal), a ChoiceGrid of wager options before the final, waiting screens otherwise.
import type { JSX } from 'react';
import { ChoiceGrid, WaitingScreen } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { LightningControllerView } from '../server/index';
import type { Input } from '../server/types';
import { Outcome, wagerLabel } from './ControllerBits';

function roundKicker(view: LightningControllerView): string {
  const round = view.round;
  const where =
    round === null
      ? ''
      : round.final
        ? 'Final question'
        : `Question ${round.number} of ${round.total}`;
  return view.question ? `${where} · ${view.question.categoryLabel}` : where;
}

export function Controller({
  view,
  send,
}: GameControllerProps<LightningControllerView, Input>): JSX.Element {
  const { phaseId } = view;
  if (view.me.role === 'spectator') {
    return <WaitingScreen title="Spectating" hint="You are in for the next game." mood="watch" />;
  }
  if (phaseId === 'intro') {
    return (
      <WaitingScreen
        title="Get ready!"
        hint="Four choices per question. Faster is worth more."
        mood="wait"
      />
    );
  }
  if ((phaseId === 'question' || phaseId === 'reveal') && view.question) {
    const revealed = phaseId === 'reveal';
    const locked = view.myPickIndex !== null;
    return (
      <ChoiceGrid
        kicker={roundKicker(view)}
        prompt={view.question.text}
        choices={view.question.choices.map((label, index) => ({ id: String(index), label }))}
        selectedId={locked ? String(view.myPickIndex) : null}
        correctId={revealed && view.correctIndex !== undefined ? String(view.correctIndex) : null}
        disabled={revealed}
        onPick={(id) => send({ type: 'pick', index: Number(id) })}
        footer={
          revealed ? <Outcome view={view} /> : locked ? <p role="status">Locked in ✓</p> : null
        }
      />
    );
  }
  if (phaseId === 'wager') {
    const options = view.wagerChoices ?? [];
    const placed = view.myWagerAmount;
    const selected = placed === undefined ? null : options.find((o) => o.amount === placed);
    return (
      <ChoiceGrid
        kicker="Final question next"
        prompt={
          view.myScore > 0
            ? `Wager part of your ${view.myScore} points`
            : 'No points yet — you can only wager 0'
        }
        choices={options.map((o) => ({ id: String(o.percent), label: wagerLabel(o) }))}
        selectedId={selected ? String(selected.percent) : null}
        onPick={(id) => {
          const option = options.find((o) => String(o.percent) === id);
          if (option) send({ type: 'wager', percent: option.percent });
        }}
        footer={
          placed === undefined ? (
            <p>Right answer: +wager. Wrong or no answer: −wager.</p>
          ) : (
            <p role="status">Wager locked: {placed} ✓</p>
          )
        }
      />
    );
  }
  if (phaseId === 'done') {
    return (
      <WaitingScreen
        title="Thanks for playing!"
        hint={
          view.myRank !== undefined
            ? `You finished #${view.myRank} with ${view.myScore} points.`
            : `${view.myScore} points.`
        }
        mood="done"
      />
    );
  }
  return <WaitingScreen title="Look at the TV" mood="watch" />;
}
