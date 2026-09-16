// The caller: the TV speaks every number (owner pick 2026-09-15 — Windows "Zira", lively: rate
// 1.15, pitch 1.1, plain "B, 12"). Web Speech API: no audio files, works offline with the
// voices the TV's PC has; falls back to the browser's default English voice. Silent when the TV
// is muted (the shell's 🔊 toggle) or when the browser has no speech at all. Never on phones —
// only the Tv component calls this.
const MUTE_KEY = 'partybox:muted';
const PREFERRED = ['Zira', 'Google US English', 'Samantha'];
const RATE = 1.15;
const PITCH = 1.1;

// Chrome garbage-collects an utterance nobody references and the voice stops mid-word ("N…
// seven", or just "G"); it also drops the start of an utterance spoken in the same tick as
// `cancel()`. So: keep the current utterance here until it ends, and only cancel when something
// is actually speaking, a breath before the next call.
let current: SpeechSynthesisUtterance | null = null;
const CANCEL_GAP_MS = 80;

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
    speechSynthesis.speak(utterance);
  };
  const say = (): void => {
    if (cancelled || spoken) return;
    spoken = true;
    if (speechSynthesis.speaking || speechSynthesis.pending) {
      speechSynthesis.cancel();
      setTimeout(speak, CANCEL_GAP_MS);
    } else speak();
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
  current = null;
  if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
}
