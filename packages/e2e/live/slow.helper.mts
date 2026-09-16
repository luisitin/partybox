// Live multi-agent player: persona "slow" — Sloane / frog / iPhone SE (320×568).
// Joins third, waits 9–13 s before acting on every input screen, checks the primary button
// stays inside the tiny viewport, does the badge-holder action at results when it has the badge.
import {
  actOnce,
  detectScreen,
  devState,
  isReconnecting,
  isVip,
  launch,
  logLine,
  openPhone,
  screenshot,
  sleep,
  vipStartGame,
} from './lib.mts';
import type { DevState, Phone, Screen } from './lib.mts';

const AGENT = 'slow';
const NAME = 'Sloane';
const AVATAR = 'frog';
const PRESET = 'se';
const VIEW = { w: 320, h: 568 };
const HARD_STOP_MS = Number(process.env.PB_STOP_MS ?? 500_000);
const OBSERVE_ONLY = process.env.PB_OBSERVE === '1'; // verification mode: join + watch, start nothing
const NO_GATE = process.env.PB_NO_GATE === '1';
const TAG = process.env.PB_TAG ?? ''; // screenshot label prefix for verification runs
const TICK_MS = 700;
const T0 = Date.now();
const elapsed = (): number => Date.now() - T0;
const log = (event: string, data: Record<string, unknown> = {}): void =>
  logLine(AGENT, event, { ms: elapsed(), ...data });

const slowDelay = (): number => 9000 + Math.floor(Math.random() * 4000); // 9–13 s

interface Summary {
  restarted: boolean;
  phasesSeen: string[];
  gamesFinished: number;
  screenshots: string[];
  consoleErrors: string[];
  missedInputs: number;
  acts: number;
  vipBadgeEver: boolean;
  badgeActions: string[];
  buttonChecks: { inside: number; outside: number; missing: number };
  endStatus: string | null;
  endReason: string;
}
const summary: Summary = {
  restarted: false,
  phasesSeen: [],
  gamesFinished: 0,
  screenshots: [],
  consoleErrors: [],
  missedInputs: 0,
  acts: 0,
  vipBadgeEver: false,
  badgeActions: [],
  buttonChecks: { inside: 0, outside: 0, missing: 0 },
  endStatus: null,
  endReason: 'unknown',
};

async function snap(phone: Phone, label: string): Promise<void> {
  const p = await screenshot(phone.page, AGENT, TAG + label);
  summary.screenshots.push(p);
  log('screenshot', { label, path: p });
}

// Wisecrack labels its buttons "Submit 1 of 2" / "Submit 2 of 2" (games/wisecrack/client/ControllerAnswer.tsx);
// lib.actOnce only looks for /^Submit/ and its isEnabled() then blocks for the default 30 s timeout.
const PRIMARY = /Submit|Next prompt|Start/;

/** Same UI-driven action as lib.actOnce, but accepts the "Next prompt" label and never blocks. */
async function slowAct(phone: Phone, seed: number): Promise<string | null> {
  const page = phone.page;
  const screen = await detectScreen(page);
  if (screen === 'text-answer') {
    const WORDS = [
      'a very tired llama',
      'my sock drawer',
      'seven umbrellas',
      'lukewarm soup',
      'the wifi password',
    ];
    const text = WORDS[seed % WORDS.length] as string;
    await page.getByLabel('your answer').fill(text, { timeout: 2000 });
    const submit = page.getByRole('button', { name: /^(Submit|Next prompt)/ }).first();
    if ((await submit.count()) === 0) return 'no-submit-button';
    if (await submit.isEnabled({ timeout: 1000 }).catch(() => false)) {
      const label = await submit.innerText({ timeout: 500 }).catch(() => '?');
      await submit.click({ timeout: 2000 });
      return `answer:${text} via "${label}"`;
    }
    return 'submit-disabled';
  }
  if (screen === 'choices' || screen === 'vote') return actOnce(page, seed);
  return null;
}

/** Primary-button viewport check for the tiny screen. */
async function buttonCheck(phone: Phone, when: string): Promise<void> {
  const btn = phone.page.getByRole('button', { name: PRIMARY }).first();
  const bb =
    (await btn.count()) > 0 ? await btn.boundingBox({ timeout: 800 }).catch(() => null) : null;
  let text: string | null = null;
  if (bb) text = await btn.innerText({ timeout: 500 }).catch(() => null);
  const inside =
    !!bb && bb.x >= 0 && bb.y >= 0 && bb.x + bb.width <= VIEW.w && bb.y + bb.height <= VIEW.h;
  if (!bb) summary.buttonChecks.missing++;
  else if (inside) summary.buttonChecks.inside++;
  else summary.buttonChecks.outside++;
  // Also: how many radios (choices/votes) are inside the viewport, for tap screens.
  const radios = phone.page.getByRole('radio');
  const n = await radios.count().catch(() => 0);
  let radiosInside = 0;
  for (let i = 0; i < n; i++) {
    const rb = await radios
      .nth(i)
      .boundingBox({ timeout: 500 })
      .catch(() => null);
    if (rb && rb.x >= 0 && rb.y >= 0 && rb.x + rb.width <= VIEW.w && rb.y + rb.height <= VIEW.h)
      radiosInside++;
  }
  log('button-check', {
    when,
    button: bb ? { text, x: bb.x, y: bb.y, w: bb.width, h: bb.height } : null,
    inside: bb ? inside : null,
    viewport: VIEW,
    radios: n,
    radiosInside,
  });
}

async function headingText(phone: Phone): Promise<string> {
  const h = phone.page.getByRole('heading').first();
  if ((await h.count().catch(() => 0)) > 0) {
    const t = await h.innerText({ timeout: 400 }).catch(() => '');
    if (t) return t.slice(0, 80);
  }
  const main = await phone.page
    .locator('main')
    .innerText({ timeout: 400 })
    .catch(() => '');
  return main
    .replace(/\d+ \/ \d+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
}

const browser = await launch();
let phone: Phone | null = null;
try {
  log('start', {
    name: NAME,
    avatar: AVATAR,
    preset: PRESET,
    plan: 'join third',
    observeOnly: OBSERVE_ONLY,
    hardStopMs: HARD_STOP_MS,
  });

  // Join third: wait until 2 players are in the room (max 45 s), then join.
  const gateStart = Date.now();
  for (;;) {
    if (NO_GATE) {
      log('join-gate-skipped', {});
      break;
    }
    const s = await devState().catch(() => null);
    const n = Object.keys(s?.room?.players ?? {}).length;
    if (n >= 2) {
      log('join-gate', {
        playersBefore: n,
        waitedMs: Date.now() - gateStart,
        names: Object.values(s?.room?.players ?? {}).map((p) => p.name),
      });
      break;
    }
    if (Date.now() - gateStart > 45_000) {
      log('join-gate-timeout', { playersBefore: n, note: 'joining anyway after 45 s' });
      break;
    }
    await sleep(500);
  }

  phone = await openPhone(browser, AGENT, NAME, AVATAR, PRESET);
  const page = phone.page;
  page.setDefaultTimeout(2500); // never let a lib call block a tick for 30 s
  const vp = page.viewportSize();
  log('viewport', { viewport: vp });
  await snap(phone, '00-joined');

  let lastScreen: Screen | null = null;
  let lastStatus: string | null = null;
  let lastPhaseKey: string | null = null;
  let lastVipId: string | null | undefined = undefined;
  let lastBadge: boolean | null = null;
  let lastBanner = false;
  let lastPlayerCount = -1;
  let seed = 7;
  let shots = 0;
  let resultsIdx = 0; // increments each time status enters 'results'
  let resultsActedIdx = 0;
  let resultsSeenAt = 0;
  let resultsDelay = 0;
  let lobbyEnteredAt = Date.now();
  let game1Started = false;
  let vipLobbyActed = false;
  let pending: {
    key: string;
    screen: Screen;
    since: number;
    delay: number;
    heading: string;
  } | null = null;
  let stopReason: string | null = null;
  let postLobbyGrace: number | null = null;

  while (elapsed() < HARD_STOP_MS && !stopReason) {
    const tickStart = Date.now();
    try {
      const s: DevState | null = await devState().catch(() => null);
      const room = s?.room ?? null;
      const status = room?.status ?? null;
      const phase = room?.game?.state?.phase ?? null;
      const phaseKey = phase ? `${room?.game?.gameId}:${phase.id}@${phase.startedAt}` : null;
      const players = Object.values(room?.players ?? {});
      const me = players.find((p) => p.name === NAME) ?? null;

      if (status !== lastStatus) {
        log('status', {
          from: lastStatus,
          to: status,
          players: players.length,
          vipId: room?.vipId ?? null,
        });
        if (status === 'results') {
          resultsIdx++;
          summary.gamesFinished = resultsIdx;
          resultsSeenAt = Date.now();
          resultsDelay = slowDelay();
          log('results-phase', {
            idx: resultsIdx,
            results: room?.results ? 'present' : 'null',
            lastGame: (room as { lastGame?: unknown } | null)?.lastGame ?? null,
          });
        }
        if (status === 'playing') game1Started = true;
        if (status === 'lobby') {
          lobbyEnteredAt = Date.now();
          if (resultsIdx >= 2) postLobbyGrace = Date.now();
        }
        lastStatus = status;
      }
      if (players.length !== lastPlayerCount) {
        log('players', {
          count: players.length,
          names: players.map(
            (p) =>
              `${p.name}${p.isVip ? '*' : ''}${p.connected ? '' : '(off)'}${p.spectator ? '(spec)' : ''}`,
          ),
        });
        lastPlayerCount = players.length;
      }
      if (phaseKey !== lastPhaseKey) {
        log('phase', {
          phase: phaseKey,
          id: phase?.id ?? null,
          startedAt: phase?.startedAt ?? null,
          deadline: phase?.deadline ?? null,
          status,
        });
        if (phaseKey && !summary.phasesSeen.includes(phaseKey)) summary.phasesSeen.push(phaseKey);
        lastPhaseKey = phaseKey;
      }
      const vipId = room?.vipId ?? null;
      if (vipId !== lastVipId) {
        const vipName = players.find((p) => p.id === vipId)?.name ?? null;
        log('vip-id', { vipId, vipName, meIsVip: me?.isVip ?? null });
        lastVipId = vipId;
      }

      const screen = await detectScreen(page);
      const badge = await isVip(page);
      const banner = await isReconnecting(page);
      if (badge !== lastBadge) {
        log('vip-badge', { badge, devSaysVip: me?.isVip ?? null });
        if (badge) summary.vipBadgeEver = true;
        lastBadge = badge;
      }
      if (banner !== lastBanner) {
        log('reconnect-banner', { visible: banner });
        lastBanner = banner;
      }
      if (screen !== lastScreen) {
        const heading = await headingText(phone);
        log('screen', { from: lastScreen, to: screen, heading, status, phase: phaseKey });
        if (shots < 45) {
          shots++;
          await snap(phone, `${String(shots).padStart(2, '0')}-${screen}`);
        }
        if (screen === 'join' || screen === 'kicked' || screen === 'resuming') {
          log('session-problem', { screen, note: 'phone dropped back to join/kicked/resuming' });
        }
        lastScreen = screen;
      }
      if (me && me.connected === false) log('dev-says-disconnected', { me });

      // ---- input screens: slow persona ----
      const isInput = screen === 'text-answer' || screen === 'choices' || screen === 'vote';
      if (isInput) {
        const heading = await headingText(phone);
        const key = `${screen}|${phaseKey}|${heading}`;
        if (!pending || pending.key !== key) {
          if (pending) {
            log('input-replaced-before-act', {
              was: pending.key,
              now: key,
              waitedMs: Date.now() - pending.since,
            });
            summary.missedInputs++;
          }
          pending = { key, screen, since: Date.now(), delay: slowDelay(), heading };
          log('input-seen', {
            screen,
            heading,
            willWaitMs: pending.delay,
            deadline: phase?.deadline ?? null,
            deadlineInMs: phase?.deadline ? phase.deadline - (s?.clock?.now ?? Date.now()) : null,
          });
        } else if (Date.now() - pending.since >= pending.delay) {
          await buttonCheck(phone, 'before-act');
          const did = await slowAct(phone, seed++).catch(
            (e: Error) => `error:${e.message.slice(0, 200)}`,
          );
          summary.acts++;
          log('act', { screen, heading, result: did, waitedMs: Date.now() - pending.since });
          await sleep(150);
          await buttonCheck(phone, 'after-act');
          const after = await detectScreen(page);
          log('after-act', { screen: after, heading: await headingText(phone) });
          if (shots < 45) {
            shots++;
            await snap(phone, `${String(shots).padStart(2, '0')}-after-act-${screen}`);
          }
          pending = null;
        }
      } else if (pending) {
        log('input-missed', {
          was: pending.screen,
          heading: pending.heading,
          waitedMs: Date.now() - pending.since,
          plannedDelayMs: pending.delay,
          nowScreen: screen,
          phase: phaseKey,
        });
        summary.missedInputs++;
        pending = null;
      }

      // ---- lobby: if I am VIP, start game 1 (≥4 players or 90 s) ----
      if (
        !OBSERVE_ONLY &&
        screen === 'lobby' &&
        badge &&
        !game1Started &&
        !vipLobbyActed &&
        resultsIdx === 0
      ) {
        const since = Date.now() - lobbyEnteredAt;
        if (players.length >= 4 || since >= 90_000) {
          vipLobbyActed = true;
          log('vip-lobby-start', { players: players.length, lobbyMs: since });
          await vipStartGame(page, 'Wisecrack', { Rounds: 1, 'Writing time': 2 }).catch(
            (e: Error) => log('vip-lobby-start-error', { error: e.message.slice(0, 300) }),
          );
          await buttonCheck(phone, 'after-vip-start');
          summary.badgeActions.push('lobby:start Wisecrack');
        }
      }

      // ---- results: badge holder acts (once per results phase) ----
      if (!OBSERVE_ONLY && screen === 'results' && badge && resultsIdx > resultsActedIdx) {
        if (Date.now() - resultsSeenAt >= resultsDelay) {
          resultsActedIdx = resultsIdx;
          await buttonCheck(phone, 'results-before');
          if (resultsIdx === 1) {
            log('vip-results-action', {
              idx: resultsIdx,
              action: 'New game → Lightning Round (Questions -5, Answer time -1)',
            });
            await page.getByRole('button', { name: 'New game' }).click();
            await snap(phone, 'vip-after-new-game');
            await page
              .getByRole('heading', { name: 'Pick a game' })
              .waitFor({ timeout: 10_000 })
              .catch(() => undefined);
            await vipStartGame(page, 'Lightning Round', { Questions: 5, 'Answer time': 1 }).catch(
              (e: Error) => log('vip-results-action-error', { error: e.message.slice(0, 300) }),
            );
            await buttonCheck(phone, 'after-vip-start-game2');
            summary.badgeActions.push('results1:New game → Lightning Round 5q/10s');
          } else {
            log('vip-results-action', { idx: resultsIdx, action: 'Back to lobby' });
            await page.getByRole('button', { name: 'Back to lobby' }).click();
            summary.badgeActions.push(`results${resultsIdx}:Back to lobby`);
          }
        }
      }

      // ---- selecting as VIP (e.g. badge handed to me mid-selection): start the right game ----
      if (!OBSERVE_ONLY && screen === 'selecting-vip' && badge && !isInput) {
        const gameWanted = resultsIdx >= 1 ? 'Lightning Round' : 'Wisecrack';
        const dwell = Date.now() - (resultsSeenAt || lobbyEnteredAt);
        if (
          dwell > 20_000 &&
          !summary.badgeActions.some((a) => a.startsWith(`selecting${resultsIdx}`))
        ) {
          log('vip-selecting-fallback', { gameWanted, idx: resultsIdx });
          await vipStartGame(
            page,
            gameWanted,
            gameWanted === 'Wisecrack'
              ? { Rounds: 1, 'Writing time': 2 }
              : { Questions: 5, 'Answer time': 1 },
          ).catch((e: Error) =>
            log('vip-selecting-fallback-error', { error: e.message.slice(0, 300) }),
          );
          summary.badgeActions.push(`selecting${resultsIdx}:start ${gameWanted}`);
        }
      }

      // ---- stop condition ----
      if (postLobbyGrace !== null && Date.now() - postLobbyGrace > 3000 && status === 'lobby') {
        stopReason = 'room back in lobby after game 2';
      }
      summary.endStatus = status;
    } catch (e) {
      log('loop-error', { error: (e as Error).message.slice(0, 400) });
    }
    const spent = Date.now() - tickStart;
    if (spent > 2500) log('slow-tick', { spentMs: spent, note: 'a tick took >2.5 s' });
    if (spent < TICK_MS) await sleep(TICK_MS - spent);
  }

  summary.endReason = stopReason ?? `hard stop at ${Math.round(elapsed() / 1000)} s`;
  log('stop', { reason: summary.endReason, elapsedMs: elapsed() });
  if (phone) await snap(phone, 'zz-final');
} catch (e) {
  log('fatal', {
    error: (e as Error).message.slice(0, 500),
    stack: ((e as Error).stack ?? '').slice(0, 800),
  });
  summary.endReason = `fatal: ${(e as Error).message.slice(0, 200)}`;
  if (phone) await snap(phone, 'zz-fatal').catch(() => undefined);
} finally {
  if (phone) summary.consoleErrors = phone.errors.slice();
  log('summary', { ...summary });
  console.log('SUMMARY_JSON ' + JSON.stringify(summary));
  await browser.close().catch(() => undefined);
}
