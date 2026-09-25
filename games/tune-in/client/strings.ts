// Tune In's words in Spanish, keyed by the English sentence (ADR-044): every screen is
// translatable. Screens write `L('…')` from `useT(STRINGS)`; the manifest's words live in
// manifest.es.json (ADR-049). scripts/i18n-coverage.test.ts fails until each has its Spanish.
// `{name}` marks a placeholder. Content (the dials and their clues) stays in English.
import type { Strings } from '@partybox/game-sdk/ui';
import { STRINGS_PHONE } from './strings-phone';
import { STRINGS_TV } from './strings-tv';

/** The server's sentences (award titles and descriptions, the VIP's Next label). */
const SERVER: Record<string, string> = {
  '🎯 Sharpshooter': '🎯 Francotirador',
  'Bullseyes: {n}': 'Dianas: {n}',
  '📡 Clear Signal': '📡 Señal clara',
  'The best psychic in the room': 'El mejor vidente de la sala',
  '🧭 Steady Hand': '🧭 Pulso firme',
  'The closest dials on average': 'Los diales más cercanos de media',
  '📺 Static': '📺 Estática',
  'Dials that scored nothing: {n}': 'Diales que no puntuaron: {n}',
  'See results': 'Ver resultados',
  'Next round': 'Siguiente ronda',
};

export const STRINGS: Strings = {
  es: { ...SERVER, ...STRINGS_TV, ...STRINGS_PHONE },
};
