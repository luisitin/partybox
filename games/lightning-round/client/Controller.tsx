// Controller (phone) view for Lightning Round: a ChoiceGrid for the question (locked after one
// tap, ✓/✗ in reveal), a ChoiceGrid of wager options before the final, waiting screens otherwise.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { ChoiceGrid, WaitingScreen, buzz, useHold, useSecondsLeft } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { LightningControllerView } from '../server/index';
import type { Input } from '../server/types';
import { Outcome, Stake, wagerLabel } from './ControllerBits';
import styles from './Controller.module.css';
import { FINAL_REVEAL_HOLD_MS, REVEAL_BEAT_MS } from './timing';

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
  // The streak carried into the question: `myStreak` is already reset in the reveal view.
  const [streakBefore, setStreakBefore] = useState(0);
  // Speed is the point: remember the header's seconds-left at the tap so the locked line can say
  // how fast the pick was (same rounded number the shell prints, so hint and header agree).
  const secondsLeft = useSecondsLeft(view.deadline, view.paused);
  const [lockedAt, setLockedAt] = useState<{ questionId: string; seconds: number } | null>(null);
  if (phaseId === 'question' && streakBefore !== view.myStreak) setStreakBefore(view.myStreak);
  // The phone never spoils the TV: ✓/✗ and the outcome card wait for the TV's reveal beat.
  // `deadline` is unique per phase entry, so it keys the hold. The final reveal waits for the
  // TV's verdict beat (not collapsed under reduced motion: the TV is another device).
  const isFinal = view.round?.final === true;
  const shown = useHold(view.deadline, isFinal ? FINAL_REVEAL_HOLD_MS : REVEAL_BEAT_MS);
  // Haptic verdict (Android; iOS ignores it): once per reveal, alongside the card.
  const correct = view.outcome?.correct;
  useEffect(() => {
    if (phaseId !== 'reveal' || !shown || correct === undefined) return;
    buzz(correct ? [30, 40, 30] : 120);
  }, [phaseId, shown, correct]);
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
    const finalQ = view.round?.final === true;
    // A missing wager counts as 0 (server/phases/wager.ts); the key is only present once tapped.
    const stake = finalQ && phaseId === 'question' ? (view.myWagerAmount ?? 0) : null;
    // Comparing the id at render is the reset; a reconnect after picking gets the default line.
    const spare = locked && lockedAt?.questionId === view.question.id ? lockedAt.seconds : null;
    const lockedHint =
      spare === null
        ? undefined
        : spare <= 3
          ? '✓ Just made it — look at the TV'
          : `✓ Locked in with ${spare} s to spare — look at the TV`;
    const questionId = view.question.id;
    return (
      <ChoiceGrid
        fill
        promptKey={`${phaseId}:${view.round?.number ?? 0}`}
        tone={finalQ ? 'final' : undefined}
        kicker={roundKicker(view)}
        prompt={view.question.text}
        choices={view.question.choices.map((label, index) => ({ id: String(index), label }))}
        selectedId={locked ? String(view.myPickIndex) : null}
        correctId={
          revealed && shown && view.correctIndex !== undefined ? String(view.correctIndex) : null
        }
        disabled={revealed}
        lockedHint={lockedHint}
        onPick={(id) => {
          if (secondsLeft !== null) setLockedAt({ questionId, seconds: secondsLeft });
          send({ type: 'pick', index: Number(id) });
        }}
        footer={
          revealed && shown ? (
            <Outcome view={view} streakBefore={streakBefore} spare={spare} />
          ) : revealed && finalQ ? (
            <div className={styles.stake} role="status">
              🎲 The bets are in — look at the TV
            </div>
          ) : stake !== null ? (
            <Stake amount={stake} />
          ) : null
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
        fill
        letters={false}
        tone="final"
        promptKey="wager"
        kicker="Final question next"
        prompt={
          <>
            {view.myScore > 0
              ? `Wager part of your ${view.myScore} points`
              : 'No points yet — you can only wager 0'}
            <span className={styles.rule}>Right answer: +wager. Wrong or no answer: −wager.</span>
          </>
        }
        choices={options.map((o) => ({
          id: String(o.percent),
          label: wagerLabel(o, view.myScore),
        }))}
        selectedId={selected ? String(selected.percent) : null}
        onPick={(id) => {
          const option = options.find((o) => String(o.percent) === id);
          if (option) send({ type: 'wager', percent: option.percent });
        }}
        footer={null}
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
