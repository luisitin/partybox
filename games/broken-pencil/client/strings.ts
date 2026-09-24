// Broken Pencil's words in other languages, keyed by the English sentence (the owner, 2026-09-22: every
// screen translatable to Spanish). Screens read them through `useT(STRINGS)` as `L('…')`; the
// shell's game picker reads the manifest's tagline, description and setting labels from here too.
// `{name}` marks a placeholder. Content (cards, prompts, questions) stays in the deck's language.
// Vocabulary: a "book" is un libro, a "guess" (the noun) una respuesta, a "page" una página.
import type { Strings } from '@partybox/game-sdk/ui';

export const STRINGS: Strings = {
  es: {
    // The game picker (manifest.json).
    'Draw it. Guess it. Watch it fall apart.': 'Dibújalo. Adivínalo. Mira cómo se desmorona.',
    'Telephone with a pencil. Pick a secret word, draw it on your phone, pass the book on: the next player guesses, the one after draws that guess, and so on around the circle. Then the TV turns the pages of every book one at a time while the VIP holds the Next button. No points — the show is the game.':
      'El juego del teléfono, con lápiz. Elige una palabra secreta, dibújala en tu teléfono y pasa el libro: el siguiente jugador adivina, el que sigue dibuja esa respuesta, y así por todo el círculo. Luego la TV pasa las páginas de cada libro, una a una, mientras el VIP controla el botón Siguiente. Sin puntos: el show es el juego.',
    'Players per book': 'Jugadores por libro',
    'How many other players touch each book (everyone in the room by default).':
      'Cuántos otros jugadores tocan cada libro (por defecto, todos los de la sala).',
    'Drawing time': 'Tiempo para dibujar',
    'Seconds per drawing': 'Segundos por dibujo',
    'Guessing time': 'Tiempo para adivinar',
    'Seconds per guess': 'Segundos por respuesta',
    'Custom words': 'Palabras propias',
    'Let players type their own secret word':
      'Cada jugador puede escribir su propia palabra secreta',
    'Spicy words': 'Palabras picantes',
    'Adds explicit adult words to the offers (18+, as wild as the Blanks WILD deck)':
      'Añade palabras explícitas para adultos a las opciones (18+, tan salvajes como el mazo WILD de Blanks)',

    // Phone: picking the secret word.
    'Everyone else ({others}) will touch your book before it comes home.':
      'Tu libro pasará por las manos de todos los demás ({others}) antes de volver a ti.',
    '{passes} of your {others} friends will touch your book.':
      'Tu libro pasará por las manos de {passes} de tus {others} amigos.',
    'Pick something drawable.': 'Elige algo que se pueda dibujar.',
    // I-507 A
    'It passes to 1 player, who only guesses.': 'Pasa a 1 jugador, que solo adivina.',
    'It passes to {n} players in turn; the last of them only guesses.':
      'Pasa a {n} jugadores por turnos; el último solo adivina.',
    // I-507 B
    '{n} pages': '{n} páginas',
    'Locked in': '¡Elegida!',
    'Drawing starts when everyone has picked.': 'Se empieza a dibujar cuando todos hayan elegido.',
    'Pick your secret word': 'Elige tu palabra secreta',
    '…or write your own': '…o escribe la tuya',
    'your own word': 'tu propia palabra',
    'Use mine': 'Usar la mía',
    easy: 'fácil',
    medium: 'medio',
    hard: 'difícil',

    // Phone: drawing and guessing.
    "{name}'s book · round {step} of {count}": 'Libro de {name} · ronda {step} de {count}',
    // No owner name: its own sentence, so the Spanish reads "de alguien", not "de Alguien".
    "Someone's book · round {step} of {count}": 'Libro de alguien · ronda {step} de {count}',
    'Sent!': '¡Enviado!',
    'You guessed': 'Escribiste',
    'your drawing': 'tu dibujo',
    '{name} gets this next. Good luck, {name}.': 'Ahora le toca a {name}. ¡Suerte, {name}!',
    'That was the last page of this book.': 'Esa fue la última página de este libro.',
    'Send an empty sheet': 'Enviar hoja en blanco',
    'Done drawing': 'Dibujo listo',
    // I-794 H: one bold line over the sheet (the word follows, in the accent), and whose book
    // rides in the timer bar ("Max's book · 1/6").
    'Draw:': 'Dibuja:',
    'Draw your guess:': 'Dibuja tu respuesta:',
    "Someone's book": 'El libro de alguien', // "{name}'s book" is the TV's (below)
    'the drawing to guess': 'el dibujo por adivinar',
    'Last guess — what is this?': 'Última respuesta: ¿qué es esto?',
    'What is this? (you draw it next)': '¿Qué es esto? (luego lo dibujas tú)',
    'Your best guess…': 'Tu mejor respuesta…',
    'Send guess': 'Responder',
    'Guess, then draw it': 'Responde y dibújalo',
    "You're watching this one": 'Esta vez solo miras',
    'You get a book next game.': 'Tendrás un libro en el próximo juego.',

    // The draw pad.
    pen: 'lápiz',
    ink: 'tinta',
    red: 'rojo',
    blue: 'azul',
    green: 'verde',
    yellow: 'amarillo',
    orange: 'naranja',
    purple: 'morado',
    brown: 'marrón',
    thin: 'fino',
    thick: 'grueso',
    'drawing sheet': 'hoja de dibujo',
    'ink {pct} percent left': 'queda {pct} por ciento de tinta',
    // The label wraps inside the narrow ink column: short words keep it from breaking mid-word.
    'Out of ink — undo to get some back': 'Sin tinta: deshaz un trazo',
    'Too many strokes': 'Sin más trazos',
    // No ↶ in Spanish: "Deshacer" is wider, and the pad's bottom row must fit a 360 px phone.
    '↶ Undo': 'Deshacer',
    Clear: 'Borrar',
    'an empty sheet': 'una hoja en blanco',
    'a drawing': 'un dibujo',
    '(nothing was drawn)': '(no se dibujó nada)',

    // The show, on the phone.
    'Next page ▸': 'Pasar página ▸',
    'Finish ▸': 'Terminar ▸',
    'Next book ▸': 'Próximo libro ▸',
    'The show is next…': 'Ahora viene el show…',
    'Watch the TV': 'Mira la TV',
    'page {page} of {pages}': 'página {page} de {pages}',
    'close enough ✓ — count it': 'casi igual ✓ — que cuente',
    '{name} is presenting': '{name} está presentando',
    "{name}'s book · page {page} of {pages}": 'Libro de {name} · página {page} de {pages}',
    "{name}'s book · page {page} of {pages}. Your turn comes when your book is up.":
      'Libro de {name} · página {page} de {pages}. Te tocará cuando salga tu libro.',
    'Your book is up': '¡Sale tu libro!',
    'Your book is on the TV': 'Tu libro está en la TV',
    'your word': 'tu palabra',
    'a guess': 'una respuesta',
    'Read it out, let everyone look, then turn the page.':
      'Léelo en voz alta, deja que todos miren y pasa la página.',
    'It turns by itself if you take too long.': 'Se pasa sola si tardas demasiado.',
    'The TV turns it for you if you take too long.': 'La TV la pasa por ti si tardas demasiado.',

    // A page, on the TV or a phone.
    "{name}'s secret word": 'Palabra secreta de {name}',
    '{name} drew': '{name} dibujó',
    "{name}'s drawing": 'Dibujo de {name}',
    '{name} guessed': '{name} respondió',

    // TV: the pick screen and the waiting stage.
    'Pick a secret word on your phone.': 'Elige una palabra secreta en tu teléfono.',
    'Everyone draws their word.': 'Todos dibujan su palabra.',
    'Your drawing goes to the next player: they guess it, then draw their guess.':
      'Tu dibujo pasa al siguiente jugador: lo adivina y luego dibuja su respuesta.',
    'That goes on round the circle; the last player only guesses.':
      'Así sigue por todo el círculo; el último jugador solo adivina.',
    'Then everyone presents their own book on the TV, page by page.':
      'Luego cada uno presenta su libro en la TV, página a página.',
    '1 of {total} picked': '1 de {total} ya eligió',
    '{picked} of {total} picked': '{picked} de {total} ya eligieron',
    'Everyone is drawing their word…': 'Todos dibujan su palabra…',
    'Guess the drawing, then draw your guess…': 'Adivina el dibujo y luego dibuja tu respuesta…',
    'Last guesses…': 'Últimas respuestas…',
    'round {step} of {count}': 'ronda {step} de {count}',
    'books pass this way →': 'los libros van por aquí →',
    'who is done': 'quién terminó',
    done: 'terminado',
    drawing: 'dibujando',
    guessing: 'adivinando',
    'of {total} done': 'de {total} listos',
    'Draw big — every picture goes on the TV at the end.':
      'Dibuja en grande: al final cada dibujo sale en la TV.',
    'No letters, no numbers: the pencil has to do the talking.':
      'Sin letras ni números: el lápiz tiene que hablar por ti.',
    'Done early? Tap Done and watch the tiles fill in.':
      '¿Terminaste antes? Toca “Dibujo listo” y mira cómo se llenan las fichas.',
    'Guess first, then draw your guess for the next player.':
      'Primero adivina y luego dibuja tu respuesta para el siguiente.',
    'Wrong guesses are the fun part — the chain shows every step.':
      'Fallar es lo divertido: la cadena muestra cada paso.',
    'Stuck? A rough sketch beats a blank page.':
      '¿Sin ideas? Un boceto rápido es mejor que una hoja en blanco.',
    'One word, best guess — then the reveal.':
      'Una palabra, tu mejor respuesta, y luego se revela todo.',
    'The whole chain shows on the TV next.': 'Después, la cadena entera sale en la TV.',

    // TV: the show.
    "{name}'s book": 'El libro de {name}',
    '{name} turns the pages · book {book} of {books} · page {page} of {pages}':
      '{name} pasa las páginas · libro {book} de {books} · página {page} de {pages}',
    'pages so far': 'páginas hasta ahora',
    '1 earlier page…': '1 página anterior…',
    '{n} earlier pages…': '{n} páginas anteriores…',
    word: 'palabra',
    // The verdict on a book's last page: the server picks it (content/lines.json, or the VIP's
    // "close enough") and the TV shows it through `L.sent`.
    'UNBROKEN! The word survived.': '¡INTACTO! La palabra sobrevivió.',
    'It made it! Give yourselves a hand.': '¡Llegó entero! Un aplauso para todos.',
    'Telephone: 0. This crew: 1.': 'Teléfono: 0. Este equipo: 1.',
    'CHAIN BROKEN': 'CADENA ROTA',
    'Somewhere, this went sideways.': 'En algún punto, esto se torció.',
    'Not even close. Perfect.': 'Ni de cerca. Perfecto.',
    'Close enough — the VIP allows it.': 'Casi igual: el VIP lo acepta.',

    // The end: the summary (TV + phone) and the award the server hands out.
    '1 of {total} books survived': '1 de {total} libros sobrevivió',
    '{n} of {total} books survived': '{n} de {total} libros sobrevivieron',
    '1 of {total} books survived.': '1 de {total} libros sobrevivió.',
    '{n} of {total} books survived.': '{n} de {total} libros sobrevivieron.',
    'every book, first word → last guess': 'cada libro: primera palabra → última respuesta',
    '✓ unbroken': '✓ intacto',
    '✕ broken': '✕ roto',
    'Your book survived!': '¡Tu libro sobrevivió!',
    'Your book broke': 'Tu libro se rompió',
    'That was Broken Pencil': 'Eso fue Broken Pencil',
    'close enough ✓': 'casi igual ✓',
    Unbroken: 'Intacto',
    '“{word}” survived {n} players': '“{word}” sobrevivió a {n} jugadores',
  },
};
