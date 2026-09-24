// SPEC §1.16 leaks, speech and bots, checked over whole bot-played games: the word never reaches
// the TV or an imposter's phone before wordReveal; imposter ids never flagged on another phone
// before accuse; the word's reading is never requested early; bots never repeat a clue; the
// 16-player state and views stay inside their budgets.
import { describe, expect, it } from 'vitest';

/** Whole games at 16 players: allow for a loaded machine (other sessions share it). */
const LONG = { timeout: 120_000 };
import { createRng } from '@partybox/game-sdk';
import { game } from '../server/index';
import { wordLine } from '../server/speech';
import { start } from './helpers';
import type { State } from '../server/types';

/** Plays a whole game with bots answering fast; calls `each` on every state. */
function play(
  n: number,
  settings: Record<string, string | number | boolean>,
  seed: number,
  each: (s: State) => void,
): State {
  const rng = createRng(seed);
  let s = start(n, settings, seed);
  let t = s.phase.startedAt;
  for (let i = 0; i < 4000 && s.phase.id !== 'done'; i++) {
    each(s);
    let acted = false;
    for (const id of s.seats) {
      const inp = game.bot.sampleInput(s, id, rng);
      if (!inp) continue;
      t += 50;
      s = game.reduce(s, { type: 'input', now: t, playerId: id, input: inp });
      acted = true;
      each(s);
    }
    if (!acted) {
      t = Math.max(t, s.phase.deadline ?? t) + 1;
      s = game.reduce(s, {
        type: 'timer',
        now: s.phase.deadline ?? t,
        phaseId: s.phase.id,
        startedAt: s.phase.startedAt,
      });
    }
  }
  return s;
}

const EARLY = new Set([
  'intro',
  'deal',
  'clue',
  'clueReveal',
  'talk',
  'vote',
  'voteReveal',
  'runoff',
  'accuse',
  'lastChance',
]);
const SETTINGS: Record<string, string | boolean>[] = [
  {},
  { imposters: '2', talk: false, lastChance: 'typed' },
  { hint: 'none', spicy: true, clueRounds: '3' },
];

describe('secrets across whole games', () => {
  it('the word never reaches the TV or an imposter phone before wordReveal', LONG, () => {
    for (const [i, settings] of SETTINGS.entries()) {
      for (const n of [4, 10, 16]) {
        play(n, settings, 100 + i * 10 + n, (s) => {
          if (!EARLY.has(s.phase.id)) return;
          const word = s.words[s.round.w]?.answer ?? '';
          const tv = game.tvView(s);
          expect(tv.stage.reveal).toBeNull();
          for (const imp of s.round.imposters) {
            const v = game.controllerView(s, imp);
            expect(v.word).toBeNull();
            expect(v.stage.reveal).toBeNull();
          }
          if (s.phase.id !== 'lastChance') {
            const text = JSON.stringify(tv.stage.board);
            const imposterTyped = s.round.clues.some((c) => c.text.includes(word));
            if (!imposterTyped) expect(text.includes(`"${word}"`)).toBe(false);
          }
        });
      }
    }
  });

  it('roles stay off other phones until the card flips', LONG, () => {
    play(10, { imposters: '2' }, 5, (s) => {
      for (const id of s.seats) {
        const v = game.controllerView(s, id);
        const roles = v.stage.accuse?.roles ?? {};
        for (const [target] of Object.entries(roles)) {
          const i = s.round.accused.indexOf(target);
          const flipped =
            s.phase.id !== 'accuse' || i < s.round.spot || (i === s.round.spot && s.round.flipped);
          expect(flipped).toBe(true);
        }
        if (EARLY.has(s.phase.id) && id !== undefined && !s.round.imposters.includes(id))
          expect(v.role === 'imposter').toBe(false);
      }
    });
  });

  it('unrevealed clues and votes stay private', LONG, () => {
    play(6, {}, 9, (s) => {
      if (s.phase.id === 'vote') {
        const tv = JSON.stringify(game.tvView(s));
        expect(tv.includes('"votes"')).toBe(false);
      }
      if (s.phase.id === 'clue') {
        for (const card of game.tvView(s).stage.board) expect(card.now).toBeNull();
      }
    });
  });

  it("the word's reading is never requested before wordReveal", LONG, () => {
    play(6, {}, 21, (s) => {
      const key = wordLine(s)?.req.key;
      const asked = (game.speech?.(s) ?? []).map((r) => r.key);
      if (s.phase.id !== 'wordReveal') expect(asked).not.toContain(key);
    });
  });

  it(
    'speech: at most 10 pending keys, and no view carries a key before its line plays',
    LONG,
    () => {
      play(16, {}, 22, (s) => {
        expect((game.speech?.(s) ?? []).length).toBeLessThanOrEqual(10);
        const say = game.tvView(s).stage.say;
        if (say?.key) expect(s.speechMs[say.key]).toBeGreaterThanOrEqual(0);
      });
    },
  );
});

describe('bots', () => {
  it('never repeat a clue within a game, and never send an illegal crew clue', LONG, () => {
    for (const seed of [1, 2, 3, 4]) {
      const final = play(8, { talk: false, clueRounds: '2', rounds: 5 }, seed, (s) => {
        for (const [id, r] of Object.entries(s.round.rejects))
          expect.soft(r.why, `${id} ${r.why}`).toBe('repeat');
      });
      for (const [, said] of Object.entries(final.said))
        expect(new Set(said).size).toBe(said.length);
    }
  });
});

describe('budgets at 16 players', () => {
  it(
    'state under 32 KB; TV view under 4 KB; phone views under 4 KB (audit: envelope ≈1.5 KB)',
    LONG,
    () => {
      let maxState = 0;
      let maxTv = 0;
      let maxPhone = 0;
      play(16, { clueRounds: '3', talk: false, rounds: 8 }, 77, (s) => {
        maxState = Math.max(maxState, JSON.stringify(s).length);
        maxTv = Math.max(maxTv, JSON.stringify(game.tvView(s)).length);
        for (const id of s.seats)
          maxPhone = Math.max(maxPhone, JSON.stringify(game.controllerView(s, id)).length);
      });
      console.log(`imposter 16p: state ${maxState} B, tv ${maxTv} B, phone ${maxPhone} B`);
      expect(maxState).toBeLessThan(32 * 1024);
      expect(maxTv).toBeLessThan(4096);
      expect(maxPhone).toBeLessThan(4096);
    },
  );
});
