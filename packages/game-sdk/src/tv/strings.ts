// The SDK's stage components in other languages, keyed by the English sentence (the owner, 2026-09-22: every
// screen translatable to Spanish). Read through `useT(STRINGS)` as `L('…')`; `{name}` marks a
// placeholder.
import type { Strings } from '../ui/lang';

export const STRINGS: Strings = {
  es: {
    // PlayerChips, Scoreboard (screen-reader labels)
    players: 'jugadores',
    scoreboard: 'marcador',
    'rank {rank}': 'puesto {rank}',
    'tied, rank {rank}': 'empate, puesto {rank}', // I-476 B
    'wager placed': 'apuesta hecha',
    // Timer: one label for every count (the design harness finds the timer by "…seconds left"), so
    // the Spanish reads as a label and its value — right for 1 as for 30.
    paused: 'en pausa',
    '{n} seconds left': 'segundos restantes: {n}',
  },
};
