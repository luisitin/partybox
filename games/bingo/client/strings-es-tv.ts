// Bingo in Spanish, part 3: the TV — the call, the hold, the claim stage and its verdicts, the
// dibs line, the intro's countdown and programme, the boards.
export const ES_TV: Readonly<Record<string, string>> = {
  // Tv.tsx, tvBoard.ts
  'call {n} of 75': 'bola {n} de 75',
  'calling resumes when they are done': 'el locutor sigue cuando terminen',
  'Before that': 'Antes',
  '1 bingo so far': '1 bingo hasta ahora',
  '{n} bingos so far': '{n} bingos hasta ahora',
  '{name} is one away': '{name} está a un número',
  '{names} and {last} are one away': '{names} y {last} están a un número',
  "{name}. {n} of those were never called. We're watching you.":
    '{name}. {n} de esos nunca salieron. Te estamos vigilando.',
  'Not yet, {name} — {n} of those was never called': 'Todavía no, {name}: {n} de esos nunca salió',
  'Not yet, {name} — {n} of those were never called':
    'Todavía no, {name}: {n} de esos nunca salieron',
  '✓ right': '✓ bien',
  '✕ never called': '✕ no salió',
  '▢ missed': '▢ faltó',
  "one fib and a bingo, {name} — we're watching you.":
    'una trampita y un bingo, {name}: te estamos vigilando.',
  "{n} fibs and a bingo, {name} — we're watching you.":
    '{n} trampitas y un bingo, {name}: te estamos vigilando.',
  '…and 1 daub that was never called — lucky the line was real.':
    '…y 1 marca que nunca salió: suerte que la línea era buena.',
  '…and {n} daubs that were never called — lucky the line was real.':
    '…y {n} marcas que nunca salieron: suerte que la línea era buena.',
  '{pattern} on call {n}': '{pattern} en la bola {n}',
  '+1 point': '+1 punto',
  '+{n} points': '+{n} puntos',
  Anyone: 'Cualquiera',
  'picks on their phone: keep going (same pattern or blackout) or finish. The caller waits.':
    'elige en su teléfono: seguir (misma figura o cartón lleno) o terminar. El locutor espera.',
  'picks on their phone: keep going (same pattern or blackout) or next round. The caller waits.':
    'elige en su teléfono: seguir (misma figura o cartón lleno) u otra ronda. El locutor espera.',
  'picks on their phone: keep going or finish. The caller waits.':
    'elige en su teléfono: seguir o terminar. El locutor espera.',
  'picks on their phone: keep going or next round. The caller waits.':
    'elige en su teléfono: seguir u otra ronda. El locutor espera.',
  'The winning card sits the pattern out; the rest play on.':
    'El cartón ganador no juega esta figura; los demás siguen.',
  'No bingo': 'Sin bingo',
  "The deck's empty — nobody wins round {round}.":
    'Se acabaron las bolas: nadie gana la ronda {round}.',
  'Final round played': 'Última ronda jugada',
  "It's a tie": 'Hay empate',
  'And the winner is': 'Y quien gana es',
  Points: 'Puntos',
  "That's bingo!": '¡Fin del bingo!',

  // TvParts.tsx
  'then {name}': 'luego {name}',
  'then {name} and {n} more': 'luego {name} y {n} más',
  '{name} says BINGO?…': '{name} canta ¿BINGO?…',
  '{name} says BINGO?… — never mind': '{name} canta ¿BINGO?… — falsa alarma',
  '1 number called': '1 número cantado',
  '{n} numbers called': '{n} números cantados',
  'card {n} of {total}': 'cartón {n} de {total}',

  // TvCountdown.tsx
  'pick your cards on your phone — {n} still picking':
    'elige tus cartones en el teléfono: faltan {n}',
  'pick your cards on your phone — waiting for {names}':
    'elige tus cartones en el teléfono: esperando a {names}',
  'calling resumes in': 'el locutor sigue en',
  '{name} said keep going — thumbs ready': '{name} dijo que seguimos: pulgares listos',
  '{n} cards each — BINGO! checks the card you press it on.':
    '{n} cartones cada uno: ¡BINGO! revisa el cartón donde lo toques.',
  // I-138: what a bot says about its own verdict (its name goes in front, as written).
  'my sensors were dirty': 'tenía los sensores sucios',
  'I got excited': 'me emocioné',
  'recalculating…': 'recalculando…',
  'that was a rounding error': 'fue un error de redondeo',
  'I counted the FREE twice': 'conté el LIBRE dos veces',
  'my clock is fast': 'mi reloj va adelantado',
  'beep. gloat.': 'bip. presumo.',
  'as computed': 'según mis cálculos',
  'humans: 0': 'humanos: 0',
};
