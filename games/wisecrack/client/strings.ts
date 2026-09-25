// Wisecrack's words in other languages, keyed by the English sentence (the owner, 2026-09-22: every
// screen translatable to Spanish). Screens read them through `useT(STRINGS)` as `L('…')`; the
// manifest's own sentences (the picker, About, the settings form) live in manifest.es.json (ADR-049).
// `{name}` marks a placeholder. Content (cards, prompts, questions) stays in the deck's language.
// "Prompt" is "pregunta" throughout (short, and what a party player expects), "sweep" is "unánime".
import type { Strings } from '@partybox/game-sdk/ui';

export const STRINGS: Strings = {
  es: {
    // Written by the server (scoring.ts awardsFor): the results screens show them as sent. First in
    // the table so no looser `{placeholder}` sentence below claims them.
    'Crowd favourite': 'Favorito del público',
    'Most votes received: {n}': 'Más votos recibidos: {n}',
    'Sweep master': 'As de la unanimidad',
    'Unanimous wins: {n}': 'Victorias unánimes: {n}',
    'Speed writer': 'Pluma veloz',
    'Answers in before half time: {n}': 'Respuestas antes de la mitad del tiempo: {n}',

    // Shared by phone and TV.
    'Round {round} of {rounds}': 'Ronda {round} de {rounds}',
    'Round {round} · Prompt {n} of {total}': 'Ronda {round} · Pregunta {n} de {total}',
    'double points': 'puntos dobles',
    'Look at the TV': 'Mira la TV',
    '(no answer)': '(sin respuesta)',
    '1 vote': '1 voto',
    '{n} votes': '{n} votos',
    vote: 'voto',
    votes: 'votos',
    Sweep: 'Unánime',
    Tie: 'Empate',
    '{n} points': '{n} puntos',

    // Phone: intro and scores (Controller.tsx).
    'Final round: every vote is worth double!': '¡Ronda final: cada voto vale el doble!',
    'Get ready to write…': 'Prepárate para escribir…',
    'One moment…': 'Un momento…',
    'all tied': 'todos empatados',
    '#{rank} of {count}': '{rank}.º de {count}',
    'Final: {place} · {score} points': 'Final: {place} · {score} puntos',
    '{place} · {score} points': '{place} · {score} puntos',
    'No points this game': 'Sin puntos en este juego',
    'No points in the final round': 'Sin puntos en la ronda final',
    'No points this round': 'Sin puntos en esta ronda',
    '+{n} points in the final round': '+{n} puntos en la ronda final',
    '+{n} points this round': '+{n} puntos en esta ronda',

    // Phone: writing (ControllerAnswer.tsx).
    'Round {round} · Prompt {n} of {total} · ✓ 1 sent':
      'Ronda {round} · Pregunta {n} de {total} · ✓ 1 enviada',
    'Round {round} · Prompt {n} of {total} · ✓ {done} sent':
      'Ronda {round} · Pregunta {n} de {total} · ✓ {done} enviadas',
    'One more…': 'Una más…',
    'Both answers in!': '¡Respuestas enviadas!',
    'Nothing to write this round': 'Nada que escribir en esta ronda',
    'Waiting for the others… then the vote.': 'Esperando a los demás… luego se vota.',
    'Waiting for the others… the voting starts on the TV.':
      'Esperando a los demás… la votación empieza en la TV.',
    'Your funniest answer…': 'Tu respuesta más graciosa…',
    'Submit {n} of {total}': 'Enviar {n} de {total}',
    Submit: 'Enviar',

    // Phone: voting and the reveal (ControllerVote.tsx, PhoneReveal.tsx).
    'Voting…': 'Votando…',
    'Your answer is up': 'Tu respuesta, en juego',
    'Your answer is on the TV': 'Tu respuesta está en la TV',
    "Don't say which one — the others are voting…": 'No digas cuál es: los demás están votando…',
    against: 'contra',
    'Round {round} · vote': 'Ronda {round} · votación',
    'You picked {letter}': 'Elegiste la {letter}',
    'Authors revealed!': '¡Autores revelados!',
    'Who wrote it…': '¿Quién la escribió…?',
    'See who wrote it on the TV': 'Mira en la TV quién la escribió',
    'The votes are in…': 'Ya están los votos…',
    'Wins by default': 'Gana sin rival',
    'No answer sent': 'No respondiste',
    'No votes this time': 'Sin votos esta vez',
    'The other answer was blank.': 'La otra respuesta quedó en blanco.',
    'The other answer wins by default.': 'La otra respuesta gana sin rival.',
    'Nice one.': '¡Bien hecho!',
    'That was the last one — scores are next.': 'Era la última: ahora, el marcador.',
    'Better luck on the next prompt.': 'Más suerte en la próxima pregunta.',
    'the reveal': 'el resultado',
    '(you)': '(tú)',
    'by default': 'sin rival',
    // The reveal in miniature on a TV room's phone (RevealMirror.tsx, I-796 K).
    'On the TV now · prompt {n} of {count}': 'Ahora en la TV · pregunta {n} de {count}',
    yours: 'la tuya',
    'your pick': 'tu voto',
    'Your answer is in this one': 'Esta tiene tu respuesta',
    "You weren't in this one": 'No participabas en esta',
    'scores are next.': 'ahora, el marcador.',
    '1 more to go.': 'queda 1 más.',
    '{n} more to go.': 'quedan {n} más.',

    // TV: the round card and the writing progress (TvRound.tsx).
    'Final round — double points!': '¡Ronda final: puntos dobles!',
    'Two prompts each. Make them laugh.': 'Dos preguntas cada uno. ¡Hazlos reír!',
    "Everyone's in!": '¡Todos listos!',
    'Just waiting for {name}…': 'Solo falta {name}…',
    'Waiting for {names} and {last}…': 'Faltan {names} y {last}…',
    'Waiting for {names} and {n} more…': 'Faltan {names} y {n} más…',
    'Last chance!': '¡Última oportunidad!',
    'Write your answers!': '¡A escribir!',
    'cozy round, just the three of you': 'ronda íntima, solo entre tres',
    '{n} / {total} answers in': '{n} / {total} respuestas',
    'Two prompts are waiting on your phone.': 'Tienes dos preguntas en tu teléfono.',

    // TV: voting, the reveal and the scores (TvVote.tsx, TvReveal.tsx, TvScores.tsx).
    'Vote on your phone · 0 / {total}': 'Vota en tu teléfono · 0 / {total}',
    'Just waiting for {who}…': 'Solo falta {who}…',
    '{n} / {total} voted': '{n} / {total} votaron',
    '{n} / {total} voted · waiting for {who}': '{n} / {total} votaron · faltan {who}',
    'answer {letter}': 'respuesta {letter}',
    'voted for this: {names}': 'votaron por esta: {names}',
    'wins by default': 'gana sin rival',
    'Nobody answered — no votes this round': 'Nadie respondió: no hay votos en esta ronda',
    'Final round played': 'Ronda final terminada',
    'After round {round} of {rounds}': 'Tras la ronda {round} de {rounds}',
    'Final scores': 'Marcador final',
    'Scores so far': 'Marcador parcial',
    'Next: the final round — double points!': 'Viene la ronda final: ¡puntos dobles!',
    "It's a tie": 'Hay empate',
    'And the winner is': 'Y el ganador es',
    // Pacing rule (2026-09-25): the board between rounds waits for the VIP's Next.
    'Next round': 'Próxima ronda',
    'Moving on…': 'Avanzando…',
    "Next on the VIP's phone": 'El VIP toca Siguiente',
    "Next on {name}'s phone": '{name} toca Siguiente',
  },
};
