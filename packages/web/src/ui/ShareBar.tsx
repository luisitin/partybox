// The one row that is web-only: getting other people in, and how much room the stage gets. On a
// LAN the TV carries the code and the QR across the room; here the only thing that travels is a
// link, so a one-tap invite sits where it stays reachable whatever the stage is doing. The room
// code is not repeated — the controller's own header already carries it.
import { useState } from 'react';
import type { JSX } from 'react';
import { joinUrl } from '../config';
import styles from './ShareBar.module.css';

export interface ShareBarProps {
  code: string;
  hosting: boolean;
  /** False when the room could not be published: you can play, nobody can dial in yet. */
  reachable: boolean;
  stageShown: boolean;
  onToggleStage(): void;
  onRetry(): void;
}

export function ShareBar({
  code,
  hosting,
  reachable,
  stageShown,
  onToggleStage,
  onRetry,
}: ShareBarProps): JSX.Element {
  const [copied, setCopied] = useState(false);
  const url = joinUrl(code);
  const share = async (): Promise<void> => {
    const data = { title: 'PartyBox', text: `Join my PartyBox room ${code}`, url };
    // The share sheet on a phone, the clipboard everywhere else.
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        /* dismissed: fall through to the clipboard */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className={styles.bar}>
      <button
        type="button"
        className={styles.stage}
        onClick={onToggleStage}
        aria-expanded={stageShown}
      >
        <span aria-hidden>{stageShown ? '▴' : '▾'}</span> Stage
      </button>
      {hosting ? (
        <span className={styles.hostTag} title="The room runs in this tab — closing it ends it.">
          you host
        </span>
      ) : null}
      {reachable ? (
        <button type="button" className={styles.share} onClick={() => void share()}>
          {copied ? 'Link copied' : 'Invite'}
        </button>
      ) : (
        <button type="button" className={`${styles.share} ${styles.offline}`} onClick={onRetry}>
          Nobody can join — retry
        </button>
      )}
    </div>
  );
}
