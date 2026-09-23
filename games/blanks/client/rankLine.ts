// The phone's one-line standing under a result or the final board.
// "#1 of 12 · 0 points" while every score is still 0 read as a lead nobody had earned (loop #428 —
// a 12-player round Rando took); with the board level the line says so instead.
import { fill } from '@partybox/game-sdk/ui';
import type { Translator } from '@partybox/game-sdk/ui';

/** The English, for a caller with no screen's translator (the unit tests). */
const ENGLISH: Translator = Object.assign(
  (en: string, vars?: Readonly<Record<string, string | number>>): string => fill(en, vars),
  { sent: (text: string): string => text, lang: 'en' as const },
);

export function rankLine(
  view: { myRank: number; myScore: number; standings: readonly { score: number }[] },
  final: boolean,
  L: Translator = ENGLISH,
): string {
  const level = view.standings.length > 1 && view.standings.every((r) => r.score === 0);
  if (level) return final ? L('Final: everyone on 0') : L('No points yet');
  const vars = { rank: view.myRank, count: view.standings.length, score: view.myScore };
  if (final)
    return view.myScore === 1
      ? L('Final: #{rank} of {count} · 1 point', vars)
      : L('Final: #{rank} of {count} · {score} points', vars);
  return view.myScore === 1
    ? L('#{rank} of {count} · 1 point', vars)
    : L('#{rank} of {count} · {score} points', vars);
}
