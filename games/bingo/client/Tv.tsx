// TV view for Bingo. Dumb component: renders `view`, composes game-sdk primitives, never touches
// sockets or game logic. During play the stage shows ONE thing: the current call — plus the one
// before it, small, and the hall board when the VIP left it on. A claim stops the caller at once
// (server); the stage then drops the claimant's card, turns the pattern's cells in reading order
// for the whole room, shows the rest of the card, and only then delivers the verdict: a buzzer
// and "NOT A BINGO", or the cheer with confetti — and waits for a phone to move on.
import { useEffect, useLayoutEffect, useRef } from 'react';
import type { JSX } from 'react';
import { Avatar, BigText, Stage, useSoundApi, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { BingoTvView } from '../server/views';
import { BALL_LAND_MS, hushCaller, speakCall } from './caller';
import { PatternIcon } from './Card';

import { wipeKind, botLine, holdLine, pendingLine, whyNot, winHeadline } from './copy';
import { VoteClock, VoteTally } from './Vote';
import { hopelessClaim } from '../server/reveal';
import { IntroStage, Resume } from './TvCountdown';
import { Call, CalledBoard, ClaimStage, DibsLine, whichCard } from './TvParts';
import { TvEnd } from './TvEnd';
import {
  bingosSoFar,
  closeLine,
  decideLineClass,
  decideText,
  hopelessLine,
  strayLine,
  useDibsCue,
} from './tvBoard';
import { STRINGS } from './strings';
import styles from './Tv.module.css';

export function Tv({ view }: GameTvProps<BingoTvView>): JSX.Element {
  const L = useT(STRINGS);
  const roundLabel = L('Round {round} of {total}', { round: view.round, total: view.totalRounds });
  const patternLabel = L.sent(view.patternLabel); // the server writes it in English
  const sound = useSoundApi();
  // R2-01 C: the room hears it — the phone's hushed `close` when a player joins the one-away set
  // (once per player per round).
  const heard = useRef<{ round: number; ids: string[] }>({ round: 0, ids: [] });
  const closeKey = view.closeIds.join(',');
  useEffect(() => {
    if (heard.current.round !== view.round) heard.current = { round: view.round, ids: [] };
    const ids = closeKey === '' ? [] : closeKey.split(',');
    const fresh = ids.filter((id) => !heard.current.ids.includes(id));
    if (fresh.length === 0) return;
    heard.current.ids.push(...fresh);
    sound.play('close');
  }, [closeKey, view.round, sound]);
  const number = view.current?.number ?? null;
  const letter = view.current?.letter ?? null;
  // Every new number: the ball drops out of the cage (Tv.module.css, 420 ms); the recorded call's
  // first syllable starts on the frame it enters (loop 335 — the owner, twice: a listener must be
  // as fast as a watcher) and the "boing" lands as it squashes (BALL_LAND_MS after the push); no
  // per-second ticking — the timer is quiet. Leaving play (a claim, a check) hushes the caller mid-word and cancels a
  // boing or a voice still in the air.
  // Dibs (loop 252): the "says BINGO?…" line pops with a soft rising "hm?"; a window passing on
  // to the next in line is a new window, so it sounds again.
  useDibsCue(view.arm?.until ?? null, sound);
  // A call is the server's stamp (`calledAt`, loop 294): a resume countdown or a card-style hold
  // shows the same number without re-calling it, and the repeat after "keep going" is a new stamp.
  const { calledAt, phaseId } = view;
  const quiet = view.resumeAt !== null || view.pausedBy.length > 0;
  useLayoutEffect(() => {
    if (phaseId !== 'play' || number === null || letter === null) {
      hushCaller(sound);
      return;
    }
    if (quiet || calledAt === null) return;
    // The voice starts now — its first syllable on the frame the ball enters (loop 335, the owner
    // twice); the boing waits for the squash, BALL_LAND_MS in.
    speakCall(sound, letter, number, view.reader);
    const t = setTimeout(() => sound.play('call'), BALL_LAND_MS);
    return () => {
      clearTimeout(t);
    };
  }, [phaseId, number, letter, quiet, calledAt, sound, view.reader]);

  if (view.phaseId === 'intro') return <IntroStage view={view} roundLabel={roundLabel} />;

  // R2-01 B: the players one square from the pattern, by name (roster order).
  const closeNames = view.players.filter((p) => view.closeIds.includes(p.id)).map((p) => p.name);
  if (view.phaseId === 'play') {
    // A menu open somewhere holds the caller; the last one closing runs a 3 · 2 · 1 on the stage.
    if (view.resumeAt !== null)
      return (
        <Resume
          roundLabel={roundLabel}
          resumeAt={view.resumeAt}
          pattern={patternLabel}
          by={view.resumeBy}
        />
      );
    if (view.pausedBy.length > 0)
      return (
        <Stage center className={styles.held}>
          <p className={styles.kicker}>
            {roundLabel} · {L('call {n} of 75', { n: view.callIndex })}
          </p>
          {view.current ? (
            <div className={styles.heldCall}>
              <Call call={view.current} big />
            </div>
          ) : null}
          <BigText level="h1">{holdLine(view.pausedBy, L)}</BigText>
          <BigText level="h2" tone="muted">
            {L('calling resumes when they are done')}
          </BigText>
        </Stage>
      );
    return (
      // Two chip rows (9+ players) eat ~70 px of stage: everything below tightens a notch (loop #3).
      <Stage
        center
        className={`${styles.playStage} ${view.showBoard ? '' : styles.roomy} ${view.players.length > 8 ? styles.crowded : ''}`}
      >
        <p className={styles.kicker}>
          {roundLabel} · {patternLabel} · {L('call {n} of 75', { n: view.callIndex })}
          {bingosSoFar(view.bingosThisRound, L)}
        </p>
        {view.current ? <Call call={view.current} big stamp={view.calledAt} /> : null}
        {/* Ball first (180 ms pop), nickname 120 ms behind it: the number is the news (review-loop #1). */}
        {view.current ? (
          <div key={`${view.current.number}:${view.calledAt ?? ''}`} className={styles.caption}>
            <BigText level="h1">{view.current.call}</BigText>
          </div>
        ) : null}
        {/* R2-01 B: who is one away, under the nickname — rises in, keyed on the names. */}
        {closeNames.length > 0 ? (
          <p key={closeNames.join('|')} className={styles.closeLine}>
            {closeLine(closeNames, L)}
          </p>
        ) : null}
        {/* No reserved slot on the first call (review-loop #3): the row arrives with number two. */}
        {/* Crowded and the board on: the board is the history, the tray row gives its 80 px back. */}
        {view.showPrevious && view.previous && !(view.players.length > 8 && view.showBoard) ? (
          <div className={styles.previousRow}>
            <span className={styles.previousLabel}>{L('Before that')}</span>
            <Call call={view.previous} />
          </div>
        ) : null}
        {view.showBoard ? (
          <CalledBoard called={view.called} current={view.current?.number ?? null} />
        ) : null}
        <DibsLine arm={view.arm} queue={view.queue} claimed={view.claim !== null} />
      </Stage>
    );
  }

  // Nine or more players wrap the roster to two or three rows: the claim card lands smaller.
  const crowd = view.players.length > 8 ? styles.crowdedClaim : '';
  if (view.phaseId === 'check' && view.claim) {
    return (
      <Stage className={crowd}>
        <div className={`${styles.checkHead} pb-enter`}>
          <BigText level="h2" tone="accent">
            {L('{name} says BINGO!', { name: view.claim.name })}
          </BigText>
          <p className={styles.kicker}>
            {patternLabel}
            {whichCard(view.claim, L)} · {L('checking against {n} calls', { n: view.callIndex })}
          </p>
        </div>
        <ClaimStage
          key={`${view.claim.playerId}:${view.claim.cardIndex}:${view.callIndex}`}
          claim={view.claim}
          judged={view.verdictShown}
          valid={false}
          verdict={
            <>
              <BigText level="h1" className={styles.no}>
                {hopelessClaim(view.claim)
                  ? hopelessLine(view.claim, view.spicy, L)
                  : L('NOT A BINGO')}
              </BigText>
              <p className={styles.legend}>
                <span className={styles.legendGreen}>{L('✓ right')}</span>
                <span className={styles.legendRed}>{L('✕ never called')}</span>
                <span className={styles.legendMissing}>{L('▢ missed')}</span>
              </p>
              {whyNot(view.claim, L) ? <BigText level="h2">{whyNot(view.claim, L)}</BigText> : null}
              {/* I-138 A: the bot answers for itself. */}
              {botLine(view.claim, 'miss', L) ? (
                <BigText level="h2" tone="accent">
                  {botLine(view.claim, 'miss', L)}
                </BigText>
              ) : null}
              <BigText level="h2" tone="muted">
                {view.claim && wipeKind(view.claim) !== 'card'
                  ? L('Wrong daubs and that line wiped. Next number in a moment…')
                  : L('Card wiped. Next number in a moment…')}
              </BigText>
            </>
          }
        />
      </Stage>
    );
  }

  if (view.phaseId === 'bingo') {
    if (view.claim && view.winnerName) {
      const winnerAvatar = view.players.find((p) => p.id === view.claim?.playerId)?.avatarId ?? '';
      // I-105 (Session B's note): the stray-daubs kicker adds two lines above the vote, which ran
      // the decide line under the host bar at 1080p — that win steps its column down a size.
      const tight = view.claim.red.length > 0 ? styles.winTight : '';
      return (
        <Stage className={`${crowd} ${tight}`}>
          <div className={`${styles.checkHead} pb-enter`}>
            <BigText level="h2" tone="accent">
              {L('{name} says BINGO!', { name: view.winnerName })}
            </BigText>
            <p className={styles.kicker}>
              {patternLabel}
              {whichCard(view.claim, L)} · {L('checking against {n} calls', { n: view.callIndex })}
            </p>
          </div>
          <ClaimStage
            key={`${view.claim.playerId}:${view.claim.cardIndex}:${view.callIndex}:${view.bingosThisRound}`}
            claim={view.claim}
            judged={view.verdictShown}
            valid
            keepRed
            verdict={
              <>
                <BigText level="display" tone="accent" className={styles.bingoTitle}>
                  {L('BINGO!')}
                </BigText>
                {/* The winner's face beside their name (loop 331): the room looks up from the
                    phones and sees who, not just a name in the roster. */}
                <div className={styles.winWho}>
                  <Avatar avatarId={winnerAvatar} size="var(--pb-win-avatar)" />
                  <BigText level="h1">{winHeadline(view, view.winnerName, L)}</BigText>
                </div>
                {/* I-108 A: a valid claim with daubs that were never called — say so. */}
                {view.claim.red.length > 0 ? (
                  <p className={`${styles.strayLine} pb-enter`}>
                    {strayLine(view.claim.red.length, view.winnerName, view.spicy, L)}
                  </p>
                ) : null}
                {/* I-138 B: and when a bot wins. */}
                {botLine(view.claim, 'win', L) ? (
                  <p className={styles.winLine}>{botLine(view.claim, 'win', L)}</p>
                ) : null}
                <p className={styles.winLine}>
                  {/* I-107 A: the icon lights the line that actually won, not the example row. */}
                  <PatternIcon cells={view.claim.cells} size={72} draw />
                  <span>
                    {/* No "round N" here: the kicker above the card says it (loop 337). */}
                    {L('{pattern} on call {n}', {
                      pattern: patternLabel,
                      n: view.callIndex,
                    })}{' '}
                    ·{' '}
                    {view.claimPoints === 1
                      ? L('+1 point')
                      : L('+{n} points', { n: view.claimPoints })}
                    {whichCard(view.claim, L)}
                  </span>
                </p>
              </>
            }
            aside={
              view.autoEnd ? (
                <p className={`${styles.decideLine} pb-enter`}>
                  {L('Nothing left to play for on these cards — the scores in a moment.')}
                </p>
              ) : view.pendingDecision ? (
                <p className={`${styles.decideLine} pb-enter`}>
                  {pendingLine(
                    view.pendingDecision,
                    view.round >= view.totalRounds,
                    view.pendingBy,
                    L,
                  )}
                </p>
              ) : view.decide && (view.decide.same || view.decide.blackout) ? (
                <p className={decideLineClass(view)}>
                  <span className={styles.decideWho}>{L('Everyone')}</span> {decideText(view, L)}
                  {/* I-105 C: the vote's clock, once someone has voted. */}
                  <VoteClock endsAt={view.voteEndsAt} />
                  {/* I-105 B: the room's votes, live. */}
                  <VoteTally votes={view.votes} className={styles.votes} />
                </p>
              ) : null
            }
          />
        </Stage>
      );
    }
    return (
      <Stage center>
        <BigText level="display" tone="muted">
          {L('No bingo')}
        </BigText>
        <BigText level="h1">
          {L("The deck's empty — nobody wins round {round}.", { round: view.round })}
        </BigText>
      </Stage>
    );
  }

  return <TvEnd view={view} />;
}
