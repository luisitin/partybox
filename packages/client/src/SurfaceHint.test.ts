// I-677: which screen the page is on.
import { describe, expect, it } from 'vitest';
import { looksLikeBigScreen, looksLikePhone } from './SurfaceHint';

describe('I-677: the wrong-screen hint', () => {
  it('a wide screen with a mouse and no touch is a big screen; a laptop with touch is not', () => {
    expect(looksLikeBigScreen(1920, true, 0)).toBe(true);
    expect(looksLikeBigScreen(1280, true, 0)).toBe(true);
    expect(looksLikeBigScreen(1024, true, 0)).toBe(false);
    expect(looksLikeBigScreen(1920, true, 10)).toBe(false);
    expect(looksLikeBigScreen(1920, false, 0)).toBe(false);
  });
  it('a finger and a short side under 800 px is a phone; a tablet is not', () => {
    expect(looksLikePhone(390, 844, true)).toBe(true);
    expect(looksLikePhone(844, 390, true)).toBe(true);
    expect(looksLikePhone(820, 1180, true)).toBe(false);
    expect(looksLikePhone(390, 844, false)).toBe(false);
  });
});
