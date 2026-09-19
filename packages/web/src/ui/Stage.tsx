// The TV, on the phone that is already in your hand (ADR-034). It is the real stage — the same
// TvApp the LAN build puts on a 55" screen — laid out at its design size of 1920×1080 and zoomed
// down to the width of the strip. TV type is sized to be read from three metres; at this zoom on a
// phone held at arm's length it subtends about the same angle, so it stays legible.
//
// `transform` on the wrapper is load-bearing: it makes the wrapper the containing block for the
// stage's `position: fixed` bits (toasts, the sound controls), which would otherwise escape the
// strip and sit on top of the controls below.
import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { TV_DESIGN, TvApp } from '@partybox/client';
import type { TvClient } from '@partybox/client';
import styles from './Stage.module.css';

export interface StageProps {
  client: TvClient;
  /**
   * Folded away, to give the controls the whole screen — a Bingo card wants every pixel. It stays
   * mounted while hidden: the stage owns the music, the beds and the cues, and unmounting it would
   * stop the room's sound and make the browser ask for the audio gesture again.
   */
  hidden: boolean;
}

export function Stage({ client, hidden }: StageProps): JSX.Element {
  const boxRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.2);
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const fit = (): void => {
      const { width, height } = box.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      setZoom(Math.min(width / TV_DESIGN.width, height / TV_DESIGN.height));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    return () => observer.disconnect();
  }, [hidden]);
  return (
    <div
      className={`${styles.box} ${hidden ? styles.hidden : ''}`}
      ref={boxRef}
      aria-hidden={hidden}
    >
      {/* The design size in px, not 100 %: under `zoom` a percentage resolves against a parent
          that is not zoomed, and the stage would be laid out for the wrong width. */}
      <div
        className={styles.zoom}
        style={{ zoom, width: TV_DESIGN.width, height: TV_DESIGN.height }}
      >
        <TvApp client={client} />
      </div>
    </div>
  );
}
