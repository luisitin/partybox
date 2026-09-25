// Spanish for "Where is everyone?" — the twin of i18n-en-presence.ts (the compiler holds them to
// one shape through `Texts`); Latin American (ustedes) like the rest of the shell ([28c1e1]).
import type { Texts } from './i18n-en';

export const esPresence: Pick<Texts, 'presence'> = {
  presence: {
    title: '¿Dónde está todo el mundo?',
    modes: {
      together: 'Todos en la misma sala',
      'remote-voice': 'Algunos lejos, en una llamada',
      'remote-text': 'Algunos lejos, sin llamada',
    },
    hints: {
      together: 'todos ven la TV y pueden hablar',
      'remote-voice': 'quien está lejos oye la sala por una llamada',
      'remote-text': 'PartyBox es el único canal compartido',
    },
    prompt: (name, more) =>
      more > 0
        ? `${name} y ${more} más no ven la TV. ¿Están en una llamada con ustedes?`
        : `${name} no ve la TV. ¿Está en una llamada con ustedes?`,
    onCall: 'En una llamada',
    onCallHint: 'Se juega igual',
    noCall: 'Sin llamada',
    noCallHint: 'Los juegos de hablar avisan antes',
    dismiss: 'Ahora no',
    needsVoice: 'Este juego necesita hablar. Quien esté lejos debería unirse a una llamada de voz.',
    onCallPlay: 'Estamos en una llamada, a jugar',
    needsRoom: 'Para este hace falta estar todos en la misma sala.',
    playAnyway: 'Jugar igualmente',
    pickAnother: 'Elegir otro',
  },
};
