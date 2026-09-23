// Blanks's words in other languages, keyed by the English sentence (the owner, 2026-09-22: every
// screen translatable to Spanish). Screens read them through `useT(STRINGS)` as `L('…')`; the
// shell's game picker reads the manifest's tagline, description and setting labels from here too.
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
  '1 card in before half time': '1 carta antes de la mitad del tiempo',
  '{n} cards in before half time': '{n} cartas antes de la mitad del tiempo',
  // I-149 C
  'Read the room': 'Buen olfato',
  '{n} call called right': '{n} acierto',
  '{n} calls called right': '{n} aciertos',
};

/** The game picker's lines (manifest.json). Mild, Crude and WILD are the decks' names. */
const PICKER_ES: Readonly<Record<string, string>> = {
  'Fill in the blank. The worst answer wins.': 'Completa la frase. Gana la peor respuesta.',
  'A black card sets up the sentence; everyone plays the white card from their hand that finishes it best (or worst). The TV reads every combination out one at a time, then the room votes — or a rotating judge picks. One point per round won. Three decks from family-safe to fully explicit; the VIP chooses.':
    'Una carta negra plantea la frase; cada uno juega la carta blanca de su mano que mejor (o peor) la completa. La TV lee cada combinación, una por una, y luego todos votan, o elige un juez que va rotando. Un punto por ronda ganada. Tres mazos, desde apto para toda la familia hasta totalmente explícito; elige el VIP.',
  Decks: 'Mazos',
  'Which cards are in play: Mild is safe for anyone, Crude is R-rated, WILD is fully explicit':
    'Qué cartas se juegan: Mild es apto para todos, Crude es subido de tono, WILD es totalmente explícito',
  'Family night (Mild)': 'Noche familiar (Mild)',
  'Adults (Mild + Crude)': 'Adultos (Mild + Crude)',
  'WILD (all three decks)': 'WILD (los tres mazos)',
  'WILD only': 'Solo WILD',
  // I-187: the deck's short name on the Start button and the deck chip
  'Family night': 'Noche familiar',
  Adults: 'Adultos',
  'Who picks the winner': 'Quién elige al ganador',
  'Everyone votes on the cards, or one player judges each round in turn':
    'Todos votan las cartas, o un jugador juzga cada ronda por turnos',
  'Everyone votes': 'Votan todos',
  'A rotating judge': 'Un juez por turnos',
  Rounds: 'Rondas',
  'Black cards to play; about a minute each in a small room, closer to two with a full one':
    'Cartas negras que se juegan; cerca de un minuto cada una con pocos jugadores, casi dos con la sala llena',
  'Timed rounds': 'Rondas con reloj',
  'Put a clock on picking, voting and the result; off = play at your own pace, anyone taps Next':
    'Pon reloj al elegir, al votar y al resultado; apagado = a tu ritmo, alguien toca Siguiente',
  'Answer time (timed rounds)': 'Tiempo de respuesta (con reloj)',
  'Seconds to pick a card when rounds are timed; Pick 2 and Pick 3 cards get 15 s more each':
    'Segundos para elegir carta en rondas con reloj; las cartas Elige 2 y Elige 3 tienen 15 s más cada una',
  Reader: 'Lector',
  'Who reads each finished card aloud; No reader = the players take turns':
    'Quién lee cada carta en voz alta; Sin lector = los jugadores por turnos',
  'No reader': 'Sin lector',
  'Old British Man': 'Señor británico',
  'Young British Man': 'Joven británico',
  'American Woman': 'Mujer estadounidense',
  'Soft-Spoken Woman': 'Mujer de voz suave',
  Original: 'Original',
  'Cards dealt': 'Cartas en la mano',
  'White cards in each hand; a new hand swaps them all':
    'Cartas blancas en cada mano; una mano nueva las cambia todas',
  '7 cards': '7 cartas',
  '10 cards': '10 cartas',
  '12 cards': '12 cartas',
  '15 cards': '15 cartas',
  Rando: 'Rando',
  'A random card from the deck plays every round as a phantom player; if it wins, nobody scores':
    'Una carta al azar del mazo juega cada ronda como jugador fantasma; si gana, nadie suma',
};

export const STRINGS: Strings = {
  es: { ...AWARDS_ES, ...SCREENS_ES, ...PICKER_ES },
};
