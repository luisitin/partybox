// Controller (phone) view for Bingo. Focus by default: the card that is up, big, the call above
// it, every card as a thumbnail below; other styles put every card on screen with its own BINGO!.
// A 🃏 button opens the style sheet — which holds the caller for the whole room until it closes.
// BINGO! takes two taps (dibs for 3 s). `send` is the only way out; the server accepts every daub
// and judges only the claim, on the card named.
import { useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import {
  Screen,
  WaitingScreen,
  avatarColorVar,
  useSound,
  useSoundApi,
} from '@partybox/game-sdk/ui';
import { Avatar } from '@partybox/game-sdk/ui'; // I-135 A: the mate rows carry faces
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { BingoControllerView } from '../server/views';
import { Card } from './Card';
import { PatternDemo } from './PatternDemo';
import { PhoneStage } from './PhoneStage';
import {
  BingoButton,
  CallRow,
  DecideFooter,
  IntroStyleSheet,
  StylePill,
  daubWithFeel,
} from './ControllerParts';
import { AllCardsLayout, FocusLayout, Thumbnails, introOutline } from './Layouts';
import { Countdown, HoldCurtain, IntroActions, IntroCount, StyleSheet } from './Overlays';
import { MissedToast, TurnGate } from './Notices';
import {
  setCardStyle,
  styleSpec,
  turnNeeded,
  useCardStyle,
  useHeld,
  useOrientationLock,
} from './styles';
import type { CardStyle } from './styles';
import { otherTitle, whyNot } from './copy';
import { EndScreens, afterLine, WinScreen } from './WinScreen';
import {
  useCallFeel,
  useCloseFeel,
  useDealFeel,
  useLandscape,
  useMenuRelease,
  useMissedCalls,
  useRoundReset,
  useVerdictFeel,
} from './feel';

import styles from './Controller.module.css';

export function Controller({
  view,
  me,
  send,
}: GameControllerProps<BingoControllerView, Input>): JSX.Element {
  const cards = view.cards;
  const n = cards?.length ?? 1;
  const style = useCardStyle(n);
  const held = useHeld();
  // The TV plays the claim reveal in beats; this phone shows nothing conclusive (colours, "Not a
  // bingo", the wipe note) until the TV has (DESIGN_SYSTEM principle 5). The verdict is the
  // server's word (`verdictShown`, its tick at the end of the reveal — loop 258): one push turns
  // the phone, no local clock to drift from the TV.
  // A second bingo on the repeated number (same player, another card) is a new claim: the card
  // and the count are in the key, not only the call (loop 294).
  const claimKey = view.claim
    ? `${view.claim.playerId}:${view.claim.cardIndex}:${view.callIndex}:${view.bingosThisRound}`
    : null;
  const verdictShown = view.verdictShown;
  const play = useSound();
  const sound = useSoundApi();
  useVerdictFeel(view, me.id, claimKey, verdictShown, play);
  useDealFeel(view.phaseId === 'intro', n, view.round, play);
  // A valid claim too: the room learns who won from the TV, not from a phone flipping first.
  const pending = view.phaseId === 'bingo' && view.claim !== null && !verdictShown;
  const [sheet, setSheet] = useState<'' | 'intro' | 'round'>('');
  const [preview, setPreview] = useState<CardStyle | null>(null);
  const shown = preview ?? style;
  const inRound = view.phaseId === 'play' || view.phaseId === 'check' || pending;
  const turn = inRound ? turnNeeded(shown, held) : null;
  useOrientationLock(inRound && held !== 'wide' && !turn ? styleSpec(shown).orient : null);
  // The card that is up (Focus) and the card picked to swap (intro): per round.
  const [up, setUp] = useState(0);
  const [pick, setPick] = useState(0);
  const [swaps, setSwaps] = useState(0); // "deal me another" taps this round: keys the flip
  // FREE always counts (server); daubing it is pure satisfaction, so it lives on the phone only
  // (per card) and resets with every fresh deal (round) — "adjust state when a prop changes".
  const [freeDaubed, setFreeDaubed] = useState<number[]>([]);
  const toggleFree = (c: number): void =>
    setFreeDaubed((v) => (v.includes(c) ? v.filter((i) => i !== c) : [...v, c]));
  const daub = (c: number, index: number): void => daubWithFeel(view, send, play, c, index);
  useCallFeel(view, view.phoneOnly ? sound : null); // S-005 B
  useCloseFeel(view, play);
  // The card up just won: a live card comes up once, at that moment (a won card picked later stays).
  const liveUp = cards?.findIndex((_, i) => !view.won.includes(i)) ?? -1;
  const [wonSeen, setWonSeen] = useState(view.won.length);
  if (view.won.length !== wonSeen) {
    setWonSeen(view.won.length);
    if (cards && view.won.includes(up) && liveUp >= 0 && liveUp !== up) setUp(liveUp);
  }
  useRoundReset(view.round, () => {
    setFreeDaubed([]);
    setUp(0);
    setPick(0);
    setSwaps(0);
  });
  const missed = useMissedCalls(view);
  // The sheet holds the caller for everyone: the server hears it open and close.
  const openMenu = (): void => {
    setSheet(view.phaseId === 'intro' ? 'intro' : 'round');
    setPreview(null);
    send({ type: 'menu', open: true });
  };
  const closeMenu = (): void => {
    setSheet('');
    setPreview(null);
    send({ type: 'menu', open: false });
  };
  useMenuRelease(sheet !== '', send);
  // The sheet is offered on the card-pick step too (owner's play-test, 2026-09-19): there a tap
  // applies the style at once (no live preview — the pick screen has its own layout) and the
  // round starting closes it, so nobody holds the first number from the intro.
  const intro = view.phaseId === 'intro';
  // I-099 B: sideways, the pattern demo is the wait's centrepiece.
  const landscape = useLandscape();
  const demoSize = landscape ? 92 : 56;
  if (sheet === 'intro' && !intro) setSheet('');

  if (!cards) {
    return (
      <WaitingScreen
        title="You're watching this one"
        hint={
          view.current
            ? `${view.current.letter} ${view.current.number} — ${view.current.call}. Called so far: ${view.called.join(', ')}`
            : 'You get a card next game.'
        }
        mood="watch"
      />
    );
  }
  const iDecide = view.decide !== null && (view.decide.same || view.decide.blackout);
  const layoutProps = {
    view,
    cards,
    meId: me.id,
    send,
    freeDaubed,
    onTapFree: toggleFree,
    onDaub: daub,
    intro: false,
    disabled: false,
    verdictShown,
  };

  if (view.phaseId === 'intro') {
    const left = view.swappable.includes(pick) && !view.ready;
    const actions = (
      <IntroActions
        view={view}
        cards={n}
        pick={pick}
        canSwap={left}
        send={send}
        play={play}
        onSwap={() => setSwaps((s) => s + 1)}
      />
    );
    return (
      <Screen
        key="round"
        title={`Round ${view.round} of ${view.totalRounds}`}
        footer={
          // The card-pick step (loop 344, the owner): swap, then Ready — the round starts when
          // everyone is (or 15 s in). Two buttons on one row so a short phone keeps its cards.
          landscape ? undefined : actions
        }
      >
        <div className={`${styles.roundBody} ${styles.introBody}`}>
          <div className={styles.intro}>
            {/* The same demo the TV runs, small, in step with it (loop 290). */}
            <PatternDemo
              pattern={view.pattern}
              cells={view.patternCells}
              size={held === 'wide' ? 56 : demoSize}
            />
            <div>
              <p className={styles.patternLabel}>{view.patternLabel}</p>
              <p className={styles.hint}>
                {view.patternHint}
                {/* I-094 B: the count line is the one instruction; the hint is the pattern's. */}
              </p>
            </div>
            {!sheet ? <StylePill onOpen={openMenu} /> : null}
          </div>
          <IntroCount
            deadline={view.deadline}
            cards={n}
            ready={view.ready}
            waitingOn={view.waitingOn}
            lastOne={view.lastOne}
          />
          {/* I-099 C: sideways, the buttons live in the left half. */}
          {landscape ? <div className={styles.introSide}>{actions}</div> : null}
          <div className={`${styles.focus} ${styles.dealing} ${n > 1 ? styles.focusMany : ''}`}>
            <div className={styles.focusMain}>
              <div key={swaps} className={swaps > 0 ? styles.swapIn : undefined}>
                <Card
                  numbers={cards[pick] ?? []}
                  daubs={[]}
                  pattern={introOutline(view)}
                  disabled
                />
              </div>
            </div>
            {n > 1 ? (
              <Thumbnails
                view={view}
                cards={cards}
                marked={pick}
                markLabel="swap this"
                onPick={setPick}
                spent={cards.map((_, i) => i).filter((i) => !view.swappable.includes(i))}
              />
            ) : null}
          </div>
          {sheet ? <IntroStyleSheet cards={n} current={style} onClose={closeMenu} /> : null}
        </div>
      </Screen>
    );
  }

  // A "phone only" room: someone else's RIGHT claim turns over on my phone too (the owner,
  // 2026-09-21 — only the wrong ones did); the win screen follows once the verdict has landed.
  if (view.phoneOnly && pending && view.winnerId !== me.id) return <PhoneStage view={view} />;
  // Play, check and a bingo phase without my winning card keep the same cards mounted.
  const roundOver =
    view.phaseId === 'bingo' && !pending && !(view.winnerId === me.id && view.claim);
  if (inRound || roundOver) {
    const kind = held === 'wide' ? 'tablet' : shown;
    const focus = kind === 'focus';
    const body = turn ? (
      <TurnGate to={turn} style={styleSpec(shown).label} />
    ) : focus ? (
      <FocusLayout {...layoutProps} disabled={roundOver} up={up} onUp={setUp} />
    ) : (
      <AllCardsLayout {...layoutProps} disabled={roundOver} kind={kind} />
    );
    return (
      <Screen
        key="round"
        title={
          roundOver
            ? view.winnerName
              ? otherTitle(view, view.winnerName)
              : 'No bingo this round'
            : undefined
        }
        footer={
          roundOver ? (
            <DecideFooter view={view} send={send} />
          ) : focus && !turn ? (
            <BingoButton
              view={view}
              card={up}
              send={send}
              meId={me.id}
              verdictShown={verdictShown}
            />
          ) : undefined
        }
      >
        <div
          className={`${styles.roundBody} ${sheet && !preview ? styles.dimmed : ''} ${roundOver ? styles.deciding : ''}`}
          style={{ '--pb-daub': `var(--pb-ink, ${avatarColorVar(me.avatarId)})` } as CSSProperties} // I-010: the blot's colour; S-002: the ink overrides
        >
          <div className={styles.topRow}>
            {roundOver ? (
              <p className={styles.hint}>{afterLine(view, iDecide)}</p>
            ) : kind === 'grid' && n === 3 ? (
              // Three cards: the call sits in the grid's spare slot — not twice (owner, loop 309).
              <span className={styles.topSpacer} aria-hidden />
            ) : (
              // The ball row on every style (owner, play-test 2: "the way the calls look at the
              // top" of the grids); the nickname is the TV's and the caller's — loop 338.
              <CallRow view={view} />
            )}
            {inRound && !sheet && kind !== 'tablet' ? <StylePill onOpen={openMenu} /> : null}
          </div>
          {/* I-135 A: nothing of mine is live — the phone becomes the caller's mate. */}
          {view.mates.length > 0 ? (
            <div className={styles.mates}>
              <p className={styles.matesHead}>Caller&apos;s mate — the room right now</p>
              <ul className={styles.matesList}>
                {view.mates.map((m) => (
                  <li key={m.id} className={styles.mateRow}>
                    <Avatar avatarId={m.avatarId} size="var(--pb-chip-size)" />
                    <b>{m.name}</b>
                    <span>
                      {m.toGo} to go{m.where ? ` · ${m.where}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {missed ? <MissedToast view={view} count={missed} /> : null}
          {view.phaseId === 'check' && view.claim?.playerId === me.id ? (
            // The note's lines are reserved from the claim (loop 313): filling them at the verdict
            // used to drop the card 25 px in one frame. Before the verdict they say what is on.
            <p className={`${styles.wipeNote} ${verdictShown ? '' : styles.wipeNotePending}`}>
              {verdictShown
                ? `${whyNot(view.claim) ? `${whyNot(view.claim)}. ` : ''}Card ${(view.claim.cardIndex ?? 0) + 1} wiped — re-daub from memory when play resumes.`
                : `Card ${(view.claim.cardIndex ?? 0) + 1} is ${view.phoneOnly ? 'up' : 'on the TV'} — everyone is checking it.`}
            </p>
          ) : null}
          {body}
          {view.pausedBy.length > 0 && !view.menuOpen && !sheet ? (
            <HoldCurtain names={view.pausedBy} onOpen={openMenu} />
          ) : null}
          {view.resumeAt !== null ? (
            <Countdown
              resumeAt={view.resumeAt}
              pattern={view.patternLabel}
              by={view.resumeMine ? 'you' : view.resumeBy}
            />
          ) : null}
          {sheet ? (
            <StyleSheet
              cards={n}
              current={style}
              preview={preview}
              onPreview={(id) => setPreview(id === style ? null : id)}
              onConfirm={() => {
                if (preview) setCardStyle(preview);
                closeMenu();
              }}
              onClose={closeMenu}
            />
          ) : null}
        </div>
      </Screen>
    );
  }

  if (view.phaseId === 'bingo')
    return <WinScreen view={view} send={send} cards={n} iDecide={iDecide} />;

  return <EndScreens view={view} meId={me.id} />;
}
