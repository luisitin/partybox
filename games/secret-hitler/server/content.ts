// Typed access to content/*.json. Content is imported statically (bundled, no I/O at runtime).
// The About pack (the recap prints its credit line) and the newspaper headlines.
import { aboutPackSchema, headlinesPackSchema } from '../content/schema';
import type { AboutPack, HeadlinesPack } from '../content/schema';
import aboutJson from '../content/about.json' with { type: 'json' };
import headlinesJson from '../content/headlines.json' with { type: 'json' };

// Parsed once at module load; a broken pack fails fast at import time (and in the contract suite).
export const ABOUT: AboutPack = aboutPackSchema.parse(aboutJson);
export const HEADLINES: HeadlinesPack = headlinesPackSchema.parse(headlinesJson);
