// Pieces of the Bingo phone: the call header (nickname only — the number is on the TV), the
// scoreboard rows, the card stack (one card, or several labelled, a won card locked in gold) and
// the choice after a bingo (keep going or move on — any phone with a card, first tap wins).
import type { JSX } from 'react';
import { PrimaryButton } from '@partybox/game-sdk/ui';
import type { ScoreboardRow } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { BingoControllerView, CallView } from '../server/views';
import { Card } from './Card';
import styles from './Controller.module.css';

export function rows(view: BingoControllerView): ScoreboardRow[] {
  const avatar = (id: string): string => view.players.find((p) => p.id === id)?.avatarId ?? '';
  return view.standings.map((s) => ({
    playerId: s.playerId,
    name: s.name,
    avatarId: avatar(s.playerId),
    score: s.wins,
    rank: s.rank,
  }));
}

export function CallHeader({
  current,
  previous,
  index,
  pattern,
  missed,
}: {
  current: CallView | null;
  previous: CallView | null;
  index: number;
  pattern: string;
  /** Nicknames this phone never saw (no hall board on the TV to catch up from). */
  missed: string[] | null;
}): JSX.Element {
  if (!current) return <div className={styles.header} />;
  return (
    <div className={styles.header} role="status" aria-live="polite">
      <div className={styles.now} key={current.number}>
        {/* Spicy nicknames run long ("Doctor's orders — take two and call me"): over ~20 characters
            the phrase steps down a size so a 320 px phone keeps the call line below it (loop #7). */}
        <span className={`${styles.phrase} ${current.call.length > 20 ? styles.phraseLong : ''}`}>
          {current.call}
        </span>
      </div>
      <p className={styles.meta}>
        Call {index} · {pattern} ·{' '}
        {missed && missed.length > 0
          ? `missed: ${missed.join(', ')}`
          : previous
            ? // Nicknames are "Number — pun" (review-loop #40): the meta line keeps the short half.
              `before: ${previous.call.split(' — ')[0]}`
            : 'the number is on the TV'}
      </p>
    </div>
  );
}

/** After a bingo: keep going on the same cards (same pattern / blackout) or move on. */
export function DecideFooter({
  view,
  send,
}: {
  view: BingoControllerView;
  send: (input: Input) => void;
}): JSX.Element | null {
  const decide = view.decide;
  if (!decide || !(decide.same || decide.blackout)) return null;
  const nextLabel = view.round < view.totalRounds ? 'Next round — fresh cards' : 'Finish the game';
  return (
    <div className={styles.decide}>
      {decide.same ? (
        <PrimaryButton onClick={() => send({ type: 'continue', pattern: 'same' })}>
          Keep going — same pattern
        </PrimaryButton>
      ) : null}
      {decide.blackout ? (
        <PrimaryButton
          tone="neutral"
          onClick={() => send({ type: 'continue', pattern: 'blackout' })}
        >
          Keep going — blackout
        </PrimaryButton>
      ) : null}
      <PrimaryButton tone="neutral" onClick={() => send({ type: 'next' })}>
        {nextLabel}
      </PrimaryButton>
    </div>
  );
}

export interface CardStackProps {
  view: BingoControllerView;
  cards: number[][];
  /** Phone-only FREE daubs, per card index. */
  freeDaubed: number[];
  onTapFree: (card: number) => void;
  onTap: (card: number, index: number) => void;
  /** intro: fresh cards, no daubs, the pattern outlined. */
  intro: boolean;
  disabled: boolean;
  /** check: my own failed claim is shown as the room sees it, in place of that card. */
  showClaim: boolean;
}

/** Every card this phone holds; a card that won this round is locked and says so. */
export function CardStack({
  view,
  cards,
  freeDaubed,
  onTapFree,
  onTap,
  intro,
  disabled,
  showClaim,
}: CardStackProps): JSX.Element {
  const claim = view.claim;
  const many = cards.length > 1;
  const size = cards.length > 2 ? 'compact' : 'phone';
  // Live cards first: the one you can still play stays in view, a card that won drops below.
  const order = cards
    .map((_, c) => c)
    .sort(
      (a, b) => Number(!intro && view.won.includes(a)) - Number(!intro && view.won.includes(b)),
    );
  return (
    <div className={styles.cards}>
      {order.map((c) => {
        const card = cards[c] ?? [];
        if (showClaim && claim && claim.cardIndex === c)
          return (
            // Your failed claim, exactly as the room sees it: the wipe lands when play resumes.
            <div key={`claim-${c}`} className="pb-pop">
              <p className={styles.wipeNote}>
                {many ? `Card ${c + 1} wiped` : 'Card wiped'} — re-daub from memory when play
                resumes.
              </p>
              <Card
                numbers={claim.card}
                daubs={claim.daubs}
                green={claim.green}
                red={claim.red}
                missing={claim.missing}
                verdict
                disabled
                size={size}
              />
            </div>
          );
        const locked = !intro && view.won.includes(c);
        return (
          <div
            key={`${c}-${view.waitingForCall ? 'wiped' : 'card'}`}
            className={`pb-enter ${locked ? styles.locked : ''}`}
          >
            {many || locked ? (
              <p className={`${styles.cardLabel} ${locked ? styles.cardLabelWon : ''}`}>
                {many ? `Card ${c + 1}` : ''}
                {locked
                  ? `${many ? ' · ' : ''}BINGO ✓ — ${many ? 'sits this pattern out' : "yours already — you're done till the pattern changes"}`
                  : ''}
              </p>
            ) : null}
            <Card
              numbers={card}
              daubs={intro ? [] : (view.daubs[c] ?? [])}
              pattern={intro && view.pattern !== 'line' ? view.patternCells : []}
              freeDaubed={locked || freeDaubed.includes(c)}
              onTapFree={() => onTapFree(c)}
              onTap={(index) => onTap(c, index)}
              disabled={disabled || locked}
              size={size}
            />
          </div>
        );
      })}
    </div>
  );
}
