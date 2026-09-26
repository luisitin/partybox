// "Echo · <date>" (§7.18): for each word the guesser, every clue (survived or echoed, with its
// author), the guess and the outcome; then the score, the rating and the awards. The clues come
// from each `result` state in the history; the outcome from the final turns (a VIP "That counts"
// lands after the result began).
import type { GameRecap, RecapContext } from '@partybox/game-sdk';
import { RATINGS, piles, ratingOf } from './deck';
import { textOf } from './echoes';
import type { State } from './types';

/** UTC calendar date of an epoch-ms instant (no `Date` in game code): Hinnant's civil_from_days. */
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

const MARK = { right: '✓', wrong: '✗', pass: 'PASS' } as const;

export function recap(state: State, ctx: RecapContext<State>): GameRecap | null {
  const name = (id: string): string =>
    ctx.players.find((p) => p.id === id)?.name ?? state.players[id]?.name ?? id;
  const at = ctx.history[0]?.at ?? state.phase.startedAt;
  const lines = [`# Echo · ${isoDate(at)}`, ''];
  lines.push(`Players: ${ctx.players.map((p) => p.name).join(', ')}`);
  lines.push(
    `Settings: ${state.cfg.words} words · ${state.cfg.clueSeconds} s clues · ${state.cfg.guessSeconds} s guess · check ${state.cfg.check ? 'on' : 'off'} · spicy ${state.cfg.spicy ? 'on' : 'off'}`,
  );
  if (!ctx.results) lines.push('', '_The game was ended early._');
  lines.push('');
  const results = ctx.history.filter((h) => h.phase === 'result').map((h) => h.state);
  state.turns.forEach((turn, n) => {
    const st = results.find((s) => s.w.word.id === turn.word && s.turns.length === n + 1);
    const word = state.deck.find((w) => w.id === turn.word)?.answer ?? turn.word;
    lines.push(`## ${n + 1}. ${word} — ${name(turn.guesser)} guessing`, '');
    for (const g of st?.w.groups ?? [])
      for (const r of g.refs)
        lines.push(
          `- ${g.echo ? '~~' : ''}${textOf(st as State, r)}${g.echo ? '~~ (echo)' : ''} — ${name(r.by)}`,
        );
    const guess = st?.w.guess?.text ?? '';
    lines.push(
      '',
      `Guess: ${guess ? `“${guess}”` : '—'} ${MARK[turn.result]}${turn.byVip ? ' (counted by the VIP)' : ''}`,
    );
    if (turn.burned)
      lines.push(
        `…and it burned the next word (${state.deck.find((w) => w.id === turn.burned)?.answer ?? ''}).`,
      );
    if (turn.unwon)
      lines.push(
        `…and it cost a won word (${state.deck.find((w) => w.id === turn.unwon)?.answer ?? ''}).`,
      );
    lines.push('');
  });
  const won = piles(state).won.length;
  const rating = RATINGS.find((r) => r.id === ratingOf(won, state.deck.length));
  lines.push(
    '## Score',
    '',
    `${won} of ${state.deck.length} · ${rating?.icon ?? ''} ${rating?.label ?? ''}`,
    '',
  );
  if (ctx.results?.awards.length) {
    lines.push('## Awards', '');
    for (const a of ctx.results.awards)
      lines.push(`- **${a.title}** — ${name(a.playerId)} (${a.description})`);
    lines.push('');
  }
  return { markdown: lines.join('\n') };
}
