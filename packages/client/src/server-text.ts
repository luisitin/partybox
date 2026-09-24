// What the server says — toasts ("Sam is now the VIP"), errors ("This room is full.") — arrives in
// English; the phone shows it in its own language (the owner, 2026-09-22). Exact sentences first,
// then the few with a name in them, then the running game's own table (a game's server errors live
// in its `strings`). Anything not listed shows as sent: never a blank.
import { translateSent } from '@partybox/game-sdk/ui';
import type { Lang } from '@partybox/game-sdk/ui';
import { gameStrings } from './i18n-games';

const EXACT_ES: Readonly<Record<string, string>> = {
  'No game is running.': 'No hay ningún juego en marcha.',
  'You join the next game.': 'Entras en el próximo juego.',
  'That input was not accepted.': 'No se aceptó esa jugada.',
  'That name is taken.': 'Ese nombre ya está en uso.',
  'You are not in this room.': 'No estás en esta sala.',
  'Only the VIP can do that.': 'Solo el VIP puede hacer eso.',
  'Pick a game first.': 'Elige un juego primero.',
  'Nothing to replay.': 'No hay nada que repetir.',
  'End the current game first.': 'Termina primero el juego actual.',
  'Change that before the next game.': 'Cámbialo antes del próximo juego.',
  'You cannot kick yourself.': 'No puedes expulsarte.',
  'Pick another player.': 'Elige a otro jugador.',
  'That player already left.': 'Ese jugador ya se fue.',
  'Unknown game.': 'Juego desconocido.',
  'This room is full.': 'Esta sala está llena.',
  'This room is locked.': 'Esta sala está cerrada.',
  'Pick a name of 1–16 characters.': 'Elige un nombre de 1 a 16 caracteres.',
  'No room with that code.': 'No hay ninguna sala con ese código.',
  'Join a room first.': 'Primero entra en una sala.',
  'Slow down.': 'Más despacio.',
  'That input is too large.': 'Esa jugada es demasiado grande.',
  'That code is already in use.': 'Ese código ya está en uso.',
  'Too many rooms open.': 'Hay demasiadas salas abiertas.',
  'That was a lot of rooms — try again in a moment.':
    'Eso fueron muchas salas: inténtalo de nuevo en un momento.',
  'The game was ended.': 'Se terminó el juego.',
  "You're the VIP now — tap ★ VIP for host controls":
    'Ahora eres el VIP: toca ★ VIP para los controles',
  'Back online': 'Conectado de nuevo',
  // canStart reasons (engine vip.ts): the VIP's Start button says why it is off.
  'A game is already running.': 'Ya hay un juego en marcha.',
  // Bots (engine bots.ts), joining (players.ts), kicks (vip.ts).
  'Join the room first.': 'Primero entra en la sala.',
  'Bots cannot add bots.': 'Los bots no pueden añadir bots.',
  'That bot is already gone.': 'Ese bot ya se fue.',
  "Only the bot's owner or the VIP can remove it.":
    'Solo quien lo añadió o el VIP pueden quitar ese bot.',
  'Pick an avatar.': 'Elige un avatar.',
  'The VIP removed you from the room.': 'El VIP te sacó de la sala.',
  // The socket layer's rejections (server sockets.ts).
  'Bad join payload.': 'No se pudo procesar tu solicitud para entrar.',
  'Bad input payload.': 'No se pudo procesar esa jugada.',
  'Bad VIP payload.': 'No se pudo procesar esa acción del VIP.',
  'Bad bot payload.': 'No se pudo procesar esa acción del bot.',
  'Bad TV payload.': 'No se pudo procesar esa acción de la TV.',
  'This TV is not watching a room.': 'Esta TV no está mostrando ninguna sala.',
};

const PATTERNS_ES: readonly [RegExp, (m: RegExpMatchArray) => string][] = [
  // canStart reasons with the game's name and the head count (engine vip.ts).
  [
    /^(.+) has no bot support — remove the bot or pick a game that welcomes bots\.$/,
    (m) => `${m[1]} no admite bots: quita el bot o elige un juego que los acepte.`,
  ],
  [
    /^(.+) has no bot support — remove the (\d+) bots or pick a game that welcomes bots\.$/,
    (m) => `${m[1]} no admite bots: quita los ${m[2]} bots o elige un juego que los acepte.`,
  ],
  [
    /^(.+) needs at least (\d+) players \((\d+) here\)\.$/,
    (m) => `${m[1]} necesita al menos ${m[2]} jugadores (hay ${m[3]}).`,
  ],
  [
    /^(.+) takes at most (\d+) players \((\d+) here\)\.$/,
    (m) => `${m[1]} admite como máximo ${m[2]} jugadores (hay ${m[3]}).`,
  ],
  [/^You can add at most (\d+) bots\.$/, (m) => `Puedes añadir como máximo ${m[1]} bots.`],
  [/^(.+) was kicked$/, (m) => `Expulsaron a ${m[1]}`],
  [/^(.+) is now the VIP$/, (m) => `${m[1]} ahora es el VIP`],
  // I-741 B: a seat taken back from another phone (engine players.ts)
  [
    /^Welcome back, (.+) — picking up where you left off$/,
    (m) => `Hola de nuevo, ${m[1]}: sigues donde lo dejaste`,
  ],
  [/^(.+) is back \(new phone\)$/, (m) => `${m[1]} volvió (con otro teléfono)`],
  [/^(.+) joined \(next game\)$/, (m) => `${m[1]} entró (para el próximo juego)`],
  [/^(.+) joined$/, (m) => `${m[1]} entró`],
  [/^(.+) left$/, (m) => `${m[1]} se fue`],
  [/^👋 (.+) says: hurry up, (.+)!$/, (m) => `👋 ${m[1]} dice: ¡date prisa, ${m[2]}!`],
  [/^👋 (.+) says: hurry up!$/, (m) => `👋 ${m[1]} dice: ¡date prisa!`],
  [
    /^Someone's trying to join as (.+) — that name's taken$/,
    (m) => `Alguien intenta entrar como ${m[1]}: ese nombre ya está en uso`,
  ],
  [/^A code is 4 letters from (.+)\.$/, (m) => `Un código tiene 4 letras de ${m[1]}.`],
];

/** The server's sentence in the phone's language, or as sent. `gameId`: the room's game, whose
 *  table covers its own server's sentences. */
export function serverText(text: string, lang: Lang, gameId?: string | null): string {
  if (lang !== 'es') return text;
  const exact = EXACT_ES[text];
  if (exact !== undefined) return exact;
  for (const [re, to] of PATTERNS_ES) {
    const m = re.exec(text);
    if (m) return to(m);
  }
  // Only patterns with real words around their placeholders: "{a} and {b}" in a game's table must
  // not half-translate a sentence nobody listed.
  return translateSent(gameStrings(gameId), lang, text, 5);
}
