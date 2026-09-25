// The 🎨 sheet's "I can see the TV" (game pack Part 00 §3.3, ADR-047): on shows what the room
// believes (the phone's own answer, else the host's guess from its address); a tap answers for
// this phone and tells the room. Off, the TV's moments and the reader come to this phone.
import type { JSX } from 'react';
import { t } from '../i18n';
import pickerStyles from '../ThemePicker.module.css';

export function SeeTvToggle({ on, set }: { on: boolean; set: (on: boolean) => void }): JSX.Element {
  return (
    <>
      <button
        type="button"
        className={pickerStyles.toggle}
        aria-pressed={on}
        onClick={() => set(!on)}
      >
        <span className={pickerStyles.toggleGlyph} aria-hidden>
          👀
        </span>
        {t.phone.seeTv}
        <span className={pickerStyles.toggleState}>{on ? t.controller.on : t.controller.off}</span>
      </button>
      {on ? null : <p className="pb-caption">{t.phone.seeTvOff}</p>}
    </>
  );
}
