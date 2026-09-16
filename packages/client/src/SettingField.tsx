// One editable setting from a manifest spec (number stepper, checkbox, select). Shared by the
// phone's game picker and the TV's host panel (ADR-031) so both edit the same spec the same way.
import type { JSX } from 'react';
import type { SettingSpec, Settings } from '@partybox/shared';
import styles from './SettingField.module.css';

export interface SettingFieldProps {
  spec: SettingSpec;
  value: Settings[string] | undefined;
  onChange: (v: Settings[string]) => void;
  /** Distinguishes the TV's and the phone's ids when both render (previews, tests). */
  idPrefix?: string;
  /** Players in the room — a spec with `maxFromPlayers` caps itself to the roster. */
  players?: number;
}

export function SettingField({
  spec,
  value,
  onChange,
  idPrefix = 'setting',
  players,
}: SettingFieldProps): JSX.Element {
  const id = `${idPrefix}-${spec.key}`;
  // A roster-capped number: the ceiling (and a stored value above it) follow the player count, so
  // "players per book" reads 4 with five people in and grows as bots or friends join.
  const max =
    spec.type === 'number' && spec.maxFromPlayers !== undefined && players !== undefined
      ? Math.max(spec.min, Math.min(spec.max, players + spec.maxFromPlayers))
      : spec.type === 'number'
        ? spec.max
        : 0;
  const shown = spec.type === 'number' ? Math.min(max, Number(value ?? spec.default)) : 0;
  switch (spec.type) {
    case 'boolean':
      return (
        <label className={styles.setting} htmlFor={id}>
          <span className={styles.settingLabel}>
            {spec.label}
            {spec.description ? <small>{spec.description}</small> : null}
          </span>
          <input
            id={id}
            type="checkbox"
            className={styles.checkbox}
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
          />
        </label>
      );
    case 'number':
      return (
        <label className={styles.setting} htmlFor={id}>
          <span className={styles.settingLabel}>
            {spec.label}
            {spec.description ? <small>{spec.description}</small> : null}
          </span>
          <span className={styles.stepper}>
            <button
              type="button"
              aria-label={`less ${spec.label}`}
              onClick={() => onChange(Math.max(spec.min, shown - (spec.step ?? 1)))}
            >
              −
            </button>
            <output id={id}>{String(shown)}</output>
            <button
              type="button"
              aria-label={`more ${spec.label}`}
              disabled={shown >= max}
              onClick={() => onChange(Math.min(max, shown + (spec.step ?? 1)))}
            >
              +
            </button>
          </span>
        </label>
      );
    case 'select':
      return (
        <label className={styles.setting} htmlFor={id}>
          <span className={styles.settingLabel}>
            {spec.label}
            {spec.description ? <small>{spec.description}</small> : null}
          </span>
          <select
            id={id}
            className={styles.select}
            value={String(value ?? spec.default)}
            onChange={(e) => onChange(e.target.value)}
          >
            {spec.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      );
  }
}
