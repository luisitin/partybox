// Bingo in Spanish, part 2: the phone — the card, the BINGO! button, the style sheet, the notices,
// the card-pick step, the win and end screens, and the phone-only stage.
export const ES_PHONE: Readonly<Record<string, string>> = {
  // Card.tsx, Layouts.tsx
  'bingo card': 'cartón de bingo',
  '{cell}, daubed': '{cell}, marcado',
  'Card {n}': 'Cartón {n}',
  swapped: 'cambiado',
  won: 'ganado',
  up: 'arriba',
  'first number…': 'primer número…',

  // Controller.tsx, ControllerParts.tsx
  'swap this': 'cambiar',
  'No bingo this round': 'Sin bingo esta ronda',
  'First number coming…': 'Ya viene el primer número…',
  'Not a bingo': 'No es bingo',
  'Checking your card…': 'Revisando tu cartón…',
  'Checking on the TV…': 'Revisando en la TV…',
  'Not a bingo — see card {n}': 'No es bingo: mira el cartón {n}',
  'Their card: not a bingo': 'Su cartón: no es bingo',
  "{name}'s card: not a bingo": 'Cartón de {name}: no es bingo',
  'Checking the card…': 'Revisando el cartón…',
  "Checking {name}'s card…": 'Revisando el cartón de {name}…',
  'Look at the TV': 'Mira la TV',
  '⏸ Paused': '⏸ En pausa',
  'Yours already': 'Ya es tuyo',
  'Next number soon…': 'Pronto, otro número…',
  'Tap again · {n} s': '¡Otra vez! · {n} s',
  "{name} is calling it… you're next": '{name} canta bingo… luego tú',
  '{name} is calling it… #{place} in line': '{name} canta bingo… n.º {place} en la fila',
  '{name} is calling it…': '{name} canta bingo…',
  "{name} says BINGO! …and it's real": '{name} canta ¡BINGO! …¡y es de verdad!',
  '{name} says BINGO! …not a bingo — carry on': '{name} canta ¡BINGO! …no es bingo: seguimos',
  'BINGO! card {n}, armed, tap again to claim':
    '¡BINGO! cartón {n}, preparado: toca otra vez para cantarlo',
  'BINGO! card {n}': '¡BINGO! cartón {n}',
  'Dibs lapsed — tap twice within 3 s to claim':
    'Se pasó el tiempo: toca dos veces en 3 s para cantar',
  'Finish the game': 'Terminar el juego',
  'Next round — fresh cards': 'Otra ronda — cartones nuevos',
  'Keep going — same pattern': 'Seguir — misma figura',
  'Keep going — blackout': 'Seguir — cartón lleno',
  '🃏 style': '🃏 estilo',
  'for this round': 'para esta ronda',

  // Notices.tsx
  'Turn your phone sideways for {style}.': 'Gira el teléfono en horizontal para {style}.',
  'Turn your phone upright for {style}.': 'Pon el teléfono en vertical para {style}.',
  'the cards appear the moment you do': 'los cartones aparecen en cuanto lo hagas',
  'Back — you missed a number. It is on the TV board.':
    'De vuelta: te perdiste un número. Está en el tablero de la TV.',
  'Back — you missed {n} numbers. They are on the TV board.':
    'De vuelta: te perdiste {n} números. Están en el tablero de la TV.',
  'Card {n} wiped — re-daub from memory when play resumes.':
    'Cartón {n} borrado: vuelve a marcarlo de memoria cuando siga el juego.',
  'Card {n} is up — everyone is checking it.': 'Cartón {n} a la vista: todos lo están revisando.',
  'Card {n} is on the TV — everyone is checking it.':
    'Cartón {n} en la TV: todos lo están revisando.',
  "You're watching this one": 'Esta vez solo miras',
  '{letter} {number} — {call}. Called so far: {called}':
    '{letter} {number} — {call}. Han salido: {called}',
  'You get a card next game.': 'Tendrás cartón en el próximo juego.',

  // Overlays.tsx, DaubRows.tsx, PhonePanel.tsx: the style sheet, the curtain, the countdowns.
  'Card style preview': 'Vista previa del estilo',
  '{style}: like it?': '{style}: ¿te gusta?',
  'Keep changing': 'Seguir cambiando',
  Confirm: 'Confirmar',
  'Card style': 'Estilo',
  'the room is paused': 'la sala está en pausa',
  sideways: 'horizontal',
  upright: 'vertical',
  Motion: 'Animación',
  'cards rise, numbers pop': 'suben cartones, saltan números',
  off: 'no',
  'on ✓': 'sí ✓',
  'Theme: the 🎨 in the top bar, any time.': 'Tema: el 🎨 de la barra de arriba, cuando quieras.',
  Close: 'Cerrar',
  Daub: 'Marca',
  Ink: 'Tinta',
  'Change my style too': 'Cambiar el mío también',
  'you said keep going': 'dijiste que seguimos',
  '{name} said keep going': '{name} dijo que seguimos',
  'ready — waiting for {n} more': 'listo: esperando a {n} más',
  'ready — waiting for {a} and {b}': 'listo: esperando a {a} y {b}',
  'ready — waiting for {name}': 'listo: esperando a {name}',
  'everyone is waiting for you': 'todos te esperan',
  'swap a card, or tap Ready': 'cambia un cartón o toca Listo',
  'swap it, or tap Ready': 'cámbialo o toca Listo',
  Another: 'Otro',
  Picked: 'Elegido',
  Swapped: 'Cambiado',
  'card {n}': 'cartón {n}',
  '✓ Ready': '✓ Listo',
  Ready: 'Listo',

  // PhoneStage.tsx
  '+1 point for {name}.': '+1 punto para {name}.',
  '+{n} points for {name}.': '+{n} puntos para {name}.',
  'checking…': 'revisando…',

  // WinScreen.tsx
  'Keep these cards and carry on calling, or deal fresh ones? Everyone votes.':
    '¿Seguimos con estos cartones o repartimos nuevos? Todos votan.',
  'The players decide: keep going or next round.': 'Los jugadores deciden: seguir u otra ronda.',
  'Fresh cards next round.': 'Cartones nuevos en la próxima ronda.',
  'That was the last round.': 'Esa fue la última ronda.',
  '+1 point.': '+1 punto.',
  '+{n} points.': '+{n} puntos.',
  'Keep going and this card sits the pattern out; your other cards play on. Everyone votes.':
    'Si seguimos, este cartón no juega esta figura; tus otros cartones sí. Todos votan.',
  'Points so far': 'Puntos hasta ahora',
  'You won!': '¡Ganaste!',
  'You finished #{rank}': 'Quedaste {rank}.º',
  'Thanks for playing': 'Gracias por jugar',
  'And the winner is… look at the TV.': 'Y quien gana es… mira la TV.',
  'And the winner is… {name}!': 'Y quien gana es… ¡{name}!',
  'A tie at the top!': '¡Empate en el primer puesto!',
  'That’s the game!': '¡Fin del juego!',
  // I-126 A: the tablet's own row in the style sheet.
  'All cards': 'Todos los cartones',
  '· the tablet layout': '· la vista de tableta',
  tablet: 'tableta',
  // I-105: the vote's hint line on the phone.
  'Your vote is in — tap another to change it.': 'Ya votaste: toca otra para cambiar.',
  'Everyone votes; the most votes win.': 'Todos votan; gana la opción más votada.',
  // I-122 A: the reconnect tray.
  'Back — you missed': 'De vuelta: te perdiste',
  '+{n} more': '+{n} más',
  dismiss: 'cerrar',
};
