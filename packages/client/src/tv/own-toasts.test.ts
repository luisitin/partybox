// The TV's own toasts are kept in English and worded when shown (the owner, 2026-09-22: every
// screen translatable to Spanish): English reads exactly as before, Spanish follows a switch.
import { afterEach, describe, expect, it } from 'vitest';
import { setLang, translate } from '@partybox/game-sdk/ui';
import type { Lang, Translator } from '@partybox/game-sdk/ui';
import { ownToast, roomFullToast, seatOpenedToast, soundToast } from './own-toasts';
import { STRINGS } from './strings';

const tr = (lang: Lang): Translator =>
  Object.assign(
    (en: string, vars?: Readonly<Record<string, string | number>>) =>
      translate(STRINGS, lang, en, vars),
    { sent: (text: string) => text, lang },
  );

afterEach(() => setLang('en'));

describe('the TV’s own toasts', () => {
  it('keep the English they always showed', () => {
    expect(roomFullToast(8, 8)).toBe('Room full — 8 / 8');
    expect(seatOpenedToast(7, 8)).toBe('A seat opened — 7 / 8');
    expect(soundToast(true)).toBe('Sound off');
    expect(soundToast(false)).toBe('Sound on');
    expect(ownToast(tr('en'), roomFullToast(8, 8))).toBe('Room full — 8 / 8');
    expect(ownToast(tr('en'), seatOpenedToast(7, 8))).toBe('A seat opened — 7 / 8');
  });

  it('are worded in the TV’s language when shown', () => {
    setLang('es');
    expect(ownToast(tr('es'), roomFullToast(8, 8))).toBe('Sala llena: 8 / 8');
    expect(ownToast(tr('es'), seatOpenedToast(7, 8))).toBe('Se liberó un lugar: 7 / 8');
    expect(ownToast(tr('es'), soundToast(true))).toBe('Sonido apagado');
    expect(ownToast(tr('es'), soundToast(false))).toBe('Sonido activado');
  });

  it('leave the server’s toasts to serverText', () => {
    expect(ownToast(tr('es'), 'Sam left')).toBeNull();
    expect(ownToast(tr('es'), 'Sam and Priya left')).toBeNull();
  });
});
