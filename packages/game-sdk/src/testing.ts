// `@partybox/game-sdk/testing` — the contract suite's building blocks, for the sim, the e2e harness
// and the stress session. Node-only (reads games/ from disk). Games must never import this.
export { fuzzEvents, fuzzOnce } from './contract-tests/fuzz';
export { fnv1a, hashState, jsonSize, stableStringify } from './contract-tests/hash';
export { GAMES_DIR, REPO_ROOT, listGameIds, loadAllGames, loadGame } from './contract-tests/load';
export type { ContractConfig, LoadedGame } from './contract-tests/load';
export { T0, defaultSettingsOf, makePlayers, playGame, replay } from './contract-tests/play';
export type { PlayOptions, PlayResult, PlayStrategy } from './contract-tests/play';
