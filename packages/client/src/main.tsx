// Entry: three routes, switched on the pathname (ADR-011, no router). Styles are global tokens +
// CSS Modules per component.
import { StrictMode } from 'react';
import type { JSX } from 'react';
import { createRoot } from 'react-dom/client';
import { ControllerApp } from './controller/ControllerApp';
import { Preview } from './preview/Preview';
import './styles/tokens.css';
import './styles/global.css';
import { TvApp } from './tv/TvApp';

function route(pathname: string): JSX.Element {
  if (pathname === '/tv' || pathname === '/tv/') return <TvApp />;
  if (pathname.startsWith('/preview/')) return <Preview />;
  return <ControllerApp />;
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('missing #root');
createRoot(rootEl).render(<StrictMode>{route(location.pathname)}</StrictMode>);
