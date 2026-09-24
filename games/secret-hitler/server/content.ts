// Typed access to content/*.json. Content is imported statically (bundled, no I/O at runtime).
// M1 has only the About pack; the recap (M4) prints its credit line.
import { aboutPackSchema } from '../content/schema';
import type { AboutPack } from '../content/schema';
import aboutJson from '../content/about.json' with { type: 'json' };

// Parsed once at module load; a broken pack fails fast at import time (and in the contract suite).
export const ABOUT: AboutPack = aboutPackSchema.parse(aboutJson);
