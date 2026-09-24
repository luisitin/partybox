// Everyone but the VIP, once a game is chosen (Part 00 §1.3): what the VIP picked and how it plays,
// while they tune it — so a guest reads the rules before the game starts instead of a bare wait.
// One column that fits a 320 × 568 phone: the game's tile, the line, the tagline, the three steps.
import type { JSX } from 'react';
import type { RoomSnapshot } from '@partybox/shared';
import { Screen, WaitingScreen, useLang } from '@partybox/game-sdk/ui';
import { gameEntry, taglineOf, useAbout } from '../../catalog';
import { t } from '../../i18n';
import styles from './picker.module.css';

export function GuestChosen({ room }: { room: RoomSnapshot }): JSX.Element {
  const lang = useLang();
  const game = gameEntry(room.selectedGameId);
  const about = useAbout(room.selectedGameId, lang);
  const vip = room.players.find((p) => p.isVip)?.name ?? t.selecting.theVip;
  if (!game) return <WaitingScreen title={t.selecting.vipChoosing(vip)} mood="wait" />;
  return (
    <Screen>
      <div className={styles.guest} role="status">
        <span className={`${styles.tile} ${styles.tileBig}`} aria-hidden>
          {game.icon}
        </span>
        <h2 className={styles.chosenName}>{t.picker.guestChosen(vip, game.name)}</h2>
        <p className={styles.chosenTagline}>{taglineOf(game, lang)}</p>
        {about ? (
          <ol className={`${styles.steps} ${styles.guestSteps}`} aria-label={t.picker.howToPlay}>
            {about.howToPlay.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        ) : (
          <div className={`${styles.wait} ${styles.guestSteps}`} aria-label={t.picker.loading} />
        )}
        <p className={styles.guestWait}>{t.picker.guestWaiting(vip)}</p>
      </div>
    </Screen>
  );
}
