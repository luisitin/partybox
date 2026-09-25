// The teams card (phase "intro", teams only): after the shell's start stage (ADR-053) had the rules,
// READY and the 3 · 2 · 1, the room sees its two sides — every face under ▲ Sun and ● Moon, the side
// that plays first pulsing, and who reads the first dial. Seven seconds (the VIP can skip), while the
// first reading is made; "Tune in!" plays over it.
import type { JSX } from 'react';
import { BigText, Stage, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { TuneTvView } from '../server/index';
import { modeLine, nameOf, teamName } from './copy';
import { Rosters } from './Rosters';
import { STRINGS } from './strings';
import styles from './tv.module.css';
import { useReading } from './useReading';

export function TvIntro({ view }: GameTvProps<TuneTvView>): JSX.Element {
  const L = useT(STRINGS);
  useReading(view.reading);
  const { turn } = view;
  // 11+ players: three rows of chips in the strip and four names a side, so the title and the faces
  // step down and the rosters still end above the host bar.
  const crowded = view.players.length > 10;
  return (
    <Stage center className={styles.intro}>
      <div className={styles.introTitle}>
        <BigText level={crowded ? 'h1' : 'display'}>{L('📻 Tune In')}</BigText>
        <BigText level="h2" tone="accent">
          {modeLine(L, turn.mode)}
        </BigText>
      </div>
      {turn.team ? (
        <p className={styles.introFirst}>
          {L('{team} plays first · {name} reads the first dial', {
            team: teamName(L, turn.team),
            name: nameOf(view.players, turn.psychic),
          })}
        </p>
      ) : null}
      {view.teams ? (
        <Rosters
          teams={view.teams}
          players={view.players}
          first={turn.team}
          large
          faceSize={crowded ? 48 : 56}
        />
      ) : null}
    </Stage>
  );
}
