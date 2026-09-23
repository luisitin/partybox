// English ordinals for the results line (Spanish writes 1.º — i18n-es.ts).
/** 1st, 2nd, 3rd, 4th … 11th–13th, 21st. */
export function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  const suffix = { 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] ?? 'th';
  return `${n}${suffix}`;
}
