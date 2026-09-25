// Stills of the results screens after a three-way tie (tune-in's review): every tied winner named
// in the headline, the gold outline on each of them, and one award card per award with all its
// winners — including a shared award no game's fixture produces (so the results are put on the
// room as given, /api/dev/results), one whose line differs per winner, and "with …" on the phone
// of a player who shares one. TV + a phone (SE), English and Spanish. Always pass --build after a
// client change: without it the prebuilt client is served.
// Usage: tsx packages/e2e/src/design/capture-results-tie.ts [--out <dir>] [--port 42303] [--build]
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';
import type { DeviceId } from './devices';
import { DEVICES } from './devices';
import { startProdServer } from './prod-server';
import { REPO_ROOT } from './server';
import type { Phone } from './session';
import { CONTEXT_BASE, DevApi, applyDeviceCss, joinViaForm, passAudioGate, phoneUrl, settle } from './session'; // prettier-ignore

const { values } = parseArgs({
  options: {
    out: { type: 'string' },
    port: { type: 'string', default: '42303' },
    build: { type: 'boolean', default: false },
  },
});
const OUT =
  values.out ?? join(REPO_ROOT, 'reports', 'design', 'record-review', 'foundation', 'results-tie'); // prettier-ignore

async function open(browser: Browser, url: string, device: DeviceId, lang: string): Promise<Page> {
  const context = await browser.newContext({
    ...DEVICES[device].options,
    ...CONTEXT_BASE,
    locale: lang === 'es' ? 'es-ES' : 'en-US',
  });
  const page = await context.newPage();
  await page.goto(url);
  await applyDeviceCss(page, device);
  return page;
}

async function run(browser: Browser, url: string, api: DevApi, lang: string): Promise<void> {
  await api.reset();
  const tv = await open(browser, `${url}/tv`, 'tv', lang);
  await tv.waitForSelector('[data-surface="tv"]');
  await passAudioGate(tv);
  const page = await open(browser, await phoneUrl(url), 'iphone-se', lang);
  await page.waitForSelector('[data-surface="controller"]');
  const sam: Phone = { device: 'iphone-se', context: page.context(), page, name: 'Sam', playerId: null }; // prettier-ignore
  await joinViaForm(sam, api, { avatarIndex: 2 });
  try {
    const players = [
      ['p-ana', 'Ana', 'fox'],
      ['p-ben', 'Ben', 'owl'],
      ['p-cleo', 'Cleo', 'frog'],
      ['p-dev', 'Dev', 'panda'],
    ].map(([id, name, avatarId]) => ({ id, name, avatarId }));
    // Sam (this phone) shares an award too, so the phone shows "… with Ana"
    const state = (await api.state()) as { room?: { vipId?: string | null } | null };
    const me = state.room?.vipId ?? 'p-sam';
    players.push({ id: me, name: 'Sam', avatarId: 'cat' });
    const award = (id: string, title: string, description: string, playerId: string) => ({ id, title, description, playerId }); // prettier-ignore
    await api.post('/api/dev/results', {
      results: {
        gameId: 'wisecrack',
        players,
        results: {
          scores: { 'p-ana': 1050, 'p-ben': 1050, 'p-cleo': 1050, 'p-dev': 300, [me]: 200 },
          ranking: [
            { playerId: 'p-ana', score: 1050, rank: 1 },
            { playerId: 'p-ben', score: 1050, rank: 1 },
            { playerId: 'p-cleo', score: 1050, rank: 1 },
            { playerId: 'p-dev', score: 300, rank: 4 },
            { playerId: me, score: 200, rank: 5 },
          ],
          winnerIds: ['p-ana', 'p-ben', 'p-cleo'],
          awards: [
            award('crowd', 'Crowd favourite', 'Most votes received: 6', 'p-cleo'),
            award('sweep', 'Sweep master', 'Unanimous wins: 2', 'p-ana'),
            award('sweep', 'Sweep master', 'Unanimous wins: 2', 'p-ben'),
            award('speed', 'Speed writer', 'Answers in before half time: 4', 'p-ana'),
            award('speed', 'Speed writer', 'Answers in before half time: 3', me),
          ],
        },
      },
    });
    await settle(4500); // the board lands, the headline and awards follow
    await tv.screenshot({ path: join(OUT, `${lang}-tv-results.png`) });
    await page.screenshot({ path: join(OUT, `${lang}-iphone-se-results.png`) });
  } finally {
    for (const p of [page, tv]) await p.context().close();
  }
}

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  const server = await startProdServer(Number(values.port), { build: values.build });
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  try {
    for (const lang of ['en', 'es']) await run(browser, server.url, api, lang);
  } finally {
    await browser.close();
    await server.stop();
  }
  console.log(`stills → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
