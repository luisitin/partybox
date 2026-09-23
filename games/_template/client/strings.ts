// Quick Poll's words in other languages, keyed by the English sentence: every screen is translatable
// to Spanish (the owner, 2026-09-22). Screens write `L('…')` from `useT(STRINGS)`; the shell's game
// picker reads the manifest's tagline, description and setting labels from here too, and
// scripts/i18n-coverage.test.ts fails until each has its Spanish. `{name}` marks a placeholder.
// Content (the prompts in content/) stays in the deck's language.
import type { Strings } from '@partybox/game-sdk/ui';

export const STRINGS: Strings = {
  es: {
    // manifest.json — the game picker
    "Type a word. See everyone's.": 'Escribe una palabra. Mira las de todos.',
    'The smallest complete PartyBox game: everyone types one word, the TV reveals them all, everyone who answered scores a point. Copy it to start a new game.':
      'El juego completo más pequeño de PartyBox: cada quien escribe una palabra, la TV las muestra todas y quien respondió suma un punto. Cópialo para empezar un juego nuevo.',
    'Answer time': 'Tiempo para responder',
    'Seconds to type an answer': 'Segundos para escribir una respuesta',
    // phone
    'One word…': 'Una palabra…',
    'Thanks for playing!': '¡Gracias por jugar!',
    'One moment…': 'Un momento…',
    'Look at the TV': 'Mira la TV',
    'You said "{answer}"': 'Dijiste «{answer}»',
    'You did not answer this time.': 'Esta vez no respondiste.',
    // TV
    '{answered} / {total} answered': '{answered} / {total} respondieron',
    "That's the poll!": '¡Y esa fue la encuesta!',
  },
};
