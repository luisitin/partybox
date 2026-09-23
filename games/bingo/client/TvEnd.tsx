// The TV's boards (split out of Tv.tsx at the 300-line cap when its words learned Spanish): the
// points between rounds with the next pattern, the final board's drumroll, and the game's end.
import type { JSX } from 'react';
import { BigText, Scoreboard, Stage, useT } from '@partybox/game-sdk/ui';
import type { BingoTvView } from '../server/views';
import { PATTERN_LABEL, patternCells } from '../server/patterns';
import { PatternDemo } from './PatternDemo';
import { rows } from './TvParts';
import { climbFrom } from './tvBoard';
import { STRINGS } from './strings';
import styles from './Tv.module.css';

export function TvEnd({ view }: { view: BingoTvView }): JSX.Element {
  const L = useT(STRINGS);
  if (view.phaseId === 'final') {
    // The drumroll (loop 246): the final board with the crown withheld, "and the winner is…" —
    // the engine's results screen names them with the fanfare 4 s later.
    const tied = view.standings.filter((r) => r.rank === 1).length > 1;
    return (
      <Stage center>
        <BigText level="h2" tone="muted">
          {L('Final round played')}
        </BigText>
        <BigText level="h1">{L('Final points')}</BigText>
        <Scoreboard rows={rows(view)} noTrophy stagger="up" />
        <BigText level="h2" tone="accent">
          {tied ? L("It's a tie") : L('And the winner is')}
          <span className={styles.ellipsis} aria-hidden>
            …
          </span>
        </BigText>
      </Stage>
    );
  }

  if (view.phaseId === 'scoreboard') {
    const next = view.patterns[view.round] ?? null;
    // Centred like the game-end board (loop 6 pick 2A): the rounds-won table sat in the left half.
    return (
      <Stage center>
        <BigText level="h1">{L('Points')}</BigText>
        {/* I-012 C: the next pattern takes the left of the board, its name under it — shown by
            doing it (loop 432), now big enough to read from the sofa; the first pass thumps. */}
        <div className={styles.boardRow}>
          {next ? (
            <div className={styles.nextUp}>
              <PatternDemo pattern={next} cells={patternCells(next)} size={216} thump />
              <BigText level="h2" tone="accent">
                {L('Next: round {round} — {pattern}', {
                  round: view.round + 1,
                  pattern: L.sent(PATTERN_LABEL[next]),
                })}
              </BigText>
            </div>
          ) : null}
          {/* I-103 A: the rank lands WITH the points — rows climb from where they stood. */}
          <Scoreboard
            rows={rows(view)}
            noTrophy
            stagger="climb"
            climbFrom={climbFrom(view)}
            holdMs={600}
          />
        </div>
      </Stage>
    );
  }

  return (
    <Stage center>
      <BigText level="h1" tone="accent">
        {L("That's bingo!")}
      </BigText>
      <Scoreboard rows={rows(view)} />
    </Stage>
  );
}
