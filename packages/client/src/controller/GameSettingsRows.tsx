// S-003 in the 🎨 sheet: one row per game that has its own phone setup (the catalog's
// `phoneSettings`), closed until tapped — the panel is that game's own download (ADR-050), so the
// sheet never pulls a game's code onto a phone that does not open it.
import { useState } from 'react';
import type { JSX } from 'react';
import { useCatalog } from '../catalog';
import { useGame } from '../game-loader';
import pickerStyles from '../ThemePicker.module.css';

function Panel({ id }: { id: string }): JSX.Element {
  const { module } = useGame(id, 'settings');
  const Settings = module?.PhoneSettings;
  // Holds a little room while the panel arrives, so the sheet does not jump twice.
  return Settings ? <Settings /> : <div className={pickerStyles.gamePanelWait} aria-busy="true" />;
}

export function GameSettingsRows(): JSX.Element | null {
  const { games } = useCatalog();
  const [open, setOpen] = useState<string | null>(null);
  const withPanel = games.filter((g) => g.phoneSettings);
  if (withPanel.length === 0) return null;
  return (
    <>
      {withPanel.map((g) => (
        <section key={g.id} className={pickerStyles.gameSection}>
          <button
            type="button"
            className={pickerStyles.toggle}
            aria-expanded={open === g.id}
            onClick={() => setOpen(open === g.id ? null : g.id)}
          >
            <span className={pickerStyles.toggleGlyph} aria-hidden>
              {g.icon}
            </span>
            {g.name}
            <span className={pickerStyles.toggleState} aria-hidden>
              {open === g.id ? '▴' : '▾'}
            </span>
          </button>
          {open === g.id ? <Panel id={g.id} /> : null}
        </section>
      ))}
    </>
  );
}
