// The phone controller's shapes (split from controller.ts, which re-exports them): the store's
// state and what the screens may call.
import type {
  BotAction,
  ControllerView,
  ErrorPayload,
  JoinPayload,
  PushedView,
  RoomSnapshot,
  VipAction,
} from '@partybox/shared';
import type { Identity, Session } from './session-store';
import type { Store, Toast } from './store';

export type Connection = 'connecting' | 'connected' | 'reconnecting';

export interface ControllerState {
  connection: Connection;
  /** True once a welcome arrived for this session. */
  joined: boolean;
  /** Auto-resume in progress (token from localStorage). */
  resuming: boolean;
  playerId: string | null;
  room: RoomSnapshot | null;
  view: PushedView<ControllerView> | null;
  rev: number;
  offsetMs: number;
  error: ErrorPayload | null;
  toasts: Toast[];
  kicked: string | null;
  /** I-755 A: this phone has PartyBox open in another tab, which holds the seat. */
  otherTab: boolean;
  /** The stored session was rejected (server restarted, room gone): the join form explains why. */
  restarted: boolean;
}

export interface Controller {
  store: Store<ControllerState>;
  /** `takeOver` (I-741 C): "That's me — take my seat". */
  join(input: Omit<JoinPayload, 'token'>): void;
  sendInput(input: unknown): void;
  vip(action: VipAction): void;
  /** Add a bot you own, or remove one of yours (VIPs may remove any). */
  bot(action: BotAction): void;
  /** I-070 A: nudge the VIP (lobby only; the server rate-limits it). */
  nudge(): void;
  /** ADR-053: this person has read the start stage's rules. */
  ready(): void;
  /** I-650: vote for the next game (null takes the vote back). */
  vote(gameId: string | null): void;
  /** ADR-047: this phone's "I can see the TV" (remembered here, told to the room). */
  setCanSeeTv(on: boolean): void;
  leave(): void;
  /** I-755 A: take the seat back from the other tab. */
  playHere(): void;
  dismissError(): void;
  dismissToast(id: number): void;
  session(): Session | null;
  /** Last name + avatar this phone joined with (survives the session). */
  identity(): Identity | null;
}
