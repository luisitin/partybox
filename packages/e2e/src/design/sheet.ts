// Builds `contact-sheet.html` from a pass folder's `manifest.json`: one grid per group, one row per
// phase, every still labelled game / phase / device / role so a pass can be scanned on one page.
// Usage: tsx packages/e2e/src/design/sheet.ts --dir reports/design/<stamp>
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import type { Shot } from './shooter';

const { values } = parseArgs({ options: { dir: { type: 'string' } } });
if (!values.dir) throw new Error('--dir <pass folder> is required');
const dir = values.dir;
const shots = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8')) as Shot[];

const esc = (s: string): string =>
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const groups = new Map<string, Map<string, Shot[]>>();
for (const shot of shots) {
  const phases = groups.get(shot.group) ?? new Map<string, Shot[]>();
  const list = phases.get(shot.phase) ?? [];
  list.push(shot);
  phases.set(shot.phase, list);
  groups.set(shot.group, phases);
}

const card = (s: Shot): string => {
  const isTv = s.device.startsWith('tv');
  return `<figure class="${isTv ? 'tv' : 'phone'}${s.device === 'landscape' ? ' wide' : ''}">
  <a href="${s.file}" target="_blank"><img src="${s.file}" loading="lazy" alt="${esc(s.phase)} ${esc(s.device)} ${esc(s.role)}"></a>
  <figcaption><b>${esc(s.deviceLabel)}</b> · ${esc(s.role)}${s.note ? `<br><i>${esc(s.note)}</i>` : ''}</figcaption>
</figure>`;
};

let body = '';
for (const [group, phases] of groups) {
  body += `<h1 id="${esc(group)}">${esc(group)}</h1>\n`;
  for (const [phase, list] of phases) {
    const sorted = [...list].sort((a, b) =>
      a.device.startsWith('tv') === b.device.startsWith('tv')
        ? 0
        : a.device.startsWith('tv')
          ? -1
          : 1,
    );
    body += `<section><h2>${esc(group)} / ${esc(phase)}</h2><div class="row">${sorted.map(card).join('')}</div></section>\n`;
  }
}

const nav = [...groups.keys()].map((g) => `<a href="#${esc(g)}">${esc(g)}</a>`).join(' · ');
const html = `<!doctype html><meta charset="utf-8"><title>PartyBox design pass — ${esc(dir)}</title>
<style>
body{margin:0;padding:24px;background:#111;color:#eee;font:14px system-ui,sans-serif}
nav{position:sticky;top:0;background:#111;padding:8px 0;border-bottom:1px solid #333;margin-bottom:16px}
h1{font-size:28px;margin:32px 0 8px;color:#ffd166}h2{font-size:16px;margin:24px 0 8px;color:#b3b7d9;font-weight:600}
.row{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start}
figure{margin:0;background:#1c1e3a;border-radius:8px;padding:6px}
figure img{display:block;border-radius:4px;background:#000}
.tv img{width:640px}.phone img{width:180px}.wide img{width:390px}
figcaption{margin-top:6px;font-size:12px;color:#b3b7d9;max-width:640px}
.phone figcaption{max-width:180px}.wide figcaption{max-width:390px}
</style>
<nav>${shots.length} stills · ${nav}</nav>
${body}`;
writeFileSync(join(dir, 'contact-sheet.html'), html);
console.log(`contact sheet → ${join(dir, 'contact-sheet.html')} (${shots.length} stills)`);
