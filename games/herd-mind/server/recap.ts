// The recap the host writes when a room records (ADR-035, SPEC §2.18): every question with its
// groups and who was in each, the herd and each lonely answer, the sheep's journey, and the final
// scores and awards — read from the `score` states in the history.
import type { GameRecap, RecapContext } from '@partybox/game-sdk';
import { awards } from './scoring';
import type { State } from './types';

/** YYYY-MM-DD (UTC) from a timestamp, by arithmetic: server code never builds a Date. */
export function isoDate(ms: number): string {
  const z = Math.floor(ms / 86_400_000) + 719_468;
  const era = Math.floor(z / 146_097);
  const doe = z - era * 146_097;
  const yoe = Math.floor(
    (doe - Math.floor(doe / 1460) + Math.floor(doe / 36_524) - Math.floor(doe / 146_096)) / 365,
  );
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const day = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const month = mp < 10 ? mp + 3 : mp - 9;
  const year = yoe + era * 400 + (month <= 2 ? 1 : 0);
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function recap(state: State, ctx: RecapContext<State>): GameRecap | null {
  const name = (id: string): string =>
    ctx.players.find((p) => p.id === id)?.name ?? state.players[id]?.name ?? id;
  const started = ctx.history[0]?.at ?? state.phase.startedAt;
  const lines: string[] = [`# Herd Mind · ${isoDate(started)}`, ''];
  lines.push(`Players: ${state.seats.map(name).join(', ')}`);
  lines.push(
    `Settings: ${state.cfg.mode} · first to ${state.cfg.target} · up to ${state.cfg.maxQuestions} questions · ${state.cfg.pace}${state.cfg.spicy ? ' · spicy' : ''}`,
  );
  if (!ctx.results) lines.push('', '_The game was ended early._');
  const journey: string[] = [];
  for (const h of ctx.history) {
    if (h.phase !== 'score') continue;
    const s = h.state;
    const item = s.questions[s.q.n];
    lines.push('', `## Question ${s.q.n + 1} · ${item?.prompt ?? ''}`, '');
    for (const g of s.q.groups ?? []) {
      const tag = g.key === s.q.herd ? ' — **the herd** (+1 each)' : '';
      const typed =
        s.cfg.mode === 'typed'
          ? ` (${g.members.map((id) => `“${g.raw[id] ?? ''}”`).join(', ')})`
          : '';
      lines.push(`- ${g.label}: ${g.members.map(name).join(', ')}${typed}${tag}`);
    }
    if (s.q.outcome === 'tie') lines.push('- No herd: a tie for biggest.');
    if (s.q.outcome === 'scattered') lines.push('- No herd: everyone different.');
    if (s.q.outcome === 'empty') lines.push('- Nobody answered.');
    for (const g of s.q.groups ?? [])
      if (g.members.length === 1)
        lines.push(`- Alone: ${name(g.members[0] ?? '')}, ${g.label.toLowerCase()}`);
    if (s.q.lone !== null && s.q.lone !== s.q.sheepFrom)
      journey.push(
        `Q${s.q.n + 1}: ${s.q.sheepFrom ? name(s.q.sheepFrom) : 'the pasture'} → ${name(s.q.lone)}`,
      );
  }
  lines.push('', '## The Black Sheep', '');
  lines.push(
    ...(journey.length > 0 ? journey.map((j) => `- ${j}`) : ['- Never left the pasture.']),
  );
  if (state.sheep) lines.push(`- Ended with ${name(state.sheep)}.`);
  lines.push('', '## Final scores', '');
  const ranking = ctx.results?.ranking ?? [];
  for (const r of ranking) {
    const flags = [
      state.winners.includes(r.playerId) ? '🏆' : '',
      r.playerId === state.sheep ? '🐑 held the Black Sheep' : '',
    ]
      .filter(Boolean)
      .join(' ');
    lines.push(`${r.rank}. ${name(r.playerId)}: ${r.score}${flags ? ` ${flags}` : ''}`);
  }
  const given = awards(state);
  if (given.length > 0) {
    lines.push('', '## Awards', '');
    for (const a of given) lines.push(`- ${a.title}: ${name(a.playerId)} (${a.description})`);
  }
  return { markdown: `${lines.join('\n')}\n` };
}
