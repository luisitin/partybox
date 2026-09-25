// I-076 B: the language choice, remembered in this browser — a row of pills (the 🎨 sheet keeps
// it) and, I-793 F (design review), the join page's one "🌐 EN ▾" in the header: the phone's own
// list opens under a tap (a native select laid over the pill), so the choice takes no form row.
import type { JSX } from 'react';
import { useLang } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import { JOIN_LANGS, JOIN_LANG_NAMES, setJoinLang } from '../i18n-join';
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
    <div className={styles.langs} role="group" aria-label={t.join.languageGroup}>
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

/** I-793 F: the header's "🌐 EN ▾" on the join page. */
export function JoinLangPick(): JSX.Element {
  const lang: JoinLang = useLang();
  return (
    <label className={styles.langPick}>
      <span aria-hidden>
        🌐 {lang.toUpperCase()} <span className={styles.langCaret}>▾</span>
      </span>
      <select
        className={styles.langSelect}
        aria-label={t.join.language}
        value={lang}
        onChange={(e) => setJoinLang(e.target.value as JoinLang)}
      >
        {JOIN_LANGS.map((l) => (
          <option key={l} value={l}>
            {JOIN_LANG_NAMES[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
