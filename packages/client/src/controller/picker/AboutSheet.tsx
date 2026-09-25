// A game's About (Part 00 §1.4): a bottom sheet — at most 85 % of the screen, scrolling inside —
// that closes by a swipe down on its handle, ✕, a tap outside or Escape, and slides away instead of
// vanishing. Its words come from the host (`about`, ≤ 2 KB, no game code); until they land a
// placeholder the height of the steps holds the layout still. The VIP's bar chooses the game (or
// offers the one-tap bot fix); everyone else's suggests it (the I-650 vote, ruling 2).
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { JSX, PointerEvent } from 'react';
import type { CatalogEntry, PlayerPublic, RoomSnapshot } from '@partybox/shared';
import { MAX_BOTS_PER_OWNER } from '@partybox/shared';
import { PrimaryButton, usePrefersReducedMotion } from '@partybox/game-sdk/ui';
import { taglineOf, useAbout } from '../../catalog';
import { t } from '../../i18n';
import type { Controller } from '../../net/controller';
import { fixLabel, runFix, startFix } from '../../startFix';
import { fitOf } from './model';
import styles from './picker.module.css';

const CLOSE_AFTER_PX = 80;
const LEAVE_MS = 300;

export interface AboutSheetProps {
  game: CatalogEntry;
  room: RoomSnapshot;
  me: PlayerPublic;
  lang: string;
  minutes: number;
  controller: Controller;
  onClose: () => void;
  onChoose: () => void;
}

export function AboutSheet(p: AboutSheetProps): JSX.Element {
  const { game, room, me, lang } = p;
  const about = useAbout(game.id, lang);
  const reduced = usePrefersReducedMotion();
  const [leaving, setLeaving] = useState(false);
  const [drag, setDrag] = useState<{ y0: number; t0: number; dy: number } | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const close = (): void => {
    if (leaving) return;
    if (reduced) return p.onClose();
    setLeaving(true);
    setTimeout(p.onClose, LEAVE_MS);
  };
  useEffect(() => {
    closeButton.current?.focus({ preventScroll: true });
    const key = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per sheet
  }, []);
  const down = (e: PointerEvent<HTMLDivElement>): void => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ y0: e.clientY, t0: e.timeStamp, dy: 0 });
  };
  const move = (e: PointerEvent<HTMLDivElement>): void => {
    if (drag) setDrag({ ...drag, dy: Math.max(0, e.clientY - drag.y0) });
  };
  const up = (e: PointerEvent<HTMLDivElement>): void => {
    if (!drag) return;
    const fast = drag.dy / Math.max(1, e.timeStamp - drag.t0) > 0.5;
    setDrag(null);
    if (drag.dy > CLOSE_AFTER_PX || (fast && drag.dy > 24)) close();
  };

  const fit = fitOf(game, room);
  const mine = room.votes?.[me.id] === game.id;
  const myBots = room.players.filter((pl) => pl.bot?.ownerId === me.id).length;
  const fix = !fit.ok && me.isVip ? startFix(room, game, MAX_BOTS_PER_OWNER - myBots) : null;
  const titleId = `about-${game.id}`;
  // A portal at the document's root: above the screen's own layers (its "▾ more" pill sat on the
  // Suggest button on a 320 px phone) and clear of any transform an ancestor is animating.
  return createPortal(
    <div
      className={`${styles.backdrop} ${leaving ? styles.backdropLeaving : ''}`}
      onClick={close}
      role="presentation"
    >
      <div
        className={`${styles.sheet} ${leaving ? styles.sheetLeaving : ''} ${drag ? styles.dragging : ''}`}
        style={drag ? { ['--drag' as string]: `${drag.dy}px` } : undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={styles.grab}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={() => setDrag(null)}
        >
          <span className={styles.tile} aria-hidden>
            {game.icon}
          </span>
          <span className={styles.sheetTitle}>
            <h2 id={titleId} className={styles.name}>
              {game.name}
            </h2>
            <span className={styles.tagline}>{taglineOf(game, lang)}</span>
          </span>
          <button
            ref={closeButton}
            type="button"
            className={styles.close}
            onClick={close}
            aria-label={t.picker.close}
          >
            ✕
          </button>
        </div>
        <div className={styles.sheetBody}>
          <p className={styles.badges}>
            <span>{t.picker.players(game.minPlayers, game.maxPlayers)}</span>
            <span>{t.picker.minutes(p.minutes)}</span>
            <span>{game.supportsBots ? `🤖 ${t.picker.botsYes}` : t.picker.botsNo}</span>
            <span>{t.picker.presence[game.presence]}</span>
          </p>
          <section>
            <h3 className={styles.label}>{t.picker.howToPlay}</h3>
            {about ? (
              <ol className={styles.steps}>
                {about.howToPlay.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            ) : (
              <div className={styles.wait} aria-label={t.picker.loading} />
            )}
          </section>
          {about ? <p className={styles.description}>{about.description}</p> : null}
          <section>
            <h3 className={styles.label}>{t.picker.goodToKnow}</h3>
            <dl className={styles.facts}>
              <dt>{t.picker.rowPlayers}</dt>
              <dd>{t.picker.playersRange(game.minPlayers, game.maxPlayers)}</dd>
              <dt>{t.picker.rowLength}</dt>
              <dd>{t.picker.aboutMinutes(p.minutes)}</dd>
              <dt>{t.picker.rowBots}</dt>
              <dd>{game.supportsBots ? t.picker.botsYes : t.picker.botsNo}</dd>
              <dt>{t.picker.rowWhere}</dt>
              <dd>{t.picker.where[game.presence]}</dd>
            </dl>
          </section>
        </div>
        <div className={styles.sheetFooter}>
          {me.isVip ? (
            <>
              {fix ? (
                <PrimaryButton
                  tone="neutral"
                  onClick={() => runFix(fix, (a) => p.controller.bot(a))}
                >
                  {fix.kind === 'remove' ? '✕' : '🤖'} {fixLabel(fix, t.fix)}
                </PrimaryButton>
              ) : null}
              <PrimaryButton onClick={p.onChoose} disabled={!fit.ok}>
                {t.picker.chooseThis}
              </PrimaryButton>
            </>
          ) : (
            <PrimaryButton
              tone={mine ? 'neutral' : 'accent'}
              aria-pressed={mine}
              onClick={() => p.controller.vote(mine ? null : game.id)}
            >
              {mine ? `${t.picker.suggested} ✓` : t.picker.suggest}
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
