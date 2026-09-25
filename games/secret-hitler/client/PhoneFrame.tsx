// Every phone screen in this game: the dossier folder at the top (tap to read), the phase's own
// content, and a dock at the bottom with the phase's buttons above the roster of every seat. The
// roster marks the dossier's teammates only while the dossier is open.
import type { JSX, ReactNode } from 'react';
import { Screen } from '@partybox/game-sdk/ui';
import type { ShControllerView } from '../server/views';
import { PhoneDossier } from './PhoneDossier';
import { Roster } from './Roster';
import styles from './phone.module.css';

export interface Frame {
  view: ShControllerView;
  dossierOpen: boolean;
  setDossierOpen: (open: boolean) => void;
}

export function PhoneFrame({
  frame,
  title,
  kicker,
  actions,
  children,
}: {
  frame: Frame;
  title?: ReactNode;
  kicker?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}): JSX.Element {
  const { view, dossierOpen, setDossierOpen } = frame;
  return (
    <Screen
      className={styles.screen}
      footer={
        <div className={styles.dock}>
          {actions ? <div className={styles.actions}>{actions}</div> : null}
          <Roster view={view} showTeam={dossierOpen} />
        </div>
      }
    >
      <div className={styles.body}>
        <PhoneDossier view={view} open={dossierOpen} onOpen={setDossierOpen} />
        {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
        {title ? <h2 className={styles.title}>{title}</h2> : null}
        {children}
      </div>
    </Screen>
  );
}
