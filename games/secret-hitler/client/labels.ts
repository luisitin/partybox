// Words for the server's enums (roles, powers, reasons, endings), shared by the TV and the phone.
// Every sentence goes through the device's language (ADR-044); the Spanish is in ./strings.ts.
import type { Translator } from '@partybox/game-sdk/ui';
import type { Party, PowerKind, Role, WinReason, Winner } from '../server/types';
import type { SeatTag } from '../server/views';

export function roleName(L: Translator, role: Role): string {
  return role === 'hitler' ? L('Hitler') : role === 'fascist' ? L('Fascist') : L('Liberal');
}

export function partyName(L: Translator, party: Party): string {
  return party === 'L' ? L('Liberal') : L('Fascist');
}

export function roleGoal(L: Translator, role: Role): string {
  if (role === 'liberal') return L('Enact 5 Liberal policies, or execute Hitler.');
  if (role === 'hitler') return L('Enact 6 Fascist policies, or be elected Chancellor after 3.');
  return L('Enact 6 Fascist policies, or elect Hitler Chancellor after 3.');
}

export function powerName(L: Translator, power: PowerKind): string {
  switch (power) {
    case 'investigate':
      return L('Investigate');
    case 'special':
      return L('Special election');
    case 'peek':
      return L('Policy peek');
    case 'execute':
      return L('Execution');
  }
}

export function powerBanner(L: Translator, power: PowerKind): string {
  switch (power) {
    case 'investigate':
      return L('The President may investigate a player');
    case 'special':
      return L('The President will call a special election');
    case 'peek':
      return L('The President may look at the next three policies');
    case 'execute':
      return L('The President must execute a player');
  }
}

export type Reason =
  'president' | 'executed' | 'exiled' | 'lastChancellor' | 'lastPresident' | 'investigated';

export function reasonName(L: Translator, reason: Reason): string {
  switch (reason) {
    case 'president':
      return L('President');
    case 'executed':
      return L('Executed');
    case 'exiled':
      return L('Left');
    case 'lastChancellor':
      return L('Last Chancellor');
    case 'lastPresident':
      return L('Last President');
    case 'investigated':
      return L('Already investigated');
  }
}

export function tagName(L: Translator, tag: SeatTag): string | null {
  switch (tag) {
    case 'executed':
      return L('👻 Executed');
    case 'exiled':
      return L('Left');
    case 'notHitler':
      return L('✓ Not Hitler');
    case 'investigated':
      return L('🔎 Investigated');
    case 'lastChancellor':
      return L('Last Chancellor');
    case 'lastPresident':
      return L('Last President');
    default:
      return null; // `next` and `voted` have their own marks
  }
}

export function endingBanner(
  L: Translator,
  reason: WinReason | null,
  winner: Winner | null,
): string {
  switch (reason) {
    case 'liberalPolicies':
      return L('The Liberals save the republic');
    case 'hitlerExecuted':
      return L('Hitler is dead');
    case 'hitlerFled':
      return L('Hitler fled the country');
    case 'fascistPolicies':
      return L('Fascism takes the country');
    case 'hitlerElected':
      return L('Hitler is Chancellor');
    case 'tooFew':
      return winner === 'liberals'
        ? L('Too few left: the Liberals were closer')
        : L('Too few left: the Fascists were closer');
    default:
      return L('The game was ended');
  }
}

export function winnerLine(L: Translator, winner: Winner | null): string {
  if (winner === 'liberals') return L('The Liberals win!');
  if (winner === 'fascists') return L('The Fascists win!');
  return L('No winner this time.');
}

export const CREDIT =
  'Based on Secret Hitler by Max Temkin, Mike Boxleiter & Tommy Maranges · CC BY-NC-SA 4.0';

/** A player's display name from the envelope (ids are long and never shown). */
export function nameIn(
  players: readonly { id: string; name: string }[],
  id: string | null,
): string {
  if (id === null) return '';
  return players.find((p) => p.id === id)?.name ?? '?';
}
