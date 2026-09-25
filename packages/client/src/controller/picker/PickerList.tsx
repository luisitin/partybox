// The game list (Part 00 §1.3): a title with the head count, one row of filter chips, and compact
// rows — games that fit first, then the room's votes, NEW, A–Z (ruling 3). The VIP taps a row to
// choose it and ⓘ to read about it (the TV shows that game big meanwhile); everyone else gets the
// same list read-only, where ⓘ and a row open About with 👍 Suggest.
import { useLayoutEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import type { PlayerPublic, RoomSnapshot } from '@partybox/shared';
import { Screen } from '@partybox/game-sdk/ui';
import { useCatalog } from '../../catalog';
import { minutesFor } from '../../estimate';
import { t } from '../../i18n';
import type { Controller } from '../../net/controller';
import { AboutSheet } from './AboutSheet';
import { GameRow } from './GameRow';
import type { Chip } from './model';
import { chipsFor, fitOf, matchesChip, playedTonight, sortGames } from './model';
import styles from './picker.module.css';

export interface PickerListProps {
  controller: Controller;
  room: RoomSnapshot;
  me: PlayerPublic;
  lang: string;
}

/** A caption this big means the phone asked for large text: taglines may take two lines. */
const BIG_CAPTION_PX = 21;

export function PickerList({ controller, room, me, lang }: PickerListProps): JSX.Element {
  const { games } = useCatalog();
  const [chip, setChip] = useState<Chip>('all');
  const [open, setOpen] = useState<string | null>(null);
  const list = useRef<HTMLUListElement>(null);
  const [big, setBig] = useState(false);
  useLayoutEffect(() => {
    const probe = list.current?.querySelector(`.${styles.tagline}`);
    if (probe) setBig(parseFloat(getComputedStyle(probe).fontSize) >= BIG_CAPTION_PX);
  }, [games.length]);

  const chips = chipsFor(games);
  const active = chips.includes(chip) ? chip : 'all';
  const shown = sortGames(
    games.filter((g) => matchesChip(g, active)),
    room,
  );
  const votes = new Map<string, number>();
  for (const id of Object.values(room.votes ?? {})) votes.set(id, (votes.get(id) ?? 0) + 1);
  const played = playedTonight(room);
  const minutes = (id: string): number => {
    const g = games.find((x) => x.id === id);
    return g ? minutesFor(g, room.tuned?.[id], room.players.length) : 0;
  };
  const openAbout = (id: string | null): void => {
    setOpen(id);
    // Part 00 §1.4: the TV shows the VIP's open About big — the room's reading surface.
    if (me.isVip) controller.vip({ action: 'highlight', gameId: id });
  };
  const choose = (id: string): void => {
    setOpen(null);
    controller.vip({ action: 'selectGame', gameId: id });
  };
  const opened = open ? games.find((g) => g.id === open) : undefined;
  // Part 00 §1.4 on the guests' phones: what the VIP is reading about right now.
  const reading = me.isVip ? undefined : games.find((g) => g.id === room.highlightedGameId);
  const vipName = room.players.find((p) => p.isVip)?.name ?? t.selecting.theVip;

  return (
    <Screen
      title={
        <span className={styles.head}>
          {me.isVip ? (
            <span className={styles.headTitle}>{t.lobby.pickGame}</span>
          ) : (
            // A guest does not pick: the TV's thinking line, its "…" as dots that rise in turn.
            <span className={styles.headTitle} aria-label={t.selecting.vipChoosing(vipName)}>
              <span aria-hidden>{t.selecting.vipChoosing(vipName).replace(/…$/, '')}</span>
              <span className={styles.dots} aria-hidden>
                <span />
                <span />
                <span />
              </span>
            </span>
          )}
          <span className={styles.pill}>{t.picker.playersPill(room.players.length)}</span>
        </span>
      }
      footer={
        me.isVip ? (
          <button
            type="button"
            className={styles.textButton}
            onClick={() => controller.vip({ action: 'toLobby' })}
          >
            {t.selecting.back}
          </button>
        ) : undefined
      }
    >
      {chips.length > 1 ? (
        <div className={styles.chips} role="group" aria-label={t.picker.filters}>
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              className={styles.chip}
              aria-pressed={c === active}
              onClick={() => setChip(c)}
            >
              {c === active && c !== 'all' ? '✓ ' : ''}
              {t.picker.chips[c]}
            </button>
          ))}
        </div>
      ) : null}
      {reading ? (
        <p key={reading.id} className={styles.readingLine} role="status">
          <span aria-hidden>👀</span> {t.picker.reading(vipName, reading.name)}
        </p>
      ) : null}
      {shown.length > 0 ? (
        <ul ref={list} className={`${styles.list} ${big ? styles.big : ''}`}>
          {shown.map((g, i) => {
            const fit = fitOf(g, room);
            return (
              <GameRow
                key={g.id}
                game={g}
                lang={lang}
                fit={fit}
                minutes={minutes(g.id)}
                votes={votes.get(g.id) ?? 0}
                played={played.has(g.id)}
                index={i}
                reading={reading?.id === g.id}
                onRow={() => (me.isVip && fit.ok ? choose(g.id) : openAbout(g.id))}
                onInfo={() => openAbout(g.id)}
              />
            );
          })}
        </ul>
      ) : (
        <div className={styles.empty}>
          <p>{t.picker.noMatch}</p>
          <button type="button" className={styles.textButton} onClick={() => setChip('all')}>
            {t.picker.clearFilters}
          </button>
        </div>
      )}
      {opened ? (
        <AboutSheet
          key={opened.id}
          game={opened}
          room={room}
          me={me}
          lang={lang}
          minutes={minutes(opened.id)}
          controller={controller}
          onClose={() => openAbout(null)}
          onChoose={() => choose(opened.id)}
        />
      ) : null}
    </Screen>
  );
}
