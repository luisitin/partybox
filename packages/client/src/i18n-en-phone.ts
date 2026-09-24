// English for the phone's newer sections — the share sheet, the 🎨 sheet's rows, the tips, the
// theme and avatar names — split from i18n-en.ts (its line cap) and spread into `en` there, so `t`
// and the Spanish twin (i18n-es-phone.ts) see one shape. Imports only the ordinal helper.
import { ordinal } from './ordinal';

type StepUnit = 'question' | 'round';
const plural = (unit: StepUnit): string => (unit === 'question' ? 'questions' : 'rounds');

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
  /** I-792 E: the lobby's title row ("Lobby · 6 of 16"), its ⋯ menu and the rotating line. */
  lobbyTop: {
    count: (n: number, cap: number) => `${n} of ${cap}`,
    more: 'More',
    everyoneIn: "Everyone's in? Pick a game. Bots can fill empty seats.",
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
  /** I-650: the vote for the next game (VoteRow, the lobby's tally, the picker's pills). */
  vote: {
    ask: 'What should we play next?',
    voted: '✓ Voted — tap another to change',
    label: 'Vote for the next game',
    leads: (game: string, n: number) => `🙋 ${game} leads · ${n} ${n === 1 ? 'vote' : 'votes'}`,
    want: (n: number) => `${n} want this`,
  },
  /** I-642 B: the picker's one-line Room row (the switches live in the ★ menu). */
  roomRow: {
    label: 'Room',
    recap: '📼 Recap',
    music: '🎵 Phone music',
    phoneOnly: '📱 Phone only',
    aria: (recap: boolean, music: boolean, phoneOnly: boolean) =>
      `Room: recap ${recap ? 'on' : 'off'}, music on every phone ${music ? 'on' : 'off'}, phone only ${phoneOnly ? 'on' : 'off'} — change`,
    betweenGames: 'Recap and Phone only change between games.',
  },
  /** I-667: the one-tap fix under "can't start", and a card's fit line ("12 here · remove 4 bots"). */
  fix: {
    removeToPlay: (n: number) => (n === 1 ? 'Remove 1 bot to play' : `Remove ${n} bots to play`),
    removeAll: (n: number) => (n === 1 ? 'Remove the bot' : `Remove the ${n} bots`),
    addToPlay: (n: number) => (n === 1 ? 'Add 1 bot to play' : `Add ${n} bots to play`),
    here: (n: number) => `${n} here`,
    removeShort: (n: number) => (n === 1 ? 'remove 1 bot' : `remove ${n} bots`),
    removeAllShort: (n: number) => (n === 1 ? 'remove the bot' : `remove the ${n} bots`),
    addShort: (n: number) => (n === 1 ? 'add 1 bot' : `add ${n} bots`),
  },
  /** I-791 D: the offline card and the one-beat "You're back" card (OfflineCard.tsx). */
  offline: {
    title: 'Reconnecting…',
    lost: "Your phone lost the party's Wi‑Fi.",
    heldFor: 'Your seat is held for',
    heldPlain: 'Your seat is held.',
    sent: '✓ Your answer was sent',
    notSent: "You haven't answered yet — you still can once you're back",
    back: "You're back",
    movedOn: 'The game moved on while you were away.',
    nothingMissed: "You didn't miss anything.",
    missed: (unit: StepUnit, from: number, to: number) =>
      from === to
        ? `You missed ${unit} ${from}.`
        : to === from + 1
          ? `You missed ${plural(unit)} ${from} and ${to}.`
          : `You missed ${plural(unit)} ${from}–${to}.`,
    where: (unit: StepUnit, n: number, of: number, seconds: number | null) =>
      seconds === null
        ? `This is ${unit} ${n} of ${of}.`
        : `This is ${unit} ${n} of ${of}: ${seconds} ${seconds === 1 ? 'second' : 'seconds'} left.`,
    secondsLeft: (seconds: number) => `${seconds} ${seconds === 1 ? 'second' : 'seconds'} left.`,
    standing: (rank: number, score: number) =>
      `You · ${ordinal(rank)} · ${score.toLocaleString('en-US')}`,
  },
} as const;
