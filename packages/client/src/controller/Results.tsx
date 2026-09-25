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
import { myRow, nobodyScored, scoreboardRows, winnerLineFor } from './results-rows';
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
    list.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'center' });
  }, []);
  const rows = scoreboardRows(room);
  const mine = myRow(room, me.id);
  const scoreless = useGame(room.results?.gameId, 'phone').module?.scoreless === true;
  const over = nobodyScored(room) && !scoreless;
  const vipName = room.players.find((p) => p.id === room.vip)?.name;
  const awardsForMe = [...(room.results?.results.awards ?? [])].sort(
    (x, y) => Number(y.playerId === me.id) - Number(x.playerId === me.id),
  );
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
                a.playerId === me.id ? (
                  <span key={a.id} className={`${styles.awardChip} ${styles.awardMine}`}>
                    <strong>
                      {t.results.yourAward(serverText(a.title, lang, room.results?.gameId))}
                    </strong>
                  </span>
                ) : (
                  <span key={a.id} className={styles.awardChip}>
                    <strong>{serverText(a.title, lang, room.results?.gameId)}</strong>{' '}
                    {room.results?.players.find((p) => p.id === a.playerId)?.name ?? '?'}
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
              key={a.id}
              className={`${styles.award} ${a.playerId === me.id ? styles.awardMine : ''}`.trim()}
            >
              {/* The game's results() writes the award in English: its own table translates it. */}
              <span>
                {/* I-155 A: the screen already knows whose hand it is in — the award should too. */}
                {a.playerId === me.id ? (
                  <strong>
                    {t.results.yourAward(serverText(a.title, lang, room.results?.gameId))}
                  </strong>
                ) : (
                  <>
                    <strong>{serverText(a.title, lang, room.results?.gameId)}</strong> ·{' '}
                    {room.results?.players.find((p) => p.id === a.playerId)?.name ?? '?'}
                  </>
                )}
              </span>
              <span className="pb-muted pb-caption">
                {serverText(a.description, lang, room.results?.gameId)}
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
