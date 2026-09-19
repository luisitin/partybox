// Settings coercion for the multiselect spec (ADR-034): unknown picks dropped, option order kept,
// picks outside the sibling select's group dropped, non-strings fall back to the default.
import { describe, expect, it } from 'vitest';
import { gameManifestSchema } from '@partybox/shared';
import { coerceSettings, defaultSettings } from './settings';

const manifest = gameManifestSchema.parse({
  id: 'quiz',
  name: 'Quiz',
  tagline: 'q',
  description: 'q',
  version: '1.0.0',
  minPlayers: 1,
  maxPlayers: 4,
  estimatedMinutes: 5,
  tags: [],
  settings: [
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      default: 'all',
      options: [
        { value: 'all', label: 'All' },
        { value: 'sports', label: 'Sports' },
        { value: 'stem', label: 'STEM' },
      ],
    },
    {
      key: 'topics',
      label: 'Topics',
      type: 'multiselect',
      default: '',
      groupBy: 'category',
      options: [
        { value: 'soccer', label: 'Soccer', group: 'sports' },
        { value: 'hockey', label: 'Hockey', group: 'sports' },
        { value: 'math', label: 'Math', group: 'stem' },
      ],
    },
  ],
});

describe('multiselect settings', () => {
  const base = defaultSettings(manifest);
  it('defaults to nothing picked', () => {
    expect(base).toEqual({ category: 'all', topics: '' });
  });
  it('keeps known picks of the current group, in option order, deduped', () => {
    expect(
      coerceSettings(manifest, base, { category: 'sports', topics: 'hockey,soccer,hockey,bogus' }),
    ).toEqual({ category: 'sports', topics: 'soccer,hockey' });
  });
  it('drops picks from another group and everything under "all"', () => {
    const sports = coerceSettings(manifest, base, { category: 'sports', topics: 'soccer,math' });
    expect(sports.topics).toBe('soccer');
    expect(coerceSettings(manifest, sports, { category: 'stem' }).topics).toBe('');
    expect(coerceSettings(manifest, base, { topics: 'soccer' }).topics).toBe('');
  });
  it('falls back to the default on a non-string', () => {
    expect(coerceSettings(manifest, base, { category: 'sports', topics: 3 as never }).topics).toBe(
      '',
    );
  });
});
