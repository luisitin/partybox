// Nightfall's secrets (role, night job, night report, every role) on the SDK's SecretCard, which
// owns the hardening and the device's hold/tap preference. This file only picks the words: a card
// in tap mode must not say "Hold". `strip` is the one-line (mini) card.
import type { JSX, ReactNode } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import { SecretCard, useSecretCardMode } from '@partybox/game-sdk/ui/secret-card';
import { STRINGS } from './strings';

export type Secret = 'role' | 'job' | 'report' | 'every';

export function HoldCard({
  secret,
  children,
  strip,
}: {
  secret: Secret;
  children: ReactNode;
  strip?: boolean;
}): JSX.Element {
  const L = useT(STRINGS);
  const tap = useSecretCardMode() === 'tap';
  const words: Record<Secret, { hold: string; tap: string }> = {
    role: {
      hold: L('Hold to see your role'),
      tap: L('Tap to see your role'),
    },
    job: {
      hold: L('Hold to see your night job'),
      tap: L('Tap to see your night job'),
    },
    report: {
      hold: L('Hold to see your night report'),
      tap: L('Tap to see your night report'),
    },
    every: {
      hold: L('Hold to see every role'),
      tap: L('Tap to see every role'),
    },
  };
  const w = words[secret];
  return (
    <SecretCard
      size={strip ? 'mini' : 'full'}
      label={tap ? w.tap : w.hold}
      backLabel={tap ? w.tap : w.hold}
      backHint={
        strip
          ? undefined
          : tap
            ? L('It hides again by itself.')
            : L('Keep it close: neighbours peek.')
      }
    >
      {children}
    </SecretCard>
  );
}
