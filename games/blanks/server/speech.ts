// READER-VOICES (ADR-045): what Blanks' reader says. The finished card — the black card with the
// answers in its blanks, the default fill — with a short pause before each answer, run through the
// pronunciation lexicon (content/pronounce.json: that card's own fixes, then words, then patterns)
// and handed to the host as parts: text for the voice, or phonemes where the lexicon has them.
// A black card on its own says "blank" for each ____. Pure: the host makes the audio.
import type { SpeechPart, SpeechRequest } from '@partybox/game-sdk';
import lexicon from '../content/pronounce.json' with { type: 'json' };
import { fill } from './cards';
import { blackCard, whiteText } from './content';
import type { Reader, State } from './types';

type Entry = { spell?: boolean; say?: string; ipa?: string };
const WORDS = lexicon.words as Readonly<Record<string, Entry>>;
const CARDS = lexicon.cards as Readonly<Record<string, Readonly<Record<string, Entry>>>>;
const PATTERNS = lexicon.patterns.map((p) => ({ re: new RegExp(p.match, 'g'), say: p.say }));
const BRITISH: ReadonlySet<string> = new Set(['george', 'fable']);

/** The pause before an answer (the samples' "…"). */
const PAUSE = '...';

/** Letters said one by one, Z in the voice's own accent. */
function spell(token: string, voice: string): string {
  return [...token.replace(/[^A-Za-z0-9]/g, '')]
    .map((c) => (c.toUpperCase() === 'Z' ? (BRITISH.has(voice) ? 'zed' : 'zee') : c))
    .join(' ');
}

function sayPatterns(text: string): string {
  return PATTERNS.reduce((t, p) => t.replace(p.re, p.say), text);
}

/** One card's words as parts: its own fixes first, then the shared words, then the patterns. */
export function lexiconParts(text: string, cardId: string | null, voice: string): SpeechPart[] {
  const own = cardId ? CARDS[cardId] : undefined;
  const whole = own?.['_whole'];
  if (whole?.say) return [{ text: whole.say }];
  const parts: SpeechPart[] = [];
  let run = '';
  const flush = (): void => {
    if (run) parts.push({ text: sayPatterns(run) });
    run = '';
  };
  for (const piece of text.split(/(\s+)/)) {
    const m =
      /^([^A-Za-z0-9$#]*)([A-Za-z0-9$#][A-Za-z0-9$#/'’.-]*?)((?:['’]s)?)([^A-Za-z0-9]*)$/.exec(
        piece,
      );
    const word = m?.[2] ?? '';
    const entry = (own && own[word]) ?? WORDS[word];
    if (!m || !entry) {
      run += piece;
      continue;
    }
    run += m[1] ?? '';
    flush();
    if (entry.ipa) parts.push({ ipa: entry.ipa, text: word });
    else parts.push({ text: entry.spell ? spell(word, voice) : (entry.say ?? word) });
    run += `${m[3] ?? ''}${m[4] ?? ''}`;
  }
  flush();
  return parts;
}

/** The whole reading of a finished card (or of the black card alone, `whites` empty). */
export function readingParts(
  blackId: string,
  whiteIds: readonly string[],
  voice: string,
): SpeechPart[] {
  const black = blackCard(blackId).text;
  if (whiteIds.length === 0) return lexiconParts(black.replace(/_{2,}/g, 'blank'), blackId, voice);
  const { segments, extra } = fill(black, whiteIds.map(whiteText));
  const parts: SpeechPart[] = [];
  let answer = 0;
  for (const s of segments) {
    if (s.kind === 'text') {
      parts.push(...lexiconParts(s.text, blackId, voice));
      continue;
    }
    parts.push({ text: PAUSE });
    parts.push(...lexiconParts(s.text, whiteIds[answer] ?? null, voice));
    answer += 1;
  }
  extra.forEach((text, i) => {
    parts.push({ text: PAUSE });
    parts.push(...lexiconParts(text, whiteIds[answer + i] ?? null, voice));
  });
  return parts;
}

/** A stable short key for a reading (FNV-1a over the voice and its parts, twice for 64 bits). */
export function speechKey(voice: string, parts: readonly SpeechPart[]): string {
  const text = `${voice}|${JSON.stringify(parts)}`;
  let a = 0x811c9dc5;
  let b = 0x01000193;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    a = Math.imul(a ^ c, 0x01000193) >>> 0;
    b = Math.imul(b ^ c, 0x5bd1e995) >>> 0;
  }
  return `bl${a.toString(36)}${b.toString(36)}`;
}

function request(voice: string, blackId: string, whiteIds: readonly string[]): SpeechRequest {
  const parts = readingParts(blackId, whiteIds, voice);
  return { key: speechKey(voice, parts), voice, parts };
}

/** The room's reader, or null when nobody reads aloud. */
export function voiceOf(state: State): Reader | null {
  const reader = state.settings.reader ?? 'none';
  return reader === 'none' ? null : reader;
}

/** The reading for the slot on stage (or the question alone when `slot` is null). */
export function readingFor(state: State, slot: number | null): SpeechRequest | null {
  const voice = voiceOf(state);
  if (!voice || !state.blackId) return null;
  if (slot === null) return request(voice, state.blackId, []);
  const submitter = state.slots[slot];
  const whites = submitter ? state.submissions[submitter] : undefined;
  return whites ? request(voice, state.blackId, whites) : null;
}

/** Every reading this state wants: the question once it is up, each answer as soon as it is
 *  played (so all of them are ready by the time the reading starts). */
export function speech(state: State): SpeechRequest[] {
  const voice = voiceOf(state);
  const phase = state.phase.id;
  if (!voice || !state.blackId || (phase !== 'answer' && phase !== 'reveal')) return [];
  const out = [request(voice, state.blackId, [])];
  for (const whites of Object.values(state.submissions))
    if (whites.length > 0) out.push(request(voice, state.blackId, whites));
  return out.filter((r) => state.speech?.[r.key] === undefined);
}
