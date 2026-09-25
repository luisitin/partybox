// Imposter's words in Spanish, keyed by the English sentence (ADR-044). Screens write `L('…')`
// from `useT(STRINGS)`; the shell's game picker reads the manifest's lines from here too, and
// scripts/i18n-coverage.test.ts fails until each has its Spanish. `{name}` marks a placeholder.
// Content (words, clues, category names inside the packs) stays in English (Part 00 §7.8).
import type { Strings } from '@partybox/game-sdk/ui';
import { STRINGS_ES_PLAY } from './strings-play';

export const STRINGS: Strings = {
  es: {
    // manifest.json — the game picker
    "One of you doesn't know the word.": 'Uno de ustedes no sabe la palabra.',
    'Everyone gets the secret word except the imposter, who only knows the category. Everyone types one word about it, the TV deals the clues, and the room votes. A caught imposter can still steal the round by naming the word.':
      'Todos reciben la palabra secreta menos el impostor, que solo sabe la categoría. Cada quien escribe una palabra sobre ella, la TV reparte las pistas y la sala vota. Un impostor atrapado aún puede robarse la ronda si adivina la palabra.',
    Rounds: 'Rondas',
    'How many secret words': 'Cuántas palabras secretas',
    Imposters: 'Impostores',
    'Auto = one up to 9 players, two from 10; two needs 7 or more players':
      'Auto = uno hasta 9 jugadores, dos desde 10; dos necesita 7 jugadores o más',
    Auto: 'Auto',
    One: 'Uno',
    Two: 'Dos',
    Three: 'Tres',
    'Clue rounds': 'Rondas de pistas',
    'Auto = one with talk, two without': 'Auto = una con charla, dos sin ella',
    'Clue time': 'Tiempo para la pista',
    'Seconds to type a clue': 'Segundos para escribir una pista',
    'Talk it over': 'Hablarlo',
    'A talk timer before the vote (off when remote players have no call)':
      'Un rato para hablar antes de votar (se apaga si los remotos no tienen llamada)',
    'Talk time': 'Tiempo para hablar',
    'Seconds to talk before the vote': 'Segundos para hablar antes de votar',
    'Vote time': 'Tiempo para votar',
    'Seconds to vote': 'Segundos para votar',
    "Imposter's hint": 'Pista del impostor',
    "None = the imposter doesn't even get the category (hard mode)":
      'Ninguna = el impostor ni siquiera recibe la categoría (modo difícil)',
    'The category': 'La categoría',
    'No hint': 'Sin pista',
    'Last chance': 'Última oportunidad',
    'How a caught imposter guesses the word': 'Cómo adivina la palabra un impostor atrapado',
    'Pick from six': 'Elegir entre seis',
    'Type it': 'Escribirla',
    Off: 'Apagado',
    Categories: 'Categorías',
    'None picked = all of them (🌶 ones need Spicy)':
      'Ninguna elegida = todas (las 🌶 necesitan Picante)',
    Food: 'Comida',
    Drinks: 'Bebidas',
    Animals: 'Animales',
    'Around the house': 'En casa',
    Places: 'Lugares',
    Jobs: 'Trabajos',
    Sports: 'Deportes',
    Vehicles: 'Vehículos',
    'Nature and weather': 'Naturaleza y clima',
    Clothes: 'Ropa',
    'Holidays and parties': 'Fiestas y celebraciones',
    Music: 'Música',
    Fantasy: 'Fantasía',
    Tech: 'Tecnología',
    '🌶 Dating': '🌶 Citas',
    '🌶 Night out': '🌶 Noche de fiesta',
    '🌶 Guilty pleasures': '🌶 Placeres culposos',
    '🌶 Awkward moments': '🌶 Momentos incómodos',
    '🌶 Party fouls': '🌶 Metidas de pata en fiestas',
    '🌶 Bad habits': '🌶 Malos hábitos',
    Spicy: 'Picante',
    'Adds adult (not explicit) categories': 'Agrega categorías para adultos (no explícitas)',
    Reader: 'Lector',
    'Who reads the category and each clue aloud': 'Quién lee en voz alta la categoría y cada pista',
    'No reader': 'Sin lector',
    'Old British Man': 'Señor británico',
    'Young British Man': 'Joven británico',
    'American Woman': 'Mujer estadounidense',
    'Soft-Spoken Woman': 'Mujer de voz suave',
    Original: 'Original',
    ...STRINGS_ES_PLAY,
  },
};
