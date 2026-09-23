// The join screen's languages (I-076): the join flow, the room code and room picker (ADR-043),
// and the phone lobby's two lines, in EN · ES · DE · FR · PT. Split from i18n.ts (its line cap);
// it imports `t` for the English strings and nothing imports it back, so there is no cycle.
import { getLang, setLang } from '@partybox/game-sdk/ui';
import { textsFor } from './i18n';
import type { t } from './i18n';

// I-076 A: the join flow in a few languages — the one screen every guest reads first. Detected
// from the phone (`navigator.language`); everything past the join stays English.
export type JoinLang = 'en' | 'es' | 'de' | 'fr' | 'pt';
export const JOIN_LANGS: readonly JoinLang[] = ['en', 'es', 'de', 'fr', 'pt'];
type JoinAll = { [K in keyof typeof t.join]: string };
type JoinStrings = Pick<
  JoinAll,
  | 'title'
  | 'name'
  | 'namePlaceholder'
  | 'avatar'
  | 'usePhoto'
  | 'useFace'
  | 'joiningRoom'
  | 'submit'
  | 'needName'
  | 'joining'
>;
const JOIN_L10N: Record<Exclude<JoinLang, 'en'>, JoinStrings> = {
  es: {
    title: 'Únete a la fiesta',
    name: 'Tu nombre',
    namePlaceholder: 'p. ej. Sam',
    avatar: 'Elige un avatar',
    usePhoto: 'Usar una foto',
    useFace: 'Usar una cara',
    joiningRoom: 'Entrando en la sala',
    submit: 'Entrar',
    needName: 'Escribe un nombre para entrar',
    joining: 'Entrando…',
  },
  de: {
    title: 'Mach mit',
    name: 'Dein Name',
    namePlaceholder: 'z. B. Sam',
    avatar: 'Wähl einen Avatar',
    usePhoto: 'Foto verwenden',
    useFace: 'Lieber ein Gesicht',
    joiningRoom: 'Raum',
    submit: 'Beitreten',
    needName: 'Gib einen Namen ein',
    joining: 'Tritt bei…',
  },
  fr: {
    title: 'Rejoins la fête',
    name: 'Ton prénom',
    namePlaceholder: 'p. ex. Sam',
    avatar: 'Choisis un avatar',
    usePhoto: 'Utiliser une photo',
    useFace: 'Plutôt un visage',
    joiningRoom: 'Salle',
    submit: 'Rejoindre',
    needName: 'Entre un prénom pour rejoindre',
    joining: 'Connexion…',
  },
  pt: {
    title: 'Entra na festa',
    name: 'O teu nome',
    namePlaceholder: 'p. ex. Sam',
    avatar: 'Escolhe um avatar',
    usePhoto: 'Usar uma foto',
    useFace: 'Usar uma cara',
    joiningRoom: 'A entrar na sala',
    submit: 'Entrar',
    needName: 'Escreve um nome para entrar',
    joining: 'A entrar…',
  },
};
/**
 * The code field and the room picker (ADR-043) in the join languages — the picker arrived after
 * I-076 and was English on a Spanish join screen, as was the ROOM CODE field itself (2026-09-22).
 */
export interface RoomStrings {
  code: string;
  codePlaceholder: string;
  roomsOpen: string;
  noRooms: string;
  openNew: string;
  openCode: (code: string) => string;
  opening: string;
  here: (n: number) => string;
  playing: (n: number) => string;
  locked: string;
}
const ROOM_L10N: Record<JoinLang, RoomStrings> = {
  en: {
    code: textsFor('en').join.code,
    codePlaceholder: textsFor('en').join.codePlaceholder,
    roomsOpen: 'Rooms open now',
    noRooms: 'No public rooms yet — open one.',
    openNew: '＋ Open a new room',
    openCode: (c) => `＋ Open room ${c}`,
    opening: 'Opening…',
    here: (n) => `${n} here`,
    playing: (n) => `playing · ${n}`,
    locked: 'locked',
  },
  es: {
    code: 'Código de la sala',
    codePlaceholder: '4 letras de la pantalla',
    roomsOpen: 'Salas abiertas ahora',
    noRooms: 'Aún no hay salas públicas: abre una.',
    openNew: '＋ Abrir una sala nueva',
    openCode: (c) => `＋ Abrir la sala ${c}`,
    opening: 'Abriendo…',
    here: (n) => `${n} aquí`,
    playing: (n) => `jugando · ${n}`,
    locked: 'cerrada',
  },
  de: {
    code: 'Raumcode',
    codePlaceholder: '4 Buchstaben vom Bildschirm',
    roomsOpen: 'Offene Räume',
    noRooms: 'Noch keine öffentlichen Räume – eröffne einen.',
    openNew: '＋ Neuen Raum eröffnen',
    openCode: (c) => `＋ Raum ${c} eröffnen`,
    opening: 'Wird eröffnet…',
    here: (n) => `${n} da`,
    playing: (n) => `spielt · ${n}`,
    locked: 'gesperrt',
  },
  fr: {
    code: 'Code de la salle',
    codePlaceholder: '4 lettres affichées à l’écran',
    roomsOpen: 'Salles ouvertes',
    noRooms: 'Pas encore de salle publique : ouvres-en une.',
    openNew: '＋ Ouvrir une nouvelle salle',
    openCode: (c) => `＋ Ouvrir la salle ${c}`,
    opening: 'Ouverture…',
    here: (n) => `${n} ici`,
    playing: (n) => `en jeu · ${n}`,
    locked: 'verrouillée',
  },
  pt: {
    code: 'Código da sala',
    codePlaceholder: '4 letras do ecrã',
    roomsOpen: 'Salas abertas agora',
    noRooms: 'Ainda não há salas públicas: abre uma.',
    openNew: '＋ Abrir uma sala nova',
    openCode: (c) => `＋ Abrir a sala ${c}`,
    opening: 'A abrir…',
    here: (n) => `${n} cá`,
    playing: (n) => `a jogar · ${n}`,
    locked: 'trancada',
  },
};
export function roomStrings(lang: JoinLang): RoomStrings {
  return ROOM_L10N[lang];
}
/** The device's language (the SDK's store: the join pills, the 🎨 sheet and every screen share it). */
export function joinLang(): JoinLang {
  return getLang();
}
export function setJoinLang(lang: JoinLang): void {
  setLang(lang);
}
/** I-076 C: the phone lobby's two lines follow the same choice. */
const LOBBY_L10N: Record<Exclude<JoinLang, 'en'>, { waitingForVip: string; addBot: string }> = {
  es: { waitingForVip: 'Esperando a que el VIP elija un juego…', addBot: 'Añadir un bot' },
  de: { waitingForVip: 'Warten, bis der VIP ein Spiel wählt…', addBot: 'Bot hinzufügen' },
  fr: { waitingForVip: 'En attente que le VIP choisisse un jeu…', addBot: 'Ajouter un bot' },
  pt: { waitingForVip: 'À espera que o VIP escolha um jogo…', addBot: 'Adicionar um bot' },
};
export function lobbyStrings(
  lang: JoinLang = joinLang(),
): Omit<typeof t.lobby, 'waitingForVip' | 'addBot'> & { waitingForVip: string; addBot: string } {
  if (lang === 'en' || lang === 'es') return textsFor(lang).lobby;
  return { ...textsFor('en').lobby, ...LOBBY_L10N[lang] };
}
/** The join strings for a language: English plus the table's overrides. */
export function joinStrings(lang: JoinLang = joinLang()): JoinAll {
  if (lang === 'en' || lang === 'es') return textsFor(lang).join as JoinAll;
  return { ...textsFor('en').join, ...JOIN_L10N[lang] } as JoinAll;
}
