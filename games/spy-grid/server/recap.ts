// The recap (SPEC §9.23, ADR-035): per round the board as a 5×5 table with every identity, each
// clue with its spymaster, what flipped and who pointed first, and the result; then the round wins
// and the awards. Pure; the win-phase states in `ctx.history` hold each round's full key.
import type { GameRecap, RecapContext } from '@partybox/game-sdk';
import type { Kind, State } from './types';

const ICON: Record<Kind, string> = { sun: '▲', moon: '●', bystander: '🚶', assassin: '💀' };
const REASON: Record<string, string> = {
  agents: 'every agent found',
  assassin: 'the assassin was found',
  cap: 'out of turns',
  idle: "nobody's talking",
  forfeit: 'a team left',
  clues: 'out of clues',
};

/** YYYY-MM-DD (UTC) from epoch ms without `Date` (banned in game servers): civil-from-days. */
export function date(at: number): string {
  const z = Math.floor(at / 86_400_000) + 719_468;
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

function winnerText(s: State): string {
  if (s.mode === 'coop') return s.winner === 'sun' ? 'Mission complete' : 'Mission failed';
  if (s.winner === 'draw' || s.winner === null) return 'Draw';
  return s.winner === 'sun' ? '▲ Sun wins' : '● Moon wins';
}

export function recap(state: State, ctx: RecapContext<State>): GameRecap {
  const name = (id: string | null): string => (id ? (state.players[id]?.name ?? '?') : '—');
  const lines = [`# Spy Grid · ${date(ctx.history[0]?.at ?? state.phase.startedAt)}`, ''];
  const wins = ctx.history.filter((h) => h.phase === 'win').map((h) => h.state);
  for (const s of wins) {
    lines.push(`## Round ${s.round} — ${winnerText(s)} (${REASON[s.reason ?? ''] ?? '—'})`, '');
    lines.push('| | 1 | 2 | 3 | 4 | 5 |', '|---|---|---|---|---|---|');
    for (let r = 0; r < 5; r++) {
      const row = s.board
        .slice(r * 5, r * 5 + 5)
        .map((c, i) => `${ICON[s.key[r * 5 + i] ?? 'bystander']} ${c.word}`);
      lines.push(`| ${'ABCDE'[r]} | ${row.join(' | ')} |`);
    }
    lines.push('');
    for (const h of state.history.filter((e) => e.round === s.round)) {
      const flips = h.flips
        .map((f) => `${ICON[f.kind]} ${s.board[f.card]?.word ?? '?'} (first: ${name(f.first)})`)
        .join(', ');
      lines.push(
        `- ${ICON[h.team]} **${h.word} · ${h.number}** by ${name(h.spymaster)} → ${flips || 'nothing flipped'}`,
      );
    }
    lines.push('');
  }
  if (state.mode === 'teams')
    lines.push(`**Round wins:** ▲ Sun ${state.roundWins.sun} · ● Moon ${state.roundWins.moon}`, '');
  const awards = ctx.results?.awards ?? [];
  if (awards.length > 0) {
    lines.push('## Awards', '');
    for (const a of awards) lines.push(`- ${a.title}: ${name(a.playerId)} — ${a.description}`);
  }
  return { markdown: `${lines.join('\n')}\n` };
}
