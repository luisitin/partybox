// Phone during `guess` (SPEC §4.4): the answer at the top, "Who said it?", the faces of everyone
// seated except you. Identical for every player — the author too (§4.5): same header, same grid,
// same haptic (the shell's accept buzz). A tap sends at once and shows ✓; another tap changes it.
import { useState } from 'react';
import type { JSX } from 'react';
import { Screen, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { WsPhoneView } from '../server/views';
import { FacePicker } from './FacePicker';
import type { Face } from './FacePicker';
import { STRINGS } from './strings';
import styles from './phone.module.css';

export function PhoneGuess({ view, send }: GameControllerProps<WsPhoneView, Input>): JSX.Element {
  const L = useT(STRINGS);
  // The tap shows at once; the server's confirmation (myGuess) takes over when it lands.
  const [tapped, setTapped] = useState<{ card: number; id: string } | null>(null);
  const card = view.card;
  const number = card?.number ?? 0;
  const mine = tapped && tapped.card === number ? tapped.id : null;
  const picked = view.myGuess ?? mine;
  const byId = new Map(view.players.map((p) => [p.id, p]));
  const faces: Face[] = view.candidates
    .map((id) => byId.get(id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined)
    .map((p) => ({ id: p.id, name: p.name, avatarId: p.avatarId, connected: p.connected }));
  return (
    <Screen
      className={styles.guessScreen}
      footer={
        <p className={styles.guessFoot} role="status">
          {picked
            ? L('Picked {name} · tap another face to change', {
                name: byId.get(picked)?.name ?? '',
              })
            : L('Tap who you think wrote it')}
        </p>
      }
    >
      <p className={styles.kicker}>
        {L('Who said it?')}
        {card ? ` · ${L('Answer {n} of {total}', { n: card.number, total: card.count })}` : ''}
      </p>
      <div key={number} className={styles.quote}>
        <p className={styles.quoteText}>{card?.text ?? ''}</p>
      </div>
      <FacePicker
        faces={faces}
        picked={picked}
        label={L('Who said it?')}
        itemLabel={(f, on) => (on ? L('{name}, picked', { name: f.name }) : L('Pick {name}', { name: f.name }))} // prettier-ignore
        onPick={(id) => {
          setTapped({ card: number, id });
          send({ type: 'guess', target: id });
        }}
      />
    </Screen>
  );
}
