// In a phone-only room (no TV), the phones show the hive's reveal (SPEC §6.4 PhoneStage): the
// ladder as a vertical list filling from the bottom, number one on top, faces beside each spot,
// the spoken line as text; phones in such a room also hear the reader.
import type { JSX } from 'react';
import { Avatar, Screen, useT } from '@partybox/game-sdk/ui';
import type { PushedView } from '@partybox/game-sdk/ui';
import type { HiveControllerView } from '../server/views';
import { STRINGS } from './strings';
import { useCueOn, useReading } from './useReading';
import styles from './Phone.module.css';

const MAX_FACES = 5;

export function Ladder({ view }: { view: HiveControllerView }): JSX.Element {
  const L = useT(STRINGS);
  const byPlace = new Map(view.spots.map((s) => [s.place, s]));
  const newest = view.spots[view.spots.length - 1]?.place ?? null;
  return (
    <ol className={styles.ladder}>
      {[1, 2, 3, 4, 5].map((place) => {
        const spot = byPlace.get(place);
        const faces = spot?.faces ?? [];
        return (
          <li
            key={place}
            className={`${styles.rung} ${spot ? styles.rungIn : ''} ${newest === place ? styles.rungNew : ''}`}
          >
            <span className={styles.rungPlace}>{place}</span>
            {spot ? (
              <span key={spot.id} className={styles.rungThing}>
                <span className={styles.rungLabel}>{spot.label}</span>
                <span className={styles.rungFaces}>
                  {faces.slice(0, MAX_FACES).map((id) => (
                    <Avatar
                      key={id}
                      avatarId={view.players.find((p) => p.id === id)?.avatarId ?? 'fox'}
                      size={24}
                    />
                  ))}
                  {faces.length > MAX_FACES ? `+${faces.length - MAX_FACES}` : null}
                  {spot.unanimous ? (
                    <span className={styles.rungTag}>{L('Unanimous!')}</span>
                  ) : null}
                </span>
              </span>
            ) : (
              <span className={styles.rungEmpty}>?</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function PhoneStage({ view }: { view: PushedView<HiveControllerView> }): JSX.Element {
  const L = useT(STRINGS);
  useReading(view.speech);
  useCueOn(view.step > 0 ? `${view.round}:${view.step}` : null, 'card', 0.6);
  const newest = view.spots[view.spots.length - 1];
  if (view.short)
    return (
      <Screen className={styles.stageScreen}>
        <p className={styles.bigBee} aria-hidden>
          🐝
        </p>
        <p className={styles.shortLine}>{L('Not enough bees!')}</p>
        <p className={styles.note}>
          {L('Fewer than two orders came in — nobody scores this round.')}
        </p>
      </Screen>
    );
  return (
    <Screen className={styles.stageScreen}>
      <div className={styles.head}>
        <span className={styles.kicker}>
          {L('Round {n} of {total}', { n: view.round, total: view.rounds })}
        </span>
        <h2 className={styles.promptSmall}>{view.question?.prompt}</h2>
      </div>
      <p key={view.step} className={styles.stageLine} role="status">
        {view.step === 0 || !newest
          ? L('The hive has decided…')
          : L('Number {n}: {label}', { n: newest.place, label: newest.label })}
      </p>
      <Ladder view={view} />
    </Screen>
  );
}
