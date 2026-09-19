// Settings are VIP-editable values validated against a game's manifest spec. Unknown keys are
// dropped, out-of-range numbers clamped, bad selects fall back to the default — never an error,
// because a stale phone UI should not be able to wedge the lobby.
import { multiselectPicks } from '@partybox/shared';
import type { GameManifest, SettingSpec, Settings, SettingValue } from '@partybox/shared';

export function defaultSettings(manifest: GameManifest): Settings {
  const out: Settings = {};
  for (const spec of manifest.settings) out[spec.key] = spec.default;
  return out;
}

function coerceOne(spec: SettingSpec, raw: SettingValue | undefined): SettingValue {
  switch (spec.type) {
    case 'number': {
      if (typeof raw !== 'number' || !Number.isFinite(raw)) return spec.default;
      let v = Math.min(spec.max, Math.max(spec.min, raw));
      if (spec.step) v = spec.min + Math.round((v - spec.min) / spec.step) * spec.step;
      return Math.min(spec.max, Math.max(spec.min, v));
    }
    case 'boolean':
      return typeof raw === 'boolean' ? raw : spec.default;
    case 'select':
      return typeof raw === 'string' && spec.options.some((o) => o.value === raw)
        ? raw
        : spec.default;
    case 'multiselect':
      // Unknown picks are dropped, the rest kept in option order; a non-string is the default.
      return typeof raw === 'string' ? multiselectPicks(raw, spec).join(',') : spec.default;
  }
}

/** Merges `patch` over `current`, coercing every value to its spec. */
export function coerceSettings(
  manifest: GameManifest,
  current: Settings,
  patch: Settings,
): Settings {
  const out: Settings = {};
  for (const spec of manifest.settings) {
    const raw = spec.key in patch ? patch[spec.key] : current[spec.key];
    out[spec.key] = coerceOne(spec, raw);
  }
  // A grouped multiselect keeps only the picks of the group its sibling select now names, so a
  // category change never leaves another category's topics behind (ADR-034).
  for (const spec of manifest.settings) {
    if (spec.type !== 'multiselect' || spec.groupBy === undefined) continue;
    const group = out[spec.groupBy];
    out[spec.key] = multiselectPicks(out[spec.key], spec)
      .filter((v) => spec.options.find((o) => o.value === v)?.group === group)
      .join(',');
  }
  return out;
}
