// The calling team's phone in `call` (teams): the other team's needle on a small bar, and two
// full-width 80 px buttons — ◀ LEFT and RIGHT ▶, each naming the end it leans toward. The tap can
// change until the call closes; the chosen one wears a ring and a ✓ (never colour alone).
import type { JSX } from 'react';
import { Screen, buzz, useSound, useT } from '@partybox/game-sdk/ui';
import { DialStrip } from '@partybox/game-sdk/ui/dial';
import type { TuneControllerView } from '../server/index';
import type { Input, Side } from '../server/types';
import { englishClueNote, teamName } from './copy';
import styles from './phone.module.css';
import { STRINGS } from './strings';

export function PhoneCall({
  view,
  send,
}: {
  view: TuneControllerView;
  send: (input: Input) => void;
}): JSX.Element {
  const L = useT(STRINGS);
  const play = useSound();
  const tap = (side: Side): void => {
    if (view.myCall === side) return;
    buzz(20);
    play('submit');
    send({ type: 'call', side });
  };
  const button = (side: Side): JSX.Element => {
    const chosen = view.myCall === side;
    const end = side === 'left' ? view.turn.left : view.turn.right;
    return (
      <button
        type="button"
        className={`${styles.call} ${chosen ? styles.callChosen : ''}`}
        aria-pressed={chosen}
        onClick={() => tap(side)}
      >
        <span className={styles.callSide}>
          {side === 'left' ? L('◀ LEFT') : L('RIGHT ▶')}
          {chosen ? ' ✓' : ''}
        </span>
        <span className={styles.callEnd}>{L('toward {end}', { end })}</span>
      </button>
    );
  };
  return (
    <Screen className={styles.screen}>
      <p className={styles.kicker}>
        {L('Clue: “{clue}”', { clue: view.turn.clue ?? '' })}
        {englishClueNote(L, view.turn) ? ` ${englishClueNote(L, view.turn)}` : ''}
      </p>
      <h2 className={styles.role}>
        {L('{team} set their needle. Is the target LEFT or RIGHT of it?', {
          team: teamName(L, view.turn.team),
        })}
      </h2>
      <DialStrip
        left={view.turn.left}
        right={view.turn.right}
        target={null}
        bands={view.turn.bands}
        needle={view.needle}
      />
      <div className={styles.calls}>
        {button('left')}
        {button('right')}
      </div>
    </Screen>
  );
}
