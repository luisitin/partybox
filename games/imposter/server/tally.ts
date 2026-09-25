// Who gets accused (SPEC §1.6 "Who gets accused"): the most-voted fill the slots; a tie across the
// boundary gets one runoff among the tied players; a runoff still tied leaves that slot empty.
// Pure; seat order breaks nothing (ties are never broken at random).

/** Votes received per candidate (only candidates in `pool`, when given). */
export function counts(
  votes: Record<string, string[]>,
  pool?: readonly string[],
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const targets of Object.values(votes))
    for (const t of targets) if (!pool || pool.includes(t)) out[t] = (out[t] ?? 0) + 1;
  return out;
}

export interface Decision {
  /** Accused for sure. */
  accused: string[];
  /** A runoff among `candidates` for `slots` more places, or null. */
  runoff: { candidates: string[]; slots: number } | null;
}

/**
 * Fill `slots` places from `votes`. `order` fixes the output order (seat order) so the TV spotlights
 * accused players the same way on every replay.
 */
export function decide(
  votes: Record<string, string[]>,
  slots: number,
  order: readonly string[],
  pool?: readonly string[],
): Decision {
  const c = counts(votes, pool);
  const ranked = order.filter((id) => (c[id] ?? 0) > 0).sort((a, b) => (c[b] ?? 0) - (c[a] ?? 0));
  if (ranked.length === 0 || slots <= 0) return { accused: [], runoff: null };
  if (ranked.length <= slots) return { accused: ranked, runoff: null };
  const boundary = c[ranked[slots - 1] ?? ''] ?? 0;
  const above = ranked.filter((id) => (c[id] ?? 0) > boundary);
  const tied = ranked.filter((id) => (c[id] ?? 0) === boundary);
  if (above.length + tied.length <= slots) return { accused: [...above, ...tied], runoff: null };
  return { accused: above, runoff: { candidates: tied, slots: slots - above.length } };
}

/** The runoff's outcome: its clear winners take the slots; a tie across the boundary stays empty. */
export function decideRunoff(
  votes: Record<string, string[]>,
  candidates: readonly string[],
  slots: number,
): string[] {
  const d = decide(votes, slots, candidates, candidates);
  return d.accused;
}
