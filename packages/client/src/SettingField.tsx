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
}

export function SettingField({
  spec,
  value,
  onChange,
  idPrefix = 'setting',
}: SettingFieldProps): JSX.Element {
  const id = `${idPrefix}-${spec.key}`;
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
              onClick={() =>
                onChange(Math.max(spec.min, Number(value ?? spec.default) - (spec.step ?? 1)))
              }
            >
              −
            </button>
            <output id={id}>{String(value ?? spec.default)}</output>
            <button
              type="button"
              aria-label={`more ${spec.label}`}
              onClick={() =>
                onChange(Math.min(spec.max, Number(value ?? spec.default) + (spec.step ?? 1)))
              }
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
