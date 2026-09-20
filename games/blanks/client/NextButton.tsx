// Untimed rounds: the VIP moves the phase along. The shell hands the VIP's phone a `skip`
// (the same engine skip as the VIP menu's "Skip / Next"; other phones get none, so the button is
// theirs alone — owner, 2026-09-19: "only the VIP should have the option to force skip rounds").
// One tap and the button locks until the phase changes (it remounts with the screen), so a nervous
// double tap never skips two phases. Hidden entirely when the round is timed.
import { useState } from 'react';
import type { JSX } from 'react';
import { PrimaryButton } from '@partybox/game-sdk/ui';

export function NextButton({
  skip,
  label,
  timed,
}: {
  skip: (() => void) | undefined;
  label: string;
  timed: boolean;
}): JSX.Element | null {
  const [sent, setSent] = useState(false);
  if (timed || skip === undefined) return null;
  return (
    <PrimaryButton
      tone="neutral"
      done={sent}
      onClick={() => {
        if (sent) return;
        setSent(true);
        skip();
      }}
    >
      {sent ? 'Moving on…' : label}
    </PrimaryButton>
  );
}
