// Design pass capture: core screens + one game, every device, every role, frozen clock.
// Usage: tsx packages/e2e/src/design/capture-core.ts --out reports/design/<stamp> [--port 42071] [--game quickpoll]
import { parseArgs } from 'node:util';
import { join } from 'node:path';
import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';
import type { DeviceId } from './devices';
import { REPO_ROOT, startServer } from './server';
import type { DevServer } from './server';
import {
  DevApi,
  applyDeviceCss,
  joinViaForm,
  openPhone,
  openTv,
  passAudioGate,
  settle,
} from './session';
import type { Phone } from './session';
import { Shooter } from './shooter';

const { values } = parseArgs({
  options: {
    out: { type: 'string' },
    port: { type: 'string', default: '42071' },
    game: { type: 'string', default: 'quickpoll' },
  },
});
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'latest');
const PORT = Number(values.port);
const GAME = values.game ?? 'quickpoll';

// Roles per device. The VIP is the first to join; the 16-char name tests truncation everywhere.
const CAST: { device: DeviceId; name: string; role: string }[] = [
  { device: 'iphone', name: 'Sam', role: 'vip' },
  { device: 'iphone-se', name: 'Maximiliano Vega', role: 'active' },
  { device: 'pixel', name: 'Priya', role: 'submitted' },
  { device: 'galaxy', name: 'Jo', role: 'reconnecting' },
  { device: 'font200', name: 'Kenji', role: 'active' },
  { device: 'landscape', name: 'Lena', role: 'active' },
];

async function main(): Promise<void> {
  let server: DevServer = await startServer(PORT);
  const api = new DevApi(server.url);
  const shots = new Shooter(OUT);
  const browser: Browser = await chromium.launch();
  const phones: Phone[] = [];
  const core = 'core';
  const tvShot = (tv: Page, phase: string, role = 'stage', note?: string): Promise<string> =>
    shots.shot(tv, { group: core, phase, device: 'tv', role, note });
  const phoneShot = (
    phone: Phone,
    group: string,
    phase: string,
    role: string,
    note?: string,
  ): Promise<string> => shots.shot(phone.page, { group, phase, device: phone.device, role, note });

  try {
    await api.reset();
    // ── TV: audio gate + empty lobby ──────────────────────────────────────────────────────────
    const tv = await openTv(browser, server.url);
    await tvShot(tv, 'tv-gate', 'stage', 'first load: tap-to-start overlay');
    await passAudioGate(tv);
    await tvShot(tv, 'lobby-0', 'stage', 'no players yet');

    // ── Join: empty + filled, every phone ─────────────────────────────────────────────────────
    for (const member of CAST) {
      const phone = await openPhone(browser, server.url, member.device, member.name);
      phones.push(phone);
      await phoneShot(phone, core, 'join-empty', member.role);
    }
    const vip = phones[0]!;
    await vip.page.getByLabel(/your name/i).fill('Sam');
    await vip.page.getByRole('radio').nth(3).click();
    await phoneShot(vip, core, 'join-filled', 'vip', 'name typed, avatar picked');
    await vip.page.getByLabel(/your name/i).focus();
    await phoneShot(
      vip,
      core,
      'join-keyboard-focus',
      'vip',
      'name field focused (no OS keyboard in headless)',
    );

    // ── Lobby 1 ───────────────────────────────────────────────────────────────────────────────
    await joinViaForm(vip, api, { avatarIndex: 3 });
    await tvShot(tv, 'lobby-1', 'stage', 'first player = VIP');
    await phoneShot(vip, core, 'lobby-1', 'vip');

    // ── Lobby 6 ───────────────────────────────────────────────────────────────────────────────
    for (let i = 1; i < phones.length; i += 1)
      await joinViaForm(phones[i]!, api, { avatarIndex: i * 2 + 1 });
    await settle(500);
    await tvShot(tv, 'lobby-6');
    for (let i = 0; i < phones.length; i += 1)
      await phoneShot(phones[i]!, core, 'lobby-6', CAST[i]!.role);

    // ── Join errors: name taken ───────────────────────────────────────────────────────────────
    const late = await openPhone(browser, server.url, 'iphone', 'Sam');
    await joinViaForm(late, api, { expectError: true });
    await phoneShot(late, core, 'join-name-taken', 'joiner', '"That name is taken."');
    // NB: dismissing the error strip leaves the button stuck on "Joining…" (R-finding); leave it.

    // ── VIP menu (lobby) + locked room ────────────────────────────────────────────────────────
    await vip.page.getByRole('button', { name: /vip/i }).click();
    await phoneShot(vip, core, 'vip-menu-lobby', 'vip');
    await vip.page.getByRole('button', { name: /lock room/i }).click();
    await vip.page.getByRole('button', { name: /^close$/i }).click();
    await settle(300);
    await tvShot(tv, 'lobby-locked', 'stage', 'lock glyph in header');
    late.name = 'Late Luca';
    await joinViaForm(late, api, { expectError: true });
    await phoneShot(late, core, 'join-room-locked', 'joiner', '"This room is locked."');
    await vip.page.getByRole('button', { name: /vip/i }).click();
    await vip.page.getByRole('button', { name: /unlock room/i }).click();
    await vip.page.getByRole('button', { name: /^close$/i }).click();

    // ── Selecting ─────────────────────────────────────────────────────────────────────────────
    await vip.page.getByRole('button', { name: /pick a game/i }).click();
    await settle(500);
    await tvShot(tv, 'selecting');
    await phoneShot(vip, core, 'selecting', 'vip', 'game cards + settings');
    await phoneShot(phones[1]!, core, 'selecting', 'active', 'non-VIP waits');
    await phoneShot(phones[4]!, core, 'selecting', 'active');
    await phoneShot(phones[5]!, core, 'selecting', 'active');

    // ── Playing: answer phase ─────────────────────────────────────────────────────────────────
    await api.bots(2, 'idle');
    await api.clock(true);
    await api.start(GAME, 1);
    await settle(800);
    await tvShot(tv, `${GAME}-answer`, 'stage', 'nobody answered yet');
    for (let i = 0; i < phones.length; i += 1)
      await phoneShot(phones[i]!, GAME, 'answer', CAST[i]!.role, 'input open');
    // 4K TV of the same phase
    const tv4k = await openTv(browser, server.url, 'tv4k');
    await passAudioGate(tv4k);
    await shots.shot(tv4k, { group: GAME, phase: 'answer', device: 'tv4k', role: 'stage' });
    await tv4k.context().close();

    // Submitted player (Priya) + long answer on the SE (typed but not sent)
    const priya = phones[2]!;
    await priya.page.getByLabel(/your answer/i).fill('Pineapple');
    await phoneShot(priya, GAME, 'answer-typed', 'submitted', 'text typed, not yet sent');
    await priya.page.getByRole('button', { name: /^submit$/i }).click();
    await settle(400);
    await phoneShot(priya, GAME, 'answer-submitted', 'submitted');
    await phones[1]!.page.getByLabel(/your answer/i).fill('Supercalifragil');
    await phoneShot(phones[1]!, GAME, 'answer-typed', 'active', 'SE: near max length');
    await tvShot(tv, `${GAME}-answer-1-submitted`, 'stage', 'one ✓ chip');

    // Spectator joins mid-game
    await joinViaForm(late, api, { avatarIndex: 9 });
    await settle(400);
    await phoneShot(late, GAME, 'answer', 'spectator');
    await tvShot(tv, `${GAME}-answer-spectator`, 'stage', 'spectator chip');

    // Reconnecting: phone side (offline) + TV side (server-side disconnect)
    const jo = phones[3]!;
    // setOffline does not cut an open websocket; socket.io notices via its ping timeout (~20 s).
    await jo.context.setOffline(true);
    await settle(26_000);
    await phoneShot(jo, GAME, 'answer-reconnecting', 'reconnecting', 'phone offline: banner');
    if (jo.playerId) await api.disconnect(jo.playerId, 6);
    await settle(400);
    await tvShot(tv, `${GAME}-answer-reconnecting`, 'stage', 'Jo ⟳ chip');
    await jo.context.setOffline(false);

    // VIP menu during play
    await vip.page.getByRole('button', { name: /vip/i }).click();
    await phoneShot(vip, GAME, 'vip-menu-playing', 'vip');
    await vip.page.getByRole('button', { name: /end game/i }).click();
    await phoneShot(vip, GAME, 'vip-menu-confirm', 'vip', 'destructive: tap again to confirm');
    await vip.page.getByRole('button', { name: /^pause$/i }).click();
    await settle(400);
    await tvShot(tv, `${GAME}-paused`, 'stage', 'paused curtain');
    await phoneShot(phones[1]!, GAME, 'paused', 'active');
    await vip.page.getByRole('button', { name: /^resume$/i }).click();
    await vip.page.getByRole('button', { name: /^close$/i }).click();

    // Last 5 seconds: move the frozen clock to deadline-4.6 s and trigger a push
    const state = await api.state();
    const deadline = state.room?.game?.state.phase.deadline ?? null;
    if (deadline) {
      await api.clock(true, deadline - 4600);
      await phones[4]!.page.getByLabel(/your answer/i).fill('Mochi');
      await phones[4]!.page.getByRole('button', { name: /^submit$/i }).click();
      await shots.shot(
        tv,
        { group: GAME, phase: 'answer-last5', device: 'tv', role: 'stage', note: '≈4 s left' },
        { settleMs: 250 },
      );
      await shots.shot(
        phones[1]!.page,
        { group: GAME, phase: 'answer-last5', device: 'iphone-se', role: 'active' },
        { settleMs: 0 },
      );
    }

    // ── Reveal / done ─────────────────────────────────────────────────────────────────────────
    await api.skip();
    await settle(1800);
    await tvShot(tv, `${GAME}-reveal`);
    await phoneShot(priya, GAME, 'reveal', 'submitted');
    await phoneShot(phones[1]!, GAME, 'reveal', 'active', 'did not submit');
    await phoneShot(late, GAME, 'reveal', 'spectator');
    await phoneShot(phones[5]!, GAME, 'reveal', 'active');
    await api.skip();
    await settle(1200);
    let s = await api.state();
    if (s.room?.status === 'playing') {
      await tvShot(tv, `${GAME}-done`);
      await phoneShot(priya, GAME, 'done', 'submitted');
      await api.skip();
      await settle(1000);
      s = await api.state();
    }

    // ── Results ───────────────────────────────────────────────────────────────────────────────
    await tvShot(tv, 'results', 'stage', `status=${s.room?.status}`);
    for (let i = 0; i < phones.length; i += 1)
      await phoneShot(phones[i]!, core, 'results', CAST[i]!.role);
    await phoneShot(late, core, 'results', 'spectator');

    // ── Play again → playing again, then End game ─────────────────────────────────────────────
    await vip.page.getByRole('button', { name: /play again/i }).click();
    await settle(800);
    await tvShot(tv, 'play-again', 'stage', 'second round starts');
    await phoneShot(vip, core, 'play-again', 'vip');
    await vip.page.getByRole('button', { name: /vip/i }).click();
    await vip.page.getByRole('button', { name: /end game/i }).click();
    await vip.page.getByRole('button', { name: /end game\?/i }).click();
    await settle(800);
    await tvShot(tv, 'results-after-end', 'stage', 'VIP ended the game early');

    // ── Kick ──────────────────────────────────────────────────────────────────────────────────
    const lena = phones[5]!;
    await vip.page.getByRole('button', { name: /vip/i }).click();
    const kick = vip.page
      .getByRole('listitem')
      .filter({ hasText: 'Lena' })
      .getByRole('button', { name: /kick/i });
    await kick.click();
    await phoneShot(vip, core, 'vip-kick-confirm', 'vip');
    await kick.click();
    await settle(600);
    await phoneShot(lena, core, 'kicked', 'kicked', 'back on the join form');
    await vip.page.getByRole('button', { name: /^close$/i }).click();

    // ── Lobby 16 + room full ──────────────────────────────────────────────────────────────────
    await vip.page.getByRole('button', { name: /back to lobby/i }).click();
    await settle(400);
    const st = await api.state();
    const humans = Object.keys(st.room?.players ?? {}).length;
    if (humans < 16) await api.bots(16 - humans, 'idle');
    await settle(600);
    await tvShot(tv, 'lobby-16');
    await phoneShot(vip, core, 'lobby-16', 'vip');
    await phoneShot(phones[1]!, core, 'lobby-16', 'active');
    await phoneShot(phones[4]!, core, 'lobby-16', 'active');
    // A kicked socket is closed by the server and socket.io does not auto-reconnect after an
    // "io server disconnect" → the phone stays offline (see for-stress.md). Reload to join again.
    await lena.page.reload();
    await lena.page.waitForSelector('[data-surface="controller"]');
    await applyDeviceCss(lena.page, lena.device);
    await settle(800);
    await joinViaForm(lena, api, { expectError: true });
    await phoneShot(lena, core, 'join-room-full', 'joiner', '"This room is full."');

    // ── Server restart recovery ───────────────────────────────────────────────────────────────
    await server.stop();
    await settle(2500);
    await tvShot(tv, 'server-down', 'stage', 'server killed');
    await phoneShot(vip, core, 'server-down', 'vip', 'banner while the server is gone');
    await phoneShot(phones[1]!, core, 'server-down', 'active');
    server = await startServer(PORT);
    // Vite reloads the page when its HMR socket comes back; give the dev build time to serve it.
    await settle(9000);
    await tvShot(tv, 'server-restarted', 'stage', 'new house room');
    await phoneShot(vip, core, 'server-restarted', 'vip', 'stale token → join form');
    await phoneShot(phones[1]!, core, 'server-restarted', 'active');
    console.log(`captured ${shots.shots.length} stills → ${OUT}`);
  } catch (err) {
    for (const p of phones)
      await shots
        .shot(p.page, { group: 'debug', phase: 'failure', device: p.device, role: p.name })
        .catch(() => undefined);
    throw err;
  } finally {
    shots.save();
    await browser.close();
    await server.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
