// Lobby on the phone: who is here (bots included, with ✕ on the ones you may remove), a
// "＋ Add a bot" chip at the end of the grid (ADR-028), and for the VIP the button that opens
// game selection.
import { useState } from 'react';
import type { JSX } from 'react';
import { MAX_BOTS_PER_OWNER } from '@partybox/shared';
import type { PlayerPublic, RoomSnapshot } from '@partybox/shared';
import { PlayerChip, PrimaryButton, Screen } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import type { Controller } from '../net/controller';
import type { SoundEngine } from '../sound';
import styles from './Lobby.module.css';

/** The room's join link (`?room=CODE`, I-041) on the origin THIS phone reached the room by — a
 *  phone that came in through the tunnel shares the tunnel address, one on the Wi-Fi the LAN one. */
function joinLink(code: string): string {
  return `${window.location.origin}/?room=${code}`;
}

/** Share the link the way the phone can: the share sheet, else the clipboard. */
async function shareLink(url: string, code: string): Promise<'shared' | 'copied' | 'failed'> {
  const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
  if (nav.share) {
    try {
      await nav.share({ title: 'PartyBox', text: `Join my PartyBox room ${code}`, url });
      return 'shared';
    } catch {
      // dismissed, or the sheet refused: fall through to the clipboard
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    return 'failed';
  }
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
  // The owner (2026-09-21): a "share" in the lobby — the join link straight to this room.
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
  const addLabel = full ? t.lobby.full : maxed ? t.lobby.botsMaxed : t.lobby.addBot;
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
      <p className="pb-muted">{me.isVip ? t.lobby.youAreVip : t.lobby.waitingForVip}</p>
      <div className={styles.pills}>
        {/* The join link, straight to this room: the share sheet where the phone has one. */}
        <button type="button" className={styles.setup} onClick={() => void share()}>
          {shared === 'copied'
            ? '✓ Link copied'
            : shared === 'shared'
              ? '✓ Shared'
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
