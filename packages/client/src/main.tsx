// Entry: three routes, switched on the pathname (ADR-011, no router). Styles are global tokens +
// CSS Modules per component.
import { StrictMode } from 'react';
import type { JSX } from 'react';
import { createRoot } from 'react-dom/client';
import { ControllerApp } from './controller/ControllerApp';
import { guardStaleChunks } from './net/stale';
import { Preview } from './preview/Preview';
// Bundled OFL font (ADR-012, BL-001): only the upright weight axis; unicode-range keeps downloads small.
import '@fontsource-variable/nunito/wght.css';
import './styles/tokens.css';
import './styles/global.css';
import { applyMotionPreference, getLang, subscribeLang } from '@partybox/game-sdk/ui';
import { THEMES, applyTheme } from './theme';
import type { ThemeId } from './theme';
import { fitTvToViewport } from './tv/fit';
import { TvApp } from './tv/TvApp';

const THEME_IDS = new Set<string>(THEMES.map((t) => t.id));

// The surface is also stamped on <html> so `body` and overlays rendered outside the shell (the audio
// gate) inherit the TV or phone type column (tokens.css) instead of the default phone sizes.
// `?theme=<id>` (previews, screenshots) wins over the stored per-device choice.
function route(pathname: string): JSX.Element {
  const forced = new URLSearchParams(location.search).get('theme');
  applyTheme(forced && THEME_IDS.has(forced) ? (forced as ThemeId) : undefined);
  applyMotionPreference();
  if (pathname === '/tv' || pathname === '/tv/') {
    document.documentElement.dataset['surface'] = 'tv';
    fitTvToViewport();
    return <TvApp />;
  }
  if (pathname.startsWith('/preview/')) {
    const tv = new URLSearchParams(location.search).get('view') !== 'controller';
    document.documentElement.dataset['surface'] = tv ? 'tv' : 'controller';
    if (tv) fitTvToViewport();
    return <Preview />;
  }
  document.documentElement.dataset['surface'] = 'controller';
  return <ControllerApp />;
}

// <html lang> follows the device's language (the join pills, the 🎨 sheet): screen readers speak
// the page in it, and the browser stops offering to translate a page that is already Spanish.
const syncLang = (): void => {
  document.documentElement.lang = getLang();
};
syncLang();
subscribeLang(syncLang);

guardStaleChunks();
const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('missing #root');
createRoot(rootEl).render(<StrictMode>{route(location.pathname)}</StrictMode>);
