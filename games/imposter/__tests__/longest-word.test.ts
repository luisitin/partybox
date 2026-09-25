// The phone's revealed word sizes itself by its longest word (review [238bea]: 'SPAGHET / TI').
import { describe, expect, it } from 'vitest';
import { longestWord } from '../client/helpers';

describe('longestWord', () => {
  it('counts the longest word, not the whole text', () => {
    expect(longestWord('procrastination')).toBe(15);
    expect(longestWord('ice  cream truck')).toBe(5);
    expect(longestWord('')).toBe(1);
  });
});
