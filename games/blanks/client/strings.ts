// Blanks's words in other languages, keyed by the English sentence (the owner, 2026-09-22: every
// screen translatable to Spanish). Screens read them through `useT(STRINGS)` as `L('…')`; the
// manifest's own sentences (the picker, About, the settings form) live in manifest.es.json (ADR-049).
// `{name}` marks a placeholder. Content (cards, prompts, questions) stays in the deck's language.
import type { Strings } from '@partybox/game-sdk/ui';
import { SCREENS_ES } from './strings-es';

/** The results screen's awards (server/scoring.ts `awardsFor`), as the server writes them, for a
 *  shell that reads them through this table. First, so the card-of-the-night line matches whole
 *  before any shorter `{n} votes` pattern. The quoted card stays as dealt. */
const AWARDS_ES: Readonly<Record<string, string>> = {
  'Crowd favourite': 'Favorito del público',
  'On a roll': 'En racha',
  'Quick draw': 'Mano rápida',
  '“{card}” · round {round}': '“{card}” · ronda {round}',
  '“{card}” · 1 vote': '“{card}” · 1 voto',
  '“{card}” · {n} votes': '“{card}” · {n} votos',
  '1 vote across the night': '1 voto en toda la noche',
  '{n} votes across the night': '{n} votos en toda la noche',
  '{n} rounds in a row': '{n} rondas seguidas',
  '1 card in under {s} s': '1 carta en menos de {s} s',
  '{n} cards in under {s} s': '{n} cartas en menos de {s} s',
  // I-149 C
  'Read the room': 'Buen olfato',
  '{n} call called right': '{n} acierto',
  '{n} calls called right': '{n} aciertos',
};

/** The decks and modes as the screens name them (the manifest's options: its full sentences live
 *  in manifest.es.json). Mild, Crude and WILD are the decks' names. */
const PICKER_ES: Readonly<Record<string, string>> = {
  'Family night (Mild)': 'Noche familiar (Mild)',
  'Adults (Mild + Crude)': 'Adultos (Mild + Crude)',
  'WILD (all three decks)': 'WILD (los tres mazos)',
  'WILD only': 'Solo WILD',
  // I-187: the deck's short name on the Start button and the deck chip
  'Family night': 'Noche familiar',
  Adults: 'Adultos',
  'Everyone votes': 'Votan todos',
  'Everyone votes (a judge at three)': 'Votan todos (con tres, un juez)', // I-172 A
  'A rotating judge': 'Un juez por turnos',
  'No reader': 'Sin lector',
  'Old British Man': 'Señor británico',
  'Young British Man': 'Joven británico',
  'American Woman': 'Mujer estadounidense',
  'Soft-Spoken Woman': 'Mujer de voz suave',
  Original: 'Original',
  '7 cards': '7 cartas',
  '10 cards': '10 cartas',
  '12 cards': '12 cartas',
  '15 cards': '15 cartas',
  Rando: 'Rando',
};

export const STRINGS: Strings = {
  es: { ...AWARDS_ES, ...SCREENS_ES, ...PICKER_ES },
};
