// The values and helpers a browser needs from this package, with no zod in reach (game pack F1, the
// owner's ruling 11): the client imports them through the barrel, and with `"sideEffects": false`
// the bundler leaves the zod schemas — and zod itself — out of every phone's download.

export const LIMITS = {
  roomCapacity: 16,
  maxPayloadBytes: 16 * 1024,
  inputsPerSecond: 20,
  disconnectGraceMs: 120_000,
  vipHandoverMs: 30_000,
  pingIntervalMs: 10_000,
  pingTimeoutMs: 20_000,
} as const;

/** A photo avatar (I-031, the owner): a 128 × 128 JPEG the phone made, as a data URL, capped at
 *  24 KB. `avatarId` stays required — the face is the fallback wherever the photo is absent. */
export const PHOTO_MAX_BYTES = 24 * 1024;

export const MAX_BOTS_PER_OWNER = 4;

/** A multiselect value → its picks (deduped, in option order when `spec` is given). */
export function multiselectPicks(
  value: unknown,
  spec?: { options: { value: string }[] },
): string[] {
  const raw = typeof value === 'string' ? value.split(',') : [];
  const picks = [...new Set(raw.map((v) => v.trim()).filter((v) => v.length > 0))];
  if (!spec) return picks;
  const known = spec.options.map((o) => o.value);
  return known.filter((v) => picks.includes(v));
}
