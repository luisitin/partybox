// The join form's portrait (I-031 B): the chosen face — or the phone's own photo (the owner's
// note) — swapping with a pop each time the pick changes. I-793 F (design review): it shrank to
// 64 px beside the name field, and the photo moved onto the portrait itself — tap the face (📷 in
// its corner) to open the phone's camera / gallery sheet; with a photo up, tap it (✕) to go back
// to a face.
import { useRef, useState } from 'react';
import type { JSX } from 'react';
import { Avatar } from '@partybox/game-sdk/ui';
import { joinStrings } from '../i18n-join';
import styles from './Join.module.css';
import { photoFromFile } from './photo';

export interface JoinPortraitProps {
  avatarId: string;
  photo: string | null;
  onPhoto: (photo: string | null) => void;
}

export function JoinPortrait({ avatarId, photo, onPhoto }: JoinPortraitProps): JSX.Element {
  // I-047: the flip runs on a MODE change (face ↔ photo), keyed so it restarts each time.
  const [wasPhoto, setWasPhoto] = useState(photo !== null);
  const [flipKey, setFlipKey] = useState(0);
  if ((photo !== null) !== wasPhoto) {
    setWasPhoto(photo !== null);
    setFlipKey((k) => k + 1);
  }
  const fileRef = useRef<HTMLInputElement>(null);
  const [failed, setFailed] = useState(false);
  const pick = async (file: File | undefined): Promise<void> => {
    if (!file) return;
    const url = await photoFromFile(file);
    setFailed(url === null);
    if (url) onPhoto(url);
  };
  const j = joinStrings();
  return (
    <div className={styles.portraitRow}>
      <button
        type="button"
        className={styles.portraitButton}
        aria-label={photo ? `${j.yourPhoto} — ${j.useFace}` : j.usePhoto}
        onClick={() => (photo ? onPhoto(null) : fileRef.current?.click())}
      >
        {/* I-047 A: a mode change is a flip; a face-to-face pick keeps its pop. */}
        <span
          key={`${photo ? 'photo' : avatarId}:${flipKey}`}
          className={`${styles.portrait} ${flipKey > 0 ? (photo ? styles.flipIn : styles.flipBack) : ''} ${photo ? styles.portraitPhoto : ''}`}
          aria-hidden
        >
          <Avatar avatarId={avatarId} photo={photo ?? undefined} size={64} />
        </span>
        <span className={styles.portraitBadge} aria-hidden>
          {photo ? '✕' : '📷'}
        </span>
      </button>
      <input
        ref={fileRef}
        className={styles.photoInput}
        type="file"
        accept="image/*"
        capture="user"
        tabIndex={-1}
        aria-label={j.usePhoto}
        onChange={(e) => {
          void pick(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      {failed ? (
        <span className={styles.photoHint} role="status">
          {j.photoFailed}
        </span>
      ) : null}
    </div>
  );
}
