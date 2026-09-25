// The chosen game on the VIP's phone (Part 00 §1.5): what it is, the room's switches (I-642, moved
// here from the list), "Game options (n) ▾" closed by default — its header carries the tuned line
// (I-763) — and a sticky Start that works at once with tonight's settings (ruling 9).
import { useState } from 'react';
import type { JSX } from 'react';
import type { PlayerPublic, RoomSnapshot } from '@partybox/shared';
import { MAX_BOTS_PER_OWNER } from '@partybox/shared';
import { PrimaryButton, Screen, useLang } from '@partybox/game-sdk/ui';
import { gameEntry, taglineOf, useGameText } from '../../catalog';
import { minutesFor } from '../../estimate';
import { t } from '../../i18n';
import { gameText } from '../../i18n-games';
import { keySetting } from '../../keySetting';
import type { Controller } from '../../net/controller';
import { serverText } from '../../server-text';
import { SettingField } from '../../SettingField';
import { fixLabel, runFix, startFix } from '../../startFix';
import selecting from '../Selecting.module.css';
import { tunedLine, tunedSettings } from '../tunedLine';
import { PresenceNotice } from './PresenceNotice';
import styles from './picker.module.css';

export interface ChosenGameProps {
  controller: Controller;
  room: RoomSnapshot;
  me: PlayerPublic;
}

export function ChosenGame({ controller, room, me }: ChosenGameProps): JSX.Element | null {
  const lang = useLang();
  useGameText(room.selectedGameId, lang);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const game = gameEntry(room.selectedGameId);
  const form = room.selectedGame;
  if (!game) return null;
  const key = form ? keySetting(form, room.settings) : null;
  const keyWords = key ? gameText(game.id, lang, key.short) : null;
  const myBots = room.players.filter((p) => p.bot?.ownerId === me.id).length;
  const fix = !room.canStart.ok ? startFix(room, game, MAX_BOTS_PER_OWNER - myBots) : null;
  const tuned = form ? tunedLine(form, room.settings, lang) : null;
  const settings = form?.settings ?? [];
  return (
    <Screen
      footer={
        <div className={selecting.footer}>
          {!room.canStart.ok ? (
            <p className={selecting.reason}>
              {serverText(room.canStart.reason, lang, room.selectedGameId)}
            </p>
          ) : null}
          {fix ? (
            <button
              type="button"
              className={selecting.fix}
              onClick={() => runFix(fix, (a) => controller.bot(a))}
            >
              {fix.kind === 'remove' ? '✕' : '🤖'} {fixLabel(fix, t.fix)}
            </button>
          ) : null}
          <PrimaryButton
            onClick={() => controller.vip({ action: 'start' })}
            disabled={!room.canStart.ok}
          >
            {t.selecting.start} {game.name}
            {keyWords ? ` · ${keyWords}` : ''}
          </PrimaryButton>
        </div>
      }
    >
      <button
        type="button"
        className={styles.textButton}
        style={{ alignSelf: 'flex-start', marginLeft: 'calc(-1 * var(--pb-space-3))' }}
        onClick={() => controller.vip({ action: 'selectGame', gameId: null })}
      >
        {t.picker.allGames}
      </button>
      <div className={styles.chosen}>
        <span className={`${styles.tile} ${styles.tileBig}`} aria-hidden>
          {game.icon}
        </span>
        <h2 className={styles.chosenName}>{game.name}</h2>
        <p className={styles.chosenTagline}>{taglineOf(game, lang)}</p>
        <p className={styles.meta}>
          {t.picker.players(game.minPlayers, game.maxPlayers)} ·{' '}
          {t.picker.minutes(minutesFor(game, room.settings, room.players.length))}
          {key && keyWords ? (
            // I-187 B: the deck, on the card — a tap opens the options at that setting.
            <button
              type="button"
              className={`${selecting.keyChip} ${key.mark === '🔞' ? selecting.keyChipHot : ''}`}
              onClick={() => {
                setOptionsOpen(true);
                requestAnimationFrame(() =>
                  document
                    .getElementById(`setting-${key.key}`)
                    ?.scrollIntoView({ block: 'center', behavior: 'smooth' }),
                );
              }}
            >
              {t.selecting.keyChip(key.mark, keyWords)}
            </button>
          ) : null}
        </p>
      </div>
      <PresenceNotice game={game} room={room} controller={controller} />
      {/* I-642 B: the room's switches, one row — changed in the ★ menu */}
      <button
        type="button"
        className={selecting.roomRow}
        aria-label={t.roomRow.aria(room.recording, room.musicOnPhones, room.phoneOnly)}
        onClick={() => window.dispatchEvent(new Event('pb:vip-menu'))}
      >
        <span className={selecting.roomLabel}>{t.roomRow.label}</span>
        {/* ADR-054 (Session C): the deck's language first, on screen on an SE, so the stage holds
            no surprise */}
        <span className={selecting.roomChip}>{t.roomRow.cards(room.contentLang)}</span>
        <span className={`${selecting.roomChip} ${room.recording ? selecting.roomOn : ''}`}>
          {room.recording ? '✓ ' : ''}
          {t.roomRow.recap}
        </span>
        <span className={`${selecting.roomChip} ${room.musicOnPhones ? selecting.roomOn : ''}`}>
          {room.musicOnPhones ? '✓ ' : ''}
          {t.roomRow.music}
        </span>
        <span className={`${selecting.roomChip} ${room.phoneOnly ? selecting.roomOn : ''}`}>
          {room.phoneOnly ? '✓ ' : ''}
          {t.roomRow.phoneOnly}
        </span>
        <span className={selecting.roomEdit} aria-hidden>
          ›
        </span>
      </button>
      {settings.length > 0 && form ? (
        <section className={selecting.settings}>
          <button
            type="button"
            className={styles.optionsHead}
            aria-expanded={optionsOpen}
            onClick={() => setOptionsOpen(!optionsOpen)}
          >
            <span className={styles.optionsTitle}>
              {t.picker.options(settings.length)} {optionsOpen ? '▴' : '▾'}
            </span>
            {tuned ? <span className={styles.optionsTuned}>{tuned}</span> : null}
          </button>
          {optionsOpen ? (
            <>
              {tunedSettings(form, room.settings).length > 0 ? (
                <button
                  type="button"
                  className={selecting.resetDefaults}
                  onClick={() =>
                    controller.vip({
                      action: 'updateSettings',
                      settings: Object.fromEntries(settings.map((s) => [s.key, s.default])),
                    })
                  }
                >
                  {t.selecting.resetDefaults}
                </button>
              ) : null}
              {settings.map((spec) => (
                <SettingField
                  key={spec.key}
                  spec={spec}
                  value={room.settings[spec.key]}
                  players={room.players.length}
                  settings={room.settings}
                  gameId={form.id}
                  onChange={(v) =>
                    controller.vip({ action: 'updateSettings', settings: { [spec.key]: v } })
                  }
                />
              ))}
            </>
          ) : null}
        </section>
      ) : null}
    </Screen>
  );
}
