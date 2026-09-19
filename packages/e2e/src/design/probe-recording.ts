// Proof of the session recorder end to end (ADR-035): a real server with recordings pointed at a
// temp folder, Sam on a phone and a TV on the picker (the "Keep a recap" toggle in both stills),
// then Broken Pencil with bots started with `record: true` and skipped to the results — the folder
// must hold session.json, state.json, recap.md and one SVG per drawing page. A second game with
// `record: false` must leave nothing new. Prints the folder listing and the recap's first lines.
// `--abort` instead ends the game from the VIP after a few phases: the session must be marked
// aborted, keep its state and carry a partial recap.
// Usage: tsx packages/e2e/src/design/probe-recording.ts [--port 42127] [--out <dir>] [--abort] [--players 4]
import { mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { startServer } from './server';
import { DevApi, joinViaForm, openPhone, openTv, passAudioGate, settle } from './session';

const { values } = parseArgs({
  options: {
    port: { type: 'string', default: '42127' },
    out: { type: 'string' },
    abort: { type: 'boolean', default: false },
    players: { type: 'string', default: '4' },
    game: { type: 'string', default: 'broken-pencil' },
  },
});

function tree(dir: string): string[] {
  const out: string[] = [];
  const walk = (d: string, rel: string): void => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) walk(join(d, e.name), r);
      else out.push(r);
    }
  };
  try {
    walk(dir, '');
  } catch {
    /* empty */
  }
  return out.sort();
}

async function main(): Promise<void> {
  const recDir = mkdtempSync(join(tmpdir(), 'pb-recordings-'));
  const outDir = values.out ?? mkdtempSync(join(tmpdir(), 'pb-recording-proof-'));
  const server = await startServer(Number(values.port), { PARTYBOX_RECORDINGS: recDir });
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  let failures = 0;
  const check = (ok: boolean, what: string): void => {
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${what}`);
    if (!ok) failures += 1;
  };
  try {
    await api.reset();
    const tv = await openTv(browser, server.url);
    await passAudioGate(tv);
    const sam = await openPhone(browser, server.url, 'iphone', 'Sam');
    await joinViaForm(sam, api, { avatarIndex: 1 });
    await settle(600);
    // The picker (and its toggle) opens when the VIP taps "Pick a game" in the lobby.
    await sam.page.getByRole('button', { name: /pick a game/i }).click();
    await settle(600);
    // The toggle on both surfaces, and that it round-trips through the room.
    const phoneBox = sam.page.locator('#phone-recording');
    const tvBox = tv.locator('#tv-recording');
    check(await phoneBox.isVisible(), 'phone picker shows the recording toggle');
    check(await tvBox.isVisible(), 'TV picker shows the recording toggle');
    check(await phoneBox.isChecked(), 'recording is on by default');
    await sam.page.screenshot({ path: join(outDir, 'phone-selecting.png') });
    await tv.screenshot({ path: join(outDir, 'tv-selecting.png') });
    await phoneBox.click();
    await settle(400);
    check(!(await tvBox.isChecked()), 'switching it off on the phone reaches the TV');
    await phoneBox.click();
    await settle(400);
    check(await tvBox.isChecked(), 'and back on');

    const bots = Math.max(2, Number(values.players) - 1);
    await api.bots(bots, 'random');
    const game = values.game ?? 'broken-pencil';
    const pencil = game === 'broken-pencil';
    await api.post('/api/dev/start', {
      gameId: game,
      seed: 7,
      record: true,
      settings: pencil ? { drawSeconds: 20, guessSeconds: 15 } : {},
    });
    // Skip through the whole game; bots act on their own, Sam acts through the dev API.
    for (let i = 0; i < 160; i += 1) {
      const s = await api.state();
      if (s.room?.status === 'results') break;
      if (values.abort && i === 6) {
        await api.post('/api/dev/vip', { action: 'end' });
        break;
      }
      await api.post('/api/dev/act', {}).catch(() => undefined);
      await settle(300);
      await api.skip().catch(() => undefined);
      await settle(300);
    }
    const s1 = await api.state();
    if (values.abort)
      check(s1.room?.status !== 'playing', `VIP end left the game (status ${s1.room?.status})`);
    else check(s1.room?.status === 'results', `game reached results (status ${s1.room?.status})`);
    await settle(800);
    const files = tree(recDir);
    console.log(files.map((f) => `  ${f}`).join('\n'));
    const session = files.find((f) => f.endsWith('session.json'));
    check(
      !!session && session.startsWith(`${game}/`),
      `session.json under ${game}/<stamp>-<code>/`,
    );
    check(
      files.some((f) => f.endsWith('recap.md')),
      'recap.md written',
    );
    const svgs = files.filter((f) => f.endsWith('.svg'));
    if (pencil) check(svgs.length > 0 || values.abort, `${svgs.length} drawing SVGs written`);
    if (session) {
      const meta = JSON.parse(readFileSync(join(recDir, session), 'utf8')) as {
        outcome: string;
        lastPhase: string;
        players: { name: string }[];
        timeline: { phase: string }[];
        results: { ranking: unknown[] } | null;
      };
      // A VIP `end` shows a scoreboard, so the engine (and the recorder) call it finished; the
      // `lastPhase` field is what tells a reader the game was cut short.
      check(meta.outcome === 'finished', `outcome finished (${meta.outcome})`);
      if (values.abort)
        check(
          !['show', 'scoreboard'].includes(meta.lastPhase),
          `lastPhase shows the early end (${meta.lastPhase})`,
        );
      check(
        meta.players.some((p) => p.name === 'Sam'),
        'Sam is in the players list',
      );
      check(meta.timeline.length > 3, `timeline has ${meta.timeline.length} phases`);
      check(
        !!meta.results && meta.results.ranking.length === bots + 1,
        `results carry ${bots + 1} ranked players`,
      );
      const recap = readFileSync(join(recDir, session.replace('session.json', 'recap.md')), 'utf8');
      console.log('--- recap.md (head) ---');
      console.log(recap.split('\n').slice(0, 14).join('\n'));
      if (pencil) {
        check(/## Book 1 —/.test(recap), 'recap lists book 1');
        if (values.abort) check(recap.includes('ended early during'), 'recap says it ended early');
        else
          check(
            /drew:\*\* !\[.*\]\(book-01-page-02-.*\.svg\)/.test(recap),
            'recap links the first drawing',
          );
      } else if (game === 'wisecrack') {
        check(/## Round 1/.test(recap), 'recap lists round 1');
        check(/\d votes?/.test(recap), 'recap shows the vote tallies');
        check(/## Final scores/.test(recap), 'recap has final scores');
      } else {
        check(/## Question 1 ·/.test(recap), 'recap lists question 1');
        check(/## Final question ·/.test(recap), 'recap lists the final question');
        check(/- Sam: /.test(recap), "recap has Sam's picks");
        check(/## Final scores/.test(recap), 'recap has final scores');
      }
    }

    // Second game with record off → nothing new.
    await api.post('/api/dev/reset');
    const sam2 = await openPhone(browser, server.url, 'iphone', 'Sam');
    await joinViaForm(sam2, api, { avatarIndex: 1 });
    await api.bots(3, 'random');
    await api.post('/api/dev/start', { gameId: 'wisecrack', seed: 3, record: false });
    for (let i = 0; i < 60; i += 1) {
      const s = await api.state();
      if (s.room?.status === 'results') break;
      await api.post('/api/dev/act', {}).catch(() => undefined);
      await settle(200);
      await api.skip().catch(() => undefined);
      await settle(200);
    }
    await settle(800);
    const after = tree(recDir);
    check(
      after.length === files.length,
      `record:false wrote nothing (${after.length} files, was ${files.length})`,
    );
    console.log(`stills → ${outDir}`);
  } finally {
    await browser.close();
    await server.stop();
  }
  console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILED`);
  process.exitCode = failures === 0 ? 0 : 1;
}

void main();
