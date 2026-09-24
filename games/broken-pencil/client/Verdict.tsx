// The verdict on a book's last page (TV). I-512 A: the last guess shows alone first and the verdict
// lands a beat later: 2.5 s, or 3.5 s for an UNBROKEN book (the rarer reveal). The server holds the
// presenter's Next for as long (VERDICT_BEAT_MS / VERDICT_BEAT_INTACT_MS in server/types.ts).
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { PageView, PencilTvView } from '../server/views';
import { STRINGS } from './strings';
import styles from './Tv.module.css';

type Showing = NonNullable<PencilTvView['showing']>;

/** Its children appear after `ms`: a beat for the room to read the guess first. */
function Beat({ ms, children }: { ms: number; children: JSX.Element }): JSX.Element | null {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const h = setTimeout(() => setOn(true), ms);
    return () => clearTimeout(h);
  }, [ms]);
  return on ? children : null;
}

export function Verdict({
  showing: s,
  current,
}: {
  showing: Showing;
  current: PageView | undefined;
}): JSX.Element {
  const L = useT(STRINGS);
  return (
    <Beat key={s.book} ms={s.verdict === 'intact' ? 3500 : 2500}>
      <div
        className={`${styles.verdict} ${s.verdict === 'intact' ? styles.intact : styles.broken} pb-enter`}
      >
        {/* The server picks the line (content/lines.json, or the VIP's "close enough"): it
            arrives in English and shows through the table. */}
        <span className={styles.verdictLine}>
          {s.verdictLine === null ? null : L.sent(s.verdictLine)}
        </span>
        <span className={styles.verdictPair}>
          “{s.pages[0]?.kind === 'word' ? s.pages[0].text : '—'}” → “
          {current?.kind === 'guess' ? (current.text ?? '???') : '—'}”
        </span>
      </div>
    </Beat>
  );
}
