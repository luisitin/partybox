// One editable setting from a manifest spec (number stepper, checkbox, select, multiselect
// checklist). Shared by the
// phone's game picker and the TV's host panel (ADR-031) so both edit the same spec the same way.
import type { JSX } from 'react';
import { multiselectPicks } from '@partybox/shared';
import type { ContentLang, SettingSpec, Settings } from '@partybox/shared';
import { useLang } from '@partybox/game-sdk/ui';
import { t } from './i18n';
import { gameText } from './i18n-games';
import styles from './SettingField.module.css';

export interface SettingFieldProps {
  spec: SettingSpec;
  value: Settings[string] | undefined;
  onChange: (v: Settings[string]) => void;
  /** Distinguishes the TV's and the phone's ids when both render (previews, tests). */
  idPrefix?: string;
  /** Players in the room — a spec with `maxFromPlayers` caps itself to the roster. */
  players?: number;
  /** Every current value: a grouped multiselect reads its sibling select from here (ADR-034). */
  settings?: Settings;
  /** Whose manifest this is: its labels read in the device's language from the game's table. */
  gameId?: string;
  /** ADR-054: the language the game will play in — a select offers only its options of that
   *  language (and those with none), e.g. Bingo's Spanish reader voices in a Spanish game. */
  contentLang?: ContentLang;
}

/** The select options offered in `lang` (all of them when it is unknown). */
export function optionsFor<O extends { lang?: ContentLang }>(
  options: readonly O[],
  lang: ContentLang | undefined,
): readonly O[] {
  return lang === undefined
    ? options
    : options.filter((o) => o.lang === undefined || o.lang === lang);
}

/** The game's content language in a room (`gameContentLang` of the engine, from the catalog). */
export function playLang(
  game: { contentLangs?: readonly ContentLang[] } | undefined,
  roomLang: ContentLang,
): ContentLang {
  const langs = game?.contentLangs ?? ['en'];
  return langs.includes(roomLang) ? roomLang : (langs[0] ?? 'en');
}

export function SettingField({
  spec,
  value,
  onChange,
  idPrefix = 'setting',
  players,
  settings,
  gameId,
  contentLang,
}: SettingFieldProps): JSX.Element {
  const id = `${idPrefix}-${spec.key}`;
  const lang = useLang();
  const L = (en: string): string => gameText(gameId, lang, en);
  const label = L(spec.label);
  const description = spec.description ? L(spec.description) : undefined;
  // A roster-capped number: the ceiling (and a stored value above it) follow the player count, so
  // "players per book" reads 4 with five people in and grows as bots or friends join.
  const max =
    spec.type === 'number' && spec.maxFromPlayers !== undefined && players !== undefined
      ? Math.max(spec.min, Math.min(spec.max, players + spec.maxFromPlayers))
      : spec.type === 'number'
        ? spec.max
        : 0;
  const shown = spec.type === 'number' ? Math.min(max, Number(value ?? spec.default)) : 0;
  // I-112 A: implied by a sibling — greyed, with the reason.
  const implied =
    spec.impliedBy !== undefined && settings?.[spec.impliedBy.key] === spec.impliedBy.value;
  switch (spec.type) {
    case 'boolean':
      return (
        <label
          className={styles.setting}
          htmlFor={id}
          style={implied ? { opacity: 0.5 } : undefined}
        >
          <span className={styles.settingLabel}>
            {label}
            {implied && spec.impliedBy ? (
              <small>{L(spec.impliedBy.note)}</small>
            ) : description ? (
              <small>{description}</small>
            ) : null}
          </span>
          <input
            id={id}
            type="checkbox"
            className={styles.checkbox}
            checked={implied ? true : value === true}
            disabled={implied}
            onChange={(e) => onChange(e.target.checked)}
          />
        </label>
      );
    case 'number':
      return (
        <label className={styles.setting} htmlFor={id}>
          <span className={styles.settingLabel}>
            {label}
            {description ? <small>{description}</small> : null}
          </span>
          <span className={styles.stepper}>
            <button
              type="button"
              aria-label={t.selecting.less(label)}
              onClick={() => onChange(Math.max(spec.min, shown - (spec.step ?? 1)))}
            >
              −
            </button>
            <output id={id}>{String(shown)}</output>
            <button
              type="button"
              aria-label={t.selecting.more(label)}
              disabled={shown >= max}
              onClick={() => onChange(Math.min(max, shown + (spec.step ?? 1)))}
            >
              +
            </button>
          </span>
        </label>
      );
    case 'multiselect': {
      const group = spec.groupBy !== undefined ? settings?.[spec.groupBy] : undefined;
      const options =
        spec.groupBy === undefined ? spec.options : spec.options.filter((o) => o.group === group);
      // Nothing to pick from (the sibling select says "all"): the field steps aside.
      if (options.length === 0) return <></>;
      const picked = multiselectPicks(value, spec);
      const toggle = (v: string): void => {
        const next = picked.includes(v) ? picked.filter((p) => p !== v) : [...picked, v];
        onChange(
          spec.options
            .map((o) => o.value)
            .filter((o) => next.includes(o))
            .join(','),
        );
      };
      return (
        <fieldset className={`${styles.setting} ${styles.multi}`} aria-labelledby={`${id}-label`}>
          <span className={styles.settingLabel} id={`${id}-label`}>
            {label}
            {description ? <small>{description}</small> : null}
          </span>
          <span className={styles.chips}>
            {options.map((o) => (
              <label
                key={o.value}
                className={`${styles.chip} ${picked.includes(o.value) ? styles.chipOn : ''}`}
              >
                <input
                  type="checkbox"
                  checked={picked.includes(o.value)}
                  onChange={() => toggle(o.value)}
                />
                {L(o.label)}
              </label>
            ))}
          </span>
          <small className={styles.multiHint}>
            {picked.length === 0 ? t.selecting.noneTicked : t.selecting.ticked(picked.length)}
          </small>
        </fieldset>
      );
    }
    case 'select': {
      const offered = optionsFor(spec.options, contentLang);
      // A value of the other language (the default, or the room switched) shows the default if it
      // is offered, else the language's first own option — the game's fallback (Bingo: Dora).
      const current = String(value ?? spec.default);
      const has = (v: string): boolean => offered.some((o) => o.value === v);
      const shownValue = has(current)
        ? current
        : has(spec.default)
          ? spec.default
          : (offered.find((o) => o.lang === contentLang)?.value ?? offered[0]?.value ?? current);
      return (
        <label className={styles.setting} htmlFor={id}>
          <span className={styles.settingLabel}>
            {label}
            {description ? <small>{description}</small> : null}
          </span>
          <select
            id={id}
            className={styles.select}
            value={shownValue}
            onChange={(e) => onChange(e.target.value)}
          >
            {offered.map((o) => (
              <option key={o.value} value={o.value}>
                {L(o.label)}
              </option>
            ))}
          </select>
        </label>
      );
    }
  }
}
