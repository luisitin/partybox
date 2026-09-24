// TV stage for Spy Grid. `teams` has its own screen; every other phase is the board: two team
// banners with the clue bar between them, the 5×5 grid, the history strip, and the turn's summary
// or the round's result over it. The stage remounts per phase (the shell's swap), so each phase's
// entrance — a card turning, the win's ripple — is its choreography.
import type { JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { SpyTvView } from '../server/views';
import { useTvMoments, useVoice } from './moments';
import { cardsOf, coordLabel, faceOf } from './model';
import type { Team } from './model';
import { TeamBanner } from './TeamBanner';
import type { TeamSide } from './TeamBanner';
import { ClueBar, History, TurnEndCard, WinBanner } from './TvParts';
import { TvTeams } from './TvTeams';
import { WordGrid } from './WordGrid';
import styles from './Tv.module.css';
import { STRINGS } from './strings';

export function sideOf(view: SpyTvView, team: Team): TeamSide {
  const active = view.turnTeam === team && view.phaseId !== 'win' && view.phaseId !== 'done';
  const connected = new Set(view.players.filter((p) => p.connected).map((p) => p.id));
  return {
    team,
    faces: view.teams[team]
      .map((id) => {
        const f = faceOf(view, id);
        return f ? { ...f, spy: view.spymaster[team] === id, dim: !connected.has(id) } : null;
      })
      .filter((f) => f !== null),
    left: view.phaseId === 'teams' ? null : view.left[team],
    lit: !active ? 'off' : view.phaseId === 'clue' ? 'half' : 'on',
    wins: view.rounds > 1 ? view.roundWins[team] : null,
  };
}

function Board({ view }: { view: SpyTvView }): JSX.Element {
  const L = useT(STRINGS);
  useTvMoments(view);
  useVoice(view);
  const coop = view.mode === 'coop';
  const flipping = view.phaseId === 'flip' ? (view.flipping?.card ?? null) : null;
  return (
    <div className={`${styles.board} ${coop ? styles.coop : ''}`}>
      {view.phaseId === 'win' ? (
        <WinBanner view={view} />
      ) : (
        <header className={styles.header}>
          <TeamBanner side={sideOf(view, 'sun')} surface="tv" />
          <ClueBar view={view} />
          {coop ? (
            <div className={styles.coopSlot} />
          ) : (
            <TeamBanner side={sideOf(view, 'moon')} surface="tv" align="end" />
          )}
        </header>
      )}
      <div className={styles.gridArea}>
        <WordGrid
          surface="tv"
          cards={cardsOf(view)}
          focus={flipping}
          label={(i) => coordLabel(view, i, L)}
        />
        {view.phaseId === 'turn-end' ? (
          <div className={styles.overlay}>
            <TurnEndCard view={view} />
          </div>
        ) : null}
      </div>
      <History view={view} />
    </div>
  );
}

export function Tv({ view }: GameTvProps<SpyTvView>): JSX.Element {
  if (view.phaseId === 'teams') return <TvTeams view={view} />;
  return <Board view={view} />;
}
