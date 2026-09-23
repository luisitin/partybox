// The device's language store and the English-keyed tables (the owner, 2026-09-22: every screen
// translatable to Spanish). Node has no window: detection falls back to English, and the store
// still switches and tells its listeners.
import { describe, expect, it } from 'vitest';
import { fill, getLang, setLang, subscribeLang, translate } from './lang';
import type { Strings } from './lang';

const TABLE: Strings = {
  es: {
    'Waiting for the others…': 'Esperando a los demás…',
    '{name} is presenting': '{name} está presentando',
  },
};

describe('fill', () => {
  it('fills named placeholders and leaves unknown ones visible', () => {
    expect(fill('{a} and {b}', { a: 'Sam', b: 2 })).toBe('Sam and 2');
    expect(fill('{a} and {c}', { a: 'Sam' })).toBe('Sam and {c}');
    expect(fill('no vars')).toBe('no vars');
  });
});

describe('translate', () => {
  it('answers in the table’s language, with placeholders filled', () => {
    expect(translate(TABLE, 'es', 'Waiting for the others…')).toBe('Esperando a los demás…');
    expect(translate(TABLE, 'es', '{name} is presenting', { name: 'Ana' })).toBe(
      'Ana está presentando',
    );
  });
  it('falls back to the English, never to a blank', () => {
    expect(translate(TABLE, 'es', 'Not in the table')).toBe('Not in the table');
    expect(translate(TABLE, 'de', 'Waiting for the others…')).toBe('Waiting for the others…');
    expect(translate(TABLE, 'en', '{name} is presenting', { name: 'Ana' })).toBe(
      'Ana is presenting',
    );
  });
});

describe('the store', () => {
  it('starts in English without a browser, then follows setLang and tells listeners once', () => {
    expect(getLang()).toBe('en');
    let calls = 0;
    const off = subscribeLang(() => calls++);
    setLang('es');
    setLang('es');
    expect(getLang()).toBe('es');
    expect(calls).toBe(1);
    off();
    setLang('en');
    expect(calls).toBe(1);
    expect(getLang()).toBe('en');
  });
});
