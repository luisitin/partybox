// Every user-facing string in the core screens (BL-007 localisation hook). Keep the voice short,
// friendly and consistent; games own their own copy.

/** 1st, 2nd, 3rd, 4th … 11th–13th, 21st. */
export function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  const suffix = { 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] ?? 'th';
  return `${n}${suffix}`;
}

export const t = {
  appName: 'PartyBox',
  appShort: 'PB',
  join: {
    title: 'Join the party',
    name: 'Your name',
    namePlaceholder: 'e.g. Sam',
    avatar: 'Pick an avatar',
    usePhoto: 'Use a photo',
    useFace: 'Use a face instead',
    photoFailed: "That picture couldn't be read — try another.",
    code: 'Room code',
    codePlaceholder: '4 letters from the TV',
    joiningRoom: 'Joining room',
    submit: 'Join',
    needName: 'Enter a name to join',
    needCode: 'Enter the 4-letter code',
    joining: 'Joining…',
    tryAgain: 'Try another.',
    resuming: 'Reconnecting…',
    offline: 'Connecting…',
    kicked: 'The VIP removed you from the room. You can join again.',
    restarted: 'The party started over — tap Join to get back in.',
    noRooms: 'No room is open right now. Start the server and open /tv on the big screen.',
  },
  lobby: {
    title: 'Lobby',
    waitingForVip: 'Waiting for the VIP to pick a game…',
    waitingFor: (name: string) => `Waiting for ${name} to pick a game…`,
    waitingForFirst: 'Waiting for the first player…',
    youAreVip: 'You are the VIP — pick a game when everyone is in.',
    pickGame: 'Pick a game',
    players: (n: number, cap: number) => `${n} / ${cap} players`,
    scan: 'Scan to join',
    orOpen: 'or open',
    room: 'Room',
    locked: 'Room locked',
    full: 'Room full',
    addBot: 'Add a bot',
    addBotHint: 'Plays for you in games marked 🤖 Bots welcome — up to 4 per person.',
    botsMaxed: '4 bots max',
    removeBot: 'Remove',
    removeBotsFirst: (n: number) => `remove ${n} bot${n === 1 ? '' : 's'} first`,
    botsWelcome: 'Bots welcome',
    noBots: 'No bots',
  },
  selecting: {
    vipChoosing: (name: string) => `${name} is choosing a game…`,
    back: 'Back',
    start: 'Start',
    settings: 'Settings',
    players: (min: number, max: number) => `${min}–${max} players`,
    minutes: (m: number) => `~${m} min`,
    recording: 'Save a recap on the host PC',
    recordingHint: 'Drawings, answers and scores of each game, for feedback later',
    recordingOff: 'Not saving this game',
    musicOnPhones: 'Music on every phone',
    musicOnPhonesHint:
      'The room’s music plays on each phone too (each phone can still mute itself)',
    musicOnPhonesOff: 'Music on the TV only — a phone can turn its own on in 🎨',
  },
  results: {
    title: 'Results',
    winner: (name: string) => `${name} wins!`,
    winners: (names: string) => `${names} win!`,
    tieAmong: (names: string, others: number) =>
      `${names} & ${others} ${others === 1 ? 'other' : 'others'} tie!`,
    /** I-153 B: bots tied with people take no naming slot. */
    tieWithBots: (names: string, bots: number) =>
      `${names} & the ${bots === 1 ? 'bot' : 'bots'} tie!`,
    tie: "It's a tie!",
    over: 'Game over',
    show: "That's the show!",
    scorelessHint: 'No points in this game — the books on the TV are the result.',
    nobodyScored: 'The game ended before anyone could.',
    nobody: 'Nobody scored',
    playAgain: 'Play again',
    newGame: 'New game',
    lobby: 'Back to lobby',
    waitingForVip: 'Waiting for the VIP…',
    waitingFor: (name: string) => `Waiting for ${name}…`,
    youWin: 'You win! 🏆',
    youTie: 'You tie for first! 🏆',
    yourPlace: (rank: number, score: number) => `You finished ${ordinal(rank)} · ${score} pts`,
  },
  vip: {
    menu: 'VIP menu',
    skip: 'Skip phase',
    pause: 'Pause',
    resume: 'Resume',
    end: 'End game',
    kick: 'Kick',
    transfer: 'Make VIP',
    lock: 'Lock room',
    unlock: 'Unlock room',
    close: 'Close',
    confirm: (action: string) => `Confirm: ${action}`,
    badge: 'VIP',
    groupGame: 'Game',
    groupRoom: 'Room',
    groupPlayers: 'Players',
  },
  paused: {
    other: (name: string) => `Paused — ${name} will resume the game`,
    vip: 'Paused — open ★ VIP and tap Resume',
  },
  spectator: {
    title: 'Waiting for the next game',
    hint: 'You joined mid-game — you are in as soon as this one ends.',
  },
  connection: {
    reconnecting: 'Reconnecting…',
    connecting: 'Connecting…',
    loadingGame: 'Getting the game ready…',
    lostServer: 'Lost the PartyBox server — reconnecting…',
    seconds: (n: number) => `${n} s`,
    secondsLeft: (n: number) => `${n} seconds left`,
    hurry: 'Hurry!',
  },
  theme: {
    title: 'Theme',
    done: 'Done',
  },
  controller: {
    phoneSound: 'Sounds on this phone',
    vibration: 'Vibration',
    noVibration: 'Vibration is not available in this browser (iPhones have no vibration API).',
    on: 'On',
    off: 'Off',
    padPaper: 'Drawing paper',
    padPencil: 'Drawing pencil',
    paperRuled: 'Ruled',
    paperPlain: 'Plain',
    pencilSoft: 'Pencil',
    pencilPen: 'Pen',
  },
  host: {
    title: 'Host',
    pickGame: 'Pick a game',
    skip: 'Skip / Next',
    removeBots: (n: number) => (n === 1 ? 'Remove bot' : `Remove ${n} bots`),
    choosing: 'Pick a game and its settings here, or from the VIP phone.',
    vipAway: (next: string, seconds: number) => `VIP away — passes to ${next} in ${seconds} s`,
    vipAwayNobody: 'VIP away — nobody else to hand over to',
  },
  tv: {
    tapToStart: 'Tap anywhere for sound',
    tapHint: 'the party works without it',
    mute: 'Mute',
    unmute: 'Unmute',
    enableSound: 'Sound is off — tap to enable',
    soundOn: 'Sound on',
    soundOffToast: 'Sound off', // I-069 A
    soundOnToast: 'Sound on',
    fullscreen: 'Fullscreen',
    paused: 'Paused',
    pausedHint: (name: string) => `${name} can resume from the VIP menu`,
    home: 'Home',
    homeTitle: 'Home: back to the lobby (from the lobby: start over, everyone rejoins)',
    homeConfirm: 'Click again to go home',
    homeConfirmReset: 'Click again to start over',
    homeOff: 'Home needs the server started with --dev-api',
    homeFailed: 'Could not reach the server',
  },
} as const;

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
const LANG_KEY = 'partybox:lang';
export function joinLang(): JoinLang {
  if (typeof window === 'undefined') return 'en';
  // `?lang=es` on the join link wins (a host can hand out a link in a language).
  const fromUrl = new URLSearchParams(window.location.search)
    .get('lang')
    ?.slice(0, 2)
    .toLowerCase();
  if (fromUrl && (JOIN_LANGS as readonly string[]).includes(fromUrl)) {
    setJoinLang(fromUrl as JoinLang);
    return fromUrl as JoinLang;
  }
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored && (JOIN_LANGS as readonly string[]).includes(stored)) return stored as JoinLang;
  } catch {
    /* private mode */
  }
  const tag = (navigator.language || 'en').slice(0, 2).toLowerCase();
  return (JOIN_LANGS as readonly string[]).includes(tag) ? (tag as JoinLang) : 'en';
}
export function setJoinLang(lang: JoinLang): void {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    /* private mode */
  }
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
  return lang === 'en' ? t.lobby : { ...t.lobby, ...LOBBY_L10N[lang] };
}
/** The join strings for a language: English plus the table's overrides. */
export function joinStrings(lang: JoinLang = joinLang()): JoinAll {
  return lang === 'en' ? t.join : { ...t.join, ...JOIN_L10N[lang] };
}
