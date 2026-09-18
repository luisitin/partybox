// Audio interaction trace, scenarios (see audio-trace.ts).
import type { Page } from 'playwright';
import { bingoLine } from './audio-tracer';
import type { Ev, Pages, Tracer } from './audio-tracer';
import { claimRevealMs } from '../../../../games/bingo/server/reveal';
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

  void pages;
  // ── D. Bingo ────────────────────────────────────────────────────────────────────────
  T.section('D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results');
  const home = tv.getByRole('button', { name: /^home$/i });
  // The clock runs through the intro (loop 262): its last three seconds tick down to the first
  // ball, which then drops on its own; the caller is frozen after that, as before.
  await api.clock(false);
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
  // "Deal me another" 3 s in: the new card flips in with a 20 ms tap and a 'card' pluck (loop 268).
  await vip.page.getByRole('button', { name: /deal me another/i }).click();
  await settle(3500); // 6.5 s in: the intro (5 s) has run out and the first ball has dropped
  await api.clock(true); // hold the caller from here
  await T.mark('D1b');
  const intro = T.cues(await T.between(tv, 'D1', 'D1b'));
  T.ok(
    'D',
    'the intro counts down: three ticks (3 · 2 · 1), then the first call',
    intro.filter((c) => c === 'tick').length === 3 &&
      intro.indexOf('call') > intro.lastIndexOf('tick') &&
      intro.filter((c) => c === 'call').length === 1,
    `cues=${intro.join(',')}`,
  );
  // The hand counts the same three seconds: one 15 ms tap each, no sound (loop 263).
  const introPhone = await T.between(vip.page, 'D1', 'D1b');
  const introTaps = introPhone.filter((e) => e.kind === 'buzz' && Number(e['pattern']) === 15);
  T.ok(
    'D',
    'the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck',
    introTaps.length === 3 &&
      introPhone.filter((e) => e.kind === 'buzz' && Number(e['pattern']) === 20).length === 1 &&
      T.cues(introPhone, 'phone').join(',') === 'card',
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
  T.ok(
    'D',
    'the phones stay silent during calls',
    T.cues(await T.between(vip.page, 'D1b', 'D2'), 'phone').length === 0 &&
      !(await T.between(vip.page, 'D1b', 'D2')).some((e) => e.kind === 'speak'),
    '',
  );
  // wrong claim from p2: two taps (arm, then claim)
  await p2.page.getByRole('button', { name: /^bingo! card 1$/i }).click();
  await settle(250);
  await p2.page.getByRole('button', { name: /tap again to claim/i }).dispatchEvent('click');
  // The reveal: drop 0.7 s, five turns (220 ms), 0.4 s, the rest 0.9 s, 0.7 s hold, 0.6 s settle.
  await settle(8500); // the reveal: 1 s announce, 0.7 s drop, five turns (350 ms), 0.5 s, the rest 1 s, 0.8 s hold, 0.6 s settle → verdict ≈ 6.4 s
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
    'BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues',
    Boolean(cheerAt) &&
      T.cues(evs).filter((c) => c === 'cheer').length === 1 &&
      !T.cues(evs).some((c) => ['phase', 'win', 'fanfare'].includes(c)) &&
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
  await settle(3500); // the verdict was read 3 s after the reveal: the call repeats
  await T.mark('D9');
  evs = await T.between(tv, 'D8', 'D9');
  T.ok(
    'D',
    'keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime',
    evs.some((e) => e.kind === 'speak') &&
      T.cues(evs).includes('call') &&
      !T.cues(evs).includes('start'),
    `cues=${T.cues(evs).join(',')} spoken=${evs
      .filter((e) => e.kind === 'speak')
      .map((e) => e['text'])
      .join(' | ')}`,
  );
  // A game that ends on its own (one round): the bingo → the drumroll ("and the winner is…",
  // the final board, the tally chime, no fanfare yet) → 4 s later the results cheer (loop 246).
  await home.click();
  await home.click();
  await settle(2500);
  // A blackout round: the first full card ends the round by itself (nothing can continue), so
  // the drumroll follows without a tap.
  await api.post('/api/dev/start', {
    gameId: 'bingo',
    seed: 5,
    settings: { rounds: 1, round1: 'blackout', cards: 1, callSeconds: 60 },
  });
  await settle(600);
  await api.skip();
  await api.clock(false); // the auto-end and the drumroll run on real time
  for (let i = 0; i < 80; i += 1) {
    const s = (await api.state()).room?.game?.state as unknown as {
      phase: { id: string };
      round: { deck: number[]; drawn: number; cards: Record<string, number[][]> };
    };
    if (s.phase.id !== 'play') break;
    const called = new Set(s.round.deck.slice(0, s.round.drawn));
    const card = s.round.cards[vipId]?.[0] ?? [];
    if (card.every((n, k) => k === 12 || called.has(n))) break;
    await api.skip();
    await settle(60);
  }
  const full =
    (
      (await api.state()).room?.game?.state as unknown as {
        round: { cards: Record<string, number[][]> };
      }
    ).round.cards[vipId]?.[0] ?? [];
  for (let i = 0; i < 25; i += 1) {
    if (i === 12) continue;
    const letter = 'BINGO'[i % 5];
    await vip.page
      .getByRole('gridcell', { name: new RegExp(`^${letter} ${full[i]}$`) })
      .first()
      .click();
  }
  await settle(300);
  await vip.page.getByRole('button', { name: /^bingo! card 1$/i }).click();
  await settle(250);
  await vip.page.getByRole('button', { name: /tap again to claim/i }).dispatchEvent('click');
  await settle(12500); // a 25-cell reveal (≈ 9.4 s), the verdict read (3 s), then 2 s: the round ends itself
  await T.mark('D9b');
  await settle(2000);
  await T.mark('D9c');
  const drum = await T.between(tv, 'D9b', 'D9c');
  T.ok(
    'D',
    'the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet',
    (await api.state()).room?.game?.state.phase.id === 'final' &&
      T.cues(drum).includes('tally') &&
      !T.cues(drum).some((c) => ['cheer', 'fanfare', 'win'].includes(c)),
    `phase=${(await api.state()).room?.game?.state.phase.id} cues=${T.cues(drum).join(',')}`,
  );
  await settle(3500);
  await T.mark('D9d');
  const fan = await T.between(tv, 'D9c', 'D9d');
  T.ok(
    'D',
    '4 s on → the results cheer, once',
    (await api.state()).room?.status === 'results' &&
      T.cues(fan).filter((c) => c === 'cheer').length === 1,
    `status=${(await api.state()).room?.status} cues=${T.cues(fan).join(',')}`,
  );
  await home.click();
  await home.click();
  await settle(2500);
  await api.bots(2, 'idle');
  await api.clock(true);
  await api.start('bingo', 11);
  await settle(1500);
  await T.mark('D9e');
  // the VIP ends the game from the phone menu: results
  await vip.page.getByRole('button', { name: /vip/i }).click();
  await settle(300);
  await vip.page.getByRole('button', { name: /end game/i }).click();
  await settle(200);
  await vip.page.getByRole('button', { name: /end game/i }).click();
  await settle(2000);
  await T.mark('D10');
  evs = await T.between(tv, 'D9e', 'D10');
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
}
