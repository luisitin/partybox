// I-677: the wrong-screen hint in other languages, keyed by the English sentence (read through
// `useT(STRINGS)` as `L('…')`; scripts/i18n-coverage.test.ts checks every call has its Spanish).
import type { Strings } from '@partybox/game-sdk/ui';

export const STRINGS: Strings = {
  es: {
    // the join page on a big screen
    '📺 Opening the TV view… {n}': '📺 Abriendo la vista de TV… {n}',
    'This screen was the TV last time.': 'Esta pantalla fue la TV la última vez.',
    'Open it now': 'Abrirla ya',
    "Stay here — I'm playing": 'Quedarme aquí: estoy jugando',
    'Is this the TV?': '¿Esta es la TV?',
    '📺 Is this the TV?': '📺 ¿Esta es la TV?',
    'This page is for joining from a phone. The big screen everyone watches opens the TV view.':
      'Esta página es para entrar desde un teléfono. La pantalla grande que todos miran abre la vista de TV.',
    'Yes — open the TV view': 'Sí: abrir la vista de TV',
    "No, I'm playing here": 'No, juego aquí',
    // the TV page on a phone
    'This is the TV page': 'Esta es la página de la TV',
    '📺 This is the TV page': '📺 Esta es la página de la TV',
    'It goes on the big screen everyone watches — the code and the QR are for phones to scan. On this phone you probably want to play.':
      'Va en la pantalla grande que todos miran: el código y el QR son para que los teléfonos los escaneen. En este teléfono seguramente quieres jugar.',
    '📱 Join as a player': '📱 Entrar como jugador',
    'Keep the TV page on this phone': 'Dejar la página de la TV en este teléfono',
  },
};
