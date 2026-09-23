// The owner (2026-09-22): the Share control is a pill in the screen's top-right corner, and it
// must let people PICK how they share — not just copy.
//
// `navigator.share` (the real iOS/Android sheet) only exists in a secure context, so a phone on
// the LAN address (plain http) never gets it. There it opens PartyBox's own chooser instead, whose
// rows are ordinary links the phone handles itself: Messages, WhatsApp, Mail — plus Copy.
import { useState } from 'react';
import type { JSX } from 'react';
import { t } from '../i18n';
import { useServerInfo } from '../net/info';
import styles from './Lobby.module.css';

/**
 * The join link (`?room=CODE`, I-041). The owner (2026-09-22): "when sharing with friends, it
 * should be the link for non-same wifi" — so the host's public tunnel address when one is live
 * (`/api/info` `publicUrl`), else the origin this phone reached the room by.
 */
export function joinLink(code: string, publicUrl?: string | null): string {
  const base = (publicUrl ?? window.location.origin).replace(/\/$/, '');
  return `${base}/?room=${code}`;
}

type Nav = Navigator & { share?: (data: ShareData) => Promise<void> };

/**
 * True when the link only works on this network: a private address (192.168.x, 10.x, 172.16-31.x)
 * or localhost. The in-app chooser appears exactly there (plain http has no system share sheet),
 * so it says so — a friend elsewhere needs the tunnel's https link (the owner, 2026-09-22).
 */
export function isLocalOnly(host: string): boolean {
  return (
    /^(localhost|127\.|10\.|192\.168\.)/.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    host.endsWith('.local')
  );
}

/** True when the phone can open its own share sheet (https or localhost only). */
export function canShareNatively(): boolean {
  return typeof navigator !== 'undefined' && typeof (navigator as Nav).share === 'function';
}

/**
 * Copy the link. The Clipboard API, like the share sheet, exists only in a secure context — on the
 * LAN address `navigator.clipboard` is undefined and "Copy" failed every time (the owner,
 * 2026-09-22). There the old selection copy still works, inside the same tap: it runs before any
 * await, so the browser still counts the tap.
 */
function copy(url: string): Promise<boolean> {
  if (navigator.clipboard?.writeText)
    return navigator.clipboard.writeText(url).then(
      () => true,
      () => Promise.resolve(selectionCopy(url)),
    );
  return Promise.resolve(selectionCopy(url));
}

function selectionCopy(text: string): boolean {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', ''); // no keyboard pops up on a phone
  area.style.position = 'fixed';
  area.style.top = '0';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  area.setSelectionRange(0, text.length); // iOS ignores select() alone
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

export function ShareButton({ code }: { code: string }): JSX.Element {
  const [open, setOpen] = useState(false);
  const [said, setSaid] = useState<string | null>(null);
  const info = useServerInfo();
  const url = joinLink(code, info?.publicUrl);
  const text = t.share.message(code);
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
        () => flash(t.share.shared),
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
        {said ? `✓ ${said}` : t.share.button}
      </button>
      {open ? (
        <div className={styles.shareBack} role="dialog" aria-label={t.share.sheet}>
          <div className={styles.shareSheet}>
            <p className={styles.shareCode}>
              {t.lobby.room} <b>{code}</b>
            </p>
            <a
              className={styles.shareRow}
              href={`sms:${sms}body=${encodeURIComponent(`${text} ${url}`)}`}
            >
              {t.share.messages}
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
              {t.share.mail}
            </a>
            <button
              type="button"
              className={styles.shareRow}
              onClick={() => {
                void copy(url).then((ok) => flash(ok ? t.share.copied : t.share.copyFailed));
                setOpen(false);
              }}
            >
              {t.share.copyLink}
            </button>
            <p className={styles.shareLink}>{url.replace(/^https?:\/\//, '')}</p>
            {isLocalOnly(new URL(url).hostname) ? (
              <p className={styles.shareNote}>{t.share.localOnly}</p>
            ) : null}
            <button type="button" className={styles.shareClose} onClick={() => setOpen(false)}>
              {t.vip.close}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
