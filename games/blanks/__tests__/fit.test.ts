// The fit model (owner, 2026-09-18): what a black card asks for, what a white card serves, and
// how well they read together.
import { describe, expect, it } from 'vitest';
import { fitScore, servesOf, slotOf } from '../server/fit';

describe('slotOf — what the blank wants', () => {
  it('reads a name off a quoted blank, "…called?", "What did X say", a nickname', () => {
    for (const text of [
      'The porn parody of my life is called "____."',
      `What's the porn parody of "Frozen" called?`,
      'What did the drunk best man say in his toast?',
      "What's my drag name?",
      "What's the worst thing to whisper during sex?",
      `Grandpa's new nickname at the retirement home: "____."`,
    ])
      expect(slotOf({ text }), text).toBe('name');
  });
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
      "What got me banned from the swingers' club?",
      "What does my cat do while I'm at work?",
      'The moonwalk was actually Michael Jackson ____.',
      "What's the secret to a happy marriage?",
      'The livestream ended abruptly with ____.',
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
    expect(servesOf({ text: 'Quietly winning Monopoly.' })).toEqual(['doing', 'name']);
  });
  it('a person heads the phrase or owns a who-clause', () => {
    for (const text of [
      'A nun with a strap-on.',
      'A therapist who takes notes with a shudder.',
      'MySpace Tom, who saw everything.',
      'A cop with a podcast.',
    ])
      expect(servesOf({ text }), text).toEqual(['person']);
    expect(servesOf({ text: 'Grandma.' })).toEqual(['person', 'name']);
  });
  it('a possessive or a compound noun is the thing it names, not the person in it', () => {
    for (const text of [
      "Grandpa's flesh-colored dildo, still warm.",
      'A clown car full of dildos.',
      'A baby monitor that heard too much.',
    ])
      expect(servesOf({ text }), text).toEqual(['thing']);
  });
  it('an event named as a noun is a thing that also reads as a doing', () => {
    expect(servesOf({ text: 'A threesome with a mime.' })).toEqual(['thing', 'doing']);
    expect(servesOf({ text: 'Anal in a canoe.' })).toEqual(['thing', 'doing', 'name']);
    expect(fitScore('doing', servesOf({ text: 'A threesome with a mime.' }))).toBe(1);
  });
  it('a short card is also a name (four words or fewer)', () => {
    expect(servesOf({ text: 'The Epstein files.' })).toEqual(['thing', 'name']);
    expect(servesOf({ text: 'A gallon of cum.' })).toEqual(['thing', 'name']);
    expect(servesOf({ text: 'A gallon of cum on the good towels.' })).toEqual(['thing']);
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
    expect(fitScore('name', ['thing', 'name'])).toBe(1);
    expect(fitScore('name', ['thing'])).toBeLessThan(0.6);
    expect(fitScore('thing', ['thing', 'name'])).toBe(1);
    expect(fitScore('thing', ['doing', 'name'])).toBe(0.7);
  });
});
