// Persona "tv": the television. Opens /tv in a real Chromium tab and only OBSERVES — never sends
// player events. Every 2 s reads /api/dev/state; every 500 ms probes the TV DOM (toasts live 4 s,
// so a 2 s DOM poll could miss them). Logs every change as JSONL, screenshots on status/phase
// changes and on VIP-handover / joined (next game) / left toasts. Stops when the room status
// returns to 'lobby' after the second results screen, or at 500 s.
import { devState, launch, logLine, openTv, screenshot, sleep } from './lib.mts';
import type { DevState } from './lib.mts';

const AGENT = 'tv';
const MAX_MS = Number(process.env.PB_MAX_S ?? 500) * 1000;
const DOM_TICK_MS = 500;
const DEV_EVERY = 4; // 4 × 500 ms = 2 s

interface Chip {
  label: string;
  name: string;
  spectator: boolean;
  vip: boolean;
  avatarOpacity: string;
  connected: boolean;
}

interface DomProbe {
  toasts: string[];
  timerText: string | null;
  timerLabel: string | null;
  paused: boolean;
  chips: Chip[];
  chipsWhere: string | null;
  vipOverlay: string | null;
  headline: string | null;
  scoreboard: string[];
  awards: string[];
  offline: boolean;
  bodySnippet: string;
}

const t0 = Date.now();
const elapsed = (): number => Math.round((Date.now() - t0) / 100) / 10;

let shotSeq = 0;
async function shot(page: import('playwright').Page, label: string): Promise<string> {
  shotSeq += 1;
  const safe = label.replace(/[^a-z0-9_-]+/gi, '_').slice(0, 60);
  const path = await screenshot(page, AGENT, `${String(shotSeq).padStart(2, '0')}-${safe}`);
  logLine(AGENT, 'screenshot', { label, path, elapsedS: elapsed() });
  return path;
}

// The probe is a plain JS string: tsx/esbuild injects a `__name` helper into arrow functions
// inside a page.evaluate callback, which does not exist in the browser (ReferenceError).
const PROBE_JS = String.raw`(() => {
  const txt = (el) => (el ? (el.textContent || '').trim() : null);
  const toasts = Array.from(document.querySelectorAll('[aria-live="polite"] > div')).map(
    (d) => (d.textContent || '').trim(),
  );
  const timer = document.querySelector('[role="timer"]');
  const timerDigits = timer ? timer.querySelector('span:last-child') : null;
  const paused = Array.from(document.querySelectorAll('[role="status"]')).some((s) =>
    /\bPaused\b/.test(s.textContent || ''),
  );
  const list = document.querySelector('ul[aria-label="players"]');
  const chips = [];
  if (list) {
    for (const li of Array.from(list.querySelectorAll(':scope > li'))) {
      const chip = li.querySelector('[aria-label]');
      const svg = li.querySelector('svg[aria-label^="avatar"]');
      const label = (chip && chip.getAttribute('aria-label')) || '';
      chips.push({
        label,
        name: label.split(',')[0] || '',
        spectator: /, spectator/.test(label),
        vip: /, VIP/.test(label),
        avatarOpacity: svg ? getComputedStyle(svg).opacity : '?',
        connected: !/, reconnecting/.test(label),
      });
    }
  }
  const vipEl = document.querySelector('[aria-label^="VIP "]');
  const hero = document.querySelector('.pb-enter');
  const scoreboard = Array.from(document.querySelectorAll('ol[aria-label="scoreboard"] > li')).map(
    (li) => (li.textContent || '').replace(/\s+/g, ' ').trim(),
  );
  const awards = Array.from(document.querySelectorAll('ul[aria-label="awards"] > li')).map(
    (li) => (li.textContent || '').replace(/\s+/g, ' ').trim(),
  );
  const header = document.querySelector('header');
  const main = document.querySelector('main');
  return {
    toasts,
    timerText: txt(timerDigits),
    timerLabel: timer ? timer.getAttribute('aria-label') : null,
    paused,
    chips,
    chipsWhere: list ? (list.closest('main') ? 'main' : 'other') : null,
    vipOverlay: vipEl ? vipEl.getAttribute('aria-label') : null,
    headline: txt(hero),
    scoreboard,
    awards,
    offline: /Connecting…/.test((header && header.textContent) || ''),
    bodySnippet: ((main && main.textContent) || '').replace(/\s+/g, ' ').trim().slice(0, 160),
  };
})()`;

async function probe(page: import('playwright').Page): Promise<DomProbe> {
  return (await page.evaluate(PROBE_JS)) as DomProbe;
}

function summarizeDev(s: DevState): {
  status: string;
  phaseId: string | null;
  startedAt: number | null;
  deadline: number | null;
  vipId: string | null;
  vipName: string | null;
  gameId: string | null;
  players: string[];
} {
  const room = s.room;
  const players = Object.values(room?.players ?? {});
  const vip = players.find((p) => p.id === room?.vipId);
  return {
    status: room?.status ?? 'no-room',
    phaseId: room?.game?.state?.phase?.id ?? null,
    startedAt: room?.game?.state?.phase?.startedAt ?? null,
    deadline: room?.game?.state?.phase?.deadline ?? null,
    vipId: room?.vipId ?? null,
    vipName: vip?.name ?? null,
    gameId: room?.game?.gameId ?? null,
    players: players.map(
      (p) =>
        `${p.name}${p.isVip ? '*' : ''}${p.spectator ? '(spec)' : ''}${p.connected ? '' : '(off)'}`,
    ),
  };
}

const browser = await launch();
let tv: Awaited<ReturnType<typeof openTv>> | null = null;
const phasesSeen: string[] = [];
let resultsSeen = 0;
let statusChanges = 0;
let stopReason = 'timeout';
const toastsSeen: { t: string; text: string; elapsedS: number }[] = [];
let stuckMax = 0;

try {
  logLine(AGENT, 'start', {
    base: process.env.PB_URL ?? 'http://127.0.0.1:42090',
    maxS: MAX_MS / 1000,
  });
  try {
    tv = await openTv(browser, AGENT);
    logLine(AGENT, 'tv-open', { elapsedS: elapsed() });
  } catch (e) {
    logLine(AGENT, 'tv-open-failed', { error: String(e).slice(0, 300) });
    throw e;
  }
  const page = tv.page;
  await shot(page, 'opened');

  let prevDev: ReturnType<typeof summarizeDev> | null = null;
  let prevPhaseKey: string | null = null;
  let prevProbe: DomProbe | null = null;
  const activeToasts = new Set<string>();
  let timerZeroSince: number | null = null;
  let timerZeroReported = false;
  let lastTimerLogged: string | null = null;
  let lastTimerLogAt = 0;
  let tick = 0;
  let sawResultsThisGame = false;

  while (Date.now() - t0 < MAX_MS) {
    tick += 1;
    // ---- devState every 2 s ("look at the TV" for status/phase/vip/players) ----
    if (tick % DEV_EVERY === 1) {
      try {
        const s = await devState();
        const d = summarizeDev(s);
        const phaseKey = d.phaseId ? `${d.gameId}:${d.phaseId}@${d.startedAt}` : null;
        if (!prevDev || prevDev.status !== d.status) {
          statusChanges += 1;
          logLine(AGENT, 'status', {
            from: prevDev?.status ?? null,
            to: d.status,
            ...d,
            elapsedS: elapsed(),
          });
          await sleep(250); // let the TV render the new status before the screenshot
          await shot(page, `status-${d.status}`);
          if (d.status === 'results') {
            resultsSeen += 1;
            sawResultsThisGame = true;
            phasesSeen.push(`results#${resultsSeen}`);
          }
          if (d.status === 'lobby' && resultsSeen >= 2 && prevDev && prevDev.status !== 'lobby') {
            logLine(AGENT, 'session-complete', { resultsSeen, elapsedS: elapsed() });
            stopReason = 'lobby-after-second-results';
            await sleep(1500);
            const p = await probe(page);
            logLine(AGENT, 'final-lobby-dom', { chips: p.chips, toasts: p.toasts });
            await shot(page, 'final-lobby');
            break;
          }
          if (d.status === 'playing') sawResultsThisGame = false;
        }
        if (phaseKey !== prevPhaseKey) {
          logLine(AGENT, 'phase', {
            from: prevPhaseKey,
            to: phaseKey,
            phaseId: d.phaseId,
            startedAt: d.startedAt,
            deadline: d.deadline,
            gameId: d.gameId,
            elapsedS: elapsed(),
          });
          if (d.phaseId) {
            phasesSeen.push(`${d.gameId}:${d.phaseId}`);
            await sleep(250);
            await shot(page, `phase-${d.gameId}-${d.phaseId}`);
          }
          prevPhaseKey = phaseKey;
        }
        if (prevDev && prevDev.vipId !== d.vipId) {
          logLine(AGENT, 'vip-change', {
            from: prevDev.vipName,
            fromId: prevDev.vipId,
            to: d.vipName,
            toId: d.vipId,
            elapsedS: elapsed(),
          });
        }
        if (!prevDev || prevDev.players.join('|') !== d.players.join('|')) {
          logLine(AGENT, 'players', {
            players: d.players,
            count: d.players.length,
            elapsedS: elapsed(),
          });
        }
        prevDev = d;
      } catch (e) {
        logLine(AGENT, 'devstate-error', { error: String(e).slice(0, 200) });
      }
    }

    // ---- TV DOM every 500 ms ----
    let p: DomProbe;
    try {
      p = await probe(page);
    } catch (e) {
      logLine(AGENT, 'probe-error', { error: String(e).slice(0, 200) });
      await sleep(DOM_TICK_MS);
      continue;
    }

    // toasts (new ones only)
    for (const text of p.toasts) {
      if (!activeToasts.has(text)) {
        activeToasts.add(text);
        toastsSeen.push({ t: new Date().toISOString(), text, elapsedS: elapsed() });
        logLine(AGENT, 'toast', { text, elapsedS: elapsed() });
        if (/is now the VIP|joined \(next game\)| left$/.test(text)) {
          await shot(page, `toast-${text}`);
        }
      }
    }
    for (const old of Array.from(activeToasts)) {
      if (!p.toasts.includes(old)) {
        activeToasts.delete(old);
        logLine(AGENT, 'toast-gone', { text: old, elapsedS: elapsed() });
      }
    }

    // timer: log on change of text but at most once per 5 s unless it hits 0/appears/disappears
    const timerNow = p.timerText === null ? null : `${p.timerText}|${p.timerLabel}`;
    if (timerNow !== lastTimerLogged) {
      const edge =
        p.timerText === null || lastTimerLogged === null || p.timerText === '0' || p.paused;
      if (edge || Date.now() - lastTimerLogAt > 5000) {
        logLine(AGENT, 'timer', { text: p.timerText, label: p.timerLabel, elapsedS: elapsed() });
        lastTimerLogAt = Date.now();
      }
      lastTimerLogged = timerNow;
    }
    if (p.timerText === '0' && !p.paused) {
      if (timerZeroSince === null) timerZeroSince = Date.now();
      const dur = Date.now() - timerZeroSince;
      if (dur > stuckMax) stuckMax = dur;
      if (dur > 5000 && !timerZeroReported) {
        timerZeroReported = true;
        logLine(AGENT, 'timer-stuck-at-0', { ms: dur, elapsedS: elapsed() });
        await shot(page, 'timer-stuck-0');
      }
    } else {
      if (timerZeroSince !== null) {
        logLine(AGENT, 'timer-left-0', {
          msAtZero: Date.now() - timerZeroSince,
          elapsedS: elapsed(),
        });
      }
      timerZeroSince = null;
      timerZeroReported = false;
    }

    // paused curtain
    if (p.paused !== (prevProbe?.paused ?? false)) {
      logLine(AGENT, 'paused-curtain', { shown: p.paused, elapsedS: elapsed() });
      await shot(page, p.paused ? 'paused-on' : 'paused-off');
    }

    // chips
    const chipSig = JSON.stringify(p.chips.map((c) => [c.label, c.avatarOpacity]));
    const prevChipSig = JSON.stringify(
      (prevProbe?.chips ?? []).map((c) => [c.label, c.avatarOpacity]),
    );
    if (chipSig !== prevChipSig) {
      logLine(AGENT, 'chips', { where: p.chipsWhere, chips: p.chips, elapsedS: elapsed() });
      const specs = p.chips.filter((c) => c.spectator);
      if (specs.length && !(prevProbe?.chips ?? []).some((c) => c.spectator)) {
        await shot(page, 'spectator-chip');
      }
    }

    // VIP overlay (during play)
    if (p.vipOverlay !== (prevProbe?.vipOverlay ?? null)) {
      logLine(AGENT, 'vip-overlay', { label: p.vipOverlay, elapsedS: elapsed() });
    }

    // results content
    if (
      p.scoreboard.length &&
      JSON.stringify(p.scoreboard) !== JSON.stringify(prevProbe?.scoreboard ?? [])
    ) {
      logLine(AGENT, 'results-dom', {
        headline: p.headline,
        scoreboard: p.scoreboard,
        awards: p.awards,
        elapsedS: elapsed(),
      });
      await sleep(600); // let the enter animation finish so the screenshot shows the winner
      await shot(page, `results-${resultsSeen || 'x'}-scoreboard`);
    }

    // offline banner
    if (p.offline !== (prevProbe?.offline ?? false)) {
      logLine(AGENT, 'tv-connection', { connecting: p.offline, elapsedS: elapsed() });
    }

    prevProbe = p;
    await sleep(DOM_TICK_MS);
  }
  void sawResultsThisGame;
} catch (e) {
  logLine(AGENT, 'fatal', { error: String(e).slice(0, 500) });
  stopReason = 'crash';
} finally {
  if (tv) {
    await shot(tv.page, 'final').catch(() => undefined);
    logLine(AGENT, 'summary', {
      stopReason,
      elapsedS: elapsed(),
      phasesSeen,
      resultsSeen,
      statusChanges,
      toasts: toastsSeen,
      consoleErrors: tv.errors,
      timerMaxMsAtZero: stuckMax,
    });
  }
  await browser.close().catch(() => undefined);
}
