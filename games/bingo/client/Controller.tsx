// Controller (phone) view for Bingo. Focus by default: the card that is up, big, the call above
// it, every card as a thumbnail below; other styles put every card on screen with its own BINGO!.
// A 🃏 button opens the style sheet — which holds the caller for the whole room until it closes.
// BINGO! takes two taps (dibs for 3 s). `send` is the only way out; the server accepts every daub
// and judges only the claim, on the card named.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { PrimaryButton, Scoreboard, Screen, WaitingScreen } from '@partybox/game-sdk/ui';
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
import styles from './Controller.module.css';

/** What happens after this bingo: the room decides, fresh cards, or the final board. */
function afterLine(view: BingoControllerView, iDecide: boolean): string {
  if (iDecide) return 'Keep these cards and carry on calling, or deal fresh ones? Anyone can pick.';
  if (view.decide && (view.decide.same || view.decide.blackout))
    return 'The players decide: keep going or next round.';
  return view.round < view.totalRounds ? 'Fresh cards next round.' : 'That was the last round.';
}

export function Controller({
  view,
  me,
  send,
}: GameControllerProps<BingoControllerView, Input>): JSX.Element {
  const cards = view.cards;
  const n = cards?.length ?? 1;
  const style = useCardStyle(n);
  const held = useHeld();
  const [sheet, setSheet] = useState(false);
  const [preview, setPreview] = useState<CardStyle | null>(null);
  const shown = preview ?? style;
  const inRound = view.phaseId === 'play' || view.phaseId === 'check';
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
            🎲 Deal me another{n > 1 ? ` card ${pick + 1}` : ''} ({left ? 1 : 0} left)
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
          <div className={`${styles.focus} ${n > 1 ? styles.focusMany : ''}`}>
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
  const roundOver = view.phaseId === 'bingo' && !(view.winnerId === me.id && view.claim);
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
              ? `${view.winnerName} has bingo`
              : 'No bingo this round'
            : undefined
        }
        footer={
          roundOver ? (
            <DecideFooter view={view} send={send} />
          ) : focus && !turn ? (
            <BingoButton view={view} card={up} send={send} meId={me.id} />
          ) : undefined
        }
      >
        <div className={`${styles.roundBody} ${sheet && !preview ? styles.dimmed : ''}`}>
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
            {inRound && !sheet ? (
              <button type="button" className={styles.stylePill} onClick={openMenu}>
                🃏 style
              </button>
            ) : null}
          </div>
          {missed ? <MissedToast view={view} count={missed} /> : null}
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

  if (view.phaseId === 'bingo') {
    const claim = view.claim;
    const which = n > 1 && claim ? ` — card ${claim.cardIndex + 1}` : '';
    return (
      <Screen
        key="bingo"
        title={`BINGO! You win round ${view.round}${which}`}
        footer={<DecideFooter view={view} send={send} />}
      >
        {claim ? (
          <Card numbers={claim.card} daubs={claim.daubs} green={claim.green} disabled />
        ) : null}
        <p className={styles.hint}>
          {iDecide && n > 1
            ? 'Keep going and that card sits the pattern out; your other cards play on. '
            : ''}
          {afterLine(view, iDecide)}
        </p>
      </Screen>
    );
  }

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
