// Audio interaction trace, scenarios (see audio-trace.ts).
import type { Page } from 'playwright';
import { bingoLine } from './audio-tracer';
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

export async function runGameScenarios({ T, tv, vip, p2, api, pages }: Ctx): Promise<void> {
  let evs: Ev[] = [];
  const pev: Ev[] = [];
  const guard = 0;
  void guard;
  void evs;
  void pev;
  void bingoLine;
  void joinViaForm;
  void settle;
  void pages;
  // ── D. Bingo ────────────────────────────────────────────────────────────────────────
  T.section('D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results');
  await api.clock(true);
  await api.start('bingo', 11);
  await settle(1500);
  await T.mark('D1');
  evs = await T.between(tv, 'C3', 'D1');
  const bingoStart = evs.find(
    (e) => e.kind === 'music:start' && String(e['plan']).startsWith('game:'),
  );
  T.ok(
    'D',
    'Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)',
    Boolean(bingoStart) &&
      ['wallpaper', 'cool-vibes'].includes(String(bingoStart?.['track'])) &&
      bingoStart?.['volume'] === 0.2,
    `music=${evs
      .filter((e) => e.kind.startsWith('music'))
      .map((e) => `${e.kind}:${e['track'] ?? `${e['from']}→${e['to']}`}`)
      .join(' ')}`,
  );
  await settle(1500);
  T.ok(
    'D',
    'exactly one track audible after the switch',
    (await T.playing(tv)).length === 1,
    JSON.stringify(await T.playing(tv)),
  );
  T.ok('D', 'intro: nothing spoken', !evs.some((e) => e.kind === 'speak'), '');
  await api.skip(); // intro → play
  await settle(1800);
  await api.skip();
  await settle(1800);
  await T.mark('D2');
  evs = await T.between(tv, 'D1', 'D2');
  const speaks = evs.filter((e) => e.kind === 'speak');
  T.ok(
    'D',
    'two calls → two boings and two recorded calls',
    T.cues(evs).filter((c) => c === 'call').length === 2 &&
      speaks.length === 2 &&
      speaks.every((s) => String(s['voice']) === 'clip'),
    `cues=${T.cues(evs).join(',')}; spoken=${speaks.map((s) => s['text']).join(' | ')} voice=${speaks[0]?.['voice']}`,
  );
  T.ok(
    'D',
    'the phones stay silent during calls',
    T.cues(await T.between(vip.page, 'D1', 'D2'), 'phone').length === 0 &&
      !(await T.between(vip.page, 'D1', 'D2')).some((e) => e.kind === 'speak'),
    '',
  );
  // wrong claim from p2
  await p2.page.getByRole('button', { name: /^bingo!$/i }).click();
  // The reveal: drop 0.7 s, five turns (220 ms), 0.4 s, the rest 0.9 s, 0.7 s hold, 0.6 s settle.
  await settle(6000);
  await T.mark('D3');
  evs = await T.between(tv, 'D2', 'D3');
  const hushIdx = evs.findIndex((e) => e.kind === 'hush' || e.kind === 'ss:cancel');
  const wrongIdx = evs.findIndex((e) => e.kind === 'cue' && e['cue'] === 'wrong');
  T.ok(
    'D',
    'wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken',
    hushIdx >= 0 &&
      wrongIdx >= 0 &&
      !evs.some((e) => e.kind === 'speak') &&
      !T.cues(evs).some((c) => ['phase', 'error'].includes(c)),
    `events=${evs
      .filter((e) => e.kind !== 'mark')
      .map((e) => (e.kind === 'cue' ? e['cue'] : e.kind))
      .join(',')}`,
  );
  T.ok(
    'D',
    'music keeps playing through the check',
    (await T.playing(tv)).length === 1,
    JSON.stringify(await T.playing(tv)),
  );
  await api.skip(); // check → play
  await settle(1800);
  await T.mark('D4');
  evs = await T.between(tv, 'D3', 'D4');
  T.ok(
    'D',
    'play resumes → the next number is spoken',
    evs.some((e) => e.kind === 'speak'),
    `spoken=${evs
      .filter((e) => e.kind === 'speak')
      .map((e) => e['text'])
      .join(' | ')}`,
  );
  // pause / resume from the VIP phone
  await vip.page.getByRole('button', { name: /vip/i }).click();
  await settle(300);
  await vip.page.getByRole('button', { name: /^pause$/i }).click();
  await settle(1200);
  await T.mark('D5');
  evs = await T.between(tv, 'D4', 'D5');
  T.ok(
    'D',
    'pause → pause cue, music holds, no new call',
    T.cues(evs).includes('pause') &&
      evs.some((e) => e.kind === 'music:paused' && e['paused'] === true) &&
      (await T.playing(tv)).length === 0,
    `cues=${T.cues(evs).join(',')} playing=${JSON.stringify(await T.playing(tv))}`,
  );
  await vip.page.getByRole('button', { name: /^resume$/i }).click();
  await settle(1200);
  await vip.page.getByRole('button', { name: /^close$/i }).click();
  await T.mark('D6');
  evs = await T.between(tv, 'D5', 'D6');
  T.ok(
    'D',
    'resume → phase chime, music resumes',
    T.cues(evs).includes('phase') &&
      evs.some((e) => e.kind === 'music:paused' && e['paused'] === false) &&
      (await T.playing(tv)).length === 1,
    `cues=${T.cues(evs).join(',')} playing=${JSON.stringify(await T.playing(tv))}`,
  );
  // a real bingo from the VIP
  const vipId = (await api.playerId('Sam')) ?? '';
  const { line, card } = await bingoLine(api, vipId);
  for (const k of line) {
    if (k === 12) continue;
    await vip.page
      .getByRole('gridcell', { name: new RegExp(`^${'BINGO'[k % 5]} ${card[k]}$`) })
      .click();
  }
  await settle(300);
  await T.mark('D7');
  await vip.page.getByRole('button', { name: /^bingo!$/i }).click();
  await settle(6000);
  await T.mark('D8');
  evs = await T.between(tv, 'D7', 'D8');
  const cheerAt = evs.find((e) => e.kind === 'cue' && e['cue'] === 'cheer');
  const claimT = evs[0]?.t ?? 0;
  T.ok(
    'D',
    'BINGO → caller hushed, sweep as the line turns, cheer once at the verdict (~4.4 s), no chime on entry, music continues',
    Boolean(cheerAt) &&
      T.cues(evs).filter((c) => c === 'cheer').length === 1 &&
      !T.cues(evs).some((c) => ['phase', 'win', 'fanfare'].includes(c)) &&
      evs.some((e) => e.kind === 'hush' || e.kind === 'ss:cancel') &&
      (await T.playing(tv)).length === 1,
    `cues=${T.cues(evs).join(',')} cheer@+${cheerAt ? cheerAt.t - claimT : '-'}ms playing=${JSON.stringify(await T.playing(tv))}`,
  );
  await settle(1500);
  T.ok(
    'D',
    'celebration waits: still in the bingo phase, nothing spoken',
    (await api.state()).room?.game?.state.phase.id === 'bingo' &&
      !(await T.between(tv, 'D8', null)).some((e) => e.kind === 'speak'),
    '',
  );
  await vip.page.getByRole('button', { name: /keep going — same pattern/i }).click();
  await settle(1800);
  await T.mark('D9');
  evs = await T.between(tv, 'D8', 'D9');
  T.ok(
    'D',
    'keep going → play resumes, next number spoken, no start/phase chime',
    evs.some((e) => e.kind === 'speak') &&
      T.cues(evs).includes('call') &&
      !T.cues(evs).includes('start'),
    `cues=${T.cues(evs).join(',')} spoken=${evs
      .filter((e) => e.kind === 'speak')
      .map((e) => e['text'])
      .join(' | ')}`,
  );
  // the VIP ends the game from the phone menu: results
  await vip.page.getByRole('button', { name: /vip/i }).click();
  await settle(300);
  await vip.page.getByRole('button', { name: /end game/i }).click();
  await settle(200);
  await vip.page.getByRole('button', { name: /end game/i }).click();
  await settle(2000);
  await T.mark('D10');
  evs = await T.between(tv, 'D9', 'D10');
  T.ok(
    'D',
    'VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play',
    T.cues(evs).filter((c) => c === 'cheer').length >= 1 &&
      (await T.playing(tv)).length === 0 &&
      evs
        .filter((e) => e.kind === 'speak')
        .every(
          (e) =>
            e.t < (evs.find((x) => x.kind === 'music:plan' && x['to'] === null)?.t ?? Infinity),
        ),
    `cues=${T.cues(evs).join(',')} playing=${JSON.stringify(await T.playing(tv))}`,
  );
  T.timeline(await T.between(tv, 'C3', 'D10'), 'tv');

  // ── E. Home from results, then Home mid-game ────────────────────────────────────────
  T.section('E · Home (reset) from results and mid-game');
  const home = tv.getByRole('button', { name: /^home$/i });
  await home.click();
  await home.click();
  await settle(2500);
  await T.mark('E1');
  evs = await T.between(tv, 'D10', 'E1');
  T.ok(
    'E',
    'Home → fresh lobby → lobby music again, no cheer, speech cancelled',
    evs.some((e) => e.kind === 'music:plan' && e['to'] === 'lobby') &&
      !T.cues(evs).includes('cheer') &&
      (await T.playing(tv)).length === 1,
    `plan=${evs
      .filter((e) => e.kind === 'music:plan')
      .map((e) => `${e['from']}→${e['to']}`)
      .join(' ')} playing=${JSON.stringify(await T.playing(tv))}`,
  );
  // start a bingo, then Home mid-call
  // Home keeps everyone in the room (end + back to lobby): no rejoin needed.
  await settle(800);
  await api.bots(2, 'idle');
  await api.clock(true);
  await api.start('bingo', 5);
  await settle(400);
  await api.skip();
  await settle(400);
  await T.mark('E2');
  await home.click();
  await home.click();
  await settle(2500);
  await T.mark('E3');
  evs = await T.between(tv, 'E2', 'E3');
  T.ok(
    'E',
    'Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible',
    evs.some((e) => e.kind === 'ss:cancel' || e.kind === 'hush') &&
      evs.some((e) => e.kind === 'music:plan' && e['to'] === 'lobby') &&
      (await T.playing(tv)).length === 1,
    `events=${evs
      .filter((e) => e.kind !== 'mark')
      .map((e) => (e.kind === 'cue' ? e['cue'] : e.kind))
      .join(',')} playing=${JSON.stringify(await T.playing(tv))}`,
  );
  await settle(3000);
  T.ok(
    'E',
    'nothing spoken in the lobby afterwards',
    !(await T.between(tv, 'E3', null)).some((e) => e.kind === 'speak' || e.kind === 'ss:speak'),
    '',
  );
  T.timeline(await T.between(tv, 'D10', 'E3'), 'tv');
}
