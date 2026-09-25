// TV: the title card, the question card, the lie table and the pick grid. The fact card keeps its
// place across lie → pick → reveal so the room's eyes never have to hunt for it.
import type { JSX, ReactNode } from 'react';
import { Avatar, Stage, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps, ViewPlayer } from '@partybox/game-sdk/ui';
import type { FakeOutTvView } from '../server/index';
import { useClipAt, useCueOnce } from './beats';
import { EnglishNote } from './EnglishNote';
import { FactCard } from './FactCard';
import { OptionGrid } from './OptionGrid';
import { kicker } from './labels';
import { STRINGS } from './strings';
import styles from './tv.module.css';

type Props = GameTvProps<FakeOutTvView>;

export function TvQuestion({ view }: Props): JSX.Element {
  const L = useT(STRINGS);
  useCueOnce('card', `q${view.n}`);
  useClipAt(view.lead?.url ?? null, view.lead?.at ?? 0);
  useClipAt(view.reading?.url ?? null, view.reading?.at ?? 0);
  return (
    <Stage center className={styles.question}>
      <p className={`${styles.kicker} ${view.final ? styles.kickerFinal : ''}`}>
        {kicker(L, view)}
      </p>
      <EnglishNote />
      <div className={styles.flipScene}>
        <div className={styles.questionCard} key={view.n}>
          <FactCard fact={view.fact} size="h1" read={view.readAlong} />
        </div>
      </div>
    </Stage>
  );
}

function Holdouts({ view, what }: { view: FakeOutTvView; what: 'lies' | 'picks' }): JSX.Element {
  const L = useT(STRINGS);
  const waiting = view.players.filter((p) => p.status === 'active' && p.connected);
  const line =
    what === 'lies'
      ? L('{n} / {total} lies in', { n: view.inCount, total: view.expected })
      : L('{n} / {total} picked', { n: view.inCount, total: view.expected });
  return (
    <span className={styles.progress} role="status" aria-live="polite" key={view.inCount}>
      {line}
      {waiting.length > 0 && waiting.length <= 3 ? (
        <>
          <span className={styles.progressDot} aria-hidden>
            ·
          </span>
          {L('waiting for')}
          {waiting.map((p: ViewPlayer) => (
            <span key={p.id} className={styles.holdout}>
              <Avatar avatarId={p.avatarId} size="var(--pb-space-7)" />
              {p.name}
            </span>
          ))}
        </>
      ) : null}
    </span>
  );
}

/** The fact on top, the phase's own business below. */
function RoundFrame({ view, children }: { view: FakeOutTvView; children: ReactNode }): JSX.Element {
  const L = useT(STRINGS);
  return (
    <Stage className={styles.round}>
      <p className={`${styles.kicker} ${view.final ? styles.kickerFinal : ''}`}>
        {kicker(L, view)}
      </p>
      <div className={styles.factPanel}>
        <FactCard fact={view.fact} size="h2" />
      </div>
      {children}
    </Stage>
  );
}

/** Face-down slips pile up in the middle as lies come in (never their words). */
function LiePile({ count }: { count: number }): JSX.Element {
  const slips = Array.from({ length: count }, (_, i) => i);
  return (
    <div className={styles.pile} aria-hidden>
      {slips.map((i) => (
        <span
          key={i}
          className={styles.slip}
          style={{
            ['--r' as string]: `${((i * 47) % 17) - 8}deg`,
            ['--x' as string]: `${((i * 29) % 13) - 6}px`,
          }}
        >
          🎭
        </span>
      ))}
    </div>
  );
}

export function TvLie({ view }: Props): JSX.Element {
  const L = useT(STRINGS);
  useClipAt(view.lead?.url ?? null, view.lead?.at ?? 0);
  return (
    <RoundFrame view={view}>
      <div className={styles.lieBody}>
        <p className={styles.callout}>
          <span className={styles.pen} aria-hidden>
            ✍️
          </span>
          {L('Write a fake answer on your phone')}
        </p>
        <LiePile count={view.inCount} />
        <Holdouts view={view} what="lies" />
      </div>
    </RoundFrame>
  );
}

export function TvPick({ view }: Props): JSX.Element {
  const L = useT(STRINGS);
  useClipAt(view.lead?.url ?? null, view.lead?.at ?? 0);
  return (
    <RoundFrame view={view}>
      <div className={styles.pickHead}>
        <p className={styles.callout}>{L('Which one is the truth?')}</p>
        <Holdouts view={view} what="picks" />
      </div>
      <OptionGrid options={view.options} />
    </RoundFrame>
  );
}
