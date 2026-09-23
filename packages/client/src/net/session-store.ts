// The phone's stored login (the session: token + room) and identity (name + avatar, which outlive
// the session), in localStorage. Split from controller.ts (its line cap).

const SESSION_KEY = 'partybox:session';

export interface Session {
  token: string;
  name: string;
  avatarId: string;
  /** The photo avatar (I-031), a small JPEG data URL. */
  photo?: string;
  roomCode?: string;
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session | null): void {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* private mode: reconnect just won't survive a reload */
  }
}

// Name + avatar outlive the session: after a kick, a server restart or the TV's Home the join form
// is prefilled and getting back in is one tap.
const IDENTITY_KEY = 'partybox:identity';
export type Identity = Pick<Session, 'name' | 'avatarId' | 'photo'>;

export function loadIdentity(): Identity | null {
  try {
    const raw = localStorage.getItem(IDENTITY_KEY);
    return raw ? (JSON.parse(raw) as Identity) : null;
  } catch {
    return null;
  }
}

export function saveIdentity(identity: Identity): void {
  try {
    localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
  } catch {
    /* private mode */
  }
}
