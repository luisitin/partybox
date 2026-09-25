// ADR-053 on a phone: the start stage. The chosen game's three steps, all visible (nothing lights
// up or hides on a timer, so a slow reader is never cut off), a sticky READY with who the room is
// still waiting for above it; the VIP's READY turns into Start now, and ‹ Back sits above the game.
// Then the 3·2·1 over the rules (the VIP can Wait), from the server clock: the TV's frame.
import { useCallback, useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import type { PlayerPublic, RoomSnapshot } from '@partybox/shared';
import { PrimaryButton, Screen, useLang } from '@partybox/game-sdk/ui';
import type { SoundCue } from '@partybox/game-sdk/ui';
import { gameEntry, useAbout } from '../catalog';
import { t } from '../i18n';
import type { Controller } from '../net/controller';
import { StageCount } from '../StageCount';
import styles from './StartStage.module.css';

/** Who the room still waits for, as the line above READY says it (never "you": the button does). */
export function waitingLine(room: RoomSnapshot, meId: string): string {
  const stage = room.starting;
  if (!stage) return '';
  const waiting = room.players.filter(
    (p) => p.connected && !p.bot && !stage.ready.includes(p.id) && p.id !== meId,
  );
  const iAmReady = stage.ready.includes(meId);
  if (stage.held) return t.stage.held;
  if (waiting.length === 0) return iAmReady ? t.stage.everyoneReady : t.stage.everyoneElseReady;
  const names = waiting.slice(0, 2).map((p) => p.name);
  return t.stage.waitingFor(names, waiting.length - names.length);
}

export function StartStage({
  controller,
  room,
  me,
  audio,
}: {
  controller: Controller;
  room: RoomSnapshot;
  me: PlayerPublic;
  audio?: { play(cue: SoundCue): void };
}): JSX.Element | null {
  const lang = useLang();
  const stage = room.starting;
  const about = useAbout(stage?.gameId, lang);
  // the count's cue on this phone only where the phone carries the room's sound (ADR-047 ruling
  // 14, S-005): a phone-only room or a player who can't see the TV
  const carries = room.phoneOnly || me.canSeeTv === false;
  const onNumber = useCallback(() => {
    if (carries) audio?.play('countdown');
  }, [carries, audio]);
  // Reviewer D1: READY is only offered once the last step has been on screen. While it is below the
  // fold (an SE, 200 % text) the button says so and a tap scrolls to it; where all three fit, the
  // end is seen at once and nothing changes.
  const end = useRef<HTMLDivElement>(null);
  // (no IntersectionObserver, e.g. a render test: nothing to watch, READY at once)
  const [seenAll, setSeenAll] = useState(() => typeof IntersectionObserver === 'undefined');
  useEffect(() => {
    const el = end.current;
    if (!el || seenAll) return undefined;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) setSeenAll(true);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [seenAll, about]);
  const game = gameEntry(stage?.gameId);
  if (!stage || !game) return null;
  const iAmReady = stage.ready.includes(me.id);
  const counting = stage.countdownAt !== null;
  // One line and one button for everyone, so the steps keep the screen: READY, then (the VIP)
  // Start now with "✓ Ready · Waiting for Maya" above it, or (a guest) the done button. After the
  // VIP's Wait it is Start now at once, READY or not (one tap to go again).
  const vipStarts = me.isVip && !counting && (iAmReady || stage.held === true);
  const line = vipStarts
    ? stage.held
      ? t.stage.heldVip
      : `✓ ${t.stage.youAreReady} · ${waitingLine(room, me.id)}`
    : waitingLine(room, me.id);
  return (
    <>
      <Screen
        footer={
          <div className={styles.footer}>
            <p className={styles.waiting} role="status">
              {line}
            </p>
            {vipStarts ? (
              <PrimaryButton
                title={t.stage.startNowHint}
                onClick={() => controller.vip({ action: 'startNow' })}
              >
                ▶ {t.stage.startNow}
              </PrimaryButton>
            ) : (
              <PrimaryButton
                done={iAmReady || counting}
                tone={iAmReady ? 'success' : 'accent'}
                onClick={() =>
                  iAmReady || seenAll || counting
                    ? controller.ready()
                    : end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
                }
              >
                {iAmReady
                  ? t.stage.youAreReady
                  : seenAll || counting
                    ? t.stage.ready
                    : t.stage.readAll}
              </PrimaryButton>
            )}
          </div>
        }
      >
        <div className={styles.stage}>
          {me.isVip && !counting ? (
            <button
              type="button"
              className={styles.back}
              onClick={() => controller.vip({ action: 'back' })}
            >
              {t.stage.back}
            </button>
          ) : null}
          <div className={styles.head}>
            <span className={styles.tile} aria-hidden>
              {game.icon}
            </span>
            <h2 className={styles.name}>{game.name}</h2>
          </div>
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
          {/* the end of the rules: READY is offered once this has been on screen */}
          {about ? <div ref={end} className={styles.end} aria-hidden /> : null}
        </div>
      </Screen>
      <StageCount
        at={stage.countdownAt}
        surface="phone"
        onNumber={onNumber}
        action={
          me.isVip ? (
            <button type="button" onClick={() => controller.vip({ action: 'pause' })}>
              {t.stage.wait}
            </button>
          ) : undefined
        }
      />
    </>
  );
}
