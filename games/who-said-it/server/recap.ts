// The recap the host saves (SPEC §4.17, ADR-035): each prompt, every answer with its author and who
// guessed right, the "Knows You Best" pairs, final scores and awards. Pure.
import type { GameRecap, RecapContext } from '@partybox/game-sdk';
import { awardsFor, knowsBest, standings } from './scoring';
import type { State } from './types';

/** YYYY-MM-DD (UTC) of a timestamp, without the Date object (server code is clock-free). */
export function isoDay(ms: number): string {
  const days = Math.floor(ms / 86_400_000) + 719_468;
  const era = Math.floor(days / 146_097);
  const doe = days - era * 146_097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36_524) - Math.floor(doe / 146_096)) / 365); // prettier-ignore
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const d = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const m = mp < 10 ? mp + 3 : mp - 9;
  const y = yoe + era * 400 + (m <= 2 ? 1 : 0);
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function recap(state: State, ctx: RecapContext<State>): GameRecap {
  const name = (id: string): string => state.players[id]?.name ?? '?';
  const list = (ids: readonly string[]): string => (ids.length ? ids.map(name).join(', ') : 'nobody'); // prettier-ignore
  const day = isoDay(state.phase.startedAt);
  const lines = [`# Who Said It · ${day}`, ''];
  if (!ctx.results) lines.push('_Ended early by the VIP._', '');
  state.prompts.forEach((item, n) => {
    const cards = state.log.filter((c) => c.n === n);
    if (n > state.p.n) return;
    lines.push(`## ${n + 1}. ${item.prompt}`, '');
    if (cards.length === 0) lines.push('_Nobody answered._');
    for (const c of cards)
      lines.push(`- "${c.text}" — **${list(c.authors)}** · guessed right: ${list(c.right)}`);
    lines.push('');
  });
  const pairs = knowsBest(state);
  if (pairs.length) {
    lines.push('## Knows you best', '');
    for (const p of pairs)
      lines.push(`- ${name(p.guesser)} knows ${name(p.author)} best (${p.right} of ${p.of})`);
    lines.push('');
  }
  lines.push('## Final scores', '');
  for (const row of standings(state))
    lines.push(`${row.rank}. ${name(row.playerId)} — ${row.score}`);
  const awards = awardsFor(state);
  if (awards.length) {
    lines.push('', '## Awards', '');
    for (const a of awards) lines.push(`- ${a.title}: ${name(a.playerId)} (${a.description})`);
  }
  return { markdown: `${lines.join('\n')}\n` };
}
