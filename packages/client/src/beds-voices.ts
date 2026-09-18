// The synth voices the music beds are built from (ADR-032): one oscillator note, a noise hat, a
// soft kick and a brushed snare, plus the MIDI-to-hertz helper. Split out of beds-library.ts when
// the library outgrew the 300-line cap (review-loop #161).

interface Voice {
  f: number;
  at: number;
  d: number;
  t?: OscillatorType;
  g?: number;
  a?: number;
  detune?: number;
}

export const hz = (midi: number): number => 440 * 2 ** ((midi - 69) / 12);

export function voice(ctx: AudioContext, out: GainNode, v: Voice): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = v.t ?? 'sine';
  osc.frequency.value = v.f;
  osc.detune.value = v.detune ?? 0;
  gain.gain.setValueAtTime(0.0001, v.at);
  gain.gain.exponentialRampToValueAtTime(v.g ?? 0.1, v.at + (v.a ?? 0.01));
  gain.gain.exponentialRampToValueAtTime(0.0001, v.at + v.d);
  osc.connect(gain).connect(out);
  osc.start(v.at);
  osc.stop(v.at + v.d + 0.05);
}

/** A soft kick: a pitch drop with a short tail. */
export function kick(ctx: AudioContext, out: GainNode, at: number, g: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(120, at);
  osc.frequency.exponentialRampToValueAtTime(45, at + 0.12);
  gain.gain.setValueAtTime(g, at);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);
  osc.connect(gain).connect(out);
  osc.start(at);
  osc.stop(at + 0.25);
}

/** A brushed snare: a band of noise with a quick decay. */
export function snare(ctx: AudioContext, out: GainNode, at: number, g: number): void {
  const len = 0.12;
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * len), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i += 1)
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 1200;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 5000;
  const gain = ctx.createGain();
  gain.gain.value = g;
  src.connect(hp).connect(lp).connect(gain).connect(out);
  src.start(at);
}

/** A 30 ms burst of high-passed noise: a brushed hat or a shaker. */
export function hat(ctx: AudioContext, out: GainNode, at: number, g: number): void {
  const len = 0.03;
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * len), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i += 1)
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 6000;
  const gain = ctx.createGain();
  gain.gain.value = g;
  src.connect(hp).connect(gain).connect(out);
  src.start(at);
}
