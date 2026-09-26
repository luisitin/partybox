// The last row of a tie kept neither its bracket's end nor the winner's gold outline: its classes
// ran together ("…tieEnd" + "top" → one unknown class). tune-in's three-way tie showed it: the
// third winner had a trophy but no outline.
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Scoreboard } from '@partybox/game-sdk/ui';

describe('a tie on the scoreboard', () => {
  it('every tied winner keeps its own classes', () => {
    const row = (playerId: string, score: number, rank: number) => ({ playerId, name: playerId, avatarId: 'fox', score, rank, connected: true }); // prettier-ignore
    const html = renderToStaticMarkup(
      <Scoreboard rows={[row('A', 10, 1), row('B', 10, 1), row('C', 10, 1), row('D', 2, 4)]} />,
    );
    const classes = [...html.matchAll(/<li[^>]*class="([^"]*)"/g)].map((m) => m[1] ?? '');
    const tokens = classes.map((c) => c.split(/\s+/).filter(Boolean));
    // the three winners share one class the loser lacks (the gold outline), and no class token is
    // two glued together
    const winnerOnly = (tokens[0] ?? []).filter((c) => !(tokens[3] ?? []).includes(c));
    expect(winnerOnly.length).toBeGreaterThan(0);
    for (const t of tokens.slice(0, 3)) for (const c of winnerOnly.filter((x) => /top/i.test(x) && !/tie/i.test(x))) expect(t).toContain(c); // prettier-ignore
    expect(tokens[2]?.some((c) => /tieEnd.*top|top.*tieEnd/i.test(c))).toBe(false);
  });
});
