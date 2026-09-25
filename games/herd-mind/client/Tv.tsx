// TV for Herd Mind: one stage per phase, inside the overscan-safe Stage. Dumb — renders the view,
// plays its readings and cues on the choreography's beats; the shell shows the strip, the timer
// and the host bar. Over any phase: the settings hold (someone's menu is open — the stage stands
// still) and the 3 · 2 · 1s (before question 1, and back from a hold).
import type { JSX } from 'react';
import { Stage, useServerNow, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps, PushedView } from '@partybox/game-sdk/ui';
import type { HerdTvView } from '../server/views';
import { Countdown, holdLine } from './Settings';
import { STRINGS } from './strings';
import { TvAnswer } from './TvAnswer';
import { TvHerd } from './TvHerd';
import { TvScore } from './TvScore';
import styles from './Tv.module.css';

function Screen({ view }: { view: PushedView<HerdTvView> }): JSX.Element {
  switch (view.phaseId) {
    case 'answer':
      return <TvAnswer view={view} />;
    case 'herd':
      return <TvHerd view={view} />;
    default:
      return <TvScore view={view} />;
  }
}

export function Tv({ view }: GameTvProps<HerdTvView>): JSX.Element {
  const L = useT(STRINGS);
  const now = useServerNow(200);
  const names = view.holdBy.map((id) => view.players.find((p) => p.id === id)?.name ?? '?');
  const resuming = view.resumeAt !== null && now < view.resumeAt;
  // A hold or a count freezes the choreography (its beats resume where they stopped).
  const frozen = names.length > 0 || resuming;
  const shown = frozen ? { ...view, paused: true } : view;
  return (
    <Stage>
      <Screen view={shown} />
      {names.length > 0 ? (
        <div className={styles.hold} role="status">
          <span className={styles.holdGlyph} aria-hidden>
            ⏸
          </span>
          <p className={styles.holdLine}>{holdLine(names, L)}</p>
          <p className={styles.holdHint}>{L('Anyone can change theirs: tap ⚙️ on your phone.')}</p>
        </div>
      ) : resuming && view.resumeAt !== null ? (
        <Countdown until={view.resumeAt} line={L('Back to the game')} size="tv" />
      ) : null}
    </Stage>
  );
}
