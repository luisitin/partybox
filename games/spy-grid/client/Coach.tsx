// The coach line (the owner's play-test, 2026-09-24: "guide the player"): one sentence at the top
// of every phone screen saying who you are this turn and the one thing to do next. It pops in when
// it changes and breathes while the next move is yours.
import type { JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { Translator } from '@partybox/game-sdk/ui';
import type { SpyControllerView } from '../server/views';
import { SHAPE } from './model';
import styles from './Coach.module.css';
import { STRINGS } from './strings';

type V = SpyControllerView;

function lines(view: V, L: Translator): { role: string; next: string; mine: boolean } {
  const t = view.turnTeam;
  const team = t === 'sun' ? L('Sun') : L('Moon');
  const mineTurn = view.team === t;
  const spy = view.role === 'spymaster';
  if (view.phaseId === 'teams' && view.mode === 'coop')
    return {
      role: L('New here? Here is how it works'),
      next: L('You all play one team. Want to give the clues? Switch on “I’ll be spymaster”.'),
      mine: true,
    };
  if (view.phaseId === 'teams')
    return {
      role: L('New here? Here is how it works'),
      next: L('Pick a team. Want to give the clues? Switch on “I’ll be spymaster”.'),
      mine: true,
    };
  if (view.role === 'spectator')
    return { role: L('Watching'), next: L('You join the next game.'), mine: false };
  if (!mineTurn && view.mode !== 'coop')
    return {
      role: `${SHAPE[t]} ${L('{team} is playing', { team })}`,
      next: spy
        ? L('Tap Show key and plan your next clue.')
        : L('Watch the TV. Your team is next.'),
      mine: false,
    };
  if (view.phaseId === 'clue')
    return spy
      ? {
          role: L('🕶️ You are the spymaster'),
          next: L(
            'Tap Show key, find your {shape} words, type ONE word that links some of them, pick how many, Send.',
            { shape: SHAPE[t] },
          ),
          mine: true,
        }
      : {
          role: L('You are a guesser'),
          next: L('Your spymaster is thinking of a clue — get ready.'),
          mine: false,
        };
  if (view.phaseId === 'guess')
    return spy
      ? {
          role: L('🕶️ You are the spymaster'),
          next: L('Your team is guessing. No hints, no faces! 🤐'),
          mine: false,
        }
      : view.myPointer === null
        ? {
            role: L('Your turn to guess'),
            next: L('Tap a word that fits “{clue}”, then tap Point.', {
              clue: view.clue?.word ?? '',
            }),
            mine: true,
          }
        : {
            role: L('Your turn to guess'),
            next: L('Waiting for most of your team to agree…'),
            mine: false,
          };
  return { role: `${SHAPE[t]} ${team}`, next: L('Watch the TV.'), mine: false };
}

export function Coach({ view }: { view: V }): JSX.Element {
  const L = useT(STRINGS);
  const { role, next, mine } = lines(view, L);
  return (
    <div
      className={`${styles.coach} ${mine ? styles.mine : ''}`}
      key={`${role}|${next}`}
      role="status"
    >
      <div className={styles.role}>{role}</div>
      <div className={styles.next}>{next}</div>
    </div>
  );
}
