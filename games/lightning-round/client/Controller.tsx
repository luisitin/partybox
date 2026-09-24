// Controller (phone) view for Lightning Round: a ChoiceGrid for the question (locked after one
// tap, ✓/✗ in reveal), a ChoiceGrid of wager options before the final, waiting screens otherwise.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import {
  ChoiceGrid,
  WaitingScreen,
  buzz,
  useHold,
  useSecondsLeft,
  useT,
} from '@partybox/game-sdk/ui';
import type { GameControllerProps, Translator } from '@partybox/game-sdk/ui';
import type { LightningControllerView } from '../server/index';
import type { Input } from '../server/types';
import { Outcome, RoomRows, Stake, wagerLabel } from './ControllerBits';
import { CustomStake } from './CustomStake';
import styles from './Controller.module.css';
import { pointsText, roundLabel } from './labels';
import { STRINGS } from './strings';
import { FINAL_REVEAL_HOLD_MS, REVEAL_BEAT_MS } from './timing';

function roundKicker(view: LightningControllerView, L: Translator): string {
  const where = roundLabel(view.round, L);
  return view.question ? `${where} · ${L.sent(view.question.subcategoryLabel)}` : where;
}

/** The line under the answers once locked in: how fast the pick was, and where to look. */
function lockedLine(spare: number, phoneOnly: boolean, L: Translator): string {
  if (spare <= 3) return phoneOnly ? L('✓ Just made it') : L('✓ Just made it — look at the TV');
  return phoneOnly
    ? L('✓ Locked in with {seconds} s to spare', { seconds: spare })
    : L('✓ Locked in with {seconds} s to spare — look at the TV', { seconds: spare });
}

export function Controller({
  view,
  send,
}: GameControllerProps<LightningControllerView, Input>): JSX.Element {
  const L = useT(STRINGS);
  const { phaseId } = view;
  // The streak carried into the question: `myStreak` is already reset in the reveal view.
  const [streakBefore, setStreakBefore] = useState(0);
  // I-026: the custom stake this phone sent, until the server echoes it (reset per game).
  const [customSent, setCustomSent] = useState<number | null>(null);
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
    return (
      <WaitingScreen
        title={L('Spectating')}
        hint={L('You are in for the next game.')}
        mood="watch"
      />
    );
  }
  if (phaseId === 'intro') {
    return (
      <WaitingScreen
        title={L('Get ready!')}
        hint={L('Four choices per question. Faster is worth more.')}
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
    const lockedHint = spare === null ? undefined : lockedLine(spare, view.phoneOnly === true, L);
    const questionId = view.question.id;
    return (
      // A new question rises as a new screen; question → reveal keeps the same node.
      <ChoiceGrid
        key={`q${view.round?.number ?? 0}`}
        fill
        promptKey={`${phaseId}:${view.round?.number ?? 0}`}
        tone={finalQ ? 'final' : undefined}
        kicker={
          finalQ && stake !== null && stake > 0
            ? `${roundKicker(view, L)} · ${L('you bet {stake}', { stake })}`
            : roundKicker(view, L)
        } /* I-039 C */
        prompt={view.question.text}
        choices={view.question.choices.map((label, index) => ({ id: String(index), label }))}
        selectedId={locked ? String(view.myPickIndex) : null}
        correctId={
          revealed && shown && view.correctIndex !== undefined ? String(view.correctIndex) : null
        }
        disabled={revealed}
        lockedHint={lockedHint}
        // A "phone only" room: the TV's rows, on the phone under the answers (the owner).
        after={
          revealed && shown && view.phoneOnly && view.rows ? <RoomRows rows={view.rows} /> : null
        }
        onPick={(id) => {
          if (secondsLeft !== null) setLockedAt({ questionId, seconds: secondsLeft });
          send({ type: 'pick', index: Number(id) });
        }}
        footer={
          revealed && shown ? (
            <Outcome view={view} streakBefore={streakBefore} spare={spare} />
          ) : revealed && finalQ ? (
            <div className={styles.stake} role="status">
              🎲 {view.phoneOnly ? L('The bets are in…') : L('The bets are in — look at the TV')}
            </div>
          ) : stake !== null ? (
            <Stake amount={stake} live={!locked} />
          ) : null
        }
      />
    );
  }
  if (phaseId === 'wager') {
    const options = view.wagerChoices ?? [];
    const placed = view.myWagerAmount;
    const selected =
      placed === undefined ? null : (options.find((o) => o.amount === placed) ?? null);
    // I-026 (the owner): a stake that is no preset is the custom row's — the server's echo, or
    // the tap just sent until it lands (a custom stake that equals a preset is that preset's).
    const customPlaced = placed !== undefined ? (selected ? null : placed) : customSent;
    const potAmount = selected ? selected.amount : customPlaced;
    return (
      <ChoiceGrid
        key="wager"
        fill
        letters={false}
        tone="final"
        promptKey="wager"
        kicker={L('Final question next')}
        prompt={
          <>
            {/* I-026 B: once placed, the prompt is the pot. */}
            {potAmount !== null ? (
              <span key="pot" className={`${styles.pot} pb-pop`}>
                {L('{amount} in the pot', { amount: potAmount })}
              </span>
            ) : view.myScore > 0 ? (
              L('Wager part of your {points}', { points: pointsText(view.myScore, L) })
            ) : (
              L('No points yet — you can only wager 0')
            )}
            <span className={styles.rule}>
              {L('Right answer: +wager. Wrong or no answer: −wager.')}
            </span>
          </>
        }
        choices={options.map((o) => ({
          id: String(o.percent),
          label: wagerLabel(o, view.myScore, L),
        }))}
        selectedId={selected ? String(selected.percent) : null}
        disabled={customPlaced !== null}
        onPick={(id) => {
          const option = options.find((o) => String(o.percent) === id);
          if (option) send({ type: 'wager', percent: option.percent });
        }}
        footer={
          view.myScore > 0 ? (
            <CustomStake
              score={view.myScore}
              placed={customPlaced}
              disabled={selected !== null}
              onPlace={(amount) => {
                setCustomSent(amount);
                buzz(15);
                send({ type: 'wager', amount });
              }}
            />
          ) : null
        }
        // I-248: all five presets above Custom — "All in" never below the fold
        className={`${styles.wagerScreen} ${potAmount !== null ? styles.placed : ''}`}
      />
    );
  }
  if (phaseId === 'done') {
    return (
      <WaitingScreen
        title={L('Thanks for playing!')}
        hint={
          view.myRank !== undefined
            ? L('You finished #{rank} with {points}.', {
                rank: view.myRank,
                points: pointsText(view.myScore, L),
              })
            : `${pointsText(view.myScore, L)}.`
        }
        mood="done"
      />
    );
  }
  return (
    <WaitingScreen
      title={view.phoneOnly ? L('One moment…') : L('Look at the TV')}
      hint={view.phoneOnly ? L('the next question is on its way') : undefined}
      mood="watch"
    />
  );
}
