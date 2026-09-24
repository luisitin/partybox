// The TV's round stage — clue, dial, call and reveal share it (the shell cuts straight between
// them, so the dial never moves; only what changes animates). The bubble above the arc carries
// the psychic's thinking dots, then the clue (landing with its reading), then the call or the
// verdict. The reveal plays its own cues on its own frames: `reveal` as the shutter unlatches,
// `jackpot` / `bust` as the points pop.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Avatar, BigText, Stage, useSecondsLeft, useSound, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import { Dial } from '@partybox/game-sdk/ui/dial';
import type { DialMarker } from '@partybox/game-sdk/ui/dial';
import type { TuneTvView } from '../server/index';
import { avatarOf, nameOf, roundLine, teamName, verdictText } from './copy';
import { STRINGS } from './strings';
import styles from './tv.module.css';
import { CoopMeter, TvHeader } from './TvHeader';
import { useReading } from './useReading';

type Props = GameTvProps<TuneTvView>;

/** How long the stage holds a sent clue for its reading before landing it anyway. */
const CLUE_WAIT_MS = 1200;
/** "Lock it in." with this many seconds left on the dial. */
const LOCK_IN_AT_S = 6;
/** The psychic's announcement follows the clue's card by this much. */
const ANNOUNCE_AFTER_MS = 400;

/** The clue lands with its reading — or after a short wait when the reader is slow or off. */
function useClueLanded(view: TuneTvView): boolean {
  const waiting = view.phaseId === 'dial' && view.turn.voiced && view.reading === null;
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (!waiting) return undefined;
    const t = setTimeout(() => setTimedOut(true), CLUE_WAIT_MS);
    return () => clearTimeout(t);
  }, [waiting]);
  return !waiting || timedOut;
}

function useLockIn(view: TuneTvView): void {
  const left = useSecondsLeft(view.deadline, view.paused);
  const due =
    view.phaseId === 'dial' && !view.paused && left !== null && left <= LOCK_IN_AT_S && left > 1;
  useReading(due ? view.lockIn : null);
}

/** The stage's own cues, each on its frame: the clue's card as the dial turns up, the reveal as
 *  the shutter unlatches, jackpot / bust as the points pop. */
function useStageCues(view: TuneTvView): void {
  const play = useSound();
  const reveal = view.reveal;
  const phase = view.phaseId;
  const isVoid = reveal?.void === true;
  useEffect(() => {
    if (phase === 'clue') play('card');
    if (phase === 'reveal') play(isVoid ? 'bust' : 'reveal');
  }, [phase, isVoid, play]);
  const step = phase === 'reveal' ? (reveal?.step ?? 0) : 0;
  const verdict = reveal?.verdict ?? null;
  useEffect(() => {
    if (step !== 1) return;
    if (verdict === 'bullseye' || verdict === 'perfect') play('jackpot');
    else if (verdict === 'missed') play('bust', { gain: 0.6 });
  }, [step, verdict, play]);
}

function Thinking({ text }: { text: string }): JSX.Element {
  return (
    <span className={styles.thinking}>
      {text}
      <span className={styles.dots} aria-hidden>
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>
    </span>
  );
}

/** The bubble over the arc — one fixed slot, so the dial below never moves: the round and whose
 *  turn it is on a small line, then the thinking dots or the clue. */
function Bubble({ view, landed }: { view: TuneTvView; landed: boolean }): JSX.Element {
  const L = useT(STRINGS);
  const { turn } = view;
  const phase = view.phaseId;
  const psychic = nameOf(view.players, turn.psychic);
  const clue = turn.clue !== null && (phase !== 'dial' || landed);
  const caption =
    turn.clue === null
      ? L('{name} is the psychic', { name: psychic })
      : L("{name}'s clue", { name: psychic });
  return (
    <div className={styles.bubble}>
      <span className={styles.who}>
        <Avatar avatarId={avatarOf(view.players, turn.psychic)} size={64} />
      </span>
      <span className={styles.bubbleText}>
        <span className={styles.caption}>
          {roundLine(L, turn)} · {caption}
        </span>
        {clue ? (
          <span key="clue" className={`${styles.clue} ${phase === 'dial' ? styles.clueLands : ''}`}>
            “{turn.clue}”
          </span>
        ) : phase === 'dial' ? (
          <Thinking text={L('Tuning in')} />
        ) : (
          <Thinking text={L('{name} is thinking', { name: psychic })} />
        )}
      </span>
    </div>
  );
}

/** What floats over the dial without moving it: the call's question, the verdict, "No signal!". */
function Overlay({ view }: { view: TuneTvView }): JSX.Element | null {
  const L = useT(STRINGS);
  const { turn, reveal } = view;
  const other = turn.team === 'sun' ? 'moon' : 'sun';
  if (view.phaseId === 'call')
    return (
      <p className={`${styles.overlay} ${styles.callout}`}>
        {L('{team}: is the target LEFT or RIGHT of the needle?', { team: teamName(L, other) })}
      </p>
    );
  if (view.phaseId !== 'reveal' || !reveal) return null;
  if (reveal.void)
    return (
      <div className={`${styles.overlay} ${styles.noSignal}`}>
        <BigText level="display">{L('📺 No signal!')}</BigText>
        <BigText level="h2" tone="muted">
          {L('No clue came through. Nobody scores.')}
        </BigText>
      </div>
    );
  if (reveal.step !== 1) return null;
  const calls = reveal.revealCalls;
  // The verdict floats over the half of the dial the target is not in, so the wedges stay clear.
  const side = reveal.bullseyeAt < 50 ? '67%' : '33%';
  return (
    <div className={`${styles.overlay} ${styles.verdictRow}`} style={{ left: side, top: '66%' }}>
      <span className={styles.verdict}>{verdictText(L, reveal.verdict)}</span>
      {calls && calls.side ? (
        <span className={styles.callResult}>
          {L('{team} called {side}', {
            team: teamName(L, other),
            side: calls.side === 'left' ? L('LEFT') : L('RIGHT'),
          })}{' '}
          {calls.scored ? L('✓ +1') : L('✗')}
        </span>
      ) : null}
    </div>
  );
}

export function TvRound({ view }: Props): JSX.Element {
  const { turn, reveal } = view;
  const phase = view.phaseId;
  const landed = useClueLanded(view);
  // The clue's card leads the psychic's announcement by a beat; the clue itself lands with its voice.
  useReading(
    phase === 'dial' ? (landed ? view.reading : null) : view.reading,
    true,
    phase === 'clue' ? ANNOUNCE_AFTER_MS : 0,
  );
  useLockIn(view);
  useStageCues(view);
  const revealing = phase === 'reveal' && reveal !== undefined && !reveal.void;
  const avatar = (id: string): string => avatarOf(view.players, id);
  const markers: DialMarker[] = revealing
    ? reveal.revealDials.map((d) => ({
        id: d.id,
        pos: d.pos,
        avatarId: avatar(d.id),
        pts: turn.mode === 'solo' ? d.pts : null,
      }))
    : (view.huddleMarks ?? []).map((m) => ({ id: m.id, pos: m.pos, avatarId: avatar(m.id) }));
  const needle = revealing ? reveal.needle : view.needle;
  const showPoints = revealing && reveal.step === 1;
  const badge =
    showPoints && reveal.needlePts !== null && turn.mode !== 'solo' ? `+${reveal.needlePts}` : null;
  return (
    <Stage className={styles.round}>
      {turn.mode === 'teams' ? <TvHeader view={view} /> : null}
      <div className={styles.bubbleRow}>
        <Bubble view={view} landed={landed} />
        {view.coop ? (
          <span className={styles.meterCorner}>
            <CoopMeter total={view.coop.total} max={view.coop.max} />
          </span>
        ) : null}
      </div>
      <div className={styles.dialRow}>
        <Overlay view={view} />
        <Dial
          left={turn.left}
          right={turn.right}
          target={revealing ? reveal.bullseyeAt : null}
          bands={turn.bands}
          open={revealing}
          swing={revealing}
          markers={markers}
          landing={revealing}
          needle={needle}
          needleSettles={revealing}
          needleBadge={badge}
          showPoints={showPoints}
          entrance={phase === 'clue'}
          landGapMs={markers.length > 8 ? 60 : 90}
        />
      </div>
    </Stage>
  );
}
