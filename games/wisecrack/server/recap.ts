// The recap the host writes when a room records (ADR-035): every round's prompts with both answers,
// who wrote them, who voted for what and the points — read from the reveal states in the history,
// because the live state keeps only the current round.
import type { GameRecap, RecapContext } from '@partybox/game-sdk';
import { promptText } from './content';
import type { State } from './types';

export function recap(state: State, ctx: RecapContext<State>): GameRecap | null {
  const name = (id: string): string =>
    ctx.players.find((p) => p.id === id)?.name ?? state.players[id]?.name ?? id;
  const lines: string[] = [];
  lines.push('# Wisecrack — recap', '');
  lines.push(`Players: ${ctx.players.map((p) => p.name).join(', ')}`);
  lines.push(
    `Settings: ${state.settings.rounds} rounds · ${state.settings.answerSeconds} s to write · spicy ${state.settings.spicy ? 'on' : 'off'}`,
  );
  if (!ctx.results) lines.push('', '_The game was ended early._');
  lines.push('');
  // One entry per (round, prompt) — the reveal state of each matchup holds its votes.
  const seen = new Set<string>();
  let round = 0;
  for (const h of ctx.history) {
    if (h.phase !== 'reveal') continue;
    const st = h.state;
    const prompt = st.prompts[st.promptIndex];
    if (!prompt) continue;
    const key = `${st.round}:${prompt.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (st.round !== round) {
      round = st.round;
      lines.push(`## Round ${round}`, '');
    }
    const answers = st.answers[prompt.id] ?? {};
    const votes = st.votes[prompt.id] ?? {};
    const tally = (author: string): string[] =>
      Object.entries(votes)
        .filter(([, votedFor]) => votedFor === author)
        .map(([voter]) => name(voter));
    lines.push(`### ${prompt.text || promptText(prompt.id)}`, '');
    prompt.authors.forEach((author, slot) => {
      const text = answers[author];
      const voters = tally(author);
      lines.push(
        `- ${'AB'[slot]}. ${text ? `“${text}”` : '_(no answer)_'} — **${name(author)}** · ${voters.length} vote${voters.length === 1 ? '' : 's'}${voters.length ? ` (${voters.join(', ')})` : ''}`,
      );
    });
    lines.push('');
  }
  if (ctx.results) {
    lines.push('## Final scores', '');
    for (const r of ctx.results.ranking) lines.push(`${r.rank}. ${name(r.playerId)} — ${r.score}`);
    if (ctx.results.awards.length) {
      lines.push('', '## Awards', '');
      for (const a of ctx.results.awards)
        lines.push(`- **${a.title}** — ${name(a.playerId)} (${a.description})`);
    }
    lines.push('');
  }
  return { markdown: lines.join('\n') };
}
