// Phase order, exits (deadline / all done / VIP skip), pause, drops, idle rooms (SPEC §4.3, §4.15).
import { describe, expect, it } from 'vitest';
import { DONE_GRACE_MS, LAND_MS, SCORES_MS } from '../server/types';
import { answer, guess, input, player, start, timer, tv, until, vip, written } from './helpers';

const FOUR = { ana: 'avocado', ben: 'bacon', cy: 'sushi', dee: 'tacos' };

describe('phase order', () => {
  it('prompt → write → guess all but the last card → reveal every card → scores → next prompt', () => {
    let s = start({ settings: { prompts: '2' } });
    expect(s.phase.id).toBe('prompt');
    s = timer(s);
    expect(s.phase.id).toBe('write');
    for (const [id, text] of Object.entries(FOUR)) s = answer(s, id, text);
    s = timer(s); // the grace after everyone answered
    expect(s.phase.id).toBe('guess');
    expect(s.p.cards).toHaveLength(4);
    const seen: string[] = [];
    for (let i = 0; i < 3; i += 1) {
      expect(s.phase.id).toBe('guess');
      seen.push(s.p.cards[s.p.idx]?.text ?? '');
      s = timer(s);
    }
    expect(s.phase.id).toBe('reveal');
    expect(s.p.idx).toBe(0);
    expect(s.p.guessesByCard).toHaveLength(4);
    for (let i = 0; i < 4; i += 1) {
      expect(s.phase.id).toBe('reveal');
      expect(s.p.step).toBe('land');
      expect(s.phase.deadline).toBe(s.phase.startedAt + LAND_MS);
      s = timer(s);
      expect(s.phase.id).toBe('reveal');
      expect(s.p.step).toBe('shown');
      s = timer(s);
    }
    expect(new Set(seen).size).toBe(3);
    expect(s.phase.id).toBe('scores');
    expect(s.phase.deadline).toBe(s.phase.startedAt + SCORES_MS);
    s = timer(s);
    expect(s.phase.id).toBe('prompt');
    expect(s.p.n).toBe(1);
    s = until(s, 'scores');
    s = timer(s);
    expect(s.phase.id).toBe('done');
    expect(s.phase.deadline).toBeNull();
  });

  it('plays the prompt count the room size gives (auto), clamped to 40 cards', () => {
    expect(start({ players: 4 }).cfg.prompts).toBe(4);
    expect(start({ players: 8 }).cfg.prompts).toBe(3);
    expect(start({ players: 12 }).cfg.prompts).toBe(2);
    expect(start({ players: 16, settings: { prompts: '4' } }).cfg.prompts).toBe(2);
    expect(start({ players: 11, settings: { prompts: '4' } }).cfg.prompts).toBe(3);
    expect(start({ players: 3, settings: { prompts: '1' } }).cfg.prompts).toBe(1);
  });

  it('card order is a seeded shuffle, not submission order', () => {
    const orders = new Set<string>();
    for (let seed = 1; seed <= 12; seed += 1) {
      let s = written(start({ seed }), FOUR);
      s = timer(s);
      orders.add(s.p.cards.map((c) => c.authors[0]).join(','));
    }
    expect(orders.size).toBeGreaterThan(1);
  });

  it('saves each card’s picks without revealing an author until the whole question is guessed', () => {
    let s = until(written(start({ players: 3, settings: { prompts: '1' } }), FOUR), 'guess');
    const saved: { text: string; guesser: string; author: string }[] = [];
    while (s.phase.id === 'guess') {
      const card = s.p.cards[s.p.idx];
      const author = card?.authors[0] as string;
      const guesser = s.seats.find((id) => id !== author) as string;
      saved.push({ text: card?.text ?? '', guesser, author });
      s = timer(guess(s, guesser, author));
      expect(s.log).toHaveLength(0);
      expect(Object.values(s.scores)).toEqual([0, 0, 0]);
      expect(tv(s).reveal?.authors ?? []).toEqual([]);
    }
    expect(saved).toHaveLength(2);
    expect(s.p.guessesByCard).toHaveLength(3);
    for (const [i, pick] of saved.entries()) {
      expect(s.p.idx).toBe(i);
      expect(s.p.guesses[pick.guesser]).toBe(pick.author);
      s = timer(s);
      expect(s.p.cards[s.p.idx]?.text).toBe(pick.text);
      expect(s.p.points[pick.guesser]).toBe(2);
      s = timer(s);
    }
    expect(s.phase.id).toBe('reveal');
    expect(s.p.guesses).toEqual({});
    const beforeLast = { ...s.scores };
    s = timer(s);
    expect(s.scores).toEqual(beforeLast);
    s = timer(s);
    expect(s.phase.id).toBe('scores');
  });

  it.each(Array.from({ length: 14 }, (_, i) => i + 3))(
    'skips guessing the final answer in a %i-player room',
    (players) => {
      const initial = start({ players, settings: { prompts: '1' } });
      const answers = Object.fromEntries(initial.seats.map((id, i) => [id, `answer ${i}`]));
      let s = until(written(initial, answers), 'guess');
      expect(s.p.cards).toHaveLength(players);
      for (let i = 0; i < players - 1; i += 1) {
        expect(s.phase.id).toBe('guess');
        expect(s.p.idx).toBe(i);
        expect(s.p.cards[s.p.idx]).toBeDefined();
        expect(tv(s).card?.count).toBe(players - 1);
        const author = s.p.cards[s.p.idx]?.authors[0] as string;
        for (const id of s.p.seated.filter((seat) => seat !== author)) s = guess(s, id, author);
        s = timer(s);
      }
      expect(s.phase.id).toBe('reveal');
      expect(s.p.idx).toBe(0);
      for (let i = 0; i < players; i += 1) {
        expect(s.phase.id).toBe('reveal');
        expect(s.p.idx).toBe(i);
        if (i === players - 1) {
          expect(s.p.guesses).toEqual({});
          expect(tv(s).card?.count).toBe(players);
          const before = { ...s.scores };
          s = timer(s);
          expect(s.scores).toEqual(before);
        } else {
          expect(Object.keys(s.p.guesses)).toHaveLength(players - 1);
          s = timer(s);
          expect(s.p.step).toBe('shown');
        }
        s = timer(s);
      }
      expect(s.phase.id).toBe('scores');
    },
  );

  it('reveals a single merged card directly without a guess or score', () => {
    let s = written(start({ players: 4, settings: { prompts: '1' } }), {
      ana: 'same answer',
      ben: 'same answer',
      cy: 'same answer',
      dee: 'same answer',
    });
    s = until(s, 'reveal');
    expect(s.p.cards).toHaveLength(1);
    expect(s.p.cards[0]?.authors).toHaveLength(4);
    expect(s.p.guessesByCard).toEqual([{}]);
    expect(s.p.guesses).toEqual({});
    const before = { ...s.scores };
    s = timer(s);
    expect(s.p.step).toBe('shown');
    expect(s.scores).toEqual(before);
  });

  it('keeps the last submitted card guessable when someone did not answer', () => {
    let s = until(
      written(start({ players: 4, settings: { prompts: '1' } }), {
        ana: 'first answer',
        ben: 'second answer',
        cy: 'third answer',
      }),
      'guess',
    );
    expect(s.p.cards).toHaveLength(3);
    for (let i = 0; i < 3; i += 1) {
      expect(s.phase.id).toBe('guess');
      expect(tv(s).card?.count).toBe(3);
      const author = s.p.cards[s.p.idx]?.authors[0] as string;
      for (const id of s.p.seated.filter((seat) => seat !== author)) s = guess(s, id, author);
      s = timer(s);
    }
    expect(s.phase.id).toBe('reveal');
    expect(s.p.guessesByCard).toHaveLength(3);
    expect(Object.keys(s.p.guessesByCard[2] ?? {})).toHaveLength(3);
  });
});

describe('exits', () => {
  it('write closes a short grace after the last connected player answers', () => {
    let s = until(start(), 'write');
    for (const [id, text] of Object.entries(FOUR)) s = answer(s, id, text);
    expect(s.phase.id).toBe('write');
    expect(s.phase.deadline).toBe(s.phase.startedAt + 500 + DONE_GRACE_MS);
  });

  it('a resent answer replaces the first until write ends; guesses too', () => {
    let s = written(start(), FOUR);
    s = answer(s, 'ana', '  avocado   toast  ');
    expect(s.p.answers['ana']).toBe('avocado toast');
    s = until(s, 'guess');
    s = guess(s, 'ben', 'cy');
    s = guess(s, 'ben', 'dee');
    expect(s.p.guesses['ben']).toBe('dee');
  });

  it('guess closes after every non-author connected player tapped', () => {
    let s = until(written(start(), FOUR), 'guess');
    const author = s.p.cards[s.p.idx]?.authors[0] as string;
    for (const id of s.p.seated.filter((seat) => seat !== author)) s = guess(s, id, author);
    expect(s.phase.deadline).toBe(s.phase.startedAt + 500 + DONE_GRACE_MS);
  });

  it('a VIP skip leaves every phase the way its deadline does', () => {
    let s = start({ settings: { prompts: '1' } });
    const path: string[] = [s.phase.id];
    for (let i = 0; i < 40 && s.phase.id !== 'done'; i += 1) {
      if (s.phase.id === 'write') s = answer(answer(s, 'ana', 'one'), 'ben', 'two');
      s = vip(s, 'skip');
      path.push(`${s.phase.id}${s.phase.id === 'reveal' ? `:${s.p.step}` : ''}`);
    }
    expect(path).toEqual(['prompt', 'write', 'guess', 'guess', 'reveal:land', 'reveal:shown', 'reveal:land', 'reveal:shown', 'scores', 'done']); // prettier-ignore
    // A skip in the landing flips the card (scored once, the author shown); the next moves on.
    expect(s.log).toHaveLength(2);
  });

  it('VIP end jumps to done with results', () => {
    const s = vip(until(start(), 'write'), 'end');
    expect(s.phase.id).toBe('done');
  });
});

describe('pause', () => {
  it('pausing mid-reveal freezes it; resume continues from the same beat', () => {
    let s = until(written(start(), FOUR), 'reveal');
    const left = (s.phase.deadline ?? 0) - (s.phase.startedAt + 1000);
    s = vip(s, 'pause', s.phase.startedAt + 1000);
    s = timer(s); // a stale-deadline timer while paused is ignored
    expect(s.p.step).toBe('land');
    s = vip(s, 'resume', s.phase.startedAt + 61_000);
    expect(s.phase.deadline).toBe(s.phase.startedAt + 61_000 + left);
    expect(s.p.step).toBe('land');
  });
});

describe('edge cases', () => {
  it('nobody answers: straight to the scores ("Nobody answered!"), then the next prompt', () => {
    let s = timer(until(start(), 'write'));
    expect(s.phase.id).toBe('scores');
    expect(s.p.cards).toHaveLength(0);
    s = timer(s);
    expect(s.phase.id).toBe('prompt');
  });

  it('a player who does not answer gets no card but stays a candidate', () => {
    let s = until(written(start(), { ana: 'avocado', ben: 'bacon' }), 'guess');
    expect(s.p.cards).toHaveLength(2);
    s = guess(s, 'ana', 'dee');
    expect(s.p.guesses['ana']).toBe('dee');
  });

  it('ignores guesses naming yourself, an unknown id, or someone not seated', () => {
    let s = until(written(start(), FOUR), 'guess');
    for (const target of ['ana', 'zed', '__proto__', '']) s = guess(s, 'ana', target);
    expect(s.p.guesses).toEqual({});
    s = guess(s, 'zed', 'ana');
    s = input(s, 'ana', { type: 'answer', text: 'late' });
    expect(s.p.guesses).toEqual({});
  });

  it('whitespace-only answers are not answers; a second idea is ignored', () => {
    let s = until(start(), 'write');
    s = answer(s, 'ana', '    ');
    expect(s.p.answers['ana']).toBeUndefined();
    s = input(s, 'ana', { type: 'idea' });
    const once = s;
    expect(input(s, 'ana', { type: 'idea' })).toBe(once);
  });

  it('keeps the first 60 characters of an answer', () => {
    const s = answer(until(start(), 'write'), 'ana', 'x'.repeat(100));
    expect(s.p.answers['ana']).toHaveLength(60);
  });

  it('a drop mid-write closes the phase when everyone left has answered', () => {
    let s = until(start(), 'write');
    for (const id of ['ana', 'ben', 'cy']) s = answer(s, id, `${id} says`);
    s = player(s, 'dee', false);
    expect(s.phase.deadline).toBeLessThan(s.phase.startedAt + 60_000);
  });

  it('an author who leaves before their card: the card still plays and names them', () => {
    let s = until(written(start(), FOUR), 'guess');
    s = player(s, 'dee', false, 'left');
    s = until(s, 'scores');
    expect(s.log.map((c) => c.authors[0])).toContain('dee');
    expect(s.left).toEqual(['dee']);
    s = timer(s);
    expect(s.p.seated).not.toContain('dee');
  });

  it('one connected player: the game still runs to done', () => {
    let s = start({ players: 3 });
    s = player(player(s, 'ben', false), 'cy', false);
    s = written(s, { ana: 'solo' });
    s = until(s, 'done');
    expect(s.phase.id).toBe('done');
  });

  it('everyone idle: the game runs out on deadlines within 3 × 10 minutes', () => {
    let s = start({ players: 16, settings: { prompts: '4' } });
    s = until(s, 'done');
    expect(s.phase.startedAt - 1_700_000_000_000).toBeLessThan(30 * 60_000);
  });
});
