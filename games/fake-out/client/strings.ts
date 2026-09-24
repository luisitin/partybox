// Fake-Out's words in Spanish, keyed by the English sentence (ADR-044). Screens write `L('…')` from
// `useT(STRINGS)`; the picker reads the manifest's lines from here too, and
// scripts/i18n-coverage.test.ts fails until each has its Spanish. `{name}` marks a placeholder.
// Content (the facts in content/) stays in English.
import type { Strings } from '@partybox/game-sdk/ui';

export const STRINGS: Strings = {
  es: {
    // manifest.json — the game picker
    'Write a fake answer. Find the real one.': 'Escribe una respuesta falsa. Encuentra la real.',
    'A strange true fact appears with a blank. Everyone types a fake answer that sounds real, then all the answers are mixed with the truth and everyone picks the one they believe. Score for finding the truth and for every player your fake fools. The last question is worth double.':
      'Aparece un dato real y extraño con un hueco. Cada quien escribe una respuesta falsa que suene real; luego todas se mezclan con la verdad y cada quien elige la que cree. Sumas por encontrar la verdad y por cada jugador que cae con tu mentira. La última pregunta vale doble.',
    Questions: 'Preguntas',
    'How many facts to play; the last one is the Final Fake-Out':
      'Cuántos datos jugar; el último es el Engaño Final',
    'Lying time': 'Tiempo para mentir',
    'Seconds to write a fake answer': 'Segundos para escribir una respuesta falsa',
    'Picking time': 'Tiempo para elegir',
    'Seconds to pick the answer you believe': 'Segundos para elegir la respuesta que crees',
    'Final Fake-Out': 'Engaño Final',
    'The last question doubles all points': 'La última pregunta duplica todos los puntos',
    'Suggest a lie': 'Sugerir una mentira',
    'Show the 💡 button that offers two ready-made fakes':
      'Mostrar el botón 💡 que ofrece dos mentiras listas',
    Likes: 'Me gusta',
    'Let players 👍 the funniest answers while they pick':
      'Deja que los jugadores den 👍 a las respuestas más graciosas mientras eligen',
    Categories: 'Categorías',
    'Tick the categories to play; nothing ticked plays them all':
      'Marca las categorías a jugar; sin marcar se juegan todas',
    Animals: 'Animales',
    History: 'Historia',
    Food: 'Comida',
    Science: 'Ciencia',
    Geography: 'Geografía',
    'Weird laws': 'Leyes raras',
    Sports: 'Deportes',
    Inventions: 'Inventos',
    Space: 'El espacio',
    'The human body': 'El cuerpo humano',
    Words: 'Palabras',
    Holidays: 'Fiestas',
    'Drinking (spicy)': 'Bebida (picante)',
    'Dating (spicy)': 'Citas (picante)',
    'Spicy facts': 'Datos picantes',
    'Mix in adult facts (drinking, dating, bawdy history; never explicit)':
      'Mezcla datos para adultos (bebida, citas, historia pícara; nunca explícitos)',
    Reader: 'Lector',
    'The voice that reads each fact and answer aloud':
      'La voz que lee en voz alta cada dato y cada respuesta',
    'No reader': 'Sin lector',
    'Old British Man': 'Señor británico mayor',
    'Young British Man': 'Joven británico',
    'American Woman': 'Mujer estadounidense',
    'Soft-Spoken Woman': 'Mujer de voz suave',
    Original: 'Original',
  },
};
