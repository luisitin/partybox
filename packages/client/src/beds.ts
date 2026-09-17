// Music beds: short looping backgrounds synthesized in Web Audio, one per game phase (ADR-032;
// owner's pick 2026-09-17 after hearing them on the Blanks review page). No files: a bed is a
// tempo, a level and a bar function that schedules one bar of notes. A game maps phase ids to bed
// ids in `clientModule.beds`; the TV shell crossfades between beds as phases change, keeps each
// bed's place so a bed that returns resumes where it left off, holds during a pause, ducks under
// every cue, and follows the TV's mute. Phones never play beds.
import type { PushedView, RoomSnapshot, TvView } from '@partybox/shared';
import { BED_IDS, BEDS } from './beds-library';
import type { BedId } from './beds-library';

export { BED_IDS } from './beds-library';
export type { BedId } from './beds-library';

export const isBedId = (id: string): id is BedId => (BED_IDS as readonly string[]).includes(id);

/** The bed for this room state: a game's `beds[phaseId]` while playing, nothing otherwise. */
export function bedFor(
  room: RoomSnapshot | null,
  view: PushedView<TvView> | null,
  beds: Readonly<Record<string, string>> | undefined,
): BedId | null {
  if (!room || room.status !== 'playing' || !view || !beds) return null;
  const id = beds[view.phaseId];
  return id !== undefined && isBedId(id) ? id : null;
}

export interface BedEngine {
  /** Create/resume the context; call from a user gesture. */
  enable(): Promise<void>;
  /** Crossfade to a bed (null = fade out). The same bed is a no-op; a bed resumes where it left off. */
  play(id: BedId | null): void;
  setMuted(muted: boolean): void;
  /** A paused game holds the bed where it is. */
  setPaused(paused: boolean): void;
  /** A cue is playing: dip for a second. */
  duck(): void;
  current(): BedId | null;
}

const FADE_S = 1.5;
const LOOKAHEAD_S = 0.6;

interface Running {
  id: BedId;
  out: GainNode;
  next: number;
  timer: ReturnType<typeof setInterval> | null;
}

export function createBedEngine(): BedEngine {
  let ctx: AudioContext | null = null;
  // The design harness reads which bed plays under each phase (evidence, never a control).
  const probe = window as unknown as { __pbBeds?: { current(): BedId | null } };
  probe.__pbBeds = { current: () => running?.id ?? null };
  let master: GainNode | null = null;
  let muted = false;
  let paused = false;
  let want: BedId | null = null;
  let running: Running | null = null;
  /** Where each bed stopped, so it continues rather than restarts. */
  const bars: Partial<Record<BedId, number>> = {};

  const schedule = (r: Running): void => {
    if (!ctx) return;
    const bed = BEDS[r.id];
    const barLen = (60 / bed.bpm) * 4;
    while (r.next < ctx.currentTime + LOOKAHEAD_S) {
      const i = bars[r.id] ?? 0;
      bed.bar(ctx, r.out, r.next, i);
      bars[r.id] = i + 1;
      r.next += barLen;
    }
  };

  const stopRunning = (fade: boolean): void => {
    if (!running || !ctx) return;
    const r = running;
    running = null;
    if (r.timer) clearInterval(r.timer);
    const now = ctx.currentTime;
    r.out.gain.cancelScheduledValues(now);
    r.out.gain.setTargetAtTime(0.0001, now, fade ? FADE_S / 4 : 0.02);
    setTimeout(() => r.out.disconnect(), (fade ? FADE_S : 0.1) * 1000 + 200);
  };

  const startWanted = (): void => {
    if (!ctx || !master || !want || running?.id === want) return;
    stopRunning(true);
    const bed = BEDS[want];
    const out = ctx.createGain();
    out.gain.value = 0.0001;
    out.connect(master);
    const now = ctx.currentTime;
    out.gain.setTargetAtTime(bed.level, now, FADE_S / 4);
    const r: Running = { id: want, out, next: now + 0.05, timer: null };
    running = r;
    if (!paused) {
      schedule(r);
      r.timer = setInterval(() => schedule(r), 150);
    }
  };

  return {
    async enable() {
      try {
        const Ctor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return;
        if (!ctx) {
          ctx = new Ctor();
          // The design harness logs every oscillator as a cue; beds are not cues.
          (ctx as unknown as { __pbBed?: boolean }).__pbBed = true;
          master = ctx.createGain();
          master.gain.value = muted ? 0 : 1;
          master.connect(ctx.destination);
        }
        if (ctx.state !== 'running') await ctx.resume();
      } catch {
        ctx = null;
        master = null;
        return;
      }
      startWanted();
    },
    play(id) {
      if (id === want) return;
      want = id;
      if (!ctx || ctx.state !== 'running') return;
      if (id === null) stopRunning(true);
      else startWanted();
    },
    setMuted(value) {
      muted = value;
      if (master && ctx) master.gain.setTargetAtTime(value ? 0 : 1, ctx.currentTime, 0.05);
    },
    setPaused(value) {
      if (paused === value) return;
      paused = value;
      if (!running || !ctx) return;
      const r = running;
      if (value) {
        if (r.timer) clearInterval(r.timer);
        r.timer = null;
        r.out.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.1);
      } else {
        r.next = ctx.currentTime + 0.05;
        r.out.gain.setTargetAtTime(BEDS[r.id].level, ctx.currentTime, FADE_S / 4);
        schedule(r);
        r.timer = setInterval(() => schedule(r), 150);
      }
    },
    duck() {
      if (!running || !ctx || paused) return;
      const g = running.out.gain;
      const now = ctx.currentTime;
      g.cancelScheduledValues(now);
      g.setTargetAtTime(BEDS[running.id].level * 0.5, now, 0.05);
      g.setTargetAtTime(BEDS[running.id].level, now + 0.8, 0.3);
    },
    current: () => running?.id ?? null,
  };
}
