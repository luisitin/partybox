// I-179 B: the words either side of a Pick 1 card's blank, for the vote grid ("…fired for ____ with
// the…"). Punctuation right after the blank stays on it ("____." / "____:"), and "…" follows only
// when words do — a finished sentence never ends in "…" (tune-in's review 967834).

/** The anchor around the first blank of `text`, or a bare blank when there is none. */
export function anchorOf(text: string): string {
  const m = /_{2,}/.exec(text);
  if (!m) return '____';
  const before = text.slice(0, m.index).trim().split(/\s+/).filter(Boolean).slice(-2).join(' ');
  const rest = text.slice(m.index + m[0].length);
  const punct = /^[.!?,;:)"'”’]*/.exec(rest)?.[0] ?? '';
  const after = rest.slice(punct.length).trim().split(/\s+/).filter(Boolean).slice(0, 2).join(' ');
  const head = before ? `…${before} ` : '';
  return `${head}____${punct}${after ? ` ${after}…` : ''}`;
}
