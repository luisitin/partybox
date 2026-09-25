// The reader (SPEC §1.11, ADR-045). Every line goes through the toSpeakable stand-in. Requests go
// out as soon as a line's text is known and public-safe: clues when submitted (they stay in state,
// never in a view, until their card), the accusation when the vote settles, the next round's
// category during the vote — and "The word was …" only once wordReveal begins (SPEC §1.5).
// Fixed lines are requested live too (stand-in for render-clips, audit #22): same voice, cached.
import type { SpeechRequest } from '@partybox/game-sdk';
import { PRONUNCIATIONS } from './content';
import { readableName, toSpeakable } from './speakable';
import { isImposter, wordOf } from './round';
import type { State } from './types';

export const FIXED = {
  cluesIn: 'Clues are in.',
  vote: 'Time to vote.',
  tie: "It's a tie. Vote again.",
  imposter: 'Imposter!',
  innocent: 'Innocent.',
  escapes: 'The imposter escapes!',
  lastChance: 'Last chance.',
  stolen: 'Stolen!',
  decided: 'The room has decided.',
} as const;
export type FixedLine = keyof typeof FIXED;

const NUMBER_WORDS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];

/** A line to say: what the screen shows (`text`) and what the host renders. */
export interface Line {
  text: string;
  req: SpeechRequest;
}

function keyOf(voice: string, parts: unknown): string {
  const text = `${voice}|${JSON.stringify(parts)}`;
  let a = 0x811c9dc5;
  let b = 0x01000193;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    a = Math.imul(a ^ c, 0x01000193) >>> 0;
    b = Math.imul(b ^ c, 0x5bd1e995) >>> 0;
  }
  return `imp${a.toString(36)}${b.toString(36)}`;
}

export function voiceOf(state: State): string | null {
  return state.cfg.reader === 'none' ? null : state.cfg.reader;
}

function line(state: State, text: string, playerText = false): Line | null {
  const voice = voiceOf(state);
  if (!voice) return null;
  const parts = toSpeakable(text, { overrides: PRONUNCIATIONS, playerText });
  return { text, req: { key: keyOf(voice, parts), voice, parts } };
}

export function fixedLine(state: State, id: FixedLine): Line | null {
  return line(state, FIXED[id]);
}

/** "Round two. The category is food." (no category when the imposter gets no hint). */
export function dealLine(state: State, n: number): Line | null {
  const word = state.words[Math.min(n - 1, state.words.length - 1)];
  const round = `Round ${NUMBER_WORDS[n - 1] ?? String(n)}.`;
  const cat =
    state.cfg.hint === 'category' && word ? ` The category is ${word.label.toLowerCase()}.` : '';
  return line(state, `${round}${cat}`);
}

/** One clue, read on its own ("Pepperoni."). */
export function clueLine(state: State, text: string): Line | null {
  const t = text.trim();
  return line(state, `${t.charAt(0).toUpperCase()}${t.slice(1)}.`, true);
}

/** "The room accuses Sam." — or the fixed line when the name can't be read (Part 00 §5.5). */
export function accuseLine(state: State, id: string): Line | null {
  const name = state.players[id]?.name ?? '';
  return readableName(name)
    ? line(state, `The room accuses ${name}.`, true)
    : fixedLine(state, 'decided');
}

export function wordLine(state: State): Line | null {
  const w = wordOf(state);
  return w ? line(state, `The word was ${w.answer}.`) : null;
}

/** The line the current moment says, if any (what views carry as `say`). */
export function currentLine(state: State): Line | null {
  const r = state.round;
  switch (state.phase.id) {
    case 'deal':
      return dealLine(state, r.n);
    case 'clueReveal': {
      if (r.revealed === 0) return fixedLine(state, 'cluesIn');
      const by = r.revealOrder[r.revealed - 1];
      const clue = r.clues.find((c) => c.by === by && c.r === r.clueRound);
      return clue ? clueLine(state, clue.text) : null;
    }
    case 'vote':
      return fixedLine(state, 'vote');
    case 'runoff':
      return fixedLine(state, 'tie');
    case 'accuse': {
      const id = r.accused[r.spot];
      if (id === undefined) return null;
      if (!r.flipped) return accuseLine(state, id);
      return fixedLine(state, isImposter(state, id) ? 'imposter' : 'innocent');
    }
    case 'lastChance':
      return fixedLine(state, 'lastChance');
    case 'wordReveal': {
      if (r.void) return null;
      if (r.step === 0) return wordLine(state);
      if (Object.values(r.guesses).some((g) => g.ok)) return fixedLine(state, 'stolen');
      const escaped = r.imposters.some((id) => !r.accused.includes(id));
      return escaped ? fixedLine(state, 'escapes') : null;
    }
    default:
      return null;
  }
}

/** Every reading this state wants, most urgent first, unanswered only, at most 10 (Part 00 §5.7). */
export function speech(state: State): SpeechRequest[] {
  if (!voiceOf(state) || state.phase.id === 'done') return [];
  const r = state.round;
  const want: (Line | null)[] = [currentLine(state)];
  const p = state.phase.id;
  if (p === 'clue' || p === 'clueReveal')
    for (const c of r.clues) if (c.r === r.clueRound) want.push(clueLine(state, c.text));
  if (p === 'voteReveal' || p === 'runoff' || p === 'accuse')
    for (const id of r.accused) want.push(accuseLine(state, id));
  if (p === 'vote' && r.n < state.cfg.rounds) want.push(dealLine(state, r.n + 1));
  // The fixed lines are asked for early (intro → first clue) and are cached by then; building them
  // on every call later cost more than the rest of the game's server work together.
  if (p === 'intro' || p === 'deal' || p === 'clue')
    for (const id of Object.keys(FIXED) as FixedLine[]) want.push(fixedLine(state, id));
  const seen = new Set<string>();
  const out: SpeechRequest[] = [];
  for (const l of want) {
    if (!l || seen.has(l.req.key) || state.speechMs[l.req.key] !== undefined) continue;
    seen.add(l.req.key);
    out.push(l.req);
  }
  return out.slice(0, 10);
}

/** The URL a phone or TV plays for a ready line (the host serves every key there). */
export function sayOf(state: State): { key: string; url: string; text: string } | null {
  const l = currentLine(state);
  if (!l) return null;
  const ms = state.speechMs[l.req.key];
  return {
    key: ms !== undefined && ms >= 0 ? l.req.key : '',
    url: ms !== undefined && ms >= 0 ? `/api/speech/${l.req.key}.wav` : '',
    text: l.text,
  };
}
