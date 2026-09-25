// Small helpers shared by the TV, the phone and PhoneStage: who is who, points from reason chips,
// the card's clue size, and the reader's clip (played once per key, never two at once).
import { useEffect, useRef } from 'react';
import { useSound, useSoundApi } from '@partybox/game-sdk/ui';
import type { ViewPlayer } from '@partybox/game-sdk/ui';
import type { ImposterStage } from '../server/index';
import type { Why } from '../server/types';

export const POINTS: Record<Why, number> = { read: 1, caught: 2, escaped: 4, stole: 3 };

export function pointsOf(why: readonly Why[] | undefined): number {
  return (why ?? []).reduce((sum, w) => sum + POINTS[w], 0);
}

export function byId(players: readonly ViewPlayer[]): Map<string, ViewPlayer> {
  return new Map(players.map((p) => [p.id, p]));
}

/** TV clue size (SPEC §1.4): h1 up to 8 players, h2 above; shrinks to fit 20 characters, ≥ 36 px. */
export function clueFontPx(text: string, players: number, cardWidth: number): number {
  const base = players > 8 ? 48 : 72;
  const fit = Math.floor(cardWidth / (Math.max(1, text.length) * 0.68));
  return Math.max(36, Math.min(base, fit));
}

/** Every clue a player has on the board, oldest first. */
export function cluesOf(stage: ImposterStage, id: string): string[] {
  const card = stage.board.find((c) => c.by === id);
  return card ? [...card.before, ...(card.now ? [card.now] : [])] : [];
}

/** The scene's opening cue, once per mount (for phases mapped to 'silence'). */
export function useOpeningCue(cue: 'reveal' | 'tally'): void {
  const play = useSound();
  useEffect(() => {
    play(cue, { gain: 0.8 });
  }, [play, cue]);
}

/** Plays the reader's line once, the moment its clip is ready (ADR-045; mute-aware). */
export function useSay(say: ImposterStage['say'], on = true): void {
  const sound = useSoundApi();
  const said = useRef(new Set<string>());
  const key = on ? (say?.key ?? '') : '';
  const url = say?.url ?? '';
  useEffect(() => {
    if (!key || !url || said.current.has(key)) return;
    said.current.add(key);
    sound.hush();
    sound.clip(url, { gain: 1, duck: false });
  }, [key, url, sound]);
}

/** The letters in a text's longest word: what a big word sizes itself by so it never breaks. */
export function longestWord(text: string): number {
  return Math.max(1, ...text.split(/\s+/).map((w) => [...w].length));
}
