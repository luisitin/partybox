// Live multi-agent play — persona "late" (player "Lou", avatar ghost, Pixel preset).
// Does NOT join at the start: waits for room.status === 'playing', then joins 5 s later and
// expects to be a spectator for the rest of game 1 and a full player in game 2.
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

const AGENT = 'late';
const NAME = 'Lou';
const AVATAR = 'ghost';
const PRESET = 'pixel';
const ACT_DELAY_MS = 1000; // persona delay before each UI action in game 2
const TICK_MS = 700;
const HARD_STOP_MS = 500_000;
const JOIN_WAIT_MAX_MS = 120_000;

const t0 = Date.now();
const elapsed = (): number => Date.now() - t0;

const summary = {
  joinedAt: null as string | null,
  firstScreenAfterJoin: null as Screen | null,
  spectatorFlagAfterJoin: null as boolean | null,
  game1ScreensSeen: new Set<string>(),
  game1SpectatorFlagChanges: [] as { t: string; spectator: boolean }[],
  game1NonSpectatorScreens: [] as { t: string; screen: Screen; phase: string }[],
  game2Actions: 0,
  game2ActionsList: [] as string[],
  game2InputScreens: new Set<string>(),
  game2ReachedResults: false,
  game2SpectatorFlagAtStart: null as boolean | null,
  vipAtResults: [] as { game: number; isVip: boolean }[],
  vipActionsDone: [] as string[],
  phases: [] as string[],
  vipBadgeChanges: [] as { t: string; vip: boolean }[],
  reconnectBanners: 0,
  endedBecause: 'unknown',
  gamesFinished: 0,
  restarted: false,
  screenshots: [] as string[],
};

const browser = await launch();
let phone: Phone | null = null;

async function shot(page: Phone['page'], label: string): Promise<void> {
  const p = await screenshot(page, AGENT, label);
  summary.screenshots.push(p);
  logLine(AGENT, 'screenshot', { label, path: p });
}

function phaseKey(s: DevState): string | null {
  const ph = s.room?.game?.state?.phase;
  if (!ph) return null;
  return `${s.room?.game?.gameId}:${ph.id}@${ph.startedAt}`;
}

try {
  logLine(AGENT, 'start', { persona: 'late', name: NAME, avatar: AVATAR, preset: PRESET });

  // ---- 1. Wait (do not join) until the room is playing ---------------------------------
  let s = await devState();
  let lastStatus = s.room?.status ?? 'none';
  logLine(AGENT, 'waiting-to-join', {
    status: lastStatus,
    players: Object.keys(s.room?.players ?? {}).length,
  });
  while (elapsed() < JOIN_WAIT_MAX_MS) {
    s = await devState();
    const st = s.room?.status ?? 'none';
    if (st !== lastStatus) {
      logLine(AGENT, 'room-status', {
        status: st,
        players: Object.keys(s.room?.players ?? {}).length,
        vipId: s.room?.vipId,
      });
      lastStatus = st;
    }
    if (st === 'playing') break;
    await sleep(TICK_MS);
  }
  if (lastStatus !== 'playing') {
    logLine(AGENT, 'join-timeout', { status: lastStatus, waitedMs: elapsed() });
    // Persona fallback: join anyway so the session still gets a data point.
  } else {
    logLine(AGENT, 'room-playing-detected', { waitedMs: elapsed(), phase: phaseKey(s) });
    await sleep(5000);
  }

  // ---- 2. Join through the real form ----------------------------------------------------
  phone = await openPhone(browser, AGENT, NAME, AVATAR, PRESET);
  const page = phone.page;
  summary.joinedAt = new Date().toISOString();
  await sleep(400);
  s = await devState();
  const me = phone.playerId ? s.room?.players[phone.playerId] : undefined;
  let screen = await detectScreen(page);
  summary.firstScreenAfterJoin = screen;
  summary.spectatorFlagAfterJoin = me?.spectator ?? null;
  logLine(AGENT, 'after-join', {
    screen,
    playerId: phone.playerId,
    spectator: me?.spectator ?? null,
    isVipFlag: me?.isVip ?? null,
    roomStatus: s.room?.status,
    phase: phaseKey(s),
    players: Object.keys(s.room?.players ?? {}).length,
  });
  await shot(page, 'after-join');

  // ---- 3. Act loop ----------------------------------------------------------------------
  // gameIndex: 1 = the game in progress when we joined, 2 = next one.
  let gameIndex = s.room?.status === 'playing' || s.room?.status === 'results' ? 1 : 0;
  let lastGameId: string | null = s.room?.game?.gameId ?? null;
  let lastPhase: string | null = phaseKey(s);
  if (lastPhase) summary.phases.push(lastPhase);
  let lastScreen: Screen = screen;
  let lastVip = await isVip(page);
  let lastSpectator = me?.spectator ?? null;
  let lastReconnect = false;
  let seed = 7;
  let resultsHandledFor: string | null = null; // phase key of results screen already acted on
  let gameStartedAfterJoin = false; // becomes true when a *new* game (game 2) begins
  let resultsSeenGames = new Set<string>();
  let lastActAt = 0;
  let statusWasResultsOrPlayingAfterGame2 = false;

  while (elapsed() < HARD_STOP_MS) {
    s = await devState().catch((e: unknown) => {
      logLine(AGENT, 'devstate-error', { text: String(e).slice(0, 200) });
      return { room: null } as DevState;
    });
    const status = s.room?.status ?? 'none';
    const gameId = s.room?.game?.gameId ?? null;
    const pk = phaseKey(s);
    const meNow = phone.playerId ? s.room?.players[phone.playerId] : undefined;

    // status change
    if (status !== lastStatus) {
      logLine(AGENT, 'room-status', {
        status,
        gameId,
        vipId: s.room?.vipId,
        players: Object.keys(s.room?.players ?? {}).length,
      });
      if (
        status === 'playing' &&
        gameIndex >= 1 &&
        (lastStatus === 'selecting' || lastStatus === 'results' || lastStatus === 'lobby')
      ) {
        gameIndex += 1;
        gameStartedAfterJoin = true;
        summary.game2SpectatorFlagAtStart = meNow?.spectator ?? null;
        logLine(AGENT, 'game-started', { gameIndex, gameId, spectator: meNow?.spectator ?? null });
        await shot(page, `game${gameIndex}-start`);
      }
      if (status === 'results') {
        summary.gamesFinished += 1;
        logLine(AGENT, 'game-results-reached', {
          gameIndex,
          gamesFinished: summary.gamesFinished,
          results: s.room?.results ? 'present' : 'null',
        });
      }
      if (status === 'lobby' && gameIndex >= 2) {
        summary.endedBecause = 'room-returned-to-lobby-after-game-2';
        logLine(AGENT, 'session-complete', { reason: summary.endedBecause, elapsedMs: elapsed() });
        await shot(page, 'final-lobby');
        lastStatus = status;
        break;
      }
      if (status === 'lobby' && gameIndex === 1 && lastStatus === 'results') {
        // Someone went back to lobby after game 1 instead of picking a new game; keep watching.
        logLine(AGENT, 'lobby-after-game-1', {});
      }
      lastStatus = status;
    }
    if (gameId !== lastGameId) {
      logLine(AGENT, 'game-id-change', { from: lastGameId, to: gameId });
      lastGameId = gameId;
    }
    if (pk !== lastPhase) {
      logLine(AGENT, 'phase', {
        phase: pk,
        gameIndex,
        deadline: s.room?.game?.state?.phase?.deadline ?? null,
      });
      if (pk) summary.phases.push(pk);
      lastPhase = pk;
    }
    if (meNow && meNow.spectator !== lastSpectator) {
      logLine(AGENT, 'spectator-flag', { spectator: meNow.spectator, gameIndex, status });
      if (gameIndex === 1)
        summary.game1SpectatorFlagChanges.push({
          t: new Date().toISOString(),
          spectator: meNow.spectator,
        });
      lastSpectator = meNow.spectator;
    }

    // phone screen
    screen = await detectScreen(page).catch(() => 'unknown' as Screen);
    if (screen !== lastScreen) {
      logLine(AGENT, 'screen', { screen, from: lastScreen, gameIndex, status, phase: pk });
      if (gameIndex === 1 && !gameStartedAfterJoin) {
        summary.game1ScreensSeen.add(screen);
        if (['text-answer', 'choices', 'vote'].includes(screen)) {
          summary.game1NonSpectatorScreens.push({
            t: new Date().toISOString(),
            screen,
            phase: pk ?? '',
          });
          await shot(page, `game1-unexpected-${screen}`);
        }
        if (screen === 'results') await shot(page, 'game1-results');
      }
      if (gameStartedAfterJoin && gameIndex >= 2) {
        if (['text-answer', 'choices', 'vote'].includes(screen))
          summary.game2InputScreens.add(screen);
        if (screen === 'results') {
          summary.game2ReachedResults = true;
          await shot(page, `game${gameIndex}-results`);
        }
        if (['text-answer', 'choices', 'vote'].includes(screen) && summary.game2Actions === 0) {
          await shot(page, `game${gameIndex}-first-input-${screen}`);
        }
      }
      lastScreen = screen;
    }
    const vip = await isVip(page).catch(() => false);
    if (vip !== lastVip) {
      logLine(AGENT, 'vip-badge', { vip, gameIndex, status });
      summary.vipBadgeChanges.push({ t: new Date().toISOString(), vip });
      lastVip = vip;
    }
    const rc = await isReconnecting(page).catch(() => false);
    if (rc !== lastReconnect) {
      logLine(AGENT, 'reconnect-banner', { visible: rc });
      if (rc) summary.reconnectBanners += 1;
      lastReconnect = rc;
    }

    // act on input screens (persona delay 1 s); during game 1 we should never see them,
    // but if we do we still act — and it is logged as unexpected above.
    if (['text-answer', 'choices', 'vote'].includes(screen)) {
      if (Date.now() - lastActAt >= ACT_DELAY_MS) {
        await sleep(ACT_DELAY_MS);
        const did = await actOnce(page, seed).catch((e: unknown) => {
          logLine(AGENT, 'act-error', { text: String(e).slice(0, 200) });
          return null;
        });
        lastActAt = Date.now();
        if (did) {
          seed += 3;
          logLine(AGENT, 'action', { did, screen, gameIndex, phase: pk });
          if (gameStartedAfterJoin && gameIndex >= 2) {
            summary.game2Actions += 1;
            summary.game2ActionsList.push(did);
          } else {
            logLine(AGENT, 'unexpected-action-in-game1', { did });
          }
        }
      }
    }

    // results screen: badge-holder action, once per results phase
    if (screen === 'results' && status === 'results') {
      const key = `results:${gameIndex}:${lastGameId ?? ''}`;
      if (!resultsSeenGames.has(key)) {
        resultsSeenGames.add(key);
        summary.vipAtResults.push({ game: gameIndex, isVip: vip });
        logLine(AGENT, 'results-screen', {
          gameIndex,
          isVip: vip,
          vipId: s.room?.vipId,
          me: phone.playerId,
        });
      }
      if (vip && resultsHandledFor !== key) {
        resultsHandledFor = key;
        // Which game just finished? Count results screens seen (game 1 vs game 2).
        const finished = resultsSeenGames.size;
        if (finished <= 1) {
          logLine(AGENT, 'vip-action', { action: 'New game -> Lightning Round', gameIndex });
          await page.getByRole('button', { name: 'New game' }).click();
          await sleep(800);
          await shot(page, 'vip-selecting');
          await vipStartGame(page, 'Lightning Round', { Questions: 5, 'Answer time': 1 });
          summary.vipActionsDone.push('new-game-lightning-round');
          logLine(AGENT, 'vip-action-done', {
            action: 'started Lightning Round (Questions -5, Answer time -1)',
          });
        } else {
          logLine(AGENT, 'vip-action', { action: 'Back to lobby', gameIndex });
          await page.getByRole('button', { name: 'Back to lobby' }).click();
          summary.vipActionsDone.push('back-to-lobby');
          logLine(AGENT, 'vip-action-done', { action: 'Back to lobby' });
        }
      }
    }
    // The VIP may also be in 'selecting' with us holding the badge (unlikely): if we hold it and
    // see the selecting-vip screen outside of the results flow, start Lightning Round.
    if (screen === 'selecting-vip' && vip && resultsHandledFor === null && gameIndex >= 1) {
      logLine(AGENT, 'vip-action', {
        action: 'selecting-vip seen with badge; starting Lightning Round',
      });
      resultsHandledFor = `selecting:${gameIndex}`;
      await vipStartGame(page, 'Lightning Round', { Questions: 5, 'Answer time': 1 }).catch(
        (e: unknown) => logLine(AGENT, 'vip-action-error', { text: String(e).slice(0, 200) }),
      );
    }

    await sleep(TICK_MS);
  }

  if (summary.endedBecause === 'unknown') {
    summary.endedBecause = elapsed() >= HARD_STOP_MS ? 'hard-stop-500s' : 'loop-exit';
    logLine(AGENT, 'session-complete', {
      reason: summary.endedBecause,
      elapsedMs: elapsed(),
      lastStatus,
      gameIndex,
    });
    if (phone) await shot(phone.page, 'final');
  }
} catch (e) {
  logLine(AGENT, 'fatal', {
    text: String(e).slice(0, 500),
    stack: (e as Error)?.stack?.slice(0, 800),
  });
  if (phone) await shot(phone.page, 'fatal').catch(() => undefined);
} finally {
  const out = {
    ...summary,
    game1ScreensSeen: [...summary.game1ScreensSeen],
    game2InputScreens: [...summary.game2InputScreens],
    consoleErrors: phone?.errors ?? [],
    elapsedMs: elapsed(),
  };
  logLine(AGENT, 'summary', out);
  await browser.close().catch(() => undefined);
}
