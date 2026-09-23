// Pieces of the Bingo phone: the call header (nickname only — the number is on the TV), the call
// row in the TV's ball style (for the grids), the scoreboard rows, the BINGO! button with its two
// taps, and the choice after a bingo (keep going or move on — any phone with a card, first tap
// wins).
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Avatar, PrimaryButton, buzz, useSecondsLeft, useSound } from '@partybox/game-sdk/ui';
import type { PlayCue, ScoreboardRow } from '@partybox/game-sdk/ui';
import { ARM_MS } from '../server/types';
import type { Input } from '../server/types';
import type { BingoControllerView, CallView } from '../server/views';
import { pendingLine } from './copy';
import styles from './Controller.module.css';
import { StyleSheet } from './Overlays';
import { setCardStyle } from './styles';
import type { CardStyle } from './styles';

export type Send = (input: Input) => void;

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

/** A call the way the TV shows it: the letter in a ball, the number beside it. */
export function Ball({
  call,
  size = 'md',
}: {
  call: CallView;
  size?: 'sm' | 'md' | 'lg';
}): JSX.Element {
  return (
    <span
      className={`${styles.ball} ${styles[`ball_${size}`] ?? ''}`}
      key={call.number}
      role="img"
      aria-label={`${call.letter} ${call.number}`}
    >
      <i aria-hidden>{call.letter}</i>
      <b aria-hidden>{call.number}</b>
    </span>
  );
}

/**
 * The grids' call line: this ball, the one before, the count — no nickname (owner rule), and no
 * pattern either (loop 330: "· four corners" wrapped the line on a 360 px phone and the cards
 * dropped 20 px at call 2). Call 1 has no "before that", and no stray "·" in front of it.
 */
export function CallRow({
  view,
  big,
}: {
  view: BingoControllerView;
  /** I-126 B: the tablet's header has room for a real caller — the ball big, the nickname under it. */
  big?: boolean;
}): JSX.Element {
  return (
    <div className={`${styles.callRow} ${big ? styles.callRowBig : ''}`} role="status" aria-live="polite">
      {view.current ? <Ball call={view.current} size={big ? 'lg' : 'md'} /> : <span>First number coming…</span>}
      {/* I-126 B: on a tablet the nickname is the caller — it has the room the phone does not. */}
      {big && view.current ? <span className={styles.callNick}>{view.current.call}</span> : null}
      {view.current ? (
        <span className={styles.callMeta}>
          {view.previous ? (
            <>
              before that <Ball call={view.previous} size="sm" />
              {' · '}
            </>
          ) : null}
          call {view.callIndex}
        </span>
      ) : null}
      {/* I-126 C: the last five calls across the strip — the tablet as the room's second TV. */}
      {big && view.recentCalled.length > 0 ? (
        <span className={styles.callHistory} aria-hidden>
          {view.recentCalled.map((n) => (
            <span key={n} className={styles.callHistoryBall}>
              {n}
            </span>
          ))}
        </span>
      ) : null}
    </div>
  );
}

/**
 * BINGO! for one card. First tap arms it (the button turns gold: "Tap again for BINGO! · 3"),
 * the second tap claims. Someone else armed: the button says who is calling it, and whether you
 * are next. The armed phone reports its own lapse so dibs pass on at once.
 */
export function BingoButton({
  view,
  card,
  send,
  small,
  meId,
  verdictShown = true,
}: {
  view: BingoControllerView;
  card: number;
  send: Send;
  small?: boolean;
  meId: string;
  /** The TV has reached its verdict (default true: fixtures and the TV-less preview). */
  verdictShown?: boolean;
}): JSX.Element {
  const arm = view.arm;
  const mine = arm !== null && arm.playerId === meId;
  const armedHere = mine && arm.card === card;
  const left = useSecondsLeft(armedHere ? arm.until : null);
  const play = useSound();
  const [slam, setSlam] = useState(false);
  useEffect(() => {
    if (armedHere && left === 0) send({ type: 'lapse' });
  }, [armedHere, left, send]);
  const won = view.won.includes(card);
  // A check, or a win the TV is still revealing: the phone says nothing conclusive yet.
  const checking = view.phaseId === 'check' || (view.phaseId === 'bingo' && !verdictShown);
  // The check is about one card: only that button says "Not a bingo".
  const myClaim = checking && view.claim?.playerId === meId && view.claim.cardIndex === card;
  const myCheck = myClaim && verdictShown;
  // I-097 A: on hold with the rest of the screen while the room is paused.
  const held = view.paused;
  // I-097 C: the button pops back when play resumes.
  const [wasHeld, setWasHeld] = useState(held);
  const [back, setBack] = useState(false);
  if (held !== wasHeld) {
    setWasHeld(held);
    setBack(!held);
  }
  // I-115 C: the phone learns the two-tap rule the one time it lapses — the arm went with no
  // claim of mine. The previous arm lives in state, adjusted during render (no setState in an
  // effect); a timer clears the hint.
  const [armSeen, setArmSeen] = useState({ armed: armedHere, lapses: 0, hint: false });
  if (armSeen.armed !== armedHere) {
    const lapsed = !armedHere && !checking && !myCheck;
    setArmSeen({
      armed: armedHere,
      lapses: armSeen.lapses + (lapsed ? 1 : 0),
      hint: lapsed || armSeen.hint,
    });
  }
  const lapses = armSeen.lapses;
  useEffect(() => {
    if (lapses === 0) return;
    const t = setTimeout(() => setArmSeen((v) => ({ ...v, hint: false })), 2200);
    return () => clearTimeout(t);
  }, [lapses]);
  const lapsedHint = armSeen.hint;
  const canTap = view.claimable.includes(card) && !checking && !held;
  let label = 'BINGO!';
  let tone: 'accent' | 'neutral' | 'danger' | 'success' = 'accent';
  // The check first: a card under review says so, never "Yours already" before the verdict. The
  // other phones read the verdict too (loop 308): "Sam's card: not a bingo" once it lands.
  const mineChecking = view.claim?.playerId === meId; // any of my cards: my claim, my verdict
  const who = view.claim?.name ?? 'Their';
  if (checking)
    label = myCheck
      ? 'Not a bingo'
      : myClaim
        ? view.phoneOnly
          ? 'Checking your card…'
          : 'Checking on the TV…'
        : view.phaseId === 'check' && verdictShown
          ? mineChecking
            ? 'Not a bingo — see card ' + ((view.claim?.cardIndex ?? 0) + 1)
            : `${who}'s card: not a bingo`
          : view.phoneOnly
            ? `Checking ${who === 'Their' ? 'the' : `${who}'s`} card…`
            : 'Look at the TV'; // I-111
  else if (held)
    label = '⏸ Paused'; // I-097 B
  else if (won) label = 'Yours already';
  else if (view.waitingForCall) label = 'Next number soon…';
  else if (armedHere) {
    label = `Tap again · ${Math.min(3, left ?? 0)} s`; // I-096 A: plain words, one line on an SE
    tone = 'success';
  } else if (mine) label = 'BINGO!';
  else if (arm) {
    const queuedHere = view.queuedCard === card;
    label =
      queuedHere && view.queuePlace === 1
        ? `${arm.name} is calling it… you're next`
        : queuedHere && view.queuePlace > 1
          ? `${arm.name} is calling it… #${view.queuePlace} in line`
          : `${arm.name} is calling it…`;
    tone = 'neutral';
  }
  return (
    <div
      className={`${styles.bingoWrap} ${small ? styles.bingoWrapSmall : ''} ${slam ? styles.slam : ''}`}
      onAnimationEnd={() => setSlam(false)}
    >
      {/* I-111 B: who is claiming, with their face — and (C) the verdict as the TV lands it. */}
      {checking && !myClaim && view.claim ? (
        <p key={verdictShown ? 'verdict' : 'claim'} className={styles.claimLine}>
          <Avatar avatarId={view.claim.avatarId} size={24} />
          {verdictShown
            ? view.phaseId === 'bingo'
              ? `${view.claim.name} says BINGO! …and it's real`
              : `${view.claim.name} says BINGO! …not a bingo — carry on`
            : `${view.claim.name} says BINGO!`}
        </p>
      ) : null}
      <PrimaryButton
        tone={myCheck ? 'danger' : tone}
        disabled={!canTap && !(arm && !mine && canTap)}
        onClick={() => {
          // The second tap is the claim: a slam, a "sent!" cue and a long buzz on the tap itself.
          if (armedHere) {
            buzz([30, 40, 60]);
            play('claim');
            setSlam(true);
          }
          send({ type: 'bingo', card });
        }}
        className={`${small ? styles.bingoSmall : styles.bingo} ${armedHere ? styles.armed : ''} ${held ? styles.bingoHeld : ''} ${back ? styles.bingoBack : ''}`}
        onAnimationEnd={() => setBack(false)}
        aria-label={`BINGO! card ${card + 1}${armedHere ? ', armed, tap again to claim' : ''}`}
      >
        {label}
      </PrimaryButton>
      {lapsedHint ? (
        <span className={styles.lapsedHint} aria-live="polite">
          Dibs lapsed — tap twice within 3 s to claim
        </span>
      ) : null}
      {/* The window, draining along the button's foot in step with the TV's bar (loop 256). */}
      {armedHere && arm ? (
        <span
          key={arm.until}
          className={styles.armDrain}
          style={{ animationDuration: `${ARM_MS}ms` }}
          aria-hidden
        />
      ) : null}
    </div>
  );
}

/** After a bingo: keep going on the same cards (same pattern / blackout) or move on. */
export function DecideFooter({
  view,
  send,
}: {
  view: BingoControllerView;
  send: Send;
}): JSX.Element | null {
  const decide = view.decide;
  const play = useSound();
  if (!decide) return null;
  // A choice already made mid-celebration: the buttons go, the phone says what starts when.
  const pending = pendingLine(view.pendingDecision, view.round >= view.totalRounds, view.pendingBy);
  if (pending) return <p className={styles.hint}>{pending}</p>;
  const nextLabel = view.round < view.totalRounds ? 'Next round — fresh cards' : 'Finish the game';
  // The pick lands in the hand (loop 322): a 'submit' cue and a short buzz on the tap itself —
  // every other tap in the game sounds; the room's choice did not.
  const pick = (input: Input): void => {
    buzz(20);
    play('submit');
    send(input);
  };
  return (
    <div className={styles.decide}>
      {decide.same ? (
        <PrimaryButton onClick={() => pick({ type: 'continue', pattern: 'same' })}>
          Keep going — same pattern
        </PrimaryButton>
      ) : null}
      {decide.blackout ? (
        <PrimaryButton
          tone="neutral"
          onClick={() => pick({ type: 'continue', pattern: 'blackout' })}
        >
          Keep going — blackout
        </PrimaryButton>
      ) : null}
      <PrimaryButton tone="neutral" onClick={() => pick({ type: 'next' })}>
        {nextLabel}
      </PrimaryButton>
    </div>
  );
}

/**
 * A daub is the most-tapped moment of the game: the thump and the dauber sound land on the tap
 * itself (not on the server's echo), so the hand feels it at once. Un-daubing is silent.
 */
export function daubWithFeel(
  view: BingoControllerView,
  send: Send,
  play: PlayCue,
  card: number,
  index: number,
): void {
  if (!(view.daubs[card] ?? []).includes(index)) {
    buzz(18);
    play('daub');
  } else {
    // I-136 A: the lift is felt — a soft pluck and a lighter buzz.
    buzz(8);
    play('card', { quiet: true });
  }
  send({ type: 'daub', card, index });
}

/** The 🃏 pill that opens the card-style sheet (play, and the card-pick step). */
export function StylePill({ onOpen }: { onOpen: () => void }): JSX.Element {
  return (
    <button type="button" className={styles.stylePill} onClick={onOpen}>
      🃏 style
    </button>
  );
}

/** The sheet on the card-pick step (owner's play-test, 2026-09-19): a tap applies the style at
 *  once — the pick screen keeps its own layout, so there is nothing to preview — and the room
 *  is not held. */
export function IntroStyleSheet({
  cards,
  current,
  onClose,
  onPick,
  tablet,
}: {
  cards: number;
  current: CardStyle;
  onClose: () => void;
  /** I-126 A: a tablet saves its own pick here too (default: the phone's). */
  onPick?: (id: CardStyle) => void;
  tablet?: { on: boolean; onPick: () => void };
}): JSX.Element {
  return (
    <StyleSheet
      cards={cards}
      current={current}
      preview={null}
      note="for this round"
      onPreview={onPick ?? setCardStyle}
      onConfirm={onClose}
      onClose={onClose}
      {...(tablet ? { tablet } : {})}
    />
  );
}
