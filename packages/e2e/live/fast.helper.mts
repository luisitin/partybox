// Live multi-agent play: persona "fast" (Finn, owl, pixel). Joins second, acts within ~500 ms,
// watches for the VIP badge flipping to it and performs the badge-holder results actions.
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
import type { DevState, Screen } from './lib.mts';

const AGENT = 'fast';
const NAME = 'Finn';
const AVATAR = 'owl';
const PRESET = 'pixel';
const BUDGET_MS = 500_000;
const LOOP_MS = 350;
const LOBBY_MAX_WAIT_MS = 90_000;

const t0 = Date.now();
const elapsed = (): number => Date.now() - t0;

const browser = await launch();
let phone: Awaited<ReturnType<typeof openPhone>> | null = null;
const phasesSeen: string[] = [];
const screensSeen: string[] = [];
let gamesFinished = 0;
let lastScreen: Screen | 'none' = 'none';
let lastVip: boolean | null = null;
let lastPhaseKey = '';
let lastStatus = '';
let lastReconnecting = false;
let lastActionAt = 0;
let seed = 7;
let startedGame1 = false;
let handledResultsKey = '';
let vipFlipAt: string | null = null;
const shots: string[] = [];

async function safeState(): Promise<DevState | null> {
  try {
    return await devState();
  } catch (e) {
    logLine(AGENT, 'devstate-error', { text: String(e).slice(0, 200) });
    return null;
  }
}

try {
  logLine(AGENT, 'start', { name: NAME, avatar: AVATAR, preset: PRESET });
  const pre = await safeState();
  logLine(AGENT, 'pre-join-state', {
    status: pre?.room?.status ?? null,
    players: Object.values(pre?.room?.players ?? {}).map((p) => p.name),
    vipId: pre?.room?.vipId ?? null,
  });
  phone = await openPhone(browser, AGENT, NAME, AVATAR, PRESET);
  const page = phone.page;
  const joinedAt = Date.now();
  shots.push(await screenshot(page, AGENT, 'joined'));

  while (elapsed() < BUDGET_MS) {
    const loopStart = Date.now();
    const s = await safeState();
    const room = s?.room ?? null;
    const status = room?.status ?? 'none';
    const phase = room?.game?.state?.phase ?? null;
    const gameId = room?.game?.gameId ?? null;
    const phaseKey = phase ? `${gameId}:${phase.id}@${phase.startedAt}` : '';
    const players = Object.values(room?.players ?? {});
    const me = players.find((p) => p.name === NAME) ?? null;

    if (status !== lastStatus) {
      logLine(AGENT, 'status-change', {
        from: lastStatus,
        to: status,
        players: players.map((p) => `${p.name}${p.isVip ? '*' : ''}${p.connected ? '' : '(off)'}`),
        vipId: room?.vipId ?? null,
      });
      lastStatus = status;
    }
    if (phaseKey && phaseKey !== lastPhaseKey) {
      logLine(AGENT, 'phase-change', {
        gameId,
        phase: phase?.id,
        startedAt: phase?.startedAt,
        deadline: phase?.deadline,
        status,
      });
      phasesSeen.push(phaseKey);
      lastPhaseKey = phaseKey;
    }

    const screen = await detectScreen(page);
    if (screen !== lastScreen) {
      logLine(AGENT, 'screen-change', {
        from: lastScreen,
        to: screen,
        phase: phase?.id ?? null,
        status,
      });
      screensSeen.push(screen);
      if (screen === 'results') {
        gamesFinished += 1;
        shots.push(await screenshot(page, AGENT, `results-${gamesFinished}`));
      }
      if (screen === 'lobby' && gamesFinished >= 2) {
        shots.push(await screenshot(page, AGENT, 'lobby-after-game2'));
      }
      lastScreen = screen;
    }

    const vip = await isVip(page);
    if (vip !== lastVip) {
      const stamp = new Date().toISOString();
      logLine(AGENT, 'vip-badge-change', {
        from: lastVip,
        to: vip,
        screen,
        phase: phase?.id ?? null,
        status,
        devVipId: room?.vipId ?? null,
        devMeIsVip: me?.isVip ?? null,
        players: players.map((p) => `${p.name}${p.isVip ? '*' : ''}${p.connected ? '' : '(off)'}`),
      });
      if (lastVip !== null && vip) vipFlipAt = stamp;
      shots.push(
        await screenshot(page, AGENT, `vip-${vip ? 'on' : 'off'}-${Math.round(elapsed() / 1000)}s`),
      );
      lastVip = vip;
    }

    const rec = await isReconnecting(page);
    if (rec !== lastReconnecting) {
      logLine(AGENT, 'reconnect-banner', { visible: rec, screen, status });
      lastReconnecting = rec;
    }

    // Stop condition: lobby again after game 2.
    if (gamesFinished >= 2 && status === 'lobby' && screen === 'lobby') {
      logLine(AGENT, 'done', { reason: 'lobby-after-game2', elapsedMs: elapsed() });
      break;
    }

    // Input screens: act fast.
    if (screen === 'text-answer' || screen === 'choices' || screen === 'vote') {
      if (Date.now() - lastActionAt > 250) {
        const did = await actOnce(page, seed).catch((e) => {
          logLine(AGENT, 'act-error', { text: String(e).slice(0, 200) });
          return null;
        });
        if (did) {
          seed += 3;
          lastActionAt = Date.now();
          logLine(AGENT, 'acted', {
            screen,
            did,
            phase: phase?.id ?? null,
            latencyMs: Date.now() - loopStart,
          });
        }
      }
    }

    // VIP in lobby: start game 1 once >= 4 players or after 90 s.
    if (
      vip &&
      !startedGame1 &&
      (screen === 'lobby' || screen === 'selecting-vip') &&
      status === 'lobby'
    ) {
      const n = players.length;
      const waited = Date.now() - joinedAt;
      if (n >= 4 || waited >= LOBBY_MAX_WAIT_MS) {
        logLine(AGENT, 'vip-start-game1', {
          players: n,
          waitedMs: waited,
          game: 'Wisecrack',
          stepDown: { Rounds: 1 },
        });
        try {
          await vipStartGame(page, 'Wisecrack', { Rounds: 1 });
          startedGame1 = true;
          shots.push(await screenshot(page, AGENT, 'started-game1'));
          logLine(AGENT, 'vip-start-game1-done', {});
        } catch (e) {
          logLine(AGENT, 'vip-start-game1-error', { text: String(e).slice(0, 300) });
          shots.push(await screenshot(page, AGENT, 'start-game1-error'));
        }
      }
    }

    // VIP at results: once per results phase.
    if (vip && screen === 'results') {
      const key = `${gamesFinished}:${phaseKey || status}`;
      if (key !== handledResultsKey) {
        handledResultsKey = key;
        const lastGameId =
          gameId ??
          (room as unknown as { lastGame?: { gameId?: string } } | null)?.lastGame?.gameId ??
          null;
        logLine(AGENT, 'vip-results-action', { gamesFinished, gameId: lastGameId, key });
        try {
          if (gamesFinished <= 1) {
            await page.getByRole('button', { name: 'New game' }).click();
            logLine(AGENT, 'vip-pressed', { button: 'New game' });
            await sleep(400);
            shots.push(await screenshot(page, AGENT, 'after-new-game'));
            await vipStartGame(page, 'Lightning Round', { Questions: 5, 'Answer time': 1 });
            logLine(AGENT, 'vip-start-game2-done', {
              game: 'Lightning Round',
              stepDown: { Questions: 5, 'Answer time': 1 },
            });
            shots.push(await screenshot(page, AGENT, 'started-game2'));
          } else {
            await page.getByRole('button', { name: 'Back to lobby' }).click();
            logLine(AGENT, 'vip-pressed', { button: 'Back to lobby' });
            await sleep(400);
            shots.push(await screenshot(page, AGENT, 'after-back-to-lobby'));
          }
        } catch (e) {
          logLine(AGENT, 'vip-results-error', { text: String(e).slice(0, 300) });
          shots.push(await screenshot(page, AGENT, `results-error-${gamesFinished}`));
        }
      }
    }

    const dt = Date.now() - loopStart;
    if (dt < LOOP_MS) await sleep(LOOP_MS - dt);
  }
  if (elapsed() >= BUDGET_MS) logLine(AGENT, 'done', { reason: 'budget', elapsedMs: elapsed() });
} catch (e) {
  logLine(AGENT, 'fatal', { text: String(e).slice(0, 500) });
  if (phone) shots.push(await screenshot(phone.page, AGENT, 'fatal'));
  throw e;
} finally {
  const finalState = await safeState();
  logLine(AGENT, 'summary', {
    gamesFinished,
    phasesSeen,
    screensSeen,
    vipFlipAt,
    finalStatus: finalState?.room?.status ?? null,
    finalPlayers: Object.values(finalState?.room?.players ?? {}).map(
      (p) => `${p.name}${p.isVip ? '*' : ''}${p.connected ? '' : '(off)'}`,
    ),
    consoleErrors: phone?.errors ?? [],
    screenshots: shots,
    elapsedMs: elapsed(),
  });
  if (phone) shots.push(await screenshot(phone.page, AGENT, 'final'));
  await browser.close();
}
