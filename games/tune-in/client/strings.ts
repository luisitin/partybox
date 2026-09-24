// Tune In's words in Spanish, keyed by the English sentence (ADR-044): every screen is
// translatable. Screens write `L('…')` from `useT(STRINGS)`; the picker reads the manifest's
// lines from here too, and scripts/i18n-coverage.test.ts fails until each has its Spanish.
// `{name}` marks a placeholder. Content (the dials and their clues) stays in English.
import type { Strings } from '@partybox/game-sdk/ui';
import { STRINGS_PHONE } from './strings-phone';
import { STRINGS_TV } from './strings-tv';

const MANIFEST: Record<string, string> = {
  'One clue. Everyone guesses where it lands.': 'Una pista. Todos adivinan dónde cae.',
  'A dial runs between two opposites, like Cold and Hot. Only the psychic sees the secret target; they give a one-line clue, and everyone slides a dial to where they think it lands. The closer, the more points, for you and the psychic. Play solo, in two teams, or together against the dial.':
    'Un dial va entre dos opuestos, como Frío y Caliente. Solo el vidente ve el objetivo secreto; da una pista de una línea y todos mueven su dial adonde creen que cae. Cuanto más cerca, más puntos, para ti y para el vidente. Juega solo, en dos equipos o todos juntos contra el dial.',
  Mode: 'Modo',
  'Auto plays together at 2 players and solo at 3+; teams needs 4+, co-op allows up to 8':
    'Auto juega en equipo con 2 y solo con 3 o más; equipos necesita 4 o más, cooperativo admite hasta 8',
  Auto: 'Auto',
  Solo: 'Solo',
  Teams: 'Equipos',
  'Co-op': 'Cooperativo',
  Rounds: 'Rondas',
  'Solo and co-op; auto gives everyone a turn as the psychic (8 with 2 or 9+ players)':
    'Solo y cooperativo; auto da a cada quien un turno de vidente (8 con 2 o con 9+ jugadores)',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '10': '10',
  '11': '11',
  '12': '12',
  'Points to win': 'Puntos para ganar',
  'Teams: the first team to this many points wins':
    'Equipos: gana el primer equipo que llegue a estos puntos',
  'Most turns': 'Máximo de turnos',
  'Teams: the game ends after this many turns, catch-up turns included':
    'Equipos: el juego termina tras estos turnos, contando los de remontada',
  'Clue time': 'Tiempo para la pista',
  'Seconds the psychic has to send a clue': 'Segundos que tiene el vidente para enviar una pista',
  'Dial time': 'Tiempo del dial',
  'Seconds to slide your dial and lock in': 'Segundos para mover tu dial y fijarlo',
  'Call time': 'Tiempo para cantar',
  'Teams: seconds for the other team to call left or right':
    'Equipos: segundos para que el otro equipo diga izquierda o derecha',
  'Target size': 'Tamaño del objetivo',
  'How wide the scoring zones are': 'Qué tan anchas son las zonas que puntúan',
  Narrow: 'Estrecho',
  Normal: 'Normal',
  Wide: 'Ancho',
  Huddle: 'Piña',
  "Teams and co-op: teammates see each other's dials move and argue it out":
    'Equipos y cooperativo: los compañeros ven moverse los diales de los demás y lo discuten',
  'Spicy dials': 'Diales picantes',
  'Mix in adult dials (dates, exes, bad behaviour), never explicit':
    'Mezcla diales para adultos (citas, ex, malas conductas), nunca explícitos',
  Reader: 'Lector',
  "Who reads the dial's ends and the clue aloud": 'Quién lee en voz alta los extremos y la pista',
  'No reader': 'Sin lector',
  'Old British Man': 'Señor británico mayor',
  'Young British Man': 'Joven británico',
  'American Woman': 'Mujer estadounidense',
  'Soft-Spoken Woman': 'Mujer de voz suave',
  Original: 'Original',
};

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
  es: { ...MANIFEST, ...SERVER, ...STRINGS_TV, ...STRINGS_PHONE },
};
