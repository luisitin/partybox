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
  /** Optional map from game moments to design-system sound cue names (docs/DESIGN_SYSTEM.md). */
  sounds?: Record<string, string>;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
