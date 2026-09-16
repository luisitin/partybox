// One simulation for /review-loop: a real-time round on 42071 with dev-API bots and two real phones,
// TV + one phone recorded on video, TV / active phone / waiting phone stills at every phase change,
// frame strips (10 fps) around each transition and over the last 5 s of every timer, the audio-cue
// log (cue, time, phase) and the TV's long-frame numbers.
// Usage: tsx packages/e2e/src/design/capture-loop.ts --pass 1 --game bingo --players 6
//        [--scenario normal|reconnect|vip-leaves|tie|spicy] [--focus tv|phone] [--budget 150] [--port 42071]
import { mkdirSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import type { Page } from 'playwright';
import { REPO_ROOT, startServer } from './server';
import { DevApi, joinViaForm, openPhone, passAudioGate, settle } from './session';
import type { Phone } from './session';
import { groupCues, HOOKS, strip } from './loop-tools';
import type { PhaseChange } from './loop-tools';

const { values } = parseArgs({
  options: {
    pass: { type: 'string', default: '1' },
    game: { type: 'string', default: 'bingo' },
    players: { type: 'string', default: '6' },
    scenario: { type: 'string', default: 'normal' },
    focus: { type: 'string', default: 'tv' },
    budget: { type: 'string', default: '150' },
    port: { type: 'string', default: '42071' },
    out: { type: 'string' },
  },
});
const PASS = values.pass ?? '1';
const GAME = values.game ?? 'bingo';
const PLAYERS = Number(values.players);
const SCENARIO = values.scenario ?? 'normal';
const BUDGET_MS = Number(values.budget) * 1000;
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'loop', PASS);

async function main(): Promise<void> {
  mkdirSync(join(OUT, 'stills'), { recursive: true });
  const server = await startServer(Number(values.port));
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  const changes: PhaseChange[] = [];
  const notes: string[] = [];
  let tvVideoT0 = 0;
  let phoneVideoT0 = 0;
  const phaseAt = (t: number): string =>
    [...changes].reverse().find((c) => c.t <= t)?.phase ?? 'lobby';
  try {
    await api.reset();
    const tvContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      colorScheme: 'dark',
      recordVideo: { dir: join(OUT, 'video', 'tv'), size: { width: 1920, height: 1080 } },
    });
    await tvContext.addInitScript(HOOKS);
    tvVideoT0 = Date.now();
    const tv = await tvContext.newPage();
    await tv.goto(`${server.url}/tv`);
    await tv.waitForSelector('[data-surface="tv"]');
    await passAudioGate(tv);

    // Phone A (Sam, VIP, recorded) and phone B (Priya).
    const openRecorded = async (name: string): Promise<Phone> => {
      const { DEVICES } = await import('./devices');
      const context = await browser.newContext({
        ...DEVICES.iphone.options,
        colorScheme: 'dark',
        recordVideo: {
          dir: join(OUT, 'video', 'phone'),
          size: DEVICES.iphone.options.viewport ?? { width: 390, height: 844 },
        },
      });
      await context.addInitScript(HOOKS);
      phoneVideoT0 = Date.now();
      const page = await context.newPage();
      await page.goto(`${server.url}/`);
      await page.waitForSelector('[data-surface="controller"]');
      return { device: 'iphone', context, page, name, playerId: null };
    };
    const sam = await openRecorded('Sam');
    await joinViaForm(sam, api, { avatarIndex: 3 });
    const priya = await openPhone(browser, server.url, 'pixel', 'Priya');
    await priya.context.addInitScript(HOOKS);
    await joinViaForm(priya, api, { avatarIndex: 6 });
    const bots = Math.max(0, PLAYERS - 2);
    if (bots > 0) await api.bots(bots, SCENARIO === 'tie' ? 'idle' : 'random');
    await settle(800);

    const still = async (page: Page, name: string): Promise<void> => {
      await page.screenshot({ path: join(OUT, 'stills', `${name}.png`) });
    };
    await still(tv, '00-lobby-tv');
    await still(sam.page, '00-lobby-phone-sam');
    const settings: Record<string, unknown> = SCENARIO === 'spicy' ? { spicy: true } : {};
    await api.post('/api/dev/start', { gameId: GAME, seed: Number(PASS) * 11, settings });
    const started = Date.now();
    let last = '';
    let n = 0;
    let acted = new Set<string>();
    let scenarioDone = false;
    const timerStrips: { phase: string; deadline: number }[] = [];
    while (Date.now() - started < BUDGET_MS) {
      const s = await api.state();
      const status = s.room?.status ?? 'none';
      const phase = s.room?.game?.state.phase.id ?? status;
      const key = `${status}:${phase}`;
      if (key !== last) {
        last = key;
        n += 1;
        const change: PhaseChange = {
          t: Date.now(),
          status,
          phase,
          deadline: s.room?.game?.state.phase.deadline ?? null,
        };
        changes.push(change);
        if (change.deadline) timerStrips.push({ phase, deadline: change.deadline });
        const tag = `${String(n).padStart(2, '0')}-${phase}`;
        await settle(450);
        await still(tv, `${tag}-tv`);
        await still(sam.page, `${tag}-phone-active`);
        // Priya acts first: her phone is the "waiting" (submitted) state of this phase.
        if (status === 'playing' && priya.playerId) {
          await api.post('/api/dev/act', { playerId: priya.playerId });
          await settle(500);
          await still(priya.page, `${tag}-phone-waiting`);
        }
        acted = new Set();
        if (status === 'results') {
          await settle(2500);
          await still(tv, `${tag}-tv-settled`);
          break;
        }
      }
      // Sam acts a few seconds into each phase so phases end on "all submitted" like a real room.
      if (
        status === 'playing' &&
        sam.playerId &&
        !acted.has(key) &&
        Date.now() - (changes.at(-1)?.t ?? 0) > 4000
      ) {
        acted.add(key);
        if (SCENARIO === 'reconnect' && !scenarioDone && n >= 2) {
          scenarioDone = true;
          notes.push(`reconnect: Sam dropped for 8 s at ${new Date().toISOString()} in ${phase}`);
          await api.disconnect(sam.playerId, 8);
          await settle(1200);
          await still(tv, `${String(n).padStart(2, '0')}-${phase}-tv-sam-dropped`);
          await settle(7500);
          await still(tv, `${String(n).padStart(2, '0')}-${phase}-tv-sam-back`);
          await still(sam.page, `${String(n).padStart(2, '0')}-${phase}-phone-sam-back`);
        } else if (SCENARIO === 'vip-leaves' && !scenarioDone && n >= 2) {
          scenarioDone = true;
          notes.push(`vip-leaves: Sam (VIP) closed the page in ${phase}`);
          await sam.page.close();
          await settle(1500);
          await still(tv, `${String(n).padStart(2, '0')}-${phase}-tv-vip-gone`);
          await still(priya.page, `${String(n).padStart(2, '0')}-${phase}-phone-priya-vip-gone`);
        } else if (SCENARIO !== 'tie' && !sam.page.isClosed())
          await api.post('/api/dev/act', { playerId: sam.playerId });
      }
      await settle(100);
    }
    if ((await api.state()).room?.status === 'playing') {
      notes.push('budget reached while playing; skipped to results');
      for (let i = 0; i < 30 && (await api.state()).room?.status === 'playing'; i += 1)
        await api.skip();
      await settle(2500);
      await still(tv, `${String(n + 1).padStart(2, '0')}-results-forced-tv`);
    }

    // Collect browser-side logs before closing contexts (closing finalises the videos).
    const tvRaw = (await tv.evaluate('window.__pbCueLog')) as {
      t: number;
      freq: number | null;
      when: number;
    }[];
    const tvLong = (await tv.evaluate('window.__pbLong')) as { t: number; ms: number }[];
    const tvFrames = (await tv.evaluate('window.__pbFrames')) as number[];
    const phoneRaw = sam.page.isClosed()
      ? []
      : ((await sam.page.evaluate('window.__pbCueLog')) as typeof tvRaw);
    const phoneLong = sam.page.isClosed()
      ? []
      : ((await sam.page.evaluate('window.__pbLong')) as typeof tvLong);
    const cues = [
      ...groupCues(tvRaw, 'tv', phaseAt),
      ...groupCues(phoneRaw, 'phone', phaseAt),
    ].sort((a, b) => a.t - b.t);
    await tvContext.close();
    await sam.context.close();
    await priya.context.close();

    const pick = (dir: string): string | null => {
      const f = readdirSync(dir).find((x) => x.endsWith('.webm'));
      if (!f) return null;
      const target = join(dir, 'round.webm');
      if (f !== 'round.webm') renameSync(join(dir, f), target);
      return target;
    };
    const tvVideo = pick(join(OUT, 'video', 'tv'));
    const phoneVideo = pick(join(OUT, 'video', 'phone'));
    if (tvVideo) {
      changes.forEach((c, i) => {
        const tag = `${String(i + 1).padStart(2, '0')}-${c.phase}`;
        strip(tvVideo, join(OUT, 'strips', `${tag}-transition`), (c.t - tvVideoT0) / 1000 - 0.5, 2);
        if (phoneVideo)
          strip(
            phoneVideo,
            join(OUT, 'strips', `${tag}-transition-phone`),
            (c.t - phoneVideoT0) / 1000 - 0.5,
            2,
          );
      });
      timerStrips.forEach((t, i) => {
        // Only timers that actually ran out (the phase was still current at the deadline).
        const next = changes.find((c) => c.t > t.deadline - 200 && c.phase !== t.phase);
        const endedEarly = changes.some(
          (c) =>
            c.t > (changes.find((x) => x.phase === t.phase)?.t ?? 0) &&
            c.t < t.deadline - 5000 &&
            c.phase !== t.phase,
        );
        if (endedEarly) return;
        strip(
          tvVideo,
          join(OUT, 'strips', `${String(i + 1).padStart(2, '0')}-${t.phase}-last5s`),
          (t.deadline - tvVideoT0) / 1000 - 5.5,
          6,
        );
        void next;
      });
    }
    const frameTiming = {
      tv: {
        frames: tvFrames.length,
        longFrames: tvLong.length,
        worstMs: Math.max(0, ...tvLong.map((l) => l.ms)),
        long: tvLong.slice(0, 200).map((l) => ({ ...l, phase: phaseAt(l.t) })),
      },
      phone: {
        longFrames: phoneLong.length,
        worstMs: Math.max(0, ...phoneLong.map((l) => l.ms)),
        long: phoneLong.slice(0, 200).map((l) => ({ ...l, phase: phaseAt(l.t) })),
      },
    };
    const iso = (t: number): string => new Date(t).toISOString().slice(11, 23);
    writeFileSync(
      join(OUT, 'timeline.json'),
      JSON.stringify(
        {
          pass: PASS,
          game: GAME,
          players: PLAYERS,
          scenario: SCENARIO,
          focus: values.focus,
          started: iso(started),
          tvVideoT0: iso(tvVideoT0),
          changes: changes.map((c) => ({
            ...c,
            at: iso(c.t),
            sinceStartS: +((c.t - started) / 1000).toFixed(1),
            videoS: +((c.t - tvVideoT0) / 1000).toFixed(1),
          })),
          notes,
        },
        null,
        2,
      ) + '\n',
    );
    writeFileSync(
      join(OUT, 'cues.json'),
      JSON.stringify(
        cues.map((c) => ({
          ...c,
          at: iso(c.t),
          sinceStartS: +((c.t - started) / 1000).toFixed(2),
        })),
        null,
        2,
      ) + '\n',
    );
    writeFileSync(join(OUT, 'frame-timing.json'), JSON.stringify(frameTiming, null, 2) + '\n');
    console.log(
      `pass ${PASS}: ${GAME} ${SCENARIO} ${PLAYERS}p — ${changes.length} phase changes, ${cues.length} cues, tv long frames ${tvLong.length} (worst ${frameTiming.tv.worstMs} ms), ${Math.round((Date.now() - started) / 1000)} s → ${OUT}`,
    );
    for (const c of changes)
      console.log(
        `  +${((c.t - started) / 1000).toFixed(1)}s ${c.status}/${c.phase}${c.deadline ? ` (timer ${Math.round((c.deadline - c.t) / 1000)} s)` : ''}`,
      );
    for (const nte of notes) console.log(`  note: ${nte}`);
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
