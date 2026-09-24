// TV score: what happened in one line, then the race — +1 over the herd, the Black Sheep's flight,
// the faces sliding up their lanes — and either the winner's banner or the next question coming.
import { useEffect, useRef } from 'react';
import type { JSX } from 'react';
import { Confetti, DeadlineBar, useSound, useT } from '@partybox/game-sdk/ui';
import type { PushedView } from '@partybox/game-sdk/ui';
import type { HerdTvView } from '../server/views';
import { PLUS_AT_MS, RACE_AT_MS, SHEEP_AT_MS, WIN_BANNER_AT_MS } from '../server/timing';
import { useLines, useStageBeats } from './beats';
import { kicker, nameList } from './labels';
import { RaceTrack } from './RaceTrack';
import { STRINGS } from './strings';
import styles from './Race.module.css';

/** The "next question" card rises once the race has settled, so the stage never stands still. */
const NEXT_AT_MS = 2_400;

export function TvScore({ view }: { view: PushedView<HerdTvView> }): JSX.Element {
  const L = useT(STRINGS);
  const play = useSound();
  // A win worth a fanfare has points; a room that never scored ends on a quiet draw.
  const won = view.winners.some((id) => (view.players.find((p) => p.id === id)?.score ?? 0) > 0);
  const draw = !won && view.winners.length > 0;
  const beat = useStageBeats(
    [0, PLUS_AT_MS, SHEEP_AT_MS, RACE_AT_MS, won ? WIN_BANNER_AT_MS : NEXT_AT_MS],
    view.paused,
  );
  const moving = view.sheep !== null && view.sheep !== view.sheepFrom;
  useLines(view.lines, { sheep: 2, winner: 4 }, beat);
  const cued = useRef(new Set<string>());
  useEffect(() => {
    const cue = (id: string, go: boolean, fn: () => void): void => {
      if (go && !cued.current.has(id)) {
        cued.current.add(id);
        fn();
      }
    };
    cue('sweep', moving && beat >= 2, () => play('sweep'));
    cue('win', won && beat >= 4, () => play('fanfare'));
  }, [beat, moving, won, play]);

  const herd = view.groups?.find((g) => g.key === view.herd);
  const name = (id: string | null): string => view.players.find((p) => p.id === id)?.name ?? '';
  // A big herd is a count, not a list of nine names.
  const herdLine = (label: string): string =>
    view.scored.length > 4
      ? L('{answer}: {count} in the herd, +1 each', { answer: label, count: view.scored.length })
      : L('{answer}: {names} +1', { answer: label, names: nameList(view.scored, view.players, L) });
  const summary =
    view.outcome === 'herd' && herd
      ? herdLine(herd.label)
      : view.outcome === 'tie'
        ? L("No herd. It's a tie. Nobody scores.")
        : view.outcome === 'scattered'
          ? L('No herd. Nobody scores.')
          : L('Nobody answered.');
  const sheepLine = moving
    ? L('🐑 The Black Sheep goes to {name}.', { name: name(view.sheep) })
    : view.sheep
      ? L('🐑 The Black Sheep stays with {name}.', { name: name(view.sheep) })
      : L('🐑 The Black Sheep stays in the pasture.');
  return (
    <div className={`${styles.page} ${view.paused ? styles.paused : ''}`}>
      <div className={styles.top}>
        <span className={styles.kicker}>{kicker(view.n, view.total, view.target, L)}</span>
        <p className={styles.summary}>{summary}</p>
        <p key={beat >= 2 ? 'after' : 'before'} className={styles.sheepLine}>
          {beat >= 2 ? sheepLine : ' '}
        </p>
      </div>
      <RaceTrack
        players={view.players.filter((p) => p.status !== 'spectator')}
        target={view.target}
        scored={view.scored}
        sheepFrom={view.sheepFrom}
        sheep={view.sheep}
        plus={beat >= 1}
        fly={beat >= 2}
        moved={beat >= 3}
        winners={view.winners}
      />
      <div className={styles.bottom}>
        {won && beat >= 4 ? (
          <>
            <Confetti />
            <p className={styles.winner}>
              {view.winners.length === 1
                ? L('{name} wins!', { name: name(view.winners[0] ?? null) })
                : L('{names} win!', { names: nameList(view.winners, view.players, L) })}
            </p>
          </>
        ) : null}
        {draw && beat >= 4 ? (
          <p className={styles.next}>{L('Nobody scored. It ends in a draw.')}</p>
        ) : null}
        {!won && !draw && beat >= 4 && view.phaseId === 'score' ? (
          <div className={styles.next}>
            <span>
              {view.n < view.total
                ? L('Next up · Question {n} of {total}', { n: view.n + 1, total: view.total })
                : L('That was the last question')}
            </span>
            <DeadlineBar
              deadline={view.deadline}
              phaseKey={`score:${view.n}`}
              paused={view.paused}
              urgentAt={0}
              className={styles.nextBar}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
