# SPEC-002 — Names that differ only by Unicode form or homoglyphs are two different players

- **Severity:** SPEC (docs say "case-insensitive"; nothing about Unicode) / P3 if you consider it a bug
- **Game / phase:** engine + shared (`normalizeName`, `nameKey`)
- **Category:** Player chaos ("names differing only by case or unicode"), hostile content
- **Status:** OPEN — proposal below (touches `packages/shared`; small but changes join semantics)

## Repro

```
pnpm sim --room-chaos --runs 200 --seed 1
# note: join accepted "éva" next to look-alike "éva"   (NFC vs NFD)
```

Also accepted next to `Ana`: `Аna` (Cyrillic А), `ａｂｃ` vs `abc` (fullwidth), `Ana` vs `Ana` with
a ZWJ removed — the last one is handled (`INVISIBLE` strips ZW*/bidi), the others are not.

## Observed

`nameKey = name.toLocaleLowerCase()` (`packages/shared/src/ids.ts:51`); `normalizeName`
(`:45`) trims, collapses whitespace, strips controls/zero-width/bidi, but does not apply Unicode
normalisation. Two chips that render identically on the TV can belong to different players; a guest
can impersonate the VIP's name.

## Expected

docs/PROTOCOL.md: `name_taken` when "the name is taken"; engine test says "duplicate names
(case-insensitive)". The prompt for this session lists "names differing only by case or unicode" as an
attack to reject.

## Proposal (diff sketch, ~4 lines in shared + 1 test)

```ts
// ids.ts
export function normalizeName(raw: string): string | null {
  const cleaned = raw.normalize('NFKC').replace(INVISIBLE, '').replace(/\s+/g, ' ').trim();
  …
}
export function nameKey(name: string): string {
  return name.normalize('NFKC').toLocaleLowerCase();
}
```

NFKC folds fullwidth/compatibility forms and composes é; it does NOT fold Cyrillic/Latin homoglyphs.
For those, either accept the risk (LAN party, people see each other) or add a tiny confusables map
for the ~20 Cyrillic/Greek letters that look Latin (`а е о р с у х А В Е К М Н О Р С Т Х` …) applied in
`nameKey` only. Document the rule in docs/PROTOCOL.md next to `name_taken`.
