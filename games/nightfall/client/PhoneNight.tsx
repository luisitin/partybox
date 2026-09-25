// The phone at `roles` and `night` (SPEC §10.9). Night is one screen for every role: the header,
// the hold strip, a grid of every living player (self included, all enabled) and one status line.
// What the role means and the pack's picks live under hold-to-see; a pick the role may not make is
// refused here, privately, and never sent (NOTES decision 1).
import { useState } from 'react';
import type { JSX } from 'react';
import { PrimaryButton, Screen, buzz, useSound, useT } from '@partybox/game-sdk/ui';
import type { Translator } from '@partybox/game-sdk/ui';
import type { NightfallControllerView } from '../server/index';
import type { Input } from '../server/types';
import { FaceGrid } from './FaceGrid';
import { HoldCard } from './HoldCard';
import { nameOf } from './lookup';
import { CastLine, RoleFace } from './PhoneBits';
import { STRINGS } from './strings';
import styles from './Phone.module.css';

type View = NightfallControllerView;

export function RolesPhone({ view, send }: { view: View; send: (i: Input) => void }): JSX.Element {
  const L = useT(STRINGS);
  return (
    <Screen
      className={styles.screen}
      footer={
        <PrimaryButton done={view.ready} onClick={() => send({ type: 'ready' })}>
          {L('Got it')}
        </PrimaryButton>
      }
    >
      <div className={styles.stack}>
        <p className={styles.head}>{L('Your secret role')}</p>
        <HoldCard secret="role">
          <RoleFace view={view} />
        </HoldCard>
        {view.ready ? (
          <p className={styles.status} aria-live="polite">
            ✓{' '}
            {L('{ready} of {total} have seen their role', {
              ready: view.readyCount,
              total: view.livingCount,
            })}
          </p>
        ) : null}
        <CastLine view={view} />
      </div>
    </Screen>
  );
}

/** Why a pick does not count for this phone's role, or null (the server ignores the same picks). */
export function refusal(view: View, target: string, L: Translator): string | null {
  const me = view.me.id;
  const role = view.role?.id;
  if (role === 'wolf') {
    if (target === me) return L('Pick someone else.');
    // The same words every role gets for a refused pick: 'your packmate' would out a wolf to anyone
    // reading over a shoulder (reviewer 98b823); the pack is under hold-to-see.
    return view.pack.includes(target) ? L('Pick someone else.') : null;
  }
  if (role === 'doctor')
    return target === view.lastProtected ? L('You protected them last night.') : null;
  return target === me ? L('Pick someone else.') : null;
}

function jobDetail(view: View, L: Translator): string | null {
  if (view.role?.id !== 'wolf' || view.packPicks.length === 0) return null;
  const picks = view.packPicks
    .map((p) => `${nameOf(view.players, p.by)} → ${nameOf(view.players, p.target)}`)
    .join(' · ');
  return `${L.sent(view.words.packPicks)}: ${picks}`;
}

export function NightPhone({ view, send }: { view: View; send: (i: Input) => void }): JSX.Element {
  const L = useT(STRINGS);
  const play = useSound();
  // The tap shows at once; the server's echo (`myPick`) takes over when it lands.
  const [sent, setSent] = useState<{ day: number; id: string } | null>(null);
  const [refused, setRefused] = useState<{ id: string; text: string; n: number } | null>(null);
  const local = sent && sent.day === view.day ? sent.id : null;
  const chosen = view.myPick ?? local;
  const detail = jobDetail(view, L);
  const faces = view.living.flatMap((id) => {
    const p = view.players.find((x) => x.id === id);
    return p ? [{ id, name: p.name, avatarId: p.avatarId, connected: p.connected }] : [];
  });
  return (
    <Screen className={styles.screen}>
      <div className={styles.stack}>
        <p className={styles.head}>
          🌙 {L('Night {n}', { n: view.day })} · {L('Choose someone')}
        </p>
        <HoldCard strip secret="job">
          <span className={styles.jobLine}>
            {view.role?.icon} {view.role ? L.sent(view.role.job) : ''}
            {detail ? ` — ${detail}` : ''}
          </span>
        </HoldCard>
        <FaceGrid
          faces={faces}
          selected={chosen}
          me={view.me.id}
          meLabel={L('You')}
          label={L('Choose someone')}
          onPick={(id) => {
            const why = refusal(view, id, L);
            if (why) {
              setRefused({ id, text: why, n: (refused?.n ?? 0) + 1 });
              buzz([40, 60, 40]);
              play('error', { gain: 0.5 });
              return;
            }
            setRefused(null);
            setSent({ day: view.day, id });
            send({ type: 'night', target: id });
          }}
        />
        <p
          key={refused ? `r${refused.n}` : 'ok'}
          className={`${styles.status} ${refused ? styles.refused : ''}`}
          aria-live="polite"
        >
          {refused
            ? refused.text
            : chosen
              ? L('Chosen: {name} · tap another to change', { name: nameOf(view.players, chosen) })
              : L('Tap a face. Nobody can see what it means.')}
        </p>
      </div>
    </Screen>
  );
}
