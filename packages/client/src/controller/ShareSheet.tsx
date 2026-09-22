// The owner (2026-09-22): the Share control is a pill in the screen's top-right corner, and it
// must let people PICK how they share — not just copy.
//
// `navigator.share` (the real iOS/Android sheet) only exists in a secure context, so a phone on
// the LAN address (plain http) never gets it. There it opens PartyBox's own chooser instead, whose
// rows are ordinary links the phone handles itself: Messages, WhatsApp, Mail — plus Copy.
import { useState } from 'react';
import type { JSX } from 'react';
import styles from './Lobby.module.css';

/** The join link (`?room=CODE`, I-041) on the origin THIS phone reached the room by. */
export function joinLink(code: string): string {
  return `${window.location.origin}/?room=${code}`;
}

type Nav = Navigator & { share?: (data: ShareData) => Promise<void> };

/** True when the phone can open its own share sheet (https or localhost only). */
export function canShareNatively(): boolean {
  return typeof navigator !== 'undefined' && typeof (navigator as Nav).share === 'function';
}

async function copy(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}

export function ShareButton({ code }: { code: string }): JSX.Element {
  const [open, setOpen] = useState(false);
  const [said, setSaid] = useState<string | null>(null);
  const url = joinLink(code);
  const text = `Join my PartyBox room ${code}`;
  // Android wants sms:?body=, iOS sms:&body=.
  const sms = /android/i.test(navigator.userAgent) ? '?' : '&';
  const flash = (word: string): void => {
    setSaid(word);
    setTimeout(() => setSaid(null), 2000);
  };
  const tap = (): void => {
    // The system sheet, when the phone has one — opened inside the tap, as iOS requires.
    const nav = navigator as Nav;
    if (nav.share) {
      void nav.share({ title: 'PartyBox', text, url }).then(
        () => flash('Shared'),
        () => undefined,
      );
      void copy(url);
      return;
    }
    setOpen(true);
  };
  return (
    <>
      <button type="button" className={styles.sharePill} onClick={tap}>
        {said ? `✓ ${said}` : '🔗 Share'}
      </button>
      {open ? (
        <div className={styles.shareBack} role="dialog" aria-label="share the room">
          <div className={styles.shareSheet}>
            <p className={styles.shareCode}>
              Room <b>{code}</b>
            </p>
            <a
              className={styles.shareRow}
              href={`sms:${sms}body=${encodeURIComponent(`${text} ${url}`)}`}
            >
              💬 Messages
            </a>
            <a
              className={styles.shareRow}
              href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
              target="_blank"
              rel="noreferrer"
            >
              🟢 WhatsApp
            </a>
            <a
              className={styles.shareRow}
              href={`mailto:?subject=${encodeURIComponent('PartyBox')}&body=${encodeURIComponent(`${text}\n\n${url}`)}`}
            >
              ✉️ Mail
            </a>
            <button
              type="button"
              className={styles.shareRow}
              onClick={() => {
                void copy(url).then((ok) => flash(ok ? 'Copied' : 'Copy failed'));
                setOpen(false);
              }}
            >
              📋 Copy the link
            </button>
            <p className={styles.shareLink}>{url.replace(/^https?:\/\//, '')}</p>
            <button type="button" className={styles.shareClose} onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
