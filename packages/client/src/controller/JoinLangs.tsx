// I-076 B: the join screen's language row — a way to choose, remembered in this browser.
import type { JSX } from 'react';
import { JOIN_LANGS, setJoinLang } from '../i18n-join';
import type { JoinLang } from '../i18n-join';
import styles from './Join.module.css';

export function JoinLangs({
  lang,
  onPick,
}: {
  lang: JoinLang;
  onPick: (lang: JoinLang) => void;
}): JSX.Element {
  return (
    <div className={styles.langs} role="group" aria-label="language">
      {JOIN_LANGS.map((l) => (
        <button
          key={l}
          type="button"
          className={`${styles.lang} ${l === lang ? styles.langOn : ''}`}
          aria-pressed={l === lang}
          onClick={() => {
            setJoinLang(l);
            onPick(l);
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
