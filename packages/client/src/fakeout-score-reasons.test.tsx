import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TvScores } from '../../../games/fake-out/client/TvScores';

describe('Fake-Out TV score explanations', () => {
  it('keeps a reason chip for every scorer when more than four players score', () => {
    const players = Array.from({ length: 12 }, (_, i) => ({
      id: `p${i + 1}`,
      name: `Player ${i + 1}`,
      avatarId: 'ghost',
      connected: true,
    }));
    const standings = players.map((player, i) => ({
      playerId: player.id,
      score: 1000,
      rank: i + 1,
      delta: 1000,
      why: [{ k: 'truth' as const, pts: 1000 }],
    }));
    const view = {
      n: 2,
      total: 3,
      finalNext: true,
      players,
      standings,
    } as unknown as Parameters<typeof TvScores>[0]['view'];
    const html = renderToStaticMarkup(<TvScores view={view} />);
    const explanations =
      html.split('aria-label="How the points came">')[1]?.split('</ul>')[0] ?? '';

    expect(explanations.match(/<li\b/g) ?? []).toHaveLength(12);
    expect(explanations.match(/\+1000 truth/g) ?? []).toHaveLength(12);
  });
});
