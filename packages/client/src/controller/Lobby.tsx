// Lobby on the phone: who is here (bots included, with ✕ on the ones you may remove), a
// "＋ Add a bot" chip at the end of the grid (ADR-028), and for the VIP the button that opens
// game selection. I-792 E (design review): people first — a title row "Lobby · 6 of 16" with
// Share and ⋯ (Leave, 🎨 setup and the guest's nudge live there), the roster straight after as a
// two-column grid, and every tip reduced to one rotating line under it.
import { useState } from 'react';
import type { JSX } from 'react';
import { MAX_BOTS_PER_OWNER } from '@partybox/shared';
import type { PlayerPublic, RoomSnapshot } from '@partybox/shared';
import { PlayerChip, PrimaryButton, Screen } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import { lobbyStrings } from '../i18n-join';
import type { Controller } from '../net/controller';
import type { SoundEngine } from '../sound';
import styles from './Lobby.module.css';
import { LobbyLine } from './LobbyLine';
import type { LobbyLineItem } from './LobbyLine';
import { LobbyMore } from './LobbyMore';
import { ShareButton } from './ShareSheet';
import { VoteRow, tallyLine, voteLeader } from './VoteRow';
import { useCatalog } from '../catalog';
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
  const vipName = room.players.find((p) => p.isVip)?.name ?? null;
  // I-082 A: the VIP's tips — first hosted room only; ✕ ends them for good. I-792 E: they rotate
  // in the one line with the room's other hints.
  const [tipsOn, setTipsOn] = useState(() => !tipsSeen());
  // I-082 B: tips retire as the VIP learns them.
  const hasBot = room.players.some((p) => p.bot);
  const tips = VIP_TIPS.filter((tip) => !(tip.id === 'bots' && hasBot));
  const tally = me.isVip ? tallyLine(room) : null;
  const lines: LobbyLineItem[] = me.isVip
    ? [
        ...(tally ? [{ id: 'tally', text: `🙋 ${tally}` }] : []),
        { id: 'in', text: t.lobbyTop.everyoneIn },
        ...(tipsOn ? tips.map((tip) => ({ id: tip.id, text: t.tips[tip.id], tip: true })) : []),
      ]
    : [
        { id: 'wait', text: lobbyStrings().waitingForVip },
        { id: 'bots', text: t.lobby.addBotHint },
      ];
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
  const { games } = useCatalog();
  const first = games[0];
  const leader = voteLeader(room, games);
  // Part 00 §1.3: the list opens with nothing chosen (the room's favourites sort first there).
  const pick = (): void => controller.vip({ action: 'selectGame', gameId: null });
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
          <span className={styles.headCount}>
            {t.lobbyTop.count(room.players.length, room.capacity)}
            {room.locked ? ` · 🔒` : ''}
          </span>
          {/* The owner (2026-09-22): Share is a pill in the corner, and there is a way out (⋯). */}
          <ShareButton code={room.code} />
          <LobbyMore
            controller={controller}
            nudgeName={!me.isVip ? vipName : null}
            onSetup={onSetup}
          />
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
      {room.locked ? <p className={`pb-caption ${styles.count}`}>{t.lobby.locked}</p> : null}
      <ul key={room.players.length} className={styles.list} aria-label={t.lobby.playersList}>
        {room.players.map((p, i) => {
          // The owner or the VIP may remove a bot (ADR-028): one tap, no confirm — re-adding is one tap too.
          const removable = p.bot !== undefined && (p.bot.ownerId === me.id || me.isVip);
          return (
            <li
              key={p.id}
              className={`${styles.item} ${poofing === p.id ? styles.poof : ''} ${styles.settle} ${p.id === me.id ? styles.mine : ''}`}
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
                compact
                onRemove={removable ? () => poof(p.id) : undefined}
                removeLabel={`${t.lobby.removeBot} ${p.name}`}
                size="sm"
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
            {addLabel}
          </button>
        </li>
      </ul>
      {me.isVip ? (
        // Owner 2026-09-24: rooms start phone-only; the VIP sees it and can hand the stage to a TV.
        <p className={styles.stageRow}>
          <span>{room.phoneOnly ? t.lobbyTop.playingOnPhones : t.lobbyTop.playingOnTv}</span>
          <button
            type="button"
            className={styles.stageSwitch}
            onClick={() => controller.vip({ action: 'setPhoneOnly', on: !room.phoneOnly })}
          >
            {room.phoneOnly ? t.lobbyTop.useTv : t.lobbyTop.usePhones}
          </button>
        </p>
      ) : null}
      <LobbyLine
        lines={lines}
        onDismissTips={
          me.isVip && tipsOn
            ? () => {
                setTipsSeen(true);
                setTipsOn(false);
              }
            : undefined
        }
      />
      {/* I-650 A: guests vote for the next game; the VIP sees the tally (in the line above) */}
      {!me.isVip ? <VoteRow controller={controller} room={room} me={me} /> : null}
    </Screen>
  );
}
