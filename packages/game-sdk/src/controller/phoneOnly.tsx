// S-005 / the owner (2026-09-22): "some games still reference the TV and are not adjusted to work
// well on phone only". The shell says whether the room is "phone only", so the SDK's own controls
// (ChoiceGrid, VoteList, TextAnswer) pick defaults that never send a player to a TV that is not
// there. A game can read it too — `usePhoneOnly()` — instead of threading `view.phoneOnly` down.
import { createContext, useContext } from 'react';
import type { JSX, ReactNode } from 'react';

const PhoneOnlyContext = createContext(false);

export function PhoneOnlyProvider({
  value,
  children,
}: {
  value: boolean;
  children: ReactNode;
}): JSX.Element {
  return <PhoneOnlyContext.Provider value={value}>{children}</PhoneOnlyContext.Provider>;
}

/** True in a "phone only" room: there is no TV to look at. False outside any shell (previews). */
export function usePhoneOnly(): boolean {
  return useContext(PhoneOnlyContext);
}

/** The SDK's default lines, with and without a TV in the room. */
export const SDK_LINES = {
  lockedIn: (phoneOnly: boolean): string =>
    phoneOnly ? '✓ Locked in' : '✓ Locked in — look at the TV',
  voteIn: (phoneOnly: boolean): string => (phoneOnly ? '✓ Vote in' : '✓ Vote in — look at the TV'),
  waiting: (phoneOnly: boolean): string =>
    phoneOnly ? 'Waiting for the others…' : 'Waiting for the others — look at the TV',
  // The input goes to the host, not the TV; with no TV in the room, say it plainly.
  retry: (phoneOnly: boolean): string =>
    phoneOnly ? "✗ Didn't go through — tap again" : "✗ Didn't reach the TV — tap again",
};
