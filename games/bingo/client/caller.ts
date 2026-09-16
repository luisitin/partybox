// The caller: the TV speaks every number (owner pick 2026-09-15 — Windows "Zira", lively: rate
// 1.15, pitch 1.1, plain "B, 12"). Web Speech API: no audio files, works offline with the
// voices the TV's PC has; falls back to the browser's default English voice. Silent when the TV
// is muted (the shell's 🔊 toggle) or when the browser has no speech at all. Never on phones —
// only the Tv component calls this.
import { trace } from '@partybox/game-sdk/ui';

const MUTE_KEY = 'partybox:muted';
const PREFERRED = ['Zira', 'Google US English', 'Samantha'];
const RATE = 1.15;
const PITCH = 1.1;

// Chrome's speech synthesis needs babysitting: it garbage-collects an utterance nobody references
// and the voice stops mid-word ("N… seven", or just "G"); it drops the start of an utterance
// spoken in the same tick as `cancel()`; and its queue can stick after an interrupted utterance,
// after which every later call is queued silently and played back much later — a lobby that
// suddenly says "B, 9". So: keep the current utterance here until it ends, always clear the queue
// (a breath) before speaking, never let a call outlive its window, and let the shell cancel
// everything outside play.
let current: SpeechSynthesisUtterance | null = null;
const CANCEL_GAP_MS = 80;
/** A call is ~1.5 s; anything still "speaking" after this is a stuck queue. */
const WATCHDOG_MS = 4000;

function muted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices();
  for (const name of PREFERRED) {
    const hit = voices.find((v) => v.name.includes(name));
    if (hit) return hit;
  }
  return voices.find((v) => /^en/i.test(v.lang)) ?? voices[0] ?? null;
}

/** "B, 12." — the plain call style the owner chose (the comma is the caller's breath). */
export function callText(letter: string, number: number): string {
  return `${letter}, ${number}.`;
}

/**
 * Speak a call after `delayMs` (the "boing" cue lands first). A new call cancels the previous
 * one mid-sentence: the number on the stage is always the one being said.
 */
export function speakCall(letter: string, number: number, delayMs = 300): () => void {
  if (typeof speechSynthesis === 'undefined' || muted()) return () => undefined;
  let cancelled = false;
  let spoken = false;
  const speak = (): void => {
    if (cancelled) return;
    const utterance = new SpeechSynthesisUtterance(callText(letter, number));
    const voice = pickVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else utterance.lang = 'en-US';
    utterance.rate = RATE;
    utterance.pitch = PITCH;
    utterance.volume = 1;
    const release = (): void => {
      if (current === utterance) current = null;
    };
    utterance.addEventListener('end', release);
    utterance.addEventListener('error', release);
    current = utterance;
    if (speechSynthesis.paused) speechSynthesis.resume();
    trace('speak', { text: utterance.text, voice: voice?.name ?? null });
    speechSynthesis.speak(utterance);
    setTimeout(() => {
      if (current === utterance) {
        current = null;
        speechSynthesis.cancel(); // stuck: clear it so the next call is not queued behind it
      }
    }, WATCHDOG_MS);
  };
  const say = (): void => {
    if (cancelled || spoken) return;
    spoken = true;
    // Always clear the queue first (even when nothing reports as speaking — that is exactly the
    // stuck state), then a breath so the new call's first syllable is not swallowed.
    speechSynthesis.cancel();
    setTimeout(speak, CANCEL_GAP_MS);
  };
  const handle = setTimeout(() => {
    // Chrome loads its voice list asynchronously; wait for it once rather than speak in the
    // wrong voice.
    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.addEventListener('voiceschanged', say, { once: true });
      setTimeout(say, 800); // and a backstop for browsers that never fire it
    } else say();
  }, delayMs);
  return () => {
    cancelled = true;
    clearTimeout(handle);
  };
}

/** Stop talking (a phase change, a claim). */
export function hushCaller(): void {
  if (typeof speechSynthesis === 'undefined') return;
  trace('hush', { speaking: speechSynthesis.speaking, pending: speechSynthesis.pending });
  current = null;
  speechSynthesis.cancel();
}
