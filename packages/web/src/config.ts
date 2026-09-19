// Build-time knobs for the GitHub Pages build (ADR-034). Everything here has a working default, so
// a fork that just runs the Pages workflow needs no configuration at all.
import type { PeerOptions } from 'peerjs';

/**
 * Prefix of the id a room claims on the signalling broker. Ids are global to the broker, so a
 * longer, project-specific prefix makes a collision with another PartyBox fork unlikely — and a
 * collision is handled anyway (the room takes a different code).
 */
export const PEER_NAMESPACE: string = import.meta.env['VITE_PEER_NAMESPACE'] ?? 'partybox-v1';

/**
 * Signalling + ICE. The defaults use PeerJS's public broker and Google's public STUN servers,
 * which is enough for most home and mobile networks. Behind a symmetric NAT (some corporate and
 * carrier networks) a relay is required: set VITE_TURN_URL / VITE_TURN_USERNAME /
 * VITE_TURN_CREDENTIAL to your own TURN server and rebuild. See WEB_DEPLOY.md.
 */
export const PEER_CONFIG: PeerOptions = {
  debug: 0,
  config: {
    iceServers: [
      { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
      ...(import.meta.env['VITE_TURN_URL']
        ? [
            {
              urls: import.meta.env['VITE_TURN_URL'] as string,
              username: import.meta.env['VITE_TURN_USERNAME'] as string,
              credential: import.meta.env['VITE_TURN_CREDENTIAL'] as string,
            },
          ]
        : []),
    ],
  },
};

/** The address the stage tells people to open. On Pages that is this page's own URL. */
export function joinUrl(roomCode?: string): string {
  const base = `${location.origin}${import.meta.env.BASE_URL}`.replace(/\/+$/, '/');
  return roomCode ? `${base}?room=${roomCode}` : base;
}

/** How many times a new room retries when the broker already knows its code. */
export const ROOM_CODE_ATTEMPTS = 8;

/** Remembers the last room this device was in, so a reload offers to walk straight back in. */
export const LAST_ROOM_KEY = 'partybox:web:room';
