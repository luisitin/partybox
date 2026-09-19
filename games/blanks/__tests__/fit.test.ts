// The fit model (owner, 2026-09-18): what a black card asks for, what a white card serves, and
// how well they read together.
import { describe, expect, it } from 'vitest';
import { fitScore, servesOf, slotOf } from '../server/fit';

describe('slotOf — what the blank wants', () => {
  it('reads a doing off "…do?", "…does ____", "ruined by ____", "ended with ____"', () => {
    for (const text of [
      'What did the sex robot refuse to do?',
      'What did Lincoln do at the theatre before the show?',
      'My sleep paralysis demon does ____.',
      "My grandmother's funeral was ruined by ____.",
      'The honeymoon ended with ____.',
      'The priest lost his faith after ____.',
      "What am I doing to my ex's car?",
      'How did the neighbors find out?',
    ])
      expect(slotOf({ text }), text).toBe('doing');
  });
  it('reads a person off "Who…?", "…goes to ____", "woke up next to ____"', () => {
    for (const text of [
      "Who's in my bed?",
      "The nudist colony's annual award goes to ____.",
      'The morning after, I woke up next to ____.',
      'Squid Game, hosted by ____.',
      'I lost my virginity to ____.',
    ])
      expect(slotOf({ text }), text).toBe('person');
  });
  it('everything else is a thing — "named after ____" and "powered by ____" included', () => {
    for (const text of [
      "What's the new flavor of lube?",
      'The group chat renamed itself after ____.',
      'My vibrator is powered by ____.',
      'The nurse found ____ next to ____.',
      "What's in my nightstand drawer?",
    ])
      expect(slotOf({ text }), text).toBe('thing');
  });
  it("the card's own slot wins", () => {
    expect(slotOf({ text: "What's in my drawer?", slot: 'person' })).toBe('person');
  });
});

describe('servesOf — what the white card is', () => {
  it('a gerund card is a doing', () => {
    expect(servesOf({ text: 'Farting during a prostate exam.' })).toEqual(['doing']);
    expect(servesOf({ text: 'Quietly winning Monopoly.' })).toEqual(['doing']);
  });
  it('a person heads the phrase or owns a who-clause', () => {
    for (const text of [
      'A nun with a strap-on.',
      'A therapist who takes notes with a shudder.',
      'MySpace Tom, who saw everything.',
      'Grandma.',
      'A cop with a podcast.',
    ])
      expect(servesOf({ text }), text).toEqual(['person']);
  });
  it('a possessive or a compound noun is the thing it names, not the person in it', () => {
    for (const text of [
      "Grandpa's flesh-colored dildo.",
      'A clown car full of dildos.',
      'A baby monitor that heard too much.',
      'The Epstein files.',
      'A gallon of cum.',
    ])
      expect(servesOf({ text }), text).toEqual(['thing']);
  });
  it("the card's own serves wins", () => {
    expect(servesOf({ text: 'Beans.', serves: ['person'] })).toEqual(['person']);
  });
});

describe('fitScore', () => {
  it('a natural answer is 1; a thing in a doing blank is a stretch; a person reads as a thing', () => {
    expect(fitScore('doing', ['doing'])).toBe(1);
    expect(fitScore('doing', ['thing'])).toBeLessThan(0.5);
    expect(fitScore('thing', ['person'])).toBeGreaterThan(0.8);
    expect(fitScore('person', ['thing'])).toBe(0.5);
    expect(fitScore('thing', ['doing', 'thing'])).toBe(1);
  });
});
