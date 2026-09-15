// Theme choice for one device. `row`: an inline strip of swatches (the TV corner); `sheet`: a
// bottom sheet with big rows (phones). Both mark the current theme with ✓, never colour alone.
import type { JSX } from 'react';
import { t } from './i18n';
import { THEMES, setTheme, useTheme } from './theme';
import type { ThemeSpec } from './theme';
import styles from './ThemePicker.module.css';

function Swatch({ theme }: { theme: ThemeSpec }): JSX.Element {
  const [bg, a, b] = theme.swatch;
  return (
    <span className={styles.swatch} style={{ background: bg }} aria-hidden>
      <span style={{ background: a }} />
      <span style={{ background: b }} />
    </span>
  );
}

export interface ThemePickerProps {
  variant: 'row' | 'sheet';
  onClose?: () => void;
}

export function ThemePicker({ variant, onClose }: ThemePickerProps): JSX.Element {
  const current = useTheme();
  const list = (
    <ul className={variant === 'row' ? styles.row : styles.list} aria-label={t.theme.title}>
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
                if (variant === 'sheet') onClose?.();
              }}
            >
              <Swatch theme={theme} />
              <span className={styles.label}>
                {theme.label}
                {variant === 'sheet' ? <small>{theme.hint}</small> : null}
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
  if (variant === 'row') return list;
  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label={t.theme.title}
      onClick={onClose}
    >
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <h2 className={styles.title}>{t.theme.title}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label={t.vip.close}>
            ✕
          </button>
        </div>
        {list}
      </div>
    </div>
  );
}
