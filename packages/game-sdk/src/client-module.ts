// What `games/<id>/client/index.ts` exports and the client registry lists. Components are lazy so
// a game's UI is only downloaded when it is played.
import type { ComponentType, LazyExoticComponent } from 'react';
import type { ControllerView, PushedView, RoomSnapshot, TvView } from '@partybox/shared';

export interface GameTvProps<V extends TvView = TvView> {
  view: PushedView<V>;
}

/** Props of a game's optional `Finale` (rendered on the results stage under the winner line). */
export interface GameFinaleProps<V extends TvView = TvView> {
  /** The last view the stage showed while playing — the game's own last board. */
  lastView: PushedView<V>;
  room: RoomSnapshot;
}

export interface GameControllerProps<V extends ControllerView = ControllerView, I = unknown> {
  view: PushedView<V>;
  /** The player this phone belongs to. */
  me: { id: string; name: string; avatarId: string };
  send: (input: I) => void;
}

/* eslint-disable @typescript-eslint/no-explicit-any -- each game narrows its own view/input types */
export interface GameClientModule {
  id: string;
  Tv: LazyExoticComponent<ComponentType<GameTvProps<any>>>;
  Controller: LazyExoticComponent<ComponentType<GameControllerProps<any, any>>>;
  /**
   * Optional map from TV phase id (`view.phaseId`) to a design-system cue name
   * (docs/DESIGN_SYSTEM.md): the TV shell plays it when that phase begins. Unmapped phases play
   * `phase`, which is reserved for "your phone needs you"; unknown cue names fall back to it too.
   */
  sounds?: Record<string, string>;
  /**
   * Whether the TV strip may show running scores for this view (default: yes whenever players
   * carry a `score`). Return false for a phase whose stage reveals points beat by beat, so the
   * strip never leads the stage (a reveal that applies points on entry but steps its rows).
   */
  stripScores?: (view: PushedView<TvView>) => boolean;
  /**
   * Background music on the TV while this game plays (the shell's music engine: tracks are ids
   * under /music/, fetched by scripts/fetch-music.ts). `phases` limits it to those phase ids.
   */
  music?: GameMusic;
  /**
   * The results stage keeps the game's last board up instead of the generic scoreboard when
   * `finale(lastView)` says so — a Lightning final-wager board stays until Play again / Home.
   */
  finale?: (lastView: PushedView<any>) => boolean;
  Finale?: LazyExoticComponent<ComponentType<GameFinaleProps<any>>>;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface GameMusic {
  tracks: readonly string[];
  /** Pick weights, same order as `tracks` (chain mode); equal when absent. */
  weights?: readonly number[];
  /** Steady level 0..1 — keep it under the caller / cues. */
  volume: number;
  /** chain: whole tracks back to back; rotate: 30–60 s each with a fade and a breath between. */
  mode: 'rotate' | 'chain';
  phases?: readonly string[];
}
