// Audio interaction trace, scenarios (see audio-trace.ts).
import type { Page } from 'playwright';
import { bingoLine, openPhoneTraced } from './audio-tracer';
import type { Ev, Pages, Tracer } from './audio-tracer';
import { joinViaForm, settle } from './session';
import type { Phone, DevApi } from './session';

export interface Ctx {
  T: Tracer;
  tv: Page;
  vip: Phone;
  p2: Phone;
  api: DevApi;
  pages: Pages;
  out: string;
}

export async function runMoreScenarios({ T, tv, vip, p2, api, pages, out }: Ctx): Promise<void> {
  let evs: Ev[] = [];
  let pev: Ev[] = [];
  let guard = 0;
  void guard;
  void evs;
  void pev;
  void bingoLine;
  void joinViaForm;
  void settle;
  void pages;
  const home = tv.getByRole('button', { name: /^home$/i });
  // ── F. Wisecrack ────────────────────────────────────────────────────────────────────
  T.section('F · Wisecrack: reveal sting vs phase chime, sweep, tally');
  // Already in the lobby after E (Home from the lobby itself would reset the room and drop
  // everyone). Wisecrack has no bot support: drop the bots from the VIP phone, add a phone.
  for (let i = 0; i < 6; i += 1) {
    const remove = vip.page.getByRole('button', { name: /remove bot/i });
    if ((await remove.count()) === 0) break;
    await remove.first().click();
    await settle(400);
  }
  // Home keeps everyone in the room (end + back to lobby): no rejoin needed.
  const p3 = await openPhoneTraced(pages, 'iphone-se', 'Kenji');
  await joinViaForm(p3, api, { avatarIndex: 7 });
  await settle(500);
  await api.clock(true);
  await api.start('wisecrack', 4);
  await settle(1200);
  await T.mark('F1');
  evs = await T.between(tv, 'E3', 'F1');
  const bed = async (): Promise<string | null> =>
    (await tv.evaluate('window.__pbBeds?.current() ?? null')) as string | null;
  T.ok(
    'F',
    'Wisecrack start → start cue, the lobby track only fading out, the warm bed under the intro',
    T.cues(evs).includes('start') &&
      (await T.playing(tv)).every((m) => m.vol <= 0.1) &&
      (await bed()) === 'warm',
    `cues=${T.cues(evs).join(',')} playing=${JSON.stringify(await T.playing(tv))} bed=${await bed()}`,
  );
  await api.skip(); // intro → answer
  await settle(2500);
  const writing = (await T.playing(tv)).filter((m) => m.vol > 0.1);
  T.ok(
    'F',
    'answer → one Wisecrack track at 0.2 while everyone writes, the bed gone',
    writing.length === 1 &&
      ['sneaky-snitch.mp3', 'fluffing-a-duck.mp3', 'carefree.mp3'].includes(
        writing[0]?.track ?? '',
      ) &&
      writing[0]?.vol === 0.2 &&
      (await bed()) === null,
    `playing=${JSON.stringify(await T.playing(tv))} bed=${await bed()}`,
  );
  for (const ph of [vip, p2, p3]) {
    const ta = ph.page.locator('textarea:not([disabled])');
    await ta
      .first()
      .waitFor({ timeout: 8000 })
      .catch(() => undefined); // lazy game chunk (dev)
    if (await ta.count()) {
      await ta.first().fill('Cheese on toast');
      await ph.page
        .getByRole('button', { name: /next prompt|submit|send/i })
        .first()
        .click();
      // the sent card holds for a beat before prompt 2's textarea arrives (R-063)
      const ta2 = ph.page.locator('textarea:not([disabled])');
      await ta2
        .first()
        .waitFor({ timeout: 6000 })
        .catch(() => undefined);
      if (await ta2.count()) {
        await ta2.first().fill('A small hat');
        await ph.page
          .getByRole('button', { name: /submit|send|next/i })
          .first()
          .click();
      }
    }
    await settle(300);
  }
  await settle(600);
  await vip.page.screenshot({ path: `${out}/F-answer-vip.png` });
  await T.mark('F2');
  evs = await T.between(tv, 'F1', 'F2');
  T.ok(
    'F',
    'answers → lock ticks on the TV as phones submit',
    T.cues(evs).filter((c) => c === 'lock').length >= 1,
    `cues=${T.cues(evs).join(',')}`,
  );
  pev = await T.between(vip.page, 'F1', 'F2');
  T.ok(
    'F',
    'submitting on the phone → submit cue + buzz',
    T.cues(pev, 'phone').includes('submit') && pev.some((e) => e.kind === 'buzz'),
    `phone cues=${T.cues(pev, 'phone').join(',')}`,
  );
  await api.skip(); // → vote
  await settle(500);
  const voteBed = await bed();
  T.ok(
    'F',
    'vote → the marimba bed (the first prompt), the track fading out',
    voteBed === 'marimba',
    `bed=${voteBed} playing=${JSON.stringify(await T.playing(tv))}`,
  );
  await api.post('/api/dev/act', {}).catch(() => undefined);
  await settle(500);
  // Everyone voting closes the vote by itself; only skip when it is still open.
  if ((await api.state()).room?.game?.state.phase.id === 'vote') await api.skip(); // → reveal
  await settle(2500);
  await T.mark('F3');
  evs = await T.between(tv, 'F2', 'F3');
  const cs = T.cues(evs);
  T.ok(
    'F',
    'reveal keeps the vote’s bed (same list, same turn: no crossfade on the cut)',
    (await bed()) === voteBed && (await T.playing(tv)).length === 0,
    `bed=${await bed()} playing=${JSON.stringify(await T.playing(tv))}`,
  );
  T.ok(
    'F',
    'reveal → the reveal sting from the game, no phase chime within it',
    cs.includes('reveal') &&
      !evs.some(
        (e) =>
          e.kind === 'cue' &&
          e['cue'] === 'phase' &&
          Math.abs(e.t - (evs.find((x) => x.kind === 'cue' && x['cue'] === 'reveal')?.t ?? 0)) <
            400,
      ),
    `cues=${cs.join(',')}`,
  );
  guard = 0;
  while (guard++ < 20) {
    const s = await api.state();
    if (s.room?.game?.state.phase.id === 'scores' || s.room?.status !== 'playing') break;
    await api.skip();
    await settle(150);
  }
  await settle(800);
  await T.mark('F4');
  evs = await T.between(tv, 'F3', 'F4');
  T.ok(
    'F',
    'scores phase → tally ping (mapped), the lounge bed',
    T.cues(evs).includes('tally') && (await bed()) === 'lounge',
    `cues=${T.cues(evs).join(',')} bed=${await bed()}`,
  );
  T.timeline(await T.between(tv, 'E3', 'F4'), 'tv');
  await p3.context.close();

  // ── G. Broken Pencil ────────────────────────────────────────────────────────────────
  T.section('G · Broken Pencil: music only while drawing/guessing, reveal on show');
  await home.click();
  await home.click();
  await settle(1500);
  // Home keeps everyone in the room (end + back to lobby): no rejoin needed.
  await settle(500);
  await api.bots(2, 'idle');
  await api.clock(true);
  await api.start('broken-pencil', 2);
  await settle(1500);
  await T.mark('G1');
  let phase = (await api.state()).room?.game?.state.phase.id;
  const playingAtPick = await T.playing(tv);
  evs = await T.between(tv, 'F4', 'G1');
  T.ok(
    'G',
    `first phase (${phase}) → no game music yet unless it is draw/guess/pass`,
    ['draw', 'guess', 'pass'].includes(String(phase))
      ? playingAtPick.length === 1
      : playingAtPick.length === 0,
    `phase=${phase} playing=${JSON.stringify(playingAtPick)} plan=${evs
      .filter((e) => e.kind === 'music:plan')
      .map((e) => `${e['from']}→${e['to']}`)
      .join(' ')}`,
  );
  guard = 0;
  while (guard++ < 10 && !['draw', 'guess', 'pass'].includes(String(phase))) {
    await api.skip();
    await settle(200);
    phase = (await api.state()).room?.game?.state.phase.id;
  }
  await settle(1200);
  await T.mark('G2');
  const playingDraw = await T.playing(tv);
  T.ok(
    'G',
    `draw/guess/pass (${phase}) → the Broken Pencil set at 0.2, one track`,
    playingDraw.length === 1 &&
      ['backbay-lounge.mp3', 'lobby-time.mp3', 'hep-cats.mp3'].includes(
        playingDraw[0]?.track ?? '',
      ) &&
      playingDraw[0]?.vol === 0.2,
    JSON.stringify(playingDraw),
  );
  guard = 0;
  while (guard++ < 40) {
    const s = await api.state();
    if (s.room?.status !== 'playing' || s.room.game?.state.phase.id === 'show') break;
    await api.skip();
    await settle(120);
  }
  await settle(1500);
  await T.mark('G3');
  evs = await T.between(tv, 'G2', 'G3');
  phase = (await api.state()).room?.game?.state.phase.id;
  T.ok(
    'G',
    `show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (${phase})`,
    T.cues(evs).includes('card') && (await T.playing(tv)).length === 0,
    `cues=${T.cues(evs).join(',')} playing=${JSON.stringify(await T.playing(tv))}`,
  );
  T.timeline(await T.between(tv, 'F4', 'G3'), 'tv');
}
