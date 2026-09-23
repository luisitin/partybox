// I-755 A: PartyBox is open in another tab on this phone, and that tab has the seat.
import type { JSX } from 'react';
import { PrimaryButton, Screen } from '@partybox/game-sdk/ui';

export function OtherTab({ onPlayHere }: { onPlayHere: () => void }): JSX.Element {
  return (
    <Screen footer={<PrimaryButton onClick={onPlayHere}>Play here instead</PrimaryButton>}>
      <h2 style={{ margin: '0 0 12px' }}>PartyBox is open in another tab</h2>
      <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.4 }}>
        This phone is already in the game in another tab. Use that one — or tap below to play here
        (the other tab will step aside).
      </p>
    </Screen>
  );
}
