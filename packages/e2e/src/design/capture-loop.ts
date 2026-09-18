// One simulation for /review-loop: a real-time round on 42071 with dev-API bots and two real phones,
// TV + one phone recorded on video, TV / active phone / waiting phone stills at every phase change,
// frame strips (10 fps) around each transition and over the last 5 s of every timer, the audio-cue
// log (cue, time, phase) and the TV's long-frame numbers.
// Usage: tsx packages/e2e/src/design/capture-loop.ts --pass 1 --game bingo --players 6
//        [--scenario normal|reconnect|vip-leaves|tie|walkover|spicy|pause] [--focus tv|phone] [--budget 150] [--port 42071] [--fps 10] [--after 2.5] [--pause-in <phase>]
import { mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import type { Page } from 'playwright';
import { rashTap } from './loop-rash';
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
    settings: { type: 'string' },
    port: { type: 'string', default: '42071' },
    out: { type: 'string' },
    // Frame strips: frames per second (default 10) and seconds after each transition (default 2.5,
    // enough for a result stage's third beat at 1.2 s plus its rise).
    fps: { type: 'string', default: '10' },
    /** --scenario pause: hold in this phase instead of the third phase instance. */
    'pause-in': { type: 'string' },
    after: { type: 'string', default: '2.5' },
  },
});
const PASS = values.pass ?? '1';
const GAME = values.game ?? 'bingo';
const PLAYERS = Number(values.players);
const SCENARIO = values.scenario ?? 'normal';
const BUDGET_MS = Number(values.budget) * 1000;
const FPS = Number(values.fps);
const AFTER_S = Number(values.after);
/** Pre-roll before a phase change. The poll detects a change up to ~350 ms after the push and the
 *  still costs another 450 ms, so half a second of lead used to start after the entrance had
 *  already played (review-loop #166). */
const PRE_S = 1.5;
// 'tie': nobody acts (an idle room). 'walkover': only Sam acts — bots and Priya sit out, so a
// one-submission round (Blanks' walkover) plays every round. 'rash': see loop-rash.ts.
const OTHERS_IDLE = SCENARIO === 'tie' || SCENARIO === 'walkover';
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'loop', PASS);

async function main(): Promise<void> {
  // A previous aborted run must not leave a stale video that pick() would mistake for this one.
  rmSync(join(OUT, 'video'), { recursive: true, force: true });
  rmSync(join(OUT, 'strips'), { recursive: true, force: true });
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
    // Games without bot support (Wisecrack) get real extra phones, driven through /api/dev/act.
    const extras: Phone[] = [];
    const supportsBots =
      (
        JSON.parse(readFileSync(join(REPO_ROOT, 'games', GAME, 'manifest.json'), 'utf8')) as {
          supportsBots?: boolean;
        }
      ).supportsBots === true;
    if (bots > 0 && supportsBots) await api.bots(bots, OTHERS_IDLE ? 'idle' : 'random');
    else if (bots > 0) {
      for (let i = 0; i < bots; i += 1) {
        const extra = await openPhone(browser, server.url, 'pixel', `Extra ${i + 1}`);
        await joinViaForm(extra, api, { avatarIndex: 8 + i });
        extras.push(extra);
      }
      notes.push(`${bots} extra phones instead of bots (manifest.supportsBots is not true)`);
    }
    // Extras answer 1–3 s into every phase instance (or never, for a tie).
    let extrasActedFor = '';
    await settle(800);

    const still = async (page: Page, name: string): Promise<void> => {
      if (page.isClosed()) return; // vip-leaves closes a phone mid-run
      await page.screenshot({ path: join(OUT, 'stills', `${name}.png`) });
    };
    await still(tv, '00-lobby-tv');
    await still(sam.page, '00-lobby-phone-sam');
    const settings: Record<string, unknown> = SCENARIO === 'spicy' ? { spicy: true } : {};
    // Extra game settings for a variant capture, e.g. --settings '{"showBoard":false}'.
    if (values.settings)
      Object.assign(settings, JSON.parse(values.settings) as Record<string, unknown>);
    await api.post('/api/dev/start', { gameId: GAME, seed: Number(PASS) * 11, settings });
    const started = Date.now();
    let last = '';
    let n = 0;
    let acted = new Set<string>();
    let followedUp = new Set<string>();
    let actedAt = 0;
    let scenarioDone = false;
    const timerStrips: { phase: string; deadline: number }[] = [];
    while (Date.now() - started < BUDGET_MS) {
      const s = await api.state();
      const status = s.room?.status ?? 'none';
      const phase = s.room?.game?.state.phase.id ?? status;
      if (SCENARIO === 'rash' && status === 'playing') await rashTap(api, s.bots);
      // Keyed by the phase instance, not just its id: Broken Pencil repeats 'pass' once per step
      // and the phones must act in every one (review-loop #44).
      const key = `${status}:${phase}:${s.room?.game?.state.phase.startedAt ?? 0}`;
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
        change.bed = (await tv.evaluate('window.__pbBeds?.current() ?? null')) as string | null;
        await still(tv, `${tag}-tv`);
        await still(sam.page, `${tag}-phone-active`);
        // Priya acts first: her phone is the "waiting" (submitted) state of this phase.
        // A tie needs everyone idle — Priya included (review-loop #29).
        if (status === 'playing' && priya.playerId && !OTHERS_IDLE) {
          await api.post('/api/dev/act', { playerId: priya.playerId });
          await settle(500);
          await still(priya.page, `${tag}-phone-waiting`);
        }
        acted = new Set();
        followedUp = new Set();
        if (status === 'results') {
          await settle(2500);
          await still(tv, `${tag}-tv-settled`);
          break;
        }
      }
      if (
        status === 'playing' &&
        extras.length > 0 &&
        !OTHERS_IDLE &&
        extrasActedFor !== key &&
        Date.now() - (changes.at(-1)?.t ?? 0) > 1000 + Math.random() * 2000
      ) {
        extrasActedFor = key;
        for (const extra of extras)
          if (extra.playerId) await api.post('/api/dev/act', { playerId: extra.playerId });
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
          await sam.context.setOffline(true);
          await settle(1200);
          await still(sam.page, `${String(n).padStart(2, '0')}-${phase}-phone-sam-offline`);
          await still(tv, `${String(n).padStart(2, '0')}-${phase}-tv-sam-dropped`);
          await settle(6500);
          await still(sam.page, `${String(n).padStart(2, '0')}-${phase}-phone-sam-offline-late`);
          await sam.context.setOffline(false);
          await settle(7000); // socket.io backoff after ~8 s away can take a few seconds
          await still(tv, `${String(n).padStart(2, '0')}-${phase}-tv-sam-back`);
          await still(sam.page, `${String(n).padStart(2, '0')}-${phase}-phone-sam-back`);
        } else if (
          SCENARIO === 'pause' &&
          !scenarioDone &&
          (values['pause-in'] ? phase === values['pause-in'] : n >= 3)
        ) {
          // The VIP pauses mid-phase for 6 s: the curtain, the held timer, the held music bed;
          // then resumes — the shell chimes `phase` on the way back (DESIGN_SYSTEM) and the bed
          // picks up where it stopped, never restarting.
          scenarioDone = true;
          notes.push(`pause: VIP paused 6 s at ${new Date().toISOString()} in ${phase}`);
          await api.vip('pause');
          await settle(1500);
          await still(tv, `${String(n).padStart(2, '0')}-${phase}-tv-paused`);
          await still(sam.page, `${String(n).padStart(2, '0')}-${phase}-phone-paused`);
          await settle(4500);
          await api.vip('resume');
          await settle(1200);
          await still(tv, `${String(n).padStart(2, '0')}-${phase}-tv-resumed`);
          await still(sam.page, `${String(n).padStart(2, '0')}-${phase}-phone-resumed`);
          await api.post('/api/dev/act', { playerId: sam.playerId });
        } else if (SCENARIO === 'vip-leaves' && !scenarioDone && n >= 2) {
          scenarioDone = true;
          notes.push(`vip-leaves: Sam (VIP) closed the page in ${phase}`);
          await sam.page.close();
          await settle(1500);
          await still(tv, `${String(n).padStart(2, '0')}-${phase}-tv-vip-gone`);
          await still(priya.page, `${String(n).padStart(2, '0')}-${phase}-phone-priya-vip-gone`);
          // The engine hands the VIP over after 30 s away: catch the toast and the new badge.
          await settle(30_000);
          await still(tv, `${String(n).padStart(2, '0')}-${phase}-tv-vip-handover`);
          await still(
            priya.page,
            `${String(n).padStart(2, '0')}-${phase}-phone-priya-vip-handover`,
          );
        } else if (SCENARIO !== 'tie' && !sam.page.isClosed()) {
          // Blanks' judge picks the round's question by tapping one of three black cards: the dev
          // API's bot input covers a bot judge, a real phone's tap only this (loop #165). Tap
          // first; the dev act is the fallback for every other phase.
          const choice = sam.page.locator('ul[aria-label="the black cards"] button').first();
          if (await choice.isVisible().catch(() => false)) {
            await still(sam.page, `${String(n).padStart(2, '0')}-${phase}-phone-choosing`);
            await choice.click().catch(() => undefined);
            await settle(600);
            await still(sam.page, `${String(n).padStart(2, '0')}-${phase}-phone-chosen`);
          } else await api.post('/api/dev/act', { playerId: sam.playerId });
        }
        actedAt = Date.now();
      }
      // A phase can owe a phone two actions (Broken Pencil's pass: guess, then draw): every real
      // phone acts again 5 s after the first act while the phase instance is still the same, so
      // the room does not wait a full timer on a half-done step (review-loop #44).
      if (
        status === 'playing' &&
        SCENARIO !== 'tie' &&
        acted.has(key) &&
        !followedUp.has(key) &&
        Date.now() - actedAt > 5000
      ) {
        followedUp.add(key);
        // A phase still up 9 s in has settled (Blanks' result lands its beats at 1.2 s; the
        // 450 ms still catches only the first): one late TV still per such phase.
        await still(tv, `${String(n).padStart(2, '0')}-${phase}-tv-late`);
        const again = (OTHERS_IDLE ? [sam] : [sam, priya, ...extras]).filter(
          (p) => p.playerId && !p.page.isClosed(),
        );
        for (const p of again) await api.post('/api/dev/act', { playerId: p.playerId });
        // An untimed phase (Blanks) waits for the room: Sam taps the phone's Next if it offers one.
        if (!sam.page.isClosed()) {
          const nextButton = sam.page
            .getByRole('button', {
              name: /next|final scores|start the reading|close the vote|finish the game/i,
            })
            .first();
          if (await nextButton.isVisible().catch(() => false)) {
            await still(sam.page, `${String(n).padStart(2, '0')}-${phase}-phone-next`);
            await nextButton.click().catch(() => undefined);
          }
        }
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
    for (const extra of extras) await extra.context.close();

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
        strip(
          tvVideo,
          join(OUT, 'strips', `${tag}-transition`),
          (c.t - tvVideoT0) / 1000 - PRE_S,
          PRE_S + AFTER_S,
          FPS,
        );
        if (phoneVideo)
          strip(
            phoneVideo,
            join(OUT, 'strips', `${tag}-transition-phone`),
            (c.t - phoneVideoT0) / 1000 - PRE_S,
            PRE_S + AFTER_S,
            FPS,
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
          FPS,
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
          // Both clocks, so a pass can line the phone video up with the TV video and the cue log
          // (review-loop #224 — cross-surface sync could only be eyeballed before).
          phoneVideoT0: phoneVideoT0 ? iso(phoneVideoT0) : null,
          changes: changes.map((c) => ({
            ...c,
            at: iso(c.t),
            sinceStartS: +((c.t - started) / 1000).toFixed(1),
            videoS: +((c.t - tvVideoT0) / 1000).toFixed(1),
            phoneVideoS: phoneVideoT0 ? +((c.t - phoneVideoT0) / 1000).toFixed(1) : null,
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
