// Herd Mind's words in other languages, keyed by the English sentence (ADR-044). Screens write
// `L('…')` from `useT(STRINGS)`; the picker reads the manifest's lines from here too until F2a
// moves them server-side. Content (the questions) stays in English.
import type { Strings } from '@partybox/game-sdk/ui';

export const STRINGS: Strings = {
  es: {
    // manifest.json — the game picker
    "Think like the herd. Don't be the odd sheep.": 'Piensa como el rebaño. No seas la oveja rara.',
    'A question appears and everyone picks the answer they think most people will pick. The biggest group scores. Alone with your answer? You take the Black Sheep, and nobody holding it can win. First to the target without the sheep wins.':
      'Aparece una pregunta y cada quien elige la respuesta que cree que elegirá la mayoría. El grupo más grande suma. ¿Te quedas solo con tu respuesta? Te llevas la Oveja Negra, y quien la tenga no puede ganar. Gana quien llegue primero a la meta sin la oveja.',
    Answers: 'Respuestas',
    'Tap one of eight tiles, or type anything (the VIP can merge answers that mean the same)':
      'Toca una de ocho fichas o escribe lo que quieras (el VIP puede unir respuestas que significan lo mismo)',
    Tiles: 'Fichas',
    Typed: 'Escritas',
    'Points to win': 'Puntos para ganar',
    'First to this many points without the Black Sheep wins':
      'Gana quien llegue primero a estos puntos sin la Oveja Negra',
    Questions: 'Preguntas',
    'The most questions before the top scorer without the sheep wins':
      'Máximo de preguntas antes de que gane quien más puntos tenga sin la oveja',
    Pace: 'Ritmo',
    'Time to answer: relaxed 25 s, normal 15 s, fast 10 s (typed: 35, 25, 20)':
      'Tiempo para responder: tranquilo 25 s, normal 15 s, rápido 10 s (escritas: 35, 25, 20)',
    Relaxed: 'Tranquilo',
    Normal: 'Normal',
    Fast: 'Rápido',
    'Spicy questions': 'Preguntas picantes',
    'Adds the grown-up pack to the draw': 'Añade el paquete para adultos al sorteo',
    Reader: 'Lector',
    'Who reads each question aloud': 'Quién lee cada pregunta en voz alta',
    'American Woman': 'Mujer estadounidense',
    'Old British Man': 'Señor británico',
    'Young British Man': 'Joven británico',
    'Soft-Spoken Woman': 'Mujer de voz suave',
    Original: 'Original',
    'No reader': 'Sin lector',
  },
};
