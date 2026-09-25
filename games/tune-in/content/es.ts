// The Spanish banks (ADR-054). Session C hands them over as family.es.json + spicy.es.json
// ([f58857]). When they land: import and parse them here with spectrumEsPackSchema, add them to
// `packs` in schema.ts so the contract suite validates them, and drop step 2's "(Las pistas de los
// bots y la voz están en inglés.)" from manifest.es.json. Until then the list is empty, ES_READY is
// false and every room plays in English (the phones mark the bots' clues).
import type { SpectrumEsPack } from './schema';

export const ES_PACKS: readonly SpectrumEsPack[] = [];
