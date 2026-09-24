// English for the phone's newer sections — the share sheet, the 🎨 sheet's rows, the tips, the
// theme and avatar names — split from i18n-en.ts (its line cap) and spread into `en` there, so `t`
// and the Spanish twin (i18n-es-phone.ts) see one shape. Imports nothing.
export const enPhone = {
  share: {
    button: '🔗 Share',
    sheet: 'share the room',
    message: (code: string) => `Join my PartyBox room ${code}`,
    shared: 'Shared',
    copied: 'Copied',
    copyFailed: 'Copy failed',
    messages: '💬 Messages',
    mail: '✉️ Mail',
    copyLink: '📋 Copy the link',
    localOnly:
      'This link works on this Wi-Fi only. For friends somewhere else, open PartyBox from the https link and share from there.',
  },
  /** The 🎨 sheet's phone rows (PhoneSettings). */
  phone: {
    music: 'Music on this phone',
    musicLevel: 'Music volume',
    leave: 'Leave the room',
    leaveConfirm: 'Leave the room?',
    tapAgain: 'tap again',
    tvSounds: 'TV sounds on this phone',
  },
  /** S-004 B: what the phone's music is on right now. */
  music: {
    lobbySet: 'Lobby set',
    gameSet: (game: string) => `${game}'s set`,
    anyGameSet: "the game's set",
    quietForNow: 'quiet for now',
    roomQuiet: 'the room is quiet',
  },
  /** I-082 A: the VIP's first-room tips, by id (vipTips.ts). */
  tips: {
    bots: 'Add bots to fill empty seats — they play for real.',
    crown: 'Tap your ★ VIP badge for pause, lock and kick.',
    recap: 'Recaps save to the host PC — switch it off on the game picker.',
  },
  /** The theme names and hints (theme.ts ids). */
  themes: {
    night: { label: 'Neon Night', hint: 'the default — dim room' },
    daylight: { label: 'Daylight', hint: 'bright room, light background' },
    arcade: { label: 'Retro Arcade', hint: 'magenta + cyan on black' },
    cabin: { label: 'Cozy Cabin', hint: 'warm browns and gold' },
    contrast: { label: 'High Contrast', hint: 'black, white, yellow' },
  },
  /** The faces' names, for screen readers (AVATAR_IDS). */
  avatars: {
    fox: 'fox',
    owl: 'owl',
    frog: 'frog',
    cat: 'cat',
    panda: 'panda',
    koala: 'koala',
    penguin: 'penguin',
    octopus: 'octopus',
    lion: 'lion',
    bee: 'bee',
    whale: 'whale',
    sloth: 'sloth',
    robot: 'robot',
    ghost: 'ghost',
    dino: 'dino',
    unicorn: 'unicorn',
    pumpkin: 'pumpkin',
    snowflake: 'snowflake',
    heart: 'heart',
  },
  /** A spectator's bench line ("Wisecrack · vote"): the games' phase ids as words — in English the
   *  id itself, as the bench always showed it. An id missing here shows as the id. */
  phases: {
    intro: 'intro',
    play: 'play',
    check: 'check',
    bingo: 'bingo',
    scoreboard: 'scoreboard',
    final: 'final',
    done: 'done',
    pick: 'pick',
    answer: 'answer',
    reveal: 'reveal',
    judge: 'judge',
    result: 'result',
    draw: 'draw',
    pass: 'pass',
    guess: 'guess',
    show: 'show',
    summary: 'summary',
    question: 'question',
    wager: 'wager',
    vote: 'vote',
    scores: 'scores',
  },
  playing: {
    scoresSoFar: 'scores so far',
    unknownGame: (id: string) => `Unknown game "${id}"`,
    unknownHint: 'Run pnpm gen-registry and restart.',
    snag: 'This game hit a snag.',
    reload: 'Reload',
  },
  /** I-347: the returning host whose VIP passed on mid-game (ControllerShell). */
  reclaim: {
    tookOver: (name: string) => `${name} took over as VIP while you were away`,
    someone: 'Someone',
    takeBack: 'Take it back',
  },
} as const;
