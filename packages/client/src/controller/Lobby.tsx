// Lobby on the phone: who is here (bots included, with ✕ on the ones you may remove), a
// "＋ Add a bot" chip at the end of the grid (ADR-028), and for the VIP the button that opens
// game selection.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { MAX_BOTS_PER_OWNER } from '@partybox/shared';
import type { PlayerPublic, RoomSnapshot } from '@partybox/shared';
import { PlayerChip, PrimaryButton, Screen } from '@partybox/game-sdk/ui';
import { lobbyStrings, t } from '../i18n';
import type { Controller } from '../net/controller';
import type { SoundEngine } from '../sound';
import styles from './Lobby.module.css';
import { VIP_TIPS, setTipsSeen, tipsSeen } from './vipTips';

/** The room's join link (`?room=CODE`, I-041) on the origin THIS phone reached the room by — a
 *  phone that came in through the tunnel shares the tunnel address, one on the Wi-Fi the LAN one. */
function joinLink(code: string): string {
  return `${window.location.origin}/?room=${code}`;
}

/** Share the link: the clipboard AND the phone's share sheet (the owner, 2026-09-21: "copy it to
 *  my clipboard AND pull up the window"). Both start inside the tap — iOS opens the sheet only
 *  from a user gesture, so the copy must not be awaited first. */
async function shareLink(url: string, code: string): Promise<'shared' | 'copied' | 'failed'> {
  const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
  const copied = navigator.clipboard?.writeText(url).then(
    () => true,
    () => false,
  );
  let shared = false;
  if (nav.share) {
    try {
      await nav.share({ title: 'PartyBox', text: `Join my PartyBox room ${code}`, url });
      shared = true;
    } catch {
      // dismissed, or no sheet after all
    }
  }
  const ok = (await copied) ?? false;
  return shared ? 'shared' : ok ? 'copied' : 'failed';
}

export interface LobbyProps {
  controller: Controller;
  /** I-074 B: the phone's own sound engine (a quiet `leave` as a bot puffs). */
  audio?: SoundEngine | null;
  /** S-003 B: opens the phone's 🎨 sheet. */
  onSetup?: () => void;
  room: RoomSnapshot;
  me: PlayerPublic;
}

export function Lobby({ controller, room, me, audio, onSetup }: LobbyProps): JSX.Element {
  // I-070 A: one nudge per 20 s from this phone (the server throttles too).
  const [nudgedAt, setNudgedAt] = useState<number | null>(null);
  const vipName = room.players.find((p) => p.isVip)?.name ?? null;
  // The owner (2026-09-21): a "share" in the lobby — the join link straight to this room.
  // I-082 A: the tips strip — first hosted room only; rotates every 5 s; ✕ ends it for good.
  const [tipsOn, setTipsOn] = useState(() => !tipsSeen());
  const [tipIndex, setTipIndex] = useState(0);
  // I-082 B: tips retire as the VIP learns them.
  const hasBot = room.players.some((p) => p.bot);
  const tips: readonly { id: string; text: string }[] = VIP_TIPS.filter(
    (tip) => !(tip.id === 'bots' && hasBot),
  );
  useEffect(() => {
    if (!tipsOn || !me.isVip || tips.length === 0) return undefined;
    const h = setInterval(() => setTipIndex((i) => i + 1), 5000);
    return () => clearInterval(h);
  }, [tipsOn, me.isVip, tips.length]);
  const tip = tips.length > 0 ? tips[tipIndex % tips.length] : undefined;
  const [shared, setShared] = useState<'shared' | 'copied' | 'failed' | null>(null);
  const share = async (): Promise<void> => {
    const result = await shareLink(joinLink(room.code), room.code);
    setShared(result);
    setTimeout(() => setShared(null), 2500);
  };
  // I-074 A: a removed bot puffs out before the remove is sent (450 ms, one poof at a time).
  const [poofing, setPoofing] = useState<string | null>(null);
  const poof = (botId: string): void => {
    if (poofing) return;
    setPoofing(botId);
    audio?.play('leave', { quiet: true });
    setTimeout(() => {
      controller.bot({ action: 'remove', botId });
      setPoofing(null);
    }, 450);
  };
  const first = room.games[0];
  const pick = (): void => {
    if (first) controller.vip({ action: 'selectGame', gameId: first.id });
  };
  const myBots = room.players.filter((p) => p.bot?.ownerId === me.id);
  const full = room.players.length >= room.capacity;
  const maxed = myBots.length >= MAX_BOTS_PER_OWNER;
  const canAddBot = !maxed && !full;
  const addLabel = full ? t.lobby.full : maxed ? t.lobby.botsMaxed : lobbyStrings().addBot;
  return (
    <Screen
      title={t.lobby.title}
      footer={
        me.isVip ? (
          <PrimaryButton onClick={pick} disabled={!first}>
            {t.lobby.pickGame}
          </PrimaryButton>
        ) : undefined
      }
    >
      <p className="pb-muted">{me.isVip ? t.lobby.youAreVip : lobbyStrings().waitingForVip}</p>
      {me.isVip && tipsOn && tip ? (
        <p key={tip.id} className={styles.tip} role="status">
          <span aria-hidden>💡</span> {tip.text}
          <button
            type="button"
            className={styles.tipClose}
            aria-label="dismiss tips"
            onClick={() => {
              setTipsSeen(true);
              setTipsOn(false);
            }}
          >
            ✕
          </button>
        </p>
      ) : null}
      {/* I-070 A: something to tap while you wait — a rate-limited nudge to the VIP. */}
      {!me.isVip && vipName ? (
        <button
          type="button"
          className={`${styles.setup} ${styles.nudge}`}
          disabled={nudgedAt !== null}
          onClick={() => {
            controller.nudge();
            setNudgedAt(Date.now());
            setTimeout(() => setNudgedAt(null), 20_000);
          }}
        >
          {nudgedAt !== null ? '👋 Nudged' : `👋 Hurry up, ${vipName}!`}
        </button>
      ) : null}
      <div className={styles.pills}>
        {/* The join link, straight to this room: the share sheet where the phone has one. */}
        <button type="button" className={styles.setup} onClick={() => void share()}>
          {shared === 'copied'
            ? '✓ Link copied'
            : shared === 'shared'
              ? '✓ Shared · link copied'
              : shared === 'failed'
                ? `Room ${room.code} — ${joinLink(room.code).replace(/^https?:\/\//, '')}`
                : '🔗 Share the room link'}
        </button>
        {/* S-003 B: set up your phone while you wait — opens the 🎨 sheet. */}
        <button type="button" className={styles.setup} onClick={onSetup}>
          🎨 Set up your phone while you wait
        </button>
      </div>
      <p className={`pb-caption ${styles.count}`}>
        {t.lobby.players(room.players.length, room.capacity)}
        {room.locked ? ` · ${t.lobby.locked}` : ''}
      </p>
      <ul key={room.players.length} className={styles.list} aria-label="players">
        {room.players.map((p, i) => {
          // The owner or the VIP may remove a bot (ADR-028): one tap, no confirm — re-adding is one tap too.
          const removable = p.bot !== undefined && (p.bot.ownerId === me.id || me.isVip);
          return (
            <li
              key={p.id}
              className={`${styles.item} ${poofing === p.id ? styles.poof : ''} ${styles.settle}`}
              style={{ ['--pb-i' as string]: i }}
            >
              {poofing === p.id ? (
                <span className={styles.bits} aria-hidden>
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              ) : null}
              <PlayerChip
                name={p.name}
                avatarId={p.avatarId}
                connected={p.connected}
                isVip={p.isVip}
                isBot={p.bot !== undefined}
                status={p.spectator ? 'spectator' : 'active'}
                isMe={p.id === me.id}
                onRemove={removable ? () => poof(p.id) : undefined}
                removeLabel={`${t.lobby.removeBot} ${p.name}`}
              />
            </li>
          );
        })}
        <li>
          <button
            type="button"
            className={styles.addBot}
            onClick={() => controller.bot({ action: 'add' })}
            disabled={!canAddBot}
            aria-label={t.lobby.addBot}
          >
            <span className={styles.addBotPlus} aria-hidden>
              ＋
            </span>
            🤖 {addLabel}
          </button>
        </li>
      </ul>
      <p className="pb-caption pb-muted">{t.lobby.addBotHint}</p>
    </Screen>
  );
}
