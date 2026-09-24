// The recap (SPEC §10.21): "Nightfall · <date>" — the role list and who had which role; night by
// night, every night action revealed now that the game is over; day by day, the board, the votes
// and who went out; the winner and why; the awards. The night reveals are the best part to read.
import type { GameRecap, RecapContext } from '@partybox/game-sdk';
import { flavourOf } from './content';
import { roleOf } from './rules';
import { awardsOf } from './scoring';
import { sideText } from './views-common';
import type { State } from './types';

/** YYYY-MM-DD from epoch ms, without a clock (Howard Hinnant's civil-from-days). */
export function isoDay(ms: number): string {
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
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

const WHY: Record<string, string> = {
  jester: 'the village voted the jester out',
  wolvesGone: 'every wolf was found',
  wolvesEqual: 'the wolves equalled the rest',
  maxDays: 'the wolves survived the last day',
};

export function recap(state: State, ctx: RecapContext<State>): GameRecap | null {
  const f = flavourOf(state.cfg.flavour);
  const name = (id: string): string =>
    ctx.players.find((p) => p.id === id)?.name ?? state.players[id]?.name ?? id;
  const role = (id: string): string => {
    const r = roleOf(state, id);
    return r ? `${f.roles[r].icon} ${f.roles[r].name}` : '?';
  };
  const started = ctx.history[0]?.at ?? state.phase.startedAt;
  const lines: string[] = [`# Nightfall · ${isoDay(started)}`, ''];
  lines.push(`Flavour: ${state.cfg.flavour} · ${state.seats.length} players`, '', '## Roles', '');
  for (const id of state.seats) lines.push(`- ${name(id)}: ${role(id)}`);
  lines.push('');
  if (!ctx.results) lines.push('_The game was ended early._', '');
  for (const n of state.nights) {
    lines.push(`## Night ${n.night}`, '');
    for (const [by, target] of Object.entries(n.picks))
      lines.push(`- ${name(by)} (${role(by)}) → ${name(target)}`);
    const news =
      n.victim === null
        ? 'no kill'
        : n.saved
          ? `${name(n.victim)} attacked and saved`
          : `${name(n.victim)} died`;
    lines.push(`- **Dawn:** ${news}`, '');
    const d = state.days.find((x) => x.day === n.night);
    if (!d) continue;
    lines.push(`## Day ${d.day}`, '');
    for (const p of d.board) lines.push(`> ${name(p.by)}: ${p.text}`);
    if (d.board.length > 0) lines.push('');
    for (const b of d.ballots)
      lines.push(`- ${name(b.by)} voted ${b.target === 'none' ? 'no one' : name(b.target)}`);
    lines.push(`- **Out:** ${d.out ? `${name(d.out)} (${role(d.out)})` : 'nobody'}`, '');
  }
  if (state.winner)
    lines.push(
      `## ${sideText(state.cfg.flavour, state.winner)}`,
      '',
      `Because ${WHY[state.reason ?? ''] ?? '…'}.`,
      '',
    );
  const awards = awardsOf(state);
  if (awards.length > 0) {
    lines.push('## Awards', '');
    for (const a of awards) lines.push(`- ${a.title}: ${name(a.playerId)} — ${a.description}`);
  }
  return { markdown: `${lines.join('\n')}\n` };
}
