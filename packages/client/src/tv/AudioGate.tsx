// Browser autoplay policy: sound needs a gesture. Instead of a full-screen gate (which hid the QR
// after every load and left an unattended TV stuck), the stage renders normally with a small
// "tap for sound" pill; the first click/key anywhere enables audio. Mute (persisted) and fullscreen
// sit in the corner inside the overscan margin.
import { useEffect, useState } from 'react';
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
  useEffect(() => {
    if (started) return;
    const start = (): void => {
      void audio.enable().then((ok) => {
        if (ok) setStarted(true);
      });
    };
    document.addEventListener('pointerdown', start);
    document.addEventListener('keydown', start);
    return () => {
      document.removeEventListener('pointerdown', start);
      document.removeEventListener('keydown', start);
    };
  }, [audio, started]);
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
        <button type="button" className={styles.pill} onClick={() => void audio.enable()}>
          <span aria-hidden>🔇</span> {t.tv.tapToStart}
          <span className={styles.pillHint}>{t.tv.tapHint}</span>
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
