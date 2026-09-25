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

type Scenario = 'tie' | 'many' | 'teams';

async function run(
  browser: Browser,
  url: string,
  api: DevApi,
  lang: string,
  device: DeviceId,
  scenario: Scenario,
): Promise<void> {
  await api.reset();
  const tv = await open(browser, `${url}/tv`, 'tv', lang);
  await tv.waitForSelector('[data-surface="tv"]');
  await passAudioGate(tv);
  const page = await open(browser, await phoneUrl(url), device, lang);
  await page.waitForSelector('[data-surface="controller"]');
  await applyDeviceCss(page, device);
  const sam: Phone = { device, context: page.context(), page, name: 'Sam', playerId: null };
  await joinViaForm(sam, api, { avatarIndex: 2 });
  try {
    const players = [
      ['p-ana', 'Ana', 'fox'],
      ['p-ben', 'Ben', 'owl'],
      ['p-cleo', 'Cleo', 'frog'],
      ['p-dev', 'Maximiliano Guadalupe', 'panda'],
    ].map(([id, name, avatarId]) => ({ id, name, avatarId }));
    // Sam (this phone) shares an award too, so the phone shows "… with Ana"
    const state = (await api.state()) as { room?: { vipId?: string | null } | null };
    const me = state.room?.vipId ?? 'p-sam';
    players.push({ id: me, name: 'Sam', avatarId: 'cat' });
    const award = (id: string, title: string, description: string, playerId: string) => ({ id, title, description, playerId }); // prettier-ignore
    const tie = scenario === 'tie';
    // 'many': one long-named winner and eight awards — the TV caps the cards at six (+ 2 more)
    const scores = tie
      ? { 'p-ana': 1050, 'p-ben': 1050, 'p-cleo': 1050, 'p-dev': 300, [me]: 200 }
      : { 'p-dev': 1200, 'p-ana': 1050, 'p-ben': 800, 'p-cleo': 300, [me]: 200 };
    const order = Object.entries(scores).sort((x, y) => y[1] - x[1]);
    const ranking = order.map(([playerId, score]) => ({ playerId, score, rank: 1 + order.filter(([, v]) => v > score).length })); // prettier-ignore
    const awards = tie
      ? [
          award('crowd', 'Crowd favourite', 'Most votes received: 6', 'p-cleo'),
          award('sweep', 'Sweep master', 'Unanimous wins: 2', 'p-ana'),
          award('sweep', 'Sweep master', 'Unanimous wins: 2', 'p-ben'),
          award('speed', 'Speed writer', 'Answers in before half time: 4', 'p-ana'),
          award('speed', 'Speed writer', 'Answers in before half time: 3', me),
        ]
      : ['crowd', 'sweep', 'speed', 'last', 'bold', 'quiet', 'close', 'lucky'].map(
          (id, i) =>
          award(id, `${id[0]?.toUpperCase()}${id.slice(1)} award`, `A line for award ${i + 1}`, players[i % players.length]?.id ?? me), // prettier-ignore
        );
    await api.post('/api/dev/results', {
      results: {
        gameId: 'wisecrack',
        players,
        results: {
          scores,
          ranking,
          winnerIds: scenario === 'teams' ? ['p-ben', 'p-cleo'] : tie ? ['p-ana', 'p-ben', 'p-cleo'] : ['p-dev'], // prettier-ignore
          awards: scenario === 'teams' ? awards.slice(0, 2) : awards,
          // ADR-052: a team game, Moon wins (its members first, the headline in its colour);
          // Maximiliano is in no team (they left), so the board ends on a "No team" group
          ...(scenario === 'teams'
            ? {
                outcome: {
                  kind: 'teams',
                  winner: 'moon',
                  teams: [
                    { id: 'sun', name: 'Sun', mark: '▲', color: 'var(--pb-accent-2)', members: ['p-ana', me] }, // prettier-ignore
                    { id: 'moon', name: 'Moon', mark: '●', color: 'var(--pb-info)', members: ['p-ben', 'p-cleo'] }, // prettier-ignore
                  ],
                },
              }
            : {}),
        },
      },
    });
    await settle(4500); // the board lands, the headline and awards follow
    if (device === 'iphone-se') await tv.screenshot({ path: join(OUT, `${lang}-tv-${scenario}.png`) }); // prettier-ignore
    await page.screenshot({ path: join(OUT, `${lang}-${device}-${scenario}.png`) });
    if (scenario === 'teams') {
      // this phone's team lost: a tap on its line brings its own group into view
      await page.getByRole('button', { name: /Your team|Tu equipo/ }).click();
      await settle(900);
      await page.screenshot({ path: join(OUT, `${lang}-${device}-${scenario}-mine.png`) });
    }
    // and scrolled to the end (at 200 % the chips move under the board)
    await page.evaluate(`[...document.querySelectorAll('*')].filter((e) => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight).forEach((e) => { e.scrollTop = e.scrollHeight; })`); // prettier-ignore
    await settle(600);
    await page.screenshot({ path: join(OUT, `${lang}-${device}-${scenario}-end.png`) });
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
    for (const lang of ['en', 'es'])
      for (const scenario of ['tie', 'many', 'teams'] as const)
        for (const device of ['iphone-se', 'font200'] as const)
          await run(browser, server.url, api, lang, device, scenario);
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
