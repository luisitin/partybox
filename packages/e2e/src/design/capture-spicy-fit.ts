// The longest Wisecrack prompt on both surfaces: the spicy pack runs to 83 characters where the
// family pack stops at 60. Loads the vote and answer fixtures with the longest prompt of every pack
// swapped in (the room's real players take the fixture's seats) and checks that the TV's prompt clears
// the option cards and that the phone shows the whole prompt above the fold.
// Usage: tsx packages/e2e/src/design/capture-spicy-fit.ts [--port 42120]
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { REPO_ROOT, startServer } from './server';
import { DevApi, joinViaForm, openPhone, openTv, passAudioGate, settle } from './session';

const { values } = parseArgs({ options: { port: { type: 'string', default: '42120' } } });
const OUT = join(REPO_ROOT, 'reports', 'design', 'spicy-fit');
mkdirSync(OUT, { recursive: true });
const CONTENT = join(REPO_ROOT, 'games', 'wisecrack', 'content');
const FIXTURES = join(REPO_ROOT, 'games', 'wisecrack', 'fixtures');

interface Pack {
  prompts: { id: string; text: string }[];
}
function longest(file: string): { id: string; text: string } {
  const pack = JSON.parse(readFileSync(join(CONTENT, file), 'utf8')) as Pack;
  return [...pack.prompts].sort((a, b) => b.text.length - a.text.length)[0]!;
}

let failed = 0;
let passed = 0;
function check(label: string, ok: boolean, detail: string): void {
  if (ok) passed += 1;
  else failed += 1;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label} — ${detail}`);
}

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
    const priya = await openPhone(browser, server.url, 'iphone-se', 'Priya');
    await joinViaForm(priya, api, { avatarIndex: 4 });
    await api.bots(2, 'idle');
    const ids = Object.keys((await api.state()).room?.players ?? {});
    const samId = (await api.playerId('Sam')) ?? ids[0]!;
    const priyaId = (await api.playerId('Priya')) ?? ids[1]!;
    const bots = ids.filter((id) => id !== samId && id !== priyaId);
    // Sam and Priya take the two seats that do not author prompt 0 (they vote on it); bots author.
    const seats: Record<string, string> = {
      'p-cleo': samId,
      'p-dev': priyaId,
      'p-ana': bots[0]!,
      'p-ben': bots[1]!,
    };

    for (const pack of ['spicy.json', 'family.json']) {
      const prompt = longest(pack);
      for (const fixture of ['vote', 'answer']) {
        let raw = readFileSync(join(FIXTURES, `${fixture}.json`), 'utf8');
        for (const [from, to] of Object.entries(seats))
          raw = raw.split(`"${from}"`).join(`"${to}"`);
        const state = JSON.parse(raw) as {
          prompts: { text: string }[];
          players: Record<string, unknown>;
          phase: { startedAt: number; deadline: number };
          votes?: Record<string, unknown>;
        };
        state.prompts[0]!.text = prompt.text;
        // The fixture's deadline is years old: the loaded phase would end on the next tick.
        state.phase.startedAt = Date.now();
        state.phase.deadline = Date.now() + 60_000;
        state.votes = {}; // Sam's seat voted in the fixture; he must still see the vote list
        if (fixture === 'answer') for (const p of state.prompts) p.text = prompt.text;
        await api.post('/api/dev/load-state', {
          gameId: 'wisecrack',
          state,
          settings: { rounds: 2, answerSeconds: 60, spicy: pack === 'spicy.json' },
        });
        await settle(900);
        const tag = `${pack.replace('.json', '')}-${fixture}`;
        await tv.screenshot({ path: join(OUT, `${tag}-tv.png`) });
        await sam.page.screenshot({ path: join(OUT, `${tag}-sam.png`) });
        await priya.page.screenshot({ path: join(OUT, `${tag}-se.png`) });
        const label = `${pack} ${fixture} (${prompt.text.length} chars, ${prompt.id})`;
        if (fixture === 'vote') {
          const h1 = await tv
            .locator('p', { hasText: prompt.text.slice(0, 20) })
            .first()
            .boundingBox();
          const cards = await tv.locator('[data-surface="tv"] article').first().boundingBox();
          check(
            `TV ${label}: the prompt clears the first option card`,
            h1 !== null && cards !== null && h1.y + h1.height <= cards.y + 1,
            `h1 bottom ${h1 ? (h1.y + h1.height).toFixed(0) : '?'}, cards top ${cards?.y.toFixed(0)}`,
          );
          const over = (await tv.evaluate(
            'document.documentElement.scrollHeight - document.documentElement.clientHeight',
          )) as number;
          check(`TV ${label}: nothing below the fold`, over <= 0, `overflow ${over}px`);
        }
        for (const [who, page] of [
          ['iPhone', sam.page],
          ['SE', priya.page],
        ] as const) {
          const text = (await page.evaluate('document.body.innerText')) as string;
          const box = await page.getByText(prompt.text, { exact: false }).first().boundingBox();
          const vh = (await page.evaluate('window.innerHeight')) as number;
          check(
            `${who} ${label}: the whole prompt is on screen`,
            text.includes(prompt.text) && box !== null && box.y >= 0 && box.y + box.height <= vh,
            `box ${box ? `${box.y.toFixed(0)}–${(box.y + box.height).toFixed(0)}` : 'none'} of ${vh}`,
          );
        }
      }
    }
    console.log(`${passed}/${passed + failed} checks passed → reports/design/spicy-fit/`);
    if (failed) process.exitCode = 1;
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
