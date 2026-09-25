// Phone view for Secret Hitler. A player with something to do gets its panel (PhoneAct); everyone
// else gets the same waiting card for the phase — its words, and the TV's moment in miniature on
// the TV's timing (a stamp, the decree turning over, the sealed envelope) — so a glance at a phone
// never shows who is doing what (§11) and never runs ahead of the TV. Every screen keeps the
// dossier folder on top and the roster of every seat at the bottom.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { PrimaryButton, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { ShControllerView } from '../server/views';
import { MaskEmblem, PartyEmblem, Stamp } from './art';
import { FlipCard } from './Card';
import { CREDIT, endingBanner, roleName, winnerLine } from './labels';
import { phaseLines } from './lines';
import { PhoneAct } from './PhoneAct';
import { PhoneFrame } from './PhoneFrame';
import type { Frame } from './PhoneFrame';
import './sh-global.css';
import { STRINGS } from './strings';
import theme from './theme.module.css';
import styles from './phone.module.css';

function statusHint(L: ReturnType<typeof useT>, view: ShControllerView): string | null {
  if (view.status === 'executed') return L('You were executed. Ghosts can’t talk or vote.');
  if (view.status === 'exiled') return L('You left this game.');
  if (view.status === 'spectator') return L('You’re in as soon as this one ends.');
  return null;
}

/** The TV's moment, small, on the same clock as the TV. */
function Moment({ view }: { view: ShControllerView }): JSX.Element | null {
  const L = useT(STRINGS);
  const r = view.round;
  const [up, setUp] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setUp(true), 450);
    return () => clearTimeout(t);
  }, []);
  switch (view.phaseId) {
    case 'voteReveal':
      return (
        <Stamped
          text={r.elected ? L('ELECTED') : L('REJECTED')}
          tone={r.elected ? 'brass' : 'alarm'}
          delay={1800}
        />
      );
    case 'hitlerCheck':
      return view.winner ? (
        <div className={styles.moment} style={{ animationDelay: '2000ms' }}>
          <MaskEmblem size="8rem" />
        </div>
      ) : (
        <Stamped text={L('NOT HITLER')} tone="liberal" delay={2000} />
      );
    case 'enactReveal':
    case 'chaos': {
      const card = view.phaseId === 'chaos' ? r.chaosCard : r.enacted;
      return card ? (
        <div className={styles.momentCard}>
          <FlipCard party={card} up={up} />
        </div>
      ) : null;
    }
    case 'presDraw':
    case 'chanEnact':
    case 'vetoAsk':
      return (
        <div className={styles.envelope} aria-hidden="true">
          <span className={styles.flap} />
          <span className={styles.wax} />
        </div>
      );
    case 'powerReveal':
      if (r.power?.kind === 'execute')
        return <Stamped text={L('EXECUTED')} tone="alarm" delay={1200} />;
      return r.power?.kind === 'investigate' ? (
        <div className={styles.fileMoment} aria-hidden="true">
          <span>{L('CLASSIFIED')}</span>
        </div>
      ) : null;
    case 'claims':
      // The law they just passed, face-up, while the table argues about it.
      return r.enacted ? (
        <div className={styles.momentCard} data-small>
          <FlipCard party={r.enacted} up />
        </div>
      ) : null;
    default:
      return null;
  }
}

function Stamped({
  text,
  tone,
  delay,
}: {
  text: string;
  tone: 'alarm' | 'brass' | 'liberal';
  delay: number;
}): JSX.Element {
  return (
    <div className={styles.stampAt} style={{ animationDelay: `${delay}ms` }}>
      <Stamp text={text} tone={tone} className={styles.stamp} />
    </div>
  );
}

export function Controller({
  view,
  send,
  skip,
}: GameControllerProps<ShControllerView, Input>): JSX.Element {
  const L = useT(STRINGS);
  // The dossier starts closed (a neighbour can't read a phone nobody touched, review 4fa011 #3)
  // and its cover beckons at the start until it has been opened once.
  const [dossierOpen, setDossierOpenState] = useState(false);
  const [readOnce, setReadOnce] = useState(false);
  const setDossierOpen = (open: boolean): void => {
    setDossierOpenState(open);
    if (open) setReadOnce(true);
  };
  // A new phase closes it again (the player's next job is on screen; a secret isn't left out).
  const [seenPhase, setSeenPhase] = useState(view.phaseId);
  if (seenPhase !== view.phaseId) {
    setSeenPhase(view.phaseId);
    setDossierOpenState(false);
  }
  const act = view.status === 'alive' ? view.act : null;
  const frame: Frame = {
    view,
    dossierOpen,
    setDossierOpen,
    beckon: view.phaseId === 'seating' && !readOnce,
    // A choice on screen: the cover shrinks to one line so the choice sits above the button.
    compact: act !== null && act.kind !== 'ready',
  };
  const over = view.phaseId === 'gameOver' || view.phaseId === 'done';
  const { title, lines } = phaseLines(L, view);
  const hint = statusHint(L, view);
  const role = view.dossier?.role;
  const next = skip && (view.phaseId === 'claims' || view.phaseId === 'gameOver');
  return (
    <div
      className={`${theme.sh} ${styles.phone}`}
      data-surface="phone"
      data-phase={view.phaseId}
      data-paused={view.paused || undefined}
    >
      {view.lastCall && act ? (
        <div className={styles.lastCall}>{L('Last call! Choose now.')}</div>
      ) : null}
      {act ? (
        <PhoneAct key={`${view.phaseId}:${view.round.n}`} frame={frame} act={act} send={send} />
      ) : (
        <PhoneFrame
          // A fresh scroll per phase: the win screen never opens scrolled past its headline.
          key={view.phaseId}
          frame={frame}
          kicker={over ? endingBanner(L, view.winReason, view.winner) : (hint ?? undefined)}
          title={over ? winnerLine(L, view.winner) : title}
          actions={
            next ? (
              <PrimaryButton tone="neutral" onClick={skip}>
                {L('Next')}
              </PrimaryButton>
            ) : undefined
          }
        >
          <div key={`${view.phaseId}:${view.round.n}`} className={styles.waiting}>
            {over ? (
              <>
                {role ? (
                  <div className={styles.roleReveal} data-role={role}>
                    {role === 'hitler' ? (
                      <MaskEmblem size="5rem" />
                    ) : (
                      <PartyEmblem party={role === 'liberal' ? 'L' : 'F'} size="4.5rem" />
                    )}
                    <span className={styles.roleName}>{roleName(L, role)}</span>
                    <span>{L('You were {role}.', { role: roleName(L, role) })}</span>
                  </div>
                ) : null}
                <p className={styles.hint}>{L(CREDIT)}</p>
              </>
            ) : (
              lines.filter(Boolean).map((line, i) => (
                <p
                  key={line}
                  className={styles.line}
                  style={{ animationDelay: `${120 + i * 120}ms` }}
                >
                  {line}
                </p>
              ))
            )}
            <Moment view={view} />
          </div>
        </PhoneFrame>
      )}
    </div>
  );
}
