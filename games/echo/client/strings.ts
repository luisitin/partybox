// Echo's words in other languages, keyed by the English sentence (ADR-044). The shell's picker
// reads the manifest's tagline, description and setting labels from here too;
// scripts/i18n-coverage.test.ts fails until each has its Spanish. Content (the words and clues)
// stays in English.
import type { Strings } from '@partybox/game-sdk/ui';

export const STRINGS: Strings = {
  es: {
    // manifest.json — the game picker
    'One clue each. Same clue? Both vanish.':
      'Una pista cada uno. ¿Pista repetida? Desaparecen las dos.',
    "A co-op word game. One player guesses; everyone else sees the secret word and writes a one-word clue without peeking at each other's. Clues that match cancel out before the guesser sees them, so be clever, not obvious. A wrong guess burns the next word too. The whole group wins or loses together.":
      'Un juego de palabras cooperativo. Una persona adivina; las demás ven la palabra secreta y escriben una pista de una sola palabra sin mirar las de los demás. Las pistas que coinciden se anulan antes de que quien adivina las vea, así que sé ingenioso, no obvio. Un error también quema la palabra siguiente. Todo el grupo gana o pierde junto.',
    Words: 'Palabras',
    'How many words are in the deck': 'Cuántas palabras tiene el mazo',
    'Clue time': 'Tiempo para pistas',
    'Seconds to write a clue': 'Segundos para escribir una pista',
    'Guess time': 'Tiempo para adivinar',
    'Seconds for the guesser': 'Segundos para quien adivina',
    'Echo check': 'Revisión de ecos',
    'Clue-givers review the echoes before the guesser sees the clues':
      'Quienes dan pistas revisan los ecos antes de que quien adivina vea las pistas',
    Categories: 'Categorías',
    'Tick the kinds of words to play; nothing ticked plays them all':
      'Marca los tipos de palabras a jugar; sin marcar se juegan todos',
    Animals: 'Animales',
    Food: 'Comida',
    Objects: 'Objetos',
    Places: 'Lugares',
    Jobs: 'Oficios',
    Nature: 'Naturaleza',
    Activities: 'Actividades',
    Fantasy: 'Fantasía',
    Sports: 'Deportes',
    'Around the house': 'En casa',
    'Spicy words': 'Palabras picantes',
    'Adds grown-up words (hangovers, first dates), never explicit':
      'Añade palabras para adultos (resacas, primeras citas), nunca explícitas',
    Reader: 'Lector',
    'Who reads the surviving clues aloud': 'Quién lee en voz alta las pistas que sobreviven',
    'No reader': 'Sin lector',
    'Old British Man': 'Señor británico mayor',
    'Young British Man': 'Joven británico',
    'American Woman': 'Mujer estadounidense',
    'Soft-Spoken Woman': 'Mujer de voz suave',
    Original: 'Original',
    // server text: the VIP's Next labels, awards
    "Let's go": '¡Vamos!',
    'Close the clues': 'Cerrar las pistas',
    'Looks good for everyone': 'Todo bien para todos',
    'Count it as a pass': 'Contarlo como paso',
    'Next word': 'Siguiente palabra',
    'See results': 'Ver resultados',
    '🗝️ Key Clue': '🗝️ Pista clave',
    'Most clues that survived on words the team got':
      'Más pistas que sobrevivieron en palabras acertadas',
    '🔁 Echo Chamber': '🔁 Cámara de eco',
    'Most clues that vanished': 'Más pistas que desaparecieron',
    '🎯 Sharp Guesser': '🎯 Buen ojo',
    'Most right guesses': 'Más aciertos',
    '🙈 Bold Guess': '🙈 Pura osadía',
    'Most wrong guesses': 'Más fallos',
  },
};
