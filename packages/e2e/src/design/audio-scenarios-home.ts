// Section E of the audio trace: Home (reset) from the results and mid-game — the lobby music
// returns, speech is cancelled, one track audible. Split from audio-scenarios-games (loop 263).
import type { Ev } from './audio-tracer';
import type { ScenarioCtx as Ctx } from './audio-tracer';
import { settle } from './session';

export async function runHomeScenarios({ T, tv, api }: Ctx): Promise<void> {
  // ── E. Home from results, then Home mid-game ────────────────────────────────────────
  T.section('E · Home (reset) from results and mid-game');
  const home = tv.getByRole('button', { name: /^home$/i });
  let evs: Ev[];
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
