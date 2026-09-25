// TV `intro` (1.5 s, once): the title, the tagline and the deck size. The rules are the shell's
// ready stage's job (ADR-053).
import type { JSX } from 'react';
import { Stage, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { EchoTvView } from '../server/views';
import { STRINGS } from './strings';
import res from './result.module.css';

export const STEPS = [
  'One player guesses; everyone else sees the secret word and writes a one-word clue.',
  'Clues that match each other vanish before the guesser sees them.',
  "Guess the word from what's left. The whole group wins or loses together.",
] as const;

export function TvIntro({ view }: GameTvProps<EchoTvView>): JSX.Element {
  const L = useT(STRINGS);
  return (
    <Stage center className={res.intro}>
      <span className={res.title}>
        <span aria-hidden>🔁</span>
        <span>{L('Echo')}</span>
      </span>
      <span className={res.tagline}>{L('One clue each. Same clue? Both vanish.')}</span>
      <span className={res.deckLine}>{L('Deck: {n} words', { n: view.deckSize })}</span>
    </Stage>
  );
}
