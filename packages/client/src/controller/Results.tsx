// Results on the phone: the winner line in the first person ("You win!"), my place and score, the
// compact scoreboard with "me" marked; the VIP gets play again / new game / lobby, everyone else
// waits for the VIP by name. The board shows the instant the TV's does (the phone never spoils,
// and never hides a board the TV is already showing); the cue + buzz come from the shell.
import { useEffect, useRef } from 'react';
import type { JSX } from 'react';
import type { PlayerPublic, RoomSnapshot } from '@partybox/shared';
import { PrimaryButton, Scoreboard, Screen, useLang } from '@partybox/game-sdk/ui';
import { useGame } from '../game-loader';
import { t } from '../i18n';
import { serverText } from '../server-text';
import type { Controller } from '../net/controller';
import {
  groupAwards,
  joinNames,
  myRow,
  nobodyScored,
  scoreboardRows,
  winnerLineFor,
} from './results-rows';
import styles from './Results.module.css';
import { VoteRow } from './VoteRow';

export interface ResultsProps {
  controller: Controller;
  room: RoomSnapshot;
  me: PlayerPublic;
}

export function Results({ controller, room, me }: ResultsProps): JSX.Element {
  // Your own row is what you look for first: bring it above the sticky footer (review-loop #15).
  const list = useRef<HTMLDivElement>(null);
  const lang = useLang();
  useEffect(() => {
    // I-456 B: to the middle of the list, not its nearest edge (which was half under the footer)
    const toMe = (): void =>
      list.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'center' });
    toMe();
    // Again once the sticky title has settled (the place line and the award chips arrive after the
    // first paint and shrink the body): a 5th place otherwise sat under the "more below" fade. Not
    // if the player has touched the list meanwhile.
    let moved = false;
    let scroller: HTMLElement | null = list.current?.parentElement ?? null;
    while (scroller && !/(auto|scroll)/.test(getComputedStyle(scroller).overflowY))
      scroller = scroller.parentElement;
    const touched = (): void => {
      moved = true;
    };
    const events = ['pointerdown', 'wheel', 'touchstart', 'keydown'] as const;
    for (const e of events) scroller?.addEventListener(e, touched, { passive: true });
    const again = setTimeout(() => {
      if (!moved) toMe();
    }, 700);
    return () => {
      clearTimeout(again);
      for (const e of events) scroller?.removeEventListener(e, touched);
    };
  }, []);
  const rows = scoreboardRows(room);
  const mine = myRow(room, me.id);
  const scoreless = useGame(room.results?.gameId, 'phone').module?.scoreless === true;
  const over = nobodyScored(room) && !scoreless;
  const vipName = room.players.find((p) => p.id === room.vip)?.name;
  // One chip per award, everyone who won it on it (a tie gave each tied player a copy); yours first.
  const mineIn = (a: { playerIds: string[] }): boolean => a.playerIds.includes(me.id);
  const awardsForMe = groupAwards(room.results?.results.awards ?? []).sort(
    (x, y) => Number(mineIn(y)) - Number(mineIn(x)),
  );
  const nameOf = (id: string): string =>
    room.results?.players.find((p) => p.id === id)?.name ?? '?';
  const winnersOf = (a: { playerIds: string[] }): string => joinNames(a.playerIds.map(nameOf));
  // a shared award on my own phone says who shares it ("… with Kenji", tune-in's nit)
  const sharedWith = (a: { playerIds: string[] }): string => {
    const others = a.playerIds.filter((id) => id !== me.id).map(nameOf);
    return others.length > 0 ? ` · ${t.results.sharedWith(joinNames(others))}` : '';
  };
  // I-155 C: votes received per round, straight off the results payload.
  const myVotes = (
    (room.results?.results as { perRoundVotes?: Record<string, number[]> } | undefined)
      ?.perRoundVotes?.[me.id] ?? []
  ).map(String);
  return (
    <Screen
      // fill1: the award chips end on the body's clip line — a scrolled row fades before them
      fadeTop
      // The winner line is the sticky title: on a long board the body scrolls to your own row and a
      // hero inside the body scrolled off the top (review-loop #76).
      title={
        <>
          <span className={styles.winner} data-screen="results">
            {winnerLineFor(room, me.id, scoreless)}
          </span>
          {/* I-456 B: your place stays in view while the board scrolls to your row */}
          {mine && !over && !scoreless ? (
            <span className={`pb-muted pb-caption ${styles.place}`}>
              {t.results.yourPlace(mine.rank, mine.score)}
            </span>
          ) : null}
          {/* I-456 C: the awards as chips, under your place — never scrolled away; I-155 A/B:
              yours first, and reading as yours */}
          {awardsForMe.length ? (
            <span className={styles.awardChips}>
              {awardsForMe.map((a) =>
                mineIn(a) ? (
                  <span
                    key={`${a.id}|${a.title}`}
                    className={`${styles.awardChip} ${styles.awardMine}`}
                  >
                    <strong>
                      {t.results.yourAward(serverText(a.title, lang, room.results?.gameId))}
                    </strong>
                    {sharedWith(a)}
                  </span>
                ) : (
                  <span key={`${a.id}|${a.title}`} className={styles.awardChip}>
                    <strong>{serverText(a.title, lang, room.results?.gameId)}</strong>{' '}
                    {winnersOf(a)}
                  </span>
                ),
              )}
            </span>
          ) : null}
        </>
      }
      footer={
        me.isVip ? (
          <div className={styles.actions}>
            <PrimaryButton onClick={() => controller.vip({ action: 'playAgain' })}>
              {t.results.playAgain}
            </PrimaryButton>
            <div className={styles.row}>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => controller.vip({ action: 'selectGame', gameId: null })}
              >
                {t.results.newGame}
              </button>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => controller.vip({ action: 'toLobby' })}
              >
                {t.results.lobby}
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className={`pb-muted ${styles.wait}`}>
              {vipName ? t.results.waitingFor(vipName) : t.results.waitingForVip}
            </p>
            {/* I-650 B: "what next?" is asked here — the vote row under the waiting line */}
            <VoteRow controller={controller} room={room} me={me} row />
          </>
        )
      }
    >
      {over ? <p className="pb-muted pb-caption">{t.results.nobodyScored}</p> : null}
      {/* (I-456 B: your place moved up under the winner line) */}
      {scoreless ? (
        // No points: a board of zeros says nothing; the TV holds the show's summary.
        <p className="pb-muted pb-caption">
          {room.phoneOnly ? t.results.scorelessHintPhones : t.results.scorelessHint}
        </p>
      ) : (
        <div ref={list}>
          <Scoreboard rows={rows} compact highlightId={me.id} noTrophy={over} />
        </div>
      )}
      {/* (I-456 C: the awards are chips under your place; the long list only for a screen reader)
          I-155 B: your own awards come first — a receipt opens with you on it. */}
      {room.results?.results.awards.length ? (
        <ul className={`${styles.awards} ${styles.srOnly}`}>
          {awardsForMe.map((a) => (
            <li
              key={`${a.id}|${a.title}`}
              className={`${styles.award} ${mineIn(a) ? styles.awardMine : ''}`.trim()}
            >
              {/* The game's results() writes the award in English: its own table translates it. */}
              <span>
                {/* I-155 A: the screen already knows whose hand it is in — the award should too. */}
                {mineIn(a) ? (
                  <>
                    <strong>
                      {t.results.yourAward(serverText(a.title, lang, room.results?.gameId))}
                    </strong>
                    {sharedWith(a)}
                  </>
                ) : (
                  <>
                    <strong>{serverText(a.title, lang, room.results?.gameId)}</strong> ·{' '}
                    {winnersOf(a)}
                  </>
                )}
              </span>
              <span className="pb-muted pb-caption">
                {a.description !== null
                  ? serverText(a.description, lang, room.results?.gameId)
                  : a.perPlayer
                      .map(
                        (x) =>
                          `${nameOf(x.playerId)}: ${serverText(x.description, lang, room.results?.gameId)}`,
                      ) // prettier-ignore
                      .join(' · ')}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {/* I-155 C: the part of the night only this phone can show. */}
      {myVotes.length > 0 ? (
        <p className={styles.myVotes}>{t.results.myVotes(myVotes.join(' · '))}</p>
      ) : null}
    </Screen>
  );
}
