// The theme sheet's footer on a phone: this phone's own sound and vibration toggles (R-048).
// Turning one on plays/buzzes the `submit` pattern so the player hears or feels what they enabled.
import { useState } from 'react';
import type { JSX } from 'react';
import { buzz, hapticsEnabled, setHapticsEnabled } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import type { SoundEngine } from '../sound';
import pickerStyles from '../ThemePicker.module.css';

const SUBMIT_BUZZ = 20;

export interface PhoneSettingsProps {
  /** The phone's sound engine; absent in /preview (the sound toggle is then disabled). */
  audio?: SoundEngine;
}

export function PhoneSettings({ audio }: PhoneSettingsProps): JSX.Element {
  const [soundOn, setSoundOn] = useState(() => !(audio?.muted() ?? true));
  const [haptics, setHaptics] = useState(() => hapticsEnabled());
  const toggleSound = (): void => {
    if (!audio) return;
    const next = !soundOn;
    audio.setMuted(!next);
    setSoundOn(next);
    if (next) void audio.enable().then((ok) => ok && audio.play('submit'));
  };
  const toggleHaptics = (): void => {
    const next = !haptics;
    setHapticsEnabled(next);
    setHaptics(next);
    if (next) buzz(SUBMIT_BUZZ);
  };
  return (
    <>
      <button
        type="button"
        className={pickerStyles.toggle}
        aria-pressed={soundOn}
        onClick={toggleSound}
        disabled={!audio}
      >
        <span className={pickerStyles.toggleGlyph} aria-hidden>
          {soundOn ? '🔊' : '🔇'}
        </span>
        {t.controller.phoneSound}
        <span className={pickerStyles.toggleState}>
          {soundOn ? t.controller.on : t.controller.off}
        </span>
      </button>
      <button
        type="button"
        className={pickerStyles.toggle}
        aria-pressed={haptics}
        onClick={toggleHaptics}
      >
        <span className={pickerStyles.toggleGlyph} aria-hidden>
          📳
        </span>
        {t.controller.vibration}
        <span className={pickerStyles.toggleState}>
          {haptics ? t.controller.on : t.controller.off}
        </span>
      </button>
    </>
  );
}
