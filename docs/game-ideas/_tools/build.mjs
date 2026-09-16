// Builds every idea document from docs/game-ideas/_src/*.mjs into NNN-<slug>.html using
// _template.html, then regenerates INDEX.html and INDEX.md (table + coverage matrix).
//
//   node docs/game-ideas/_tools/build.mjs            # all ideas
//   node docs/game-ideas/_tools/build.mjs 001        # one idea
//
// An idea module exports `meta` (header-card fields + matrix axes) and `sections` (16 entries,
// s0..s15, each { title, html }). No dependencies; run with Node >= 20.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const srcDir = join(root, '_src');
const template = readFileSync(join(root, '_template.html'), 'utf8');
const only = process.argv[2] ?? null;

export const SECTION_TITLES = [
  'Header card',
  'The hook',
  "A round from a player's seat",
  'Complete rules',
  'Phase flow table',
  'Screens',
  'Data model',
  'Reducer logic',
  'Scoring',
  'Content',
  'Edge cases',
  'Art & sound direction',
  'Accessibility & TV readability',
  'Implementation plan',
  'Open questions',
  'Self-review scorecard',
  'Prior art & references',
];

export const AXES = {
  interaction: ['text', 'choice', 'vote', 'draw', 'timing', 'ranking', 'gesture', 'tap'],
  players: ['2–3', '4–8', '9–16'],
  duration: ['< 5', '5–10', '10–20'],
  structure: ['free-for-all', 'teams', 'hidden roles', 'co-op', 'elimination', 'traitor'],
  skill: [
    'wit',
    'knowledge',
    'speed',
    'deception',
    'drawing',
    'prediction',
    'memory',
    'rhythm',
    'luck',
  ],
  tone: ['silly', 'competitive', 'cozy', 'chaotic'],
  bots: ['welcome', 'no'],
};

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function headerCard(meta) {
  const rows = [
    ['Players', `${meta.players.min}–${meta.players.max} (sweet spot ${meta.players.sweet})`],
    ['Duration', meta.duration],
    ['Rounds', meta.rounds],
    ['Interaction', meta.interaction.join(' · ')],
    ['Tone', meta.tone.join(' · ')],
    ['Content rating', meta.contentRating],
    ['Difficulty', meta.difficulty],
    ['Version', meta.version],
    ['Date', meta.date],
  ];
  const bots = meta.bots ?? { supports: false, reason: 'not decided' };
  const botsCell = `<span class="bots ${bots.supports ? 'yes' : 'no'}">${bots.supports ? '🤖 supportsBots: true' : '🚫 supportsBots: false'}</span> ${esc(bots.reason)}`;
  return `
    <h1>${esc(meta.title)}</h1>
    <p class="pitch">${esc(meta.pitch)}</p>
    <div class="card">
      <dl class="meta">
        <div><dt>Status</dt><dd><span class="status">${esc(meta.status)}</span></dd></div>
        ${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
        <div><dt>Bots (ADR-028)</dt><dd>${botsCell}</dd></div>
        <div><dt>Matrix</dt><dd>${Object.entries(meta.axes)
          .map(([k, v]) => `<code>${esc(k)}: ${esc(Array.isArray(v) ? v.join('/') : v)}</code>`)
          .join(' ')}</dd></div>
      </dl>
    </div>`;
}

async function loadIdeas() {
  const files = readdirSync(srcDir)
    .filter((f) => /^\d{3}-.+\.mjs$/.test(f))
    .sort();
  const ideas = [];
  for (const file of files) {
    const mod = await import(pathToFileURL(join(srcDir, file)).href);
    ideas.push({ file, ...mod });
  }
  return ideas;
}

function renderIdea({ file, meta, sections }) {
  if (sections.length < 16 || sections.length > 17)
    throw new Error(
      `${file}: expected 16 sections (+ optional references), got ${sections.length}`,
    );
  const number = file.slice(0, 3);
  const slug = file.slice(4, -4);
  const toc = sections
    .map((s, i) => `<li><a href="#s${i}"><b>${i}</b>${esc(s.title ?? SECTION_TITLES[i])}</a></li>`)
    .join('\n          ');
  const body = sections
    .map((s, i) => {
      const inner =
        i === 0
          ? headerCard(meta) + (s.html ?? '')
          : `<h2><span class="n">${i}</span>${esc(s.title ?? SECTION_TITLES[i])}</h2>${s.html}`;
      return `<section id="s${i}">${inner}</section>`;
    })
    .join('\n');
  const html = template
    .replaceAll('{{TITLE}}', esc(meta.title))
    .replaceAll('{{NUMBER}}', number)
    .replaceAll('{{TOC}}', toc)
    .replaceAll('{{BODY}}', body)
    .replaceAll('{{GENERATED}}', meta.date)
    .replaceAll('{{SRC}}', file);
  const out = `${number}-${slug}.html`;
  writeFileSync(join(root, out), html);
  return { number, slug, out };
}

function matrix(ideas) {
  const lines = [];
  for (const [axis, values] of Object.entries(AXES)) {
    lines.push(`\n### ${axis}\n`);
    lines.push('| value | ideas |');
    lines.push('| --- | --- |');
    for (const v of values) {
      const valueOf = (i) =>
        axis === 'bots' ? [i.meta.bots?.supports ? 'welcome' : 'no'] : [].concat(i.meta.axes[axis]);
      const hits = ideas.filter((i) => valueOf(i).includes(v)).map((i) => i.file.slice(0, 3));
      lines.push(`| ${v} | ${hits.length ? hits.join(', ') : '—'} |`);
    }
  }
  return lines.join('\n');
}

function writeIndex(ideas, built) {
  const rowsMd = ideas.map(({ file, meta }, k) => {
    const b = built[k];
    return `| [${b.number}](${b.out}) | ${meta.title} | ${meta.status} | ${meta.players.min}–${meta.players.max} | ${meta.duration} | ${meta.difficulty} | ${meta.bots?.supports ? 'welcome' : 'no'} | ${meta.interaction.join('/')} | ${[].concat(meta.axes.structure).join('/')} | ${[].concat(meta.axes.skill).join('/')} | ${meta.tone.join('/')} |`;
  });
  const md = `# Game ideas — index

Generated by \`_tools/build.mjs\`; do not edit by hand (edit \`_src/NNN-<slug>.mjs\`). One self-contained
HTML document per idea; \`INDEX.html\` is the card grid. Status flow: idea → reviewed → approved → implemented.

| # | Title | Status | Players | Minutes | Difficulty | Bots | Interaction | Structure | Skill | Tone |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${rowsMd.join('\n')}

## Coverage matrix

Each new idea must differ from the previous three on at least two axes; every fifth idea fills the
emptiest cell. Cells marked — are open.
${matrix(ideas)}
`;
  writeFileSync(join(root, 'INDEX.md'), md);

  const cards = ideas
    .map(({ meta }, k) => {
      const b = built[k];
      return `<a class="card" href="${b.out}">
        <div class="num">${b.number}</div>
        <h2>${esc(meta.title)}</h2>
        <p>${esc(meta.pitch)}</p>
        <div class="row"><span class="status">${esc(meta.status)}</span><span>${meta.players.min}–${meta.players.max} players</span><span>${esc(meta.duration)}</span><span>size ${esc(meta.difficulty)}</span></div>
        <div class="tags">${meta.bots?.supports ? '<span class="bot">🤖 bots</span>' : ''}${[...meta.interaction, ...meta.tone].map((t) => `<span>${esc(t)}</span>`).join('')}</div>
      </a>`;
    })
    .join('\n');
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>PartyBox — game ideas</title>
    <style>
      :root { --bg:#0f1020; --surface:#1c1e3a; --surface-2:#272a52; --text:#f5f6ff; --muted:#b3b7d9; --accent:#ff5d8f; --accent-2:#ffd166; --line:#2a2d55; }
      body { margin:0; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; background:var(--bg); color:var(--text); padding:40px; }
      h1 { margin:0 0 8px; font-size:36px; }
      .sub { color:var(--muted); margin:0 0 32px; }
      .grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:20px; }
      a.card { display:block; background:var(--surface); border:1px solid var(--line); border-radius:16px; padding:20px; color:inherit; text-decoration:none; }
      a.card:hover { border-color:var(--accent); }
      .num { color:var(--accent-2); font-weight:800; font-size:13px; letter-spacing:.1em; }
      a.card h2 { margin:6px 0 8px; font-size:22px; }
      a.card p { color:var(--muted); margin:0 0 12px; font-size:14px; }
      .row { display:flex; gap:12px; flex-wrap:wrap; font-size:13px; color:var(--muted); align-items:center; }
      .status { background:var(--surface-2); color:var(--accent-2); border-radius:999px; padding:2px 10px; font-weight:800; font-size:11px; text-transform:uppercase; letter-spacing:.05em; }
      .tags { margin-top:10px; display:flex; gap:6px; flex-wrap:wrap; }
      .tags span { font-size:11px; background:var(--surface-2); border-radius:6px; padding:2px 8px; color:var(--muted); }
      .tags span.bot { color:var(--accent-2); font-weight:700; }
      .foot { color:var(--muted); font-size:13px; margin-top:32px; }
    </style>
  </head>
  <body>
    <h1>PartyBox — game ideas</h1>
    <p class="sub">${ideas.length} implementation-ready design document${ideas.length === 1 ? '' : 's'}. Coverage matrix in <code>INDEX.md</code>; SDK gaps in <code>sdk-requests.md</code>; digest in <code>LATEST.md</code>.</p>
    <div class="grid">
${cards}
    </div>
    <p class="foot">Generated by <code>_tools/build.mjs</code>.</p>
  </body>
</html>
`;
  writeFileSync(join(root, 'INDEX.html'), html);
}

const ideas = await loadIdeas();
const built = [];
for (const idea of ideas) {
  if (only && !idea.file.startsWith(only)) {
    built.push({
      number: idea.file.slice(0, 3),
      slug: idea.file.slice(4, -4),
      out: `${idea.file.slice(0, -4)}.html`,
    });
    continue;
  }
  const b = renderIdea(idea);
  built.push(b);
  console.log(`built ${b.out}`);
}
writeIndex(ideas, built);
console.log(`index: ${ideas.length} idea(s)`);
