// Recap (spec §5.19, ADR-035): "Tune In · <date>" — each round's ends, psychic, clue, target, the
// dials (or the needle and the call) and the points; the team totals or co-op's rating; awards.
// Pure: the date comes from the first recorded phase, formatted without the Date object.
import type { GameRecap, RecapContext } from '@partybox/game-sdk';
import { revealFacts } from './view-common';
import { awardsFor, coopRating } from './scoring';
import type { State } from './types';

const RATING = {
  static: '📺 Static',
  tuning: '📻 Tuning in',
  clear: '📡 Crystal clear',
  meld: '🧠 Mind meld',
};

/** yyyy-mm-dd (UTC) from epoch ms, by the civil-from-days algorithm. */
export function isoDate(ms: number): string {
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
  const name = (id: string): string => ctx.players.find((p) => p.id === id)?.name ?? '?';
  const lines = [`# Tune In · ${isoDate(ctx.history[0]?.at ?? state.phase.startedAt)}`, ''];
  lines.push(`Mode: ${state.mode}. Target size: ${state.cfg.targetSize}.`, '');
  const seen = new Set<number>();
  for (const { phase, state: s } of ctx.history) {
    if (phase !== 'reveal' || seen.has(s.turn.n)) continue;
    seen.add(s.turn.n);
    const spectrum = s.spectra[s.turn.spectrum];
    const team = s.turn.team ? ` (${s.turn.team}${s.turn.catchUp ? ', catch-up' : ''})` : '';
    lines.push(`## Round ${s.turn.n} · ${spectrum?.left ?? '?'} ↔ ${spectrum?.right ?? '?'}`);
    lines.push(`Psychic: ${s.turn.psychic ? name(s.turn.psychic) : '—'}${team}`);
    if (s.turn.void) {
      lines.push('No signal: no clue, nobody scored.', '');
      continue;
    }
    const facts = revealFacts(s);
    lines.push(`Clue: "${s.turn.clue ?? ''}" · target ${s.turn.target}`);
    for (const d of facts.revealDials) lines.push(`- ${name(d.id)}: ${d.pos} → ${d.pts}`);
    if (facts.needle !== null) lines.push(`Needle ${facts.needle} → ${facts.needlePts ?? 0}`);
    if (facts.revealCalls)
      lines.push(
        `Call: ${facts.revealCalls.side ?? 'none'} (${facts.revealCalls.left}–${facts.revealCalls.right})${facts.revealCalls.scored ? ' +1' : ''}`,
      );
    if (s.mode === 'solo')
      lines.push(`Psychic scored ${facts.psychicPts}${facts.perfect ? ' (perfect tune)' : ''}`);
    lines.push('');
  }
  if (state.mode === 'teams') lines.push(`**Sun ${state.team.sun} · Moon ${state.team.moon}**`, '');
  if (state.mode === 'coop')
    lines.push(
      `**Group ${state.coopTotal} / ${state.played * 4} · ${RATING[coopRating(state.coopTotal, state.played)]}**`,
      '',
    );
  const awards = awardsFor(state);
  if (awards.length > 0) {
    lines.push('## Awards');
    for (const a of awards) lines.push(`- ${a.title}: ${name(a.playerId)} — ${a.description}`);
  }
  return { markdown: `${lines.join('\n')}\n` };
}
