// The synthesised cue vocabulary (ADR-012: no audio files, save the recorded 'cheer'): one entry
// per SoundCue, a list of notes the engine schedules on the Web Audio graph. Cue names are the
// design-system vocabulary (docs/DESIGN_SYSTEM.md); the type lives in the SDK.
import type { SoundCue } from '@partybox/game-sdk/ui';

export interface Note {
  freq: number;
  at: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  /** Slide the pitch to this frequency over the note (a "boing" up, a buzzer down). */
  to?: number;
}

export const CUES: Record<SoundCue, Note[]> = {
  // Sound enabled / unmuted (C5 → G5, ~250 ms): the TV proving its speakers work.
  ready: [
    { freq: 523, at: 0, dur: 0.08, type: 'triangle', gain: 0.12 },
    { freq: 784, at: 0.09, dur: 0.16, type: 'triangle', gain: 0.12 },
  ],
  // A game begins (selecting → playing): a G-major arpeggio with the held tail `phase` lacks.
  start: [
    { freq: 392, at: 0, dur: 0.1, type: 'triangle' },
    { freq: 523, at: 0.1, dur: 0.1, type: 'triangle' },
    { freq: 659, at: 0.2, dur: 0.1, type: 'triangle' },
    { freq: 784, at: 0.3, dur: 0.45, type: 'triangle', gain: 0.2 },
  ],
  join: [
    { freq: 523, at: 0, dur: 0.08 },
    { freq: 659, at: 0.09, dur: 0.12 },
  ],
  phase: [
    { freq: 392, at: 0, dur: 0.1, type: 'triangle' },
    { freq: 523, at: 0.1, dur: 0.1, type: 'triangle' },
    { freq: 784, at: 0.2, dur: 0.12, type: 'triangle' },
  ],
  // Pitched up per second via `countdownSemitones` (a major scale rising to the fifth).
  countdown: [{ freq: 880, at: 0, dur: 0.06, type: 'triangle', gain: 0.12 }],
  // Half-gain countdown for the phone's 5 s edge.
  tick: [{ freq: 880, at: 0, dur: 0.05, type: 'square', gain: 0.06 }],
  // Pickup, then resolve (~0.7 s): two soft E4 taps, a B4+E5 lift, a held B5+E6 chord.
  reveal: [
    { freq: 330, at: 0, dur: 0.09, type: 'triangle', gain: 0.14 },
    { freq: 330, at: 0.11, dur: 0.09, type: 'triangle', gain: 0.14 },
    { freq: 494, at: 0.3, dur: 0.14, type: 'sawtooth', gain: 0.09 },
    { freq: 659, at: 0.3, dur: 0.14, type: 'triangle', gain: 0.1 },
    { freq: 988, at: 0.44, dur: 0.26, type: 'sawtooth', gain: 0.08 },
    { freq: 1319, at: 0.44, dur: 0.26, type: 'sine', gain: 0.1 },
  ],
  // One card read out (Blanks): a two-note triangle pluck, soft enough to repeat every few seconds.
  card: [
    { freq: 880, at: 0, dur: 0.06, type: 'triangle', gain: 0.08 },
    { freq: 1175, at: 0.07, dur: 0.09, type: 'triangle', gain: 0.07 },
  ],
  win: [
    { freq: 523, at: 0, dur: 0.12 },
    { freq: 659, at: 0.13, dur: 0.12 },
    { freq: 784, at: 0.26, dur: 0.12 },
    { freq: 1047, at: 0.4, dur: 0.45 },
  ],
  // The VIP pauses: A4 → E4 settling. Resume plays `phase` (the room is back on).
  pause: [
    { freq: 440, at: 0, dur: 0.12, type: 'triangle', gain: 0.12 },
    { freq: 330, at: 0.14, dur: 0.24, type: 'triangle', gain: 0.12 },
  ],
  // A player is kicked, leaves, or a bot is removed: the mirror of `join`.
  leave: [
    { freq: 659, at: 0, dur: 0.08 },
    { freq: 523, at: 0.09, dur: 0.14 },
  ],
  // I-037 C: a tie — the `win` arpeggio that lands on a held Csus4 (F+G+C), not the tonic.
  tie: [
    { freq: 523, at: 0, dur: 0.12 },
    { freq: 659, at: 0.13, dur: 0.12 },
    { freq: 784, at: 0.26, dur: 0.12 },
    { freq: 698, at: 0.4, dur: 0.7, type: 'triangle', gain: 0.14 },
    { freq: 784, at: 0.4, dur: 0.7, type: 'triangle', gain: 0.12 },
    { freq: 1047, at: 0.4, dur: 0.7, type: 'triangle', gain: 0.1 },
  ],
  fanfare: [
    { freq: 523, at: 0, dur: 0.12 },
    { freq: 659, at: 0.13, dur: 0.12 },
    { freq: 784, at: 0.26, dur: 0.12 },
    { freq: 1047, at: 0.4, dur: 0.35 },
    { freq: 784, at: 0.78, dur: 0.1 },
    { freq: 1047, at: 0.9, dur: 0.1 },
    { freq: 1319, at: 1.02, dur: 0.14 },
    { freq: 1568, at: 1.18, dur: 0.6, type: 'triangle' },
    { freq: 784, at: 1.18, dur: 0.6, gain: 0.1 },
  ],
  // Final-wager reveal (Lightning): G-major so it does not duplicate the C-major 'win' that follows.
  jackpot: [
    { freq: 784, at: 0, dur: 0.06 },
    { freq: 988, at: 0.07, dur: 0.06 },
    { freq: 1175, at: 0.14, dur: 0.06 },
    { freq: 1568, at: 0.21, dur: 0.35, type: 'triangle', gain: 0.16 },
  ],
  bust: [
    { freq: 196, at: 0, dur: 0.3, type: 'triangle', gain: 0.14 },
    { freq: 185, at: 0.3, dur: 0.45, type: 'triangle', gain: 0.12 },
  ],
  // A faster cousin of 'win' for a Wisecrack sweep; never on plain wins.
  sweep: [
    { freq: 523, at: 0, dur: 0.09 },
    { freq: 659, at: 0.1, dur: 0.09 },
    { freq: 784, at: 0.2, dur: 0.09 },
    { freq: 1047, at: 0.3, dur: 0.35 },
  ],
  // The wager phase opens (Lightning).
  wager: [
    { freq: 330, at: 0, dur: 0.12, type: 'triangle' },
    { freq: 392, at: 0.13, dur: 0.12, type: 'triangle' },
    { freq: 494, at: 0.26, dur: 0.3, type: 'triangle', gain: 0.14 },
  ],
  // A scores / leaderboard phase (Wisecrack).
  tally: [
    { freq: 1319, at: 0, dur: 0.05, type: 'square', gain: 0.08 },
    { freq: 1760, at: 0.06, dur: 0.18, type: 'sine', gain: 0.14 },
  ],
  submit: [
    { freq: 660, at: 0, dur: 0.05 },
    { freq: 880, at: 0.05, dur: 0.07 },
  ],
  // A player locked in (TV strip): one soft high tick.
  lock: [{ freq: 1568, at: 0, dur: 0.04, type: 'triangle', gain: 0.08 }],
  // The claim went up (the phone, loop 240): a rising two-note "sent!" with a short body.
  claim: [
    { freq: 440, to: 660, at: 0, dur: 0.09, type: 'triangle', gain: 0.18 },
    { freq: 880, at: 0.1, dur: 0.14, type: 'triangle', gain: 0.16 },
    { freq: 120, at: 0, dur: 0.06, type: 'sine', gain: 0.14 },
  ],
  // The phone's own verdict card: right.
  correct: [
    { freq: 880, at: 0, dur: 0.07, type: 'triangle', gain: 0.12 },
    { freq: 1175, at: 0.08, dur: 0.16, type: 'triangle', gain: 0.12 },
  ],
  error: [{ freq: 150, at: 0, dur: 0.15, type: 'square', gain: 0.12 }],
  // A bouncy "boing-boing" for a new bingo call: two sine slides up, the second higher.
  call: [
    { freq: 392, to: 784, at: 0, dur: 0.11, gain: 0.2 },
    { freq: 587, to: 1175, at: 0.13, dur: 0.2, type: 'triangle', gain: 0.16 },
  ],
  // The wrong buzzer: two sawtooth slides down.
  wrong: [
    { freq: 220, to: 110, at: 0, dur: 0.26, type: 'sawtooth', gain: 0.13 },
    { freq: 196, to: 82, at: 0.3, dur: 0.45, type: 'sawtooth', gain: 0.13 },
  ],
  // Sampled (see SAMPLES) — the note list is empty so the synth has nothing to add.
  cheer: [],
  // A game maps a phase to this when it cues that phase itself later (no chime on entry).
  silence: [],
  // Someone has dibs on BINGO! (the TV, loop 252): a soft rising "hm?" — expectant, not a verdict.
  dibs: [
    { freq: 494, to: 659, at: 0, dur: 0.11, type: 'triangle', gain: 0.1 },
    { freq: 740, at: 0.12, dur: 0.1, type: 'sine', gain: 0.07 },
  ],
  // A dauber landing on paper (Bingo phones): a low damped thump with a click of body on top.
  daub: [
    { freq: 140, at: 0, dur: 0.08, type: 'triangle', gain: 0.22 },
    { freq: 90, at: 0.02, dur: 0.1, type: 'sine', gain: 0.16 },
    { freq: 2400, at: 0, dur: 0.012, type: 'square', gain: 0.05 },
  ],
  // One square to go on a phone (Bingo, loop 420): a hushed rising two-note "ooh" — a private
  // lean-in, quieter than `dibs` and a fifth lower so a call's voice always sits above it.
  close: [
    { freq: 392, to: 494, at: 0, dur: 0.12, type: 'triangle', gain: 0.07 },
    { freq: 587, at: 0.13, dur: 0.14, type: 'sine', gain: 0.05 },
  ],
};
