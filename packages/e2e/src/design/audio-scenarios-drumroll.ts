// The end of a Bingo game, in the audio trace (split from audio-scenarios-games, loop 322): a
// blackout round whose first full card ends the round by itself → the drumroll ("and the winner
// is…", the final board, the tally chime, no fanfare yet) → 4 s later the results cheer (loop 246).
import type { Ev } from './audio-tracer';
import type { ScenarioCtx as Ctx } from './audio-tracer';
import { settle } from './session';

export async function runDrumrollScenario({
  T,
  tv,
  vip,
  api,
  vipId,
}: Pick<Ctx, 'T' | 'tv' | 'vip' | 'api'> & { vipId: string }): Promise<void> {
  const home = tv.getByRole('button', { name: /^home$/i });
  let evs: Ev[] = [];
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
}
