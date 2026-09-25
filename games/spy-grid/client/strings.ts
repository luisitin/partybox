// Spy Grid's words in other languages, keyed by the English sentence (ADR-044). Screens write
// `L('…')` from `useT(STRINGS)`; the picker reads the manifest's lines from here too, and the
// server's VIP skip labels translate through it. `{name}` marks a placeholder. Content (the words
// on the board and the clues players type) stays as written.
import type { Strings } from '@partybox/game-sdk/ui';

export const STRINGS: Strings = {
  es: {
    // manifest.json — the game picker
    'One-word clues. Find your agents. Avoid the trap.':
      'Pistas de una palabra. Encuentra a tus agentes. Evita la trampa.',
    "Two teams, one grid of 25 words. Only the spymasters know which words are their agents. Give a one-word clue and a number, point together to flip the cards, and never touch the assassin. With 2–3 players it's a co-op mission.":
      'Dos equipos, una cuadrícula de 25 palabras. Solo los jefes de espías saben cuáles son sus agentes. Da una pista de una palabra y un número, señalen juntos para voltear las cartas y nunca toquen al asesino. Con 2–3 jugadores es una misión cooperativa.',
    Mode: 'Modo',
    'Two teams, or one team on a co-op mission (auto: co-op at 2–3 players)':
      'Dos equipos, o un equipo en misión cooperativa (auto: cooperativo con 2–3 jugadores)',
    Auto: 'Auto',
    Teams: 'Equipos',
    'Co-op': 'Cooperativo',
    'Players pick their team and spymaster, or the game deals them':
      'Los jugadores eligen equipo y jefe de espías, o el juego los reparte',
    'Players choose': 'Eligen los jugadores',
    Random: 'Al azar',
    Rounds: 'Rondas',
    'A new board each round; spymasters rotate':
      'Un tablero nuevo cada ronda; los jefes de espías rotan',
    'Clue time': 'Tiempo para la pista',
    'Seconds the spymaster has to give a clue':
      'Segundos que tiene el jefe de espías para dar una pista',
    'Guess time': 'Tiempo para adivinar',
    'Seconds per guess; the clock restarts after every flip':
      'Segundos por intento; el reloj vuelve a empezar tras cada carta volteada',
    'Turn limit': 'Límite de turnos',
    'Turns per round (both teams); then fewer agents left wins':
      'Turnos por ronda (ambos equipos); después gana quien tenga menos agentes pendientes',
    'Co-op clues': 'Pistas en cooperativo',
    'Clues the co-op team gets to find all nine agents':
      'Pistas que tiene el equipo cooperativo para encontrar a los nueve agentes',
    Assassins: 'Asesinos',
    'A second assassin replaces a bystander': 'Un segundo asesino reemplaza a un transeúnte',
    One: 'Uno',
    Two: 'Dos',
    Reactions: 'Reacciones',
    "👍 👎 🤔 on cards, for teams that can't talk":
      '👍 👎 🤔 en las cartas, para equipos que no pueden hablar',
    'Spicy words': 'Palabras picantes',
    'Mixes in adult words (hangovers, dating, office life) — never explicit':
      'Mezcla palabras para adultos (resacas, citas, vida de oficina), nunca explícitas',
    Reader: 'Lector',
    'The voice that reads each clue aloud': 'La voz que lee cada pista en voz alta',
    'No reader': 'Sin lector',
    'Old British Man': 'Señor británico mayor',
    'Young British Man': 'Joven británico',
    'American Woman': 'Mujer estadounidense',
    'Soft-Spoken Woman': 'Mujer de voz suave',
    Original: 'Original',
    // VIP skip labels (server/views.ts)
    Start: 'Empezar',
    'Skip the clue': 'Saltar la pista',
    'End the turn': 'Terminar el turno',
    'Next round': 'Siguiente ronda',
    'See results': 'Ver resultados',
    // teams
    Sun: 'Sol',
    Moon: 'Luna',
    'Your crew': 'Tu equipo',
    'Pick your team': 'Elige tu equipo',
    'Shuffle 🔀': 'Mezclar 🔀',
    'One spymaster gives the clues; everyone else guesses together.':
      'Un jefe de espías da las pistas; los demás adivinan juntos.',
    "✓ You're in · {n} players": '✓ Estás dentro · {n} jugadores',
    'Join · {n} players': 'Unirse · {n} jugadores',
    "🕶️ I'll be spymaster": '🕶️ Seré jefe de espías',
    'The spymaster sees the key and gives one-word clues.':
      'El jefe de espías ve la clave y da pistas de una palabra.',
    'Spymasters see the key and give one-word clues. Everyone else points.':
      'Los jefes de espías ven la clave y dan pistas de una palabra. Los demás señalan.',
    'The host starts when everyone is ready.': 'El anfitrión empieza cuando todos estén listos.',
    'A co-op mission': 'Una misión cooperativa',
    'How to play': 'Cómo se juega',
    'One spymaster sees which 9 of the 25 words are your agents.':
      'Un jefe de espías ve cuáles 9 de las 25 palabras son sus agentes.',
    'They give one word and a number. Point at the words you think match.':
      'Da una palabra y un número. Señalen las palabras que creen que encajan.',
    'Find all 9 before the clues run out. Touch the assassin and the mission fails.':
      'Encuentren a los 9 antes de que se acaben las pistas. Si tocan al asesino, la misión fracasa.',
    "Two teams, one grid of 25 words. Only each team's spymaster knows which words are their agents.":
      'Dos equipos, una cuadrícula de 25 palabras. Solo el jefe de espías de cada equipo sabe cuáles son sus agentes.',
    'Your spymaster gives a one-word clue and a number, like "Ocean, 3". Point at the words you think match.':
      'Tu jefe de espías da una pista de una palabra y un número, como «Océano, 3». Señala las palabras que creas que encajan.',
    'Find all your agents first. Touch the assassin and your team loses on the spot.':
      'Encuentra primero a todos tus agentes. Si tocan al asesino, tu equipo pierde en el acto.',
    'Spymasters: clues are about meaning, not letters or spots on the grid. No hints, no faces, no pointing.':
      'Jefes de espías: las pistas van por el significado, no por letras ni casillas. Sin insinuar, sin gestos, sin señalar.',
    'Want to be the spymaster? Say so on your phone':
      '¿Quieres ser jefe de espías? Dilo en tu teléfono',
    'Pick a team on your phone': 'Elige un equipo en tu teléfono',
    // the board (TV)
    'The spymaster is thinking…': 'El jefe de espías está pensando…',
    "{shape} {team}'s spymaster is thinking…": 'El jefe de espías de {shape} {team} está pensando…',
    'Find all 9 agents in {n} clues': 'Encuentren a los 9 agentes en {n} pistas',
    '{shape} {team} goes first: 9 agents': '{shape} {team} empieza: 9 agentes',
    '{name} is the new spymaster': '{name} es el nuevo jefe de espías',
    'Guesses left: {n}': 'Intentos restantes: {n}',
    'Clues so far': 'Pistas hasta ahora',
    'Clues left: {n}': 'Pistas restantes: {n}',
    'End turn': 'Terminar turno',
    '{n} found': '{n} encontrados',
    'No clue!': '¡Sin pista!',
    'Out of guesses.': 'Sin más intentos.',
    "Time's up.": 'Se acabó el tiempo.',
    '{shape} {team} found {n}.': '{shape} {team} encontró {n}.',
    "{shape} {team}'s turn": 'Turno de {shape} {team}',
    '{team} found the assassin!': '¡{team} encontró al asesino!',
    'Every agent found!': '¡Todos los agentes encontrados!',
    'Every {team} agent found!': '¡Todos los agentes de {team} encontrados!',
    'Out of turns: level on agents': 'Sin turnos: empate en agentes',
    'Out of turns: {team} had fewer agents left': 'Sin turnos: a {team} le quedaban menos agentes',
    "Nobody's talking!": '¡Nadie habla!',
    'The other team left the game': 'El otro equipo dejó el juego',
    'Out of clues': 'Sin pistas',
    'MISSION COMPLETE!': '¡MISIÓN CUMPLIDA!',
    'MISSION FAILED': 'MISIÓN FALLIDA',
    "IT'S A DRAW": 'EMPATE',
    '{shape} {team} WINS!': '¡GANA {shape} {team}!',
    'Round {n} of {of}': 'Ronda {n} de {of}',
    'Sun agent': 'Agente de Sol',
    'Moon agent': 'Agente de Luna',
    Bystander: 'Transeúnte',
    Assassin: 'Asesino',
    // phone
    '{n} agents left': 'faltan {n} agentes',
    '{n} left': 'faltan {n}',
    'your team': 'tu equipo',
    you: 'tú',
    '{n} clues left': 'quedan {n} pistas',
    '{n} guesses left': 'quedan {n} intentos',
    'A card flips when most of your team points at it.':
      'Una carta se voltea cuando la mayoría de tu equipo la señala.',
    '{shape} {team} is guessing…': '{shape} {team} está adivinando…',
    'Your clue: one word and a number': 'Tu pista: una palabra y un número',
    'Stay silent 🤐': 'Silencio 🤐',
    'The card turns…': 'La carta se voltea…',
    '👀 Watch the TV': '👀 Mira la TV',
    'Next clue…': 'Siguiente pista…',
    'Mission complete! 🕶️': '¡Misión cumplida! 🕶️',
    'Mission failed': 'Misión fallida',
    "It's a draw": 'Empate',
    'Your team wins! 🎉': '¡Gana tu equipo! 🎉',
    '{team} wins': 'Gana {team}',
    '{shape} {team} wins!': '¡Gana {shape} {team}!',
    'Thanks for playing!': '¡Gracias por jugar!',
    'React to {word}': 'Reacciona a {word}',
    'Point at {word}?': '¿Señalar {word}?',
    Cancel: 'Cancelar',
    'Point ☝️': 'Señalar ☝️',
    'You voted to end the turn ✋': 'Votaste por terminar el turno ✋',
    'You point at {word} ☝️': 'Señalas {word} ☝️',
    'Take back': 'Retirar',
    'Tap a card to point at it': 'Toca una carta para señalarla',
    'End turn ✋': 'Terminar turno ✋',
    'Assassin!': '¡Asesino!',
    'Bystander.': 'Transeúnte.',
    'Agent!': '¡Agente!',
    'Enemy agent!': '¡Agente enemigo!',
    Grid: 'Cuadrícula',
    List: 'Lista',
    'Board layout': 'Diseño del tablero',
    // the spymaster
    'Show key 👁': 'Ver la clave 👁',
    'Tilt your phone away from your team.': 'Inclina el teléfono lejos de tu equipo.',
    'Your agents ({n} left)': 'Tus agentes (faltan {n})',
    'Their agents ({n} left)': 'Sus agentes (faltan {n})',
    Bystanders: 'Transeúntes',
    'The key': 'La clave',
    'List view': 'Ver lista',
    'Grid view': 'Ver cuadrícula',
    Hide: 'Ocultar',
    'One word only.': 'Solo una palabra.',
    'Keep it under 20 letters.': 'Que tenga menos de 20 letras.',
    'No numbers in the word. Use the number box.':
      'Sin números en la palabra. Usa la casilla del número.',
    "That's (too close to) a word on the board.":
      'Es (o se parece demasiado a) una palabra del tablero.',
    'One word': 'Palabra',
    'Your clue': 'Tu pista',
    'One fewer': 'Uno menos',
    'One more': 'Uno más',
    "You'll say: {word}, {n}": 'Dirás: {word}, {n}',
    'Clues are about meaning — not letters or spots on the grid.':
      'Las pistas van por el significado, no por letras ni casillas.',
    'Sending…': 'Enviando…',
    'Send clue': 'Enviar pista',
    'The first clue lands here': 'Aquí llega la primera pista',
    'Sun wins! ▲': '¡Gana Sol! ▲',
    'Moon wins! ●': '¡Gana Luna! ●',
    '🕶️ Master Spy': '🕶️ Maestro espía',
    'Best average of own agents found per clue':
      'Mejor promedio de agentes propios encontrados por pista',
    '🔗 Big Link': '🔗 Gran enlace',
    'One clue that found the most agents': 'La pista que encontró más agentes',
    '🎯 Sharp Eye': '🎯 Buen ojo',
    'First to point at the most of their own agents':
      'Primero en señalar la mayoría de sus agentes',
    '💀 Trap Door': '💀 Trampilla',
    'First to point at the assassin': 'Primero en señalar al asesino',
    'End turn opens after the first card': 'Terminar turno se abre tras la primera carta',
    'Teams even out at the start: bots move first.':
      'Los equipos se igualan al empezar: primero se mueven los bots.',
    'The board words are in English.': 'Las palabras del tablero están en inglés.',
    'The crew found {n}.': 'El equipo encontró {n}.',
    'The crew touched the assassin 💀': 'El equipo tocó al asesino 💀',
    'You all play one team. Want to give the clues? Switch on “I’ll be spymaster”.':
      'Todos juegan en un equipo. ¿Quieres dar las pistas? Activa “Seré jefe de espías”.',
    // the coach line and the TV's how-it-works demo (play-test 2026-09-24)
    'New here? Here is how it works': '¿Nuevo? Así se juega',
    'Pick a team. Want to give the clues? Switch on “I’ll be spymaster”.':
      'Elige un equipo. ¿Quieres dar las pistas? Activa “Seré jefe de espías”.',
    Watching: 'Mirando',
    'You join the next game.': 'Entras en la próxima partida.',
    '{team} is playing': 'Juega {team}',
    'Tap Show key and plan your next clue.': 'Toca Ver clave y planea tu próxima pista.',
    'Watch the TV. Your team is next.': 'Mira la tele. Tu equipo va después.',
    '🕶️ You are the spymaster': '🕶️ Eres el jefe de espías',
    'Tap Show key, find your {shape} words, type ONE word that links some of them, pick how many, Send.':
      'Toca Ver clave, busca tus palabras {shape}, escribe UNA palabra que una varias, elige cuántas y Envía.',
    'You are a guesser': 'Eres adivinador',
    'Your spymaster is thinking of a clue — get ready.':
      'Tu jefe de espías piensa una pista: prepárate.',
    'Your team is guessing. No hints, no faces! 🤐': 'Tu equipo adivina. ¡Sin pistas ni caras! 🤐',
    'Your turn to guess': 'Te toca adivinar',
    'Tap a word that fits “{clue}”, then tap Point.':
      'Toca una palabra que encaje con “{clue}” y luego Señalar.',
    'Waiting for most of your team to agree…': 'Esperando a que la mayoría de tu equipo coincida…',
    'Watch the TV.': 'Mira la tele.',
    'Everyone sees 25 words.': 'Todos ven 25 palabras.',
    'Only the spymaster 🕶️ sees whose they are.':
      'Solo el jefe de espías 🕶️ sabe de quién es cada una.',
    'The spymaster gives one word and a number.': 'El jefe de espías da una palabra y un número.',
    'Your team points on their phones — the most-pointed word turns over.':
      'Tu equipo señala en el celular: la palabra más señalada se voltea.',
    'Find all your agents first. Never touch the assassin 💀.':
      'Encuentra primero a todos tus agentes. Nunca toques al asesino 💀.',
    '📱 On your phone: want to give the clues? Tap “I’ll be spymaster”':
      '📱 En tu celular: ¿quieres dar las pistas? Toca “Seré jefe de espías”',
    '📱 On your phone: pick ▲ Sun or ● Moon': '📱 En tu celular: elige ▲ Sol o ● Luna',
  },
};
