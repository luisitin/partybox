// The phone shell's haptic patterns, split from ControllerShell.tsx (its line cap).
/** Haptic patterns (ms on/off) — docs/DESIGN_SYSTEM.md → Haptics. */
export const BUZZ: Record<
  'submit' | 'error' | 'prompt' | 'winner' | 'results' | 'back',
  number | number[]
> = {
  submit: 20,
  back: 30, // I-009 C: the link came back
  error: [40, 60, 40],
  prompt: [30, 50, 30],
  winner: [60, 60, 60, 60, 160],
  results: 40,
};
