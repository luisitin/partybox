// The reader (SPEC §4.12, foundation §5): what is said, its key, and when it may be made. Every
// line goes through `toSpeakable`. Readings of answers are made once `write` ends (they reveal no
// author); a name line "It was Ben!" is made for EVERY seated player then too, so the flip never
// waits for the voice and the set of lines reveals nothing (NOTES.md: why not "only at reveal");
// a merged card's "It was both Ana and Eli!" is asked for at its reveal. Pure.
import type { SpeechRequest } from '@partybox/game-sdk';
import { pendingCap, speakableName, speechKey, toSpeakable } from '@partybox/game-sdk/speech';
import { PRONUNCIATIONS } from './content';
import type { Card, State } from './types';

const GAME_ID = 'who-said-it';

export const FIXED = {
  write: 'Time to write.',
  who: 'Who said it?',
  itWas: 'It was...',
  everyone: 'Everyone knew!',
  nobody: 'Nobody saw that coming!',
} as const;
export type FixedLine = keyof typeof FIXED;

function request(voice: string, text: string, playerText: boolean): SpeechRequest | null {
  const parts = toSpeakable(text, { voice, lang: 'en', playerText, overrides: PRONUNCIATIONS });
  if (parts.length === 0) return null;
  return { key: speechKey(GAME_ID, voice, parts), voice, parts };
}

export function voiceOf(state: State): string | null {
  return state.cfg.reader === 'none' ? null : state.cfg.reader;
}

export function fixedLine(state: State, line: FixedLine): SpeechRequest | null {
  const voice = voiceOf(state);
  return voice ? request(voice, FIXED[line], false) : null;
}

export function promptReading(state: State, n: number): SpeechRequest | null {
  const voice = voiceOf(state);
  const item = state.prompts[n];
  return voice && item ? request(voice, item.prompt, false) : null;
}

export function cardReading(state: State, card: Card | undefined): SpeechRequest | null {
  const voice = voiceOf(state);
  if (!voice || !card || !state.cfg.readAnswers) return null;
  return request(voice, card.text, true);
}

/** "It was Ben!" — null when the name can't be read aloud (§5.5: the fixed "It was…" instead). */
export function nameLine(state: State, id: string): SpeechRequest | null {
  const voice = voiceOf(state);
  const name = speakableName(state.players[id]?.name ?? '');
  return voice && name ? request(voice, `It was ${name}!`, true) : null;
}

/** The line at a card's flip: one author's name line, or "It was both Ana and Eli!". */
export function flipReading(state: State, card: Card): SpeechRequest | null {
  if (card.authors.length === 1) return nameLine(state, card.authors[0] as string);
  const voice = voiceOf(state);
  const names = card.authors.map((id) => speakableName(state.players[id]?.name ?? ''));
  if (!voice || names.some((n) => n === null)) return null;
  const list =
    names.length === 2 ? `${names[0]} and ${names[1]}` : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`; // prettier-ignore
  return request(voice, `It was both ${list}!`, true);
}

/** The length of a made reading, or undefined (not made yet) / -1 (failed). */
export function msOf(state: State, req: SpeechRequest | null): number | undefined {
  return req ? state.speechMs[req.key] : undefined;
}

/** Everything this state may want said, most urgent first (the host drains it in order). */
function wanted(state: State): (SpeechRequest | null)[] {
  const phase = state.phase.id;
  const { p } = state;
  const card = p.cards[p.idx];
  const fixed = (Object.keys(FIXED) as FixedLine[]).map((l) => fixedLine(state, l));
  if (phase === 'intro') return [promptReading(state, 0), ...fixed];
  if (phase === 'prompt' || phase === 'write')
    return [promptReading(state, p.n), fixedLine(state, 'write'), ...fixed];
  if (phase === 'guess' || phase === 'reveal') {
    const merged = phase === 'reveal' && card && card.authors.length > 1;
    return [
      cardReading(state, card),
      merged ? flipReading(state, card) : null,
      ...(card ? card.authors.map((id) => nameLine(state, id)) : []),
      ...p.cards.slice(p.idx + 1).map((c) => cardReading(state, c)),
      ...p.seated.map((id) => nameLine(state, id)),
      ...fixed,
    ];
  }
  if (phase === 'scores') return [promptReading(state, p.n + 1)];
  return [];
}

/** The readings to ask the host for now: unmade ones, deduped, at most pendingCap (foundation §5.7). */
export function speech(state: State): SpeechRequest[] {
  if (!voiceOf(state)) return [];
  const seen = new Set<string>();
  const out: SpeechRequest[] = [];
  for (const r of wanted(state)) {
    if (!r || seen.has(r.key) || state.speechMs[r.key] !== undefined) continue;
    seen.add(r.key);
    out.push(r);
    if (out.length >= pendingCap(state.seats.length)) break;
  }
  return out;
}
