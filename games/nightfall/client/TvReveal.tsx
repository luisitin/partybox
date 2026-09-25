// The TV's reveal scenes, stepped by the server (NOTES decision 2): dawn (sunrise → the news → the
// cards flip), the hunter's shot, the verdict (ballots land → spotlight → the card flips) and last
// words. Each step's cue plays on the frame the step lands; the narrator speaks on the same frame.
import type { JSX } from 'react';
import { Avatar, useT } from '@partybox/game-sdk/ui';
import type { NightfallTvView } from '../server/index';
import { playerOf } from './lookup';
import { RoleCard } from './RoleCard';
import { STRINGS } from './strings';
import { useStepCue } from './useNarrator';
import { Village } from './Village';
import styles from './Tv.module.css';

/** One cue per step. Not keyed on the deadline: a step re-times when its line arrives (or the
 *  hunter shoots) and must not cue twice; each phase instance mounts the scene afresh. */
function beat(view: NightfallTvView): string {
  return `${view.phaseId}:${view.step}`;
}

function Lines({ view, big }: { view: NightfallTvView; big?: boolean }): JSX.Element {
  const L = useT(STRINGS);
  return (
    <div className={styles.lines}>
      {view.stage.lines.map((line, i) => (
        <h1
          key={`${view.step}-${i}-${line}`}
          className={big ? styles.display : styles.h1}
          style={{ animationDelay: `${i * 260}ms` }}
        >
          {L.sent(line)}
        </h1>
      ))}
    </div>
  );
}

export function DawnScene({ view }: { view: NightfallTvView }): JSX.Element {
  const L = useT(STRINGS);
  const news = view.stage.news;
  const deaths = news ?? [];
  // The phase maps to `silence` (its deadline moves each step): every cue is ours, the first too.
  const cue =
    view.step === 0 ? 'reveal' : view.step === 2 ? 'card' : deaths.length > 0 ? 'bust' : 'cheer';
  useStepCue(beat(view), cue);
  if (view.step === 0) {
    return (
      <div className={`${styles.column} ${styles.centered}`}>
        <Lines view={view} big />
      </div>
    );
  }
  const hunches =
    (view.stage.tally?.length ?? 0) > 0 ? (
      <p className={styles.caption}>
        {L('🤔 = the night’s hunches: who the villagers suspect (anonymous).')}
      </p>
    ) : null;
  if (deaths.length === 0) {
    return (
      <div className={styles.column}>
        <Lines view={view} />
        <Village
          players={view.players}
          living={view.living}
          graveyard={view.graveyard}
          cast={view.cast}
          tally={view.stage.tally}
        />
        {hunches}
      </div>
    );
  }
  return (
    <div className={styles.column}>
      <Lines view={view} />
      <div className={styles.cards}>
        {deaths.map((d, i) => {
          const who = playerOf(view.players, d.id);
          return (
            <RoleCard
              key={d.id}
              name={who?.name ?? ''}
              avatarId={who?.avatarId ?? ''}
              cast={view.cast}
              role={d.role}
              flipped={view.step >= 2 && d.role !== null}
              delayMs={i * 180}
              size="medium"
              dead
            />
          );
        })}
      </div>
      <Village
        players={view.players}
        living={view.living}
        graveyard={[]}
        cast={view.cast}
        tally={view.stage.tally}
        narrow
      />
      {hunches}
    </div>
  );
}

export function HunterScene({ view }: { view: NightfallTvView }): JSX.Element {
  const L = useT(STRINGS);
  const h = view.stage.hunter;
  useStepCue(beat(view), view.step === 0 ? 'wager' : view.step === 1 ? 'bust' : 'card');
  const hunter = h ? playerOf(view.players, h.id) : undefined;
  const shot = h?.shot ? playerOf(view.players, h.shot) : undefined;
  return (
    <div className={styles.column}>
      <Lines view={view} />
      <div className={styles.cards}>
        {hunter ? (
          <div className={styles.aimer}>
            <Avatar avatarId={hunter.avatarId} size="100%" dim />
            <span className={styles.bow} aria-hidden="true">
              🏹
            </span>
          </div>
        ) : null}
        {view.step >= 1 && shot && h ? (
          <RoleCard
            name={shot.name}
            avatarId={shot.avatarId}
            cast={view.cast}
            role={h.role}
            flipped={view.step >= 2 && h.role !== null}
            size="medium"
            dead
          />
        ) : null}
      </div>
      {view.step === 0 ? (
        <>
          <p className={styles.lead}>{L('The hunter is choosing on their phone.')}</p>
          <div className={styles.aimWrap}>
            <Village
              players={view.players}
              living={view.living}
              graveyard={[]}
              cast={view.cast}
              narrow
            />
            <span className={styles.crosshair} aria-hidden="true" />
          </div>
        </>
      ) : null}
    </div>
  );
}

export function VerdictScene({ view }: { view: NightfallTvView }): JSX.Element {
  const L = useT(STRINGS);
  const v = view.stage.verdict;
  const out = v?.out ?? null;
  const flipCue = v?.role === 'wolf' ? 'cheer' : v?.role === 'jester' ? 'jackpot' : 'bust';
  const cue = view.step === 0 ? 'tally' : view.step === 1 ? (out ? 'reveal' : 'tie') : flipCue;
  useStepCue(beat(view), cue);
  const who = out ? playerOf(view.players, out) : undefined;
  const reason =
    v?.reason === 'tie'
      ? L("It's a tie")
      : v?.reason === 'noone'
        ? L('No one had the most votes')
        : null;
  // The eliminated player stands with the living until the TV has shown the result.
  const standing = out && !view.living.includes(out) ? [...view.living, out] : view.living;
  // A big room: smaller faces, and the graveyard waits for the day (the ballots need the room).
  const crowded = standing.length > 10;
  return (
    <div className={styles.column}>
      {view.step === 0 ? (
        <h1 className={styles.h1}>{L.sent(view.stage.lines[0] ?? '')}</h1>
      ) : (
        <>
          {reason ? <p className={styles.kicker}>{reason}</p> : null}
          <Lines view={view} />
        </>
      )}
      <div className={styles.court}>
        <Village
          players={view.players}
          living={view.step >= 2 && out ? view.living : standing}
          graveyard={view.step >= 2 || crowded ? [] : view.graveyard.filter((g) => g.id !== out)}
          cast={view.cast}
          ballots={v?.ballots ?? []}
          spotlight={view.step >= 1 ? out : null}
          narrow={crowded || (view.step >= 2 && out !== null)}
        />
        {view.step >= 2 && who ? (
          <div className={styles.overlay}>
            <RoleCard
              name={who.name}
              avatarId={who.avatarId}
              cast={view.cast}
              role={v?.role ?? null}
              flipped
              flipAfterMs={520}
              size="medium"
              dead
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function LastWordsScene({ view }: { view: NightfallTvView }): JSX.Element {
  const words = view.stage.lastWords;
  useStepCue(beat(view), view.step === 1 ? 'card' : null);
  const who = words ? playerOf(view.players, words.by) : undefined;
  return (
    <div className={`${styles.column} ${styles.centered}`}>
      <Lines view={view} />
      <div className={styles.speaker}>
        {who ? (
          <span className={styles.speakerFace}>
            <Avatar avatarId={who.avatarId} size="100%" dim />
          </span>
        ) : null}
        {words?.text ? (
          <blockquote className={styles.bubble}>“{words.text}”</blockquote>
        ) : (
          <span className={styles.typing} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        )}
      </div>
    </div>
  );
}
