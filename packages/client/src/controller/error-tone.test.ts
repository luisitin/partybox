// I-674 B: which refusals are quiet.
import { describe, expect, it } from 'vitest';
import { isQuietError } from './errorTone';

describe('I-674 B: isQuietError', () => {
  it('a refusal that changed nothing is quiet', () => {
    expect(isQuietError('not_vip')).toBe(true);
    expect(isQuietError('not_in_room')).toBe(true);
  });
  it('real trouble stays loud', () => {
    expect(isQuietError('invalid_payload')).toBe(false);
    expect(isQuietError('bad_token')).toBe(false);
    expect(isQuietError(undefined)).toBe(false);
  });
});
