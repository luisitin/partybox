// The theme sheet's footer on a phone: this phone's own sound and vibration toggles (R-048).
// Turning one on plays/buzzes the `submit` pattern so the player hears or feels what they enabled.
import { useState, useSyncExternalStore } from 'react';
import type { JSX } from 'react';
import {
  buzz,
  hapticsEnabled,
  setHapticsEnabled,
  setPadStyle,
  usePadStyle,
} from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import type { SoundEngine } from '../sound';
import { phoneMusicOn, setPhoneMusicOn, subscribePhoneMusic } from '../music';
import pickerStyles from '../ThemePicker.module.css';

const SUBMIT_BUZZ = 20;

export interface PhoneSettingsProps {
  /** The phone's sound engine; absent in /preview (the sound toggle is then disabled). */
  audio?: SoundEngine;
  /** S-004 B: what the music engine is on right now ("Lobby set", "Bingo's set"). */
  what?: string | null;
}

export function PhoneSettings({ audio, what }: PhoneSettingsProps): JSX.Element {
  const [soundOn, setSoundOn] = useState(() => !(audio?.muted() ?? true));
  const [haptics, setHaptics] = useState(() => hapticsEnabled());
  // iOS Safari has no navigator.vibrate at all: say so instead of offering a switch that does
  // nothing (Android Chrome has it, after the page's first tap).
  const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;
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
  // I-021 (the owner): the drawing pad's paper and pencil are this phone's choice — ruled paper
  // and a pencil as picked, plain / pen one tap away; nothing crosses the wire.
  const pad = usePadStyle();
  const musicOn = useSyncExternalStore(subscribePhoneMusic, phoneMusicOn, () => false);
  const musicWhat = what ?? 'the room is quiet';
  return (
    <>
      <button
        type="button"
        className={pickerStyles.toggle}
        aria-pressed={pad.paper === 'ruled'}
        onClick={() => setPadStyle({ paper: pad.paper === 'ruled' ? 'plain' : 'ruled' })}
      >
        <span className={pickerStyles.toggleGlyph} aria-hidden>
          📄
        </span>
        {t.controller.padPaper}
        <span className={pickerStyles.toggleState}>
          {pad.paper === 'ruled' ? t.controller.paperRuled : t.controller.paperPlain}
        </span>
      </button>
      <button
        type="button"
        className={pickerStyles.toggle}
        aria-pressed={pad.pencil === 'pencil'}
        onClick={() => setPadStyle({ pencil: pad.pencil === 'pencil' ? 'pen' : 'pencil' })}
      >
        <span className={pickerStyles.toggleGlyph} aria-hidden>
          ✏️
        </span>
        {t.controller.padPencil}
        <span className={pickerStyles.toggleState}>
          {pad.pencil === 'pencil' ? t.controller.pencilSoft : t.controller.pencilPen}
        </span>
      </button>
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
      {/* S-004 A: music on this phone — the TV's set, here too. */}
      <button
        type="button"
        className={pickerStyles.toggle}
        aria-pressed={musicOn}
        onClick={() => setPhoneMusicOn(!musicOn)}
      >
        <span className={pickerStyles.toggleGlyph} aria-hidden>
          ♪
        </span>
        Music on this phone
        <span className={pickerStyles.toggleState}>{musicOn ? t.controller.on : t.controller.off}</span>
      </button>
      {musicOn ? <p className="pb-caption">♪ {musicWhat}</p> : null}
      {canVibrate ? (
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
      ) : (
        <p className={pickerStyles.toggleNote}>
          <span aria-hidden>📳</span> {t.controller.noVibration}
        </p>
      )}
    </>
  );
}
