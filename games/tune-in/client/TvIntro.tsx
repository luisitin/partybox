// The intro card (once): the title, the mode, the three steps told for that mode, and beside the
// title a small dial tuning back and forth so the card is never still. Teams drop the dial (sixteen
// players ran off the card) for both rosters under the steps, the side that plays first pulsing.
// The owner's pacing rule [cc45f4]: the room reads the rules and each phone taps I'm ready — the
// faces still to tap breathe, each tap lands a ✓ — then a clear 3 · 2 · 1 over the whole card.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Avatar, BigText, Stage, useReducedMotion, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import { Dial } from '@partybox/game-sdk/ui/dial';
import type { TuneTvView } from '../server/index';
import { modeLine, steps } from './copy';
import { STRINGS } from './strings';
import styles from './tv.module.css';
import { Countdown } from './Countdown';
import { EnglishNote } from './EnglishNote';
import { Rosters } from './Rosters';
import { useReading } from './useReading';

const SWEEP = [22, 78, 35, 64, 50];

function useSweep(): number {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced) return undefined;
    const t = setInterval(() => setI((n) => (n + 1) % SWEEP.length), 900);
    return () => clearInterval(t);
  }, [reduced]);
  return SWEEP[i] ?? 50;
}

/** Who has tapped I'm ready: every player's face, a ✓ on the ready ones, the rest breathing. */
function ReadyRow({ view, faces }: { view: TuneTvView; faces: boolean }): JSX.Element {
  const L = useT(STRINGS);
  const people = view.players.filter((p) => p.status !== 'spectator');
  return (
    <div className={styles.readyRow}>
      <p className={styles.readyLine}>
        {L('Read the rules, then tap I’m ready on your phone')}
        <span className={styles.readyCount}>
          {L('{n} of {total} ready', { n: view.ready.length, total: view.readyHere })}
        </span>
      </p>
      {faces ? (
        <ul className={styles.readyFaces}>
          {people.map((p) => {
            const ready = view.ready.includes(p.id);
            return (
              <li key={p.id} className={`${styles.readyFace} ${ready ? styles.isReady : ''}`}>
                <Avatar avatarId={p.avatarId} size={56} />
                {ready ? (
                  <span className={styles.readyTick} aria-hidden>
                    ✓
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export function TvIntro({ view }: GameTvProps<TuneTvView>): JSX.Element {
  const L = useT(STRINGS);
  const needle = useSweep();
  useReading(view.reading);
  const mode = view.turn.mode;
  return (
    <Stage className={styles.intro}>
      <div className={`${styles.introTop} ${mode === 'teams' ? styles.introTopTeams : ''}`}>
        <div className={styles.introTitle}>
          <BigText level="display">{L('📻 Tune In')}</BigText>
          <BigText level="h2" tone="accent">
            {modeLine(L, mode)}
          </BigText>
          <EnglishNote className={styles.englishNote} />
        </div>
        {/* Teams: the ready line takes the dial's place beside the title (16 players' rosters need
            the rows below). */}
        {mode === 'teams' ? (
          <ReadyRow view={view} faces={false} />
        ) : (
          <div className={styles.introDial} aria-hidden>
            <Dial
              left={L('Cold')}
              right={L('Hot')}
              target={null}
              bands={view.turn.bands}
              open={false}
              needle={needle}
              entrance
            />
          </div>
        )}
      </div>
      <ol className={styles.steps}>
        {steps(L, mode).map((s, i) => (
          <li key={s} className={styles.step} style={{ animationDelay: `${200 + i * 160}ms` }}>
            <span className={styles.stepNo}>{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      {/* Teams tick the ready players inside the rosters (a face row as well would crowd 16). */}
      {mode === 'teams' ? null : <ReadyRow view={view} faces />}
      {mode === 'teams' && view.teams ? (
        <Rosters
          teams={view.teams}
          players={view.players}
          first={view.turn.team}
          ready={view.ready}
        />
      ) : null}
      {view.startAt !== null ? (
        <div className={styles.countOverlay}>
          <Countdown startAt={view.startAt} paused={view.paused} size="tv" tick />
        </div>
      ) : null}
    </Stage>
  );
}
