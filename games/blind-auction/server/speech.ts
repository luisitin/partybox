// READER-VOICES (ADR-045, SPEC §8.13): the auctioneer. Fixed lines ("Going once…") are requested
// early and cached by the host, so they start the instant they are needed; live readings (the lot,
// the price, the amount) are requested only once their words are public — the flip's amount only
// when the flip begins. At most 10 keys are ever pending (P00 §5.7). Keys never reach a view before
// their line plays.
import type { SpeechRequest } from '@partybox/game-sdk';
import { PRONUNCIATIONS } from './content';
import { numberWords, toSpeakable } from './speak';
import type { Reader, State } from './types';

export const FIXED_LINES = {
  bids: 'Place your bids!',
  once: 'Going once…',
  twice: 'Going twice…',
  sold: 'Sold!',
  none: 'No takers!',
  closed: 'Bidding is closed.',
  trap: "It's a trap!",
  jackpot: 'Jackpot!',
  heist: 'A heist!',
  swap: 'Swap!',
  double: 'Double it!',
  refund: 'Money back.',
  dud: 'A dud.',
  grand: 'The grand lot!',
} as const;
export type FixedLine = keyof typeof FIXED_LINES;

const MAX_PENDING = 10;

/** A stable short key (FNV-1a twice → 64 bits; the host accepts [a-z0-9]{6,40}). */
export function speechKey(voice: string, text: string): string {
  const s = `ba1|${voice}|${text}`;
  let a = 0x811c9dc5;
  let b = 0x01000193;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    a = Math.imul(a ^ c, 0x01000193) >>> 0;
    b = Math.imul(b ^ c, 0x5bd1e995) >>> 0;
  }
  return `ba${a.toString(36)}${b.toString(36)}`;
}

export function voiceOf(state: State): Exclude<Reader, 'none'> | null {
  return state.cfg.reader === 'none' ? null : state.cfg.reader;
}

function request(voice: string, text: string): SpeechRequest {
  const said = toSpeakable(text, PRONUNCIATIONS);
  return { key: speechKey(voice, said), voice, parts: [{ text: said }] };
}

export function fixedRequest(state: State, line: FixedLine): SpeechRequest | null {
  const voice = voiceOf(state);
  return voice ? request(voice, FIXED_LINES[line]) : null;
}

/** "Lot three: the Pirate's Chest. Found under a palm tree…" — public from `lot` on. */
export function lotText(state: State, idx: number): string | null {
  const lot = state.lots[idx];
  if (!lot) return null;
  const opener = lot.item.grand ? 'The grand lot!' : `Lot ${numberWords(idx + 1)}:`;
  return `${opener} The ${lot.item.name}. ${lot.item.flavour}`;
}

export function lotRequest(state: State, idx: number): SpeechRequest | null {
  const voice = voiceOf(state);
  const text = lotText(state, idx);
  return voice && text ? request(voice, text) : null;
}

/** "Sold, for ninety coins." — only once the price is public (`sold`, Live's hammer included). */
export function soldRequest(state: State): SpeechRequest | null {
  const voice = voiceOf(state);
  if (!voice || !state.l.winner || (state.phase.id !== 'sold' && state.phase.id !== 'flip'))
    return null;
  return request(voice, `Sold, for ${numberWords(state.l.price)} coins.`);
}

/** The flip's amount ("Plus three hundred!") — requested only once `flip` has begun (§8.8). */
export function flipRequest(state: State): SpeechRequest | null {
  const voice = voiceOf(state);
  const effect = state.l.effect;
  if (!voice || state.phase.id !== 'flip' || !effect) return null;
  switch (effect.kind) {
    case 'gain':
    case 'double':
      return request(voice, `Plus ${numberWords(effect.amount)}!`);
    case 'lose':
      return effect.amount > 0 ? request(voice, `Minus ${numberWords(effect.amount)}.`) : null;
    case 'steal':
      return effect.amount > 0
        ? request(voice, `${numberWords(effect.amount)} coins, stolen!`)
        : null;
    default:
      return null;
  }
}

/** The fixed line the flip opens with. */
export function flipLine(state: State): FixedLine | null {
  switch (state.l.effect?.kind) {
    case 'gain':
      return 'jackpot';
    case 'double':
      return 'double';
    case 'lose':
      return 'trap';
    case 'steal':
      return 'heist';
    case 'swap':
      return 'swap';
    case 'refund':
      return 'refund';
    case 'dud':
      return 'dud';
    default:
      return null;
  }
}

/** Every reading this state wants, most urgent first, never more than 10 still pending. */
export function speech(state: State): SpeechRequest[] {
  if (!voiceOf(state) || state.phase.id === 'done') return [];
  const want: (SpeechRequest | null)[] = [];
  const phase = state.phase.id;
  const idx = state.l.idx;
  if (phase === 'intro') want.push(lotRequest(state, 0));
  if (phase === 'lot') want.push(lotRequest(state, idx));
  if (phase === 'sold' || phase === 'flip') want.push(soldRequest(state));
  if (phase === 'flip') want.push(flipRequest(state), lotRequest(state, idx + 1));
  const soon: FixedLine[] = state.cfg.live
    ? ['once', 'twice', 'sold', 'none', 'bids']
    : ['bids', 'closed', 'sold', 'none'];
  for (const line of soon) want.push(fixedRequest(state, line));
  for (const line of Object.keys(FIXED_LINES) as FixedLine[]) want.push(fixedRequest(state, line));
  const seen = new Set<string>();
  const out: SpeechRequest[] = [];
  for (const r of want) {
    if (!r || seen.has(r.key) || state.speechMs[r.key] !== undefined) continue;
    seen.add(r.key);
    out.push(r);
    if (out.length >= MAX_PENDING) break;
  }
  return out;
}
