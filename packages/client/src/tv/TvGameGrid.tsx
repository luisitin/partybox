// The TV's game list while nothing is chosen (Part 00 §1.6, audit #6): cards three to a row, paged
// when there are more than fit, and a spotlight on the right. The spotlight is the VIP's open
// About (§1.4 — the room's reading surface; that card wears the accent ring), and when nobody is
// reading it turns slowly through the games in list order. Its steps light up one after another
// as the room reads, so the stage is never still. A card is clickable: the TV is the host's screen
// (ADR-031).
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import type { CatalogEntry, RoomSnapshot } from '@partybox/shared';
import { Avatar, usePrefersReducedMotion, useT } from '@partybox/game-sdk/ui';
import { taglineOf, useAbout, useCatalog } from '../catalog';
import { fitOf, playedTonight, sortGames } from '../controller/picker/model';
import type { Fit } from '../controller/picker/model';
import { minutesFor } from '../estimate';
import { t } from '../i18n';
import type { TvClient } from '../net/tv';
import { useStepCycle } from '../useStepCycle';
import { STRINGS } from './strings';
import styles from './TvGameGrid.module.css';

/** Cards per page (three columns, three rows above the switches). */
export const PAGE_SIZE = 9;
/** How long the spotlight rests on a game: its three steps light up, then a breath. */
export const SHELF_MS = 7000;
/** A page turns this often when the list has more than one. */
const PAGE_MS = 14000;

function reasonOf(fit: Fit): string | null {
  if (fit.ok) return null;
  if (fit.why === 'needs') return t.picker.needs(fit.min, fit.n);
  if (fit.why === 'tooMany') return t.picker.tooMany(fit.max, fit.n);
  return t.picker.noBots;
}

export function TvGameGrid({
  room,
  client,
}: {
  room: RoomSnapshot;
  client: TvClient;
}): JSX.Element {
  const L = useT(STRINGS);
  const lang = L.lang;
  const { games } = useCatalog();
  const reduced = usePrefersReducedMotion();
  const sorted = sortGames(games, room);
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const highlighted = room.highlightedGameId ?? null;
  const [shelf, setShelf] = useState(0);
  const [page, setPage] = useState(0);
  // The shelf turns while nobody is reading; pages turn the same way when there are several.
  useEffect(() => {
    if (reduced || highlighted || sorted.length < 2) return undefined;
    const h = setInterval(() => setShelf((s) => (s + 1) % sorted.length), SHELF_MS);
    return () => clearInterval(h);
  }, [reduced, highlighted, sorted.length]);
  useEffect(() => {
    if (pages < 2 || highlighted || reduced) return undefined;
    const h = setInterval(() => setPage((p) => (p + 1) % pages), PAGE_MS);
    return () => clearInterval(h);
  }, [pages, highlighted, reduced]);
  const spotId = highlighted ?? sorted[shelf % Math.max(1, sorted.length)]?.id ?? null;
  const spotIndex = sorted.findIndex((g) => g.id === spotId);
  const shownPage = highlighted && spotIndex >= 0 ? Math.floor(spotIndex / PAGE_SIZE) : page;
  const onPage = sorted.slice(shownPage * PAGE_SIZE, (shownPage + 1) * PAGE_SIZE);
  const votes = new Map<string, number>();
  for (const id of Object.values(room.votes ?? {})) votes.set(id, (votes.get(id) ?? 0) + 1);
  const played = playedTonight(room);
  const vip = room.players.find((p) => p.isVip);
  const spot = sorted.find((g) => g.id === spotId);

  return (
    <div className={styles.layout}>
      <div className={styles.gridWrap}>
        <ul key={shownPage} className={styles.grid}>
          {onPage.map((g, i) => {
            const fit = fitOf(g, room);
            const reason = reasonOf(fit);
            const isSpot = g.id === spotId;
            const wants = votes.get(g.id) ?? 0;
            const badged = Boolean(g.isNew) || wants > 0 || played.has(g.id);
            return (
              <li key={g.id} style={{ ['--i' as string]: i }}>
                <button
                  type="button"
                  className={`${styles.card} ${fit.ok ? '' : styles.off} ${badged ? styles.hasBadges : ''} ${isSpot ? (highlighted ? styles.reading : styles.spot) : ''}`}
                  onClick={() => client.act({ action: 'selectGame', gameId: g.id })}
                >
                  <span className={styles.cardTop}>
                    <span className={styles.icon} aria-hidden>
                      {g.icon}
                    </span>
                    <span className={styles.name}>{g.name}</span>
                  </span>
                  <span className={styles.tagline}>{taglineOf(g, lang)}</span>
                  <span className={styles.meta}>
                    {reason ??
                      `${t.picker.players(g.minPlayers, g.maxPlayers)} · ${t.picker.minutes(minutesFor(g, room.tuned?.[g.id], room.players.length))}`}
                  </span>
                  {badged ? (
                    <span className={styles.badges}>
                      {g.isNew ? <span className={styles.new}>{t.picker.isNew}</span> : null}
                      {wants > 0 ? <span className={styles.badge}>🙋 {wants}</span> : null}
                      {played.has(g.id) ? <span className={styles.badge}>↻</span> : null}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
        {pages > 1 ? (
          <div className={styles.dots} aria-hidden>
            {Array.from({ length: pages }, (_, i) => (
              <span key={i} className={i === shownPage ? styles.dotOn : styles.dot} />
            ))}
          </div>
        ) : null}
      </div>
      {spot ? (
        <Spotlight
          key={`${spot.id}-${highlighted ? 'read' : 'shelf'}`}
          game={spot}
          room={room}
          lang={lang}
          reader={highlighted && vip ? vip : null}
          turning={!highlighted && !reduced && sorted.length > 1}
          readingLine={vip ? L('{name} is reading about', { name: vip.name }) : ''}
        />
      ) : null}
    </div>
  );
}

function Spotlight(p: {
  game: CatalogEntry;
  room: RoomSnapshot;
  lang: string;
  reader: RoomSnapshot['players'][number] | null;
  turning: boolean;
  readingLine: string;
}): JSX.Element {
  const about = useAbout(p.game.id, p.lang);
  const lit = useStepCycle(about !== null);
  const g = p.game;
  return (
    <aside className={`${styles.spotlight} ${p.reader ? styles.spotlightReading : ''}`}>
      {p.reader ? (
        <p className={styles.reader}>
          <Avatar avatarId={p.reader.avatarId} size={36} />
          {p.readingLine}
        </p>
      ) : null}
      <span className={styles.spotHead}>
        <span className={styles.spotIcon} aria-hidden>
          {g.icon}
        </span>
        <h2 className={styles.spotName}>{g.name}</h2>
      </span>
      <p className={styles.spotTagline}>{taglineOf(g, p.lang)}</p>
      {about ? (
        <ol className={styles.steps}>
          {about.howToPlay.map((step, i) => (
            <li key={step} className={lit === null || lit === i ? styles.stepLit : undefined}>
              {step}
            </li>
          ))}
        </ol>
      ) : (
        <div className={styles.stepsWait} />
      )}
      <p className={styles.spotMeta}>
        {t.picker.players(g.minPlayers, g.maxPlayers)} ·{' '}
        {t.picker.minutes(minutesFor(g, p.room.tuned?.[g.id], p.room.players.length))}
        {g.supportsBots ? ' · 🤖' : ''}
      </p>
      {p.turning ? <span className={styles.turn} aria-hidden /> : null}
    </aside>
  );
}
