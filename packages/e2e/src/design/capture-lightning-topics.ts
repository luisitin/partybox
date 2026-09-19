// Lightning Round topics (ADR-034): the VIP picks a category on the phone, the Topics checklist
// appears with that category's topics only, two get ticked, the TV host panel mirrors it, and the
// game that starts draws from those topics — the intro pill and every question header say so.
// Usage: tsx packages/e2e/src/design/capture-lightning-topics.ts --out reports/design/lightning-topics [--port 42113] [--device iphone]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import type { DeviceId } from './devices';
import { REPO_ROOT, startServer } from './server';
import { DevApi, joinViaForm, openPhone, openTv, passAudioGate, settle } from './session';

const { values } = parseArgs({
  options: {
    out: { type: 'string' },
    port: { type: 'string', default: '42113' },
    device: { type: 'string', default: 'iphone' },
  },
});
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'lightning-topics');
const PORT = Number(values.port);
const DEVICE = (values.device ?? 'iphone') as DeviceId;

interface LightningState {
  settings: { category: string; subcategories: string[] };
  drawnFrom: string;
  drawnSubs?: string[];
  questionIds: string[];
}

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  const server = await startServer(PORT);
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  const lines: string[] = ['# Lightning Round — the Topics checklist', ''];
  const ok = (name: string, pass: boolean, detail: string): void => {
    lines.push(`- ${pass ? '✅' : '❌'} ${name} — ${detail}`);
    console.log(`${pass ? 'ok ' : 'FAIL'} ${name} — ${detail}`);
  };
  try {
    await api.reset();
    const tv = await openTv(browser, server.url);
    await passAudioGate(tv);
    const vip = await openPhone(browser, server.url, DEVICE, 'Sam');
    await joinViaForm(vip, api, { avatarIndex: 3 });
    await api.bots(2, 'idle');
    await vip.page.getByRole('button', { name: /pick a game/i }).click();
    await settle(400);
    await vip.page
      .getByRole('radio', { name: /lightning[ -]round/i })
      .first()
      .click();
    await settle(600);
    const settings = vip.page.getByRole('region', { name: /settings/i });
    await settings.first().scrollIntoViewIfNeeded();
    await settle(300);
    const chips = vip.page.getByRole('group', { name: /topics/i }).getByRole('checkbox');
    ok(
      'with "All categories" the Topics checklist stays out of the way',
      (await chips.count()) === 0,
      `checkboxes=${await chips.count()}`,
    );
    await vip.page.screenshot({ path: join(OUT, 'phone-all-categories.png'), fullPage: true });
    // Pick Sports: the checklist shows the eight sports topics.
    await vip.page.getByLabel(/^category/i).selectOption('sports');
    await settle(700);
    const sportsChips = await chips.count();
    ok('picking Sports shows the sports topics', sportsChips === 8, `checkboxes=${sportsChips}`);
    await vip.page.getByRole('group', { name: /topics/i }).scrollIntoViewIfNeeded();
    await settle(200);
    await vip.page.screenshot({ path: join(OUT, 'phone-sports-topics.png'), fullPage: true });
    await vip.page.getByRole('checkbox', { name: /^basketball$/i }).click();
    await settle(400);
    await vip.page.getByRole('checkbox', { name: /^soccer$/i }).click();
    await settle(700);
    let room = (await api.state()).room;
    const stored = String(
      (room as { settings?: Record<string, unknown> } | null)?.settings?.['subcategories'] ?? '',
    );
    ok(
      'two ticks store "basketball,soccer" (option order)',
      stored === 'basketball,soccer',
      `subcategories=${stored}`,
    );
    await vip.page.screenshot({ path: join(OUT, 'phone-two-ticked.png'), fullPage: true });
    await tv.screenshot({ path: join(OUT, 'tv-two-ticked.png') });
    const tvChecked = await tv.getByRole('checkbox', { checked: true }).count();
    ok(
      'the TV host panel mirrors the two ticks',
      tvChecked === 2,
      `checked on the TV=${tvChecked}`,
    );
    // Switching category drops the sports picks (engine, ADR-034).
    await vip.page.getByLabel(/^category/i).selectOption('stem');
    await settle(700);
    room = (await api.state()).room;
    const afterSwitch = String(
      (room as { settings?: Record<string, unknown> } | null)?.settings?.['subcategories'] ?? '',
    );
    ok(
      'switching to STEM drops the sports picks',
      afterSwitch === '',
      `subcategories=${JSON.stringify(afterSwitch)}`,
    );
    await vip.page.screenshot({ path: join(OUT, 'phone-stem-topics.png'), fullPage: true });
    // Back to sports with two topics; start; the draw honours them.
    await vip.page.getByLabel(/^category/i).selectOption('sports');
    await settle(500);
    await vip.page.getByRole('checkbox', { name: /^basketball$/i }).click();
    await vip.page.getByRole('checkbox', { name: /^soccer$/i }).click();
    await settle(500);
    await api.clock(true);
    // The dev API's start resets settings to the defaults: start from the phone, like a VIP would.
    await vip.page.getByRole('button', { name: /start lightning round/i }).click();
    await settle(1500);
    const g = (await api.state()).room?.game?.state as unknown as LightningState;
    ok(
      'the game draws from the two topics',
      g.drawnFrom === 'sports' && JSON.stringify(g.drawnSubs) === '["basketball","soccer"]',
      `drawnFrom=${g.drawnFrom} drawnSubs=${JSON.stringify(g.drawnSubs)} settings=${JSON.stringify(g.settings)}`,
    );
    // The TV sets the pill and the headers in CSS uppercase: compare case-insensitively.
    const pill = String(await tv.evaluate('document.body.innerText')).toLowerCase();
    ok(
      'the TV intro pill names the category and the topics',
      pill.includes('sports · basketball, soccer'),
      `text has "Sports · Basketball, Soccer": ${pill.includes('sports · basketball, soccer')}`,
    );
    await tv.screenshot({ path: join(OUT, 'tv-intro.png') });
    await api.skip();
    await settle(900);
    await tv.screenshot({ path: join(OUT, 'tv-question.png') });
    await vip.page.screenshot({ path: join(OUT, 'phone-question.png') });
    const q = String(await tv.evaluate('document.body.innerText'));
    ok(
      'the question header names the topic',
      /sports · (basketball|soccer) · (easy|medium|hard)/i.test(q),
      q.match(/sports · [a-z]+ · \w+/i)?.[0] ?? 'no header match',
    );
  } finally {
    writeFileSync(join(OUT, 'RESULT.md'), `${lines.join('\n')}\n`);
    await browser.close();
    await server.stop();
  }
  if (lines.some((l) => l.startsWith('- ❌'))) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
