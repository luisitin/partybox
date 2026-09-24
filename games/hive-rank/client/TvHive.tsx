// The TV's `hive`: "The hive has decided…" over an empty ladder, then the things fly into their
// spots from 5th to 1st, each with a `card` pluck on the frame it lands (its reading starts on the
// same push). Beside each spot: the faces of the players who put it exactly there, and a thin
// 1–5 track with the room's average. Number one lands bigger; a perfect hive rings `jackpot`.
import { useLayoutEffect, useRef } from 'react';
import type { CSSProperties, JSX, RefObject } from 'react';
import { Avatar, Stage, useT } from '@partybox/game-sdk/ui';
import type { HiveTvView, SpotView } from '../server/views';
import { STRINGS } from './strings';
import { useCueOn } from './useReading';
import styles from './Tv.module.css';

/** Faces beside a spot: every face up to 8, then a "+n". */
const MAX_FACES = 8;

function Faces({ spot, players }: { spot: SpotView; players: HiveTvView['players'] }): JSX.Element {
  const L = useT(STRINGS);
  const shown = spot.faces.slice(0, MAX_FACES);
  const more = spot.faces.length - shown.length;
  return (
    <span className={styles.faces} aria-label={L('{n} put it here', { n: spot.faces.length })}>
      {shown.map((id, i) => {
        const p = players.find((x) => x.id === id);
        return (
          <span key={id} className={styles.face} style={{ '--i': i } as CSSProperties}>
            <Avatar avatarId={p?.avatarId ?? 'fox'} size={60} />
          </span>
        );
      })}
      {more > 0 ? <span className={styles.more}>+{more}</span> : null}
      {spot.faces.length === 0 ? <span className={styles.nobody}>{L('nobody')}</span> : null}
    </span>
  );
}

function Track({ avg }: { avg: number }): JSX.Element {
  const L = useT(STRINGS);
  // 1.0 sits at the left end, 5.0 at the right.
  const at = Math.min(1, Math.max(0, (avg - 1) / 4));
  return (
    <span className={styles.track} aria-label={L('average spot {avg}', { avg: avg.toFixed(1) })}>
      <span className={styles.trackLine}>
        <span className={styles.trackDot} style={{ '--at': at } as CSSProperties} />
      </span>
      <span className={styles.trackText}>{L('avg {avg}', { avg: avg.toFixed(1) })}</span>
    </span>
  );
}

function Rung({
  place,
  spot,
  latest,
  players,
}: {
  place: number;
  spot: SpotView | undefined;
  latest: boolean;
  players: HiveTvView['players'];
}): JSX.Element {
  const L = useT(STRINGS);
  return (
    <li
      className={`${styles.rung} ${place === 1 ? styles.top : ''} ${spot ? styles.landed : ''} ${latest ? styles.latest : ''}`}
    >
      <span className={styles.place}>{place}</span>
      {spot ? (
        <>
          <span key={spot.id} className={styles.thing}>
            {spot.label}
          </span>
          <Faces spot={spot} players={players} />
          <Track avg={spot.avg} />
          {spot.unanimous ? <span className={styles.unanimous}>{L('Unanimous!')}</span> : null}
        </>
      ) : (
        <span className={styles.slot} aria-label={L('not revealed yet')}>
          ?
        </span>
      )}
    </li>
  );
}

/**
 * The scout bee: while a spot is held it flies down the ladder to hover over the next empty one —
 * the room watches where the reveal comes next (and the hold is never a still picture). Once
 * number one is in, it perches beside it. Positions are measured from the rungs themselves.
 */
function ScoutBee({
  ladder,
  target,
}: {
  ladder: RefObject<HTMLOListElement | null>;
  target: { place: number; perch: boolean };
}): JSX.Element {
  const bee = useRef<HTMLSpanElement>(null);
  // Measured from the rungs and written straight to the element (the CSS transition flies it).
  useLayoutEffect(() => {
    const list = ladder.current;
    const rung = list?.children[target.place - 1] as HTMLElement | undefined;
    if (!list || !rung || !bee.current) return;
    const slot = rung.children[1] as HTMLElement | undefined;
    const x = slot ? slot.offsetLeft + slot.offsetWidth - (target.perch ? 20 : 120) : 600;
    const y = rung.offsetTop + rung.offsetHeight / 2 - 40;
    bee.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }, [ladder, target.place, target.perch]);
  return (
    <span ref={bee} className={styles.scout} aria-hidden>
      <span className={styles.scoutInner}>🐝</span>
    </span>
  );
}

export function TvHive({ view }: { view: HiveTvView }): JSX.Element {
  const L = useT(STRINGS);
  const ladder = useRef<HTMLOListElement>(null);
  const newest = view.spots[view.spots.length - 1];
  // Someone got all five exact: their face is beside every spot once number one is in.
  const perfect =
    view.spots.length === 5 &&
    (view.spots[0]?.faces ?? []).some((id) => view.spots.every((s) => s.faces.includes(id)));
  useCueOn(
    view.step > 0 && newest ? `${view.round}:${view.step}` : null,
    perfect ? 'jackpot' : 'card',
  );
  if (view.short) {
    return (
      <Stage center>
        <span className={styles.bigBee} aria-hidden>
          🐝
        </span>
        <p className={styles.shortLine}>{L('Not enough bees!')}</p>
        <p className={styles.shortHint}>
          {L('Fewer than two orders came in — nobody scores this round.')}
        </p>
      </Stage>
    );
  }
  const byPlace = new Map(view.spots.map((s) => [s.place, s]));
  // The next spot to land is 5 - step (1-based); once number one is in, perch beside it.
  const next = Math.max(1, 5 - view.step);
  return (
    <Stage className={styles.hiveStage}>
      <h1 className={styles.hivePrompt}>{view.question?.prompt}</h1>
      <div className={styles.decided} key={view.step === 0 ? 'decided' : 'line'} role="status">
        {view.step === 0 || !newest
          ? L('The hive has decided…')
          : L('Number {n}: {label}', { n: newest.place, label: newest.label })}
      </div>
      <ol className={styles.ladder} ref={ladder}>
        {[1, 2, 3, 4, 5].map((place) => (
          <Rung
            key={place}
            place={place}
            spot={byPlace.get(place)}
            latest={newest?.place === place}
            players={view.players}
          />
        ))}
      </ol>
      <ScoutBee ladder={ladder} target={{ place: next, perch: view.step >= 5 }} />
    </Stage>
  );
}
