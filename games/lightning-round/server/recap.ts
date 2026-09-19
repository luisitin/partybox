// The recap the host writes when a room records (ADR-035): every question with its choices and
// answer, each player's pick, time and points, the wagers on the final, and the standings — read
// from the reveal states in the history, because the live state keeps only the current question.
import type { GameRecap, RecapContext } from '@partybox/game-sdk';
import { categoryLabel, drawLabel, questionById } from './content';
import { labelOf } from '../content/schema';
import type { State } from './types';
import { isFinalIndex } from './types';

export function recap(state: State, ctx: RecapContext<State>): GameRecap | null {
  const name = (id: string): string =>
    ctx.players.find((p) => p.id === id)?.name ?? state.players[id]?.name ?? id;
  const lines: string[] = [];
  lines.push('# Lightning Round — recap', '');
  lines.push(`Players: ${ctx.players.map((p) => p.name).join(', ')}`);
  lines.push(
    `Settings: ${state.settings.questions} questions · ${state.settings.answerSeconds} s each · ${drawLabel(state.drawnFrom, state.drawnSubs ?? [])}`,
  );
  if (!ctx.results) lines.push('', '_The game was ended early._');
  lines.push('');
  const seen = new Set<number>();
  for (const h of ctx.history) {
    if (h.phase !== 'reveal') continue;
    const st = h.state;
    if (seen.has(st.index)) continue;
    seen.add(st.index);
    const id = st.questionIds[st.index];
    const q = id ? questionById(id) : undefined;
    if (!q) continue;
    const final = isFinalIndex(st, st.index);
    lines.push(
      `## ${final ? 'Final question' : `Question ${st.index + 1}`} · ${categoryLabel(q.category)} · ${labelOf(q.subcategory)} · ${q.difficulty}`,
      '',
      `**${q.question}**`,
      '',
    );
    q.choices.forEach((c, i) =>
      lines.push(`- ${'ABCD'[i]}. ${c}${i === q.answerIndex ? ' ✓' : ''}`),
    );
    lines.push('');
    for (const p of ctx.players) {
      const pick = st.picks[p.id];
      const delta = st.lastDelta[p.id] ?? 0;
      const wager = final ? st.wagers[p.id] : undefined;
      const bet = wager ? ` · bet ${wager}` : '';
      if (!pick) lines.push(`- ${p.name}: no answer${bet} → ${delta >= 0 ? '+' : ''}${delta}`);
      else
        lines.push(
          `- ${p.name}: ${'ABCD'[pick.index]} ${pick.index === q.answerIndex ? '✓' : '✗'} in ${(pick.elapsedMs / 1000).toFixed(1)} s${bet} → ${delta >= 0 ? '+' : ''}${delta}`,
        );
    }
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
