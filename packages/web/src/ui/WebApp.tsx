// The whole GitHub Pages app (ADR-034). One page per person: the stage on top, their controller
// below. No TV to walk up to and no server to run — whoever starts the room hosts it in their tab
// and everyone else's phone opens a data channel to it.
import { useCallback, useMemo, useState } from 'react';
import type { JSX } from 'react';
import { ControllerApp, createController, createTvClient, setInfoProvider } from '@partybox/client';
import { PARTYBOX_VERSION } from '@partybox/shared';
import { joinUrl } from '../config';
import { serverGames } from '../games.generated';
import { controllerTransport, stageTransport } from '../net/link-transport';
import { hostRoom, joinRoom, lastRoom, rememberRoom } from '../net/room';
import type { Room } from '../net/room';
import { qrSvg } from '../qr';
import { RoomEntry } from './RoomEntry';
import { Stage } from './Stage';
import { ShareBar } from './ShareBar';
import styles from './WebApp.module.css';

/** `?room=CODE` — the link a player shares — skips straight past the code field. */
function codeFromUrl(): string | null {
  const raw = new URLSearchParams(location.search).get('room');
  return raw ? raw.toUpperCase() : null;
}

export function WebApp(): JSX.Element {
  const [room, setRoom] = useState<Room | null>(null);
  const [busy, setBusy] = useState<'hosting' | 'joining' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const open = useCallback(async (next: 'host' | string): Promise<void> => {
    setBusy(next === 'host' ? 'hosting' : 'joining');
    setError(null);
    try {
      const opened = next === 'host' ? await hostRoom({ games: serverGames }) : joinRoom(next);
      // Everything downstream asks `/api/info` for the join URL, the QR and the room list; on
      // Pages there is no server to ask, so the answer is computed here (see net/info.ts).
      const code = await qrSvg(joinUrl(opened.code));
      setInfoProvider(async () => ({
        version: PARTYBOX_VERSION,
        startedAt: Date.now(),
        publicHost: location.host,
        port: 0,
        tvUrl: joinUrl(opened.code),
        joinUrl: joinUrl(opened.code),
        qrSvg: code,
        rooms: [{ code: opened.code, locked: false, players: 0 }],
        houseRoom: opened.code,
        dev: false,
      }));
      setRoom(opened);
    } catch (err) {
      rememberRoom(null);
      setError(err instanceof Error ? err.message : 'Could not open that room.');
    } finally {
      setBusy(null);
    }
  }, []);

  if (!room)
    return (
      <RoomEntry
        initialCode={codeFromUrl() ?? lastRoom() ?? undefined}
        busy={busy}
        error={error}
        onHost={() => void open('host')}
        onJoin={(code) => void open(code)}
      />
    );
  return <Party room={room} />;
}

function Party({ room }: { room: Room }): JSX.Element {
  // The stage starts folded away (owner pick 2026-09-19): a phone's screen belongs to the controls,
  // and the stage is the thing you glance at, not the thing you play on. It is mounted the whole
  // time regardless — it owns the music, the beds and the cues, which play whether it is shown or not.
  const [stageShown, setStageShown] = useState(false);
  const [reachable, setReachable] = useState(room.reachable);
  const controller = useMemo(
    () => createController({ transport: controllerTransport(room.link) }),
    [room],
  );
  const stage = useMemo(
    () =>
      createTvClient({
        roomCode: room.code,
        transport: stageTransport(room.link),
        // 🏠 from a running game still ends it (through this player's own VIP rights); from the
        // lobby there is nothing to reset — the room already is a fresh lobby.
        reset: () => Promise.resolve('ok' as const),
      }),
    [room],
  );
  return (
    <div className={styles.page}>
      <Stage client={stage} hidden={!stageShown} />
      <div className={styles.controls}>
        <ShareBar
          code={room.code}
          hosting={room.hosting}
          reachable={reachable}
          stageShown={stageShown}
          onToggleStage={() => setStageShown((v) => !v)}
          onRetry={() => void room.retryShare().then(setReachable)}
        />
        <ControllerApp controller={controller} />
      </div>
    </div>
  );
}
