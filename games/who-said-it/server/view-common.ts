// What the TV and the phones share: chip statuses, the lines the reader says right now, the reveal.
// A speech key reaches a view only once its line is due (foundation §5.7) and only if it was made.
import type { PlayerStatus } from '@partybox/game-sdk';
import { answeredIds, currentCard, guessedIds } from './round';
import { tallyCard } from './scoring';
import { cardReading, fixedLine, msOf, promptReading } from './speech';
import { LINE_GAP_MS, PROMPT_AFTER_MS, VOICE_LEAD_MS } from './types';
import type { State } from './types';

/** One line to play: at server time `at` (a phone that loads later skips it once it is stale). */
export interface SayItem {
  key: string;
  url: string;
  at: number;
  ms: number;
}

const WRITE_CUE_MS = 250;

function item(key: string, at: number, ms: number): SayItem {
  return { key, url: `/api/speech/${key}.wav`, at, ms };
}

/** The lines due in the current phase, in order. */
export function sayNow(state: State): SayItem[] {
  const { phase, p } = state;
  const made = (req: ReturnType<typeof fixedLine>): [string, number] | null => {
    const ms = msOf(state, req);
    return req && ms !== undefined && ms > 0 ? [req.key, ms] : null;
  };
  if (phase.id === 'prompt' && phase.deadline !== null) {
    const r = made(promptReading(state, p.n));
    if (!r) return [];
    const at = Math.max(phase.startedAt + VOICE_LEAD_MS, phase.deadline - PROMPT_AFTER_MS - r[1]);
    return [item(r[0], at, r[1])];
  }
  if (phase.id === 'write') {
    const r = made(fixedLine(state, 'write'));
    return r ? [item(r[0], phase.startedAt + WRITE_CUE_MS, r[1])] : [];
  }
  if (phase.id === 'guess') {
    const out: SayItem[] = [];
    let at = phase.startedAt + VOICE_LEAD_MS;
    const who = p.idx === 0 ? made(fixedLine(state, 'who')) : null;
    if (who) {
      out.push(item(who[0], at, who[1]));
      at += who[1] + LINE_GAP_MS;
    }
    const read = made(cardReading(state, currentCard(state)));
    if (read) out.push(item(read[0], at, read[1]));
    return out;
  }
  if (phase.id === 'reveal' && p.step === 'shown' && p.flip?.key) {
    const f = p.flip;
    const out = [item(f.key as string, f.at, f.ms)];
    if (f.after) out.push(item(f.after, f.at + f.ms + LINE_GAP_MS, f.afterMs));
    return out;
  }
  return [];
}

export function statusOf(state: State): (id: string) => PlayerStatus {
  const phase = state.phase.id;
  const answered = new Set(answeredIds(state));
  const guessed = new Set(guessedIds(state));
  return (id) => {
    if (phase === 'write' || phase === 'guess') {
      if (!state.p.seated.includes(id)) return 'waiting';
      const done = phase === 'write' ? answered : guessed;
      return done.has(id) ? 'submitted' : 'active';
    }
    return 'active';
  };
}

export interface RevealView {
  step: 'land' | 'shown';
  /** Every seated player's tap (the authors' too, so the landing gives nobody away). */
  guesses: Record<string, string>;
  /** From the flip on: the author(s), who was right, each player's points on this card. */
  authors: string[];
  right: string[];
  points: Record<string, number>;
}

export function revealOf(state: State): RevealView | null {
  const card = currentCard(state);
  if (state.phase.id !== 'reveal' || !card) return null;
  const guesses: Record<string, string> = {};
  for (const id of state.p.seated) {
    const target = state.p.guesses[id];
    if (target !== undefined) guesses[id] = target;
  }
  const shown = state.p.step === 'shown';
  return {
    step: state.p.step,
    guesses,
    authors: shown ? card.authors : [],
    right: shown ? tallyCard(state, card).right : [],
    points: shown ? state.p.points : {},
  };
}

/** The card on stage: text, its number and how many this prompt has. */
export function cardOf(state: State): { text: string; number: number; count: number } | null {
  const card = currentCard(state);
  if ((state.phase.id !== 'guess' && state.phase.id !== 'reveal') || !card) return null;
  return { text: card.text, number: state.p.idx + 1, count: state.p.cards.length };
}

/** VIP Skip / Next in words (I-774 B): English on the wire, translated by the game's strings. */
export function vipSkipLabel(state: State, last: boolean): string {
  switch (state.phase.id) {
    case 'intro':
      return "Let's go";
    case 'prompt':
      return 'Start writing';
    case 'write':
      return 'Close answers';
    case 'guess':
      return 'Reveal now';
    case 'reveal':
      return 'Next card';
    case 'scores':
      return last ? 'See results' : 'Next question';
    default:
      return 'Skip / Next';
  }
}
