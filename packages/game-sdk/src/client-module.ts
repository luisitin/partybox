// What `games/<id>/client/index.ts` exports and the client registry lists. Components are lazy so
// a game's UI is only downloaded when it is played.
import type { ComponentType, LazyExoticComponent } from 'react';
import type { ControllerView, PushedView, TvView } from '@partybox/shared';

export interface GameTvProps<V extends TvView = TvView> {
  view: PushedView<V>;
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
}
/* eslint-enable @typescript-eslint/no-explicit-any */
