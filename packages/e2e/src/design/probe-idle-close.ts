// An idle Wisecrack room (nobody writes): the TV ticked `lock` one second before the answer
// deadline and Sam's phone cued `error` at the close (loop, tie scenario). Polls the room state
// and Sam's phone through the last seconds of the answer phase and prints who counted as done,
// what the phone's error strip says, and every server effect.
// Usage: tsx packages/e2e/src/design/probe-idle-close.ts [--port 42125]
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { startServer } from './server';
import { DevApi, joinViaForm, openPhone, openTv, passAudioGate, settle } from './session';

const { values } = parseArgs({ options: { port: { type: 'string', default: '42125' } } });

async function main(): Promise<void> {
  const server = await startServer(Number(values.port));
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  try {
    await api.reset();
    const tv = await openTv(browser, server.url);
    await passAudioGate(tv);
    const sam = await openPhone(browser, server.url, 'iphone', 'Sam');
    await joinViaForm(sam, api, { avatarIndex: 1 });
    await api.bots(4, 'idle');
    await api.post('/api/dev/start', {
      gameId: 'wisecrack',
      seed: 2,
      settings: { answerSeconds: 30 },
    });
    await settle(600);
    await api.skip(); // intro → answer
    const s0 = await api.state();
    const deadline = s0.room?.game?.state.phase.deadline ?? 0;
    console.log(`answer deadline in ${((deadline - Date.now()) / 1000).toFixed(1)} s`);
    let last = '';
    while (Date.now() < deadline + 1500) {
      const s = await api.state();
      const st = s.room?.game?.state as {
        phase: { id: string };
        answers?: Record<string, unknown>;
        players?: Record<string, { connected: boolean }>;
      };
      const tvText = (await tv.evaluate('document.body.innerText')) as string;
      const m = /(\d+) \/ (\d+) answers in/.exec(tvText);
      const phoneErr = (await sam.page.evaluate(
        `(document.querySelector('[role="alert"]')?.textContent ?? '').trim()`,
      )) as string;
      const line = `${((deadline - Date.now()) / 1000).toFixed(2).padStart(6)} s  phase=${st?.phase?.id}  tv="${m?.[0] ?? '-'}"  answers=${JSON.stringify(st?.answers ?? null)?.slice(0, 120)}  phoneAlert="${phoneErr}"`;
      if (line.replace(/^.{8}/, '') !== last.replace(/^.{8}/, '')) console.log(line);
      last = line;
      await settle(200);
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
