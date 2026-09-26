// `PARTYBOX_DEMO_CATALOG=1` (captures and design reviews only): the nine games of the owner's game
// pack appear in the catalog beside the real five — names, icons, taglines, tags, sizes and
// how-to-play from docs/game-pack/<id>/SPEC.md — so the picker can be filmed at 14 games before
// they exist. They are not playable: choosing one is refused as an unknown game.
import type { GameManifest } from '@partybox/shared';

type Demo = [
  id: string,
  name: string,
  icon: string,
  tagline: string,
  players: [number, number],
  minutes: number,
  tags: GameManifest['tags'],
  needs: GameManifest['presence']['needs'],
  howToPlay: [string, string, string],
];

const DEMOS: readonly Demo[] = [
  ['imposter', 'Imposter', '🕵️', "One of you doesn't know the word.", [4, 16], 10, ['bluff', 'hidden-roles', 'words'], 'anywhere', ['Everyone gets the secret word except the imposter, who only knows the category.', 'Everyone types one word about it. The imposter has to fake it.', 'Vote out the imposter. A caught imposter can still steal it by guessing the word.']],
  ['herd-mind', 'Herd Mind', '🐑', "Think like the herd. Don't be the odd sheep.", [3, 16], 8, ['words'], 'anywhere', ['A question appears. Pick the answer you think most people will pick.', 'Everyone in the biggest group scores a point. A tie for biggest scores nothing.', "Alone with your answer? You get the Black Sheep, and can't win while you hold it."]],
  ['fake-out', 'Fake-Out', '🎭', 'Write a fake answer. Find the real one.', [2, 12], 12, ['bluff', 'trivia', 'comedy'], 'anywhere', ['A strange true fact appears with a blank. Type a fake answer that sounds real.', 'All answers are mixed with the truth. Pick the one you think is real.', 'Score for finding the truth, and for every player your fake fools.']],
  ['who-said-it', 'Who Said It', '🗣️', 'Everyone answers. Everyone guesses who wrote what.', [3, 16], 10, ['comedy', 'bluff'], 'anywhere', ['Everyone answers the same question on their phone.', 'The answers appear one at a time. Tap who you think wrote each one.', 'Score for every right guess, and for every player your answer fools.']],
  ['tune-in', 'Tune In', '📻', 'One clue. Everyone guesses where it lands.', [2, 16], 12, ['words', 'co-op', 'teams'], 'anywhere', ['One player, the psychic, secretly sees a target on a dial between two opposites.', 'The psychic gives a clue that belongs at that spot. Everyone else slides their dial.', 'The closer to the target, the more points, for you and for the psychic.']],
  ['hive-rank', 'Hive Rank', '🐝', 'Rank five things the way the hive would.', [2, 16], 5, ['comedy'], 'anywhere', ['You get five things and a question. Put them in order.', "Everyone's orders are combined into the hive's order.", "Score 2 for each thing in the hive's exact spot, and 1 if you're one spot off."]],
  ['echo', 'Echo', '🔁', 'One clue each. Same clue? Both vanish.', [3, 10], 12, ['co-op', 'words'], 'anywhere', ['One player guesses; everyone else sees the secret word and writes a one-word clue.', 'Clues that match each other vanish before the guesser sees them.', "Guess the word from what's left. The whole group wins or loses together."]],
  ['blind-auction', 'Mystery Box', '📦', "Bet on what's inside the mystery box.", [2, 16], 8, ['bluff', 'strategy'], 'anywhere', ['A mystery box shows what might be inside, with the odds of each.', "Bet your coins in secret on what's inside. Long shots pay big.", 'The box opens and right calls get paid. Most coins at the end wins.']],
  ['spy-grid', 'Spy Grid', '🗂️', 'One-word clues. Find your agents. Avoid the trap.', [2, 16], 18, ['teams', 'words', 'strategy'], 'anywhere', ['Two teams, 25 words. Only each spymaster knows which words are their agents.', 'Your spymaster gives a clue and a number, like "Ocean, 3". Tap the words that match.', 'Find all your agents first. Touch the assassin and your team loses on the spot.']],
  ['nightfall', 'Nightfall', '🌙', 'By night the wolves hunt. By day, the village votes.', [6, 16], 20, ['hidden-roles', 'bluff'], 'voice-if-remote', ['Secret roles: a few wolves hide among the villagers. Only the wolves know each other.', 'At night the wolves pick a victim; the seer and the doctor use their powers.', 'By day, argue and vote someone out. The village wins when the wolves are gone.']],
]; // prettier-ignore

/** The pack's nine games as manifests, dated `addedOn` so they carry the NEW badge. */
export function demoManifests(addedOn: string): GameManifest[] {
  return DEMOS.map(([id, name, icon, tagline, [minPlayers, maxPlayers], minutes, tags, needs, howToPlay]) => ({
    id,
    name,
    icon,
    tagline,
    description: tagline,
    howToPlay,
    version: '0.0.0',
    minPlayers,
    maxPlayers,
    estimatedMinutes: minutes,
    tags,
    presence: { needs },
    addedOn,
    settings: [],
    supportsBots: true,
  })); // prettier-ignore
}
