// Words both surfaces share for a bingo: the headline counts bingos under the current pattern
// ("2nd bingo in round 1", "1st blackout in round 1"), the first bingo of a round is plainly a
// win. Owner, 2026-09-17: "it always says person won round 1". Every line takes the screen's
// translator `L` (the owner, 2026-09-22: every screen translatable to Spanish).
import type { Lang, Translator } from '@partybox/game-sdk/ui';
import type { BingoTvView } from '../server/views';

/**
 * "2nd" — in Spanish "2.º", with "1.er" / "3.er" before the noun as Spanish writes them. A
 * language without Bingo sentences reads them in English, so it gets the English ordinal.
 */
export function ordinal(n: number, lang: Lang = 'en'): string {
  if (lang === 'es') {
    const apocope = (n % 10 === 1 && n % 100 !== 11) || n % 10 === 3;
    return `${n}.${apocope ? 'er' : 'º'}`;
  }
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  const rem10 = n % 10;
  return `${n}${rem10 === 1 ? 'st' : rem10 === 2 ? 'nd' : rem10 === 3 ? 'rd' : 'th'}`;
}

type Win = Pick<BingoTvView, 'pattern' | 'patternBingos' | 'round'>;

/** The TV's headline under BINGO!, one line: "Sam wins round 1" / "Sam's 2nd bingo" (the line
 * under it carries the round). */
export function winHeadline(view: Win, name: string, L: Translator): string {
  const n = Math.max(1, view.patternBingos);
  const nth = ordinal(n, L.lang);
  if (view.pattern === 'blackout') return L("{name}'s {nth} blackout", { name, nth });
  return n === 1
    ? L('{name} wins round {round}', { name, round: view.round })
    : L("{name}'s {nth} bingo", { name, nth });
}

/** The winner's own phone title; `card` (1-based) when they play several. */
export function winTitle(view: Win, card: number | null, L: Translator): string {
  const n = Math.max(1, view.patternBingos);
  const vars = { nth: ordinal(n, L.lang), round: view.round, card: card ?? 0 };
  if (view.pattern === 'blackout')
    return card === null
      ? L('BLACKOUT! Your {nth} blackout in round {round}', vars)
      : L('BLACKOUT! Your {nth} blackout in round {round} — card {card}', vars);
  if (n === 1)
    return card === null
      ? L('BINGO! You win round {round}', vars)
      : L('BINGO! You win round {round} — card {card}', vars);
  return card === null
    ? L('BINGO! Your {nth} bingo in round {round}', vars)
    : L('BINGO! Your {nth} bingo in round {round} — card {card}', vars);
}

/** Everyone else's phone title. */
export function otherTitle(view: Win, name: string, L: Translator): string {
  if (view.pattern === 'blackout') return L('{name} has a blackout', { name });
  const n = Math.max(1, view.patternBingos);
  return n === 1
    ? L('{name} has bingo', { name })
    : L('{name} — {nth} bingo in round {round}', {
        name,
        nth: ordinal(n, L.lang),
        round: view.round,
      });
}

/**
 * Why a claim failed, by the numbers (loop 272): "19 was never called · 3 was missed", "19 and 44
 * were never called", or nothing when the card is simply short of the pattern.
 */
export function whyNot(
  claim: { card: number[]; red: number[]; missing: number[]; cells?: number[] },
  L: Translator,
): string {
  const num = (i: number): string => (i === 12 ? L('FREE') : String(claim.card[i] ?? '?'));
  const list = (cells: number[]): string => {
    const [a = '', b = ''] = cells.map(num);
    if (cells.length < 2) return a;
    if (cells.length === 2) return L('{a} and {b}', { a, b });
    return L('{a}, {b} and {n} more', { a, b, n: cells.length - 2 });
  };
  const parts: string[] = [];
  if (claim.red.length > 0) {
    const l = list(claim.red);
    parts.push(
      claim.red.length === 1
        ? L('{list} was never called', { list: l })
        : L('{list} were never called', { list: l }),
    );
  }
  const missed = claim.missing.filter((i) => i !== 12);
  if (missed.length > 0) {
    const l = list(missed);
    parts.push(
      missed.length === 1
        ? L('{list} was missed', { list: l })
        : L('{list} were missed', { list: l }),
    );
  }
  // I-392 B: say which line was checked — the one the player bet on
  const line = claim.cells ? lineName(claim.cells, L) : null;
  const why = parts.join(' · ');
  return line && why ? L('{line}: {why}', { line, why }) : why;
}

/** I-392 B: a checked line in words, or null for a pattern that isn't one line (corners, X…). */
export function lineName(cells: readonly number[], L: Translator): string | null {
  if (cells.length !== 5) return null;
  const rows = cells.map((i) => Math.floor(i / 5));
  const cols = cells.map((i) => i % 5);
  if (rows.every((r) => r === rows[0]))
    return (
      [L('Top row'), L('Row 2'), L('Middle row'), L('Row 4'), L('Bottom row')][rows[0] ?? 0] ?? null
    );
  if (cols.every((c) => c === cols[0]))
    return L('The {letter} column', { letter: 'BINGO'[cols[0] ?? 0] ?? '' });
  return L('The diagonal');
}

/** I-435: what a wrong claim took — the whole card, the wrong daubs and the line, or the wrong daubs. */
export function wipeKind(claim: {
  daubs: number[];
  cells: number[];
  wiped?: number[];
}): 'card' | 'line' | 'wrong' {
  const lost = new Set(claim.wiped ?? claim.daubs);
  const daubed = claim.daubs.filter((i) => i !== 12);
  if (daubed.every((i) => lost.has(i))) return 'card';
  return claim.cells.some((i) => i !== 12 && claim.daubs.includes(i) && lost.has(i)) &&
    claim.cells.every((i) => i === 12 || !claim.daubs.includes(i) || lost.has(i))
    ? 'line'
    : 'wrong';
}

/** A choice made mid-celebration, as the room reads it: who picked what, and when it starts. */
export function pendingLine(
  pending: 'same' | 'blackout' | 'next' | null,
  lastRound: boolean,
  by: string | null,
  L: Translator,
): string | null {
  if (!pending) return null;
  const what =
    pending === 'same'
      ? L('keep going — same pattern')
      : pending === 'blackout'
        ? L('keep going — blackout')
        : lastRound
          ? L('finish the game')
          : L('next round');
  return by
    ? L('{name} picked: {what}. It starts when the celebration is done.', { name: by, what })
    : L('Picked: {what}. It starts when the celebration is done.', { what });
}

/** The caller held by open style menus: "⏸ Sam is" / "Sam and Priya are" / "Sam and 2 others
 *  are" changing card style (the TV's stage and the phones' curtain say it alike). */
export function holdLine(names: string[], L: Translator): string {
  const [name = '', second = ''] = names;
  if (names.length <= 1) return L('⏸ {name} is changing card style…', { name });
  if (names.length === 2)
    return L('⏸ {a} and {b} are changing card style…', { a: name, b: second });
  return L('⏸ {name} and {n} others are changing card style…', { name, n: names.length - 1 });
}

/** I-138 A: a bot answers its own verdict — one line, keyed to what went wrong (never-called
 *  daubs, or a tap before the line was there); B: and a line when it wins. */
function botPool(kind: 'miss' | 'early' | 'win', L: Translator): string[] {
  if (kind === 'win') return [L('beep. gloat.'), L('as computed'), L('humans: 0')];
  if (kind === 'early')
    return [L('I got excited'), L('I counted the FREE twice'), L('my clock is fast')];
  return [
    L('my sensors were dirty'),
    L('I got excited'),
    L('recalculating…'),
    L('that was a rounding error'),
  ];
}

export function botLine(
  claim: { name: string; bot?: boolean; red: number[]; playerId?: string },
  kind: 'miss' | 'win',
  L: Translator,
): string | null {
  if (!claim.bot) return null;
  const pool = botPool(kind === 'win' ? 'win' : claim.red.length > 0 ? 'miss' : 'early', L);
  // I-138 C: a bot's voice is its own — the same id always draws the same line.
  const h = [...(claim.playerId ?? claim.name)].reduce(
    (a, c) => (a * 31 + c.charCodeAt(0)) % 9973,
    7,
  );
  return `${claim.name}: ${pool[h % pool.length]}`;
}
