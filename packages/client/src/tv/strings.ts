// The TV shell in other languages, keyed by the English sentence (the owner, 2026-09-22: every
// screen translatable to Spanish). Read through `useT(STRINGS)` as `L('…')`; `{name}` marks a
// placeholder.
import type { Strings } from '@partybox/game-sdk/ui';

export const STRINGS: Strings = {
  es: {
    // TvApp: the TV's own toasts (I-054)
    'Room full — {n} / {cap}': 'Sala llena: {n} / {cap}',
    'A seat opened — {n} / {cap}': 'Se liberó un lugar: {n} / {cap}',
    // TvFrame
    '👑 {name} is the VIP now': '👑 {name} ahora es el VIP',
    // HostBar
    'Sure? {action}': '¿Seguro? {action}',
    'Remove all {n} bots': 'Quitar los {n} bots',
    '{opened} opened · {joined} in': '{opened} abrieron · {joined} dentro',
    'phones that opened the join page · joined':
      'teléfonos que abrieron la página para entrar · los que entraron',
    'Switch the TV to Spanish': 'Cambiar la TV a español',
    'Switch the TV to English': 'Cambiar la TV a inglés',
    // I-187 C
    '{mark} {deck} deck': '{mark} mazo {deck}',
    // TvLobby
    '{names} and {last}': '{names} y {last}',
    'last game': 'último juego',
    'Last up · {game}': 'Último juego · {game}',
    'no winner': 'sin ganador',
    '{names} won': '{names} ganó',
    '{names} tied': '{names} empataron',
    // I-652: a bots-only win, and the night's list (Tonight.tsx)
    '🤖 Bots took it': '🤖 Ganaron los bots',
    '{name} led the humans · {place}': '{name}, mejor humano · {place}',
    tonight: 'esta noche',
    'Tonight · {n} games': 'Esta noche · {n} juegos',
    '🤖 bots': '🤖 bots',
    '👑 {name} leads tonight': '👑 {name} va ganando esta noche',
    'QR code for {url}': 'Código QR de {url}',
    // TvSelecting, TvPlaying, TvResults
    games: 'juegos',
    'Unknown game "{id}"': 'Juego desconocido "{id}"',
    awards: 'premios',
    '📼 Recap saved on the host PC': '📼 Resumen guardado en el PC del anfitrión',
  },
};
