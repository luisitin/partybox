// Live-play agent "reloader" (Rory, cat, iPhone). Plays with a 1.5 s delay and reloads the tab
// every ~25 s (plus at least once during text-answer, choices/vote and results) to measure resume.
import {
  launch,
  openPhone,
  detectScreen,
  actOnce,
  isVip,
  vipStartGame,
  devState,
  logLine,
  screenshot,
  sleep,
  type Screen,
  type DevState,
} from './lib.mts';

const AGENT = 'reloader';
const NAME = 'Rory';
const AVATAR = 'cat';
const PRESET = 'iphone' as const;
const ACT_DELAY_MS = 1500;
const RELOAD_EVERY_MS = 25_000;
const HARD_STOP_MS = 500_000;
const T0 = Date.now();
const elapsed = (): number => Date.now() - T0;

const browser = await launch();
const shots: string[] = [];
let restarted = false;
let gamesFinished = 0;
const phasesSeen: string[] = [];
const phaseKeys = new Set<string>();
const claims: { claim: string; ok: boolean; evidence: string }[] = [];

function safeState(): Promise<DevState | null> {
  return devState().catch((e) => {
    logLine(AGENT, 'devstate-error', { text: String(e).slice(0, 200) });
    return null;
  });
}

const INPUT: Screen[] = ['text-answer', 'choices', 'vote'];
const NOT_READY: Screen[] = ['join', 'resuming', 'unknown'];

try {
  // ---- Join fourth: wait until 3 players are in, or 45 s. ----
  const joinWaitStart = Date.now();
  for (;;) {
    const s = await safeState();
    const n = Object.keys(s?.room?.players ?? {}).length;
    if (n >= 3 || Date.now() - joinWaitStart > 45_000) {
      logLine(AGENT, 'join-gate', { playersBefore: n, waitedMs: Date.now() - joinWaitStart });
      break;
    }
    await sleep(500);
  }
  const phone = await openPhone(browser, AGENT, NAME, AVATAR, PRESET);
  const page = phone.page;
  const s0 = await safeState();
  const joinOrder = Object.keys(s0?.room?.players ?? {}).length;
  logLine(AGENT, 'join-order', {
    playerCount: joinOrder,
    vipId: s0?.room?.vipId,
    myId: phone.playerId,
  });
  shots.push(await screenshot(page, AGENT, 'joined'));

  // ---- Reload helper with resume timing. ----
  const reloadedDuring = new Set<string>();
  let lastReloadAt = Date.now();
  let reloadCount = 0;
  async function doReload(reason: string, screenBefore: Screen): Promise<void> {
    reloadCount += 1;
    const sBefore = await safeState();
    const phaseBefore = sBefore?.room?.game?.state?.phase?.id ?? null;
    const vipBefore = await isVip(page).catch(() => false);
    const t = Date.now();
    logLine(AGENT, 'reload-start', {
      n: reloadCount,
      reason,
      screenBefore,
      phaseBefore,
      vipBefore,
    });
    await page
      .reload({ waitUntil: 'domcontentloaded' })
      .catch((e) => logLine(AGENT, 'reload-error', { text: String(e).slice(0, 200) }));
    let nameMs: number | null = null;
    let screenMs: number | null = null;
    let screenAfter: Screen = 'unknown';
    let sawJoinForm = false;
    let sawReconnecting = false;
    const deadline = Date.now() + 15_000;
    while (Date.now() < deadline) {
      const sc = await detectScreen(page);
      if (sc === 'join') sawJoinForm = true;
      if (sc === 'resuming' || sc === 'unknown') {
        if (
          (await page
            .getByText('Reconnecting…')
            .count()
            .catch(() => 0)) > 0
        )
          sawReconnecting = true;
      }
      if (nameMs === null) {
        const hasName =
          (await page
            .locator('header')
            .getByText(NAME, { exact: true })
            .count()
            .catch(() => 0)) > 0;
        if (hasName) nameMs = Date.now() - t;
      }
      if (nameMs !== null && !NOT_READY.includes(sc)) {
        screenMs = Date.now() - t;
        screenAfter = sc;
        break;
      }
      await sleep(50);
    }
    const sAfter = await safeState();
    const phaseAfter = sAfter?.room?.game?.state?.phase?.id ?? null;
    const me = Object.values(sAfter?.room?.players ?? {}).find((p) => p.id === phone.playerId);
    const headerNames = await page
      .locator('header')
      .innerText()
      .catch(() => '');
    const vipAfter = await isVip(page).catch(() => false);
    const samePhase = phaseBefore === phaseAfter;
    const sameScreen = screenAfter === screenBefore;
    const ok = !sawJoinForm && nameMs !== null && screenMs !== null && me?.name === NAME;
    const data = {
      n: reloadCount,
      reason,
      screenBefore,
      screenAfter,
      phaseBefore,
      phaseAfter,
      samePhase,
      sameScreen,
      nameMs,
      screenMs,
      sawJoinForm,
      sawReconnecting,
      serverName: me?.name ?? null,
      serverConnected: me?.connected ?? null,
      vipBefore,
      vipAfter,
      headerText: headerNames.slice(0, 80),
    };
    logLine(AGENT, ok ? 'reload-resumed' : 'reload-FAILED', data);
    if (vipBefore !== vipAfter)
      logLine(AGENT, 'vip-badge-changed-across-reload', { vipBefore, vipAfter });
    shots.push(await screenshot(page, AGENT, `reload${reloadCount}-${screenBefore}`));
    const typeNote = sameScreen
      ? 'same screen type as before the reload'
      : samePhase
        ? `DIFFERENT screen type after reload (${screenBefore} -> ${screenAfter}) in the same phase ${phaseAfter}`
        : `screen type changed (${screenBefore} -> ${screenAfter}) but the phase also moved (${phaseBefore} -> ${phaseAfter})`;
    claims.push({
      claim: ok
        ? `Reload #${reloadCount} during '${screenBefore}' (${reason}): resumed the same player (no join form) in ${screenMs} ms (header name at ${nameMs} ms), ${typeNote}`
        : `Reload #${reloadCount} during '${screenBefore}' (${reason}) FAILED to resume cleanly`,
      ok: ok && (sameScreen || !samePhase),
      evidence: `log reload-${ok ? 'resumed' : 'FAILED'} n=${reloadCount} at +${Math.round(elapsed() / 1000)}s: ${JSON.stringify(data)}; screenshot ${AGENT}-reload${reloadCount}-${screenBefore}.png`,
    });
    reloadedDuring.add(
      screenBefore === 'vote' || screenBefore === 'choices' ? 'vote/choices' : screenBefore,
    );
    lastReloadAt = Date.now();
  }

  // ---- Main loop. ----
  let lastScreen: Screen | 'none' = 'none';
  let lastVip: boolean | null = null;
  let lastStatus = '';
  let lastPhaseKey = '';
  let inputSince = 0;
  let actedOnKey = ''; // phaseKey+screen we already acted on (allow re-act for the 2nd prompt)
  let actCountInPhase = 0;
  let lastActAt = 0;
  let seed = 4;
  let handledResultsKey = '';
  let lastReconnectBanner = false;
  let sawGameStart = false;

  while (elapsed() < HARD_STOP_MS) {
    const s = await safeState();
    const room = s?.room ?? null;
    const status = room?.status ?? 'none';
    const phase = room?.game?.state?.phase ?? null;
    const phaseKey = phase ? `${room?.game?.gameId}:${phase.id}@${phase.startedAt}` : '';
    if (status !== lastStatus) {
      logLine(AGENT, 'status-change', {
        from: lastStatus,
        to: status,
        players: Object.keys(room?.players ?? {}).length,
        vipId: room?.vipId,
      });
      if (status === 'playing' || status === 'in-game' || status === 'game') sawGameStart = true;
      if (status === 'lobby' && lastStatus !== '' && gamesFinished >= 2) {
        logLine(AGENT, 'done', { reason: 'room back to lobby after game 2', gamesFinished });
        lastStatus = status;
        break;
      }
      lastStatus = status;
    }
    if (phaseKey && phaseKey !== lastPhaseKey) {
      logLine(AGENT, 'phase-change', {
        gameId: room?.game?.gameId,
        phase: phase?.id,
        startedAt: phase?.startedAt,
        deadline: phase?.deadline,
      });
      if (!phaseKeys.has(phaseKey)) {
        phaseKeys.add(phaseKey);
        phasesSeen.push(`${room?.game?.gameId}:${phase?.id}@${phase?.startedAt}`);
      }
      lastPhaseKey = phaseKey;
      actCountInPhase = 0;
      actedOnKey = '';
    }

    const screen = await detectScreen(page);
    const vip = await isVip(page).catch(() => false);
    const reconnecting =
      (await page
        .getByText('Reconnecting…')
        .count()
        .catch(() => 0)) > 0;
    if (reconnecting !== lastReconnectBanner) {
      logLine(AGENT, 'reconnect-banner', { shown: reconnecting, screen });
      lastReconnectBanner = reconnecting;
    }
    if (screen !== lastScreen) {
      logLine(AGENT, 'screen-change', {
        from: lastScreen,
        to: screen,
        phase: phase?.id ?? null,
        status,
        vip,
      });
      if (INPUT.includes(screen)) inputSince = Date.now();
      if (
        ['results', 'lobby', 'selecting-vip', 'selecting-wait', 'spectator', 'kicked'].includes(
          screen,
        )
      ) {
        shots.push(await screenshot(page, AGENT, `${screen}-${Math.round(elapsed() / 1000)}s`));
      }
      if (screen === 'join') {
        logLine(AGENT, 'FAILURE-join-form-appeared', { phase: phase?.id ?? null });
        claims.push({
          claim: 'The join form appeared mid-session (session lost)',
          ok: false,
          evidence: `screen-change to join at +${Math.round(elapsed() / 1000)}s`,
        });
      }
      lastScreen = screen;
    }
    if (vip !== lastVip) {
      logLine(AGENT, 'vip-badge', { vip, serverVipId: room?.vipId, myId: phone.playerId });
      lastVip = vip;
    }

    // Results: count once per results phase; VIP action if I hold the badge.
    if (screen === 'results' && phaseKey && handledResultsKey !== phaseKey) {
      // Reload once during results before acting (only if not yet done during results).
      if (!reloadedDuring.has('results')) {
        await sleep(ACT_DELAY_MS);
        await doReload('results-phase', 'results');
        continue;
      }
      handledResultsKey = phaseKey;
      gamesFinished += 1;
      logLine(AGENT, 'results-reached', { gamesFinished, vip, gameId: room?.game?.gameId });
      shots.push(await screenshot(page, AGENT, `results-game${gamesFinished}`));
      if (vip) {
        await sleep(ACT_DELAY_MS);
        if (gamesFinished === 1) {
          logLine(AGENT, 'vip-action', {
            action: 'New game -> Lightning Round (Questions -5, Answer time -1) -> Start',
          });
          try {
            await page.getByRole('button', { name: 'New game' }).click({ timeout: 10_000 });
            await sleep(500);
            await vipStartGame(page, 'Lightning Round', { Questions: 5, 'Answer time': 1 });
            logLine(AGENT, 'vip-action-done', { game: 'Lightning Round' });
            claims.push({
              claim:
                'As badge holder at results 1, pressed New game, picked Lightning Round, stepped Questions 10->5 and Answer time 15->10, pressed Start',
              ok: true,
              evidence: `vip-action-done at +${Math.round(elapsed() / 1000)}s`,
            });
          } catch (e) {
            logLine(AGENT, 'vip-action-error', { text: String(e).slice(0, 300) });
            claims.push({
              claim: 'VIP New game flow failed',
              ok: false,
              evidence: String(e).slice(0, 200),
            });
          }
        } else {
          logLine(AGENT, 'vip-action', { action: 'Back to lobby' });
          try {
            await page.getByRole('button', { name: 'Back to lobby' }).click({ timeout: 10_000 });
            logLine(AGENT, 'vip-action-done', { action: 'Back to lobby' });
            claims.push({
              claim: 'As badge holder at results 2, pressed Back to lobby',
              ok: true,
              evidence: `vip-action-done at +${Math.round(elapsed() / 1000)}s`,
            });
          } catch (e) {
            logLine(AGENT, 'vip-action-error', { text: String(e).slice(0, 300) });
          }
        }
      }
    }

    // Mandatory per-type reloads: once during text-answer, once during vote/choices.
    if (
      screen === 'text-answer' &&
      !reloadedDuring.has('text-answer') &&
      Date.now() - inputSince > 600
    ) {
      await doReload('text-answer-phase', screen);
      inputSince = Date.now();
      continue;
    }
    if (
      (screen === 'vote' || screen === 'choices') &&
      !reloadedDuring.has('vote/choices') &&
      Date.now() - inputSince > 600
    ) {
      await doReload('vote-choices-phase', screen);
      inputSince = Date.now();
      continue;
    }
    // Periodic ~25 s reload (never in the middle of a VIP flow; results handled above).
    if (
      Date.now() - lastReloadAt > RELOAD_EVERY_MS &&
      screen !== 'selecting-vip' &&
      screen !== 'join'
    ) {
      await doReload('periodic', screen);
      if (INPUT.includes(screen)) inputSince = Date.now();
      continue;
    }

    // Input screens: act after the persona delay.
    if (
      INPUT.includes(screen) &&
      Date.now() - inputSince >= ACT_DELAY_MS &&
      Date.now() - lastActAt >= ACT_DELAY_MS
    ) {
      const key = `${phaseKey}|${screen}|${actCountInPhase}`;
      if (actedOnKey !== key) {
        const did = await actOnce(page, seed).catch((e) => {
          logLine(AGENT, 'act-error', { text: String(e).slice(0, 200) });
          return null;
        });
        lastActAt = Date.now();
        if (did) {
          seed += 3;
          actCountInPhase += 1;
          actedOnKey = key;
          logLine(AGENT, 'acted', { did, screen, phase: phase?.id ?? null, actCountInPhase });
        }
      }
    }

    // Original-VIP fallback: if I somehow hold the badge in the lobby with >= 4 players or 90 s, start Wisecrack.
    if (screen === 'lobby' && vip && !sawGameStart && gamesFinished === 0) {
      const n = Object.keys(room?.players ?? {}).length;
      if (n >= 4 || elapsed() > 90_000) {
        logLine(AGENT, 'vip-action', { action: 'lobby start Wisecrack', players: n });
        await sleep(ACT_DELAY_MS);
        try {
          await vipStartGame(page, 'Wisecrack');
          logLine(AGENT, 'vip-action-done', { game: 'Wisecrack' });
        } catch (e) {
          logLine(AGENT, 'vip-action-error', { text: String(e).slice(0, 300) });
        }
      }
    }
    if (screen === 'selecting-vip' && vip && gamesFinished === 0) {
      logLine(AGENT, 'vip-action', { action: 'selecting-vip: start Wisecrack' });
      try {
        await vipStartGame(page, 'Wisecrack');
        logLine(AGENT, 'vip-action-done', { game: 'Wisecrack' });
      } catch (e) {
        logLine(AGENT, 'vip-action-error', { text: String(e).slice(0, 300) });
      }
    }

    await sleep(700);
  }

  if (elapsed() >= HARD_STOP_MS)
    logLine(AGENT, 'done', { reason: 'hard stop 500 s', gamesFinished });
  shots.push(await screenshot(page, AGENT, 'final'));
  logLine(AGENT, 'summary', {
    gamesFinished,
    reloads: reloadCount,
    reloadedDuring: [...reloadedDuring],
    phasesSeen,
    errors: phone.errors.slice(0, 20),
    claims,
    screenshots: shots,
    restarted,
  });
} catch (e) {
  logLine(AGENT, 'fatal', {
    text: String(e).slice(0, 500),
    stack: String((e as Error).stack ?? '').slice(0, 800),
  });
  throw e;
} finally {
  await browser.close().catch(() => undefined);
}
