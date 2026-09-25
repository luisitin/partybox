// The signature moments on the TV (SPEC §7.8), layered over the chamber: the sealed envelope that
// glides from the President to the Chancellor, the vote's ELECTED / REJECTED stamp after the
// placard wave, the Hitler check's silence then NOT HITLER or the mask, VETO, CHAOS, the decree
// dealt and turned before it slams into its slot, the CLASSIFIED folder, the brass plate passed
// in a special election, EXECUTED, and the front page. Cues land on their frames (useCueAt).
import { useEffect, useLayoutEffect, useState } from 'react';
import type { CSSProperties, JSX, RefObject } from 'react';
import { useSound, useT } from '@partybox/game-sdk/ui';
import type { SoundCue } from '@partybox/game-sdk/ui';
import type { ShTvView } from '../server/views';
import { MaskEmblem, Stamp } from './art';
import { PlateIcon } from './icons';
import { FlipCard } from './Card';
import { CREDIT } from './labels';
import { Newspaper } from './Newspaper';
import { STRINGS } from './strings';
import styles from './moments.module.css';

/** Plays a cue `delayMs` into a moment (the shell's cue plays at the phase change). */
function useCueAt(cue: SoundCue | null, delayMs: number, key: string): void {
  const play = useSound();
  useEffect(() => {
    if (!cue) return;
    const t = setTimeout(() => play(cue), delayMs);
    return () => clearTimeout(t);
  }, [cue, delayMs, key, play]);
}

/** The top centre of a seat's avatar, in the root's own (unscaled) pixels. */
function useSeatPoint(
  root: RefObject<HTMLElement | null>,
  id: string | null,
): { x: number; y: number } | null {
  const [at, setAt] = useState<{ id: string; x: number; y: number } | null>(null);
  useLayoutEffect(() => {
    if (!id) return;
    const measure = (): void => {
      // Read at measure time: a child's layout effect runs before the parent's ref is attached.
      const el = root.current;
      // The avatar, not the seat: the seat row keeps one height, so its top is empty space.
      const seat = el?.querySelector(`[data-seat="${CSS.escape(id)}"] [data-anchor]`);
      if (!el || !seat) return;
      const box = el.getBoundingClientRect();
      const scale = box.width / (el.offsetWidth || 1);
      const r = seat.getBoundingClientRect();
      setAt({ id, x: (r.left + r.width / 2 - box.left) / scale, y: (r.top - box.top) / scale });
    };
    // Measured on the next frame, once the seat row has laid out.
    const frame = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', measure);
    };
  }, [root, id]);
  // The last measured point stays while it travels to the next seat (the envelope glides).
  return id && at ? { x: at.x, y: at.y } : null;
}

type Point = { x: number; y: number };

/**
 * Stands at a seat; with `from`, it glides there from another seat as it appears (a keyframe
 * from the offset, so it plays even though the TV remounts per phase). `from` null: that seat
 * is not measured yet, so wait for it.
 */
function Traveler({
  at,
  from,
  children,
}: {
  at: Point | null;
  from?: Point | null;
  children: JSX.Element;
}): JSX.Element | null {
  if (!at || from === null) return null;
  const glide = from
    ? ({ '--dx': `${from.x - at.x}px`, '--dy': `${from.y - at.y}px` } as CSSProperties)
    : undefined;
  return (
    <div className={styles.traveler} style={{ transform: `translate(${at.x}px, ${at.y}px)` }}>
      <div className={styles.glide} data-glide={from ? true : undefined} style={glide}>
        {children}
      </div>
    </div>
  );
}

function StampAt({
  text,
  tone,
  delayMs,
  where = 'centre',
}: {
  text: string;
  tone: 'alarm' | 'brass' | 'liberal' | 'fascist' | 'ink';
  delayMs: number;
  where?: 'centre' | 'boards';
}): JSX.Element {
  return (
    <div className={styles.stampAt} data-where={where} style={{ animationDelay: `${delayMs}ms` }}>
      <Stamp text={text} tone={tone} className={styles.stamp} />
    </div>
  );
}

export function TvMoments({
  view,
  root,
}: {
  view: ShTvView;
  root: RefObject<HTMLDivElement | null>;
}): JSX.Element | null {
  const L = useT(STRINGS);
  const r = view.round;
  const phase = view.phaseId;
  const key = `${phase}:${r.n}:${r.power?.shown ? 1 : 0}`;
  const session = phase === 'presDraw' || phase === 'chanEnact' || phase === 'vetoAsk';
  const envelopeAt = useSeatPoint(
    root,
    session ? (phase === 'chanEnact' ? r.nominee : r.president) : null,
  );
  // The envelope leaves the President when it reaches the Chancellor (§7.8 moment 3).
  const envelopeFrom = useSeatPoint(root, phase === 'chanEnact' ? r.president : null);
  const p = r.power;
  const folderSeat =
    phase === 'powerReveal' && p?.kind === 'investigate'
      ? p.shown
        ? r.president
        : p.target
      : null;
  const folderAt = useSeatPoint(root, folderSeat);
  const plateSeat = phase === 'powerReveal' && p?.kind === 'special' ? p.target : null;
  const plateAt = useSeatPoint(root, plateSeat);
  const plateFrom = useSeatPoint(root, plateSeat ? r.president : null);
  const execSeat = phase === 'powerReveal' && p?.kind === 'execute' ? p.target : null;
  const execAt = useSeatPoint(root, execSeat);
  // The room darkens around one seat: the new Chancellor at the Hitler check, the executed.
  const spotSeat = phase === 'hitlerCheck' ? r.nominee : execSeat;
  const spotAt = useSeatPoint(root, spotSeat);

  const hitler = phase === 'hitlerCheck' && view.winner === 'fascists';
  const cue: Record<string, [SoundCue | null, number]> = {
    voteReveal: ['reveal', 500],
    hitlerCheck: [hitler ? 'fanfare' : 'tie', 2200],
    enactReveal: [r.enacted === 'L' ? 'cheer' : 'bust', 1300],
    chaos: ['sweep', 200],
    powerReveal: [p?.kind === 'execute' ? 'bust' : 'reveal', p?.kind === 'execute' ? 1400 : 300],
    vetoAsk: ['wager', 100],
  };
  const [c1, d1] = cue[phase] ?? [null, 0];
  useCueAt(c1, d1, key);
  useCueAt(phase === 'voteReveal' ? (r.elected ? 'cheer' : 'bust') : null, 2000, key);
  useCueAt(phase === 'voteReveal' && !r.elected ? 'lock' : null, 2600, key);
  useCueAt(phase === 'chaos' ? 'bust' : null, 1500, key);

  return (
    <div className={styles.moments} aria-hidden="true">
      {spotSeat && spotAt ? (
        <div
          className={styles.dimmer}
          style={{ '--x': `${spotAt.x}px`, '--y': `${spotAt.y + 32}px` } as CSSProperties}
        />
      ) : null}
      {session ? (
        <Traveler at={envelopeAt} from={phase === 'chanEnact' ? envelopeFrom : undefined}>
          <div className={styles.envelope} data-veto={phase === 'vetoAsk' || undefined}>
            <span className={styles.flap} />
            <span className={styles.wax} />
          </div>
        </Traveler>
      ) : null}
      {phase === 'vetoAsk' ? (
        <StampAt text={L('VETO REQUESTED')} tone="alarm" delayMs={100} where="boards" />
      ) : null}
      {phase === 'voteReveal' ? (
        <StampAt
          text={r.elected ? L('ELECTED') : L('REJECTED')}
          tone={r.elected ? 'brass' : 'alarm'}
          delayMs={1800}
        />
      ) : null}
      {phase === 'hitlerCheck' ? (
        hitler ? (
          <div className={styles.unmask} style={{ animationDelay: '2000ms' }}>
            <MaskEmblem size={260} />
          </div>
        ) : (
          <StampAt text={L('NOT HITLER')} tone="liberal" delayMs={2000} />
        )
      ) : null}
      {(phase === 'enactReveal' && r.enacted) || (phase === 'chaos' && r.chaosCard) ? (
        <div className={styles.decree} data-chaos={phase === 'chaos' || undefined}>
          <DelayedFlip party={(phase === 'chaos' ? r.chaosCard : r.enacted) ?? 'F'} />
        </div>
      ) : null}
      {phase === 'chaos' ? (
        <StampAt text={L('CHAOS')} tone="alarm" delayMs={400} where="boards" />
      ) : null}
      {phase === 'enactReveal' && view.headline ? (
        <div className={styles.paperAt}>
          <Newspaper headline={view.headline} session={r.n} delayMs={2300} />
        </div>
      ) : null}
      {folderSeat ? (
        <Traveler at={folderAt}>
          <div className={styles.folder}>
            <span>{L('CLASSIFIED')}</span>
          </div>
        </Traveler>
      ) : null}
      {plateSeat ? (
        <Traveler at={plateAt} from={plateFrom}>
          <div className={styles.plate}>
            <PlateIcon kind="president" size={26} /> {L('President')}
          </div>
        </Traveler>
      ) : null}
      {execSeat ? (
        <Traveler at={execAt}>
          <div className={styles.execute}>
            <Stamp text={L('EXECUTED')} tone="alarm" className={styles.stampSmall} />
          </div>
        </Traveler>
      ) : null}
      {phase === 'gameOver' && view.headline ? (
        <div className={styles.finale}>
          <Newspaper
            headline={view.headline}
            session={r.n}
            kicker={L('Final edition')}
            footer={L(CREDIT)}
            delayMs={2600}
          />
        </div>
      ) : null}
    </div>
  );
}

/** The decree arrives face-down, turns face-up, then hands over to the slot's own slam. */
function DelayedFlip({ party }: { party: 'L' | 'F' }): JSX.Element {
  const [up, setUp] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setUp(true), 450);
    return () => clearTimeout(t);
  }, []);
  return <FlipCard party={party} up={up} size="lg" />;
}
