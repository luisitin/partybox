// The server speaks English; a Spanish phone shows its toasts and errors in Spanish, names intact,
// and anything unknown as sent (the owner, 2026-09-22).
import { describe, expect, it } from 'vitest';
import { serverText } from './server-text';

describe('serverText', () => {
  it('translates exact sentences', () => {
    expect(serverText('This room is full.', 'es')).toBe('Esta sala está llena.');
    expect(serverText('No room with that code.', 'es')).toBe('No hay ninguna sala con ese código.');
  });
  it('keeps the names in the sentences that carry one', () => {
    expect(serverText('Sam is now the VIP', 'es')).toBe('Sam ahora es el VIP');
    expect(serverText('Ana María joined (next game)', 'es')).toBe(
      'Ana María entró (para el próximo juego)',
    );
    expect(serverText('Ana joined', 'es')).toBe('Ana entró');
    expect(serverText('👋 Sam says: hurry up, Ana!', 'es')).toBe('👋 Sam dice: ¡date prisa, Ana!');
  });
  it('translates the Start button reasons, game name and counts intact', () => {
    expect(serverText('A game is already running.', 'es')).toBe('Ya hay un juego en marcha.');
    expect(serverText('Blanks needs at least 3 players (2 here).', 'es')).toBe(
      'Blanks necesita al menos 3 jugadores (hay 2).',
    );
    expect(serverText('Lightning Round takes at most 8 players (9 here).', 'es')).toBe(
      'Lightning Round admite como máximo 8 jugadores (hay 9).',
    );
    expect(
      serverText(
        'Broken Pencil has no bot support — remove the 2 bots or pick a game that welcomes bots.',
        'es',
      ),
    ).toBe('Broken Pencil no admite bots: quita los 2 bots o elige un juego que los acepte.');
    expect(
      serverText(
        'Wisecrack has no bot support — remove the bot or pick a game that welcomes bots.',
        'es',
      ),
    ).toBe('Wisecrack no admite bots: quita el bot o elige un juego que los acepte.');
  });
  it('translates the bot, kick and socket rejections', () => {
    expect(serverText('You can add at most 4 bots.', 'es')).toBe(
      'Puedes añadir como máximo 4 bots.',
    );
    expect(serverText('Sam was kicked', 'es')).toBe('Expulsaron a Sam');
    expect(serverText("Only the bot's owner or the VIP can remove it.", 'es')).toBe(
      'Solo quien lo añadió o el VIP pueden quitar ese bot.',
    );
    expect(serverText('Bad input payload.', 'es')).toBe('No se pudo procesar esa jugada.');
  });
  it('shows anything unknown as sent, and English as English', () => {
    expect(serverText('Something new happened.', 'es')).toBe('Something new happened.');
    expect(serverText('This room is full.', 'en')).toBe('This room is full.');
    expect(serverText('Sam is now the VIP', 'de')).toBe('Sam is now the VIP');
  });
});
