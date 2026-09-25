// The recap the host writes when a room records (SPEC §3.18): each fact with its truth, every lie
// with its authors and who fell for it, likes and points, the final scores and awards, and a hall
// of fame of the best-liked lies. Read from the reveal states in the history (the live state keeps
// only the question on stage).
import type { GameRecap, RecapContext } from '@partybox/game-sdk';
import type { State } from './types';

/** YYYY-MM-DD (UTC) from epoch ms, by civil-from-days arithmetic (no Date in game servers). */
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
  const names = (ids: readonly string[]): string => ids.map(name).join(', ');
  const started = ctx.history[0]?.at ?? state.phase.startedAt;
  const lines: string[] = [`# Fake-Out · ${isoDate(started)}`, ''];
  lines.push(`Players: ${ctx.players.map((p) => p.name).join(', ')}`);
  lines.push(
    `Settings: ${state.cfg.questions} questions · ${state.cfg.lieSeconds} s to lie · ${state.cfg.pickSeconds} s to pick · final double ${state.cfg.finalDouble ? 'on' : 'off'} · spicy ${state.cfg.spicy ? 'on' : 'off'} · reader ${state.cfg.reader}`,
  );
  if (!ctx.results) lines.push('', '_The game was ended early._');
  const fame: { likes: number; display: string; authors: string[]; n: number }[] = [];
  const seen = new Set<number>();
  for (const h of ctx.history) {
    if (h.phase !== 'reveal' || seen.has(h.state.q.n)) continue;
    const { q } = h.state;
    seen.add(q.n);
    lines.push('', `## ${q.n}. ${q.final ? 'FINAL FAKE-OUT · ' : ''}${q.item.category}`, '');
    lines.push(`> ${q.item.fact.replace('___', `**${q.item.truth.answer.toUpperCase()}**`)}`);
    lines.push(`> _Source: ${q.item.source}_`, '');
    for (const o of q.options ?? []) {
      const pickers = h.state.seats.filter((p) => q.picks[p] === o.id);
      const likes = Object.values(q.likes).filter((ids) => ids.includes(o.id)).length;
      const who = o.truth ? 'THE TRUTH' : o.house ? 'a PartyBox lie' : `lie by ${names(o.authors)}`;
      const fell = pickers.length ? ` · picked by ${names(pickers)}` : ' · nobody picked it';
      lines.push(`- **${o.display}** (${who})${fell}${likes ? ` · 👍 ${likes}` : ''}`);
      if (!o.truth && !o.house && likes > 0)
        fame.push({ likes, display: o.display, authors: o.authors, n: q.n });
    }
    const pts = Object.entries(q.delta)
      .filter(([, d]) => d.pts > 0)
      .map(([p, d]) => `${name(p)} +${d.pts}`);
    if (pts.length) lines.push('', `Points: ${pts.join(' · ')}`);
    if (q.truthTyped.length) lines.push(`Typed the truth by accident: ${names(q.truthTyped)}`);
  }
  if (fame.length) {
    lines.push('', '## Hall of fame', '');
    fame
      .sort((a, b) => b.likes - a.likes || a.n - b.n)
      .slice(0, 5)
      .forEach((f) =>
        lines.push(`- 👍 ${f.likes} · **${f.display}** by ${names(f.authors)} (Q${f.n})`),
      );
  }
  if (ctx.results) {
    lines.push('', '## Final scores', '');
    for (const r of ctx.results.ranking) lines.push(`${r.rank}. ${name(r.playerId)} — ${r.score}`);
    if (ctx.results.awards.length) {
      lines.push('', '## Awards', '');
      for (const a of ctx.results.awards)
        lines.push(`- **${a.title}** — ${name(a.playerId)} (${a.description})`);
    }
  }
  lines.push('');
  return { markdown: lines.join('\n') };
}
