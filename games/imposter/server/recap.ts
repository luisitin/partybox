// Recap (SPEC §1.17): "Imposter · <date>" — per round the category, the word, the imposters,
// every player's clues, the votes, who was accused, the last-chance guess and the points; then
// final scores and awards. Read from the `scores` states in history (the round is complete there).
import type { GameRecap, RecapContext } from '@partybox/game-sdk';
import { awards } from './scoring';
import type { State } from './types';

/** YYYY-MM-DD (UTC) from epoch ms, by arithmetic — server code never constructs a clock. */
function day(ms: number): string {
  const z = Math.floor(ms / 86_400_000) + 719_468;
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
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${y}-${pad(m)}-${pad(d)}`;
}

export function recap(state: State, ctx: RecapContext<State>): GameRecap {
  const name = (id: string): string => state.players[id]?.name ?? id;
  const names = (ids: readonly string[]): string => (ids.length ? ids.map(name).join(', ') : '—');
  const first = ctx.history[0]?.at ?? state.phase.startedAt;
  const lines = [`# Imposter · ${day(first)}`, ''];
  for (const h of ctx.history.filter((e) => e.phase === 'scores')) {
    const s = h.state;
    const r = s.round;
    const word = s.words[r.w];
    lines.push(`## Round ${r.n}: ${word?.label ?? '?'} · **${word?.answer ?? '?'}**`, '');
    lines.push(
      `- Imposter${r.imposters.length > 1 ? 's' : ''}: ${names(r.imposters)}${r.void ? ' (left: round void)' : ''}`,
    );
    for (const id of s.seats) {
      const clues = r.clues.filter((c) => c.by === id).map((c) => c.text);
      const vote = r.votes[id] ? ` → voted ${names(r.votes[id] ?? [])}` : '';
      lines.push(`- ${name(id)}: ${clues.length ? clues.join(' · ') : '—'}${vote}`);
    }
    if (r.runoff) lines.push(`- Runoff between ${names(r.runoff.candidates)}`);
    lines.push(`- Accused: ${names(r.accused)}`);
    for (const [id, g] of Object.entries(r.guesses))
      lines.push(
        `- ${name(id)} guessed "${g.said}": ${g.ok ? 'stolen' : 'no luck'}${g.byVip ? ' (counted by the VIP)' : ''}`,
      );
    const pts = s.seats.map((id) => `${name(id)} +${r.delta[id]?.pts ?? 0}`).join(', ');
    lines.push(`- Points: ${pts}`, '');
  }
  lines.push('## Final scores', '');
  const ranking = ctx.results?.ranking ?? [];
  for (const row of ranking) lines.push(`${row.rank}. ${name(row.playerId)}: ${row.score}`);
  if (!ctx.results) lines.push('(ended early)');
  const got = awards(state);
  if (got.length) {
    lines.push('', '## Awards', '');
    for (const a of got) lines.push(`- ${a.title}: ${name(a.playerId)}`);
  }
  return { markdown: `${lines.join('\n')}\n` };
}
