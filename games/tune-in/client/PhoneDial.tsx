// The guesser's phone in `dial` (spec §5.5): the clue at the top, the DialInput, and a sticky
// Lock in. Solo sends the dial when the finger lifts; a huddle sends at most 3 a second while
// dragging, plus one on release (§5.9). Moving after locking unlocks — the server clears it.
import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { PrimaryButton, Screen, useSound, useT } from '@partybox/game-sdk/ui';
import { DialInput, createThrottle } from '@partybox/game-sdk/ui/dial';
import type { TuneControllerView } from '../server/index';
import type { Input } from '../server/types';
import { avatarOf, nameOf, roundLine } from './copy';
import styles from './phone.module.css';
import { STRINGS } from './strings';

const HUDDLE_INTERVAL_MS = 334;
type Throttle = ReturnType<typeof createThrottle>;

export function PhoneDial({
  view,
  send,
}: {
  view: TuneControllerView;
  send: (input: Input) => void;
}): JSX.Element {
  const L = useT(STRINGS);
  const play = useSound();
  const huddle = view.huddleMarks !== undefined;
  const [moved, setMoved] = useState(view.myDial !== null);
  // The huddle's throttle lives for the screen and is only touched from the drag's handlers.
  const sendRef = useRef(send);
  useEffect(() => {
    sendRef.current = send;
  }, [send]);
  const throttleRef = useRef<Throttle | null>(null);
  const throttle = (): Throttle => {
    throttleRef.current ??= createThrottle(
      HUDDLE_INTERVAL_MS,
      (pos) => sendRef.current({ type: 'dial', pos }),
      () => performance.now(),
      (fn, ms) => {
        const t = setTimeout(fn, ms);
        return () => clearTimeout(t);
      },
    );
    return throttleRef.current;
  };
  useEffect(() => () => throttleRef.current?.cancel(), []);
  const others = (view.huddleMarks ?? [])
    .filter((m) => m.id !== view.me.id)
    .map((m) => ({ ...m, avatarId: avatarOf(view.players, m.id) }));
  const commit = (pos: number): void => {
    setMoved(true);
    if (huddle) {
      throttle().push(pos);
      throttle().flush();
    } else send({ type: 'dial', pos });
  };
  const lock = (): void => {
    if (!moved || view.locked) return;
    play('submit');
    send({ type: 'lock' });
  };
  return (
    <Screen
      className={styles.screen}
      footer={
        <PrimaryButton disabled={!moved} done={view.locked} onClick={lock}>
          {view.locked ? L('Locked in') : L('Lock in')}
        </PrimaryButton>
      }
    >
      <p className={styles.kicker}>
        {roundLine(L, view.turn)} ·{' '}
        {L("{name}'s clue", { name: nameOf(view.players, view.turn.psychic) })}
      </p>
      <p className={styles.clue}>“{view.turn.clue}”</p>
      <DialInput
        left={view.turn.left}
        right={view.turn.right}
        value={view.myDial}
        onMove={huddle ? (pos) => throttle().push(pos) : undefined}
        onCommit={commit}
        marks={others}
        needle={huddle ? view.needle : null}
        locked={view.locked}
        words={{
          minus: L('Move left'),
          plus: L('Move right'),
          slider: L('Your dial'),
          hint: L('Slide to where the clue lands'),
        }}
      />
      <p className={styles.tip}>
        {huddle
          ? L('Your team sees your dial move. Talk it out, then lock in.')
          : L('Nobody sees your dial until the reveal.')}
      </p>
    </Screen>
  );
}
