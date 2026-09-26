// Who Said It's words in Spanish, keyed by the English sentence (ADR-044). Screens read them
// through `useT(STRINGS)` as `L('…')`; the game picker reads the manifest lines from here, and the
// results screens the award lines the server writes. `{name}` marks a placeholder (a `{n}` matches
// digits only). Content — the questions and the players' answers — stays as written.
// "Question" is "pregunta"; "tap" is "tocar"; the reader's "It was…" is "Fue…".
import type { Strings } from '@partybox/game-sdk/ui';

export const STRINGS: Strings = {
  es: {
    // Written by the server (scoring.ts awardsFor) — first, so no looser sentence claims them.
    'Mind Reader': 'Lee mentes',
    'Right guesses: {n}': 'Aciertos: {n}',
    'Mystery Guest': 'Invitado misterioso',
    'Guessers fooled: {n}': 'Jugadores engañados: {n}',
    'Open Book': 'Libro abierto',
    'Right guesses on their answers: {n}': 'Aciertos sobre sus respuestas: {n}',
    'Knows You Best': 'Te conoce mejor',
    '{guesser} knows {author} best ({n} of {m})':
      '{guesser} es quien mejor conoce a {author} ({n} de {m})',
    // What the VIP's Skip / Next does (view-common.ts vipSkipLabel).
    "Let's go": '¡Vamos!',
    'Start writing': 'A escribir',
    'Close answers': 'Cerrar respuestas',
    'Next answer': 'Siguiente respuesta',
    'Begin reveals': 'Empezar a revelar',
    'Next card': 'Siguiente respuesta',
    'Show who wrote it': 'Mostrar quién la escribió',
    'Next question': 'Siguiente pregunta',
    'See results': 'Ver resultados',
    'Skip / Next': 'Saltar / Siguiente',

    // The game picker (manifest.json).
    'When everyone answers, guess who wrote all but the last.':
      'Si todos responden, adivina quién escribió todas menos la última.',
    'Everyone answers the same question. If all answer, guess all but the last before any reveal; otherwise guess every answer. Then watch them flip one by one. Score for right guesses and each friend your answer fools. Answer honestly or write like someone else to throw the room off.':
      'Todos responden la misma pregunta. Si todos responden, adivina todas menos la última antes de revelar; si no, adivina cada respuesta. Después mira cómo se revelan una a una. Sumas por cada acierto y cada amigo al que engañe tu respuesta. Responde con sinceridad o escribe como otra persona para despistar a la sala.',
    Questions: 'Preguntas',
    'Questions to answer; auto picks 4, 3 or 2 by room size, and a big room is capped at 40 answers':
      'Preguntas a responder; automático elige 4, 3 o 2 según la sala, y una sala grande tiene un tope de 40 respuestas',
    Auto: 'Automático',
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    'Writing time': 'Tiempo para escribir',
    'Seconds to write an answer': 'Segundos para escribir una respuesta',
    'Guessing time': 'Tiempo para adivinar',
    'Seconds to guess who wrote each guessable answer':
      'Segundos para adivinar quién escribió cada respuesta que se puede adivinar',
    'Need an idea?': '¿Necesitas una idea?',
    'A once-per-question button that offers two ready-made answers':
      'Un botón, una vez por pregunta, que ofrece dos respuestas ya hechas',
    'Read answers aloud': 'Leer las respuestas en voz alta',
    'The reader says each guessable answer before guessing':
      'La voz lee cada respuesta que se puede adivinar',
    'Spicy questions': 'Preguntas picantes',
    'Mix in flirty, embarrassing questions for grown-ups':
      'Añade preguntas atrevidas y vergonzosas para adultos',
    Reader: 'Voz',
    'The voice that reads the questions and answers':
      'La voz que lee las preguntas y las respuestas',
    'Soft-Spoken Woman': 'Mujer de voz suave',
    'Old British Man': 'Señor británico',
    'Young British Man': 'Joven británico',
    'American Woman': 'Mujer estadounidense',
    Original: 'Original',
    'No reader': 'Sin voz',

    // How to play (steps.ts).
    'Everyone answers the same question on their phone.':
      'Todos responden la misma pregunta en su teléfono.',
    'Guess every answer if anyone skips writing; otherwise skip the last, then watch reveals.':
      'Adivina todas si alguien no escribe; si no, omite la última y mira las revelaciones.',
    'Score for every right guess, and for every player your answer fools.':
      'Sumas por cada acierto y por cada jugador al que engañe tu respuesta.',

    // TV.
    'Who Said It?': '¿Quién lo dijo?',
    'Question {n} of {total}': 'Pregunta {n} de {total} · en inglés',
    'Answer on your phone': 'Responde en tu teléfono',
    'Last chance!': '¡Última oportunidad!',
    '{n} / {total} answers in': '{n} / {total} respuestas',
    "Everyone's in!": '¡Ya están todos!',
    'Just waiting for {name}…': 'Solo falta {name}…',
    'Waiting for {names} and {last}…': 'Esperando a {names} y {last}…',
    'Waiting for {names} and {n} more…': 'Esperando a {names} y {n} más…',
    'Write like yourself — or like someone else.': 'Escribe como tú… o como otra persona.',
    'Who said it?': '¿Quién lo dijo?',
    'Answer {n} of {total}': 'Respuesta {n} de {total} · en inglés',
    '{n} of {total} tapped': '{n} de {total} ya tocaron',
    'If anyone skipped writing, guess every answer; otherwise skip the last.':
      'Si alguien no escribió, adivinen todas; si no, omitan la última.',
    'It was…': 'Fue…',
    'It was… {name}!': '¡Fue… {name}!',
    'It was… BOTH {names} and {last}!': '¡Fueron… {names} Y {last}!',
    '+{pts} · fooled {n}': '+{pts} · engañó a {n}',
    'Fooled nobody': 'No engañó a nadie',
    'Everyone knew!': '¡Todos lo sabían!',
    'Nobody saw that coming!': '¡Nadie lo vio venir!',
    'Nobody answered!': '¡Nadie respondió!',
    'Final scores': 'Puntuación final',
    'Scores after question {n} of {total}': 'Puntos tras la pregunta {n} de {total}',

    // Phone.
    'Get ready to answer…': 'Prepárate para responder…',
    'Lock it in': 'Confirmar',
    'Locked in': 'Confirmada',
    'Sending…': 'Enviando…',
    Change: 'Cambiar',
    'Your answer…': 'Tu respuesta…',
    'your answer': 'tu respuesta',
    'Type an answer.': 'Escribe una respuesta.',
    'Tap one to use it:': 'Toca una para usarla:',
    'Waiting for the others… then the guessing.': 'Esperando a los demás… luego a adivinar.',
    'Waiting for the others… then watch the TV.': 'Esperando a los demás… luego mira la TV.',
    "This one's yours — sit tight": 'Esta es tuya: quédate quieto',
    'Keep a straight face while the others guess.':
      'Pon cara de póquer mientras los demás adivinan.',
    'Tap who you think wrote it': 'Toca a quien crees que lo escribió',
    'Picked {name} · tap another face to change': 'Elegiste a {name} · toca otra cara para cambiar',
    'Pick {name}': 'Elegir a {name}',
    '{name}, picked': '{name}, elegido',
    'Watch the TV': 'Mira la TV',
    'You knew it was {name}!': '¡Sabías que era {name}!',
    'You picked {name}': 'Elegiste a {name}',
    'It was {name}': 'Fue {name}',
    'That was yours!': '¡Esa era tuya!',
    'You fooled {n} · +{pts}': 'Engañaste a {n} · +{pts}',
    'No tap this time': 'Esta vez no tocaste',
    '{names} and {last}': '{names} y {last}',
    'this question': 'en esta pregunta',
    'all tied': 'todos empatados',
    '#{rank} of {count}': 'n.º {rank} de {count}',
    '{place} · {score} points': '{place} · {score} puntos',
    'One moment…': 'Un momento…',
    "You're in as soon as this one ends": 'Entras en cuanto termine esta partida',
  },
};
