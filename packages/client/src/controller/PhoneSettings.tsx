// The theme sheet's footer on a phone: this phone's own sound and vibration toggles (R-048).
// Turning one on plays/buzzes the `submit` pattern so the player hears or feels what they enabled.
import { useEffect, useState, useSyncExternalStore } from 'react';
import { GameSettingsRows } from './GameSettingsRows';
import { JoinLangs } from './JoinLangs';
import { ShareButton } from './ShareSheet';

import type { JSX } from 'react';
import {
  buzz,
  hapticsEnabled,
  setHapticsEnabled,
  setPadStyle,
  usePadStyle,
  setLang,
  useLang,
} from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import type { SoundEngine } from '../sound';
import {
  setPhoneMusicOn,
  subscribePhoneMusic,
  phoneMusicVolume,
  setPhoneMusicVolume,
} from '../phone-music';
import pickerStyles from '../ThemePicker.module.css';
import { SeeTvToggle } from './SeeTvToggle';

const SUBMIT_BUZZ = 20;

export interface PhoneSettingsProps {
  /** The phone's sound engine; absent in /preview (the sound toggle is then disabled). */
  audio?: SoundEngine;
  /** S-004 B: what the music engine is on right now ("Lobby set", "Bingo's set"). */
  what?: string | null;
  /** The owner (2026-09-22): the room this phone is in — the sheet carries Share and Leave, so
   *  both are reachable mid-game and not only from the lobby. */
  room?: { code: string } | null;
  onLeave?: () => void;
  /** ADR-047: this phone's "I can see the TV" once it is in a room. */
  seeTv?: { on: boolean; set: (on: boolean) => void };
}

export function PhoneSettings(props: PhoneSettingsProps): JSX.Element {
  const { audio, what, room, onLeave, seeTv } = props;
  const lang = useLang();
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (!leaving) return undefined;
    const h = setTimeout(() => setLeaving(false), 3000);
    return () => clearTimeout(h);
  }, [leaving]);
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
  // The switch shows what this phone plays (the room may have turned it on); a tap sets the
  // phone's own choice, which wins over the room's (the owner, 2026-09-23).
  const musicOn = what !== null && what !== undefined;
  const volume = useSyncExternalStore(subscribePhoneMusic, phoneMusicVolume, () => 70);
  const toggleMusic = (): void => setPhoneMusicOn(!musicOn);
  const musicWhat = what ?? t.music.roomQuiet;
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
        onClick={toggleMusic}
      >
        <span className={pickerStyles.toggleGlyph} aria-hidden>
          ♪
        </span>
        {t.phone.music}
        <span className={pickerStyles.toggleState}>
          {musicOn ? t.controller.on : t.controller.off}
        </span>
      </button>
      {/* The room's switch (the VIP's) plays too: the line and the level follow the music, not the phone's own switch. */}
      {what !== null && what !== undefined ? <p className="pb-caption">♪ {musicWhat}</p> : null}
      {musicOn ? (
        // The owner (2026-09-23): turn the music down to hear the reader — any level, not three.
        <label className={pickerStyles.volume} htmlFor="phone-music-volume">
          <span>{t.phone.musicLevel}</span>
          <input
            id="phone-music-volume"
            type="range"
            min={0}
            max={100}
            step={5}
            value={volume}
            onChange={(e) => setPhoneMusicVolume(Number(e.currentTarget.value))}
          />
          <span className={pickerStyles.volumeValue}>{volume} %</span>
        </label>
      ) : null}
      {/* The owner (2026-09-22): the language, changeable after joining too — every screen follows. */}
      <section className={pickerStyles.gameSection}>
        <h4 className={pickerStyles.gameTitle}>{t.join.language}</h4>
        <JoinLangs lang={lang} onPick={setLang} />
      </section>
      {/* The owner (2026-09-22): the room's own row — share it, or leave for the room menu. */}
      {room ? (
        <section className={pickerStyles.gameSection}>
          <h4 className={pickerStyles.gameTitle}>
            {t.lobby.room} {room.code}
          </h4>
          <ShareButton code={room.code} />
          {onLeave ? (
            <button
              type="button"
              className={pickerStyles.toggle}
              onClick={() => {
                if (!leaving) {
                  setLeaving(true);
                  return;
                }
                onLeave();
              }}
            >
              <span className={pickerStyles.toggleGlyph} aria-hidden>
                🚪
              </span>
              {leaving ? t.phone.leaveConfirm : t.phone.leave}
              <span className={pickerStyles.toggleState}>{leaving ? t.phone.tapAgain : ''}</span>
            </button>
          ) : null}
        </section>
      ) : null}
      {/* S-003 A: each game's own phone settings, a closed row per game (its own download). */}
      <GameSettingsRows />
      {seeTv ? <SeeTvToggle on={seeTv.on} set={seeTv.set} /> : null}
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
        {t.phone.tvSounds}
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
