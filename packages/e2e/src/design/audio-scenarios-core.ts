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

export async function runCoreScenarios({ T, tv, vip, p2, api, pages }: Ctx): Promise<void> {
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
  // ── A. lobby ────────────────────────────────────────────────────────────────────────
  T.section('A · Lobby: gate, joins, bots, selecting');
  await T.mark('A0');
  await settle(800);
  evs = await T.between(tv, 'A0', null);
  T.ok(
    'A',
    'before the gate tap nothing is audible',
    T.cues(evs).length === 0 && (await T.playing(tv)).length === 0,
    `cues=${T.cues(evs).join(',') || 'none'}, playing=${JSON.stringify(await T.playing(tv))}`,
  );
  await tv.getByRole('button', { name: /tap (to start|anywhere)/i }).click();
  await settle(1200);
  await T.mark('A1');
  evs = await T.between(tv, 'A0', 'A1');
  T.ok(
    'A',
    'gate tap → ready chime + lobby music starts',
    T.cues(evs).includes('ready') &&
      evs.some((e) => e.kind === 'music:start' && e['plan'] === 'lobby'),
    `cues=${T.cues(evs).join(',')}; music=${evs
      .filter((e) => e.kind.startsWith('music'))
      .map((e) => `${e.kind}:${e['track'] ?? e['to']}`)
      .join(' ')}`,
  );
  await joinViaForm(vip, api, { avatarIndex: 1 });
  await joinViaForm(p2, api, { avatarIndex: 4 });
  await settle(600);
  await T.mark('A2');
  evs = await T.between(tv, 'A1', 'A2');
  const joins = evs.filter((e) => e.kind === 'cue' && e['cue'] === 'join');
  T.ok(
    'A',
    'two joins → two join cues, rising',
    joins.length === 2 && Number(joins[1]?.['semitones']) > Number(joins[0]?.['semitones']),
    `semitones=${joins.map((j) => j['semitones']).join(',')}`,
  );
  const bots = await api.bots(2, 'idle');
  await settle(600);
  await vip.page
    .getByRole('button', { name: /remove bot/i })
    .first()
    .click();
  await settle(800);
  await T.mark('A3');
  evs = await T.between(tv, 'A2', 'A3');
  T.ok(
    'A',
    'add 2 bots (one push = one join note) + remove 1 → a join, a leave',
    T.cues(evs).filter((c) => c === 'join').length >= 1 &&
      T.cues(evs).filter((c) => c === 'leave').length === 1,
    `cues=${T.cues(evs).join(',')}`,
  );
  void bots;
  await vip.page.getByRole('button', { name: /pick a game/i }).click();
  await settle(800);
  await T.mark('A4');
  evs = await T.between(tv, 'A3', 'A4');
  T.ok(
    'A',
    'selecting keeps the lobby music (no plan change), a status-swap cue only',
    !evs.some((e) => e.kind === 'music:plan') && (await T.playing(tv)).length === 1,
    `cues=${T.cues(evs).join(',') || 'none'}; playing=${JSON.stringify(await T.playing(tv))}`,
  );
  T.timeline(await T.between(tv, 'A0', 'A4'), 'tv');

  // ── B. Lightning Round ──────────────────────────────────────────────────────────────
  T.section(
    'B · Lightning Round: start, phases, lock-in, last five seconds, final reveal, results',
  );
  await api.clock(true);
  await api.start('lightning-round', 3);
  await settle(1500);
  await T.mark('B1');
  evs = await T.between(tv, 'A4', 'B1');
  T.ok(
    'B',
    'game start → start cue, lobby music fades to none (Lightning has no music)',
    T.cues(evs).includes('start') && evs.some((e) => e.kind === 'music:plan' && e['to'] === null),
    `cues=${T.cues(evs).join(',')}; plan=${evs
      .filter((e) => e.kind === 'music:plan')
      .map((e) => `${e['from']}→${e['to']}`)
      .join(' ')}`,
  );
  await settle(400);
  T.ok(
    'B',
    'no track audible during Lightning',
    (await T.playing(tv)).length === 0,
    JSON.stringify(await T.playing(tv)),
  );
  await api.skip(); // intro → question
  await settle(900);
  await T.mark('B2');
  evs = await T.between(tv, 'B1', 'B2');
  T.ok(
    'B',
    'question phase → the generic phase chime (unmapped)',
    T.cues(evs).filter((c) => c === 'phase').length === 1,
    `cues=${T.cues(evs).join(',')}`,
  );
  // unfreeze first (real time from here); the lock-in's push resyncs the TV's clock offset
  await api.clock(false);
  await settle(300);
  // lock-in from the VIP phone
  await vip.page.getByRole('radio').first().click();
  await settle(900);
  await T.mark('B3');
  evs = await T.between(tv, 'B2', 'B3');
  pev = await T.between(vip.page, 'B2', 'B3');
  T.ok(
    'B',
    'lock-in → TV lock tick; phone submit cue + 20 ms buzz',
    T.cues(evs).includes('lock') &&
      T.cues(pev, 'phone').includes('submit') &&
      pev.some((e) => e.kind === 'buzz'),
    `tv=${T.cues(evs).join(',')}; phone=${T.cues(pev, 'phone').join(',')} buzz=${pev
      .filter((e) => e.kind === 'buzz')
      .map((e) => JSON.stringify(e['pattern']))
      .join(' ')}`,
  );
  T.ok(
    'B',
    'the phone never plays TV cues (phase/start/win/lock/countdown)',
    !T.cues(pev, 'phone').some((c) =>
      ['phase', 'start', 'win', 'lock', 'countdown', 'cheer'].includes(c),
    ),
    `phone cues=${T.cues(pev, 'phone').join(',') || 'none'}`,
  );
  // the last five seconds, in real time: wait until 5.5 s before the deadline
  let st = await api.state();
  const deadline = st.room?.game?.state.phase.deadline ?? 0;
  const untilFive = deadline - st.clock.now - 5500;
  if (untilFive > 0) await settle(untilFive);
  await T.mark('B3b');
  await settle(6200);
  await T.mark('B4');
  evs = await T.between(tv, 'B3b', 'B4');
  pev = await T.between(p2.page, 'B3b', 'B4');
  const ticks = evs.filter((e) => e.kind === 'cue' && e['cue'] === 'countdown');
  T.ok(
    'B',
    'last 5 s → five countdown ticks on the TV, climbing',
    ticks.length === 5 && Number(ticks[4]?.['semitones']) > Number(ticks[0]?.['semitones']),
    `ticks=${ticks.length} semitones=${ticks.map((e) => e['semitones']).join(',')}`,
  );
  const p2buzz = pev.filter((e) => e.kind === 'buzz');
  T.ok(
    'B',
    'an unanswered phone buzzes each second, ticks once at 5 s, buzzes at time-up',
    p2buzz.length >= 6 && T.cues(pev, 'phone').includes('tick'),
    `buzz=${p2buzz.length} phone cues=${T.cues(pev, 'phone').join(',')}`,
  );
  st = await api.state();
  T.ok(
    'B',
    'the deadline fired → reveal phase, reveal cue, and NO phase chime on top',
    st.room?.game?.state.phase.id === 'reveal' &&
      T.cues(evs).includes('reveal') &&
      !T.cues(evs).slice(T.cues(evs).indexOf('reveal')).includes('phase'),
    `phase=${st.room?.game?.state.phase.id} cues=${T.cues(evs).join(',')}`,
  );
  await api.clock(true);
  // run to the wager and the final reveal
  guard = 0;
  while (guard++ < 40) {
    const s = await api.state();
    if (s.room?.status !== 'playing') break;
    if (s.room.game?.state.phase.id === 'wager') break;
    await api.skip();
    await settle(120);
  }
  await settle(700);
  await T.mark('B5');
  evs = await T.between(tv, 'B4', 'B5');
  T.ok(
    'B',
    'wager phase → wager cue (mapped), no phase chime for it',
    T.cues(evs).includes('wager') &&
      T.cues(evs).lastIndexOf('phase') < T.cues(evs).lastIndexOf('wager'),
    `cues=${T.cues(evs).join(',')}`,
  );
  await api.skip(); // wager → final question
  await settle(300);
  await api.skip(); // question → final reveal
  await settle(3500);
  await T.mark('B6');
  evs = await T.between(tv, 'B5', 'B6');
  T.ok(
    'B',
    'final reveal → jackpot or bust cue from the game, no reveal sting on top',
    (T.cues(evs).includes('jackpot') || T.cues(evs).includes('bust')) &&
      !T.cues(evs).includes('reveal'),
    `cues=${T.cues(evs).join(',')}`,
  );
  await api.skip(); // → done → results
  await settle(1500);
  await T.mark('B7');
  evs = await T.between(tv, 'B6', 'B7');
  T.ok(
    'B',
    'results → one cheer (horn + crowd), no synth win, no music',
    T.cues(evs).filter((c) => c === 'cheer').length === 1 &&
      !T.cues(evs).includes('win') &&
      (await T.playing(tv)).length === 0,
    `cues=${T.cues(evs).join(',')}; playing=${JSON.stringify(await T.playing(tv))}`,
  );
  pev = await T.between(vip.page, 'B6', 'B7');
  T.ok(
    'B',
    'results on the phones → a buzz only (no cue)',
    pev.some((e) => e.kind === 'buzz') && T.cues(pev, 'phone').length === 0,
    `phone cues=${T.cues(pev, 'phone').join(',') || 'none'} buzz=${pev
      .filter((e) => e.kind === 'buzz')
      .map((e) => JSON.stringify(e['pattern']))
      .join(' ')}`,
  );
  T.timeline(await T.between(tv, 'A4', 'B7'), 'tv');

  // ── C. play again / end / new game / back to lobby ─────────────────────────────────
  T.section('C · Play again, end game, new game, back to lobby');
  await vip.page.getByRole('button', { name: /^play again$/i }).click();
  await settle(1500);
  await T.mark('C1');
  evs = await T.between(tv, 'B7', 'C1');
  T.ok(
    'C',
    'play again → start cue, still no music, no second cheer',
    T.cues(evs).includes('start') &&
      !T.cues(evs).includes('cheer') &&
      !evs.some((e) => e.kind === 'music:start'),
    `cues=${T.cues(evs).join(',')}`,
  );
  await vip.page.getByRole('button', { name: /vip/i }).click();
  await settle(300);
  await vip.page.getByRole('button', { name: /end game/i }).click();
  await settle(200);
  await vip.page.getByRole('button', { name: /end game/i }).click();
  await settle(1500);
  await T.mark('C2');
  evs = await T.between(tv, 'C1', 'C2');
  T.ok(
    'C',
    'VIP ends the game → results → one cheer',
    T.cues(evs).filter((c) => c === 'cheer').length === 1,
    `cues=${T.cues(evs).join(',')}`,
  );
  await vip.page.getByRole('button', { name: /^new game$/i }).click();
  await settle(1500);
  await T.mark('C3');
  evs = await T.between(tv, 'C2', 'C3');
  T.ok(
    'C',
    'new game → selecting → lobby music comes back (plan null→lobby)',
    evs.some((e) => e.kind === 'music:plan' && e['to'] === 'lobby') &&
      (await T.playing(tv)).length === 1,
    `plan=${evs
      .filter((e) => e.kind === 'music:plan')
      .map((e) => `${e['from']}→${e['to']}`)
      .join(' ')}; playing=${JSON.stringify(await T.playing(tv))}`,
  );
  T.timeline(await T.between(tv, 'B7', 'C3'), 'tv');
}
