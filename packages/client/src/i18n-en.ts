// English for every shell string: the source every translation mirrors (i18n-es.ts), and the
// fallback for any language without a table. Read through `t` (i18n.ts), which picks the device's.
// The phone's newer sections live in i18n-en-phone.ts (this file's line cap) and are spread in.
import { enPhone } from './i18n-en-phone';
import { ordinal } from './ordinal';

export const en = {
  ...enPhone,
  appName: 'PartyBox',
  appShort: 'PB',
  join: {
    title: 'Join the party',
    name: 'Your name',
    namePlaceholder: 'e.g. Sam',
    // I-741 C: the name is taken because your own phone froze — claim the seat
    takeSeat: 'That’s me — take my seat',
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
    /** I-744 A: after a restart with one open room, that room is filled in. */
    restartedTo: (code: string) =>
      `The party started over — the room is ${code} now. Tap Join to get back in.`,
    noRooms: 'No room is open right now. Start the server and open /tv on the big screen.',
    askRoom: 'Ask the VIP to make room.',
    askUnlock: 'Ask the VIP to unlock it.',
    roomFull: 'Room is full',
    roomLocked: 'Room is locked',
    nameTakenBy: (name: string) => `That name is taken — ${name} is already in.`,
    example: (name: string) => `e.g. ${name}`,
    preview: 'preview',
    howSeen: 'How the room sees you',
    language: 'Language',
    /** The language pills' group label (screen readers). */
    languageGroup: 'language',
    avatarTaken: (avatar: string) => `${avatar} (someone in the room has it)`,
    pickColour: 'Pick a colour',
    colour: (n: number, taken: boolean) =>
      `colour ${n}${taken ? ' (someone in the room has it)' : ''}`,
    takenBadge: 'in',
    thisMonth: 'this month',
    yourPhoto: 'your photo',
    // I-793 F: the one-screen join — the room line, the strip's and the dots' labels
    roomLabel: 'Room',
    peopleIn: (n: number) =>
      n === 0 ? 'nobody is in yet' : n === 1 ? '1 person is in' : `${n} people are in`,
    faceSwipe: 'Face · swipe for more',
    colourLabel: 'Colour',
    openFailed: 'Could not open a room.',
    noAnswer: 'The host did not answer.',
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
    leave: '🚪 Leave',
    leaveConfirm: 'Leave?',
    dismissTips: 'dismiss tips',
    nudged: '👋 Nudged',
    nudge: (name: string) => `👋 Hurry up, ${name}!`,
    setup: '🎨 Set up your phone while you wait',
    playersList: 'players',
  },
  selecting: {
    vipChoosing: (name: string) => `${name} is choosing a game…`,
    back: 'Back',
    start: 'Start',
    /** I-187 B: the deck chip on the selected card ("🔞 WILD deck — change"). */
    keyChip: (mark: string, deck: string) => `${mark} ${deck} deck — change`,
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
    less: (label: string) => `less ${label}`,
    more: (label: string) => `more ${label}`,
    noneTicked: 'None ticked: the whole category',
    ticked: (n: number) => `${n} ticked`,
    theVip: 'The VIP',
    lastRecap: (game: string, code: string) => `📼 Open the last recap (${game}, room ${code})`,
    phoneOnly: 'Phone only',
    phoneOnlyOn: 'the phones show what the TV would',
    phoneOnlyOff: 'the TV is the stage',
    games: 'games',
    // I-763 B: the picker card's tuned line and the sheet's reset link
    tuned: (list: string) => `Your settings: ${list}`,
    tunedMore: (n: number) => `+${n} more`,
    tunedOn: 'on',
    tunedOff: 'off',
    resetDefaults: 'Reset to defaults',
  },
  results: {
    title: 'Results',
    winner: (name: string) => `${name} wins!`,
    // I-476: one word for a shared first place, whatever its size — "share first"
    winners: (names: string) => `${names} share first!`,
    /** Two tied winners' names, for `winners`. */
    pair: (a: string, b: string) => `${a} & ${b}`,
    tieAmong: (names: string, others: number) =>
      `${names} & ${others} ${others === 1 ? 'other' : 'others'} share first!`,
    /** I-153 B: bots tied with people take no naming slot (`names` comma-joined). */
    tieWithBots: (names: string, bots: number) =>
      `${names} & the ${bots === 1 ? 'bot' : 'bots'} share first!`,
    /** I-153 C: a tie with no person in it (a lone bot winner still gets its name). */
    botTie: 'The bots share first — nobody home?',
    tie: 'Everyone shares first!',
    over: 'Game over',
    show: "That's the show!",
    scorelessHint: 'No points in this game — the books on the TV are the result.',
    /** A "phone only" room has no TV to point at (the owner, 2026-09-22). */
    scorelessHintPhones: 'No points in this game — the books are the result.',
    nobodyScored: 'The game ended before anyone could.',
    nobody: 'Nobody scored',
    noBingos: 'No bingos this time',
    playAgain: 'Play again',
    newGame: 'New game',
    lobby: 'Back to lobby',
    waitingForVip: 'Waiting for the VIP…',
    waitingFor: (name: string) => `Waiting for ${name}…`,
    youWin: 'You win! 🏆',
    /** I-476: a co-winner's own line — who they share it with ("Sam", "Sam & 1 other"). */
    youTie: (with_: string) => `You share first with ${with_}! 🏆`,
    yourPlace: (rank: number, score: number) => `You finished ${ordinal(rank)} · ${score} pts`,
    /** I-476: a place held with others. */
    yourPlaceTied: (rank: number, score: number) => `Tied ${ordinal(rank)} · ${score} pts`,
    /** "Sam & 2 others" (the rest of a shared first, for `youTie`). */
    andOthers: (name: string, others: number) =>
      `${name} & ${others} ${others === 1 ? 'other' : 'others'}`,
    /** I-155 A: an award you won, on your own phone ("Your card of the night"). */
    yourAward: (title: string) => `Your ${title.charAt(0).toLowerCase()}${title.slice(1)}`,
    /** I-155 C: the votes your cards took, round by round ("2 · 0 · 3"). */
    myVotes: (list: string) => `your votes: ${list}`,
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
    tipsAgain: 'Show the tips again',
    tipsAgainLabel: 'show the VIP tips again',
    roomSize: 'Room size',
    roomSizeGroup: 'room size',
    smaller: 'smaller room',
    bigger: 'bigger room',
    lockAtSize: (n: number) => `Lock at this size (${n})`,
    listed: '🔓 Public — listed for anyone',
    unlisted: '🔒 Private — code only',
  },
  paused: {
    other: (name: string) => `Paused — ${name} will resume the game`,
    vip: 'Paused — open ★ VIP and tap Resume',
  },
  spectator: {
    title: 'Waiting for the next game',
    hint: 'You joined mid-game — you are in as soon as this one ends.',
  },
  /** I-755 A: this phone has PartyBox open in another tab, which holds the seat. */
  otherTab: {
    title: 'PartyBox is open in another tab',
    body: 'This phone is already in the game in another tab. Use that one — or tap below to play here (the other tab will step aside).',
    playHere: 'Play here instead',
  },
  connection: {
    reconnecting: 'Reconnecting…',
    /** The link banner with the server's grace left ("Reconnecting… 1:42 left", I-089 C). */
    reconnectingLeft: (mmss: string) => `Reconnecting… ${mmss} left`,
    connecting: 'Connecting…',
    connected: 'Connected',
    /** The header dot's label, by the link's state (flapFree.ts `linkLabel`). */
    dot: { connecting: 'connecting', connected: 'connected', reconnecting: 'reconnecting' },
    loadingGame: 'Getting the game ready…',
    lostServer: 'Lost the PartyBox server — reconnecting…',
    /** The owner (2026-09-22): the banner ends here instead of vanishing, so a flapping link
     *  cannot strobe "Reconnecting…" over and over. */
    backOnline: '✓ Back online',
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
    /** I-744 B: the banner after a server restart, around the new room code. */
    restartedBefore: 'PartyBox restarted — this is a new room,',
    restartedAfter: 'Phones: tap Join to get back in.',
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
    // I-746 B/C: every phone went quiet mid-game
    asleep: "Everyone's phone is asleep — wake one to carry on.",
    asleepEnds: 'If nobody is back in 5 minutes, the game ends.',
    asleepHint: 'It carries on as soon as a phone is back',
    home: 'Home',
    homeTitle: 'Home: back to the lobby (from the lobby: start over, everyone rejoins)',
    homeConfirm: 'Click again to go home',
    homeConfirmReset: 'Click again to start over',
    homeOff: 'Home needs the server started with --dev-api',
    homeFailed: 'Could not reach the server',
  },
} as const;

/** `en`'s shape with every string widened: a translation fills the same slots. */
type Widen<T> = T extends string
  ? string
  : T extends (...args: infer A) => infer R
    ? (...args: A) => Widen<R>
    : { readonly [K in keyof T]: Widen<T[K]> };
export type Texts = Widen<typeof en>;
