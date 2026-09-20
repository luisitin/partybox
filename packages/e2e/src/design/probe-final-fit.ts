// Measures the Lightning Round TV final reveal at 16 players: the `.page` size container's height
// (the compact rules switch on below 560 px), the answer bar, the row height and where the last row
// ends against the host bar. Usage: tsx packages/e2e/src/design/probe-final-fit.ts [--port 42126]
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { startServer } from './server';
import { DevApi, joinViaForm, openPhone, openTv, passAudioGate, settle } from './session';

const { values } = parseArgs({ options: { port: { type: 'string', default: '42126' } } });

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
    await api.bots(15, 'random');
    await api.post('/api/dev/start', {
      gameId: 'lightning-round',
      seed: 5,
      settings: { questions: 2, answerSeconds: 8 },
    });
    for (let i = 0; i < 40; i += 1) {
      const s = await api.state();
      const st = s.room?.game?.state as
        { phase: { id: string }; index?: number; questionIds?: string[] } | undefined;
      if (!st) break;
      if (st.phase.id === 'reveal' && st.index === (st.questionIds?.length ?? 0) - 1) break;
      await settle(300);
      await api.skip().catch(() => undefined);
    }
    await settle(1500);
    const m = await tv.evaluate(`(() => {
      const q = (sel) => { const e = document.querySelector(sel); return e ? e.getBoundingClientRect() : null; };
      const page = document.querySelector('[class*="page"]');
      const rows = [...document.querySelectorAll('[class*="rowFinal"]')];
      const last = rows.length ? rows[rows.length - 1].getBoundingClientRect() : null;
      const host = q('[class*="hostBar"], [class*="HostBar"], footer');
      const ans = q('[class*="answer"]');
      const chain = []; let el = rows.length ? rows[0].parentElement : null;
      while (el && el !== document.body) { chain.push(el.tagName + '.' + el.className + '@' + Math.round(el.getBoundingClientRect().height)); el = el.parentElement; }
      return {
        chain,
        page: page ? { h: page.getBoundingClientRect().height, cls: page.className } : null,
        answer: ans ? ans.height : null,
        rows: rows.length,
        rowH: rows.length ? rows[0].getBoundingClientRect().height : null,
        rowFont: rows.length ? getComputedStyle(rows[0]).fontSize : null,
        lastBottom: last ? last.bottom : null,
        hostTop: host ? host.top : null,
      };
    })()`);
    console.log(JSON.stringify(m, null, 2));
  } finally {
    await browser.close();
    await server.stop();
  }
}
void main();
