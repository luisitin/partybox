// Lobby on the phone: who is here (bots included, with ✕ on the ones you may remove), a
// "＋ Add a bot" chip at the end of the grid (ADR-028), and for the VIP the button that opens
// game selection.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { MAX_BOTS_PER_OWNER } from '@partybox/shared';
import type { PlayerPublic, RoomSnapshot } from '@partybox/shared';
import { PlayerChip, PrimaryButton, Screen } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import { lobbyStrings } from '../i18n-join';
import type { Controller } from '../net/controller';
import type { SoundEngine } from '../sound';
import styles from './Lobby.module.css';
import { ShareButton } from './ShareSheet';
import { VoteRow, tallyLine, voteLeader } from './VoteRow';
import { VIP_TIPS, setTipsSeen, tipsSeen } from './vipTips';

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
  // I-082 A: the tips strip — first hosted room only; rotates every 5 s; ✕ ends it for good.
  const [tipsOn, setTipsOn] = useState(() => !tipsSeen());
  const [tipIndex, setTipIndex] = useState(0);
  // Leaving is one tap to arm, one to go (the ★ menu's confirm shape) — it drops the session and
  // lands back on the join screen, where the room list and "open a new room" live.
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (!leaving) return undefined;
    const h = setTimeout(() => setLeaving(false), 3000);
    return () => clearTimeout(h);
  }, [leaving]);
  // I-082 B: tips retire as the VIP learns them.
  const hasBot = room.players.some((p) => p.bot);
  const tips = VIP_TIPS.filter((tip) => !(tip.id === 'bots' && hasBot));
  useEffect(() => {
    if (!tipsOn || !me.isVip || tips.length === 0) return undefined;
    const h = setInterval(() => setTipIndex((i) => i + 1), 5000);
    return () => clearInterval(h);
  }, [tipsOn, me.isVip, tips.length]);
  const tip = tips.length > 0 ? tips[tipIndex % tips.length] : undefined;
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
  // I-650 B: the picker opens on the room's favourite (the VIP can still pick any game)
  const leader = voteLeader(room);
  const pick = (): void => {
    const gameId = leader?.id ?? first?.id;
    if (gameId) controller.vip({ action: 'selectGame', gameId });
  };
  const myBots = room.players.filter((p) => p.bot?.ownerId === me.id);
  const full = room.players.length >= room.capacity;
  const maxed = myBots.length >= MAX_BOTS_PER_OWNER;
  const canAddBot = !maxed && !full;
  const addLabel = full ? t.lobby.full : maxed ? t.lobby.botsMaxed : lobbyStrings().addBot;
  return (
    <Screen
      title={
        <span className={styles.head}>
          <span className={styles.headTitle}>{t.lobby.title}</span>
          <span className={styles.headPills}>
            {/* The owner (2026-09-22): Share is a pill in the corner, and there is a way out. */}
            <button
              type="button"
              className={styles.leavePill}
              onClick={() => {
                if (leaving) controller.leave();
                else setLeaving(true);
              }}
            >
              {leaving ? t.lobby.leaveConfirm : t.lobby.leave}
            </button>
            <ShareButton code={room.code} />
          </span>
        </span>
      }
      footer={
        me.isVip ? (
          <PrimaryButton onClick={pick} disabled={!first}>
            {t.lobby.pickGame}
            {leader ? (
              <small className={styles.leads}>{t.vote.leads(leader.name, leader.votes)}</small>
            ) : null}
          </PrimaryButton>
        ) : undefined
      }
    >
      <p className="pb-muted">{me.isVip ? t.lobby.youAreVip : lobbyStrings().waitingForVip}</p>
      {/* I-650 A: guests vote for the next game; the VIP sees the tally */}
      {!me.isVip ? <VoteRow controller={controller} room={room} me={me} /> : null}
      {me.isVip && tallyLine(room) ? (
        <p className={styles.tally}>
          <span aria-hidden>🙋</span> {tallyLine(room)}
        </p>
      ) : null}
      {me.isVip && tipsOn && tip ? (
        <p key={tip.id} className={styles.tip} role="status">
          <span aria-hidden>💡</span> {t.tips[tip.id]}
          <button
            type="button"
            className={styles.tipClose}
            aria-label={t.lobby.dismissTips}
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
          {nudgedAt !== null ? t.lobby.nudged : t.lobby.nudge(vipName)}
        </button>
      ) : null}
      {/* S-003 B: set up your phone while you wait — opens the 🎨 sheet. */}
      <button type="button" className={styles.setup} onClick={onSetup}>
        {t.lobby.setup}
      </button>
      <p className={`pb-caption ${styles.count}`}>
        {t.lobby.players(room.players.length, room.capacity)}
        {room.locked ? ` · ${t.lobby.locked}` : ''}
      </p>
      <ul key={room.players.length} className={styles.list} aria-label={t.lobby.playersList}>
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
