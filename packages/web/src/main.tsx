// Entry for the GitHub Pages build (ADR-034). One route, because there is no TV page to serve and
// no server to serve it: everyone gets the same page. Styles and fonts are the client's own, so
// the two builds cannot drift apart visually.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { applyMotionPreference } from '@partybox/game-sdk/ui';
import { applyTheme } from '@partybox/client';
import '@fontsource-variable/nunito/wght.css';
import '@partybox/client/styles/tokens.css';
import '@partybox/client/styles/global.css';
import { WebApp } from './ui/WebApp';

// The page is a phone; the stage sets `data-surface="tv"` on its own subtree (TvFrame).
document.documentElement.dataset['surface'] = 'controller';
applyTheme();
applyMotionPreference();

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('missing #root');
createRoot(rootEl).render(
  <StrictMode>
    <WebApp />
  </StrictMode>,
);
