// The theme sheet's footer on a phone: this phone's own sound and vibration toggles (R-048).
// Turning one on plays/buzzes the `submit` pattern so the player hears or feels what they enabled.
import { Suspense, useEffect, useState, useSyncExternalStore } from 'react';
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
import {
  phoneMusicOn,
  setPhoneMusicOn,
  subscribePhoneMusic,
  phoneMusicLevel,
  setPhoneMusicLevel,
} from '../music';
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
  // I-062 C: the bars answer real cues — polled off the engine's lastPlayedAt (no engine events).
  const [kick, setKick] = useState(0);
  useEffect(() => {
    if (!audio) return undefined;
    let seen = audio.lastPlayedAt();
    const h = setInterval(() => {
      const at = audio.lastPlayedAt();
      if (at !== seen) {
        seen = at;
        setKick(at);
      }
    }, 100);
    return () => clearInterval(h);
  }, [audio]);
  const [haptics, setHaptics] = useState(() => hapticsEnabled());
  // iOS Safari has no navigator.vibrate at all: say so instead of offering a switch that does
  // nothing (Android Chrome has it, after the page's first tap).
  const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  const toggleSound = (): void => {
    if (!audio) return;
    const next = !soundOn;
    // I-062 B: "off" is heard too — a short note before the mute lands.
    if (!next) {
      audio.play('lock');
      setTimeout(() => audio.setMuted(true), 180);
    } else audio.setMuted(false);
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
  const level = useSyncExternalStore(subscribePhoneMusic, phoneMusicLevel, () => 'normal' as const);
  const musicWhat = what ?? 'the room is quiet';
  const [tvSounds, setTvSounds] = useState(() => tvSoundsOn());
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
          {/* I-062 A: a live waveform — bars bounce while On, flat when Off. */}
          <span
            className={`${pickerStyles.wave} ${soundOn ? pickerStyles.waveOn : ''} ${kick ? pickerStyles.waveKick : ''}`}
            key={kick}
          >
            <span />
            <span />
            <span />
          </span>
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
        <span className={pickerStyles.toggleState}>
          {musicOn ? t.controller.on : t.controller.off}
        </span>
      </button>
      {/* The room's switch (the VIP's) plays too: the line and the level follow the music, not the phone's own switch. */}
      {what !== null && what !== undefined ? <p className="pb-caption">♪ {musicWhat}</p> : null}
      {what !== null && what !== undefined ? (
        <div aria-label="Music level">
          {(['soft', 'normal', 'loud'] as const).map((lv) => (
            <button
              type="button"
              key={lv}
              aria-pressed={level === lv}
              className={pickerStyles.toggle}
              onClick={() => setPhoneMusicLevel(lv)}
            >
              {lv}
            </button>
          ))}
        </div>
      ) : null}
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
      {/* S-005 C: the TV's sounds on this phone (a phone-only room). */}
      <button
        type="button"
        className={pickerStyles.toggle}
        aria-pressed={tvSounds}
        onClick={() => {
          setTvSoundsOn(!tvSounds);
          setTvSounds(!tvSounds);
        }}
      >
        <span className={pickerStyles.toggleGlyph} aria-hidden>
          📺
        </span>
        TV sounds on this phone
        <span className={pickerStyles.toggleState}>
          {tvSounds ? t.controller.on : t.controller.off}
        </span>
      </button>
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

// ── S-005 C: the TV's sounds on this phone — per phone, on by default.
const TV_SOUNDS_KEY = 'partybox:tv-sounds';
export function tvSoundsOn(): boolean {
  try {
    return localStorage.getItem(TV_SOUNDS_KEY) !== 'off';
  } catch {
    return true;
  }
}
export function setTvSoundsOn(on: boolean): void {
  try {
    localStorage.setItem(TV_SOUNDS_KEY, on ? 'on' : 'off');
  } catch {
    // private mode
  }
}
