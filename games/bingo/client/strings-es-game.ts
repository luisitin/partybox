// Bingo in Spanish, part 1: the picker's manifest lines, what the server writes (the pattern names
// and hints, read through `L.sent`), the lines both surfaces share (copy.ts), and the names of the
// per-phone settings (words.ts, styles.ts). Vocabulary: card → cartón, daub → marcar, pattern →
// figura, call → bola / número, caller → locutor, blackout → cartón lleno, FREE → LIBRE.
export const ES_GAME: Readonly<Record<string, string>> = {
  // The manifest (the game picker and its settings).
  'Daub what you hear. Press BINGO! Everyone checks.':
    'Marca lo que oyes. Toca ¡BINGO! Todos lo revisan.',
  'Plain 75-ball bingo. The TV calls a number every few seconds; you daub your own card however you like. Press BINGO! and the caller stops while your card goes on the TV for everyone to check: the pattern in green, every square you daubed that was never called in red. Right — you win the round. Wrong — your wrong daubs and that line are wiped, and the caller carries on.':
    'Bingo clásico de 75 bolas. La TV canta un número cada pocos segundos; tú marcas tu cartón como quieras. Toca ¡BINGO! y el locutor se detiene mientras tu cartón sale en la TV para que todos lo revisen: la figura en verde y, en rojo, cada casilla que marcaste y nunca salió. ¿Acertaste? Ganas la ronda. ¿Fallaste? Se borran tus marcas equivocadas y esa línea, y el locutor sigue.',
  Rounds: 'Rondas',
  'Each round deals fresh cards and a fresh deck': 'Cada ronda reparte cartones y bolas nuevos',
  'Round 1 pattern': 'Figura de la ronda 1',
  'Round 2 pattern': 'Figura de la ronda 2',
  'Round 3 pattern': 'Figura de la ronda 3',
  'Round 4 pattern': 'Figura de la ronda 4',
  'Round 5 pattern': 'Figura de la ronda 5',
  'Only used when Rounds is 4 or more': 'Solo se usa con 4 rondas o más',
  'Only used when Rounds is 5': 'Solo se usa con 5 rondas',
  // I-134 A: the waiting phone's line, written by the server (the call itself — letter, number,
  // nickname — is content and stays as sent).
  'the cards are going out…': 'se están repartiendo los cartones…',
  'the first number is coming…': 'ya viene el primer número…',
  'Any line': 'Línea', // Spanish bingo's own word for "any line" (the hint spells it out)
  'Four corners': 'Cuatro esquinas',
  'The X': 'La X',
  Blackout: 'Cartón lleno',
  'Picture frame': 'Marco',
  'Postage stamp': 'Sello postal',
  'The T': 'La T',
  'Cards per player': 'Cartones por jugador',
  'How many cards everyone plays each round — one BINGO! button checks your best card':
    'Cuántos cartones juega cada uno por ronda: un solo botón de ¡BINGO! revisa tu mejor cartón',
  'Seconds per number': 'Segundos por número',
  'How long each number stays up before the next one is called':
    'Cuánto se ve cada número antes de cantar el siguiente',
  // READER-VOICES: whose voice calls the numbers.
  Reader: 'Locutor',
  'Whose voice calls the numbers': 'Qué voz canta los números',
  'No reader': 'Sin locutor',
  'Old British Man': 'Señor británico',
  'Young British Man': 'Joven británico',
  'American Woman': 'Mujer estadounidense',
  'Soft-Spoken Woman': 'Mujer de voz suave',
  Original: 'Original',
  // I-112 C: one three-way choice replaced "Called board" and "Previous number".
  'Calls shown': 'Números a la vista',
  'How much of the call history the TV keeps up': 'Cuántos números ya cantados muestra la TV',
  'Memory test (nothing)': 'Prueba de memoria (nada)',
  'Last call only': 'Solo el último',
  'Full board': 'Tablero completo',
  'One away': 'A un número',
  'Tell the room when a player is one number from the pattern — a ring in the strip, a line under the call and a hush':
    'Avisa a la sala cuando a alguien le falta un número para la figura: un aro en la franja, una línea bajo el número y un susurro',
  'Cheeky caller': 'Locutor pícaro',
  'Cheekier nicknames for some numbers (PG-13)': 'Apodos más pícaros para algunos números (+13)',

  // What the server writes: the pattern's hint (its name is one of the manifest's options above).
  'Five in a row — across, down or diagonal. FREE counts.':
    'Cinco en fila: horizontal, vertical o diagonal. LIBRE cuenta.',
  'The four corner squares.': 'Las cuatro casillas de las esquinas.',
  'Both diagonals, corner to corner.': 'Las dos diagonales, de esquina a esquina.',
  'Every square on the card. Settle in.': 'Todas las casillas del cartón. Tómatelo con calma.',
  'The outer ring — all sixteen edge squares.': 'El borde: las dieciséis casillas de fuera.',
  'Any 2×2 block in a corner of the card.': 'Cualquier bloque de 2×2 en una esquina del cartón.',
  'The top row and the middle column.': 'La fila de arriba y la columna del medio.',

  // Both surfaces.
  'Round {round} of {total}': 'Ronda {round} de {total}',
  'BINGO!': '¡BINGO!',
  '{name} says BINGO!': '{name} canta ¡BINGO!',
  'NOT A BINGO': 'NO ES BINGO',
  'Card wiped. Next number in a moment…': 'Cartón borrado. Enseguida sale otro número…',
  // I-435: what a wrong claim took
  'Wrong daubs and that line wiped. Next number in a moment…':
    'Marcas equivocadas y esa línea borradas. Enseguida sale otro número…',
  'Card {n}: the wrong daubs and that line are wiped — the rest stay.':
    'Cartón {n}: se borran las marcas equivocadas y esa línea; el resto se queda.',
  'Card {n}: the wrong daubs are wiped — the rest stay.':
    'Cartón {n}: se borran las marcas equivocadas; el resto se queda.',
  'checking against {n} calls': 'comprobando con {n} bolas',
  'Final points': 'Puntos finales',
  'Next: round {round} — {pattern}': 'Siguiente: ronda {round} — {pattern}',
  'Nothing left to play for on these cards — the scores in a moment.':
    'Ya no queda nada por jugar en estos cartones: enseguida, los puntos.',
  'dealing the cards…': 'repartiendo cartones…',
  'everyone is ready': 'todos listos',
  'first number in': 'primer número en',
  'get your thumbs ready': 'prepara los pulgares',
  'call {n}': 'bola {n}',
  'before that': 'antes',
  FREE: 'LIBRE',

  // copy.ts: the win lines ({nth} is "2.º" / "1.er" in Spanish), why a claim failed, the choice.
  "{name}'s {nth} blackout": '{nth} cartón lleno de {name}',
  '{name} wins round {round}': '{name} gana la ronda {round}',
  "{name}'s {nth} bingo": '{nth} bingo de {name}',
  'BLACKOUT! Your {nth} blackout in round {round}':
    '¡CARTÓN LLENO! Tu {nth} cartón lleno de la ronda {round}',
  'BLACKOUT! Your {nth} blackout in round {round} — card {card}':
    '¡CARTÓN LLENO! Tu {nth} cartón lleno de la ronda {round} — cartón {card}',
  'BINGO! You win round {round}': '¡BINGO! Ganas la ronda {round}',
  'BINGO! You win round {round} — card {card}': '¡BINGO! Ganas la ronda {round} — cartón {card}',
  'BINGO! Your {nth} bingo in round {round}': '¡BINGO! Tu {nth} bingo de la ronda {round}',
  'BINGO! Your {nth} bingo in round {round} — card {card}':
    '¡BINGO! Tu {nth} bingo de la ronda {round} — cartón {card}',
  '{name} has a blackout': '{name} tiene cartón lleno',
  '{name} has bingo': '{name} tiene bingo',
  '{name} — {nth} bingo in round {round}': '{name}: {nth} bingo de la ronda {round}',
  '{a} and {b}': '{a} y {b}',
  '{a}, {b} and {n} more': '{a}, {b} y {n} más',
  '{list} was never called': '{list} nunca salió',
  '{list} were never called': '{list} nunca salieron',
  // I-392 B: the checked line
  '{line}: {why}': '{line}: {why}',
  'Top row': 'Fila de arriba',
  'Row 2': 'Fila 2',
  'Middle row': 'Fila del medio',
  'Row 4': 'Fila 4',
  'Bottom row': 'Fila de abajo',
  'The {letter} column': 'La columna {letter}',
  'The diagonal': 'La diagonal',
  // I-401: the awards
  'Quick draw': 'Mano rápida',
  'Bingo on call {n}': 'Bingo en la bola {n}',
  'Clean card': 'Cartón limpio',
  'Won with no stray daubs': 'Ganó sin marcas de más',
  '{n} wins with no stray daubs': '{n} victorias sin marcas de más',
  'Trigger finger': 'Gatillo fácil',
  '1 wrong BINGO!': '1 ¡BINGO! equivocado',
  '{n} wrong BINGO!s': '{n} ¡BINGO! equivocados',
  // I-433 B: a bot's claim
  '{name} calls it — checking': '{name} lo canta: comprobando',
  '{list} was missed': 'faltó marcar {list}',
  '{list} were missed': 'faltó marcar {list}',
  'keep going — same pattern': 'seguir — misma figura',
  'keep going — blackout': 'seguir — cartón lleno',
  'finish the game': 'terminar el juego',
  'next round': 'otra ronda',
  '{name} picked: {what}. It starts when the celebration is done.':
    '{name} eligió: {what}. Empieza cuando acabe la celebración.',
  'Picked: {what}. It starts when the celebration is done.':
    'Elegido: {what}. Empieza cuando acabe la celebración.',
  '⏸ {name} is changing card style…': '⏸ {name} está cambiando el estilo…',
  '⏸ {a} and {b} are changing card style…': '⏸ {a} y {b} están cambiando el estilo…',
  '⏸ {name} and {n} others are changing card style…':
    '⏸ {name} y {n} más están cambiando el estilo…',

  // words.ts / styles.ts: card styles, daubs, inks, the programme's short pattern names.
  Focus: 'Foco',
  'one big card + thumbnails': 'un cartón grande + miniaturas',
  Grid: 'Mosaico',
  'all cards at once': 'todos a la vez',
  Stack: 'Pila',
  'two cards, upright': 'dos cartones, vertical',
  'Side by side': 'Lado a lado',
  'two cards, sideways': 'dos cartones, horizontal',
  Strip: 'Tira',
  '3–4 cards, sideways': '3–4 cartones, horizontal',
  '{n} cards only': 'solo {n} cartones',
  '{first}–{last} cards only': 'solo {first}–{last} cartones',
  Blot: 'Mancha',
  Stamp: 'Sello',
  Ring: 'Aro',
  Mine: 'Mía',
  Pink: 'Rosa',
  Gold: 'Oro',
  Green: 'Verde',
  line: 'línea',
  corners: 'esquinas',
  x: 'x',
  blackout: 'cartón lleno',
  frame: 'marco',
  stamp: 'sello',
  tee: 't',
};
