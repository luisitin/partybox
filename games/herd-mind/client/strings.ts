// Herd Mind's words in other languages, keyed by the English sentence (ADR-044). Screens write
// `L('…')` from `useT(STRINGS)`; the picker reads the manifest's lines from here too until F2a
// moves them server-side. Content (the questions) stays in English.
import type { Strings } from '@partybox/game-sdk/ui';

export const STRINGS: Strings = {
  es: {
    // manifest.json — the game picker
    "Think like the herd. Don't be the odd sheep.": 'Piensa como el rebaño. No seas la oveja rara.',
    'A question appears and everyone picks the answer they think most people will pick. The biggest group scores. Alone with your answer? You take the Black Sheep, and nobody holding it can win. First to the target without the sheep wins.':
      'Aparece una pregunta y cada quien elige la respuesta que cree que elegirá la mayoría. El grupo más grande suma. ¿Te quedas solo con tu respuesta? Te llevas la Oveja Negra, y quien la tenga no puede ganar. Gana quien llegue primero a la meta sin la oveja.',
    Answers: 'Respuestas',
    'Tap one of eight tiles, or type anything (the VIP can merge answers that mean the same)':
      'Toca una de ocho fichas o escribe lo que quieras (el VIP puede unir respuestas que significan lo mismo)',
    Tiles: 'Fichas',
    Typed: 'Escritas',
    'Points to win': 'Puntos para ganar',
    'First to this many points without the Black Sheep wins':
      'Gana quien llegue primero a estos puntos sin la Oveja Negra',
    Questions: 'Preguntas',
    'The most questions before the top scorer without the sheep wins':
      'Máximo de preguntas antes de que gane quien más puntos tenga sin la oveja',
    Pace: 'Ritmo',
    'Time to answer: relaxed 25 s, normal 15 s, fast 10 s (typed: 35, 25, 20)':
      'Tiempo para responder: tranquilo 25 s, normal 15 s, rápido 10 s (escritas: 35, 25, 20)',
    Relaxed: 'Tranquilo',
    Normal: 'Normal',
    Fast: 'Rápido',
    'Spicy questions': 'Preguntas picantes',
    'Adds the grown-up pack to the draw': 'Añade el paquete para adultos al sorteo',
    Reader: 'Lector',
    'Who reads each question aloud': 'Quién lee cada pregunta en voz alta',
    'American Woman': 'Mujer estadounidense',
    'Old British Man': 'Señor británico',
    'Young British Man': 'Joven británico',
    'Soft-Spoken Woman': 'Mujer de voz suave',
    Original: 'Original',
    'No reader': 'Sin lector',
    // TV + phone: the rules
    'Herd Mind': 'Mente de Rebaño',
    'Pick the answer you think most people will pick.':
      'Elige la respuesta que crees que elegirá la mayoría.',
    'The biggest group scores a point. A tie for biggest scores nothing.':
      'El grupo más grande suma un punto. Si hay empate por el más grande, nadie suma.',
    "Alone with your answer? You take the Black Sheep, and can't win while you hold it.":
      '¿Solo con tu respuesta? Te llevas la Oveja Negra y no puedes ganar mientras la tengas.',
    'First to {target} points wins.': 'Gana quien llegue primero a {target} puntos.',
    'the Black Sheep': 'la Oveja Negra',
    // TV: answer
    'Question {n} of {total} · First to {target}':
      'Pregunta {n} de {total} · Gana quien llegue a {target}',
    '{name} has the Black Sheep': '{name} tiene la Oveja Negra',
    answers: 'respuestas',
    'Type what you think most people will say.': 'Escribe lo que crees que dirá la mayoría.',
    '{locked} / {total} locked in': '{locked} / {total} listos',
    'Answer on your phone': 'Responde en tu teléfono',
    // TV: herd
    'The herd says {answer}!': '¡El rebaño dice {answer}!',
    "No herd. It's a tie!": 'No hay rebaño. ¡Es un empate!',
    'No herd. Everyone went their own way!': 'No hay rebaño. ¡Cada quien por su lado!',
    'Nobody answered.': 'Nadie respondió.',
    'Nobody answered this one.': 'Nadie respondió esta.',
    HERD: 'REBAÑO',
    Alone: 'Solos',
    merged: 'unidos',
    '{list} and {last}': '{list} y {last}',
    // TV: score
    '{answer}: {names} +1': '{answer}: {names} +1',
    "No herd. It's a tie. Nobody scores.": 'No hay rebaño. Es un empate. Nadie suma.',
    'No herd. Nobody scores.': 'No hay rebaño. Nadie suma.',
    '🐑 The Black Sheep goes to {name}.': '🐑 La Oveja Negra es para {name}.',
    '🐑 The Black Sheep stays with {name}.': '🐑 La Oveja Negra se queda con {name}.',
    '🐑 The Black Sheep stays in the pasture.': '🐑 La Oveja Negra se queda en el prado.',
    Pasture: 'Prado',
    'holding the sheep': 'con la oveja',
    '{name} wins!': '¡Gana {name}!',
    '{names} win!': '¡Ganan {names}!',
    'Next up · Question {n} of {total}': 'Ahora · Pregunta {n} de {total}',
    'That was the last question': 'Esa fue la última pregunta',
    'Nobody scored. It ends in a draw.': 'Nadie sumó. Termina en empate.',
    // phone: answer
    'Locked: {answer} · tap another to change': 'Elegiste: {answer} · toca otra para cambiar',
    'Tap what most people will pick': 'Toca lo que elegirá la mayoría',
    "✗ Didn't go through — tap again": '✗ No se envió — toca otra vez',
    'Change my answer': 'Cambiar mi respuesta',
    'Lock it in': 'Confirmar',
    'Locked: “{answer}”': 'Enviaste: «{answer}»',
    'What will most people say?': '¿Qué dirá la mayoría?',
    'Your answer': 'Tu respuesta',
    'Type an answer.': 'Escribe una respuesta.',
    // phone: stage phases
    "Let's go": '¡Vamos!',
    Next: 'Siguiente',
    'Watch the TV': 'Mira la TV',
    'You said {answer}': 'Dijiste {answer}',
    'No answer this time.': 'Esta vez no respondiste.',
    'The answers are in…': 'Ya están las respuestas…',
    'Next question': 'Siguiente pregunta',
    'See the results': 'Ver los resultados',
    'Next question coming up': 'Ya viene la siguiente pregunta',
    '🐑 In the herd! +1 ({answer}, {count} of you)':
      '🐑 ¡En el rebaño! +1 ({answer}, {count} de ustedes)',
    "Alone with {answer}. You've got the Black Sheep.":
      'Solo con {answer}. Te llevas la Oveja Negra.',
    'Alone with {answer}. Nobody takes the sheep this time.':
      'Solo con {answer}. Esta vez nadie se lleva la oveja.',
    '{answer}, {count} of you. Tie. Nobody scores.':
      '{answer}, {count} de ustedes. Empate. Nadie suma.',
    '{answer}, {count} of you. Not the herd.': '{answer}, {count} de ustedes. No es el rebaño.',
    "You hold the Black Sheep. You can't win until someone else is the only one alone.":
      'Tienes la Oveja Negra. No puedes ganar hasta que otra persona sea la única que quede sola.',
    // phone: merge tool (VIP, typed mode)
    'Same answer, different words? Tap two, then Merge.':
      '¿La misma respuesta con otras palabras? Toca dos y luego Unir.',
    Merge: 'Unir',
    'Score it': 'Puntuar',
    Undo: 'Deshacer',
    // phone: other
    'Watching this game': 'Estás mirando este juego',
    'You can play in the next one.': 'Puedes jugar en el siguiente.',
    'Thanks for playing!': '¡Gracias por jugar!',
  },
};
