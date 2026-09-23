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
  it('shows anything unknown as sent, and English as English', () => {
    expect(serverText('Something new happened.', 'es')).toBe('Something new happened.');
    expect(serverText('This room is full.', 'en')).toBe('This room is full.');
    expect(serverText('Sam is now the VIP', 'de')).toBe('Sam is now the VIP');
  });
});
