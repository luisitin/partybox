// Ids the host mints for players and bots. Web Crypto only, so the same host loop runs under Node
// (the LAN server) and in a browser tab (the web build, ADR-034) — `node:crypto` would not bundle.
const webcrypto = globalThis.crypto;

export interface MintedPlayer {
  playerId: string;
  token: string;
}

export function mintPlayerId(): MintedPlayer {
  return { playerId: webcrypto.randomUUID(), token: randomHex(24) };
}

/** A seed for the room-code RNG (`roomCodeFrom`), so codes differ between processes and tabs. */
export function randomSeed(): number {
  return webcrypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
}

function randomHex(bytes: number): string {
  const buffer = webcrypto.getRandomValues(new Uint8Array(bytes));
  return [...buffer].map((b) => b.toString(16).padStart(2, '0')).join('');
}
