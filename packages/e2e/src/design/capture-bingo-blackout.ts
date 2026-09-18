// After a line bingo on card 1 of 2, a phone picks "Keep going — blackout": the TV recorded at
// 10 fps through the celebration → the caller resuming under the Blackout pattern, plus the phone
// before and after (card 1 unlocked again, the pattern label swapped).
// Usage: tsx packages/e2e/src/design/capture-bingo-blackout.ts --out <dir> [--port 42106]
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { daubLine, skipToLine } from './bingo-lines';
import { REPO_ROOT, startServer } from './server';
import {
  DevApi,
  cutStrips,
  joinViaForm,
  openPhoneRecorded,
  openTvRecorded,
  passAudioGate,
  settle,
} from './session';
import { Shooter } from './shooter';

const { values } = parseArgs({
  options: { out: { type: 'string' }, port: { type: 'string', default: '42106' } },
});
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'latest');
const PORT = Number(values.port);
const G = 'bingo';

interface BingoState {
  round: { deck: number[]; drawn: number; cards: Record<string, number[][]>; pattern: string };
  phase: { id: string };
}

async function main(): Promise<void> {
  const server = await startServer(PORT);
  const api = new DevApi(server.url);
  const shots = new Shooter(OUT);
  const browser = await chromium.launch();
  const marks: { name: string; at: number; before?: number; seconds?: number }[] = [];
  const state = async (): Promise<BingoState> =>
    (await api.state()).room?.game?.state as unknown as BingoState;
  try {
    await api.reset();
    const rec = await openTvRecorded(browser, server.url, join(OUT, 'video'));
    const tv = rec.page;
    await passAudioGate(tv);
    const sam = await openPhoneRecorded(
      browser,
      server.url,
      'iphone',
      'Sam',
      join(OUT, 'video-phone'),
    );
    const phoneMarks: { name: string; at: number; before?: number; seconds?: number }[] = [];
    await joinViaForm(sam, api, { avatarIndex: 1 });
    const priya = await openPhoneRecorded(
      browser,
      server.url,
      'iphone-se',
      'Priya',
      join(OUT, 'video-priya'),
    );
    await joinViaForm(priya, api, { avatarIndex: 5 });
    const priyaMarks: { name: string; at: number; before?: number; seconds?: number }[] = [];
    await api.bots(1, 'idle');
    await api.post('/api/dev/start', {
      gameId: G,
      seed: 5,
      settings: { rounds: 1, round1: 'line', cards: 2, callSeconds: 60 },
    });
    await settle(500);
    await api.skip();
    const me = (await api.playerId('Sam')) ?? '';
    const { line, card } = await skipToLine(api, me);
    await daubLine(sam.page, line, card);
    await settle(300);
    phoneMarks.push({ name: 'phone-claim-hold', at: Date.now(), before: 0.2, seconds: 8.5 });
    priyaMarks.push({ name: 'other-phone-hold', at: Date.now(), before: 0.2, seconds: 8.5 });
    await sam.page.getByRole('button', { name: /^bingo! card 1$/i }).click();
    await sam.page.getByRole('button', { name: /tap again to claim/i }).dispatchEvent('click');
    await settle(8000);
    await shots.shot(sam.page, { group: G, phase: 'won-line', device: 'iphone', role: 'winner' });
    marks.push({ name: 'blackout-resume', at: Date.now(), before: 0.3, seconds: 4 });
    await sam.page.getByRole('button', { name: /keep going — blackout/i }).click();
    await settle(1200);
    await shots.shot(sam.page, { group: G, phase: 'blackout', device: 'iphone', role: 'winner' });
    await shots.shot(tv, { group: G, phase: 'blackout', device: 'tv', role: 'stage' });
    await api.skip();
    await settle(800);
    await shots.shot(sam.page, {
      group: G,
      phase: 'blackout-call',
      device: 'iphone',
      role: 'winner',
    });
    await shots.shot(tv, { group: G, phase: 'blackout-call', device: 'tv', role: 'stage' });
    console.log('pattern now:', (await state()).round.pattern);
    await cutStrips(sam, join(OUT, 'strips'), phoneMarks);
    await cutStrips(priya, join(OUT, 'strips'), priyaMarks);
    const video = await cutStrips(rec, join(OUT, 'strips'), marks);
    console.log(`captured ${shots.shots.length} stills; strips from ${video ?? '(no video)'}`);
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
