// The theme sheet's footer on a phone: this phone's own sound and vibration toggles (R-048).
// Turning one on plays/buzzes the `submit` pattern so the player hears or feels what they enabled.
import { Suspense, useState } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import { clientGames } from '../games.generated';

/** The games' display names for the settings headings (the manifest names, by id). */
const GAME_NAMES: Record<string, string> = {
  bingo: 'Bingo',
  blanks: 'Blanks',
  wisecrack: 'Wisecrack',
  'lightning-round': 'Lightning Round',
  'broken-pencil': 'Broken Pencil',
};
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
import pickerStyles from '../ThemePicker.module.css';

const SUBMIT_BUZZ = 20;

export interface PhoneSettingsProps {
  /** The phone's sound engine; absent in /preview (the sound toggle is then disabled). */
  audio?: SoundEngine;
}

export function PhoneSettings({ audio }: PhoneSettingsProps): JSX.Element {
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
      {/* S-003 A: each installed game's own phone settings, under its name. */}
      {Object.entries(clientGames)
        .filter(([, m]) => m.PhoneSettings)
        .map(([id, m]) => {
          const Panel = m.PhoneSettings as LazyExoticComponent<ComponentType>;
          return (
            <section key={id} className={pickerStyles.gameSection}>
              <h4 className={pickerStyles.gameTitle}>{GAME_NAMES[id] ?? id}</h4>
              <Suspense fallback={null}>
                <Panel />
              </Suspense>
            </section>
          );
        })}
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
