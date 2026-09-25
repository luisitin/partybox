// Recap: "Blind Auction · <date>" — per box its name and odds, every bet, what was inside, who
// called it and the coins afterwards; then the final coins and awards. Read from the states each
// `open` began with (ADR-035 history), so state keeps no per-round log.
import type { GameRecap, RecapContext } from '@partybox/game-sdk';
import { payout, tierOf } from './odds';
import type { State } from './types';

/** YYYY-MM-DD (UTC) from epoch ms, without the Date API (pure server code). */
function date(at: number): string {
  const z = Math.floor(at / 86_400_000) + 719_468;
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

export function recap(state: State, ctx: RecapContext<State>): GameRecap {
  const name = (id: string): string => state.players[id]?.name ?? '—';
  const lines = [`# Blind Auction · ${date(ctx.history[0]?.at ?? state.phase.startedAt)}`, ''];
  lines.push(
    `Bet on the box · ${state.boxes.length} boxes · ${state.cfg.startCoins} coins each${state.cfg.spicy ? ' · spicy' : ''}`,
    '',
  );
  for (const entry of ctx.history) {
    if (entry.phase !== 'open') continue;
    const s = entry.state;
    const round = s.boxes[s.r.idx];
    if (!round) continue;
    const { box, outcome } = round;
    lines.push(
      `## ${s.r.idx + 1}. ${box.icon} ${box.name}${box.grand ? ' (grand box, pays ×2)' : ''}`,
    );
    lines.push(
      `Odds: ${box.options.map((o) => `${o.kind} ${tierOf(o.chance)} ${o.chance}% ×${o.pay}`).join(' · ')}`,
    );
    const bets = s.seats
      .filter((id) => (s.r.bets[id]?.amount ?? 0) > 0)
      .map((id) => {
        const bet = s.r.bets[id];
        const option = bet ? box.options[bet.option] : undefined;
        const won = bet?.option === outcome && option;
        const back = won && bet ? payout(bet.amount, option.pay, box.grand) : 0;
        return `${name(id)} ${bet?.amount ?? 0} on ${option?.kind ?? '?'}${won ? ` → +${back - (bet?.amount ?? 0)}` : ''}`;
      });
    lines.push(`Bets: ${bets.join(', ') || 'nobody bet'}`);
    lines.push(`Inside: ${box.options[outcome]?.kind ?? '?'}`);
    lines.push(`Coins: ${s.seats.map((id) => `${name(id)} ${s.coins[id] ?? 0}`).join(', ')}`, '');
  }
  lines.push('## Final coins');
  for (const row of ctx.results?.ranking ?? [])
    lines.push(`${row.rank}. ${name(row.playerId)} — ${row.score}`);
  const awards = ctx.results?.awards ?? [];
  if (awards.length) {
    lines.push('', '## Awards');
    for (const a of awards) lines.push(`- ${a.title}: ${name(a.playerId)} (${a.description})`);
  }
  return { markdown: `${lines.join('\n')}\n` };
}
