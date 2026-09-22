// The owner (2026-09-22): in a "phone only" room nothing may send a player to a TV that is not
// there. The SDK's controls carry their own default lines; these pin both rooms.
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactNode } from 'react';
import { ChoiceGrid, PhoneOnlyProvider, TextAnswer, VoteList } from '@partybox/game-sdk/ui';

const noop = (): void => undefined;
const inRoom = (phoneOnly: boolean, node: ReactNode): string =>
  renderToStaticMarkup(<PhoneOnlyProvider value={phoneOnly}>{node}</PhoneOnlyProvider>);

const grid = (
  <ChoiceGrid
    choices={[
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
    ]}
    selectedId="a"
    onPick={noop}
  />
);
const votes = (
  <VoteList
    options={[
      { id: 'a', text: 'A' },
      { id: 'b', text: 'B' },
    ]}
    votedId="a"
    onVote={noop}
  />
);
const answer = <TextAnswer prompt="Name a fruit" submitted onSubmit={noop} />;

describe('the SDK controls in a phone-only room (S-005)', () => {
  it('never mention the TV once the answer is in', () => {
    for (const node of [grid, votes, answer]) expect(inRoom(true, node)).not.toMatch(/\bTV\b/);
  });

  it('still point at the TV when there is one', () => {
    expect(inRoom(false, grid)).toContain('Locked in — look at the TV');
    expect(inRoom(false, votes)).toContain('Vote in — look at the TV');
    expect(inRoom(false, answer)).toContain('Waiting for the others — look at the TV');
  });

  it('say the plain thing without one', () => {
    expect(inRoom(true, grid)).toContain('✓ Locked in');
    expect(inRoom(true, votes)).toContain('✓ Vote in');
    expect(inRoom(true, answer)).toContain('Waiting for the others…');
  });
});
