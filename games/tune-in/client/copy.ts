// Sentences both surfaces build from a view: the round line, the verdict, the clue rules' copy,
// the mode's three steps. Every one goes through `L` (the device's language, ./strings).
import type { Translator, ViewPlayer } from '@partybox/game-sdk/ui';
import type { ClueReason } from '../server/clue';
import type { TurnHeader } from '../server/view-common';

export function nameOf(players: readonly ViewPlayer[], id: string): string {
  return players.find((p) => p.id === id)?.name ?? '?';
}

export function avatarOf(players: readonly ViewPlayer[], id: string): string {
  return players.find((p) => p.id === id)?.avatarId ?? 'fox';
}

export function teamName(L: Translator, team: 'sun' | 'moon' | null): string {
  if (team === 'sun') return L('▲ Sun');
  if (team === 'moon') return L('● Moon');
  return '';
}

/** "Round 3 of 8" (solo, co-op) or "Turn 5 · ▲ Sun" (teams, catch-ups counted). */
export function roundLine(L: Translator, turn: TurnHeader): string {
  if (turn.mode === 'teams')
    return L('Turn {n} · {team}', { n: turn.n, team: teamName(L, turn.team) });
  return L('Round {n} of {total}', { n: turn.n, total: turn.total });
}

export function modeLine(L: Translator, mode: TurnHeader['mode']): string {
  if (mode === 'teams') return L('Teams · ▲ Sun against ● Moon');
  if (mode === 'coop') return L('Co-op · the whole room against the dial');
  return L('Solo · everyone for themselves');
}

/** "(pista en inglés)" after a bot's clue on a Spanish screen (decision [196a9e] rule 1: English
 *  content is marked where it appears); null in English or for a person's clue. */
export function englishClueNote(
  L: Translator,
  turn: Pick<TurnHeader, 'botClue' | 'lang'>,
): string | null {
  // A Spanish game's bots write Spanish (ADR-054): only an English game's bot clue needs the note.
  return L.lang === 'es' && turn.botClue && turn.lang !== 'es' ? L('(clue in English)') : null;
}

export function clueMessage(L: Translator, reason: ClueReason): string {
  switch (reason) {
    case 'empty':
      return L('Type a clue.');
    case 'too-long':
      return L('Keep it under 30 characters.');
    case 'number':
      return L('No numbers. Describe it instead.');
    case 'label-word':
      return L("Don't use the dial's own words.");
    case 'position-word':
      return L('Describe a thing, not a spot on the dial.');
  }
}

export function verdictText(L: Translator, verdict: string | null): string {
  switch (verdict) {
    case 'bullseye':
      return L('Bullseye!');
    case 'close':
      return L('Close!');
    case 'missed':
      return L('Missed it.');
    case 'perfect':
      return L('Perfect tune!');
    default:
      return '';
  }
}

export function ratingText(L: Translator, rating: string): string {
  switch (rating) {
    case 'meld':
      return L('🧠 Mind meld!');
    case 'clear':
      return L('📡 Crystal clear!');
    case 'tuning':
      return L('📻 Tuning in.');
    default:
      return L('📺 Static.');
  }
}
