// Entry: three routes, switched on the pathname (ADR-011, no router). Styles are global tokens +
// CSS Modules per component.
import { StrictMode } from 'react';
import type { JSX } from 'react';
import { createRoot } from 'react-dom/client';
import { ControllerApp } from './controller/ControllerApp';
import { Preview } from './preview/Preview';
// Bundled OFL font (ADR-012, BL-001): only the upright weight axis; unicode-range keeps downloads small.
import '@fontsource-variable/nunito/wght.css';
import './styles/tokens.css';
import './styles/global.css';
import { TvApp } from './tv/TvApp';

// The surface is also stamped on <html> so `body` and overlays rendered outside the shell (the audio
// gate) inherit the TV or phone type column (tokens.css) instead of the default phone sizes.
function route(pathname: string): JSX.Element {
  if (pathname === '/tv' || pathname === '/tv/') {
    document.documentElement.dataset['surface'] = 'tv';
    return <TvApp />;
  }
  if (pathname.startsWith('/preview/')) {
    document.documentElement.dataset['surface'] =
      new URLSearchParams(location.search).get('view') === 'controller' ? 'controller' : 'tv';
    return <Preview />;
  }
  document.documentElement.dataset['surface'] = 'controller';
  return <ControllerApp />;
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('missing #root');
createRoot(rootEl).render(<StrictMode>{route(location.pathname)}</StrictMode>);
