// One-off: computed font sizes / boxes of key TV + phone elements for the design report.
// (evaluate() bodies are strings: tsx's keepNames helper is not defined inside the page.)
import { chromium } from 'playwright';
import { startServer } from './server';
import { DevApi, joinViaForm, openPhone, openTv, passAudioGate, settle } from './session';

const PROBE = `(() => {
  const q = (s) => document.querySelector(s);
  const fs = (el) => (el ? getComputedStyle(el).fontSize : null);
  const ff = (el) => (el ? getComputedStyle(el).fontFamily.slice(0, 30) : null);
  const box = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
  return {
    bodyFont: fs(document.body),
    gateTitle: fs(q('[class*="gateTitle"]')), gateHint: fs(q('[class*="gateHint"]')),
    muted: fs(q('.pb-muted')),
    chipName: fs(q('[class*="chip"] [class*="name"]')), chipBox: box(q('[class*="chip"]')),
    chipAvatar: box(q('[class*="chip"] svg')), crown: fs(q('[class*="crown"]')),
    toasts: box(q('[class*="toasts"]')), controls: box(q('[class*="controls"]')),
    headerUrl: fs(q('header [class*="url"]')), headerQr: box(q('header [class*="qr"]')),
    timer: fs(q('[role="timer"]')), timerBox: box(q('[role="timer"]')),
    vipPill: fs(q('[class*="_vip_"]')), description: fs(q('[class*="description"]')),
    textarea: fs(q('textarea')), textareaFamily: ff(q('textarea')), inputFamily: ff(q('input')),
    banner: fs(q('[class*="banner"]')), dot: box(q('[class*="dot"]')), code: box(q('header [class*="code"]')),
    meName: box(q('[class*="meName"]')),
  };
})()`;

const server = await startServer(42071);
const api = new DevApi(server.url);
const browser = await chromium.launch();
try {
  await api.reset();
  const tv = await openTv(browser, server.url);
  console.log('TV gate', JSON.stringify(await tv.evaluate(PROBE)));
  await passAudioGate(tv);
  const p = await openPhone(browser, server.url, 'iphone-se', 'Maximiliano Vega');
  await joinViaForm(p, api);
  await api.bots(3, 'idle');
  await settle(500);
  console.log('TV lobby', JSON.stringify(await tv.evaluate(PROBE)));
  await p.page.getByRole('button', { name: /pick a game/i }).click();
  await settle(400);
  console.log('TV selecting', JSON.stringify(await tv.evaluate(PROBE)));
  await api.clock(true);
  await api.start('quickpoll', 1);
  await settle(800);
  console.log('TV playing', JSON.stringify(await tv.evaluate(PROBE)));
  console.log('SE playing', JSON.stringify(await p.page.evaluate(PROBE)));
} finally {
  await browser.close();
  await server.stop();
}
