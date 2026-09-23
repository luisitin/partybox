# Owner request 2026-09-22 — every screen translatable to Spanish

> "The language fields should affect more when you load into lobby. All text should be at least
> translatable to Spanish when the language is changed."

## What shipped (ADR-044)

- One language per device (`@partybox/game-sdk/ui` `lang.ts`): `?lang=` → remembered → browser. The
  join pills set it; the phone's 🎨 sheet and the TV host bar's 🌐 button change it later. A switch
  re-renders in place (no remount: the 🎨 sheet stays open, a typed answer survives).
- Shell: `t` is the typed English source (`i18n-en*.ts`) with a complete Spanish twin (`i18n-es*.ts`).
- Games, SDK components, TV shell: English-keyed tables, `useT(STRINGS)` → `L('…')`. Game tables also
  translate the manifest's picker lines. About 1,100 sentences in all (Bingo 250, Blanks 176, the phone
  shell 172, Lightning 163, Broken Pencil 134, Wisecrack 97, the TV shell and SDK the rest).
- Server sentences stay English on the wire and translate at display: `serverText` (engine errors,
  toasts, Start reasons) and `L.sent` / the running game's table (awards, pattern names, categories).
  Number placeholders match digits only; the shell's fallback skips patterns with under 5 letters of
  literal text, so an unknown sentence is shown as sent rather than half-translated.
- Stays English on purpose: deck content (cards, prompts, questions, words, caller nicknames), the
  caller's recorded voice, brand and game names, recap files saved on the host PC.
- Broken Pencil: accents fold and Spanish articles drop when comparing a guess to the word.

## How it was checked

- 14 agents: one translator per area (5 games, phone shell, TV shell), then an adversarial reviewer
  per area that re-read every file (98 findings, most fixed in place; the rest listed below).
- `scripts/i18n-coverage.test.ts`: every `L('…')` sentence and manifest line has its Spanish, no
  runtime-built keys, placeholders kept (all 8 areas + the template game).
- `packages/client/src/i18n.test.ts`: no Spanish slot of `t` equals its English.
- English renders unchanged (render diffs by the Bingo and phone reviewers), except three grammar
  fixes: "1 point", "1 number called", "1 earlier page".
- Browser sweep (Spanish TV `?lang=es` + two Spanish phones + 2 bots, every game, normal and phone
  only, ~60 s of play each): visible text and aria-label/title/placeholder/alt collected every 1.2 s;
  0 English lines outside game content and names, 0 page errors.

## Known, left as is

- German, French and Portuguese cover join and lobby only; elsewhere they fall back to English.
- Broken Pencil words are English: a group guessing in Spanish breaks chains (the VIP's "close enough"
  covers it).
- Blanks joins two names with "y" even before an i-sound ("Ana y Iván", not "e").
- The sweep harness stalled several times on this machine while earlier runs' orphaned headless
  browsers were stuck; the probe now times out and retries a stalled phone load.
