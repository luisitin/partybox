// Public surface of @partybox/client (the only barrel in this package). It exists so the GitHub
// Pages build (packages/web, ADR-034) can reuse the real shells and screens instead of a second
// copy of the UI: both builds render the same lobby, stage and game screens.
export type { ControllerAppProps } from './controller/ControllerApp';
export { ControllerApp } from './controller/ControllerApp';
export type { TvAppProps } from './tv/TvApp';
export { TvApp } from './tv/TvApp';
export type {
  Connection,
  Controller,
  ControllerOptions,
  ControllerState,
  Identity,
} from './net/controller';
export { createController } from './net/controller';
export type { HomeResult, TvClient, TvClientOptions, TvState } from './net/tv';
export { createTvClient } from './net/tv';
export type { NetTransport } from './net/transport';
export type { Store, Toast } from './net/store';
export { createStore, nextToastId, useStore } from './net/store';
export type { InfoProvider, ServerInfo } from './net/info';
export { setInfoProvider, useServerInfo } from './net/info';
export { TV_DESIGN, tvZoom } from './tv/fit';
export type { ThemeId } from './theme';
export { THEMES, applyTheme } from './theme';
export { t } from './i18n';
