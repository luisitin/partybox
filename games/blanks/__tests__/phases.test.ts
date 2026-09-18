// Phase rules pinned from README "Phases", "Inputs", "Scoring" and "Edge cases": play validation,
// walkover, ties, the judge (czar) mode, Rando, disconnects, VIP skip / end, hidden information.
import { describe, expect, it } from 'vitest';
import { blackCard } from '../server/content';
import { allIn } from '../server/phases/answer';
import { ALL_IN_MS, RANDO } from '../server/types';
import {
  connect,
  cv,
  next,
  play,
  playAll,
  playRound,
  readAll,
  start,
  timer,
  toAnswer,
  topCards,
  tv,
  vip,
  vote,
  voteAll,
} from './helpers';

describe('answer', () => {
  it('accepts exactly pick distinct cards from the hand, once, and removes them from the hand', () => {
    const s = toAnswer(start());
    const pick = blackCard(s.blackId).pick;
    const hand = s.hands['ana'] ?? [];
    const cards = hand.slice(0, pick);
    const ok = play(s, 'ana', cards);
    expect(ok.submissions['ana']).toEqual(cards);
    expect(ok.hands['ana']).toHaveLength(hand.length - pick);
    // Wrong count, a card not in hand, a duplicate, a second play, a spectator: unchanged.
    expect(play(s, 'ana', [...cards, hand[pick] as string])).toBe(s);
    expect(play(s, 'ana', ['zzz'])).toBe(s);
    if (pick > 1) expect(play(s, 'ana', Array(pick).fill(cards[0]))).toBe(s);
    expect(play(ok, 'ana', hand.slice(pick, pick * 2))).toBe(ok);
    expect(play(s, 'ghost', cards)).toBe(s);
  });

  it('the last card in holds the stage for a beat, then the reading starts with shuffled slots', () => {
    let s = toAnswer(start({ players: 4, timed: false }));
    s = playAll(s, ['dev']);
    expect(s.phase.id).toBe('answer');
    expect(allIn(s)).toBe(false);
    const t = s.phase.startedAt + 20_000;
    s = play(s, 'dev', topCards(s, 'dev'), t);
    // Everyone's in: still "answer", the clock hidden, the deadline moved up to the beat.
    expect(s.phase.id).toBe('answer');
    expect(allIn(s)).toBe(true);
    expect(s.phase.deadline).toBe(t + ALL_IN_MS);
    expect(tv(s).timerMode).toBe('hidden');
    expect(next(s, 'ana', t + 100).phase.id).toBe('reveal'); // Next still cuts it short (untimed)
    s = timer(s);
    expect(s.phase.id).toBe('reveal');
    expect(s.revealIndex).toBe(0);
    expect([...s.slots].sort()).toEqual(['ana', 'ben', 'cleo', 'dev']);
    // The beat never pushes a deadline later than it was.
    let late = toAnswer(start({ players: 3, timed: true }));
    late = playAll(late, ['cleo']);
    const end = late.phase.deadline as number;
    late = play(late, 'cleo', topCards(late, 'cleo'), end - 500);
    expect(late.phase.deadline).toBe(end);
  });

  it('a disconnected player is not waited for; nobody played → winnerless result', () => {
    let s = connect(toAnswer(start({ players: 3 })), 'cleo', false);
    s = playAll(s, ['cleo']);
    expect(s.phase.id).toBe('reveal');
    const idle = timer(toAnswer(start({ players: 3 })));
    expect(idle.phase.id).toBe('result');
    expect(idle.winners).toEqual([]);
    expect(tv(idle).revealed).toEqual([]);
  });

  it('the drop of the last outstanding player closes the phase at once (no beat)', () => {
    let s = playAll(toAnswer(start({ players: 3 })), ['cleo']);
    expect(s.phase.id).toBe('answer');
    s = connect(s, 'cleo', false, s.phase.startedAt + 500);
    expect(s.phase.id).toBe('reveal');
  });

  it('a single submission is a walkover: no reading, no vote, one point', () => {
    let s = playAll(toAnswer(start({ players: 3 })), ['ben', 'cleo']);
    s = timer(s);
    expect(s.phase.id).toBe('result');
    expect(s.winners).toEqual(['ana']);
    expect(s.scores['ana']).toBe(1);
    expect(tv(s).walkover).toBe(true);
  });

  it('the answer deadline stretches by 15 s per extra card', () => {
    const s = toAnswer(start({ answerSeconds: 60 }));
    const pick = blackCard(s.blackId).pick;
    expect(s.phase.deadline).toBe(s.phase.startedAt + (60 + 15 * (pick - 1)) * 1000);
  });
});

describe('reveal', () => {
  it('reads one card per phase instance, then opens the vote; VIP skip jumps to the vote', () => {
    let s = playAll(toAnswer(start({ players: 4 })));
    const n = s.slots.length;
    for (let i = 0; i < n; i++) {
      expect(s.phase.id).toBe('reveal');
      expect(s.revealIndex).toBe(i);
      expect(tv(s).cards).toHaveLength(i + 1);
      expect(tv(s).cardCount).toBe(n);
      expect(cv(s, 'ana').cards).toHaveLength(i + 1);
      s = timer(s);
    }
    expect(s.phase.id).toBe('judge');
    expect(tv(s).cards).toHaveLength(n);
    const skipped = vip(playAll(toAnswer(start({ players: 4 }))), 'skip');
    expect(skipped.phase.id).toBe('judge');
  });
});

describe('judge (vote mode)', () => {
  it('nobody votes for their own slot; the most-voted card wins; ties share the point', () => {
    let s = readAll(playAll(toAnswer(start({ players: 4 }))));
    const mine = s.slots.indexOf('ana');
    expect(vote(s, 'ana', mine)).toBe(s);
    expect(vote(s, 'ana', 99)).toBe(s);
    const target = s.slots.indexOf('ben');
    s = voteAll(s, (id) => (id === 'ben' ? s.slots.indexOf('ana') : target));
    expect(s.phase.id).toBe('result');
    expect(s.winners).toEqual(['ben']);
    expect(s.scores).toEqual({ ana: 0, ben: 1, cleo: 0, dev: 0 });
    // A 2–2 split shares the point.
    let t = readAll(playAll(toAnswer(start({ players: 4, seed: 5 }))));
    const [a, b] = t.slots as [string, string, string, string];
    t = voteAll(t, (id) =>
      id === a || id === b ? t.slots.indexOf(t.slots[3] as string) : t.slots.indexOf(a),
    );
    expect(t.phase.id).toBe('result');
    expect(t.winners.length).toBeGreaterThanOrEqual(1);
    const total = Object.values(t.scores).reduce((x, y) => x + y, 0);
    expect(total).toBe(t.winners.length);
  });

  it('the deadline counts the votes so far; no votes → nobody wins', () => {
    const s = timer(readAll(playAll(toAnswer(start({ players: 4 })))));
    expect(s.phase.id).toBe('result');
    expect(s.winners).toEqual([]);
    expect(Object.values(s.scores)).toEqual([0, 0, 0, 0]);
  });

  it('a voter whose card is the only one up is not waited for', () => {
    // Two play, cleo lets the clock run out: three voters, two cards.
    let s = playAll(toAnswer(start({ players: 3 })), ['cleo']);
    s = readAll(timer(s));
    expect(s.phase.id).toBe('judge');
    // cleo (no card) may vote; ana and ben may vote for each other.
    s = vote(s, 'cleo', s.slots.indexOf('ana'));
    s = vote(s, 'ana', s.slots.indexOf('ben'));
    expect(s.phase.id).toBe('judge');
    s = vote(s, 'ben', s.slots.indexOf('ana'));
    expect(s.phase.id).toBe('result');
    expect(s.winners).toEqual(['ana']);
  });
});

describe('two cards, no one else to vote', () => {
  it('skips the vote after the reading and splits the point', () => {
    // Three players, one dropped: the two who played are the only voters.
    let s = connect(toAnswer(start({ players: 3, timed: true })), 'cleo', false);
    s = playAll(s, ['cleo']);
    expect(s.slots).toHaveLength(2);
    s = readAll(s);
    expect(s.phase.id).toBe('result');
    expect([...s.winners].sort()).toEqual(['ana', 'ben']);
    expect(s.scores).toEqual({ ana: 1, ben: 1, cleo: 0 });
    expect(tv(s).walkover).toBe(false);
    // A third voter (Cleo connected, sitting the round out) makes the vote real again.
    let t = playAll(toAnswer(start({ players: 3, timed: true })), ['cleo']);
    t = readAll(timer(t));
    expect(t.phase.id).toBe('judge');
    expect(timer(t).winners).toEqual([]);
    // A judge in czar mode is that third voter too.
    const c = readAll(playAll(toAnswer(start({ players: 3, judge: 'czar', timed: true }))));
    expect(c.phase.id).toBe('judge');
  });
});

describe('judge (czar mode)', () => {
  it('the judge rotates by seat, plays no card, and is the only voter', () => {
    let s = start({ judge: 'czar', players: 4, rounds: 3 });
    expect(s.czarId).toBe('ana');
    s = toAnswer(s);
    expect(play(s, 'ana', topCards(s, 'ana'))).toBe(s);
    expect(cv(s, 'ana').role).toBe('judge');
    expect(cv(s, 'ana').hand).toEqual([]);
    s = playAll(s);
    expect(s.phase.id).toBe('reveal');
    expect(s.slots).not.toContain('ana');
    s = readAll(s);
    expect(vote(s, 'ben', 0)).toBe(s);
    expect(cv(s, 'ben').vote?.canVote).toBe(false);
    s = vote(s, 'ana', 1);
    expect(s.phase.id).toBe('result');
    expect(s.winners).toEqual([s.slots[1]]);
    s = timer(s);
    expect(s.czarId).toBe('ben');
  });

  it('skips a disconnected seat when choosing the judge', () => {
    let s = start({ judge: 'czar', players: 4, rounds: 3 });
    s = connect(s, 'ben', false);
    s = timer(playRound(s)); // round 2 would be ben's
    expect(s.round).toBe(2);
    expect(s.czarId).toBe('cleo');
  });

  it('a judge who dropped during the reading never holds the vote: it ends on entry', () => {
    const s = readAll(playAll(toAnswer(start({ judge: 'czar', players: 4 }))));
    expect(s.phase.id).toBe('judge');
    // Replay: drop the judge one card before the end of the reading.
    let r = playAll(toAnswer(start({ judge: 'czar', players: 4 })));
    r = connect(r, r.czarId as string, false, r.phase.startedAt + 100);
    expect(r.phase.id).toBe('reveal');
    r = readAll(r);
    expect(r.phase.id).toBe('result');
    expect(r.winners).toEqual([]);
    expect(tv(r).czar?.connected).toBe(false);
    // Nobody left to answer: the answer phase ends on entry too (winnerless result).
    let a = start({ judge: 'czar', players: 3 });
    for (const id of a.order) if (id !== a.czarId) a = connect(a, id, false, a.phase.startedAt + 1);
    a = toAnswer(a);
    expect(a.phase.id).toBe('result');
    expect(tv(a).revealed).toEqual([]);
  });

  it('the judge dropping mid-vote ends the round without a winner', () => {
    let s = readAll(playAll(toAnswer(start({ judge: 'czar', players: 4 }))));
    expect(s.phase.id).toBe('judge');
    s = connect(s, 'ana', false, s.phase.startedAt + 100);
    expect(s.phase.id).toBe('result');
    expect(s.winners).toEqual([]);
  });
});

describe('untimed rounds (the default)', () => {
  it('hides the clock on picking, voting and the result and keeps a long fallback', () => {
    let s = toAnswer(start({ timed: false, players: 4 }));
    expect(s.phase.deadline).toBe(s.phase.startedAt + 180_000);
    expect(tv(s).timerMode).toBe('hidden');
    expect(cv(s, 'ana').timerMode).toBe('hidden');
    s = readAll(playAll(s));
    expect(s.phase.id).toBe('judge');
    expect(s.phase.deadline).toBe(s.phase.startedAt + 120_000);
    s = timer(s);
    expect(s.phase.id).toBe('result');
    expect(s.phase.deadline).toBe(s.phase.startedAt + 60_000);
    expect(tv(s).timerMode).toBe('hidden');
    // The reading keeps its own pace whatever the setting — a bar, no countdown; so does the
    // round card.
    const reading = playAll(toAnswer(start({ timed: false, players: 3 })));
    expect(reading.phase.id).toBe('reveal');
    expect(tv(reading).timerMode).toBe('quiet');
    expect(tv(readAll(reading)).timerMode).toBe('hidden');
    expect(tv(start({ timed: false })).timerMode).toBe('quiet');
    expect(tv(start({ timed: true })).timerMode).toBe('quiet');
  });

  it('Next is ignored while nothing is on the table', () => {
    const s = toAnswer(start({ timed: false, players: 4 }));
    expect(s.phase.id).toBe('answer');
    expect(next(s, 'ana')).toBe(s);
    // One card in: Next works and the round is a walkover (no reading, no vote).
    const one = play(s, 'ana', topCards(s, 'ana'));
    expect(next(one, 'ben').phase.id).toBe('result');
    // Two in: the reading starts.
    const two = play(one, 'ben', topCards(one, 'ben'));
    expect(next(two, 'cleo').phase.id).toBe('reveal');
  });

  it('Next from any player ends picking, voting and the result like the deadline would', () => {
    let s = playAll(toAnswer(start({ timed: false, players: 4 })), ['dev']);
    expect(next(s, 'ghost', s.phase.startedAt + 1)).toBe(s);
    s = next(s, 'ben');
    expect(s.phase.id).toBe('reveal');
    expect(s.slots).toHaveLength(3);
    s = readAll(s);
    s = next(s, 'dev');
    expect(s.phase.id).toBe('result');
    expect(s.winners).toEqual([]);
    s = next(s, 'ana');
    expect(s.phase.id).toBe('intro');
    expect(s.round).toBe(2);
  });

  it('Next never skips a connected judge', () => {
    let s = readAll(playAll(toAnswer(start({ timed: false, judge: 'czar', players: 4 }))));
    expect(s.phase.id).toBe('judge');
    const judge = s.czarId as string;
    const other = s.order.find((id) => id !== judge) as string;
    expect(next(s, other)).toBe(s);
    expect(next(s, judge)).toBe(s);
    // The judge dropping ends the phase on its own (no voter left), so Next never has to.
    s = connect(s, judge, false);
    expect(s.phase.id).toBe('result');
    expect(s.winners).toEqual([]);
  });

  it('Quick draw counts a play within half the answer time of the start, not of the fallback', () => {
    const s = toAnswer(start({ timed: false, players: 4 }));
    const t0 = s.phase.startedAt;
    // Untimed: the 3 min fallback is the deadline, but "fast" is still 30 s (answerSeconds / 2).
    expect(play(s, 'ana', topCards(s, 'ana'), t0 + 29_000).stats.fastPlays['ana']).toBe(1);
    expect(play(s, 'ana', topCards(s, 'ana'), t0 + 31_000).stats.fastPlays['ana']).toBe(0);
    // A pause shifts the deadline, and the yardstick with it.
    const paused = vip(vip(s, 'pause', t0 + 1000), 'resume', t0 + 11_000);
    expect(play(paused, 'ana', topCards(s, 'ana'), t0 + 39_000).stats.fastPlays['ana']).toBe(1);
    expect(play(paused, 'ana', topCards(s, 'ana'), t0 + 41_000).stats.fastPlays['ana']).toBe(0);
    const timed = toAnswer(start({ timed: true, players: 4 }));
    expect(play(timed, 'ana', topCards(timed, 'ana'), t0 + 29_000).stats.fastPlays['ana']).toBe(1);
    expect(play(timed, 'ana', topCards(timed, 'ana'), t0 + 31_000).stats.fastPlays['ana']).toBe(0);
  });

  it('Next is ignored in timed rounds', () => {
    const s = playAll(toAnswer(start({ timed: true, players: 4 })), ['dev']);
    expect(next(s, 'ana')).toBe(s);
    expect(tv(s).timerMode).toBe('normal');
  });
});

describe('rando', () => {
  it('plays a card from the deck every round and pays nobody when it wins', () => {
    let s = toAnswer(start({ rando: true, players: 3 }));
    expect(s.submissions[RANDO]).toHaveLength(blackCard(s.blackId).pick);
    expect(tv(s).playedCount).toBe(0);
    s = readAll(playAll(s));
    const randoSlot = s.slots.indexOf(RANDO);
    s = voteAll(s, () => randoSlot);
    expect(s.phase.id).toBe('result');
    expect(s.winners).toEqual([RANDO]);
    expect(Object.values(s.scores)).toEqual([0, 0, 0]);
    const revealed = tv(s).revealed.find((r) => r.rando);
    expect(revealed?.name).toBe('Rando');
    expect(revealed?.winner).toBe(true);
  });
});

describe('VIP', () => {
  it('skip walks the phases; end jumps to done from anywhere with the scores so far', () => {
    let s = start({ players: 4 });
    s = vip(s, 'skip');
    expect(s.phase.id).toBe('answer');
    s = playAll(s, ['dev']);
    s = vip(s, 'skip');
    expect(s.phase.id).toBe('reveal');
    expect(s.slots).toHaveLength(3);
    s = vip(s, 'skip');
    expect(s.phase.id).toBe('judge');
    s = vip(s, 'skip');
    expect(s.phase.id).toBe('result');
    s = vip(s, 'skip');
    expect(s.phase.id).toBe('intro');
    expect(s.round).toBe(2);
    const ended = vip(s, 'end');
    expect(ended.phase.id).toBe('done');
    expect(ended.scores).toEqual(s.scores);
  });

  it('pause holds inputs and shifts the deadline on resume', () => {
    let s = toAnswer(start({ players: 3 }));
    const deadline = s.phase.deadline as number;
    s = vip(s, 'pause', s.phase.startedAt + 1000);
    expect(play(s, 'ana', topCards(s, 'ana'))).toBe(s);
    s = vip(s, 'resume', s.phase.startedAt + 6000);
    expect(s.phase.deadline).toBe(deadline + 5000);
  });
});

describe('views', () => {
  it('the TV never shows a hand or a submission before the reveal; a phone sees only its own', () => {
    const s = play(
      toAnswer(start({ players: 3 })),
      'ana',
      topCards(toAnswer(start({ players: 3 })), 'ana'),
    );
    const mine = cv(s, 'ana');
    expect(mine.myPlay).toHaveLength(blackCard(s.blackId).pick);
    expect(mine.hand.length).toBeLessThan(10);
    const other = cv(s, 'ben');
    expect(other.myPlay).toBeNull();
    expect(other.hand).toHaveLength(10);
    const text = JSON.stringify(tv(s));
    for (const card of mine.myPlay ?? [])
      expect(text).not.toContain(JSON.stringify(card).slice(1, -1));
    expect(tv(s).cards).toEqual([]);
  });

  it('the result names authors and votes; the phone knows whether it won', () => {
    const s = playRound(start({ players: 4 }));
    const view = tv(s);
    expect(view.revealed).toHaveLength(4);
    expect(view.revealed.filter((r) => r.winner).map((r) => r.submitterId)).toEqual(s.winners);
    for (const w of s.winners) expect(cv(s, w).iWon).toBe(true);
    expect(view.standings).toHaveLength(4);
  });
});
