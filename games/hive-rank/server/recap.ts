// The recap the host writes when a room records (ADR-035; SPEC §6.16): "Hive Rank · <date>", then
// each question with the hive's order, every player's order and points, the round's Queen Bees,
// and the awards. Read from the `score` (and short `hive`) states in the history, because the live
// state keeps only the round on stage.
import type { GameRecap, RecapContext } from '@partybox/game-sdk';
import type { State } from './types';

/** "2026-09-24" (UTC) from epoch ms, without `Date` (server code stays clock-free). */
export function isoDay(ms: number): string {
  const days = Math.floor(ms / 86_400_000);
  // Howard Hinnant's civil_from_days.
  const z = days + 719_468;
  const era = Math.floor(z / 146_097);
  const doe = z - era * 146_097;
  const yoe = Math.floor(
    (doe - Math.floor(doe / 1460) + Math.floor(doe / 36_524) - Math.floor(doe / 146_096)) / 365,
  );
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const d = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const m = mp < 10 ? mp + 3 : mp - 9;
  const y = yoe + era * 400 + (m <= 2 ? 1 : 0);
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function recap(state: State, ctx: RecapContext<State>): GameRecap | null {
  const name = (id: string): string =>
    ctx.players.find((p) => p.id === id)?.name ?? state.players[id]?.name ?? id;
  const lines: string[] = [];
  lines.push(`# Hive Rank · ${isoDay(ctx.history[0]?.at ?? state.phase.startedAt)}`, '');
  lines.push(`Players: ${ctx.players.map((p) => p.name).join(', ')}`);
  lines.push(
    `Settings: ${state.settings.rounds} rounds · ${state.settings.rankSeconds} s to rank · ${state.settings.spicy ? 'spicy on' : 'family'} · reader ${state.settings.reader}`,
  );
  if (!ctx.results) lines.push('', '_The game was ended early._');
  lines.push('');
  const seen = new Set<number>();
  for (const h of ctx.history) {
    const st = h.state;
    const q = st.q;
    const shortRound = h.phase === 'hive' && q.short;
    if ((h.phase !== 'score' && !shortRound) || seen.has(q.n)) continue;
    seen.add(q.n);
    const item = st.questions[q.n - 1];
    if (!item) continue;
    const label = (id: string): string => item.items.find((i) => i.id === id)?.label ?? id;
    lines.push(`## Round ${q.n} · ${item.prompt}`, '');
    if (shortRound || !q.hive) {
      lines.push('Not enough bees! (fewer than two orders — nothing scored)', '');
      continue;
    }
    lines.push(`**The hive:** ${q.hive.map((id, i) => `${i + 1}. ${label(id)}`).join(' · ')}`, '');
    for (const p of ctx.players) {
      const order = q.orders[p.id];
      const d = q.delta[p.id];
      if (!order || !d) {
        lines.push(`- ${p.name}: no order → 0`);
        continue;
      }
      const tag = d.perfect ? ' · PERFECT' : '';
      lines.push(
        `- ${p.name}: ${order.map(label).join(' > ')} → +${d.pts} (${d.exact} exact, ${d.near} one off${tag})`,
      );
    }
    if (q.queens.length) lines.push('', `👑 Queen Bee: ${q.queens.map(name).join(', ')}`);
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
