// The join form's portrait row (I-031 B): the chosen face — or the phone's own photo (the
// owner's note) — large beside the name as typed, swapping with a pop each time the pick changes.
// "Use a photo" opens the phone's camera / gallery sheet through a file input; "Use a face
// instead" goes back to the grid.
import { useRef, useState } from 'react';
import type { JSX } from 'react';
import { Avatar } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import styles from './Join.module.css';
import { photoFromFile } from './photo';

export interface JoinPortraitProps {
  avatarId: string;
  name: string;
  photo: string | null;
  onPhoto: (photo: string | null) => void;
}

export function JoinPortrait({ avatarId, name, photo, onPhoto }: JoinPortraitProps): JSX.Element {
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
  return (
    <div className={styles.portraitRow}>
      {/* I-047 A: a mode change is a flip; a face-to-face pick keeps its pop. */}
      <span
        key={`${photo ? 'photo' : avatarId}:${flipKey}`}
        className={`${styles.portrait} ${flipKey > 0 ? (photo ? styles.flipIn : styles.flipBack) : ''} ${photo ? styles.portraitPhoto : ''}`}
        aria-hidden
      >
        <Avatar avatarId={avatarId} photo={photo ?? undefined} size={96} />
      </span>
      <span className={styles.portraitSide}>
        <span className={styles.portraitName}>{name.trim() || '…'}</span>
        {photo ? <span className={styles.photoCaption}>your photo</span> : null}
        <input
          ref={fileRef}
          className={styles.photoInput}
          type="file"
          accept="image/*"
          capture="user"
          aria-label={t.join.usePhoto}
          onChange={(e) => {
            void pick(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        {photo ? (
          <button type="button" className={styles.photoButton} onClick={() => onPhoto(null)}>
            {t.join.useFace}
          </button>
        ) : (
          <button
            type="button"
            className={styles.photoButton}
            onClick={() => fileRef.current?.click()}
          >
            {t.join.usePhoto}
          </button>
        )}
        {failed ? (
          <span className={styles.photoHint} role="status">
            {t.join.photoFailed}
          </span>
        ) : null}
      </span>
    </div>
  );
}
