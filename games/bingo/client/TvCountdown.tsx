// The card pick's slot on the TV (the deal, who is still picking — no count-in since ADR-053) and
// the 3 · 2 · 1 after the last card-style menu closes (loop 242), one tick per second.
import { useEffect } from 'react';
import type { JSX } from 'react';
import {
  Avatar,
  BigText,
  Stage,
  useHold,
  useSecondsLeft,
  useSoundApi,
  useT,
} from '@partybox/game-sdk/ui';
import type { ViewPlayer } from '@partybox/game-sdk/ui';
import type { BingoTvView } from '../server/views';
import { PatternDemo } from './PatternDemo';
import { STRINGS } from './strings';
import { patternShort } from './words';
import {
  DEAL_BOUNCE_MS,
  DEAL_START_MS,
  DEAL_STEP_MS,
  RESUME_MS,
  dealDoneMs,
} from '../server/constants';
import styles from './Tv.module.css';

/**
 * The card pick's slot: the deal, then who is still picking, then "everyone has picked" — no
 * count-in: the shell's stage did READY and the 3 · 2 · 1 (ADR-053, reviewer 59a5f4).
 */
export function IntroCountdown({
  cards,
  waitingOn,
  players,
}: {
  /** Cards per player: the TV plucks once per card on the phones' deal beats (loop 278). */
  cards: number;
  /** Who is still picking their cards (loop 344): the slot names them. */
  waitingOn: string[];
  /** Everyone with cards: a row of faces, each lighting up as its player has picked (loop 349). */
  players: ViewPlayer[];
}): JSX.Element {
  const sound = useSoundApi();
  const L = useT(STRINGS);
  // Once the last card back has landed the caption stops saying "dealing" (loop 302).
  const dealt = useHold('deal', dealDoneMs(cards));
  // The deal, heard from the sofa: the same beats the phones use (Controller.tsx — a second a
  // card, loop 345; the pluck on the bounce), so the room's plucks and the TV's land together.
  useEffect(() => {
    const handles = Array.from({ length: cards }, (_, i) =>
      setTimeout(() => sound.play('card'), DEAL_START_MS + i * DEAL_STEP_MS + DEAL_BOUNCE_MS),
    );
    return () => handles.forEach((h) => clearTimeout(h));
  }, [cards, sound]);
  return (
    <div className={styles.introSlot}>
      {/* The deal itself (loop 279): one card back per card, dealt out of a deck on the
          plucks' beats, each turning face-up as it lands in the fan. */}
      <span className={styles.dealWrap}>
        {dealt ? (
          // The faces take the fan's place once the deal is down (loop 349): dim while
          // picking, lit with a ✓ as each pick lands — who the room waits for, at a glance.
          <span className={`${styles.dealFan} ${styles.readyRow}`} aria-hidden>
            {players
              .filter((p) => p.status !== 'spectator')
              .map((p) => (
                <span
                  key={p.id}
                  className={`${styles.readyFace} ${p.status === 'submitted' ? `${styles.readyDone} pb-pop` : waitingOn.length === 1 ? styles.readyLast : ''}`}
                >
                  <Avatar avatarId={p.avatarId} size="var(--pb-face, 72px)" />
                  <b className={styles.readyTick}>✓</b>
                </span>
              ))}
          </span>
        ) : (
          <span className={styles.dealFan} aria-hidden>
            {Array.from({ length: cards }, (_, i) => (
              <span
                key={i}
                className={styles.dealSlot}
                style={{ transform: `rotate(${(i - (cards - 1) / 2) * 9}deg)` }}
              >
                <span
                  className={styles.dealCard}
                  style={{ animationDelay: `${DEAL_START_MS + i * DEAL_STEP_MS}ms` }}
                />
              </span>
            ))}
          </span>
        )}
        <span className={styles.introLead}>
          {!dealt
            ? L('dealing the cards…')
            : waitingOn.length === 0
              ? L('everyone has picked')
              : waitingOn.length > 3
                ? L('pick your cards on your phone — {n} still picking', {
                    n: waitingOn.length,
                  })
                : L('pick your cards on your phone — waiting for {names}', {
                    names: waitingOn.join(', '),
                  })}
        </span>
      </span>
    </div>
  );
}

/** The 3 · 2 · 1 after the last card-style menu closes: one tick per second, then the next number. */
export function Resume({
  roundLabel,
  resumeAt,
  pattern,
  by,
}: {
  roundLabel: string;
  resumeAt: number;
  /** The pattern in play — after "keep going — blackout" the room reads the new goal here. */
  pattern?: string;
  /** Who chose to keep going (loop 325): the 3 s screen says why the room is counting. */
  by?: string | null;
}): JSX.Element {
  const left = Math.min(3, useSecondsLeft(resumeAt, false, 50) ?? 0); // a 4 would tick four times on a 3 s hold
  const sound = useSoundApi();
  const L = useT(STRINGS);
  useEffect(() => {
    if (left > 0) sound.play('tick');
  }, [left, sound]);
  return (
    <Stage center>
      <p className={styles.kicker}>
        {roundLabel}
        {pattern ? ` · ${pattern}` : ''} · {L('calling resumes in')}
      </p>
      <div className={styles.resumeWrap}>
        <svg className={styles.ring} viewBox="0 0 120 120" aria-hidden>
          <circle className={styles.ringTrack} cx="60" cy="60" r="52" />
          <circle
            key={resumeAt}
            className={styles.ringFill}
            cx="60"
            cy="60"
            r="52"
            style={{ animationDuration: `${RESUME_MS}ms` }}
          />
        </svg>
        {/* The ring and its 3 arrive together; a change of digit pops (loop 300). */}
        <BigText key={left} level="display" tone="accent" className="pb-tick">
          {Math.max(1, left)}
        </BigText>
      </div>
      <BigText level="h2" tone="muted">
        {by ? L('{name} said keep going — thumbs ready', { name: by }) : L('get your thumbs ready')}
      </BigText>
    </Stage>
  );
}

/** The intro stage: the round, the pattern demo, the programme, the deal and the card-pick step. */
export function IntroStage({
  view,
  roundLabel,
}: {
  view: BingoTvView;
  roundLabel: string;
}): JSX.Element {
  // Nine or more players wrap the roster to two or three rows (loop 393): the demo and the
  // faces step down so the caption stays above the host bar.
  const crowded = view.players.length > 8;
  const L = useT(STRINGS);
  return (
    <Stage center className={crowded ? styles.crowdedIntro : undefined}>
      <BigText level="h2" tone="muted">
        {roundLabel}
      </BigText>
      <div className={styles.patternRow}>
        <PatternDemo pattern={view.pattern} cells={view.patternCells} size={crowded ? 140 : 200} />
        <BigText level="display" tone="accent">
          {L.sent(view.patternLabel)}
        </BigText>
      </div>
      <BigText level="h2">{L.sent(view.patternHint)}</BigText>
      {view.cardsPerPlayer > 1 ? (
        <BigText level="h2" tone="muted">
          {L('{n} cards each — BINGO! checks the card you press it on.', {
            n: view.cardsPerPlayer,
          })}
        </BigText>
      ) : null}
      <p className={styles.programme}>
        {view.patterns.map((p, i) => (
          <span key={i} className={i + 1 === view.round ? styles.programmeNow : ''}>
            {i + 1}. {patternShort(p, L)}
          </span>
        ))}
      </p>
      <IntroCountdown
        cards={view.cardsPerPlayer}
        waitingOn={view.waitingOn}
        players={view.players}
      />
    </Stage>
  );
}
