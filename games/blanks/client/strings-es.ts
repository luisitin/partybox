// Blanks's screens in Spanish, keyed by the English sentence each screen passes to `L('…')`
// (strings.ts adds the picker's manifest lines and the results screen's awards). Neutral "tú",
// "teléfono", short enough for the pills and the TV's headings. The cards stay in the deck's
// language: only the words around them are here.

export const SCREENS_ES: Readonly<Record<string, string>> = {
  // The content-language marker (EnglishNote.tsx): the cards are English only.
  'in English': 'en inglés',
  // ── shared ──────────────────────────────────────────────────────────────────────────────────
  'One moment…': 'Un momento…',
  'Look at the TV': 'Mira la TV',
  'Round {round} of {rounds}': 'Ronda {round} de {rounds}',
  'Round {round} · Card {n} of {count}': 'Ronda {round} · Carta {n} de {count}',
  'Final scores': 'Marcador final',
  'Card of the night': 'Carta de la noche',
  '1 vote': '1 voto',
  '{n} votes': '{n} votos',
  'round {round}': 'ronda {round}',
  '{rest} and {last}': '{rest} y {last}',
  Next: 'Siguiente',
  'Moving on…': 'Avanzando…',
  '{name} is choosing…': '{name} está eligiendo…',
  'Just waiting for {name}…': 'Solo falta {name}…',
  'Everyone votes. Play your worst.': 'Todos votan. Saca lo peor.',
  'the cards': 'las cartas',
  'the black cards': 'las cartas negras',
  'Pick {n}': 'Elige {n}',

  // ── phone: the round card ───────────────────────────────────────────────────────────────────
  'You judge this round — sit back and read the cards.':
    'Esta ronda juzgas tú: relájate y lee las cartas.',
  '{name} judges this round.': '{name} juzga esta ronda.',
  'Last round. Play your worst.': 'Última ronda. Saca lo peor.',
  '{name} is on a {runs}-round streak': '{name} lleva una racha de {runs} rondas',
  "You're #{rank} of {count} · 1 point": 'Vas #{rank} de {count} · 1 punto',
  "You're #{rank} of {count} · {score} points": 'Vas #{rank} de {count} · {score} puntos',

  // ── phone: the judge picks the question, the hand ───────────────────────────────────────────
  '{name} is picking the question': '{name} está eligiendo la pregunta',
  'The judge is picking the question': 'El juez está eligiendo la pregunta',
  'Your hand is next — the card they choose is the one you play on.':
    'Luego te toca: juegas sobre la carta que elija.',
  'the questions on the table': 'las preguntas en la mesa',
  'Round {round} · you judge — pick the question': 'Ronda {round} · juzgas tú: elige la pregunta',
  'Tap the one the room should answer.': 'Toca la que deben responder todos.',
  "You're the judge": 'Te toca juzgar',
  '{played} / {expected} in · you pick the winner after the reading.':
    '{played} / {expected} jugaron · eliges al ganador tras la lectura.',
  'Start the reading now': 'Empezar la lectura ya',
  'Played!': '¡Jugada!',
  "Everyone's in — here comes the reading.": 'Ya jugaron todos: ahora viene la lectura.',
  "{played} / {expected} in · the reading starts when everyone's in.":
    '{played} / {expected} jugaron · la lectura empieza cuando jueguen todos.',
  '{played} / {expected} in · the reading starts when everyone is in, or when the VIP taps Next.':
    '{played} / {expected} jugaron · la lectura empieza cuando jueguen todos o cuando el VIP toque Siguiente.',
  'Out of cards': 'Sin cartas',
  'The deck ran dry — you sit this round out.': 'Se acabó el mazo: esta ronda no juegas.',
  'Play this card': 'Jugar esta carta',
  'Play these {n}': 'Jugar estas {n}',
  'Pick {n} more': 'Elige {n} más',
  'Round {round} · pick {n}, in order': 'Ronda {round} · elige {n}, en orden',
  'Round {round} · pick one': 'Ronda {round} · elige una',
  Played: 'Jugada',
  'No new hands left': 'No quedan manos nuevas',
  // I-141: the fan's counter and its New hand card.
  'New hand': 'Mano nueva',
  '{n} of {count}': '{n} de {count}',
  'Swap all {n} cards for fresh ones': 'Cambia las {n} cartas por otras nuevas',
  '{n} left': 'quedan {n}',
  'your hand': 'tu mano',
  picked: 'elegida',
  'picked {n} of {count}': 'elegida {n} de {count}',

  // ── phone: the reading and the vote ─────────────────────────────────────────────────────────
  "You're reading them out — and this one is yours. Good luck.":
    'Tú las lees en voz alta, y esta es tuya. Suerte.',
  "You're reading them out. Take your time.": 'Tú las lees en voz alta. Sin prisa.',
  "This one's yours — keep a straight face.": 'Esta es tuya: que no se te note.',
  'Read along. You pick the winner after the last card.':
    'Sigue la lectura. Eliges al ganador tras la última carta.',
  'Read along. {name} decides after the last card.':
    'Sigue la lectura. {name} decide tras la última carta.',
  'Read along. {name} is reading.': 'Sigue la lectura. Lee {name}.',
  'Read along. The vote is next.': 'Sigue la lectura. Luego se vota.',
  'Round {round} · the judge decides': 'Ronda {round} · decide el juez',
  'Round {round} · vote': 'Ronda {round} · a votar',
  'Pick the winner': 'Elige al ganador',
  'Vote for the best': 'Vota por la mejor',
  '✓ That’s everyone — here comes the result…': '✓ Ya votaron todos: ahora el resultado…',
  '✓ Vote in · {voted} / {expected} voted': '✓ Votaste · {voted} / {expected} votaron',
  'Close the vote now': 'Cerrar la votación ya',
  '{name} dropped — waiting a moment for them…': '{name} se desconectó: esperamos un momento…',
  '{voted} / {expected} voted': '{voted} / {expected} votaron',

  // ── phone: the result ───────────────────────────────────────────────────────────────────────
  'You picked {name}': 'Elegiste a {name}',
  'You won the round!': '¡Ganaste la ronda!',
  'Only two cards — you both score': 'Solo dos cartas: punto para los dos',
  'You split it with {names}': 'Compartes el punto con {names}',
  'Next round': 'Próxima ronda',
  'Voted by {names}': 'Votos de {names}',
  "Yours ({letter}) wasn't picked.": 'La tuya ({letter}) no fue elegida.',
  'Yours ({letter}) got 1 vote.': 'La tuya ({letter}) tuvo 1 voto.',
  'Yours ({letter}) got {n} votes.': 'La tuya ({letter}) tuvo {n} votos.',
  'Yours ({letter}) got 1 vote — {names}.': 'La tuya ({letter}) tuvo 1 voto: {names}.',
  'Yours ({letter}) got {n} votes — {names}.': 'La tuya ({letter}) tuvo {n} votos: {names}.',
  'Final: everyone on 0': 'Final: todos con 0',
  'No points yet': 'Aún sin puntos',
  '#{rank} of {count} · 1 point': '#{rank} de {count} · 1 punto',
  '#{rank} of {count} · {score} points': '#{rank} de {count} · {score} puntos',
  'Final: #{rank} of {count} · 1 point': 'Final: #{rank} de {count} · 1 punto',
  'Final: #{rank} of {count} · {score} points': 'Final: #{rank} de {count} · {score} puntos',

  // ── TV: the round card, the judge's pick, the answer stage ──────────────────────────────────
  '{name} judges this round': '{name} juzga esta ronda',
  'Last round. Make it count.': 'Última ronda. Que valga la pena.',
  'is on a {runs}-round streak': 'lleva una racha de {runs} rondas',
  'lead with {score}': 'lideran con {score}',
  'leads with {score}': 'lidera con {score}',
  'Round {round} of {rounds} · {name} judges': 'Ronda {round} de {rounds} · juzga {name}',
  'Round {round} of {rounds} · The judge judges': 'Ronda {round} de {rounds} · con juez',
  '{name} picked this one': '{name} eligió esta',
  '{name} is picking the question…': '{name} está eligiendo la pregunta…',
  'Picking the question…': 'Eligiendo la pregunta…',
  'the black cards to choose from': 'las cartas negras para elegir',
  "That's the round's card.": 'Esa es la carta de la ronda.',
  "One of these is this round's card.": 'Una de estas será la carta de la ronda.',
  'here comes the reading…': 'ahora viene la lectura…',
  'Waiting for {names} and {last}…': 'Esperando a {names} y {last}…',
  'Waiting for {names} and {n} more…': 'Esperando a {names} y {n} más…',
  'Last chance!': '¡Último aviso!',
  "Everyone's in!": '¡Ya jugaron todos!',
  'Play {n} cards from your hand': 'Juega {n} cartas de tu mano',
  'Play a card from your hand': 'Juega una carta de tu mano',
  '{played} / {expected} in · your cards are on your phone':
    '{played} / {expected} jugaron · tus cartas están en tu teléfono',
  '{played} / {expected} in · {waiting}': '{played} / {expected} jugaron · {waiting}',
  'No clock — the VIP taps Next when the room is ready.':
    'Sin reloj: el VIP toca Siguiente cuando estén todos listos.',

  // ── TV: the reading and the judging ─────────────────────────────────────────────────────────
  '{name} reads it out': '{name} lee en voz alta',
  '{name}, read it out loud': '{name}, léela en voz alta',
  'Read it out loud': 'A leer en voz alta',
  '{name} picks the winner after the last card.': '{name} elige al ganador tras la última carta.',
  'The vote opens after the last card.': 'Se vota tras la última carta.',
  'cards read so far': 'cartas ya leídas',
  'Judging…': 'Juzgando…',
  '{name} dropped — a moment for them to come back…':
    '{name} se desconectó: un momento para que vuelva…',
  '{name} has decided — here it comes…': '{name} ya decidió: ahí viene…',
  // I-773: the judge went, the room votes
  '{name} dropped — everyone votes this one · 0 / {expected}':
    '{name} se desconectó: esta la vota todo el mundo · 0 / {expected}',
  '{name} was removed — everyone votes this one · 0 / {expected}':
    'Sacaron a {name}: esta la vota todo el mundo · 0 / {expected}',
  '{name} left — everyone votes this one · 0 / {expected}':
    '{name} se fue: esta la vota todo el mundo · 0 / {expected}',
  'Vote on your phone · 0 / {expected}': 'Vota en tu teléfono · 0 / {expected}',
  'That’s everyone — here comes the result…': 'Ya votaron todos: ahora el resultado…',
  '{voted} / {expected} voted · waiting for': '{voted} / {expected} votaron · faltan',
  'Round {round} · The judge decides': 'Ronda {round} · Decide el juez',
  'Round {round} · Vote': 'Ronda {round} · A votar',
  'cards {from}–{to} ({page} of {pages})': 'cartas {from}–{to} ({page} de {pages})',
  'the cards, page {page} of {pages}': 'las cartas, página {page} de {pages}',

  // ── TV: the result and the final board ──────────────────────────────────────────────────────
  'Nobody played a card': 'Nadie jugó ninguna carta',
  '{name} dropped — no judge, nobody wins this round':
    '{name} se desconectó: sin juez, nadie gana esta ronda',
  '{name} never picked — nobody wins this round': '{name} no eligió: nadie gana esta ronda',
  'The judge never picked — nobody wins this round': 'El juez no eligió: nadie gana esta ronda',
  'No votes — nobody wins this round': 'Sin votos: nadie gana esta ronda',
  'Rando wins this one! Shame on all of you.': '¡Gana Rando! Qué vergüenza, gente.',
  '{names} split it with Rando': 'Empate de {names} con Rando',
  'Only {name} played — wins by default': 'Solo jugó {name}: gana sin rival',
  'Only two cards — {a} and {b} split it': 'Solo dos cartas: empate entre {a} y {b}',
  '{name} wins the round!': '¡{name} gana la ronda!',
  '{names} split it': 'Empate entre {names}',
  "{name}'s pick": 'Eligió {name}',
  "Judge's pick": 'Eligió el juez',
  'Round {round} of {rounds} · result': 'Ronda {round} de {rounds} · resultado',
  'Next card coming up…': 'Ya viene la próxima carta…',
  'That was the last card.': 'Esa fue la última carta.',
  "Next on the VIP's phone": 'El VIP toca Siguiente',
  "Nobody's score moves.": 'Nadie suma puntos.',
  '+0 · nobody': '+0 · nadie',
  'the other cards': 'las otras cartas',
  'Final round played': 'Última ronda jugada',
  "It's a tie": 'Hay empate',
  'And the winner is': 'Y el ganador es',
  // I-143: the reading when no person holds it.
  "I'll read": 'Yo leo',
  'the TV reads this one': 'esta la lee la TV',
  // I-147: sudden death.
  'TIE-BREAK': 'DESEMPATE',
  'Tie-break': 'Desempate',
  'Only the tied players play this card — you vote on it.':
    'Solo los empatados juegan esta carta; tú la votas.',
  // I-149: judge mode's side bet.
  'Which one will the judge take?': '¿Cuál va a elegir el juez?',
  'Half a point if you call it. The judge cannot see this.':
    'Medio punto si aciertas. El juez no lo ve.',
  'called it:': 'acertaron:',
  // READER-VOICES: the voice reads the card.
  '🔊 Listen': '🔊 Escucha',
  // I-144 A: the vote chips under the cards.
  'votes in': 'votos emitidos',
  // I-148 B: try your front card in a setup while the judge picks.
  'try your first card in this question': 'prueba tu primera carta en esta pregunta',
  // I-152: the Next line names whoever holds the VIP role.
  "Next on {name}'s phone": '{name} toca Siguiente',
  'No clock — {name} taps Next when the room is ready.':
    'Sin reloj: {name} toca Siguiente cuando estén todos listos.',
  '{played} / {expected} in · the reading starts when everyone is in, or when you tap Next.':
    '{played} / {expected} jugaron · la lectura empieza cuando jueguen todos o cuando toques Siguiente.',
  '{played} / {expected} in · the reading starts when everyone is in, or when {name} taps Next.':
    '{played} / {expected} jugaron · la lectura empieza cuando jueguen todos o cuando {name} toque Siguiente.',
  // I-774 B: the VIP's Next during the reading
  'Next card ({n} of {total})': 'Siguiente carta ({n} de {total})',
  'Open the vote': 'Abrir la votación',
  // I-159 B
  'View: fan': 'Vista: abanico',
  'View: list': 'Vista: lista',
  'Hand view: fan. Show as a list': 'Vista de la mano: abanico. Mostrar en lista',
  'Hand view: list. Show as a fan': 'Vista de la mano: lista. Mostrar en abanico',
};
