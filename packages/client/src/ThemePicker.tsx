// Theme choice for one device. `row`: an inline strip of swatches; `menu`: a vertical list with
// hints hanging from the TV corner 🎨 (closes on select); `sheet`: a bottom sheet with big rows
// (phones). All mark the current theme with ✓, never colour alone.
import type { JSX, ReactNode } from 'react';
import { useLang } from '@partybox/game-sdk/ui';
import { t } from './i18n';
import { THEMES, setTheme, useTheme } from './theme';
import type { ThemeSpec } from './theme';
import styles from './ThemePicker.module.css';

function Swatch({ theme }: { theme: ThemeSpec }): JSX.Element {
  const [bg, a, b] = theme.swatch;
  // I-035 B: a tiny screen — header strip, body, an accent button and a gold chip in the
  // theme's own colours, so the row previews the look before the tap.
  return (
    <span className={styles.swatch} style={{ background: bg }} aria-hidden>
      <span className={styles.miniHead} style={{ background: a }} />
      <span className={styles.miniBody}>
        <span className={styles.miniChip} style={{ background: b }} />
        <span className={styles.miniButton} style={{ background: a }} />
      </span>
    </span>
  );
}

export interface ThemePickerProps {
  variant: 'row' | 'sheet' | 'menu';
  onClose?: () => void;
  /** Sheet only: extra rows under the themes (the phone's sound and vibration toggles). */
  footer?: ReactNode;
  /** Sheet only: a group above the themes; the sheet then takes `title` and the themes get their
   *  own heading (a phone's "This phone" group, reviewer D3). */
  header?: ReactNode;
  title?: string;
}

export function ThemePicker({
  variant,
  onClose,
  footer,
  header,
  title,
}: ThemePickerProps): JSX.Element {
  const current = useTheme();
  // The names and hints read in the device's language (`t.themes`); a switch re-renders them.
  useLang();
  const list = (
    <ul
      className={
        variant === 'row'
          ? styles.row
          : variant === 'menu'
            ? `${styles.list} ${styles.menu}`
            : styles.list
      }
      aria-label={t.theme.title}
    >
      {THEMES.map((theme) => {
        const active = theme.id === current;
        return (
          <li key={theme.id}>
            <button
              type="button"
              className={`${styles.option} ${active ? styles.active : ''}`}
              aria-pressed={active}
              onClick={() => {
                setTheme(theme.id);
                // I-035 A: the sheet stays open — the page recolours behind it live and Done
                // closes it; the menu variant still closes itself.
                if (variant === 'menu') onClose?.();
              }}
            >
              <Swatch theme={theme} />
              <span className={styles.label}>
                {t.themes[theme.id].label}
                {variant !== 'row' ? <small>{t.themes[theme.id].hint}</small> : null}
              </span>
              <span className={styles.mark} aria-hidden>
                {active ? '✓' : ''}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
  if (variant !== 'sheet') return list;
  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label={title ?? t.theme.title}
      onClick={onClose}
    >
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <h2 className={styles.title}>{title ?? t.theme.title}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label={t.vip.close}>
            ✕
          </button>
        </div>
        {header}
        {header ? (
          <section className={styles.gameSection}>
            <h4 className={styles.gameTitle}>{t.theme.title}</h4>
            {list}
          </section>
        ) : (
          list
        )}
        {footer ? <div className={styles.footer}>{footer}</div> : null}
        <button type="button" className={styles.done} onClick={onClose}>
          {t.theme.done}
        </button>
      </div>
    </div>
  );
}
