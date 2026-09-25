// Flow, edge cases, voice pacing, bots, awards, recap and the 16-player state size.
import { createRng } from '@partybox/game-sdk';
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { boxRequest } from '../server/speech';
import { BOX_LEAD_MS, BOX_SILENT_MS, BOX_TAIL_MS, OPEN_HOLD_MS } from '../server/timing';
import type { State } from '../server/types';
import { bet, playThrough, send, setOutcome, skip, start, timer, walkTo } from './helpers';

describe('flow', () => {
  it('rules → (box → bet → open) × rounds → done, on deadlines alone', () => {
    let s = start(4, { rounds: 5 });
    const seen: string[] = [s.phase.id];
    for (let i = 0; i < 200 && s.phase.id !== 'done'; i++) {
      s = timer(s);
      if (seen[seen.length - 1] !== s.phase.id) seen.push(s.phase.id);
    }
    expect(seen).toEqual(['rules', ...Array(5).fill(['box', 'bet', 'open']).flat(), 'done']);
    expect(game.results(s)?.ranking).toHaveLength(4);
  });

  it('the VIP skip moves every phase on, with the label the TV shows', () => {
    let s = start(3, { rounds: 5 });
    const labels: string[] = [];
    while (s.phase.id !== 'done') {
      labels.push(game.tvView(s).vipSkipLabel ?? '');
      s = skip(s);
    }
    expect(labels.slice(0, 4)).toEqual([
      "Let's go",
      'Skip to betting',
      'Close betting',
      'Next box',
    ]);
    expect(labels[labels.length - 1]).toBe('See results');
  });

  it('a box without a voice holds 6 s; betting lasts `betSeconds`', () => {
    let s = skip(start(3, { reader: 'none', betSeconds: 15 }));
    expect(s.phase.deadline).toBe(s.phase.startedAt + BOX_SILENT_MS);
    s = timer(s);
    expect(s.phase.deadline).toBe(s.phase.startedAt + 15_000);
  });

  it('everyone idle: the game ends in minutes, all tied', () => {
    let s = start(6, { rounds: 12, betSeconds: 40 });
    while (s.phase.id !== 'done') s = timer(s);
    expect(s.phase.startedAt - 1_000_000).toBeLessThan(15 * 60_000);
    expect(game.results(s)?.winnerIds).toHaveLength(6);
  });

  it('a late joiner is a spectator; one connected player can still finish', () => {
    let s = start(3, { rounds: 5 });
    expect(game.controllerView(s, 'late').me.role).toBe('spectator');
    s = send(s, { type: 'player', now: s.phase.startedAt + 1, playerId: 'p2', connected: false });
    s = send(s, { type: 'player', now: s.phase.startedAt + 1, playerId: 'p3', connected: false });
    s = walkTo(s, 'bet');
    s = bet(s, 'p1', 0, 10);
    expect(s.phase.id).toBe('open');
  });
});

describe('voice pacing', () => {
  it('a ready box reading sets the box: lead + reading + 1 s', () => {
    let s = start(3);
    const key = boxRequest(s, 0)?.key ?? '';
    s = send(s, { type: 'speech', now: s.phase.startedAt + 100, key, ms: 3000 });
    s = skip(s);
    expect(s.phase.deadline).toBe(s.phase.startedAt + BOX_LEAD_MS + 3000 + BOX_TAIL_MS);
    expect(game.tvView(s).voice).toEqual({
      url: `/api/speech/${key}.wav`,
      at: s.phase.startedAt + BOX_LEAD_MS,
    });
  });

  it('the winners line plays after the box opens, and the box waits for it', () => {
    let s = setOutcome(walkTo(start(2), 'bet'), 0);
    s = bet(bet(s, 'p1', 0, 10), 'p2', 0, 10);
    s = timer(s);
    expect(s.r.step).toBe(1);
    const req = (game.speech?.(s) ?? []).find((r) => JSON.stringify(r.parts).includes('winners'));
    expect(req).toBeDefined();
    s = send(s, { type: 'speech', now: (s.r.turnedAt ?? 0) + 300, key: req?.key ?? '', ms: 6000 });
    expect(s.r.voiceAt).not.toBeNull();
    expect(s.phase.deadline).toBeGreaterThanOrEqual((s.r.voiceAt ?? 0) + 6000);
    expect(s.phase.deadline).toBeLessThanOrEqual((s.r.turnedAt ?? 0) + OPEN_HOLD_MS + 5000);
  });

  it('no voice at all when the reader is none', () => {
    expect(game.speech?.(start(3, { reader: 'none' }))).toEqual([]);
  });
});

describe('bots', () => {
  it('ready up, then bet a varied stake on a varied content, once per box', () => {
    const s = start(6, {}, 3, 6);
    expect(new Set(Object.values(s.factors)).size).toBeGreaterThan(3);
    const choices = new Set<string>();
    for (let seed = 1; seed <= 20; seed++) {
      const b = walkTo(start(4, {}, seed, 4), 'bet');
      const input = game.bot.sampleInput(b, 'p1', createRng(seed));
      if (input?.type === 'bet') choices.add(`${input.option}:${input.amount}`);
      if (input) {
        const after = send(b, { type: 'input', now: b.phase.startedAt + 5, playerId: 'p1', input });
        expect(game.bot.sampleInput(after, 'p1', createRng(seed))).toBeNull();
      }
    }
    expect(choices.size).toBeGreaterThan(5);
  });
});

describe('results, awards, recap, size', () => {
  it('awards: high roller, big winner, long shot, fortune teller, unlucky', () => {
    let s = walkTo(start(3, { rounds: 5, grand: false }), 'bet');
    const rare = s.boxes[s.r.idx]?.box.options.findIndex((o) => o.chance < 20) ?? -1;
    const win = rare >= 0 ? rare : 0;
    s = setOutcome(s, win);
    s = bet(bet(bet(s, 'p1', win, 20), 'p2', (win + 1) % 2, 60), 'p3', win, 0);
    s = walkTo(s, 'done');
    const awards = game
      .results(s)
      ?.awards.map((a) => `${a.id.split(':')[0]}=${a.playerId}`)
      .sort();
    expect(awards).toContain('fortune-teller=p1');
    expect(awards).toContain('big-winner=p1');
    expect(awards).toContain('high-roller=p2');
    expect(awards).toContain('unlucky=p2');
  });

  it('the recap lists every box with its bets, what was inside and the coins', () => {
    const states = playThrough(11, 4, { rounds: 5 });
    const end = states[states.length - 1] as State;
    const history = states
      .filter((st, i) => i === 0 || st.phase.startedAt !== states[i - 1]?.phase.startedAt)
      .map((st) => ({ phase: st.phase.id, at: st.phase.startedAt, state: st }));
    const recap = game.recap?.(end, {
      players: Object.values(end.players),
      history,
      results: game.results(end),
    });
    expect(recap?.markdown).toMatch(/^# Blind Auction · \d{4}-\d{2}-\d{2}/);
    expect(recap?.markdown.match(/^## \d\./gm)).toHaveLength(5);
    expect(recap?.markdown).toContain('Inside: ');
  });

  it('16 players: state under 12 KB, views under 4 KB', () => {
    let biggest = 0;
    let biggestView = 0;
    for (const s of playThrough(5, 16, { rounds: 12, spicy: true })) {
      biggest = Math.max(biggest, JSON.stringify(s).length);
      biggestView = Math.max(
        biggestView,
        JSON.stringify(game.tvView(s)).length,
        JSON.stringify(game.controllerView(s, 'p1')).length,
      );
    }
    console.info(`blind-auction 16p: state ${biggest} B, largest view ${biggestView} B`);
    expect(biggest).toBeLessThan(12 * 1024);
    expect(biggestView).toBeLessThan(4 * 1024);
  });
});
