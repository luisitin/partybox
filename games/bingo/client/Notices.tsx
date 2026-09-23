// The Bingo phone's notices: the turn-your-phone gate, the reconnect toast, the note under my
// claim, and a spectator's screen (split out of Overlays.tsx at the 300-line cap when I-013 added
// the style diagrams; the last two out of Controller.tsx when its words learned Spanish).
import type { JSX } from 'react';
import { WaitingScreen, useT } from '@partybox/game-sdk/ui';
import type { BingoControllerView } from '../server/views';
import { whyNot } from './copy';
import { STRINGS } from './strings';
import type { Orientation } from './styles';
import styles from './Controller.module.css';

/** Wrong way up for the chosen style: a little phone turns the way it should go. */
export function TurnGate({ to, style }: { to: Orientation; style: string }): JSX.Element {
  const L = useT(STRINGS);
  return (
    <div className={styles.turn} role="status">
      <span
        className={`${styles.turnPhone} ${to === 'landscape' ? styles.turnToLandscape : styles.turnToPortrait}`}
        aria-hidden
      />
      <p className={styles.turnLine}>
        {to === 'landscape'
          ? L('Turn your phone sideways for {style}.', { style })
          : L('Turn your phone upright for {style}.', { style })}
      </p>
      <p className={styles.hint}>{L('the cards appear the moment you do')}</p>
    </div>
  );
}

/** The reconnect notice (review-loop #4): the TV board has what you missed — and with the board
 *  off, the notice names the calls (pass 866: `recent` carried them and the phone never showed
 *  them). `recent` is the last four calls, the current one last; more than three → "and n more". */
export function MissedToast({
  view,
  count,
}: {
  view: BingoControllerView;
  count: number;
}): JSX.Element | null {
  const L = useT(STRINGS);
  // A phone-only room has no TV board to point at: it lists what was missed, like a room without
  // the board (the owner, 2026-09-22).
  const board = view.showBoard && !view.phoneOnly;
  const missed = board ? [] : view.recent.slice(0, -1).slice(-count);
  if (!board && missed.length === 0) return null;
  const more = count - missed.length;
  const list = missed.join(', ');
  return (
    <p className={styles.missedToast} role="status">
      {board
        ? count === 1
          ? L('Back — you missed a number. It is on the TV board.')
          : L('Back — you missed {n} numbers. They are on the TV board.', { n: count })
        : more > 0
          ? L('Back — you missed {list} and {n} more.', { list, n: more })
          : L('Back — you missed {list}.', { list })}
    </p>
  );
}

/** My claim under review: what is on (before the verdict), then why it failed and the wipe. The
 *  note's lines are reserved from the claim (loop 313). */
export function ClaimNote({
  view,
  verdictShown,
}: {
  view: BingoControllerView;
  verdictShown: boolean;
}): JSX.Element | null {
  const L = useT(STRINGS);
  const claim = view.claim;
  if (!claim) return null;
  const n = (claim.cardIndex ?? 0) + 1;
  const why = whyNot(claim, L);
  return (
    <p className={`${styles.wipeNote} ${verdictShown ? '' : styles.wipeNotePending}`}>
      {verdictShown
        ? `${why ? `${why}. ` : ''}${L('Card {n} wiped — re-daub from memory when play resumes.', { n })}`
        : view.phoneOnly
          ? L('Card {n} is up — everyone is checking it.', { n })
          : L('Card {n} is on the TV — everyone is checking it.', { n })}
    </p>
  );
}

/** A spectator's phone: the call and everything called so far (players must remember). */
export function Watching({ view }: { view: BingoControllerView }): JSX.Element {
  const L = useT(STRINGS);
  const call = view.current;
  return (
    <WaitingScreen
      title={L("You're watching this one")}
      hint={
        call
          ? L('{letter} {number} — {call}. Called so far: {called}', {
              letter: call.letter,
              number: call.number,
              call: call.call, // the caller's nickname: content, in the deck's language
              called: view.called.join(', '),
            })
          : L('You get a card next game.')
      }
      mood="watch"
    />
  );
}
