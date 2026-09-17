// Untimed rounds: anyone in the room moves the phase along. One tap sends `next` and the button
// locks until the phase changes (it remounts with the screen), so a nervous double tap never skips
// two phases. Hidden entirely when the round is timed.
import { useState } from 'react';
import type { JSX } from 'react';
import { PrimaryButton } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';

export function NextButton({
  send,
  label,
  timed,
}: {
  send: (input: Input) => void;
  label: string;
  timed: boolean;
}): JSX.Element | null {
  const [sent, setSent] = useState(false);
  if (timed) return null;
  return (
    <PrimaryButton
      tone="neutral"
      done={sent}
      onClick={() => {
        if (sent) return;
        setSent(true);
        send({ type: 'next' });
      }}
    >
      {sent ? 'Moving on…' : label}
    </PrimaryButton>
  );
}
