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
      'The wedding hashtag is #____.',
      'What does the group chat call me?',
      `My résumé's "special skills" section says ____.`,
      'Neverland Ranch had a ride called ____.',
      "What's Trump's safe word?",
      'What did the parrot repeat at Thanksgiving?',
      'The new theme park ride is called "The ____."',
      "My parents' Wi-Fi password is ____.",
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
      "What's the one thing the babysitter won't do again?",
      'The bedtime story ends with ____.',
      'The field trip was cut short by ____.',
      "The time traveler's first mistake was ____.",
      'The baby was conceived during ____.',
      'What did the kids walk in on?',
      'What did the hotel maid walk in on?',
      `The yearbook's "Most Likely To" was ____.`,
      "What's my signature move in bed?",
      "My public defender's strategy was ____.",
      "What's the one thing I'll never live down?",
      'The Olympics added a new event: ____.',
      'The eleventh commandment: thou shalt not ____.',
      'What did Mark Zuckerberg practise in the mirror?',
      "The company retreat's trust exercise turned into ____.",
      'My alibi is ____.',
      'The Ring doorbell caught the neighbor ____.',
      'Pompeii froze one man in the middle of ____.',
      'The gym class substitute made us do ____.',
      'The best way to annoy a sibling: ____.',
      'The referee threw a flag for ____.',
      "What's the wildest thing you've done on the clock?",
      "What's Obama doing with all his free time?",
      "What's the gross thing the roommate does?",
      "What's the drummer's real talent?",
      "What's the frat's punishment for losing?",
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
      "Disney's next princess is ____.",
      'My son wants to be ____ when he grows up.',
      'The dating app matched me with ____.',
      "The senator's mistress was actually ____.",
      'The talent show was won by ____.',
      'The next Star Wars spin-off follows ____.',
      "My kid's imaginary friend is ____.",
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
      'A wine mom with a tumbler that says "mama needs."',
      'A crossing guard who flashed the school bus.',
    ])
      expect(servesOf({ text }), text).toEqual(['person']);
    // A who-clause deep in the card is not about its head.
    expect(servesOf({ text: "A funeral for someone who's at the funeral." })).toEqual([
      'thing',
      'doing',
    ]);
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
    expect(servesOf({ text: 'A bachelor party at Chuck E. Cheese.' })).toEqual(['thing', 'doing']);
    expect(servesOf({ text: 'A trust fall off the roof.' })).toEqual(['thing', 'doing']);
    // The event word must head the phrase: a sex toy is a toy, anal beads are beads.
    expect(servesOf({ text: 'A sex toy that pairs with your car.' })).toEqual(['thing']);
    expect(servesOf({ text: 'Anal beads in the Christmas tree.' })).toEqual(['thing']);
    expect(servesOf({ text: 'Sex on a waterbed in 1987.' })).toEqual(['thing', 'doing']);
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
    expect(fitScore('name', ['thing'])).toBe(0.5);
    // With the text, a name blank grades by length: a slogan takes six words, a wall is a wall.
    expect(fitScore('name', ['thing'], 'Lost luggage that went to Cleveland.')).toBe(0.8);
    expect(fitScore('name', ['thing', 'name'], 'Smegma.')).toBe(1);
    // A blank that wants a word — a safe word, a handle — wants one or two.
    expect(
      fitScore('name', ['thing', 'name'], 'A jury of my exes.', 'My safe word is "____."'),
    ).toBe(0.3);
    expect(fitScore('name', ['thing', 'name'], 'Smegma.', 'My safe word is "____."')).toBe(1);
    expect(
      fitScore('name', ['thing', 'name'], 'A jury of my exes.', 'The rejected slogan was "____."'),
    ).toBe(0.8);
    expect(
      fitScore('name', ['person'], 'A marathon runner who mentions it at every dinner party.'),
    ).toBe(0.45);
    expect(fitScore('name', ['person'])).toBe(0.5);
    expect(fitScore('thing', ['thing', 'name'])).toBe(1);
    expect(fitScore('thing', ['doing', 'name'])).toBe(0.7);
    // A "full of ____" blank wants a plural or a mass noun: one thing with its article reads a beat off.
    const garage = "My uncle's garage is full of ____.";
    expect(fitScore('thing', ['thing'], 'A crop circle shaped like a bagel.', garage)).toBe(0.85);
    expect(fitScore('thing', ['thing'], 'Cum-stained love letters.', garage)).toBe(1);
    expect(fitScore('thing', ['thing'], 'The wet spot.', garage)).toBe(1);
    expect(
      fitScore('thing', ['thing'], 'A crop circle shaped like a bagel.', 'The HOA banned ____.'),
    ).toBe(1);
  });
});
