# For the design session — noticed incidentally during stress loop 1 (2026-09-15)

Not verified in a browser (the Playwright harness is a Phase 7 stub); these come from reading the
client and from what the server/engine let through. Please confirm visually.

1. **Blank answers render as empty bubbles.** A whitespace-only answer passes the schema and is stored
   as `""` (SPEC-001). Until the rule is decided, `Reveal` / the TV answer list should show something
   for an empty string ("…" or a muted "no answer") so the layout does not show an empty card.
2. **Family/ZWJ emoji in names are split.** `normalizeName` strips U+200D (needed against invisible
   spoofing), so `👨‍👩‍👧‍👦` becomes four separate emoji on chips. Either accept (and say so in the join
   form hint) or allow ZWJ only between emoji code points.
3. **Look-alike names exist** (SPEC-002): `éva` (NFC) and `éva` (NFD), `Ana` and `Аna` (Cyrillic) can
   both be in the lobby. If the engine keeps allowing it, chips need a second differentiator
   (avatar is already there; consider showing the avatar name on hover/long-press).
4. **RTL override and bidi characters are stripped from names but NOT from answers.** An answer
   containing U+202E renders reversed on the TV (`Reveal` shows raw text). Harmless but confusing;
   a CSS `unicode-bidi: isolate` on answer text prevents it from bleeding into neighbours.
5. **Long answers:** 24 characters of `W`/CJK/emoji at TV scale — check `Reveal` wraps rather than
   overflows the card (schema max is by UTF-16 units, so 24 emoji ≈ 48 units? no — `max(24)` counts
   code units, so 12 astral emoji fill it; still wide).
6. **Toast spam:** every join/leave/kick/VIP change is a toast to `all`. The room-chaos runs produce
   dozens per minute under churn; check the toast stack caps and coalesces ("3 players left").
7. **VIP-less window:** after F-002's fix a resuming player gets "X is now the VIP" — make sure the
   controller shows the VIP controls immediately on that toast (it arrives before the `room` push).
