// Loudness of every background track, measured the way the TV hears them: decoded in Chromium
// (Web Audio) and reduced to RMS and peak in dBFS, so a new track can be set at a level that sits
// with the others (loop 420: the engine has one `volume` per plan, not per track).
// Usage: tsx packages/e2e/src/design/probe-loudness.ts [--port 42119]
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { TRACK_IDS } from '../../../client/src/music-tracks';
import { startServer } from './server';

const { values } = parseArgs({ options: { port: { type: 'string', default: '42119' } } });

const MEASURE = `
  async (id) => {
    const res = await fetch('/music/' + id + '.mp3');
    if (!res.ok) return { id, error: 'HTTP ' + res.status };
    const bytes = await res.arrayBuffer();
    const ctx = new OfflineAudioContext(1, 1, 44100);
    const buf = await ctx.decodeAudioData(bytes);
    const data = buf.getChannelData(0);
    let sum = 0, peak = 0;
    // Loudest 3 s window too (the intro of a track is what lands under the fade).
    const win = Math.round(buf.sampleRate * 3);
    let winSum = 0, winMax = 0;
    for (let i = 0; i < data.length; i += 1) {
      const v = data[i] * data[i];
      sum += v;
      if (Math.abs(data[i]) > peak) peak = Math.abs(data[i]);
      winSum += v;
      if (i >= win) winSum -= data[i - win] * data[i - win];
      if (i >= win && winSum > winMax) winMax = winSum;
    }
    const db = (x) => (20 * Math.log10(Math.max(x, 1e-9))).toFixed(1);
    return { id, seconds: buf.duration.toFixed(0), rms: db(Math.sqrt(sum / data.length)), loudest3s: db(Math.sqrt(winMax / win)), peak: db(peak) };
  }
`;

async function main(): Promise<void> {
  const server = await startServer(Number(values.port));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`${server.url}/tv`);
    console.log('track                        s    rms      loudest3s  peak (dBFS)');
    for (const id of TRACK_IDS) {
      const r = (await page.evaluate(`(${MEASURE})(${JSON.stringify(id)})`)) as Record<
        string,
        string
      >;
      console.log(
        `${id.padEnd(28)} ${String(r['seconds'] ?? '').padStart(4)} ${String(r['rms'] ?? r['error']).padStart(7)} ${String(r['loudest3s'] ?? '').padStart(9)} ${String(r['peak'] ?? '').padStart(7)}`,
      );
    }
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
