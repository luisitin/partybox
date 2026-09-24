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
    // I-667: the host bar's exact fix
    'Remove 1 bot to play': 'Quitar 1 bot para jugar',
    'Remove {n} bots to play': 'Quitar {n} bots para jugar',
    'Remove the bot': 'Quitar el bot',
    'Remove the {n} bots': 'Quitar los {n} bots',
    'Add 1 bot to play': 'Añadir 1 bot para jugar',
    'Add {n} bots to play': 'Añadir {n} bots para jugar',
    '{opened} opened · {joined} in': '{opened} abrieron · {joined} dentro',
    'phones that opened the join page · joined':
      'teléfonos que abrieron la página para entrar · los que entraron',
    'Switch the TV to Spanish': 'Cambiar la TV a español',
    'Switch the TV to English': 'Cambiar la TV a inglés',
    // I-187 C
    '{mark} {deck} deck': '{mark} mazo {deck}',
    // I-646: the tunnel's QR on the TV
    'Not on this Wi-Fi?': '¿No estás en este Wi-Fi?',
    'Scan this one': 'Escanea este',
    // I-668 C: the picker's switch chips
    Recap: 'Resumen',
    'Phone music': 'Música en teléfonos',
    '{n} players': '{n} jugadores',
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
    // I-650: the vote tally
    'votes for the next game': 'votos para el próximo juego',
    'Wants to play next': 'Quieren jugar ahora',
    // TvSelecting, TvPlaying, TvResults
    games: 'juegos',
    'Unknown game "{id}"': 'Juego desconocido "{id}"',
    awards: 'premios',
    '📼 Recap saved on the host PC': '📼 Resumen guardado en el PC del anfitrión',
  },
};
