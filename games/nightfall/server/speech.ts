// The narrator (SPEC §10.15, ADR-045). One reading per phase or reveal step: fixed lines ("Night
// falls…") and live ones ("Dee did not survive the night."). Fixed lines hold no secret and are
// asked for a phase ahead; a live line exists only once the night or the vote has resolved, and
// its key reaches a view only on the step that plays it (§10.10). Until F6 lands, `speakable` is
// a small local stand-in for `toSpeakable` (NOTES: stand-ins).
import { hashString } from '@partybox/game-sdk';
import type { SpeechPart, SpeechRequest } from '@partybox/game-sdk';
import { PRONUNCIATIONS, fillIn, flavourOf } from './content';
import { nameOf, roleOf } from './rules';
import type { State } from './types';

/** After a reading, a beat before the next step. */
export const VOICE_BEAT_MS = 700;

export interface Reading {
  key: string;
  text: string;
  voice: string;
  parts: SpeechPart[];
}

/** Straight quotes, ellipses as pauses, no emoji or stray symbols (P00 §5.3 rules 1, 10, 11). */
export function speakable(text: string): string {
  return text
    .replace(/[’‘ʼ´`]/g, "'")
    .replace(/[“”]/g, '')
    .replace(/…|\.\.\./g, ',')
    .replace(/[^\p{L}\p{N}\s'.,!?-]/gu, '')
    .replace(/\s+/g, ' ')
    .replace(/,\s*$/, '.')
    .trim();
}

/** P00 §5.5: a name with no vowel, or mostly digits and symbols, is not read aloud. */
export function readableName(name: string): boolean {
  const letters = name.match(/\p{L}/gu) ?? [];
  if (letters.length < Math.max(1, Math.ceil(name.replace(/\s/g, '').length / 2))) return false;
  return /[aeiouyáéíóúàèìòùäëïöüâêîôû]/i.test(name);
}

function withPronunciations(text: string): string {
  let out = text;
  for (const [word, entry] of Object.entries(PRONUNCIATIONS.words)) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\b${escaped}\\b`, entry.anyCase ? 'gi' : 'g');
    out = out.replace(re, entry.say);
  }
  return out;
}

function keyOf(voice: string, text: string, salt = ''): string {
  const a = hashString(`${voice}|${text}${salt}`).toString(36);
  const b = hashString(`${text}|${voice}|nf${salt}`).toString(36);
  return `nf${a}${b}`;
}

function reading(state: State, text: string, secret = false): Reading | null {
  const voice = state.cfg.reader;
  if (voice === 'none' || text.trim() === '') return null;
  const said = speakable(withPronunciations(text));
  if (said === '') return null;
  const salt = secret ? `|${state.speechSalt}` : '';
  return { key: keyOf(voice, said, salt), text, voice, parts: [{ text: said }] };
}

/** "Dee did not survive the night." for each death the room can hear a name for. */
function newsText(state: State): string {
  const f = flavourOf(state.cfg.flavour);
  return tonightsDeaths(state)
    .filter((d) => readableName(nameOf(state, d.id)))
    .map((d) => fillIn(d.how === 'left' ? f.live.left : f.live.died, { name: nameOf(state, d.id) }))
    .join(' ');
}

/** The role reveal: "Dee was a villager." — or the role clip alone for an unreadable name. */
function revealText(state: State, ids: readonly string[]): string {
  const f = flavourOf(state.cfg.flavour);
  return ids
    .map((id) => {
      const role = roleOf(state, id);
      if (!role) return '';
      const clip = f.roles[role].reveal;
      const name = nameOf(state, id);
      if (!readableName(name)) return clip;
      return `${name} was ${clip.charAt(0).toLowerCase()}${clip.slice(1)}`;
    })
    .filter((t) => t !== '')
    .join(' ');
}

/** The deaths dawn announces: tonight's victim and anyone who left (not the hunter's shot). */
export function tonightsDeaths(state: State): State['dead'] {
  return state.dead.filter((d) => d.day === state.day && (d.how === 'night' || d.how === 'left'));
}

/** Leavers announced with the verdict. */
export function verdictLeavers(state: State): string[] {
  return state.dead.filter((d) => d.day === state.day && d.how === 'left').map((d) => d.id);
}

/** What the narrator says in the current phase and step (shown as text even with no voice). */
export function spokenNow(state: State): string | null {
  const f = flavourOf(state.cfg.flavour);
  const n = f.narrator;
  const phase = state.phase.id;
  const step = state.step;
  if (phase === 'night') return state.day <= 1 ? n.nightFalls : n.sleeps;
  if (phase === 'dawn') {
    if (step === 0) return n.dawn;
    const deaths = tonightsDeaths(state);
    if (step === 1) return deaths.length === 0 ? n.survived : newsText(state);
    if (!state.cfg.revealRoles) return null;
    return revealText(
      state,
      deaths.map((d) => d.id),
    );
  }
  if (phase === 'hunter') {
    if (step === 0) return n.hunter;
    const shot = state.shot;
    if (!shot) return null;
    // Step 1 names the victim (no secret: any living player could be named, so every such line is
    // made while the hunter aims); step 2 flips their card with the role's own clip.
    if (step === 1) {
      const name = nameOf(state, shot);
      return readableName(name) ? fillIn(f.live.shot, { name }) : null;
    }
    const role = roleOf(state, shot);
    return role && state.cfg.revealRoles ? f.roles[role].reveal : null;
  }
  if (phase === 'day')
    return state.ghostsDay === state.day ? `${n.ghosts} ${n.discuss}` : n.discuss;
  if (phase === 'vote') return n.vote;
  if (phase === 'runoff') return n.tie;
  if (phase === 'verdict') return verdictText(state);
  if (phase === 'last-words' && step === 1 && state.verdict?.out) {
    const name = nameOf(state, state.verdict.out);
    return readableName(name) ? fillIn(f.live.lastWords, { name }) : null;
  }
  if (phase === 'end') {
    if (state.winner === 'jester') return n.jesterWin;
    return state.winner === 'wolves' ? n.wolvesWin : n.villageWin;
  }
  return null;
}

function verdictText(state: State): string | null {
  const f = flavourOf(state.cfg.flavour);
  const v = state.verdict;
  if (!v) return null;
  if (state.step === 0) return f.narrator.votesIn;
  if (state.step === 1) {
    if (!v.out) return f.narrator.noAgree;
    const name = nameOf(state, v.out);
    return readableName(name) ? fillIn(f.live.was, { name }) : null;
  }
  const role = v.out ? roleOf(state, v.out) : undefined;
  return role && state.cfg.revealRoles ? f.roles[role].reveal : null;
}

/** The reading for the current phase and step (what the TV plays now), or null. */
export function readingNow(state: State): Reading | null {
  const text = spokenNow(state);
  // Dawn's step 2 pairs names with roles: its key is salted so it can't be guessed.
  const secret = state.phase.id === 'dawn' && state.step >= 2;
  return text ? reading(state, text, secret) : null;
}

/** The role clips of the roles in play ("A wolf!"): public, since the role list is. */
function castClips(state: State): string[] {
  const f = flavourOf(state.cfg.flavour);
  const roles = new Set(Object.values(state.roles));
  return [...roles].map((r) => f.roles[r].reveal);
}

/** What this state wants made (ADR-045): the reading on stage, this phase's later steps once
 *  they are known, and the next phase's fixed lines. Never a line about a secret before it has
 *  resolved; at most 10 pending keys. */
export function speech(state: State): SpeechRequest[] {
  if (state.cfg.reader === 'none') return [];
  const n = flavourOf(state.cfg.flavour).narrator;
  const phase = state.phase.id;
  const wanted: (Reading | null)[] = [readingNow(state)];
  const later = (step: number): Reading | null => readingNow({ ...state, step });
  // Step 2 turns the cards: only asked for when roles are revealed at all (reviewer 98b823).
  if (phase === 'dawn' || phase === 'verdict')
    wanted.push(later(1), state.cfg.revealRoles ? later(2) : null);
  // The shot (once taken) and "Ben's last words" (public since the verdict) come next.
  if (phase === 'hunter' || phase === 'last-words') wanted.push(later(1), later(2));
  // While the hunter aims: "The hunter took X down." for every possible target, and the cast's
  // role clips — none of it tells anyone anything (p13b: made after the shot, the line came 14 s
  // late on a loaded host).
  if (phase === 'hunter' && state.step === 0 && !state.shot) {
    const f = flavourOf(state.cfg.flavour);
    for (const id of state.alive) {
      const name = nameOf(state, id);
      if (id !== state.hunterPending && readableName(name))
        wanted.push(reading(state, fillIn(f.live.shot, { name })));
    }
  }
  const fixed: Record<string, string[]> = {
    roles: [n.nightFalls],
    night: [n.dawn, n.survived],
    dawn: [n.discuss, `${n.ghosts} ${n.discuss}`, n.hunter],
    hunter: [n.discuss, n.sleeps, ...castClips(state)],
    day: [n.vote],
    vote: [n.votesIn, n.tie],
    runoff: [n.votesIn, n.noAgree],
    verdict: [n.sleeps, n.hunter, n.wolvesWin, n.villageWin, n.jesterWin],
    lastWords: [n.sleeps, n.hunter],
  };
  for (const text of fixed[phase] ?? []) wanted.push(reading(state, text));
  // "Ben was…" for everyone who could be voted out: no secret (it names every living player),
  // and ready long before the verdict's spotlight needs it (p04: one came 1.5 s late).
  if (phase === 'day' || phase === 'vote' || phase === 'runoff') {
    const f = flavourOf(state.cfg.flavour);
    for (const id of state.runoff ?? state.alive) {
      const name = nameOf(state, id);
      if (readableName(name)) wanted.push(reading(state, fillIn(f.live.was, { name })));
    }
  }
  const out: SpeechRequest[] = [];
  const seen = new Set<string>();
  for (const r of wanted) {
    if (!r || seen.has(r.key) || state.speechMs[r.key] !== undefined) continue;
    seen.add(r.key);
    out.push({ key: r.key, voice: r.voice, parts: r.parts });
  }
  return out.slice(0, 10);
}
