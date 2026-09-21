// Topics (loop 469): what a card is about, and the bot's nudge for a pair.
import { describe, expect, it } from 'vitest';
import {
  TAG_HIT,
  TOPIC_HIT,
  WORD_ECHO,
  keywordsOf,
  pairBonus,
  punch,
  tagHit,
  topicsOf,
} from '../server/topics';

describe('topicsOf', () => {
  it('reads topics off the words', () => {
    expect(topicsOf("What's the new flavor of lube?")).toEqual(['sex', 'food']);
    expect(topicsOf('A priest who moonlights as a stripper.')).toEqual(['church', 'sex']);
    expect(topicsOf('Getting stabbed at a Waffle House.')).toEqual(['death', 'venue']);
    expect(topicsOf('Beans.')).toEqual([]);
  });
});

describe('keywordsOf', () => {
  it('drops stop words and trims a plural or possessive', () => {
    expect([...keywordsOf('What did the priest keep under the altar?')]).toEqual([
      'priest',
      'keep',
      'altar',
    ]);
    expect([...keywordsOf("A priest's browser history.")]).toEqual([
      'priest',
      'browser',
      'history',
    ]);
  });
});

describe('pairBonus', () => {
  it("a shared topic in other words is a hit; the prompt's own word coming back is a shrug", () => {
    expect(pairBonus("What's the new flavor of lube?", 'Hot sauce as lube.')).toBe(WORD_ECHO);
    expect(pairBonus("What's the new flavor of lube?", 'Cum in the coffee creamer.')).toBe(
      TOPIC_HIT,
    );
    expect(
      pairBonus('What did the priest keep under the altar?', "A priest's browser history."),
    ).toBe(WORD_ECHO);
    expect(
      pairBonus('What did the priest keep under the altar?', 'A rosary made of anal beads.'),
    ).toBe(TOPIC_HIT);
    expect(
      pairBonus('What did the priest keep under the altar?', 'A DUI on a riding lawnmower.'),
    ).toBe(0);
    // A blank that wants a substance takes food, gross and drug cards.
    expect(pairBonus("Grandma's cookies were laced with ____.", 'Crack for breakfast.')).toBe(
      TOPIC_HIT,
    );
    expect(pairBonus("Grandma's cookies were laced with ____.", 'A hickey from a vacuum.')).toBe(0);
  });

  it("a card's own tags name the prompts it was written for: a whole word, any case, beats a topic", () => {
    expect(tagHit('Who did 9/11?', ['9/11', 'iraq'])).toBe(true);
    expect(tagHit('I wish I could hire ____ as a babysitter.', ['babysitter', 'nanny'])).toBe(true);
    expect(tagHit('The Iraqi restaurant was ____.', ['iraq'])).toBe(false); // "iraqi" is not "iraq"
    expect(tagHit('Who did 9/11?', undefined)).toBe(false);
    expect(pairBonus('Who did 9/11?', 'Bush.', ['9/11'])).toBe(TAG_HIT);
    expect(pairBonus('Who did 9/11?', 'Bush.')).toBe(0);
    expect(TAG_HIT).toBeGreaterThan(TOPIC_HIT);
  });
});

describe('punch', () => {
  it('a twist after a comma and a specific punch harder; a long card reads slower', () => {
    expect(punch('Dick in a box, but the box is a Crock-Pot.')).toBeGreaterThan(punch('A dildo.'));
    expect(punch("Putin's shirtless horse ride, unedited.")).toBeGreaterThan(
      punch('A shirtless horse ride.'),
    );
    expect(
      punch('A marathon runner who did not stop at the finish line or at the river after it.'),
    ).toBeLessThan(0);
  });
});
