// Agent "vip" — player Vera (fox, iphone). Joins, (VIP) starts Wisecrack, goes offline for 40 s
// ~25 s into the game to test VIP handoff, then keeps playing. Logs to reports/e2e/live/vip.jsonl.
//
// Run 2 fixes (after run 1 at 21:53Z): the offline test is no longer gated on "my Start press
// succeeded" (Finn was VIP, so vipStartGame timed out and the test never fired); text answers are
// submitted with the real Wisecrack label ("Next prompt" / "Submit") because lib.actOnce's /^Submit/
// never matches on prompt 1 of 2. PB_HELPER=1 opens a second phone ("Hank") in this script because
// every other agent had already finished when run 2 started.
import {
  launch,
  openPhone,
  detectScreen,
  actOnce,
  isVip,
  isReconnecting,
  vipStartGame,
  logLine,
  screenshot,
  devState,
  sleep,
  type DevState,
  type Phone,
  type Screen,
} from './lib.mts';
import type { Page } from 'playwright';

const AGENT = 'vip';
const NAME = 'Vera';
const HELPER = process.env.PB_HELPER === '1';
const MIN_PLAYERS = Number(process.env.PB_MIN_PLAYERS ?? (HELPER ? 3 : 4));
const MAX_MS = Number(process.env.PB_MAX_MS ?? 500_000);
const LABEL_PREFIX = process.env.PB_LABEL ?? '';
const T0 = Date.now();
const ACT_DELAY_MS = 2_000;
const OFFLINE_AFTER_MS = 25_000;
const OFFLINE_FOR_MS = 40_000;

const shots: string[] = [];
const phasesSeen: string[] = [];
const ok = (): boolean => Date.now() - T0 < MAX_MS;

function phaseKey(s: DevState | null): string {
  if (!s) return 'nostate';
  const g = s.room?.game;
  if (!g) return `nogame|${s.room?.status ?? 'noroom'}`;
  return `${g.gameId}|${g.state.phase.id}|${g.state.phase.startedAt}`;
}
function vipName(s: DevState | null): string | null {
  const id = s?.room?.vipId;
  if (!id) return null;
  return s?.room?.players[id]?.name ?? null;
}
function playerOf(s: DevState | null, id: string | null) {
  if (!s || !id) return null;
  return s.room?.players[id] ?? null;
}
function playersList(s: DevState | null): string[] {
  return Object.values(s?.room?.players ?? {}).map(
    (p) =>
      `${p.name}${p.isVip ? '*' : ''}${p.connected ? '' : '(off)'}${p.spectator ? '(spec)' : ''}`,
  );
}
async function snap(page: Page, label: string): Promise<void> {
  const p = await screenshot(page, AGENT, LABEL_PREFIX + label);
  shots.push(p);
  logLine(AGENT, 'screenshot', { label: LABEL_PREFIX + label, path: p });
}
async function safeState(): Promise<DevState | null> {
  return devState().catch((e) => {
    logLine(AGENT, 'devstate-error', { error: String(e).slice(0, 200) });
    return null;
  });
}

/** Like lib.actOnce but submits text answers with the real Wisecrack button label. */
async function act(page: Page, seed: number): Promise<string | null> {
  const screen = await detectScreen(page);
  if (screen === 'text-answer') {
    const words = [
      'a very tired llama',
      'my sock drawer',
      'seven umbrellas',
      'lukewarm soup',
      'the wifi password',
    ];
    const text = words[seed % words.length] as string;
    const input = page.getByLabel('your answer');
    if (!(await input.isEditable({ timeout: 1000 }).catch(() => false))) return null;
    await input.fill(text, { timeout: 3000 });
    const btn = page.getByRole('button', { name: /^(Submit|Next prompt)$/ });
    if ((await btn.count()) === 0) return null;
    if (
      !(await btn
        .first()
        .isEnabled({ timeout: 1000 })
        .catch(() => false))
    )
      return null;
    const label =
      (await btn
        .first()
        .textContent()
        .catch(() => '')) ?? '';
    await btn.first().click({ timeout: 3000 });
    return `answer:${text} via "${label.trim()}"`;
  }
  return actOnce(page, seed);
}

interface Tracker {
  tag: string;
  phone: Phone;
  lastScreen: Screen | '';
  lastVip: boolean | null;
  lastRecon: boolean;
  lastConnected: boolean | null;
  inputSeenAt: number;
  lastActAt: number;
  seed: number;
  delayMs: number;
}
function tracker(tag: string, phone: Phone, delayMs: number, seed: number): Tracker {
  return {
    tag,
    phone,
    lastScreen: '',
    lastVip: null,
    lastRecon: false,
    lastConnected: null,
    inputSeenAt: 0,
    lastActAt: 0,
    seed,
    delayMs,
  };
}

/** One observation + (optionally) one action for a phone. Returns the current screen. */
async function tick(
  tr: Tracker,
  s: DevState | null,
  extra: Record<string, unknown>,
  mayAct: boolean,
): Promise<{ screen: Screen; vip: boolean; recon: boolean }> {
  const page = tr.phone.page;
  const screen = await detectScreen(page);
  const vip = await isVip(page);
  const recon = await isReconnecting(page);
  const p = playerOf(s, tr.phone.playerId);
  const conn = p ? p.connected : null;
  if (s && conn !== tr.lastConnected) {
    tr.lastConnected = conn;
    logLine(AGENT, 'server-sees-player', {
      who: tr.tag,
      connected: conn,
      isVipServer: p?.isVip ?? null,
      ...extra,
    });
  }
  if (screen !== tr.lastScreen) {
    logLine(AGENT, 'screen', {
      who: tr.tag,
      from: tr.lastScreen,
      to: screen,
      vipBadge: vip,
      reconnecting: recon,
      ...extra,
    });
    tr.lastScreen = screen;
    if (screen === 'text-answer' || screen === 'choices' || screen === 'vote')
      tr.inputSeenAt = Date.now();
  }
  if (vip !== tr.lastVip) {
    logLine(AGENT, 'vip-badge', { who: tr.tag, isVip: vip, serverVipName: vipName(s), ...extra });
    tr.lastVip = vip;
  }
  if (recon !== tr.lastRecon) {
    logLine(AGENT, 'reconnect-banner', { who: tr.tag, shown: recon, screen, ...extra });
    tr.lastRecon = recon;
  }
  if (mayAct && !recon && (screen === 'text-answer' || screen === 'choices' || screen === 'vote')) {
    if (Date.now() - tr.inputSeenAt >= tr.delayMs && Date.now() - tr.lastActAt >= tr.delayMs) {
      tr.lastActAt = Date.now();
      const did = await act(page, tr.seed++).catch((e) => {
        logLine(AGENT, 'act-error', { who: tr.tag, error: String(e).slice(0, 200) });
        return null;
      });
      if (did) logLine(AGENT, 'act', { who: tr.tag, screen, did, phase: phaseKey(s) });
    }
  }
  return { screen, vip, recon };
}

const browser = await launch();
let restarted = false;
try {
  logLine(AGENT, HELPER ? 'RESTART' : 'start', {
    base: 'http://127.0.0.1:42090',
    persona: AGENT,
    name: NAME,
    helper: HELPER,
    minPlayers: MIN_PLAYERS,
    maxMs: MAX_MS,
    note: HELPER
      ? 'restart: other agents already finished; opening helper phones "Hank" (owl) and "Ivy" (cat) in this script so Wisecrack can start (minPlayers 3) and a VIP handoff target exists'
      : undefined,
  });
  restarted = HELPER;
  const vera = await openPhone(browser, AGENT, NAME, 'fox', 'iphone');
  const trV = tracker('Vera', vera, ACT_DELAY_MS, 0);
  await snap(vera.page, 'joined');
  let hank: Phone | null = null;
  let trH: Tracker | null = null;
  let ivy: Phone | null = null;
  let trI: Tracker | null = null;
  if (HELPER) {
    // Wisecrack has minPlayers 3 (games/wisecrack/manifest.json) -> two helpers.
    await sleep(1500);
    hank = await openPhone(browser, AGENT, 'Hank', 'owl', 'pixel');
    trH = tracker('Hank', hank, 1000, 7);
    await sleep(1000);
    ivy = await openPhone(browser, AGENT, 'Ivy', 'cat', 'se');
    trI = tracker('Ivy', ivy, 1200, 3);
  }

  // ---- 1. wait for enough players (max 90 s) ----
  const waitStart = Date.now();
  let s = await safeState();
  while (Date.now() - waitStart < 90_000) {
    s = await safeState();
    if (Object.keys(s?.room?.players ?? {}).length >= MIN_PLAYERS) break;
    await sleep(1000);
  }
  s = await safeState();
  const veraVip = await isVip(vera.page);
  const hankVip = hank ? await isVip(hank.page) : false;
  logLine(AGENT, 'lobby-ready', {
    players: playersList(s),
    waitedMs: Date.now() - waitStart,
    status: s?.room?.status,
    vipId: s?.room?.vipId,
    vipName: vipName(s),
    veraBadge: veraVip,
    hankBadge: hankVip,
    veraScreen: await detectScreen(vera.page),
  });
  await snap(vera.page, 'before-start');

  // ---- 2. the badge holder starts Wisecrack (Rounds 3->1, Answer time 60->30) ----
  const starter: { tag: string; page: Page } | null = veraVip
    ? { tag: 'Vera', page: vera.page }
    : hankVip && hank
      ? { tag: 'Hank', page: hank.page }
      : null;
  if (starter) {
    // Wisecrack's time setting is labelled "Writing time" in games/wisecrack/manifest.json (the
    // brief's "Answer time" label only exists on Lightning Round) — run 2 timed out on that.
    try {
      await vipStartGame(starter.page, 'Wisecrack', { Rounds: 2, 'Writing time': 3 });
      logLine(AGENT, 'vip-start-pressed', {
        who: starter.tag,
        game: 'Wisecrack',
        stepDown: { Rounds: 2, 'Writing time': 3 },
      });
    } catch (e) {
      logLine(AGENT, 'vip-start-failed', {
        who: starter.tag,
        error: String(e).slice(0, 300),
        screen: await detectScreen(starter.page),
      });
      try {
        await starter.page.getByRole('button', { name: /^Start/ }).click({ timeout: 5000 });
        logLine(AGENT, 'vip-start-pressed', {
          who: starter.tag,
          game: 'Wisecrack',
          note: 'fallback: pressed Start after stepper failure',
        });
      } catch (e2) {
        logLine(AGENT, 'vip-start-fallback-failed', {
          who: starter.tag,
          error: String(e2).slice(0, 200),
        });
      }
    }
  } else {
    logLine(AGENT, 'not-vip', {
      note: 'neither of my phones holds the badge; waiting for the VIP to start',
      vipName: vipName(s),
    });
  }
  await sleep(800);
  s = await safeState();
  logLine(AGENT, 'after-start', {
    status: s?.room?.status,
    phase: phaseKey(s),
    settings: (s?.room as any)?.settings ?? null,
  });
  await snap(vera.page, 'after-start');

  // ---- 3. main loop ----
  let lastPhase = '';
  let lastVipId: string | null | undefined = undefined;
  let playingSince = 0;
  let offlineDone = false;
  let gamesFinished = 0;
  let lastResultsCountedAt = 0;
  let resultsActedFor = -1;
  let stopReason = '';
  let joinFormSince = 0;

  while (ok()) {
    s = await safeState();
    if (s) {
      const pk = phaseKey(s);
      if (pk !== lastPhase) {
        lastPhase = pk;
        phasesSeen.push(pk);
        logLine(AGENT, 'phase', {
          phase: pk,
          status: s.room?.status,
          deadline: s.room?.game?.state.phase.deadline ?? null,
          vipId: s.room?.vipId,
          vipName: vipName(s),
          players: playersList(s),
        });
      }
      if (s.room?.vipId !== lastVipId) {
        lastVipId = s.room?.vipId;
        logLine(AGENT, 'server-vip-changed', {
          vipId: s.room?.vipId,
          vipName: vipName(s),
          isVera: s.room?.vipId === vera.playerId,
        });
      }
      if (s.room?.status === 'playing' && !playingSince) {
        playingSince = Date.now();
        logLine(AGENT, 'game-started-observed', {
          at: new Date(playingSince).toISOString(),
          phase: pk,
        });
      }
    }
    const v = await tick(trV, s, {}, true);
    if (trH) await tick(trH, s, {}, true);
    if (trI) await tick(trI, s, {}, true);
    if (v.screen === 'join') {
      if (!joinFormSince) joinFormSince = Date.now();
    } else joinFormSince = 0;
    if (v.screen === 'results' && Date.now() - lastResultsCountedAt > 20_000) {
      gamesFinished += 1;
      lastResultsCountedAt = Date.now();
      logLine(AGENT, 'results-reached', {
        gamesFinished,
        veraBadge: v.vip,
        vipName: vipName(s),
        players: playersList(s),
      });
      await snap(vera.page, `results-${gamesFinished}`);
    }

    // ---- KEY TEST: Vera offline ~25 s after the game started, for 40 s ----
    if (!offlineDone && playingSince && Date.now() - playingSince >= OFFLINE_AFTER_MS) {
      offlineDone = true;
      await snap(vera.page, 'before-offline');
      const offlineAt = Date.now();
      await vera.page.context().setOffline(true);
      logLine(AGENT, 'OFFLINE-ON', {
        at: new Date(offlineAt).toISOString(),
        sinceGameStartMs: offlineAt - playingSince,
        screen: v.screen,
        vipBadge: v.vip,
        phase: phaseKey(s),
        serverVipName: vipName(s),
        plannedMs: OFFLINE_FOR_MS,
      });
      let bannerDuringOffline: string | null = null;
      let serverDisconnectedAt: string | null = null;
      let serverVipMovedAt: string | null = null;
      let escalated = false;
      while (Date.now() - offlineAt < OFFLINE_FOR_MS) {
        await sleep(700);
        const so = await safeState();
        if (so) {
          const pk = phaseKey(so);
          if (pk !== lastPhase) {
            lastPhase = pk;
            phasesSeen.push(pk);
            logLine(AGENT, 'phase', {
              phase: pk,
              status: so.room?.status,
              vipId: so.room?.vipId,
              vipName: vipName(so),
              offlineForMs: Date.now() - offlineAt,
            });
          }
          if (so.room?.vipId !== lastVipId) {
            lastVipId = so.room?.vipId;
            if (!serverVipMovedAt) serverVipMovedAt = new Date().toISOString();
            logLine(AGENT, 'server-vip-changed', {
              vipId: so.room?.vipId,
              vipName: vipName(so),
              isVera: so.room?.vipId === vera.playerId,
              offlineForMs: Date.now() - offlineAt,
            });
          }
        }
        const before = trV.lastConnected;
        const r = await tick(trV, so, { offlineForMs: Date.now() - offlineAt }, false);
        if (before !== false && trV.lastConnected === false && !serverDisconnectedAt)
          serverDisconnectedAt = new Date().toISOString();
        if (r.recon && !bannerDuringOffline) {
          bannerDuringOffline = new Date().toISOString();
          logLine(AGENT, 'reconnect-banner-first-seen', {
            at: bannerDuringOffline,
            offlineForMs: Date.now() - offlineAt,
          });
          await snap(vera.page, 'offline-banner');
        }
        if (trH) await tick(trH, so, { veraOffline: true }, true);
        if (trI) await tick(trI, so, { veraOffline: true }, true);
        // setOffline may not sever an already-open WebSocket; if the server still sees Vera
        // connected after 12 s, nudge the page with a window 'offline' event and log it.
        if (!escalated && Date.now() - offlineAt > 12_000 && trV.lastConnected === true) {
          escalated = true;
          await vera.page
            .evaluate(() => window.dispatchEvent(new Event('offline')))
            .catch(() => undefined);
          logLine(AGENT, 'offline-escalation', {
            note: 'server still showed Vera connected:true 12 s after setOffline(true); dispatched window offline event',
            offlineForMs: Date.now() - offlineAt,
          });
        }
      }
      await snap(vera.page, 'offline-end');
      await vera.page.context().setOffline(false);
      const onlineAt = Date.now();
      logLine(AGENT, 'OFFLINE-OFF', {
        at: new Date(onlineAt).toISOString(),
        offlineForMs: onlineAt - offlineAt,
        bannerDuringOffline,
        serverDisconnectedAt,
        serverVipMovedAt,
        escalated,
      });
      await snap(vera.page, 'back-online-0s');
      let bannerSeenAfter: string | null = null;
      let bannerGoneAfter: string | null = null;
      let headerNameAt: string | null = null;
      let joinFormSeen = false;
      const obsStart = Date.now();
      while (Date.now() - obsStart < 15_000) {
        await sleep(500);
        const so = await safeState();
        const r = await tick(trV, so, { afterOnlineMs: Date.now() - onlineAt }, false);
        const hasHeaderName =
          (await vera.page
            .locator('header')
            .getByText(NAME, { exact: true })
            .count()
            .catch(() => 0)) > 0;
        const joinForm = r.screen === 'join' || r.screen === 'resuming';
        if (r.recon && !bannerSeenAfter) bannerSeenAfter = new Date().toISOString();
        if (bannerSeenAfter && !r.recon && !bannerGoneAfter)
          bannerGoneAfter = new Date().toISOString();
        if (hasHeaderName && !joinForm && !headerNameAt) headerNameAt = new Date().toISOString();
        if (joinForm) joinFormSeen = true;
        if (so && so.room?.vipId !== lastVipId) {
          lastVipId = so.room?.vipId;
          logLine(AGENT, 'server-vip-changed', {
            vipId: so.room?.vipId,
            vipName: vipName(so),
            isVera: so.room?.vipId === vera.playerId,
            afterOnlineMs: Date.now() - onlineAt,
          });
        }
        if (trH) await tick(trH, so, {}, true);
        if (trI) await tick(trI, so, {}, true);
      }
      const sa = await safeState();
      const meNow = playerOf(sa, vera.playerId);
      const vb15 = await isVip(vera.page);
      const hdr15 =
        (await vera.page
          .locator('header')
          .getByText(NAME, { exact: true })
          .count()
          .catch(() => 0)) > 0;
      const join15 =
        (await vera.page
          .getByPlaceholder('e.g. Sam')
          .count()
          .catch(() => 0)) > 0;
      logLine(AGENT, 'RECONNECT-REPORT', {
        offlineForMs: onlineAt - offlineAt,
        a_bannerSeenDuringOffline: bannerDuringOffline,
        a_bannerSeenAfterOnline: bannerSeenAfter,
        a_bannerGoneAfterOnline: bannerGoneAfter,
        a_headerNameWithoutJoinFormAt: headerNameAt,
        a_headerNameNow: hdr15,
        a_joinFormEverSeen: joinFormSeen,
        a_joinFormNow: join15,
        b_isVipBadgeNow: vb15,
        c_serverVipId: sa?.room?.vipId ?? null,
        c_serverVipName: vipName(sa),
        c_veraId: vera.playerId,
        c_veraConnected: meNow?.connected ?? null,
        c_veraIsVipServer: meNow?.isVip ?? null,
        c_status: sa?.room?.status ?? null,
        c_phase: phaseKey(sa),
        players: playersList(sa),
        serverDisconnectedAt,
        serverVipMovedAt,
        screen: await detectScreen(vera.page),
      });
      await snap(vera.page, 'back-online-15s');
      logLine(AGENT, 'CLAIM-CHECK', {
        claim:
          'VIP passed to the longest-connected other player after > 30 s offline and did NOT return to Vera',
        vipIsNotVera: !!sa?.room?.vipId && sa.room.vipId !== vera.playerId,
        vipName: vipName(sa),
        badgeFalse: !vb15,
        offlineForMs: onlineAt - offlineAt,
      });
      continue;
    }

    // ---- results: whichever of my phones holds the badge does the VIP action ----
    if (v.screen === 'results' && gamesFinished > 0 && resultsActedFor !== gamesFinished) {
      const hv = trH ? await isVip(trH.phone.page) : false;
      const iv = trI ? await isVip(trI.phone.page) : false;
      const holder = v.vip
        ? { tag: 'Vera', page: vera.page }
        : hv && hank
          ? { tag: 'Hank', page: hank.page }
          : iv && ivy
            ? { tag: 'Ivy', page: ivy.page }
            : null;
      if (holder) {
        resultsActedFor = gamesFinished;
        const secondGame = gamesFinished === 1 && Date.now() - T0 < MAX_MS - 150_000;
        if (secondGame) {
          logLine(AGENT, 'vip-results-action', {
            who: holder.tag,
            action: 'New game -> Lightning Round',
            gamesFinished,
          });
          try {
            await holder.page.getByRole('button', { name: /New game/ }).click({ timeout: 5000 });
            logLine(AGENT, 'pressed', { who: holder.tag, button: 'New game' });
            await sleep(800);
            await vipStartGame(holder.page, 'Lightning Round', { questions: 5, 'Answer time': 1 });
            logLine(AGENT, 'vip-start-pressed', {
              who: holder.tag,
              game: 'Lightning Round',
              stepDown: { questions: 5, 'Answer time': 1 },
            });
            await snap(vera.page, 'after-start-2');
          } catch (e) {
            logLine(AGENT, 'vip-results-action-failed', {
              who: holder.tag,
              error: String(e).slice(0, 300),
              screen: await detectScreen(holder.page),
            });
          }
        } else {
          logLine(AGENT, 'vip-results-action', {
            who: holder.tag,
            action: 'Back to lobby',
            gamesFinished,
          });
          try {
            await holder.page
              .getByRole('button', { name: /Back to lobby/ })
              .click({ timeout: 5000 });
            logLine(AGENT, 'pressed', { who: holder.tag, button: 'Back to lobby' });
          } catch (e) {
            logLine(AGENT, 'vip-results-action-failed', {
              who: holder.tag,
              error: String(e).slice(0, 300),
              screen: await detectScreen(holder.page),
            });
          }
        }
      }
    }

    if (v.screen === 'join' && joinFormSince && Date.now() - joinFormSince > 20_000) {
      logLine(AGENT, 'REJOIN', {
        note: 'join form persisted > 20 s after reconnect; rejoining through the form (new identity)',
      });
      try {
        await vera.page.getByPlaceholder('e.g. Sam').fill(NAME);
        await vera.page.getByRole('radio', { name: 'fox' }).click();
        await vera.page.getByRole('button', { name: 'Join' }).click();
      } catch (e) {
        logLine(AGENT, 'rejoin-failed', { error: String(e).slice(0, 200) });
      }
      joinFormSince = 0;
    }

    const wanted = HELPER ? 1 : 2;
    if (
      gamesFinished >= wanted &&
      resultsActedFor === gamesFinished &&
      s?.room?.status === 'lobby' &&
      v.screen !== 'results'
    ) {
      stopReason = `lobby-after-game-${gamesFinished}`;
      break;
    }
    if (gamesFinished >= 2 && s?.room?.status === 'lobby' && v.screen !== 'results') {
      stopReason = 'lobby-after-game-2';
      break;
    }
    await sleep(700);
  }
  if (!stopReason) stopReason = ok() ? 'loop-exit' : `time-limit-${Math.round(MAX_MS / 1000)}s`;
  s = await safeState();
  await snap(vera.page, 'final');
  logLine(AGENT, 'DONE', {
    stopReason,
    elapsedMs: Date.now() - T0,
    gamesFinished,
    phasesSeen,
    finalStatus: s?.room?.status ?? null,
    finalVipName: vipName(s),
    finalPlayers: playersList(s),
    finalScreen: await detectScreen(vera.page),
    finalVipBadge: await isVip(vera.page),
    consoleErrors: vera.errors.slice(0, 20),
    helperErrors: [...(hank?.errors ?? []), ...(ivy?.errors ?? [])].slice(0, 20),
    screenshots: shots,
    restarted,
  });
} catch (e) {
  logLine(AGENT, 'FATAL', {
    error: String(e).slice(0, 500),
    stack: (e as Error)?.stack?.slice(0, 800),
  });
  throw e;
} finally {
  await browser.close().catch(() => undefined);
}
