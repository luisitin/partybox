// Phone view for Secret Hitler (M1: plain screens). A player with something to do gets its panel
// (PhoneAct); everyone else gets the same waiting card — the phase's words, their dossier (hold to
// see) and a mini board — so a glance at a phone never shows who is doing what (§11). Tabs, the
// claim builder and PhoneStage arrive in M2.
import type { JSX } from 'react';
import { PrimaryButton, WaitingScreen, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { ShControllerView } from '../server/views';
import { PolicyCard } from './Card';
import { CREDIT, roleName, winnerLine } from './labels';
import { phaseLines } from './lines';
import { PhoneAct } from './PhoneAct';
import { PhoneDossier } from './PhoneDossier';
import { STRINGS } from './strings';
import styles from './phone.module.css';

function MiniBoard({ view }: { view: ShControllerView }): JSX.Element {
  const L = useT(STRINGS);
  return (
    <div className={styles.mini} aria-label={L('The board')}>
      <span className={styles.miniRow}>
        <PolicyCard party="L" size="sm" /> {L('{n} of 5', { n: view.board.L })}
      </span>
      <span className={styles.miniRow}>
        <PolicyCard party="F" size="sm" /> {L('{n} of 6', { n: view.board.F })}
      </span>
      <span>
        {L('Election tracker')} {[0, 1, 2].map((i) => (i < view.tracker ? '●' : '○')).join(' ')}
      </span>
    </div>
  );
}

function statusHint(L: ReturnType<typeof useT>, view: ShControllerView): string | null {
  if (view.status === 'executed') return L('You were executed. Ghosts can’t talk or vote.');
  if (view.status === 'exiled') return L('You left this game.');
  if (view.status === 'spectator') return L('You’re in as soon as this one ends.');
  return null;
}

export function Controller({
  view,
  send,
  skip,
}: GameControllerProps<ShControllerView, Input>): JSX.Element {
  const L = useT(STRINGS);
  const act = view.status === 'alive' ? view.act : null;
  if (act) {
    return (
      <>
        {view.lastCall ? (
          <div className={styles.lastCall}>{L('Last call! Choose now.')}</div>
        ) : null}
        <PhoneAct key={`${view.phaseId}:${view.round.n}`} view={view} act={act} send={send} />
      </>
    );
  }
  const over = view.phaseId === 'gameOver' || view.phaseId === 'done';
  const { title, lines } = phaseLines(L, view);
  const hint = statusHint(L, view);
  const role = view.dossier?.role;
  return (
    <WaitingScreen
      title={over ? winnerLine(L, view.winner) : title}
      hint={over ? (role ? L('You were {role}.', { role: roleName(L, role) }) : null) : hint}
      mood={over ? 'done' : 'wait'}
    >
      <div className={styles.waiting}>
        {!over
          ? lines.filter(Boolean).map((line) => (
              <p key={line} className={styles.hint}>
                {line}
              </p>
            ))
          : null}
        {over ? <p className={styles.hint}>{L(CREDIT)}</p> : <PhoneDossier view={view} />}
        <MiniBoard view={view} />
        {skip && (view.phaseId === 'claims' || view.phaseId === 'gameOver') ? (
          <PrimaryButton tone="neutral" onClick={skip}>
            {L('Next')}
          </PrimaryButton>
        ) : null}
      </div>
    </WaitingScreen>
  );
}
