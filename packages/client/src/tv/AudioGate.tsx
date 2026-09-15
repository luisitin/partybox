// Browser autoplay policy: sound needs a gesture. Full-screen "Tap to start" overlay once, then a
// small mute toggle (persisted) and a fullscreen button in the corner.
import { useState } from 'react';
import type { JSX } from 'react';
import { t } from '../i18n';
import type { SoundEngine } from '../sound';
import styles from './AudioGate.module.css';

export interface AudioGateProps {
  audio: SoundEngine;
}

export function AudioGate({ audio }: AudioGateProps): JSX.Element {
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(audio.muted());
  const start = async (): Promise<void> => {
    await audio.enable();
    setStarted(true);
  };
  const toggleMute = (): void => {
    audio.setMuted(!muted);
    setMuted(!muted);
  };
  const fullscreen = (): void => {
    void document.documentElement.requestFullscreen?.();
  };
  return (
    <>
      {!started ? (
        <button type="button" className={styles.gate} onClick={() => void start()}>
          <span className={styles.gateTitle}>{t.tv.tapToStart}</span>
          <span className={styles.gateHint}>{t.tv.tapHint}</span>
        </button>
      ) : null}
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.control}
          onClick={toggleMute}
          aria-pressed={muted}
          aria-label={muted ? t.tv.unmute : t.tv.mute}
        >
          {muted ? '🔇' : '🔊'}
        </button>
        <button
          type="button"
          className={styles.control}
          onClick={fullscreen}
          aria-label={t.tv.fullscreen}
        >
          ⛶
        </button>
      </div>
    </>
  );
}
