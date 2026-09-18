// Controller (phone) view for Bingo. Focus by default: the card that is up, big, the call above
// it, every card as a thumbnail below; other styles put every card on screen with its own BINGO!.
// A 🃏 button opens the style sheet — which holds the caller for the whole room until it closes.
// BINGO! takes two taps (dibs for 3 s). `send` is the only way out; the server accepts every daub
// and judges only the claim, on the card named.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import {
  PrimaryButton,
  Scoreboard,
  Screen,
  WaitingScreen,
  useHold,
  useSound,
} from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { BingoControllerView } from '../server/views';
import { Card, PatternIcon } from './Card';
import { BingoButton, CallHeader, CallRow, DecideFooter, rows } from './ControllerParts';
import { AllCardsLayout, FocusLayout, Thumbnails } from './Layouts';
import { Countdown, HoldCurtain, MissedToast, StyleSheet, TurnGate } from './Overlays';
import {
  setCardStyle,
  styleSpec,
  turnNeeded,
  useCardStyle,
  useHeld,
  useOrientationLock,
} from './styles';
import type { CardStyle } from './styles';
import { verdictAtMs } from '../server/reveal';
import { otherTitle } from './copy';
import { afterLine, WinScreen } from './WinScreen';
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
  // bingo", the wipe note) until the TV has (DESIGN_SYSTEM principle 5).
  const claimKey = view.claim ? `${view.claim.playerId}:${view.callIndex}` : null;
  const revealMs = view.claim
    ? verdictAtMs(
        view.claim.cells.length,
        view.claim.daubs.some((i) => !view.claim?.cells.includes(i)),
      )
    : 0;
  const verdictShown = useHold(claimKey, revealMs);
  // The deal's plucks: one soft 'card' as each thumbnail lands (owner's pick, options B + C);
  // the timings mirror .dealing in the stylesheet, the pluck on the bounce (~250 ms in).
  const play = useSound();
  const dealing = view.phaseId === 'intro';
  useEffect(() => {
    if (!dealing || n <= 1) return;
    const handles = Array.from({ length: n }, (_, i) =>
      setTimeout(() => play('card'), 360 + i * 110 + 250),
    );
    return () => handles.forEach((h) => clearTimeout(h));
  }, [dealing, n, play, view.round]);
  // A valid claim too: the room learns who won from the TV, not from a phone flipping first.
  const pending = view.phaseId === 'bingo' && view.claim !== null && !verdictShown;
  const [sheet, setSheet] = useState(false);
  const [preview, setPreview] = useState<CardStyle | null>(null);
  const shown = preview ?? style;
  const inRound = view.phaseId === 'play' || view.phaseId === 'check' || pending;
  const turn = inRound ? turnNeeded(shown, held) : null;
  useOrientationLock(inRound && held !== 'wide' && !turn ? styleSpec(shown).orient : null);
  // The card that is up (Focus) and the card picked to swap (intro): per round.
  const [up, setUp] = useState(0);
  const [pick, setPick] = useState(0);
  // FREE always counts (server); daubing it is pure satisfaction, so it lives on the phone only
  // (per card) and resets with every fresh deal (round) — "adjust state when a prop changes".
  const [freeDaubed, setFreeDaubed] = useState<number[]>([]);
  const toggleFree = (c: number): void =>
    setFreeDaubed((v) => (v.includes(c) ? v.filter((i) => i !== c) : [...v, c]));
  // The card up just won: bring a live card up instead — once, at the moment it wins, so a won
  // card picked on purpose later (to daub towards a blackout) stays up.
  const liveUp = cards?.findIndex((_, i) => !view.won.includes(i)) ?? -1;
  const [wonSeen, setWonSeen] = useState(view.won.length);
  if (view.won.length !== wonSeen) {
    setWonSeen(view.won.length);
    if (cards && view.won.includes(up) && liveUp >= 0 && liveUp !== up) setUp(liveUp);
  }
  const [round, setRound] = useState(view.round);
  if (round !== view.round) {
    setRound(view.round);
    setFreeDaubed([]);
    setUp(0);
    setPick(0);
  }
  // Calls that landed while this phone was away (review-loop #4).
  const [seenCall, setSeenCall] = useState(view.callIndex);
  const [missed, setMissed] = useState(0);
  if (view.callIndex !== seenCall) {
    const jumped = view.callIndex - seenCall;
    setSeenCall(view.callIndex);
    if (jumped > 1 && view.phaseId === 'play') setMissed(jumped - 1);
  }
  useEffect(() => {
    if (!missed) return;
    const handle = setTimeout(() => setMissed(0), 5000);
    return () => clearTimeout(handle);
  }, [missed]);
  // The sheet holds the caller for everyone: the server hears it open and close.
  const openMenu = (): void => {
    setSheet(true);
    setPreview(null);
    send({ type: 'menu', open: true });
  };
  const closeMenu = (): void => {
    setSheet(false);
    setPreview(null);
    send({ type: 'menu', open: false });
  };
  useEffect(() => {
    if (!sheet) return;
    return () => send({ type: 'menu', open: false });
  }, [sheet, send]);

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
    intro: false,
    disabled: false,
    verdictShown,
  };

  if (view.phaseId === 'intro') {
    const left = view.swappable.includes(pick);
    return (
      <Screen
        key="round"
        title={`Round ${view.round} of ${view.totalRounds}`}
        footer={
          <PrimaryButton
            tone="neutral"
            disabled={!left}
            onClick={() => send({ type: 'swap', card: pick })}
          >
            🎲 {left ? 'Deal me another' : 'Swapped'}
            {n > 1 ? ` (card ${pick + 1})` : ''}
          </PrimaryButton>
        }
      >
        <div className={styles.roundBody}>
          <div className={styles.intro}>
            <PatternIcon cells={view.patternCells} size={48} />
            <div>
              <p className={styles.patternLabel}>{view.patternLabel}</p>
              <p className={styles.hint}>
                {view.patternHint}
                {n > 1 ? ' Pick a card below to swap it.' : ''}
              </p>
            </div>
          </div>
          <div className={`${styles.focus} ${styles.dealing} ${n > 1 ? styles.focusMany : ''}`}>
            <div className={styles.focusMain}>
              <Card
                numbers={cards[pick] ?? []}
                daubs={[]}
                pattern={view.pattern === 'line' ? [] : view.patternCells}
                disabled
              />
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
        </div>
      </Screen>
    );
  }

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
        >
          <div className={styles.topRow}>
            {roundOver ? (
              <p className={styles.hint}>{afterLine(view, iDecide)}</p>
            ) : focus || kind === 'tablet' ? (
              <CallHeader
                current={view.current}
                previous={view.previous}
                index={view.callIndex}
                pattern={view.patternLabel}
                missed={missed && !view.showBoard ? view.recent.slice(-missed - 1, -1) : null}
              />
            ) : (
              <CallRow view={view} />
            )}
            {inRound && !sheet && kind !== 'tablet' ? (
              <button type="button" className={styles.stylePill} onClick={openMenu}>
                🃏 style
              </button>
            ) : null}
          </div>
          {missed ? <MissedToast view={view} count={missed} /> : null}
          {view.phaseId === 'check' && view.claim?.playerId === me.id && verdictShown ? (
            <p className={styles.wipeNote}>
              Card {(view.claim.cardIndex ?? 0) + 1} wiped — re-daub from memory when play resumes.
            </p>
          ) : null}
          {body}
          {view.pausedBy.length > 0 && !view.menuOpen && !sheet ? (
            <HoldCurtain names={view.pausedBy} onOpen={openMenu} />
          ) : null}
          {view.resumeAt !== null ? <Countdown resumeAt={view.resumeAt} /> : null}
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

  if (view.phaseId === 'scoreboard') {
    return (
      <Screen key="scoreboard" title="Rounds won">
        <Scoreboard rows={rows(view)} compact highlightId={me.id} noTrophy />
        <p className={styles.hint}>
          Next: round {view.round + 1} — {view.patterns[view.round] ?? ''}
        </p>
      </Screen>
    );
  }

  const myRank = view.standings.find((s) => s.playerId === me.id)?.rank ?? null;
  return (
    <Screen
      key="done"
      title={myRank === 1 ? 'You won!' : myRank ? `You finished #${myRank}` : 'Thanks for playing'}
    >
      <Scoreboard rows={rows(view)} compact highlightId={me.id} />
    </Screen>
  );
}
