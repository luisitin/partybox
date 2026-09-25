// English for the game picker (game pack Part 00 §1.3–1.5): the list, its filter chips, the About
// sheet and the chosen game's screen. Split from i18n-en.ts (its line cap) and spread into `en`
// there, so `t` and the Spanish twin (i18n-es-picker.ts) see one shape. Imports nothing.
export const enPicker = {
  picker: {
    playersPill: (n: number): string => `👥 ${n} ${n === 1 ? 'player' : 'players'}`,
    /** The filter chips, by tag (the catalog's tags; `anywhere` is the presence badge). */
    chips: {
      all: 'All',
      quick: 'Quick',
      words: 'Words',
      bluff: 'Bluff',
      teams: 'Teams',
      'co-op': 'Co-op',
      drawing: 'Drawing',
      trivia: 'Trivia',
      comedy: 'Comedy',
      classic: 'Classic',
      'hidden-roles': 'Hidden roles',
      strategy: 'Strategy',
      anywhere: 'Plays anywhere',
    },
    filters: 'Filter the games',
    players: (min: number, max: number): string => (min === max ? `👥 ${min}` : `👥 ${min}–${max}`),
    minutes: (m: number): string => `⏱ ${m} min`, // nbsp: never '15 / min' at 200 %
    needs: (min: number, n: number): string => `Needs ${min}+ · you have ${n}`,
    tooMany: (max: number, n: number): string => `Up to ${max} · you have ${n}`,
    noBots: 'Humans only · remove the bots',
    isNew: 'NEW',
    played: '↻ played',
    presence: {
      anywhere: 'Plays anywhere',
      'voice-if-remote': 'Needs a call if anyone’s remote',
      'same-room': 'Same room only',
    },
    about: (name: string): string => `About ${name}`,
    choose: (name: string): string => `Choose ${name}`,
    noMatch: 'No games match',
    clearFilters: 'Clear filters',
    // The About sheet
    close: 'Close',
    howToPlay: 'How to play',
    goodToKnow: 'Good to know',
    rowPlayers: 'Players',
    rowLength: 'Length',
    rowBots: 'Bots',
    rowWhere: 'Where',
    botsYes: 'Bots can fill seats',
    botsNo: 'Humans only',
    where: {
      anywhere: 'Plays anywhere, even with remote friends',
      'voice-if-remote': 'Needs a voice call if anyone is remote',
      'same-room': 'Everyone in the same room',
    },
    playersRange: (min: number, max: number): string =>
      min === max ? `${min} players` : `${min} to ${max} players`,
    aboutMinutes: (m: number): string => `About ${m} minutes`,
    chooseThis: 'Choose this game',
    suggest: '👍 Suggest',
    suggested: '👍 Suggested',
    loading: 'Loading…',
    // The chosen game
    allGames: '‹ All games',
    options: (n: number): string => `Game options (${n})`,
    guestChosen: (vip: string, game: string): string => `${vip} picked ${game}`,
    guestWaiting: (vip: string): string => `Waiting for ${vip} to start`,
    reading: (vip: string, game: string): string => `${vip} is reading about ${game}`,
  },
};
