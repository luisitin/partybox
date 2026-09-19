// Audio interaction trace, scenarios (see audio-trace.ts).
import type { Page } from 'playwright';
import { bingoLine } from './audio-tracer';
import type { Ev, ScenarioCtx } from './audio-tracer';
import { claimRevealMs } from '../../../../games/bingo/server/reveal';
import { runDrumrollScenario } from './audio-scenarios-drumroll';
import { joinViaForm, settle } from './session';

export type Ctx = ScenarioCtx;

export async function runGameScenarios({ T, tv, vip, p2, api, pages }: Ctx): Promise<void> {
  // (`home` lives in the drumroll scenario now, loop 322.)
  let evs: Ev[] = [];
  const pev: Ev[] = [];
  const guard = 0;
  void guard;
  void evs;
  void pev;
  void bingoLine;
  void joinViaForm;

  void pages;
  // ── D. Bingo ────────────────────────────────────────────────────────────────────────
  T.section('D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results');
  // The clock runs through the intro (loop 262): its last three seconds tick down to the first
  // ball, which then drops on its own; the caller is frozen after that, as before.
  await api.clock(false);
  // The harness phones stay at the card-pick step (no auto-ready): Sam swaps a card and taps
  // Ready by hand 3 s in, P2 through the dev API — everyone ready at ~3.2 s → the first number
  // at the 5 s floor (loop 344).
  await api.post('/api/dev/start', { gameId: 'bingo', seed: 11, readyUp: false });
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
  // "Another" 3 s in: the new card flips in with a 20 ms tap and a 'card' pluck (loop 268); then
  // Ready — a 'submit' cue and a 20 ms tap of its own (loop 344). P2 readies through the dev
  // API a moment later; the ring starts a breath after that (loop 349).
  await vip.page.getByRole('button', { name: /^🎲 another/i }).click();
  await settle(200);
  await vip.page.getByRole('button', { name: /^ready$/i }).dispatchEvent('click'); // it breathes when last (never "stable");
  await settle(250);
  await api.readyAll();
  await settle(3900); // ~7 s in: the last Ready (3.4 s) + a breath + the 3 · 2 · 1 → the first ball
  await api.clock(true); // hold the caller from here
  await T.mark('D1b');
  // From the start (the deal's pluck lands 0.6 s in, before D1) to the first call. No phase chime
  // anywhere in it: the shell's chime used to land under the first number's voice (loop 332).
  const intro = T.cues(await T.between(tv, 'C3', 'D1b'));
  T.ok(
    'D',
    'the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call — no phase chime',
    intro.filter((c) => c === 'card').length === 1 &&
      intro.indexOf('card') < intro.indexOf('tick') &&
      intro.indexOf('card') > intro.indexOf('start') &&
      intro.filter((c) => c === 'tick').length === 3 &&
      intro.indexOf('call') > intro.lastIndexOf('tick') &&
      intro.filter((c) => c === 'call').length === 1 &&
      !intro.includes('phase'),
    `cues=${intro.join(',')}`,
  );
  // Ready-ups tick (the shell's lock tick, rising with the count); the ring's first tick waits a
  // breath after the last one (loop 349: they were 30 ms apart).
  const introEvs = await T.between(tv, 'C3', 'D1b');
  const locks = introEvs.filter((e) => e.kind === 'cue' && e['cue'] === 'lock');
  const firstTick = introEvs.find((e) => e.kind === 'cue' && e['cue'] === 'tick');
  const lastLock = locks.at(-1);
  T.ok(
    'D',
    "each Ready ticks (lock, rising); the 3 · 2 · 1's first tick comes a breath (≥ 300 ms) after the last",
    locks.length >= 1 &&
      Boolean(firstTick && lastLock) &&
      (firstTick?.t ?? 0) - (lastLock?.t ?? 0) >= 300,
    `locks=${locks.length} last lock→first tick=${firstTick && lastLock ? firstTick.t - lastLock.t : '-'}ms`,
  );
  // The deal's pluck lands on the same beat on the TV and in the hand (loop 278): offsets from
  // each page's own C3 mark, within 150 ms.
  const markAt = async (page: Page, label: string): Promise<number> =>
    (await T.trace(page)).filter((e) => e.kind === 'mark' && e['label'] === label).at(-1)?.t ?? 0;
  const tvCard = (await T.between(tv, 'C3', 'D1')).find(
    (e) => e.kind === 'cue' && e['cue'] === 'card',
  );
  const phoneCard = (await T.between(vip.page, 'C3', 'D1')).find(
    (e) => e.kind === 'cue' && e['cue'] === 'card',
  );
  const tvCardAt = tvCard ? tvCard.t - (await markAt(tv, 'C3')) : null;
  const phoneCardAt = phoneCard ? phoneCard.t - (await markAt(vip.page, 'C3')) : null;
  T.ok(
    'D',
    "the deal's pluck: TV and phone within 150 ms of each other",
    tvCardAt !== null && phoneCardAt !== null && Math.abs(tvCardAt - phoneCardAt) < 150,
    `tv@+${tvCardAt}ms phone@+${phoneCardAt}ms`,
  );
  // The hand counts the same three seconds: one 15 ms tap each, no sound (loop 263).
  const introPhone = await T.between(vip.page, 'D1', 'D1b');
  const introTaps = introPhone.filter((e) => e.kind === 'buzz' && Number(e['pattern']) === 15);
  T.ok(
    'D',
    'the phone taps 3 · 2 · 1 with the TV; "another" is a 20 ms tap and one card pluck; Ready a 20 ms tap and the submit cue',
    introTaps.length === 3 &&
      introPhone.filter((e) => e.kind === 'buzz' && Number(e['pattern']) === 20).length === 2 &&
      T.cues(introPhone, 'phone').join(',') === 'card,submit', // the deal's own pluck lands before D1
    `taps=${introTaps.length} cues=${T.cues(introPhone, 'phone').join(',')}`,
  );
  await api.skip();
  await settle(1800);
  await api.skip();
  await settle(1800);
  await T.mark('D2');
  evs = await T.between(tv, 'D1b', 'D2');
  const speaks = evs.filter((e) => e.kind === 'speak');
  T.ok(
    'D',
    'two calls → two boings and two recorded calls',
    T.cues(evs).filter((c) => c === 'call').length === 2 &&
      speaks.length === 2 &&
      speaks.every((s) => String(s['voice']) === 'clip'),
    `cues=${T.cues(evs).join(',')}; spoken=${speaks.map((s) => s['text']).join(' | ')} voice=${speaks[0]?.['voice']}`,
  );
  // The voice on the ball's frame (loop 335, the owner twice): the clip is scheduled with no
  // delay on the push; the boing waits for the squash, 190 ms later.
  const boings = evs.filter((e) => e.kind === 'cue' && e['cue'] === 'call');
  const lags = boings.map((b, i) => b.t - (speaks[i]?.t ?? b.t));
  T.ok(
    'D',
    'each voice starts on the push (no delay); its boing lands on the squash, 170–230 ms later',
    speaks.every((s) => Number(s['delayMs']) === 0) &&
      lags.length === 2 &&
      lags.every((l) => l >= 170 && l <= 230),
    `delays=${speaks.map((s) => s['delayMs']).join(',')} boing lags=${lags.join(',')}ms`,
  );
  T.ok(
    'D',
    'the phones stay silent during calls',
    T.cues(await T.between(vip.page, 'D1b', 'D2'), 'phone').length === 0 &&
      !(await T.between(vip.page, 'D1b', 'D2')).some((e) => e.kind === 'speak'),
    '',
  );
  // wrong claim from p2: two taps (arm, then claim). Real time from here (loop 283): the card has
  // no daubs, so an extra call cannot make it right, and the whole way back — verdict, read,
  // 3 · 2 · 1, the next number — runs as it does in a room.
  await api.clock(false);
  await p2.page.getByRole('button', { name: /^bingo! card 1$/i }).click();
  await settle(250);
  await p2.page.getByRole('button', { name: /tap again to claim/i }).dispatchEvent('click');
  // The reveal: drop 0.7 s, five turns (220 ms), 0.4 s, the rest 0.9 s, 0.7 s hold, 0.6 s settle.
  await settle(7500); // the reveal: 1 s announce, 0.7 s drop, five turns (350 ms), 0.5 s, 0.8 s hold, 0.6 s settle → verdict at 5.35 s (no rests on an empty card); the read ends at 8.35 s
  await T.mark('D3');
  evs = await T.between(tv, 'D2', 'D3');
  const hushIdx = evs.findIndex((e) => e.kind === 'hush' || e.kind === 'ss:cancel');
  const wrongIdx = evs.findIndex((e) => e.kind === 'cue' && e['cue'] === 'wrong');
  const dibsIdx = evs.findIndex((e) => e.kind === 'cue' && e['cue'] === 'dibs');
  T.ok(
    'D',
    'the first tap → the TV says "hm?" (dibs) once, before the verdict',
    dibsIdx >= 0 && dibsIdx < wrongIdx && T.cues(evs).filter((c) => c === 'dibs').length === 1,
    `cues=${T.cues(evs).join(',')}`,
  );
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
  // The way back from a wrong claim (loop 282): the verdict tick, the 3 s read, then a 3 · 2 · 1
  // whose tick calls the next number.
  await settle(5200); // the read ends at ≈ 8.4 s, the ring runs to ≈ 11.4 s, the next number drops
  await T.mark('D4');
  await api.clock(true); // hold the caller again for what follows
  evs = await T.between(tv, 'D3', 'D4');
  const back = T.cues(evs);
  T.ok(
    'D',
    'after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)',
    evs.some((e) => e.kind === 'speak') &&
      back.filter((c) => c === 'tick').length === 3 &&
      back.indexOf('call') > back.lastIndexOf('tick'),
    `cues=${back.join(',')} spoken=${evs
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
  // The way to the line skipped through dozens of numbers in a few seconds: one voice at a time —
  // every clip after the first came with a hush before it, never two calls talking (loop 333).
  const skipped = await T.between(tv, 'D6', null);
  const clipsN = skipped.filter((e) => e.kind === 'clip').length;
  const hushN = skipped.filter((e) => e.kind === 'hush').length;
  T.ok(
    'D',
    'skipping through the deck: a hush before every call, one voice at a time',
    clipsN > 5 && hushN >= clipsN,
    `clips=${clipsN} hushes=${hushN}`,
  );
  await vip.page.getByRole('button', { name: /^bingo! card 1$/i }).click();
  await settle(250);
  await T.mark('D7');
  await vip.page.getByRole('button', { name: /tap again to claim/i }).dispatchEvent('click');
  // The reveal: 1 s announce, 0.7 s drop, five turns (350 ms), 0.5 s, the rest 1 s (only with
  // daubs outside the line), 0.8 s hold, 0.6 s settle → verdict at 5.35 or 6.35 s. The phones'
  // verdict is the server's tick (loop 258): on this frozen clock, step to it at the real moment
  // the TV gets there — the length is this claim's own (reveal.ts), read from the state.
  const claimed = (await api.state()).room?.game?.state as unknown as {
    round: { claim: { cells: number[]; daubs: number[] } | null };
  };
  const c = claimed.round.claim;
  const revealMs = c ? claimRevealMs(c.cells, c.daubs) : 6350;
  await settle(revealMs);
  await api.advance(revealMs);
  await settle(8500 - revealMs);
  await T.mark('D8');
  evs = await T.between(tv, 'D7', 'D8');
  const cheerAt = evs.find((e) => e.kind === 'cue' && e['cue'] === 'cheer');
  const claimT = evs[0]?.t ?? 0;
  T.ok(
    'D',
    'BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues',
    Boolean(cheerAt) &&
      T.cues(evs).filter((c) => c === 'cheer').length === 1 &&
      !T.cues(evs).some((c) => ['phase', 'win', 'fanfare', 'lock'].includes(c)) &&
      evs.some((e) => e.kind === 'hush' || e.kind === 'ss:cancel') &&
      (await T.playing(tv)).length === 1,
    `cues=${T.cues(evs).join(',')} cheer@+${cheerAt ? cheerAt.t - claimT : '-'}ms playing=${JSON.stringify(await T.playing(tv))}`,
  );
  await settle(1500);
  const phoneCues = await T.between(vip.page, 'D6', null);
  T.ok(
    'D',
    "the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands",
    (() => {
      const c = T.cues(phoneCues, 'phone');
      return (
        c.includes('daub') &&
        c.indexOf('claim') > c.lastIndexOf('daub') &&
        c.indexOf('correct') > c.indexOf('claim')
      );
    })(),
    `phone cues=${T.cues(phoneCues, 'phone').join(',')}`,
  );
  // The celebration buzz is the last one the winner's phone runs at the verdict: the shell's
  // 20 ms "locked in" tick used to replace it on the same tick (loop 334).
  const winBuzzes = phoneCues.filter((e) => e.kind === 'buzz' || e.kind === 'buzz:dropped');
  const celebrationAt = winBuzzes.findIndex(
    (e) => e.kind === 'buzz' && JSON.stringify(e['pattern']) === '[40,60,40,60,120]',
  );
  const cutBy = winBuzzes
    .slice(celebrationAt + 1)
    .filter((e) => e.kind === 'buzz' && e.t - winBuzzes[celebrationAt]!.t < 320);
  T.ok(
    'D',
    "the winner's celebration buzz (320 ms) runs whole — nothing shorter cuts it",
    celebrationAt >= 0 && cutBy.length === 0,
    `celebration@${celebrationAt >= 0 ? winBuzzes[celebrationAt]!.t : '-'} cut by=${JSON.stringify(cutBy.map((e) => e['pattern']))}`,
  );
  // Every other phone feels the win land: one 30 ms tap on the TV's cheer beat (loop 260).
  // Offsets from each page's own D7 mark (`between` drops the mark; clocks are per page).
  const markT = async (page: Page): Promise<number> =>
    (await T.trace(page)).filter((e) => e.kind === 'mark' && e['label'] === 'D7').at(-1)?.t ?? 0;
  const p2Evs = await T.between(p2.page, 'D7', 'D8');
  const p2Mark = await markT(p2.page);
  const tvMark = await markT(tv);
  const taps = p2Evs.filter((e) => e.kind === 'buzz');
  const tapAt = taps[0] ? taps[0].t - p2Mark : null;
  const cheerAtMs = cheerAt ? cheerAt.t - tvMark : null;
  T.ok(
    'D',
    "the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound",
    taps.length === 1 &&
      Number(taps[0]?.['pattern']) === 30 &&
      tapAt !== null &&
      cheerAtMs !== null &&
      Math.abs(tapAt - cheerAtMs) < 400 &&
      T.cues(p2Evs, 'phone').length === 0,
    `taps=${taps.map((e) => JSON.stringify(e['pattern'])).join(',')} tap@+${tapAt}ms cheer@+${cheerAtMs}ms cues=${T.cues(p2Evs, 'phone').join(',')}`,
  );
  T.ok(
    'D',
    'celebration waits: still in the bingo phase, nothing spoken',
    (await api.state()).room?.game?.state.phase.id === 'bingo' &&
      !(await T.between(tv, 'D8', null)).some((e) => e.kind === 'speak'),
    '',
  );
  // Two players, one card each: Sam's only card won, so the room may only go for a blackout. The
  // clock is frozen here (the reveal never "ends" on its own), so the choice is held: unfreeze
  // the clock past the reading time and the held choice lands on the phase deadline.
  await vip.page.getByRole('button', { name: /keep going — blackout/i }).click();
  await settle(300);
  await api.clock(false);
  await settle(5200); // the held choice lands, a 3 s countdown ticks on every screen, the call repeats (loop 276)
  await T.mark('D9');
  evs = await T.between(tv, 'D8', 'D9');
  T.ok(
    'D',
    'keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime',
    evs.some((e) => e.kind === 'speak') &&
      T.cues(evs).filter((c) => c === 'tick').length === 3 &&
      T.cues(evs).indexOf('call') > T.cues(evs).lastIndexOf('tick') &&
      !T.cues(evs).includes('start'),
    `cues=${T.cues(evs).join(',')} spoken=${evs
      .filter((e) => e.kind === 'speak')
      .map((e) => e['text'])
      .join(' | ')}`,
  );
  // The phones run the same 3 · 2 · 1 (ticks) and feel the repeated call after it (loop 276).
  const resumePhone = await T.between(vip.page, 'D8', 'D9');
  // The pick itself sounds in the hand that made it (loop 322): a 'submit' cue and a 20 ms buzz.
  const pickIdx = resumePhone.findIndex((e) => e.kind === 'cue' && e['cue'] === 'submit');
  T.ok(
    'D',
    "the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks",
    pickIdx >= 0 &&
      resumePhone.some((e) => e.kind === 'buzz' && Number(e['pattern']) === 20) &&
      pickIdx < resumePhone.findIndex((e) => e.kind === 'cue' && e['cue'] === 'tick'),
    `cues=${T.cues(resumePhone, 'phone').join(',')}`,
  );
  const phoneTicks = T.cues(resumePhone, 'phone').filter((c) => c === 'tick').length;
  const lastTick = resumePhone
    .map((e) => e.kind === 'cue' && e['cue'] === 'tick')
    .lastIndexOf(true);
  const callBuzz = resumePhone.findIndex((e) => e.kind === 'buzz' && Number(e['pattern']) === 12);
  T.ok(
    'D',
    'the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)',
    phoneTicks === 3 && callBuzz > lastTick,
    `ticks=${phoneTicks} buzzIdx=${callBuzz} lastTickIdx=${lastTick}`,
  );
  await runDrumrollScenario({ T, tv, vip, api, vipId });
  T.timeline(await T.between(tv, 'C3', 'D10'), 'tv');
}
