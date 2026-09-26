import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { SettingSpec } from '@partybox/shared';
import { SettingField } from './SettingField';

const options = [
  { value: 'none', label: 'No reader' },
  { value: 'sky', label: 'English reader', lang: 'en' as const },
  { value: 'dora', label: 'Spanish reader', lang: 'es' as const },
  { value: 'alex', label: 'Another Spanish reader', lang: 'es' as const },
];

const render = (defaultValue: string, value: string, contentLang?: 'en' | 'es'): string =>
  renderToStaticMarkup(
    <SettingField
      spec={
        {
          key: 'reader',
          type: 'select',
          label: 'Reader',
          default: defaultValue,
          options,
        } as SettingSpec
      }
      value={value}
      onChange={() => {}}
      contentLang={contentLang}
    />,
  );

describe('language-specific select options', () => {
  it('shows every option when the content language is unknown', () => {
    const html = render('sky', 'sky');
    expect(html).toContain('value="sky" selected=""');
    expect(html).toContain('value="dora"');
  });

  it('shows an offered default when the stored value belongs to the other language', () => {
    const html = render('none', 'sky', 'es');
    expect(html).toContain('value="none" selected=""');
    expect(html).not.toContain('value="sky"');
  });

  it('otherwise shows the first option for the content language', () => {
    const html = render('sky', 'sky', 'es');
    expect(html).toContain('value="dora" selected=""');
    expect(html).not.toContain('value="sky"');
  });
});
