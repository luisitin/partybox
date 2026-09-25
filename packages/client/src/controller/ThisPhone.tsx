// The 🎨 sheet's top group, "This phone" (reviewer D3): where this phone's player is and what the
// phone does for them — I can see the TV (ADR-047), the TV's sounds here, vibration. A remote player
// looking for "I can't see the TV" finds it first, not under every theme and each game's settings.
// Each row says what it means inside its own card.
import { useState } from 'react';
import type { JSX } from 'react';
import { buzz, hapticsEnabled, setHapticsEnabled } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import pickerStyles from '../ThemePicker.module.css';
import { setTvSoundsOn, tvSoundsOn } from './PhoneSettings';

const SUBMIT_BUZZ = 20;

export interface ThisPhoneProps {
  /** ADR-047: this phone's "I can see the TV", once it is in a room. On shows what the room
   *  believes (the phone's own answer, else the host's guess from its address). */
  seeTv?: { on: boolean; set: (on: boolean) => void };
}

function Row(props: {
  glyph: string;
  label: string;
  hint?: string;
  on: boolean;
  onClick: () => void;
}): JSX.Element {
  return (
    <button
      type="button"
      className={`${pickerStyles.toggle} ${pickerStyles.toggleRich}`}
      aria-pressed={props.on}
      onClick={props.onClick}
    >
      <span className={pickerStyles.toggleGlyph} aria-hidden>
        {props.glyph}
      </span>
      <span className={pickerStyles.toggleLabel}>{props.label}</span>
      <span className={pickerStyles.toggleState}>
        {props.on ? t.controller.on : t.controller.off}
      </span>
      {props.hint ? <small className={pickerStyles.toggleHint}>{props.hint}</small> : null}
    </button>
  );
}

export function ThisPhone({ seeTv }: ThisPhoneProps): JSX.Element {
  const [tvSounds, setTvSounds] = useState(() => tvSoundsOn());
  const [haptics, setHaptics] = useState(() => hapticsEnabled());
  // iOS Safari has no navigator.vibrate at all: say so instead of offering a switch that does
  // nothing (Android Chrome has it, after the page's first tap).
  const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  return (
    // The sheet itself is titled "This phone": the group needs no heading of its own.
    <section className={pickerStyles.thisPhone} aria-label={t.phone.thisPhone}>
      {seeTv ? (
        <Row
          glyph="👀"
          label={t.phone.seeTv}
          hint={seeTv.on ? t.phone.seeTvOn : t.phone.seeTvOff}
          on={seeTv.on}
          onClick={() => seeTv.set(!seeTv.on)}
        />
      ) : null}
      {/* S-005 C: the TV's sounds on this phone (a phone-only room, or a remote player). */}
      <Row
        glyph="📺"
        label={t.phone.tvSounds}
        hint={t.phone.tvSoundsHint}
        on={tvSounds}
        onClick={() => {
          setTvSoundsOn(!tvSounds);
          setTvSounds(!tvSounds);
        }}
      />
      {canVibrate ? (
        <Row
          glyph="📳"
          label={t.controller.vibration}
          on={haptics}
          onClick={() => {
            setHapticsEnabled(!haptics);
            setHaptics(!haptics);
            if (!haptics) buzz(SUBMIT_BUZZ);
          }}
        />
      ) : (
        <p className={pickerStyles.toggleNote}>
          <span aria-hidden>📳</span> {t.controller.noVibration}
        </p>
      )}
    </section>
  );
}
