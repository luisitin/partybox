// The phone's music switch and volume (the owner, 2026-09-23: "the music off button on phone does
// not actually turn music off … maybe we also need a music volume"). Pure parts only.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { phoneMusicVolume, phoneMusicWanted, setPhoneMusicVolume } from './phone-music';

describe('phoneMusicWanted', () => {
  it("follows the room until the phone chooses: phone only and the VIP's switch turn it on", () => {
    expect(phoneMusicWanted(null, { phoneOnly: true })).toBe(true);
    expect(phoneMusicWanted(null, { musicOnPhones: true })).toBe(true);
    expect(phoneMusicWanted(null, {})).toBe(false);
    expect(phoneMusicWanted(null, null)).toBe(false);
  });
  it("the phone's own Off wins over the room — the bug: Off did nothing in a phone-only room", () => {
    expect(phoneMusicWanted('off', { phoneOnly: true, musicOnPhones: true })).toBe(false);
    expect(phoneMusicWanted('on', {})).toBe(true);
  });
});

describe('phoneMusicVolume', () => {
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  });
  afterEach(() => store.clear());

  it('defaults to 70 % and keeps what the slider set, clamped', () => {
    expect(phoneMusicVolume()).toBe(70);
    setPhoneMusicVolume(25);
    expect(phoneMusicVolume()).toBe(25);
    store.set('partybox:phone-music-volume', '140');
    expect(phoneMusicVolume()).toBe(100);
  });
  it('reads the old three-step level once: soft 35, loud 100', () => {
    store.set('partybox:phone-music-level', 'soft');
    expect(phoneMusicVolume()).toBe(35);
    store.set('partybox:phone-music-level', 'loud');
    expect(phoneMusicVolume()).toBe(100);
  });
});
