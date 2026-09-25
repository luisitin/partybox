// The phone after the TV's points beat (never before it, P00 §7.3): the player's own result, big —
// "+4 · Bullseye! You were 2 away", the psychic's average, the caller's verdict — then, in
// `scores`, the running total and the VIP's Next round / See results.
import type { JSX } from 'react';
import { PrimaryButton, Screen, WaitingScreen, usePhoneOnly, useT } from '@partybox/game-sdk/ui';
import type { Translator } from '@partybox/game-sdk/ui';
import { DialStrip } from '@partybox/game-sdk/ui/dial';
import { TeamBanner } from '@partybox/game-sdk/ui/team-banner';
import type { TuneControllerView } from '../server/index';
import { avatarOf, ratingText, roundLine } from './copy';
import styles from './phone.module.css';
import { STRINGS } from './strings';

function band(L: Translator, pts: number): string {
  if (pts === 4) return L('Bullseye!');
  return pts > 0 ? L('Close!') : L('Missed it.');
}

function needleLine(L: Translator, view: TuneControllerView, pts: number): string {
  if (pts === 0)
    return view.turn.mode === 'coop'
      ? L('The group needle missed')
      : L("Your team's needle missed");
  return view.turn.mode === 'coop'
    ? L('The group needle scored +{pts}', { pts })
    : L("Your team's needle scored +{pts}", { pts });
}

/** "+4", but a plain "0" — never "+0". */
function plus(pts: number): string {
  return pts > 0 ? `+${pts}` : '0';
}

/** One big number and the sentence under it. */
function lines(L: Translator, view: TuneControllerView): { big: string; line: string } {
  const reveal = view.reveal;
  const mine = view.mine;
  if (!reveal || reveal.void)
    return { big: '📺', line: L('No signal — nobody scores this round.') };
  const isPsychic = view.me.id === view.turn.psychic;
  if (isPsychic && mine) {
    if (mine.psychic) {
      const { sum, n, perfect } = mine.psychic;
      if (n === 0) return { big: '0', line: L('Nobody dialled — 0 this time.') };
      const avg = String(Math.round((sum / n) * 100) / 100);
      const line = L('Your guessers averaged {avg} → +{pts}', { avg, pts: mine.pts });
      return { big: plus(mine.pts), line: perfect ? `${line} · ${L('Perfect tune!')}` : line };
    }
    return { big: plus(mine.pts), line: needleLine(L, view, mine.pts) };
  }
  if (mine && mine.away !== null) {
    const away = L('You were {n} away', { n: mine.away });
    if (view.turn.mode === 'solo')
      return { big: plus(mine.pts), line: `${band(L, mine.pts)} ${away}` };
    // The needle scored, not this dial: "Bullseye! You were 3 away" read as a contradiction.
    // The separator sticks to the first half: a wrap never starts a line with "·".
    return { big: plus(mine.pts), line: `${needleLine(L, view, mine.pts)}\u00a0· ${away}` };
  }
  const calls = reveal.revealCalls;
  if (view.turn.mode === 'teams' && view.myTeam !== view.turn.team && calls) {
    if (!calls.side) return { big: '0', line: L('No call this time.') };
    const side = calls.side === 'left' ? L('LEFT') : L('RIGHT');
    return calls.scored
      ? { big: '+1', line: L('Your team called {side} — right!', { side }) }
      : { big: '0', line: L('Your team called {side} — not this time.', { side }) };
  }
  return { big: '·', line: L("You didn't dial this time.") };
}

export function WatchTv(): JSX.Element {
  const L = useT(STRINGS);
  const phoneOnly = usePhoneOnly();
  return (
    <WaitingScreen
      mood="watch"
      title={phoneOnly ? L('Here it comes…') : L('👀 Watch the TV')}
      hint={L('The target is opening up.')}
    />
  );
}

/** The round in a picture: the target's zones, my own dial (or, for the psychic, everyone's),
 *  and the needle when there is one. */
function Picture({ view }: { view: TuneControllerView }): JSX.Element | null {
  const reveal = view.reveal;
  if (!reveal || reveal.void) return null;
  const mine = view.me.id === view.turn.psychic || view.turn.mode !== 'solo';
  const marks = reveal.revealDials
    .filter((d) => mine || d.id === view.me.id)
    .map((d) => ({ id: d.id, pos: d.pos, avatarId: avatarOf(view.players, d.id) }));
  return (
    <DialStrip
      className={styles.picture}
      left={view.turn.left}
      right={view.turn.right}
      target={reveal.bullseyeAt}
      bands={view.turn.bands}
      marks={marks}
      needle={reveal.needle}
    />
  );
}

/** Solo's standing: "2nd of 6" (ties share). */
function standing(L: Translator, view: TuneControllerView): string {
  const mine = view.players.find((p) => p.id === view.me.id)?.score ?? 0;
  const place = 1 + view.players.filter((p) => (p.score ?? 0) > mine).length;
  // The separator sticks to the number: a wrap never starts a line with "·".
  return L('Your total: {n} · place {place} of {count}', {
    n: mine,
    place,
    count: view.players.length,
  }).replace(' · ', '\u00a0· ');
}

export function PhoneResult({
  view,
  skip,
}: {
  view: TuneControllerView;
  skip?: () => void;
}): JSX.Element {
  const L = useT(STRINGS);
  const { big, line } = lines(L, view);
  const scores = view.phaseId === 'scores';
  const teams = view.turn.mode === 'teams';
  return (
    <Screen
      className={`${styles.screen} ${scores ? styles.atScores : ''}`}
      footer={
        scores && skip ? (
          <PrimaryButton onClick={skip}>
            {view.last ? L('See results') : L('Next round')}
          </PrimaryButton>
        ) : undefined
      }
    >
      <p className={styles.kicker}>{roundLine(L, view.turn)}</p>
      <div className={`${styles.middle} ${scores && teams ? styles.even : ''}`}>
        <div className={styles.result} role="status">
          <span key={big} className={styles.big}>
            {big}
          </span>
          <span className={styles.resultLine}>{line}</span>
          {/* Teams' scores swap the picture for the totals: both did not fit a 320 × 568 phone. */}
          {scores && teams ? null : <Picture view={view} />}
        </div>
        {scores && teams ? (
          <TeamBanner
            size="phone"
            sun={view.team.sun}
            moon={view.team.moon}
            winAt={view.winAt}
            active={view.myTeam}
            words={{ sun: L('Sun'), moon: L('Moon'), middle: L('First to {n}', { n: view.winAt }) }}
          />
        ) : null}
        {scores && view.turn.mode === 'coop' && view.coop ? (
          <p className={styles.total}>
            {L('Group {total} / {max}', { total: view.coop.total, max: view.coop.max })}
            {'\u00a0· '}
            {ratingText(L, view.coop.rating)}
          </p>
        ) : null}
        {scores && view.turn.mode === 'solo' ? (
          <p className={styles.total}>{standing(L, view)}</p>
        ) : null}
      </div>
    </Screen>
  );
}
