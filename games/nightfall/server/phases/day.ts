// Phase "day": the room argues; the living tap "Ready to vote ✋" (a toggle) and, with the town
// board on, post up to 3 lines. Ends when more than half of the living are ready, when the day's
// clock runs out, or on the VIP's "Start the vote". Bots act on beats the game draws at dawn of the
// day (NOTES decision 3): the phase deadline wakes the next beat, `dayEndsAt` is the real end.
import { enterPhase, hasPlayer, isTimerFor, nextFloat, nextInt } from '@partybox/game-sdk';
import type { GameEvent, RngState } from '@partybox/game-sdk';
import { botPost } from '../bot';
import { isAlive } from '../rules';
import { cleanText, postsToday } from '../text';
import { phoneView } from '../views-phone';
import { POSTS_PER_DAY } from '../types';
import type { Beat, Input, State, Transition } from '../types';

function draw(rng: RngState, min: number, max: number): [number, RngState] {
  return nextInt(rng, Math.round(min), Math.round(Math.max(min, max)));
}

/** One ready beat per living bot 20–60 s in, and 1–3 posts across the day when the board is on. */
function scheduleBeats(state: State, now: number, endsAt: number): [Beat[], RngState] {
  let rng = state.rng;
  const beats: Beat[] = [];
  const bots = state.alive.filter((id) => state.players[id]?.bot === true);
  for (const bot of bots) {
    let at: number;
    [at, rng] = draw(rng, now + 20_000, Math.min(now + 60_000, endsAt - 3_000));
    beats.push({ at, bot, kind: 'ready' });
    if (!state.cfg.townBoard) continue;
    let count: number;
    [count, rng] = nextInt(rng, 1, POSTS_PER_DAY);
    for (let i = 0; i < count; i++) {
      [at, rng] = draw(rng, now + 6_000, endsAt - 8_000);
      beats.push({ at, bot, kind: 'post' });
    }
  }
  beats.sort((a, b) => a.at - b.at || (a.bot < b.bot ? -1 : a.bot > b.bot ? 1 : 0));
  return [beats, rng];
}

function wake(state: State): State {
  const endsAt = state.dayEndsAt ?? state.phase.startedAt;
  const nextBeat = state.beats[0]?.at ?? endsAt;
  return { ...state, phase: { ...state.phase, deadline: Math.min(nextBeat, endsAt) } };
}

export function enterDay(state: State, now: number): State {
  const endsAt = now + state.cfg.daySeconds * 1000;
  const [beats, rng] = scheduleBeats(state, now, endsAt);
  const firstDeath = state.dead.some((d) => d.how !== 'left');
  const at: State = {
    ...state,
    rng,
    ready: [],
    beats,
    dayEndsAt: endsAt,
    step: 0,
    stepAt: now,
    ghostsDay: state.ghostsDay ?? (firstDeath ? state.day : null),
  };
  return wake(enterPhase(at, 'day', now, 0));
}

function majorityReady(state: State): boolean {
  const ready = state.ready.filter((id) => isAlive(state, id)).length;
  return ready * 2 > state.alive.length;
}

function post(state: State, by: string, text: string): State {
  const clean = cleanText(text);
  if (!clean || !state.cfg.townBoard || postsToday(state, by) >= POSTS_PER_DAY) return state;
  return { ...state, board: [...state.board, { day: state.day, by, text: clean }] };
}

function toggleReady(state: State, id: string): State {
  const ready = state.ready.includes(id)
    ? state.ready.filter((r) => r !== id)
    : [...state.ready, id];
  return { ...state, ready };
}

/** Runs every bot beat that is due, deciding each from the bot's own phone view. */
function runBeats(state: State, now: number): State {
  let s = state;
  while (s.beats[0] && s.beats[0].at <= now) {
    const beat = s.beats[0];
    s = { ...s, beats: s.beats.slice(1) };
    if (!isAlive(s, beat.bot)) continue;
    if (beat.kind === 'ready') {
      if (!s.ready.includes(beat.bot)) s = toggleReady(s, beat.bot);
      continue;
    }
    let rng = s.rng;
    const r = (): number => {
      const [value, after] = nextFloat(rng);
      rng = after;
      return value;
    };
    const text = botPost(phoneView(s, beat.bot), r);
    s = text ? post({ ...s, rng }, beat.bot, text) : { ...s, rng };
  }
  return s;
}

export function reduceDay(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) {
    if (event.now >= (state.dayEndsAt ?? 0)) return next(state, event.now);
    const after = runBeats(state, event.now);
    return majorityReady(after) ? next(after, event.now) : wake(after);
  }
  if (event.type !== 'input') return state;
  const by = event.playerId;
  if (!hasPlayer(state, by) || !isAlive(state, by)) return state;
  if (event.input.type === 'post') return post(state, by, event.input.text);
  if (event.input.type !== 'ready') return state;
  const after = toggleReady(state, by);
  return majorityReady(after) ? next(after, event.now) : after;
}

/** Pause/resume: the helper shifts the phase deadline; the day's own clock and beats move too. */
export function shiftDay(state: State, by: number): State {
  if (state.phase.id !== 'day' || by <= 0 || state.dayEndsAt === null) return state;
  return {
    ...state,
    dayEndsAt: state.dayEndsAt + by,
    beats: state.beats.map((b) => ({ ...b, at: b.at + by })),
  };
}
