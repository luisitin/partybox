// The phone's one-line standing under a result or the final board.
// "#1 of 12 · 0 points" while every score is still 0 read as a lead nobody had earned (loop #428 —
// a 12-player round Rando took); with the board level the line says so instead.

export function rankLine(
  view: { myRank: number; myScore: number; standings: readonly { score: number }[] },
  final: boolean,
): string {
  const level = view.standings.length > 1 && view.standings.every((r) => r.score === 0);
  if (level) return final ? 'Final: everyone on 0' : 'No points yet';
  const points = `${view.myScore} ${view.myScore === 1 ? 'point' : 'points'}`;
  return `${final ? 'Final: ' : ''}#${view.myRank} of ${view.standings.length} · ${points}`;
}
