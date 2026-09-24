// Recap (SPEC §8.19): "Blind Auction · <date>" — per lot its name and hint, every bid, the winner and
// price, the outcome and the coins afterwards; then the final coins and awards. Read from the
// states each `flip` began with (ADR-035 history), so state keeps no per-lot log.
import type { GameRecap, RecapContext } from '@partybox/game-sdk';
import { hintsOf } from './hints';
import type { Hint } from './hints';
import type { State } from './types';

function hintText(h: Hint): string {
  const what =
    h.type === 'gain'
      ? `💰 +${h.n}`
      : h.type === 'lose'
        ? `💀 −${h.n}`
        : h.type === 'steal'
          ? `🦝 steal ${h.n}%`
          : h.type === 'swap'
            ? '🔄 swap'
            : h.type === 'double'
              ? '✖️2 double'
              : h.type === 'refund'
                ? '↩️ refund'
                : '🕳️ dud';
  return `${h.tier} ${what}`;
}

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
  const name = (id: string | null): string => (id && state.players[id]?.name) || '—';
  const lines = [`# Blind Auction · ${date(ctx.history[0]?.at ?? state.phase.startedAt)}`, ''];
  const mode = state.cfg.live ? 'Live' : 'Sealed';
  lines.push(
    `${mode} bids · ${state.lots.length} lots · ${state.cfg.startCoins} coins each · chaos ${state.cfg.chaos}`,
    '',
  );
  for (const entry of ctx.history) {
    if (entry.phase !== 'flip') continue;
    const s = entry.state;
    const lot = s.lots[s.l.idx];
    if (!lot) continue;
    const { item } = lot;
    const outcome = item.outcomes[lot.outcome];
    lines.push(`## ${s.l.idx + 1}. ${item.icon} ${item.name}${item.grand ? ' (Grand Lot)' : ''}`);
    lines.push(`Hint: ${hintsOf(item.outcomes).map(hintText).join(' · ')}`);
    const bids = s.cfg.live
      ? s.l.high
        ? `final bid ${s.l.high.amount} by ${name(s.l.high.by)}`
        : 'no bids'
      : s.seats.map((id) => `${name(id)} ${s.l.bids[id] ?? '—'}`).join(', ');
    lines.push(`Bids: ${bids}`);
    lines.push(
      s.l.winner
        ? `Sold to ${name(s.l.winner)} for ${s.l.price}${s.l.tie ? ' (tie: fewer coins won)' : ''}`
        : 'No takers',
    );
    const effect = s.l.effect;
    const other = effect?.other ? ` (${name(effect.other)})` : '';
    lines.push(
      `Outcome: ${outcome ? hintText(hintsOf([outcome])[0] as Hint) : '?'} → ${effect?.kind ?? 'none'} ${effect?.amount ?? 0}${other}`,
    );
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
