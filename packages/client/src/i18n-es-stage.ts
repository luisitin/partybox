// Spanish for the start stage — the twin of i18n-en-stage.ts (the compiler holds them to one shape
// through `Texts`); "vosotros" like the rest of the shell.
import type { Texts } from './i18n-en';

const list = (names: string[], more: number): string => {
  const shown = more > 0 ? [...names, `${more} más`] : names;
  return shown.length <= 1
    ? (shown[0] ?? '')
    : `${shown.slice(0, -1).join(', ')} y ${shown.at(-1) ?? ''}`;
};

export const esStage: Pick<Texts, 'stage'> = {
  stage: {
    ready: '¡Listo!',
    youAreReady: 'Listo',
    waitingFor: (names, more) => `Esperando a ${list(names, more)}`,
    everyoneReady: '¡Todo el mundo listo!',
    everyoneElseReady: 'Los demás ya están listos',
    wait: 'Esperad',
    held: 'En espera: el VIP lo empieza cuando estéis todos',
    heldVip: 'En espera: pulsa Empezar ya cuando estéis todos',
    startNow: 'Empezar ya',
    back: '‹ Volver',
    startNowHint: 'Empieza la cuenta aunque alguien siga leyendo',
  },
};
