// TV view for Nightfall: a sky per mood behind every scene, the narrator on its frame, and one scene
// per phase (SPEC §10.9). Dumb: it renders the view; the server paces every reveal step.
import type { JSX } from 'react';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { NightfallTvView } from '../server/index';
import { Sky } from './Sky';
import type { Mood } from './Sky';
import { DawnScene, HunterScene, LastWordsScene, VerdictScene } from './TvReveal';
import { DayScene, NightScene, RolesScene, VoteScene } from './TvScenes';
import { EndScene } from './TvEnd';
import { useNarrator } from './useNarrator';
import styles from './Tv.module.css';

function moodOf(view: NightfallTvView): Mood {
  switch (view.phaseId) {
    case 'roles':
      return 'dusk';
    case 'night':
      return 'night';
    case 'dawn':
      return 'dawn';
    case 'verdict':
    case 'last-words':
    case 'hunter':
      return 'court';
    case 'end':
    case 'done':
      return 'end';
    default:
      return 'day';
  }
}

export function Tv({ view }: GameTvProps<NightfallTvView>): JSX.Element {
  useNarrator(view.stage.say);
  const mood = moodOf(view);
  return (
    <div className={styles.tv} data-mood={mood} data-phase={view.phaseId} data-step={view.step}>
      <Sky mood={mood} risen={view.phaseId === 'dawn' && view.step >= 1} />
      <div className={styles.scene}>
        <Scene view={view} />
      </div>
    </div>
  );
}

function Scene({ view }: { view: NightfallTvView }): JSX.Element {
  switch (view.phaseId) {
    case 'roles':
      return <RolesScene view={view} />;
    case 'night':
      return <NightScene view={view} />;
    case 'dawn':
      return <DawnScene view={view} />;
    case 'hunter':
      return <HunterScene view={view} />;
    case 'day':
      return <DayScene view={view} />;
    case 'vote':
    case 'runoff':
      return <VoteScene view={view} />;
    case 'verdict':
      return <VerdictScene view={view} />;
    case 'last-words':
      return <LastWordsScene view={view} />;
    default:
      return <EndScene view={view} />;
  }
}
